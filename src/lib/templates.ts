import { db } from "@/lib/db";
import type { TemplatePreview } from "@/types/video";

export type TemplateListItem = TemplatePreview & {
  tags: string[];
  aspectRatio: string;
  downloads: number;
  isFavorite?: boolean;
  isOwned?: boolean;
  canUse?: boolean;
};

export function parseTemplateTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags.filter((tag): tag is string => typeof tag === "string");
  }
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed)
        ? parsed.filter((tag): tag is string => typeof tag === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function hasPremiumTemplateAccess(plan: string | null | undefined): boolean {
  return plan === "PRO" || plan === "ENTERPRISE";
}

export function canUseTemplate(
  template: { id: string; isPremium: boolean },
  ownedTemplateIds: Set<string>,
  plan: string | null | undefined
): boolean {
  if (!template.isPremium) return true;
  if (hasPremiumTemplateAccess(plan)) return true;
  return ownedTemplateIds.has(template.id);
}

export async function getPublishedTemplates(options?: {
  category?: string;
  search?: string;
  premium?: boolean;
  limit?: number;
  offset?: number;
}) {
  const { category, search, premium, limit = 24, offset = 0 } = options ?? {};

  const where = {
    isPublished: true,
    ...(category ? { category } : {}),
    ...(premium === true ? { isPremium: true } : {}),
    ...(premium === false ? { isPremium: false } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
            { category: { contains: search } },
          ],
        }
      : {}),
  };

  const [templates, total] = await Promise.all([
    db.template.findMany({
      where,
      orderBy: [{ downloads: "desc" }, { rating: "desc" }],
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        tags: true,
        thumbnailUrl: true,
        previewUrl: true,
        isPremium: true,
        price: true,
        sceneCount: true,
        duration: true,
        aspectRatio: true,
        rating: true,
        downloads: true,
      },
    }),
    db.template.count({ where }),
  ]);

  return { templates, total };
}

export function mapTemplateRecord(
  template: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    tags: unknown;
    thumbnailUrl: string;
    isPremium: boolean;
    price: number;
    sceneCount: number;
    duration: number;
    aspectRatio: string;
    rating: number;
    downloads: number;
  },
  extras?: Partial<Pick<TemplateListItem, "isFavorite" | "isOwned" | "canUse">>
): TemplateListItem {
  return {
    id: template.id,
    name: template.name,
    slug: template.slug,
    description: template.description,
    category: template.category,
    thumbnailUrl: template.thumbnailUrl,
    isPremium: template.isPremium,
    price: template.price,
    sceneCount: template.sceneCount,
    duration: template.duration,
    rating: template.rating,
    tags: parseTemplateTags(template.tags),
    aspectRatio: template.aspectRatio,
    downloads: template.downloads,
    ...extras,
  };
}

export async function getUserOwnedTemplateIds(userId: string): Promise<Set<string>> {
  const purchases = await db.purchase.findMany({
    where: {
      userId,
      status: "COMPLETED",
      templateId: { not: null },
    },
    select: { templateId: true },
  });

  return new Set(
    purchases
      .map((purchase) => purchase.templateId)
      .filter((id): id is string => Boolean(id))
  );
}
