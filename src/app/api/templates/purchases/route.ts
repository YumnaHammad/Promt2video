import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, handleApiError, jsonResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`templates:purchases:${user.id}`);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const purchases = await db.purchase.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
        templateId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            category: true,
            thumbnailUrl: true,
            isPremium: true,
            price: true,
            sceneCount: true,
            duration: true,
            rating: true,
          },
        },
      },
    });

    return jsonResponse({
      purchases: purchases
        .filter((purchase) => purchase.template)
        .map((purchase) => ({
          id: purchase.id,
          amount: purchase.amount,
          createdAt: purchase.createdAt,
          template: purchase.template,
        })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
