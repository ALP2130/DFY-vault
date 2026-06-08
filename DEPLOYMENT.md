# ATLASAI — Production Deployment Guide
### Zero to Live in ~60 Minutes

---

## PHASE 1: SUPABASE SETUP (~15 min)
> You don't have this yet — sign up free at supabase.com

### Step 1.1 — Create Project
1. Go to https://supabase.com → Sign Up (GitHub login works great)
2. Click **New Project**
3. Name: `atlasai`
4. Database Password: generate a strong one and **save it somewhere safe**
5. Region: pick closest to your target market (US East for North America)
6. Click **Create new project** — takes ~2 min to spin up

### Step 1.2 — Run the Database Schema
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase-schema.sql` from your project
4. **Paste the entire contents** into the SQL editor
5. Click **Run** (green button)
6. You should see: `Success. No rows returned.`
7. Go to **Table Editor** — you should see: `profiles`, `saved_content`, `generation_log`

### Step 1.3 — Enable Google OAuth (optional but recommended)
1. Go to **Authentication** → **Providers**
2. Click **Google** → Toggle **Enable**
3. Follow the Google Cloud Console link to create OAuth credentials
4. Paste Client ID + Secret back into Supabase
5. Add Authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`

### Step 1.4 — Grab Your API Keys
Go to **Project Settings** → **API** and copy:
- `Project URL` → this is your `NEXT_PUBLIC_SUPABASE_URL`
- `anon / public` key → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY` ⚠️ NEVER expose this client-side

---

## PHASE 2: STRIPE SETUP (~10 min)
> You already have a Stripe account ✅

### Step 2.1 — Create Your Products
1. Go to https://dashboard.stripe.com → **Products** → **Add Product**
2. Create 3 products:

| Product Name | Price | Billing |
|---|---|---|
| AtlasAI Starter | $297.00 | Monthly recurring |
| AtlasAI Growth | $597.00 | Monthly recurring |
| AtlasAI Agency | $997.00 | Monthly recurring |

3. After creating each, click into the Price → copy the **Price ID** (starts with `price_`)
4. Save these — they go into your env vars as `STRIPE_PRICE_STARTER`, etc.

### Step 2.2 — Get API Keys
1. **Developers** → **API Keys**
2. Copy `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Copy `Secret key` → `STRIPE_SECRET_KEY`

⚠️ Use **live keys** for production, **test keys** (sk_test_, pk_test_) for development

### Step 2.3 — Set Up Webhook (do this AFTER Vercel deploy in Phase 4)
1. **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Click **Reveal** under Signing secret → copy it → `STRIPE_WEBHOOK_SECRET`

### Step 2.4 — Enable Billing Portal
1. **Settings** → **Billing** → **Customer portal**
2. Toggle on: Allow customers to cancel, update payment method
3. Save

---

## PHASE 3: GET YOUR CODE READY (~10 min)

### Step 3.1 — Get the Code
1. Create a new folder: `atlasai`
2. Copy all the project files into it (everything from the build)
3. Copy `.env.example` → create `.env.local`
4. Fill in ALL the values in `.env.local` using the keys from Phases 1-2

### Step 3.2 — Add the Anthropic API Key
1. Go to https://console.anthropic.com
2. **API Keys** → **Create Key**
3. Copy it → paste as `ANTHROPIC_API_KEY` in `.env.local`

### Step 3.3 — Install & Test Locally
```bash
npm install
npm run dev
```
Open http://localhost:3000
- Sign up for an account
- Complete onboarding
- Test generating content
- If it works → go to Phase 4

### Step 3.4 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial AtlasAI production build"
git branch -M main
```
1. Go to https://github.com → **New repository**
2. Name: `atlasai` (make it **Private**)
3. Copy the remote URL and run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/atlasai.git
git push -u origin main
```

---

## PHASE 4: VERCEL DEPLOYMENT (~10 min)
> You already have a Vercel account ✅

