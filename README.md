# AtlasAI — AI-Powered Marketing SaaS

## Quick Start

1. Copy `.env.example` → `.env.local` and fill in all values
2. Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:3000

## Deploy

Follow `DEPLOYMENT.md` step by step — takes ~60 minutes.

## Key Files

| File | Purpose |
|------|---------|
| `app/page-landing.jsx` | Premium marketing website |
| `app/dashboard/DashboardClient.jsx` | AI dashboard app |
| `app/api/generate/route.ts` | Secure AI generation endpoint |
| `app/api/stripe/` | Checkout + webhook handlers |
| `lib/supabase.ts` | Database client |
| `lib/stripe.ts` | Payment client |
| `middleware.ts` | Auth route protection |
| `supabase-schema.sql` | Run in Supabase SQL editor |
| `DEPLOYMENT.md` | Full deployment guide |
| `OUTREACH-KIT.md` | 20 DMs + bios + Fiverr gigs |
| `BUSINESS-BLUEPRINT.md` | Pricing + projections + exit strategy |

## Stack

- **Frontend:** Next.js 14 (App Router)
- **Database/Auth:** Supabase
- **Payments:** Stripe
- **AI:** Anthropic Claude Sonnet
- **Hosting:** Vercel

## Pricing Tiers

- Starter: $297/month
- Growth: $597/month  
- Agency: $997/month

Built June 2026.
