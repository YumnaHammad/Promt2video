import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTTS } from "@/lib/ai/tts";
import { buildRemotionData, mapBrandKit } from "@/lib/remotion/builder";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  errorResponse,
  handleApiError,
  jsonResponse,
  mapSceneToData,
} from "@/lib/api-utils";
import { DEFAULT_FREE_VOICE } from "@/lib/voices";
import type { SceneData } from "@/types/video";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(
      `voice:regenerate-all:${user.id}`,
      5,
      60000
    );
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const { id: videoId } = await context.params;

    const video = await db.video.findFirst({
      where: { id: videoId, userId: user.id },
      include: {
        brandKit: true,
        scenes: {
          include: { voice: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!video) return errorResponse("Video not found", 404);

    for (const scene of video.scenes) {
      const narration = scene.narration?.trim();
      if (!narration) continue;

      const requestedVoice = scene.voice?.voiceId ?? DEFAULT_FREE_VOICE;
      const tts = await generateTTS(narration, requestedVoice);
      const voiceId = tts.voiceId;

      await db.scene.update({
        where: { id: scene.id },
        data: { duration: tts.duration },
      });

      if (scene.voice) {
        await db.voice.update({
          where: { sceneId: scene.id },
          data: {
            provider: "edge-tts",
            voiceId,
            audioUrl: tts.audioUrl,
            duration: tts.duration,
            transcript: narration,
            subtitles: tts.subtitles as object,
          },
        });
      } else {
        await db.voice.create({
          data: {
            sceneId: scene.id,
            provider: "edge-tts",
            voiceId,
            audioUrl: tts.audioUrl,
            duration: tts.duration,
            transcript: narration,
            subtitles: tts.subtitles as object,
          },
        });
      }
    }

    const updatedScenes = await db.scene.findMany({
      where: { videoId },
      include: {
        assets: { include: { asset: true } },
        voice: true,
      },
      orderBy: { order: "asc" },
    });

    const sceneData: SceneData[] = updatedScenes.map(mapSceneToData);
    const remotionData = buildRemotionData(
      sceneData,
      mapBrandKit(video.brandKit ?? null)
    );
    const totalDuration = sceneData.reduce((sum, s) => sum + s.duration, 0);

    await db.video.update({
      where: { id: videoId },
      data: {
        duration: totalDuration,
        remotionData: remotionData as object,
        subtitleData: sceneData.flatMap((s) => s.subtitles ?? []) as object,
      },
    });

    return jsonResponse({ scenes: sceneData });
  } catch (error) {
    return handleApiError(error);
  }
}
