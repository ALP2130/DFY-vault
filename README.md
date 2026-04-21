# DFY Vault — Digital Products Store with Stripe

A premium online store for selling Done-For-You digital products with resell rights. Built with React + Vite, powered by Stripe Checkout.

---

## Quick Start (3 steps)

### Step 1: Install & run the frontend

```bash
cd dfy-vault
npm install
npm run dev
```

Your store is now live at **http://localhost:5173**

### Step 2: Set up Stripe & run the backend

```bash
cd server
cp .env.example .env
# Edit .env and paste your Stripe secret key (get it from https://dashboard.stripe.com/apikeys)
npm install
npm start
```

Backend runs at **http://localhost:3001**

### Step 3: Create your Stripe products

With the server running, open a new terminal and run:

```bash
curl -X POST http://localhost:3001/api/create-products
```

This creates all 12 products in your Stripe account and returns Price IDs. Copy each Price ID into the matching product's `stripePriceId` field in `src/App.jsx`.

---

## Project Structure

```
dfy-vault/
├── index.html            # Entry HTML
├── package.json          # Frontend dependencies
├── vite.config.js        # Vite config (includes API proxy)
├── public/
│   └── vite.svg          # Favicon
├── src/
│   ├── main.jsx          # React entry point
│   └── App.jsx           # Full store application
└── server/
    ├── package.json      # Backend dependencies
    ├── server.js         # Express + Stripe API
    └── .env.example      # Environment variables template
```

## How Checkout Works

1. Customer adds products to cart
2. Customer clicks "Pay with Stripe"
3. Frontend sends cart items to your backend (`POST /api/create-checkout-session`)
4. Backend creates a Stripe Checkout Session and returns the URL
5. Customer is redirected to Stripe's secure hosted checkout page
6. After payment, customer returns to your site with a success status
7. Stripe sends a webhook to your backend for order fulfillment

## Deploying

### Frontend (Vercel — recommended)
1. Push to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. It auto-detects Vite and deploys

### Backend (Railway — recommended)
1. Push the `server/` folder to a separate GitHub repo (or use a monorepo)
2. Connect to [railway.app](https://railway.app)
3. Add your environment variables in Railway's dashboard
4. Update `STRIPE_CONFIG.API_URL` in `src/App.jsx` to your Railway URL

### Don't forget
- Set up your Stripe webhook in the [Stripe Dashboard](https://dashboard.stripe.com/webhooks) pointing to `https://your-backend-url/api/webhook`
- Update `FRONTEND_URL` in your backend `.env` to your Vercel URL
- Switch from `sk_test_` to `sk_live_` keys when ready to accept real payments

## Customization

- **Products**: Edit the `PRODUCTS` array in `src/App.jsx`
- **Branding**: Search for "DFY Vault" and replace with your brand name
- **Colors**: The main gradient uses `#6C5CE7` → `#E84393` — search and replace
- **Categories**: Edit the `CATEGORIES` array to match your product types
