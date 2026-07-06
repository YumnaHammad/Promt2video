import { NextResponse } from "next/server";
import type { SceneData } from "@/types/video";

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }
    if (error.message === "Forbidden") {
      return errorResponse("Forbidden", 403);
    }
    if (error.message === "Nothing to cancel") {
      return errorResponse("Nothing to cancel", 400);
    }
    if (error.message === "Video not found") {
      return errorResponse("Video not found", 404);
    }
    if (error.message === "Scene not found") {
      return errorResponse("Scene not found", 404);
    }
    if (error.message === "Not found") {
      return errorResponse("Not found", 404);
    }
  }
  console.error("API error:", error);

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (error.code === "ECONNREFUSED" || error.code === "P1001")
  ) {
    return errorResponse(
      "Database not connected. Run: npm run db:push && npm run db:seed",
      503
    );
  }

  return errorResponse("Internal server error", 500);
}

type SceneWithRelations = {
  id: string;
  order: number;
  title: string | null;
  narration: string | null;
  visualPrompt: string | null;
  duration: number;
  speed: number;
  volume: number;
  transition: string;
  captionStyle: unknown;
  assets: {
    role: string;
    startTime: number;
    endTime: number | null;
    opacity: number;
    scale: number;
    asset: {
      id: string;
      url: string;
      type: string;
    };
  }[];
  voice: {
    audioUrl: string | null;
    voiceId: string | null;
    subtitles: unknown;
  } | null;
};

export function mapSceneToData(scene: SceneWithRelations): SceneData {
  return {
    id: scene.id,
    order: scene.order,
    title: scene.title ?? undefined,
    narration: scene.narration ?? undefined,
    visualPrompt: scene.visualPrompt ?? undefined,
    duration: scene.duration,
    speed: scene.speed,
    volume: scene.volume,
    transition: scene.transition,
    captionStyle: (scene.captionStyle as unknown as SceneData["captionStyle"]) ?? undefined,
    assets: scene.assets.map((sa) => ({
      id: sa.asset.id,
      url: sa.asset.url,
      type: sa.asset.type as "IMAGE" | "VIDEO" | "AUDIO",
      role: sa.role,
      startTime: sa.startTime,
      endTime: sa.endTime ?? undefined,
      opacity: sa.opacity,
      scale: sa.scale,
    })),
    audioUrl: scene.voice?.audioUrl ?? undefined,
    voiceId: scene.voice?.voiceId ?? undefined,
    subtitles: (scene.voice?.subtitles as SceneData["subtitles"]) ?? undefined,
  };
}
