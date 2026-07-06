import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createTemplatePurchase } from "@/lib/stripe";
import { isDemoMode } from "@/lib/demo-mode";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  canUseTemplate,
  getUserOwnedTemplateIds,
  hasPremiumTemplateAccess,
} from "@/lib/templates";
import { errorResponse, handleApiError, jsonResponse } from "@/lib/api-utils";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`templates:checkout:${user.id}`, 10, 60000);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const { id: templateId } = await context.params;

    const [template, ownedTemplateIds, subscription] = await Promise.all([
      db.template.findFirst({
        where: { id: templateId, isPublished: true },
      }),
      getUserOwnedTemplateIds(user.id),
      db.subscription.findUnique({
        where: { userId: user.id },
        select: { plan: true },
      }),
    ]);

    if (!template) return errorResponse("Template not found", 404);
    if (!template.isPremium) {
      return errorResponse("This template is free — use it directly", 400);
    }

    const plan = subscription?.plan ?? "FREE";
    if (canUseTemplate(template, ownedTemplateIds, plan)) {
      return errorResponse("You already have access to this template", 400);
    }

    if (isDemoMode()) {
      await db.purchase.create({
        data: {
          userId: user.id,
          templateId: template.id,
          amount: template.price,
          currency: "usd",
          status: "COMPLETED",
          stripePaymentId: `demo_${template.id}_${Date.now()}`,
        },
      });

      await db.template.update({
        where: { id: template.id },
        data: { downloads: { increment: 1 } },
      });

      return jsonResponse({
        demo: true,
        message: `Demo: unlocked "${template.name}"`,
      });
    }

    if (hasPremiumTemplateAccess(plan)) {
      return errorResponse("Your plan already includes premium templates", 400);
    }

    if (!template.stripePriceId) {
      return errorResponse("This template is not available for purchase yet", 400);
    }

    const session = await createTemplatePurchase(
      user.id,
      user.email,
      template.id,
      template.stripePriceId
    );

    return jsonResponse({ url: session.url, sessionId: session.id });
  } catch (error) {
    return handleApiError(error);
  }
}
