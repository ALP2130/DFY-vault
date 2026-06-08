import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase";
import type Stripe from "stripe";

// ── Disable body parsing — Stripe needs raw body for signature verification ───
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  // ── Handle events ─────────────────────────────────────────────────────────
  switch (event.type) {

    // User completed checkout → activate subscription
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (!userId || !plan) break;

      await admin.rpc("set_plan_limits", { user_id: userId, new_plan: plan });
      await admin
        .from("profiles")
        .update({
          stripe_subscription_id: session.subscription as string,
          subscription_status: "active",
          plan,
        })
        .eq("id", userId);

      console.log(`[webhook] ✅ Checkout complete: user ${userId} → ${plan}`);
      break;
    }

    // Subscription renewed or updated
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const plan = sub.metadata?.plan;
      const status = sub.status; // 'active' | 'past_due' | 'canceled' | etc.

      if (!userId) break;

      const updates: Record<string, unknown> = { subscription_status: status };

      // If plan changed (e.g. upgrade/downgrade)
      if (plan) {
        updates.plan = plan;
        await admin.rpc("set_plan_limits", { user_id: userId, new_plan: plan });
      }

      // Reset monthly generations on renewal
      if (status === "active") {
        updates.generations_used = 0;
      }

      await admin.from("profiles").update(updates).eq("id", userId);
      console.log(`[webhook] ♻️  Subscription updated: user ${userId} → ${status}`);
      break;
    }

    // Subscription cancelled → downgrade to free
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;

      if (!userId) break;

      await admin
        .from("profiles")
        .update({
          plan: "free",
          subscription_status: "canceled",
          stripe_subscription_id: null,
          generations_limit: 5,
        })
        .eq("id", userId);

      console.log(`[webhook] ❌ Subscription canceled: user ${userId}`);
      break;
    }

    // Payment failed → mark past_due
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        await admin
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("id", profile.id);
        console.log(`[webhook] ⚠️  Payment failed: user ${profile.id}`);
      }
      break;
    }

    default:
      console.log(`[webhook] unhandled event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
