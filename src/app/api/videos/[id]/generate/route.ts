import { after } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isDemoMode } from "@/lib/demo-mode";
import { readGenerationMeta } from "@/lib/generation-progress";
import {
  errorResponse,
  handleApiError,
  jsonResponse,
} from "@/lib/api-utils";

export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

async function startPipeline(videoId: string, userId: string) {
  const video = await db.video.findFirst({
    where: { id: videoId, userId },
    select: {
      id: true,
      prompt: true,
      status: true,
      scriptData: true,
      _count: { select: { scenes: true } },
    },
  });

  if (!video) throw new Error("Video not found");
  if (video.status !== "GENERATING") {
    return { started: false, reason: "not_generating" as const, video };
  }

  const meta = readGenerationMeta(video.scriptData);
  if (video._count.scenes > 0 || (meta?.progress ?? 0) > 25) {
    return { started: false, reason: "already_running" as const, video };
  }

  const storedOptions =
    video.scriptData &&
    typeof video.scriptData === "object" &&
    "_options" in video.scriptData
      ? ((video.scriptData as Record<string, unknown>)._options as {
          duration?: number;
          style?: string;
        })
      : {};

  const { runVideoPipeline } = await import("@/lib/pipeline");
  const options = {
    videoId: video.id,
    prompt: video.prompt ?? "",
    userId,
    duration: storedOptions.duration,
    style: storedOptions.style,
  };

  if (isDemoMode()) {
    await runVideoPipeline(options);
    const updated = await db.video.findUnique({ where: { id: videoId } });
    return { started: true, reason: "completed" as const, video: updated };
  }

  after(async () => {
    try {
      await runVideoPipeline(options);
    } catch (error) {
      console.error(`Video pipeline failed for ${videoId}:`, error);
    }
  });

  return { started: true, reason: "background" as const, video };
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const result = await startPipeline(id, user.id);

    if (!result.started && result.reason === "not_generating") {
      return jsonResponse({ message: "Video is not generating", video: result.video });
    }

    if (!result.started) {
      return jsonResponse({ message: "Pipeline already running", video: result.video });
    }

    return jsonResponse(
      {
        message:
          result.reason === "completed"
            ? "Generation complete"
            : "Generation started",
        video: result.video,
      },
      result.reason === "completed" ? 200 : 202
    );
  } catch (error) {
    return handleApiError(error);
  }
}
