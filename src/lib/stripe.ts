import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(key, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }
  return stripeClient;
}

export { PLANS } from "./plans";

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  customerId?: string | null
) {
  const stripe = getStripe();
  let customer = customerId;

  if (!customer) {
    const newCustomer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    customer = newCustomer.id;
  }

  const session = await stripe.checkout.sessions.create({
    customer,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    metadata: { userId },
  });

  return session;
}

export async function createTemplatePurchase(
  userId: string,
  email: string,
  templateId: string,
  priceId: string
) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/templates?purchased=${templateId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/store`,
    metadata: { userId, templateId, type: "template_purchase" },
  });

  return session;
}
