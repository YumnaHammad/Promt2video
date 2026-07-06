import { requireAuth } from "@/lib/auth";
import { cancelVideo } from "@/lib/cancel-video";
import { handleApiError, jsonResponse } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;
    const result = await cancelVideo(id, user.id);
    return jsonResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
