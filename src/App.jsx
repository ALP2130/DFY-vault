import { useState, useEffect } from "react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STRIPE CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 
// HOW TO SET UP STRIPE FOR THIS STORE:
//
// 1. CREATE A STRIPE ACCOUNT
//    → Go to https://dashboard.stripe.com/register
//    → Complete the onboarding (you can use Test Mode while building)
//
// 2. GET YOUR API KEYS
//    → Dashboard → Developers → API Keys
//    → You need: Publishable key (pk_test_...) and Secret key (sk_test_...)
//
// 3. CREATE PRODUCTS IN STRIPE (two options):
//
//    OPTION A — Stripe Dashboard (easiest):
//    → Products → Add Product → set name, price, one-time payment
//    → Copy each product's Price ID (price_...) into the PRODUCTS array below
//
//    OPTION B — Stripe API (automated):
//    → Use the /api/create-products endpoint below to bulk-create them
//
// 4. SET UP THE BACKEND
//    → You need a small server to create Stripe Checkout Sessions
//    → See the server.js file I've provided for a ready-to-use Express server
//    → Set your STRIPE_SECRET_KEY as an environment variable
//
// 5. UPDATE THE API_URL below to point to your backend
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STRIPE_CONFIG = {
  // In development, Vite proxies /api to localhost:3001 (see vite.config.js)
  // In production, replace with your actual backend URL
  API_URL: "",
  // Replace with your Stripe publishable key
  PUBLISHABLE_KEY: "pk_test_your_key_here",
};

const CATEGORIES = [
  { id: "all", label: "All Products", icon: "◆" },
  { id: "ebooks", label: "eBooks & Guides", icon: "📕" },
  { id: "templates", label: "Templates & Graphics", icon: "🎨" },
  { id: "software", label: "Software & Tools", icon: "⚙️" },
  { id: "lifestyle", label: "Lifestyle", icon: "✨" },
  { id: "tech", label: "Tech", icon: "💻" },
];

