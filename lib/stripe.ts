import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

// ── Plan config (mirrors your pricing page) ───────────────────────────────────
export const PLANS = {
  starter: {
    name: "Starter",
    price: 297,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    limit: 30,
    features: [
      "30 AI generations/month",
      "Social posts, blogs, emails",
      "Brand voice setup",
      "Copy & export content",
      "Email support",
    ],
  },
  growth: {
    name: "Growth",
    price: 597,
    priceId: process.env.STRIPE_PRICE_GROWTH!,
    limit: 100,
    features: [
      "100 AI generations/month",
      "All Starter features",
      "Ad copy generator",
      "Priority support",
      "Content history",
    ],
  },
  agency: {
    name: "Agency",
    price: 997,
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    limit: -1, // unlimited
    features: [
      "Unlimited AI generations",
      "All Growth features",
      "White-label option",
      "Slack direct access",
      "Monthly strategy call",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// ── Create a Stripe checkout session ─────────────────────────────────────────
export async function createCheckoutSession({
  priceId,
  customerId,
  userId,
  plan,
  appUrl,
}: {
  priceId: string;
  customerId?: string | null;
  userId: string;
  plan: string;
  appUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    ...(customerId ? { customer: customerId } : {}),
    metadata: { userId, plan },
    success_url: `${appUrl}/dashboard?upgraded=1`,
    cancel_url: `${appUrl}/dashboard?canceled=1`,
    subscription_data: {
      metadata: { userId, plan },
    },
    allow_promotion_codes: true,
  });

  return session;
}

// ── Create or retrieve a Stripe customer ─────────────────────────────────────
export async function getOrCreateCustomer(email: string, userId: string) {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0];

  return stripe.customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });
}

// ── Create a billing portal session ──────────────────────────────────────────
export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}
