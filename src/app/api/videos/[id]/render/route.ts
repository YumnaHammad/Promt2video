import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { startRender } from "@/lib/pipeline";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, handleApiError, jsonResponse } from "@/lib/api-utils";

const renderSchema = z.object({
  type: z.enum(["preview", "final", "thumbnail"]).default("final"),
  platformId: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`render:${user.id}`, 5, 60000);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const parsed = renderSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const renderJob = await startRender(id, user.id, parsed.data.type, {
      platformId: parsed.data.platformId,
    });

    return jsonResponse(
      {
        jobId: renderJob.id,
        status: renderJob.status,
        type: renderJob.type,
        progress: renderJob.progress,
      },
      202
    );
  } catch (error) {
    return handleApiError(error);
  }
}