const PRODUCTS = [
  {
    id: 1, name: "Ultimate Social Media Templates Pack", category: "templates",
    price: 47, originalPrice: 97, image: "🎯",
    stripePriceId: "price_1TOiVK2FA1El4wqHZQGBRDTb",
    description: "200+ premium social media templates for Instagram, Facebook, TikTok & Pinterest. Fully editable in Canva.",
    features: ["200+ Templates", "Canva Editable", "Commercial License", "Resell Rights"],
    badge: "Best Seller", color: "#E84393"
  },
  {
    id: 2, name: "Passive Income Blueprint eBook", category: "ebooks",
    price: 27, originalPrice: 67, image: "📘",
    stripePriceId: "price_1TOiVL2FA1El4wqHjx8EpcLp",
    description: "Complete 150-page guide to building passive income streams online. Ready to resell with your branding.",
    features: ["150 Pages", "PDF + EPUB", "Rebrandable", "Master Resell Rights"],
    badge: "Popular", color: "#6C5CE7"
  },
  {
    id: 3, name: "AI Automation Toolkit", category: "software",
    price: 67, originalPrice: 197, image: "🤖",
    stripePriceId: "price_1TOiVM2FA1El4wqHMyA4fJfl",
    description: "Suite of 15 AI-powered automation tools for marketing, content creation, and lead generation.",
    features: ["15 Tools Included", "Lifetime Updates", "White Label", "Resell Rights"],
    badge: "Hot", color: "#00B894"
  },
  {
    id: 4, name: "Digital Marketing Mastery Course", category: "tech",
    price: 37, originalPrice: 127, image: "🚀",
    stripePriceId: "price_1TOiVN2FA1El4wqHY7IlvpH3",
    description: "12-module video course covering SEO, paid ads, email marketing, and social media strategy.",
    features: ["12 Modules", "Video + PDF", "Worksheets", "PLR License"],
    badge: "New", color: "#0984E3"
  },
  {
    id: 5, name: "Wellness & Self-Care Journal", category: "lifestyle",
    price: 19, originalPrice: 49, image: "🧘",
    stripePriceId: "price_1TOiVO2FA1El4wqHEIWOXhAA",
    description: "Beautiful printable journal with 90 days of prompts, habit trackers, and gratitude pages.",
    features: ["90 Day Program", "Printable PDF", "Editable Source", "Resell Rights"],
    badge: "", color: "#FDCB6E"
  },
  {
    id: 6, name: "Website Builder Pro Templates", category: "templates",
    price: 57, originalPrice: 149, image: "🌐",
    stripePriceId: "price_1TOiVO2FA1El4wqHcW47b8Ov",
    description: "50 premium website templates for WordPress, Shopify, and HTML. Mobile responsive & modern.",
    features: ["50 Templates", "3 Platforms", "Source Files", "Developer License"],
    badge: "Premium", color: "#E17055"
  },
  {
    id: 7, name: "Crypto & Finance Guide Bundle", category: "ebooks",
    price: 34, originalPrice: 89, image: "📊",
    stripePriceId: "price_1TOiVP2FA1El4wqHJVfuxUa0",
    description: "3-book bundle covering cryptocurrency basics, DeFi strategies, and personal finance fundamentals.",
    features: ["3 eBooks", "400+ Pages", "Infographics", "MRR License"],
    badge: "", color: "#00CEC9"
  },
  {
    id: 8, name: "Smart Home Setup Guide", category: "tech",
    price: 22, originalPrice: 59, image: "🏠",
    stripePriceId: "price_1TOiVQ2FA1El4wqHPcaUEjTV",
    description: "Step-by-step guide to automating your home with budget-friendly smart devices and integrations.",
    features: ["Device Reviews", "Setup Walkthroughs", "Printable Checklists", "Resell Rights"],
    badge: "", color: "#A29BFE"
  },
  {
    id: 9, name: "Fitness Transformation Program", category: "lifestyle",
    price: 29, originalPrice: 79, image: "💪",
    stripePriceId: "price_1TOiVR2FA1El4wqHxpAKEpe6",
    description: "8-week workout + nutrition plan with video demonstrations, meal plans, and progress trackers.",
    features: ["8 Week Plan", "40+ Videos", "Meal Plans", "White Label Rights"],
    badge: "Trending", color: "#FF7675"
  },
  {
    id: 10, name: "Email Marketing Swipe File", category: "software",
    price: 39, originalPrice: 99, image: "✉️",
    stripePriceId: "price_1TOiVS2FA1El4wqHJfwKdLh3",
    description: "500+ proven email templates for launches, nurture sequences, cold outreach, and re-engagement.",
    features: ["500+ Emails", "Copy & Paste", "A/B Tested", "PLR License"],
    badge: "", color: "#55EFC4"
  },
  {
    id: 11, name: "Brand Identity Design Kit", category: "templates",
    price: 44, originalPrice: 119, image: "🎭",
    stripePriceId: "price_1TOiVS2FA1El4wqHT4lJW3mv",
    description: "Complete branding toolkit with logo templates, color palettes, typography guides, and mockups.",
    features: ["Logo Templates", "Style Guides", "Mockup Files", "Commercial Use"],
    badge: "", color: "#FAB1A0"
  },
  {
    id: 12, name: "Productivity Masterclass", category: "lifestyle",
    price: 24, originalPrice: 64, image: "⏱️",
    stripePriceId: "price_1TOiVT2FA1El4wqHGTlO1DoF",
    description: "Time management system with planners, Notion templates, and a 30-day productivity challenge.",
    features: ["Notion Templates", "Planners", "30-Day Challenge", "Resell Rights"],
    badge: "", color: "#74B9FF"
  },
];

const TESTIMONIALS = [
  { name: "Sarah K.", text: "Bought the templates pack and made my investment back in 2 days reselling on Etsy!", stars: 5 },
  { name: "Marcus J.", text: "The AI toolkit alone is worth 10x the price. Already sold 50+ copies.", stars: 5 },
  { name: "Lisa R.", text: "Finally found quality DFY products I'm proud to put my name on.", stars: 5 },
];

// ─── STRIPE CHECKOUT HANDLER ───

