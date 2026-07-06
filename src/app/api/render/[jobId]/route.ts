import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRenderJobProgress } from "@/lib/queue";
import { handleApiError, jsonResponse } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ jobId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { jobId } = await context.params;

    const renderJob = await db.renderJob.findFirst({
      where: {
        id: jobId,
        video: { userId: user.id },
      },
      include: {
        video: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    if (!renderJob) {
      return jsonResponse({ error: "Render job not found" }, 404);
    }

    const liveProgress = await getRenderJobProgress(jobId);

    return jsonResponse({
      id: renderJob.id,
      videoId: renderJob.videoId,
      status: liveProgress?.status ?? renderJob.status,
      progress: liveProgress?.progress ?? renderJob.progress,
      type: renderJob.type,
      outputUrl: liveProgress?.outputUrl ?? renderJob.outputUrl,
      error: liveProgress?.error ?? renderJob.error,
      startedAt: renderJob.startedAt,
      completedAt: renderJob.completedAt,
      video: renderJob.video,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
