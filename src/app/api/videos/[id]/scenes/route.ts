import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildRemotionData } from "@/lib/remotion/builder";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  errorResponse,
  handleApiError,
  jsonResponse,
  mapSceneToData,
} from "@/lib/api-utils";

const createSceneSchema = z.object({
  title: z.string().max(200).optional(),
  narration: z.string().max(5000).optional(),
  visualPrompt: z.string().max(2000).optional(),
  duration: z.number().min(1).max(120).default(5),
  speed: z.number().min(0.25).max(4).default(1),
  volume: z.number().min(0).max(2).default(1),
  transition: z.string().default("fade"),
  order: z.number().int().min(0).optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedVideo(id: string, userId: string) {
  const video = await db.video.findFirst({ where: { id, userId } });
  if (!video) throw new Error("Video not found");
  return video;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    await getOwnedVideo(id, user.id);

    const scenes = await db.scene.findMany({
      where: { videoId: id },
      include: {
        assets: { include: { asset: true } },
        voice: true,
      },
      orderBy: { order: "asc" },
    });

    return jsonResponse({ scenes: scenes.map(mapSceneToData) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`scenes:create:${user.id}`);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const { id } = await context.params;
    await getOwnedVideo(id, user.id);

    const body = await request.json();
    const parsed = createSceneSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const sceneCount = await db.scene.count({ where: { videoId: id } });
    const order = parsed.data.order ?? sceneCount;

    const scene = await db.scene.create({
      data: {
        videoId: id,
        order,
        title: parsed.data.title,
        narration: parsed.data.narration,
        visualPrompt: parsed.data.visualPrompt,
        duration: parsed.data.duration,
        speed: parsed.data.speed,
        volume: parsed.data.volume,
        transition: parsed.data.transition,
      },
      include: {
        assets: { include: { asset: true } },
        voice: true,
      },
    });

    const allScenes = await db.scene.findMany({
      where: { videoId: id },
      include: {
        assets: { include: { asset: true } },
        voice: true,
      },
      orderBy: { order: "asc" },
    });

    const sceneData = allScenes.map(mapSceneToData);
    const remotionData = buildRemotionData(sceneData);
    const totalDuration = sceneData.reduce((sum: number, s: { duration: number }) => sum + s.duration, 0);

    await db.video.update({
      where: { id },
      data: {
        duration: totalDuration,
        remotionData: remotionData as object,
        status: "EDITING",
      },
    });

    return jsonResponse({ scene: mapSceneToData(scene) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