async function handleStripeCheckout(cart, setCheckoutLoading, setPage) {
  setCheckoutLoading(true);
  try {
    const lineItems = cart.map(item => ({
      price: item.stripePriceId,
      quantity: item.qty,
    }));
    const response = await fetch(`${STRIPE_CONFIG.API_URL}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        line_items: lineItems,
        success_url: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: `${window.location.origin}?status=cancelled`,
      }),
    });
    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error || "Failed to create checkout session");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    setPage("checkout");
  } finally {
    setCheckoutLoading(false);
  }
}

// ─── COMPONENTS ───

function Navbar({ page, setPage, cartCount }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(10,10,18,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.4s ease", padding: "0 24px",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 72,
      }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #6C5CE7, #E84393)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800, color: "#fff",
          }}>D</div>
          <span style={{
            fontSize: 20, fontWeight: 700, color: "#fff",
            fontFamily: "'Clash Display', 'Outfit', sans-serif",
            letterSpacing: "-0.5px",
          }}>DFY Vault</span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {[
            { key: "home", label: "Home" },
            { key: "shop", label: "Shop" },
            { key: "about", label: "About" },
          ].map(item => (
            <span key={item.key} onClick={() => setPage(item.key)} style={{
              cursor: "pointer", fontSize: 14, fontWeight: 500, letterSpacing: "0.5px",
              color: page === item.key ? "#E84393" : "rgba(255,255,255,0.65)",
              transition: "color 0.2s", fontFamily: "'Outfit', sans-serif",
            }}>{item.label}</span>
          ))}
          <div onClick={() => setPage("cart")} style={{
            cursor: "pointer", position: "relative",
            background: "rgba(255,255,255,0.08)", borderRadius: 12,
            padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>🛒</span>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Cart</span>
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6, background: "#E84393",
                color: "#fff", borderRadius: "50%", width: 20, height: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700,
              }}>{cartCount}</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function ProductCard({ product, onAdd, onView, idx }) {
  const [hovered, setHovered] = useState(false);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 20, overflow: "hidden", cursor: "pointer",
        transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 60px ${product.color}22` : "none",
        animation: `fadeSlideUp 0.5s ease ${idx * 0.07}s both`,
      }}
      onClick={() => onView(product)}
    >
      <div style={{
        height: 200, display: "flex", alignItems: "center", justifyContent: "center",
        background: `linear-gradient(145deg, ${product.color}18, ${product.color}08)`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", width: 180, height: 180, borderRadius: "50%",
          background: `radial-gradient(circle, ${product.color}20, transparent 70%)`,
          filter: "blur(30px)",
        }} />
        <span style={{
          fontSize: 64, transition: "transform 0.4s",
          transform: hovered ? "scale(1.15) rotate(-5deg)" : "scale(1)",
        }}>{product.image}</span>
        {product.badge && (
          <span style={{
            position: "absolute", top: 14, right: 14, background: product.color,
            color: "#fff", fontSize: 11, fontWeight: 700, padding: "5px 12px",
            borderRadius: 8, letterSpacing: "0.5px", textTransform: "uppercase",
            fontFamily: "'Outfit', sans-serif",
          }}>{product.badge}</span>
        )}
        <span style={{
          position: "absolute", top: 14, left: 14,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
          color: "#4ADE80", fontSize: 12, fontWeight: 700, padding: "5px 10px",
          borderRadius: 8, fontFamily: "'Outfit', sans-serif",
        }}>-{discount}%</span>
      </div>
      <div style={{ padding: "20px 22px 24px" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "1.5px", color: product.color, marginBottom: 8,
          fontFamily: "'Outfit', sans-serif",
        }}>{CATEGORIES.find(c => c.id === product.category)?.label}</div>
        <h3 style={{
          fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 10px",
          lineHeight: 1.35, fontFamily: "'Clash Display', 'Outfit', sans-serif",
        }}>{product.name}</h3>
        <p style={{
          fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5,
          margin: "0 0 16px", fontFamily: "'Outfit', sans-serif",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>{product.description}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {product.features.slice(0, 3).map(f => (
            <span key={f} style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 6,
              background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.55)",
              fontFamily: "'Outfit', sans-serif",
            }}>{f}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Clash Display', 'Outfit', sans-serif" }}>${product.price}</span>
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", textDecoration: "line-through", marginLeft: 8, fontFamily: "'Outfit', sans-serif" }}>${product.originalPrice}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onAdd(product); }} style={{
            background: `linear-gradient(135deg, ${product.color}, ${product.color}CC)`,
            color: "#fff", border: "none", borderRadius: 12, padding: "10px 20px",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", transition: "all 0.2s",
            boxShadow: hovered ? `0 4px 20px ${product.color}44` : "none",
          }}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

function HeroSection({ setPage }) {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", textAlign: "center", padding: "120px 24px 80px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 20%, #6C5CE730, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, #E8439320, transparent 60%)",
      }} />
      <div style={{ position: "absolute", top: "15%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "#6C5CE7", opacity: 0.04, filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "#E84393", opacity: 0.04, filter: "blur(100px)" }} />
      <div style={{ position: "relative", maxWidth: 800, animation: "fadeSlideUp 0.8s ease both" }}>
        <div style={{
          display: "inline-block", padding: "8px 20px", borderRadius: 100,
          background: "rgba(232,67,147,0.1)", border: "1px solid rgba(232,67,147,0.2)",
          fontSize: 13, fontWeight: 600, color: "#E84393", marginBottom: 28,
          fontFamily: "'Outfit', sans-serif", letterSpacing: "0.5px",
        }}>✦ Premium Done-For-You Digital Products</div>
        <h1 style={{
          fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, color: "#fff",
          lineHeight: 1.08, margin: "0 0 24px",
          fontFamily: "'Clash Display', 'Outfit', sans-serif", letterSpacing: "-2px",
        }}>
          Launch Your Digital<br />
          <span style={{
            background: "linear-gradient(135deg, #6C5CE7, #E84393, #FD79A8)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Empire Today</span>
        </h1>
        <p style={{
          fontSize: 18, color: "rgba(255,255,255,0.5)", lineHeight: 1.7,
          maxWidth: 560, margin: "0 auto 40px", fontFamily: "'Outfit', sans-serif",
        }}>Premium digital products with full resell rights. Buy once, rebrand, and sell unlimited copies. Keep 100% of the profits.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setPage("shop")} style={{
            background: "linear-gradient(135deg, #6C5CE7, #E84393)",
            color: "#fff", border: "none", borderRadius: 14, padding: "16px 36px",
            fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            boxShadow: "0 8px 32px rgba(108,92,231,0.35)",
          }}>Browse Products →</button>
          <button onClick={() => setPage("about")} style={{
            background: "rgba(255,255,255,0.06)", color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
            padding: "16px 36px", fontSize: 16, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
          }}>Learn More</button>
        </div>
        <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 64, flexWrap: "wrap" }}>
          {[
            { value: "500+", label: "Products Sold" },
            { value: "100%", label: "Profit Yours" },
            { value: "Instant", label: "Delivery" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", fontFamily: "'Clash Display', 'Outfit', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ShopPage({ addToCart, viewProduct }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const filtered = activeCategory === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);
  return (
    <section style={{ padding: "120px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeSlideUp 0.5s ease both" }}>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "#fff", margin: "0 0 12px", fontFamily: "'Clash Display', 'Outfit', sans-serif", letterSpacing: "-1px" }}>Product Vault</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif" }}>Premium DFY products with full resell rights</p>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 48, flexWrap: "wrap", animation: "fadeSlideUp 0.5s ease 0.1s both" }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            padding: "10px 20px", borderRadius: 12, border: "1px solid",
            borderColor: activeCategory === cat.id ? "#E84393" : "rgba(255,255,255,0.08)",
            background: activeCategory === cat.id ? "rgba(232,67,147,0.15)" : "rgba(255,255,255,0.03)",
            color: activeCategory === cat.id ? "#E84393" : "rgba(255,255,255,0.55)",
            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
          }}>{cat.icon} {cat.label}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {filtered.map((p, i) => (
          <ProductCard key={p.id} product={p} onAdd={addToCart} onView={viewProduct} idx={i} />
        ))}
      </div>
    </section>
  );
}