### Step 4.1 — Import Project
1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Click **Import** next to your `atlasai` GitHub repo
4. Framework: **Next.js** (auto-detected)
5. Root Directory: leave as `/`
6. Click **Deploy** — this first deploy will FAIL (no env vars yet — that's fine)

### Step 4.2 — Add Environment Variables
1. Go to your project in Vercel → **Settings** → **Environment Variables**
2. Add EVERY variable from your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET      ← add after Phase 4.3
STRIPE_PRICE_STARTER
STRIPE_PRICE_GROWTH
STRIPE_PRICE_AGENCY
NEXT_PUBLIC_APP_URL        ← set to https://your-app.vercel.app
```

3. Set environment: **Production**, **Preview**, **Development** for all

### Step 4.3 — Redeploy
1. Go to **Deployments** tab
2. Click the three dots on the most recent deploy → **Redeploy**
3. Wait ~60 seconds
4. Click **Visit** — your app is live 🎉

### Step 4.4 — Add Supabase Redirect URLs
1. Back in Supabase → **Authentication** → **URL Configuration**
2. **Site URL**: `https://your-app.vercel.app`
3. **Redirect URLs** → Add:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (for local dev)
4. Save

### Step 4.5 — Complete Stripe Webhook Setup
Now that you have your live URL:
1. Go back to Stripe → **Developers** → **Webhooks**
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Copy the signing secret → go back to Vercel → add `STRIPE_WEBHOOK_SECRET`
4. Redeploy one more time

---

## PHASE 5: CUSTOM DOMAIN (~5 min)
> Skip if using Vercel subdomain for now

### If you buy a domain:
1. Recommended: Namecheap or Porkbun (~$10–$12/year for .com)
2. Suggested names: `atlasai.co`, `getatlas.ai`, `atlasmarketing.ai`
3. In Vercel → **Settings** → **Domains** → Add your domain
4. Copy the DNS records Vercel gives you
5. Go to your domain registrar → DNS settings → paste the records
6. Propagates in 15–60 min
7. Update `NEXT_PUBLIC_APP_URL` in Vercel env vars to your new domain
8. Update Supabase redirect URLs
9. Update Stripe webhook URL
10. Redeploy

---

## PHASE 6: POST-LAUNCH CHECKLIST

### Security
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] Service role key NEVER used client-side
- [ ] Stripe webhook signature verified (already in the code)
- [ ] Row Level Security enabled in Supabase (already in schema)

### Testing
- [ ] Sign up flow works end-to-end
- [ ] Content generation works (try all 4 types)
- [ ] Generation count increments in Supabase profiles table
- [ ] Stripe checkout completes and subscription activates
- [ ] Stripe webhook updates profile `plan` field
- [ ] Stripe portal loads for billing management
- [ ] Free tier limits enforce after 5 generations

### Analytics (add these free tools)
- [ ] Vercel Analytics (built in — enable in Vercel dashboard)
- [ ] Google Analytics 4 (add tracking ID to layout.tsx)
- [ ] Stripe Revenue Reporting (built in)
- [ ] Supabase Logs (built in)

---

## MONTHLY MAINTENANCE

| Task | Frequency | Tool |
|------|-----------|------|
| Check error logs | Weekly | Vercel dashboard |
| Review generation usage | Weekly | Supabase table editor |
| Check failed payments | Weekly | Stripe dashboard |
| Reset free-tier counters | Monthly | Supabase SQL: `UPDATE profiles SET generations_used = 0 WHERE plan = 'free'` |
| Update Claude model | When new releases drop | `app/api/generate/route.ts` → update model string |
| Backup database | Monthly | Supabase → Database → Backups |

---

## WHAT EACH FILE DOES (Quick Reference)

```
atlasai/
├── app/
│   ├── api/
│   │   ├── generate/route.ts        ← AI generation endpoint (server, secure)
│   │   └── stripe/
│   │       ├── checkout/route.ts    ← Creates Stripe checkout session
│   │       └── webhook/route.ts     ← Handles all Stripe subscription events
│   ├── dashboard/
│   │   ├── page.tsx                 ← Server component (fetches user data)
│   │   └── DashboardClient.tsx      ← Client dashboard UI
│   ├── login/page.tsx               ← Auth page (login + signup)
│   ├── globals.css                  ← Global styles
│   └── layout.tsx                   ← Root layout + metadata
├── lib/
│   ├── supabase.ts                  ← Supabase clients + types
│   └── stripe.ts                    ← Stripe client + plan config
├── middleware.ts                    ← Auth route protection
├── supabase-schema.sql              ← Run this in Supabase SQL Editor
├── .env.example                     ← Template for your .env.local
├── next.config.js                   ← Next.js config
└── package.json                     ← Dependencies
```

---

## NEED HELP?

If you get stuck on any step, the most common issues are:

**"Unauthorized" errors** → Check Supabase URL + anon key in Vercel env vars

**Stripe webhook failing** → Make sure you added all 4 event types and the signing secret is correct

**Build failing on Vercel** → Check the build log for missing env vars

**Auth redirects not working** → Double-check Supabase redirect URLs include your production domain

**Content not generating** → Check ANTHROPIC_API_KEY is set and valid in Vercel

---

*AtlasAI Production Guide · Built May 2026*
