import { after } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createVideoRecord } from "@/lib/video-records";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  errorResponse,
  handleApiError,
  jsonResponse,
} from "@/lib/api-utils";

const createVideoSchema = z.object({
  prompt: z.string().min(10).max(5000),
  projectId: z.string().optional(),
  templateId: z.string().optional(),
  brandKitId: z.string().optional(),
  useOwnKeys: z.boolean().optional(),
  duration: z.number().min(15).max(600).optional(),
  style: z.string().max(100).optional(),
});

export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`videos:list:${user.id}`);
    if (!success) {
      return errorResponse("Rate limit exceeded", 429);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const [videos, total] = await Promise.all([
      db.video.findMany({
        where: {
          userId: user.id,
          ...(status ? { status: status as never } : {}),
          ...(projectId ? { projectId } : {}),
        },
        orderBy: { updatedAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          description: true,
          prompt: true,
          status: true,
          duration: true,
          thumbnailUrl: true,
          outputUrl: true,
          aspectRatio: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { scenes: true } },
        },
      }),
      db.video.count({
        where: {
          userId: user.id,
          ...(status ? { status: status as never } : {}),
          ...(projectId ? { projectId } : {}),
        },
      }),
    ]);

    return jsonResponse({ videos, total, limit, offset });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`videos:create:${user.id}`, 10, 60000);
    if (!success) {
      return errorResponse("Rate limit exceeded", 429);
    }

    const body = await request.json();
    const parsed = createVideoSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const video = await createVideoRecord({
      ...parsed.data,
      userId: user.id,
    });

    const { runVideoPipeline } = await import("@/lib/pipeline");
    const pipelineOptions = {
      ...parsed.data,
      userId: user.id,
      videoId: video.id,
    };

    after(() => {
      runVideoPipeline(pipelineOptions).catch((error) => {
        console.error(`Video pipeline failed for ${video.id}:`, error);
      });
    });

    return jsonResponse({ video, videoId: video.id }, 202);
  } catch (error) {
    return handleApiError(error);
  }
}