function ProductDetail({ product, addToCart, goBack }) {
  if (!product) return null;
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  return (
    <section style={{ padding: "120px 24px 80px", maxWidth: 900, margin: "0 auto", animation: "fadeSlideUp 0.5s ease both" }}>
      <button onClick={goBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", marginBottom: 32, fontFamily: "'Outfit', sans-serif", padding: 0 }}>← Back to Shop</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        <div style={{
          background: `linear-gradient(145deg, ${product.color}15, ${product.color}05)`,
          borderRadius: 24, padding: 60, display: "flex", alignItems: "center",
          justifyContent: "center", border: "1px solid rgba(255,255,255,0.06)", aspectRatio: "1",
        }}>
          <span style={{ fontSize: 120 }}>{product.image}</span>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: product.color, marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
            {CATEGORIES.find(c => c.id === product.category)?.label}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 16px", fontFamily: "'Clash Display', 'Outfit', sans-serif", lineHeight: 1.15, letterSpacing: "-1px" }}>{product.name}</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 28px", fontFamily: "'Outfit', sans-serif" }}>{product.description}</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 28 }}>
            <span style={{ fontSize: 42, fontWeight: 800, color: "#fff", fontFamily: "'Clash Display', 'Outfit', sans-serif" }}>${product.price}</span>
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.25)", textDecoration: "line-through", fontFamily: "'Outfit', sans-serif" }}>${product.originalPrice}</span>
            <span style={{ background: "rgba(74,222,128,0.12)", color: "#4ADE80", padding: "4px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Save {discount}%</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
            {product.features.map(f => (
              <div key={f} style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "'Outfit', sans-serif" }}>✓ {f}</div>
            ))}
          </div>
          <button onClick={() => addToCart(product)} style={{
            width: "100%", background: `linear-gradient(135deg, ${product.color}, ${product.color}CC)`,
            color: "#fff", border: "none", borderRadius: 14, padding: "18px 36px",
            fontSize: 17, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
            boxShadow: `0 8px 32px ${product.color}35`,
          }}>Add to Cart — ${product.price}</button>
          <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 12, background: "rgba(108,92,231,0.08)", border: "1px solid rgba(108,92,231,0.15)" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif", margin: 0, lineHeight: 1.6 }}>
              🔐 <strong style={{ color: "#fff" }}>Resell Rights Included</strong> — Buy once, rebrand, and resell unlimited copies. You keep 100% of the revenue.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CartPage({ cart, removeFromCart, setPage, onCheckout, checkoutLoading }) {
  const total = cart.reduce((s, item) => s + item.price * item.qty, 0);
  return (
    <section style={{ padding: "120px 24px 80px", maxWidth: 700, margin: "0 auto", animation: "fadeSlideUp 0.5s ease both" }}>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 40px", fontFamily: "'Clash Display', 'Outfit', sans-serif", letterSpacing: "-1px" }}>Your Cart</h2>
      {cart.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", marginBottom: 24 }}>Your cart is empty</p>
          <button onClick={() => setPage("shop")} style={{
            background: "linear-gradient(135deg, #6C5CE7, #E84393)", color: "#fff",
            border: "none", borderRadius: 12, padding: "14px 32px", fontSize: 15,
            fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
          }}>Browse Products</button>
        </div>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 20, padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: `linear-gradient(145deg, ${item.color}20, ${item.color}08)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{item.image}</div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px", fontFamily: "'Outfit', sans-serif" }}>{item.name}</h4>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0, fontFamily: "'Outfit', sans-serif" }}>Qty: {item.qty} · Resell Rights Included</p>
              </div>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Clash Display', 'Outfit', sans-serif" }}>${item.price * item.qty}</span>
              <button onClick={() => removeFromCart(item.id)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "rgba(255,255,255,0.4)", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
          ))}
          <div style={{ marginTop: 24, padding: 24, borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Subtotal</span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>${total.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>Processing Fee</span>
              <span style={{ fontSize: 14, color: "#4ADE80" }}>$0.00</span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "'Outfit', sans-serif" }}>Total</span>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#fff", fontFamily: "'Clash Display', 'Outfit', sans-serif" }}>${total.toFixed(2)}</span>
            </div>
          </div>
          <button onClick={onCheckout} disabled={checkoutLoading} style={{
            width: "100%", marginTop: 24,
            background: checkoutLoading ? "rgba(108,92,231,0.5)" : "linear-gradient(135deg, #6C5CE7, #E84393)",
            color: "#fff", border: "none", borderRadius: 14, padding: "18px",
            fontSize: 17, fontWeight: 700, cursor: checkoutLoading ? "wait" : "pointer",
            fontFamily: "'Outfit', sans-serif", boxShadow: "0 8px 32px rgba(108,92,231,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            {checkoutLoading ? (
              <><span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite", display: "inline-block" }} />Connecting to Stripe...</>
            ) : (
              <>🔒 Pay with Stripe — ${total.toFixed(2)}</>
            )}
          </button>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, flexWrap: "wrap" }}>
            {[
              { icon: "🔒", text: "SSL Encrypted" },
              { icon: "💳", text: "Stripe Secure" },
              { icon: "⚡", text: "Instant Delivery" },
              { icon: "🔄", text: "30-Day Refund" },
            ].map(b => (
              <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif" }}>
                <span>{b.icon}</span><span>{b.text}</span>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'Outfit', sans-serif", margin: "0 0 8px" }}>Accepted payment methods</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              {["Visa", "Mastercard", "Amex", "Apple Pay", "Google Pay"].map(m => (
                <span key={m} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(255,255,255,0.05)", fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif" }}>{m}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function CheckoutPage({ cart, setPage, clearCart }) {
  const [email, setEmail] = useState("");
  const [demoComplete, setDemoComplete] = useState(false);
  const total = cart.reduce((s, item) => s + item.price * item.qty, 0);
  const handleDemoCheckout = () => {
    if (!email) return;
    setDemoComplete(true);
    setTimeout(() => { clearCart(); setPage("success"); }, 2000);
  };
  return (
    <section style={{ padding: "120px 24px 80px", maxWidth: 560, margin: "0 auto", animation: "fadeSlideUp 0.5s ease both" }}>
      <button onClick={() => setPage("cart")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer", marginBottom: 32, fontFamily: "'Outfit', sans-serif", padding: 0 }}>← Back to Cart</button>
      <div style={{ padding: 32, borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #635BFF, #7A73FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", fontWeight: 800 }}>S</div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>Stripe Checkout</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", display: "block" }}>Demo Mode — Connect Stripe to go live</span>
          </div>
        </div>
        <div style={{ padding: "16px 20px", borderRadius: 12, marginBottom: 24, background: "rgba(99,91,255,0.08)", border: "1px solid rgba(99,91,255,0.15)" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif", margin: 0, lineHeight: 1.6 }}>
            ℹ️ This is a <strong style={{ color: "#7A73FF" }}>demo checkout</strong>. Once you connect your Stripe account and backend, customers will be redirected to Stripe's secure hosted checkout page.
          </p>
        </div>
        {cart.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{item.image}</span>
              <div>
                <span style={{ fontSize: 14, color: "#fff", fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>{item.name}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif", display: "block" }}>Qty: {item.qty}</span>
              </div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>${item.price * item.qty}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 24px", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "'Outfit', sans-serif" }}>Total</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Clash Display', 'Outfit', sans-serif" }}>${total.toFixed(2)}</span>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif", display: "block", marginBottom: 8 }}>Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={{
            width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 15, fontFamily: "'Outfit', sans-serif",
            outline: "none", boxSizing: "border-box",
          }} />
        </div>
        <button onClick={handleDemoCheckout} disabled={demoComplete || !email} style={{
          width: "100%", background: demoComplete ? "#4ADE80" : !email ? "rgba(99,91,255,0.3)" : "linear-gradient(135deg, #635BFF, #7A73FF)",
          color: "#fff", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700,
          cursor: !email || demoComplete ? "default" : "pointer", fontFamily: "'Outfit', sans-serif",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          {demoComplete ? "✓ Payment Successful!" : `Pay $${total.toFixed(2)}`}
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "'Outfit', sans-serif", marginTop: 12 }}>
          Powered by <strong style={{ color: "rgba(255,255,255,0.4)" }}>Stripe</strong> · Secure & encrypted
        </p>
      </div>
    </section>
  );
}

function SuccessPage({ setPage }) {
  return (
    <section style={{ padding: "120px 24px 80px", maxWidth: 600, margin: "0 auto", textAlign: "center", animation: "fadeSlideUp 0.6s ease both" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(74,222,128,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 40 }}>✓</div>
      <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 16px", fontFamily: "'Clash Display', 'Outfit', sans-serif" }}>Order Complete!</h2>
      <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontFamily: "'Outfit', sans-serif", maxWidth: 450, margin: "0 auto 16px" }}>
        Thank you for your purchase! Your download links have been sent to your email.
      </p>
      <div style={{ padding: 24, borderRadius: 16, marginTop: 32, marginBottom: 32, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.12)" }}>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: "#4ADE80", margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>What's Next?</h4>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6, fontFamily: "'Outfit', sans-serif" }}>
          Download your products, rebrand them with your own name and logo, then start reselling on platforms like Etsy, Gumroad, Shopify, or your own website. You keep 100% of the profits!
        </p>
      </div>
      <button onClick={() => setPage("shop")} style={{
        background: "linear-gradient(135deg, #6C5CE7, #E84393)", color: "#fff",
        border: "none", borderRadius: 14, padding: "16px 36px", fontSize: 16,
        fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif",
        boxShadow: "0 8px 32px rgba(108,92,231,0.35)",
      }}>Continue Shopping</button>
    </section>
  );
}

function AboutPage({ setPage }) {
  return (
    <section style={{ padding: "120px 24px 80px", maxWidth: 800, margin: "0 auto", animation: "fadeSlideUp 0.5s ease both" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", fontFamily: "'Clash Display', 'Outfit', sans-serif", letterSpacing: "-1px" }}>How It Works</h2>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto", fontFamily: "'Outfit', sans-serif" }}>
          DFY Vault gives you premium digital products with full resell rights. Buy, rebrand, sell, and keep every dollar.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginBottom: 64 }}>
        {[
          { step: "01", title: "Choose", desc: "Browse our curated vault of premium DFY products across multiple categories.", icon: "🎯" },
          { step: "02", title: "Customize", desc: "Rebrand with your own name, logo, and style. Make it yours.", icon: "✏️" },
          { step: "03", title: "Profit", desc: "Sell unlimited copies on any platform. Keep 100% of every sale.", icon: "💰" },
        ].map(s => (
          <div key={s.step} style={{ padding: 32, borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
            <span style={{ fontSize: 40, display: "block", marginBottom: 16 }}>{s.icon}</span>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#E84393", fontFamily: "'Outfit', sans-serif", marginBottom: 8, letterSpacing: "1px" }}>STEP {s.step}</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 10px", fontFamily: "'Clash Display', 'Outfit', sans-serif" }}>{s.title}</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, fontFamily: "'Outfit', sans-serif", margin: 0 }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <div style={{ padding: 40, borderRadius: 24, background: "linear-gradient(135deg, rgba(108,92,231,0.1), rgba(232,67,147,0.1))", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 64 }}>
        <h3 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 0 24px", fontFamily: "'Clash Display', 'Outfit', sans-serif", textAlign: "center" }}>What Our Customers Say</h3>
        <div style={{ display: "grid", gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{ padding: "20px 24px", borderRadius: 16, background: "rgba(255,255,255,0.04)" }}>
              <div style={{ marginBottom: 8 }}>{"⭐".repeat(t.stars)}</div>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: "0 0 8px", fontFamily: "'Outfit', sans-serif", fontStyle: "italic", lineHeight: 1.6 }}>"{t.text}"</p>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#E84393", fontFamily: "'Outfit', sans-serif" }}>— {t.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => setPage("shop")} style={{
          background: "linear-gradient(135deg, #6C5CE7, #E84393)", color: "#fff",
          border: "none", borderRadius: 14, padding: "16px 36px", fontSize: 16, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Outfit', sans-serif", boxShadow: "0 8px 32px rgba(108,92,231,0.35)",
        }}>Start Shopping →</button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: "48px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", fontFamily: "'Outfit', sans-serif" }}>
        © 2026 DFY Vault — Premium Digital Products with Resell Rights · Powered by Stripe
      </div>
    </footer>
  );
}

// ─── MAIN APP ───

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      setPage("success"); setCart([]);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("status") === "cancelled") {
      setPage("cart");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setToast(`${product.name} added to cart!`);
    setTimeout(() => setToast(null), 2500);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);
  const viewProduct = (product) => { setSelectedProduct(product); setPage("detail"); };
  const navigateTo = (p) => { setPage(p); setSelectedProduct(null); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const initiateCheckout = () => { handleStripeCheckout(cart, setCheckoutLoading, navigateTo); };
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A12", color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        button:hover { opacity: 0.92; }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>
      <Navbar page={page} setPage={navigateTo} cartCount={cartCount} />
      {page === "home" && <HeroSection setPage={navigateTo} />}
      {page === "shop" && <ShopPage addToCart={addToCart} viewProduct={viewProduct} />}
      {page === "detail" && <ProductDetail product={selectedProduct} addToCart={addToCart} goBack={() => navigateTo("shop")} />}
      {page === "cart" && <CartPage cart={cart} removeFromCart={removeFromCart} setPage={navigateTo} onCheckout={initiateCheckout} checkoutLoading={checkoutLoading} />}
      {page === "checkout" && <CheckoutPage cart={cart} setPage={navigateTo} clearCart={clearCart} />}
      {page === "success" && <SuccessPage setPage={navigateTo} />}
      {page === "about" && <AboutPage setPage={navigateTo} />}
      <Footer />
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "rgba(108,92,231,0.95)", backdropFilter: "blur(20px)",
          color: "#fff", padding: "14px 28px", borderRadius: 14,
          fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", animation: "toastIn 0.3s ease", zIndex: 200,
        }}>✓ {toast}</div>
      )}
    </div>
  );
}
