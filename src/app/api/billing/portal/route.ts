import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { checkRateLimit } from "@/lib/rate-limit";
import { errorResponse, handleApiError, jsonResponse } from "@/lib/api-utils";

export async function POST() {
  try {
    const user = await requireAuth();
    const { success } = await checkRateLimit(`billing:portal:${user.id}`, 5, 60000);
    if (!success) return errorResponse("Rate limit exceeded", 429);

    const subscription = await db.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return errorResponse("No billing account found. Please subscribe first.", 400);
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    return handleApiError(error);
  }
}
