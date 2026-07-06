import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, handleApiError, jsonResponse } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`templates:favorite:${user.id}`, 60, 60000);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const { id: templateId } = await context.params;

    const template = await db.template.findFirst({
      where: { id: templateId, isPublished: true },
      select: { id: true },
    });

    if (!template) return errorResponse("Template not found", 404);

    const existing = await db.templateFavorite.findUnique({
      where: {
        userId_templateId: {
          userId: user.id,
          templateId,
        },
      },
    });

    if (existing) {
      await db.templateFavorite.delete({ where: { id: existing.id } });
      return jsonResponse({ isFavorite: false });
    }

    await db.templateFavorite.create({
      data: {
        userId: user.id,
        templateId,
      },
    });

    return jsonResponse({ isFavorite: true });
  } catch (error) {
    return handleApiError(error);
  }
}
