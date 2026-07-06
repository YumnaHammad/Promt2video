import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildRemotionData, mapBrandKit } from "@/lib/remotion/builder";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  errorResponse,
  handleApiError,
  jsonResponse,
  mapSceneToData,
} from "@/lib/api-utils";
import {
  readGenerationMeta,
  inferGenerationProgress,
} from "@/lib/generation-progress";
import type { SceneData } from "@/types/video";

const updateVideoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z
    .enum([
      "DRAFT",
      "GENERATING",
      "EDITING",
      "RENDERING",
      "COMPLETED",
      "FAILED",
      "ARCHIVED",
    ])
    .optional(),
  fps: z.number().int().min(24).max(60).optional(),
  width: z.number().int().min(480).max(3840).optional(),
  height: z.number().int().min(480).max(2160).optional(),
  aspectRatio: z.string().optional(),
  scenes: z
    .array(
      z.object({
        id: z.string(),
        order: z.number().int().min(0),
        title: z.string().optional(),
        narration: z.string().optional(),
        visualPrompt: z.string().optional(),
        duration: z.number().min(0.5).max(120),
        speed: z.number().min(0.25).max(4).optional(),
        volume: z.number().min(0).max(2).optional(),
        transition: z.string().optional(),
        captionStyle: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedVideo(id: string, userId: string) {
  const video = await db.video.findFirst({
    where: { id, userId },
    include: {
      scenes: {
        include: {
          assets: { include: { asset: true } },
          voice: true,
        },
        orderBy: { order: "asc" },
      },
      brandKit: true,
      renderJobs: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });
  if (!video) throw new Error("Video not found");
  return video;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const video = await getOwnedVideo(id, user.id);

    const generation = inferGenerationProgress(
      video.status,
      video.scenes.length,
      readGenerationMeta(video.scriptData)
    );

    return jsonResponse({
      ...video,
      scenes: video.scenes.map(mapSceneToData),
      generationProgress: generation.progress,
      generationStep: generation.step,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`videos:update:${user.id}`);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateVideoSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    await getOwnedVideo(id, user.id);
    const { scenes, ...videoUpdates } = parsed.data;

    if (scenes) {
      for (const scene of scenes) {
        await db.scene.updateMany({
          where: { id: scene.id, videoId: id },
          data: {
            order: scene.order,
            title: scene.title,
            narration: scene.narration,
            visualPrompt: scene.visualPrompt,
            duration: scene.duration,
            speed: scene.speed ?? 1,
            volume: scene.volume ?? 1,
            transition: scene.transition ?? "fade",
            captionStyle: scene.captionStyle as object,
          },
        });
      }

      const updatedScenes = await db.scene.findMany({
        where: { videoId: id },
        include: {
          assets: { include: { asset: true } },
          voice: true,
        },
        orderBy: { order: "asc" },
      });

      const sceneData: SceneData[] = updatedScenes.map(mapSceneToData);
      const brandKit = await db.brandKit.findFirst({
        where: { videos: { some: { id } } },
      });
      const currentVideo = await db.video.findUnique({ where: { id } });
      const remotionData = buildRemotionData(
        sceneData,
        mapBrandKit(brandKit),
        {
          width: videoUpdates.width ?? currentVideo?.width,
          height: videoUpdates.height ?? currentVideo?.height,
        }
      );
      const totalDuration = sceneData.reduce((sum, s) => sum + s.duration, 0);

      const video = await db.video.update({
        where: { id },
        data: {
          ...videoUpdates,
          duration: totalDuration,
          remotionData: remotionData as object,
        },
        include: {
          scenes: {
            include: {
              assets: { include: { asset: true } },
              voice: true,
            },
            orderBy: { order: "asc" },
          },
        },
      });

      return jsonResponse({
        ...video,
        scenes: video.scenes.map(mapSceneToData),
      });
    }

    const video = await db.video.update({
      where: { id },
      data: videoUpdates,
      include: {
        scenes: {
          include: {
            assets: { include: { asset: true } },
            voice: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return jsonResponse({
      ...video,
      scenes: video.scenes.map(mapSceneToData),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await getOwnedVideo(id, user.id);

    await db.video.delete({ where: { id } });

    return jsonResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
