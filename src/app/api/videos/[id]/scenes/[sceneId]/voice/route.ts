import { z } from "zod";
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

const voiceSchema = z.object({
  voiceId: z.string().optional(),
  narration: z.string().max(5000).optional(),
});

type RouteContext = {
  params: Promise<{ id: string; sceneId: string }>;
};

async function getOwnedScene(videoId: string, sceneId: string, userId: string) {
  const scene = await db.scene.findFirst({
    where: { id: sceneId, videoId, video: { userId } },
    include: { voice: true },
  });
  if (!scene) throw new Error("Scene not found");
  return scene;
}

async function rebuildVideoComposition(videoId: string) {
  const video = await db.video.findUnique({
    where: { id: videoId },
    include: {
      scenes: {
        include: {
          assets: { include: { asset: true } },
          voice: true,
        },
        orderBy: { order: "asc" },
      },
      brandKit: true,
    },
  });
  if (!video) return;

  const sceneData: SceneData[] = video.scenes.map(mapSceneToData);
  const remotionData = buildRemotionData(sceneData, mapBrandKit(video.brandKit));
  const totalDuration = sceneData.reduce((sum, s) => sum + s.duration, 0);

  await db.video.update({
    where: { id: videoId },
    data: {
      duration: totalDuration,
      remotionData: remotionData as object,
      subtitleData: sceneData.flatMap((s) => s.subtitles ?? []) as object,
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`voice:generate:${user.id}`, 30, 60000);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const { id: videoId, sceneId } = await context.params;
    const scene = await getOwnedScene(videoId, sceneId, user.id);

    const body = await request.json();
    const parsed = voiceSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const narration = (parsed.data.narration ?? scene.narration ?? "").trim();
    if (!narration) {
      return errorResponse("Add narration text before generating voice", 400);
    }

    const requestedVoice =
      parsed.data.voiceId ?? scene.voice?.voiceId ?? DEFAULT_FREE_VOICE;
    const tts = await generateTTS(narration, requestedVoice);
    const voiceId = tts.voiceId;

    if (scene.narration !== narration) {
      await db.scene.update({
        where: { id: sceneId },
        data: { narration },
      });
    }

    await db.scene.update({
      where: { id: sceneId },
      data: { duration: tts.duration },
    });

    if (scene.voice) {
      await db.voice.update({
        where: { sceneId },
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
          sceneId,
          provider: "edge-tts",
          voiceId,
          audioUrl: tts.audioUrl,
          duration: tts.duration,
          transcript: narration,
          subtitles: tts.subtitles as object,
        },
      });
    }

    await rebuildVideoComposition(videoId);

    const updated = await db.scene.findUnique({
      where: { id: sceneId },
      include: {
        assets: { include: { asset: true } },
        voice: true,
      },
    });

    return jsonResponse({ scene: mapSceneToData(updated!) });
  } catch (error) {
    return handleApiError(error);
  }
}
