import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
type SubscriptionPlan = "FREE" | "STARTER" | "PRO" | "ENTERPRISE";
type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELED"
  | "PAST_DUE"
  | "TRIALING"
  | "INCOMPLETE";

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELED";
    case "past_due":
      return "PAST_DUE";
    case "trialing":
      return "TRIALING";
    default:
      return "INCOMPLETE";
  }
}

function mapStripePlan(priceId: string | undefined): SubscriptionPlan {
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "ENTERPRISE";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "PRO";
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "STARTER";
  return "FREE";
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const sub = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!sub) return;

  const priceId = subscription.items.data[0]?.price.id;

  await db.subscription.update({
    where: { id: sub.id },
    data: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      plan: mapStripePlan(priceId),
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: new Date(
        (subscription as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        }).current_period_start * 1000
      ),
      currentPeriodEnd: new Date(
        (subscription as Stripe.Subscription & {
          current_period_start: number;
          current_period_end: number;
        }).current_period_end * 1000
      ),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const headerPayload = await headers();
  const signature = headerPayload.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const templateId = session.metadata?.templateId;

        if (session.metadata?.type === "template_purchase" && userId && templateId) {
          await db.purchase.create({
            data: {
              userId,
              templateId,
              stripePaymentId: session.payment_intent as string,
              amount: (session.amount_total ?? 0) / 100,
              currency: session.currency ?? "usd",
              status: "COMPLETED",
            },
          });
        } else if (userId && session.customer) {
          const customerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer.id;

          await db.subscription.update({
            where: { userId },
            data: { stripeCustomerId: customerId },
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;

        await db.subscription.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            plan: "FREE",
            status: "CANCELED",
            stripeSubscriptionId: null,
            stripePriceId: null,
            cancelAtPeriodEnd: false,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          await db.subscription.updateMany({
            where: { stripeCustomerId: customerId },
            data: { status: "PAST_DUE" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
