import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, handleApiError, jsonResponse } from "@/lib/api-utils";
import {
  canUseTemplate,
  getPublishedTemplates,
  getUserOwnedTemplateIds,
  mapTemplateRecord,
} from "@/lib/templates";

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`templates:list:${user.id}`);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const premiumParam = searchParams.get("premium");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "24", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const premium =
      premiumParam === "true" ? true : premiumParam === "false" ? false : undefined;

    const [{ templates, total }, favorites, ownedTemplateIds, subscription] =
      await Promise.all([
        getPublishedTemplates({ category: category ?? undefined, search: search ?? undefined, premium, limit, offset }),
        db.templateFavorite.findMany({
          where: { userId: user.id },
          select: { templateId: true },
        }),
        getUserOwnedTemplateIds(user.id),
        db.subscription.findUnique({
          where: { userId: user.id },
          select: { plan: true },
        }),
      ]);

    const favoriteIds = new Set(favorites.map((favorite) => favorite.templateId));
    const plan = subscription?.plan ?? "FREE";

    const items = templates.map((template) =>
      mapTemplateRecord(template, {
        isFavorite: favoriteIds.has(template.id),
        isOwned: ownedTemplateIds.has(template.id),
        canUse: canUseTemplate(template, ownedTemplateIds, plan),
      })
    );

    const categories = await db.template.groupBy({
      by: ["category"],
      where: { isPublished: true },
      _count: { category: true },
    });

    return jsonResponse({
      templates: items,
      total,
      limit,
      offset,
      categories: categories.map((item) => ({
        name: item.category,
        count: item._count.category,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
