import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCheckoutSession, PLANS } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";
import { isDemoMode } from "@/lib/demo-mode";
import { errorResponse, handleApiError, jsonResponse } from "@/lib/api-utils";

const checkoutSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`billing:checkout:${user.id}`, 5, 60000);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    }

    const planConfig = PLANS[parsed.data.plan];

    if (isDemoMode()) {
      await db.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          plan: parsed.data.plan,
          status: "ACTIVE",
        },
        update: {
          plan: parsed.data.plan,
          status: "ACTIVE",
        },
      });

      return jsonResponse({
        demo: true,
        message: `Demo: switched to ${planConfig.name} plan`,
        url: "/billing?demo_upgraded=true",
      });
    }

    const priceId = planConfig.stripePriceId;

    if (!priceId) {
      return errorResponse("Plan not available", 400);
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: user.id },
    });

    const session = await createCheckoutSession(
      user.id,
      user.email,
      priceId,
      subscription?.stripeCustomerId
    );

    if (!subscription?.stripeCustomerId && session.customer) {
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer.id;

      await db.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
        },
        update: {
          stripeCustomerId: customerId,
        },
      });
    }

    return jsonResponse({ url: session.url, sessionId: session.id });
  } catch (error) {
    return handleApiError(error);
  }
}
