import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAdminClient } from "@/lib/supabase";
import { createCheckoutSession, getOrCreateCustomer, PLANS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    // Auth check
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    const admin = createAdminClient();

    // Get or create Stripe customer
    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await getOrCreateCustomer(user.email!, user.id);
      customerId = customer.id;

      // Save customer ID to profile
      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const session = await createCheckoutSession({
      priceId: planConfig.priceId,
      customerId,
      userId: user.id,
      plan,
      appUrl: process.env.NEXT_PUBLIC_APP_URL!,
    });

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("[checkout] error:", err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
