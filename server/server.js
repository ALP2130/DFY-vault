// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DFY VAULT — Stripe Backend Server
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// SETUP:
//   1. npm init -y
//   2. npm install express stripe cors dotenv
//   3. Create a .env file with your Stripe secret key (see below)
//   4. node server.js
//
// ENV FILE (.env):
//   STRIPE_SECRET_KEY=sk_test_your_key_here
//   FRONTEND_URL=http://localhost:5173
//   PORT=3001
//
// DEPLOY OPTIONS:
//   - Railway.app (easiest, free tier)
//   - Render.com (free tier)
//   - Vercel Serverless Functions
//   - Fly.io
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// ─── Health Check ───
app.get("/", (req, res) => {
  res.json({ status: "DFY Vault API is running", timestamp: new Date().toISOString() });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 1: Create Stripe Checkout Session
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// This is the main checkout endpoint. The frontend sends cart items
// with Stripe Price IDs, and this creates a hosted checkout session.
//
// Request body:
//   {
//     line_items: [{ price: "price_xxx", quantity: 1 }],
//     success_url: "https://yoursite.com?status=success",
//     cancel_url: "https://yoursite.com?status=cancelled"
//   }
//
app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const { line_items, success_url, cancel_url } = req.body;

    if (!line_items || line_items.length === 0) {
      return res.status(400).json({ error: "No items in cart" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: line_items,
      success_url: success_url || `${FRONTEND_URL}?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${FRONTEND_URL}?status=cancelled`,

      // Optional: collect customer email
      customer_creation: "always",

      // Optional: allow promo codes
      allow_promotion_codes: true,

      // Optional: automatic tax calculation (requires Stripe Tax setup)
      // automatic_tax: { enabled: true },

      // Metadata for your records
      metadata: {
        store: "DFY Vault",
        item_count: line_items.length.toString(),
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error("Checkout session error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 2: Verify Session (optional — for order confirmation page)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get("/api/verify-session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ["line_items"],
    });

    res.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total,
      currency: session.currency,
      items: session.line_items?.data?.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        amount: item.amount_total,
      })),
    });
  } catch (error) {
    console.error("Session verification error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 3: Stripe Webhook (for fulfillment — sending download links)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// IMPORTANT: For webhooks, you need the raw body (not parsed JSON).
// Set this up BEFORE the express.json() middleware for this route,
// or use a separate route handler as shown below.
//
// To set up webhooks:
//   1. Go to Stripe Dashboard → Developers → Webhooks
//   2. Add endpoint: https://your-backend.com/api/webhook
//   3. Select event: checkout.session.completed
//   4. Copy the webhook signing secret to your .env file
//
// ENV: STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
//
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("✅ Payment successful!");
        console.log("   Customer:", session.customer_details?.email);
        console.log("   Amount:", session.amount_total / 100, session.currency?.toUpperCase());

        // ─── FULFILLMENT: Send download links here ───
        //
        // This is where you'd:
        //   1. Look up which products were purchased
        //   2. Generate download links (or use pre-signed URLs)
        //   3. Send an email with the links using SendGrid, Resend, etc.
        //
        // Example with a mail service:
        //
        //   await sendEmail({
        //     to: session.customer_details.email,
        //     subject: "Your DFY Vault Downloads Are Ready!",
        //     body: generateDownloadEmail(session.line_items),
        //   });
        //
        break;
      }

      case "checkout.session.expired": {
        console.log("⏰ Checkout session expired");
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 4: Create Products in Stripe (one-time setup helper)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Run this ONCE to create all your products in Stripe automatically.
// Then copy the returned Price IDs into your frontend PRODUCTS array.
//
// Usage: POST http://localhost:3001/api/create-products
//
app.post("/api/create-products", async (req, res) => {
  const products = [
    { name: "Ultimate Social Media Templates Pack", price: 4700 },
    { name: "Passive Income Blueprint eBook", price: 2700 },
    { name: "AI Automation Toolkit", price: 6700 },
    { name: "Digital Marketing Mastery Course", price: 3700 },
    { name: "Wellness & Self-Care Journal", price: 1900 },
    { name: "Website Builder Pro Templates", price: 5700 },
    { name: "Crypto & Finance Guide Bundle", price: 3400 },
    { name: "Smart Home Setup Guide", price: 2200 },
    { name: "Fitness Transformation Program", price: 2900 },
    { name: "Email Marketing Swipe File", price: 3900 },
    { name: "Brand Identity Design Kit", price: 4400 },
    { name: "Productivity Masterclass", price: 2400 },
  ];

  try {
    const results = [];

    for (const p of products) {
      const product = await stripe.products.create({
        name: p.name,
        metadata: { store: "DFY Vault" },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: p.price, // in cents
        currency: "usd",
      });

      results.push({
        name: p.name,
        productId: product.id,
        priceId: price.id,
        amount: `$${(p.price / 100).toFixed(2)}`,
      });

      console.log(`✅ Created: ${p.name} → ${price.id}`);
    }

    console.log("\n📋 Copy these Price IDs into your frontend PRODUCTS array:\n");
    results.forEach((r) => {
      console.log(`   ${r.name}: "${r.priceId}"`);
    });

    res.json({ success: true, products: results });
  } catch (error) {
    console.error("Product creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`\n🚀 DFY Vault API running on http://localhost:${PORT}`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
  console.log(`   Stripe: ${process.env.STRIPE_SECRET_KEY ? "✅ Key loaded" : "❌ Missing STRIPE_SECRET_KEY"}\n`);
});
