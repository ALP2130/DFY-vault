"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#05070F", surface: "#0C1020", surfaceAlt: "#111827",
  border: "rgba(232,226,213,0.06)", borderHov: "rgba(255,107,53,0.4)",
  orange: "#FF6B35", cyan: "#00D4FF", green: "#00E5A0",
  text: "#E8E2D5", muted: "#586070", dim: "#1E2A3A",
};

// ─── TESTIMONIALS ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Sarah M.", role: "Salon Owner, Miami", quote: "We went from 2 posts a month to 30. Booking requests tripled in 60 days.", stars: 5 },
  { name: "James K.", role: "Fitness Coach, Online", quote: "10x the content for less than we paid our social media manager. Insane ROI.", stars: 5 },
  { name: "Maria L.", role: "Restaurant Owner, NYC", quote: "Instagram engagement up 340%. Tables were fully booked within 6 weeks.", stars: 5 },
  { name: "David R.", role: "Business Consultant", quote: "AtlasAI wrote better copy than the $3,000/mo agency I fired. Not even close.", stars: 5 },
  { name: "Priya S.", role: "E-commerce Founder", quote: "Our email open rates went from 18% to 41% in the first month. Unreal.", stars: 5 },
  { name: "Tom B.", role: "Real Estate Agent", quote: "Three new listings came directly from content AtlasAI wrote. Pays for itself.", stars: 5 },
];

const PLANS = [
  {
    name: "Starter", price: 297, yearlyPrice: 247,
    desc: "For businesses ready to get seen online.",
    features: ["30 AI social posts/month","4 SEO blog articles","Monthly email campaign","AI brand voice setup","Analytics report","Email support"],
    cta: "Start Growing", highlight: false,
  },
  {
    name: "Growth", price: 597, yearlyPrice: 497,
    desc: "For businesses serious about scaling fast.",
    features: ["60 AI social posts/month","8 long-form SEO articles","Full 8-email sequence","Ad copy for 2 campaigns","Weekly performance report","Competitor analysis","Priority support"],
    cta: "Most Popular", highlight: true,
  },
  {
    name: "Agency", price: 997, yearlyPrice: 797,
    desc: "Full-stack AI marketing domination.",
    features: ["Unlimited content production","Full funnel strategy & copy","Paid ad management","Monthly strategy call","Custom AI prompt library","Slack direct access","White-label option"],
    cta: "Let's Talk", highlight: false,
  },
];

const SERVICES = [
  { icon: "✦", title: "AI Content Engine", desc: "30+ pieces of on-brand content every month — posts, blogs, emails — without you lifting a finger.", tags: ["Social Media","Blog Posts","Email Copy"] },
  { icon: "◈", title: "AI SEO Domination", desc: "Keyword strategy and mass content production that puts you on page 1 faster than traditional agencies can even brief a writer.", tags: ["On-Page SEO","Content Scale","Local SEO"] },
  { icon: "⬡", title: "AI Ad & Funnel Systems", desc: "Ad copy that converts, landing pages that close, and funnels that run on autopilot — all written by AI, all optimised for your audience.", tags: ["Ad Copy","Landing Pages","A/B Testing"] },
];

const FAQS = [
  { q: "Why is this so much cheaper than a regular agency?", a: "Traditional agencies pay 5–10 people to do manually what we do with AI in minutes. We pass that saving directly to you. Same results, fraction of the cost." },
  { q: "Do I need to know anything about AI or marketing?", a: "Zero. You tell us about your business once. We handle everything — content, strategy, delivery. You approve and post." },
  { q: "How fast will I see results?", a: "Content delivered within 48 hours of onboarding. SEO movement typically within 30–60 days. Paid ad results within 7–14 days." },
  { q: "What if I want to cancel?", a: "No contracts. No lock-in. Cancel anytime — we keep you because our results speak for themselves." },
];

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCounter(target, duration = 2000, inView = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return count;
}

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Loader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => setPct(p => { if (p >= 100) { clearInterval(interval); setTimeout(() => { setOut(true); setTimeout(onDone, 600); }, 200); return 100; } return p + 4; }), 40);
    return () => clearInterval(interval);
  }, [onDone]);
  return (
    <div style={{ position: "fixed", inset: 0, background: T.bg, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "opacity 0.6s ease, transform 0.6s ease", opacity: out ? 0 : 1, transform: out ? "translateY(-20px)" : "translateY(0)", pointerEvents: out ? "none" : "all" }}>
      <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: "0.15em", color: T.text, marginBottom: 48 }}>
        ATLAS<span style={{ color: T.orange }}>AI</span>
      </div>
      <div style={{ width: 200, height: 2, background: T.dim, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", background: `linear-gradient(90deg, ${T.orange}, ${T.cyan})`, width: `${pct}%`, transition: "width 0.05s linear", borderRadius: 2 }} />
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: T.muted, fontFamily: "system-ui, sans-serif", letterSpacing: "0.12em" }}>{pct}%</div>
    </div>
  );
}

function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const move = (e) => { pos.current = { x: e.clientX, y: e.clientY }; if (dot.current) { dot.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`; } };
    const over = (e) => setHovered(e.target.matches("button, a, [data-hover]"));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    const loop = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.12;
      if (ring.current) ring.current.style.transform = `translate(${ringPos.current.x - 20}px, ${ringPos.current.y - 20}px) scale(${hovered ? 1.6 : 1})`;
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseover", over); cancelAnimationFrame(raf.current); };
  }, [hovered]);

  return (
    <>
      <div ref={dot} style={{ position: "fixed", width: 8, height: 8, background: T.orange, borderRadius: "50%", pointerEvents: "none", zIndex: 99999, top: 0, left: 0, transition: "opacity 0.2s" }} />
      <div ref={ring} style={{ position: "fixed", width: 40, height: 40, border: `1.5px solid rgba(255,107,53,0.4)`, borderRadius: "50%", pointerEvents: "none", zIndex: 99998, top: 0, left: 0, transition: "transform 0.1s ease, border-color 0.2s", borderColor: hovered ? T.orange : "rgba(255,107,53,0.3)" }} />
    </>
  );
}

function FadeSection({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(32px)", transition: `opacity 0.7s ${delay}s ease, transform 0.7s ${delay}s ease`, ...style }}>
      {children}
    </div>
  );
}

function StatCard({ value, suffix = "", label, inView }) {
  const num = useCounter(parseInt(value.replace(/\D/g, "")) || 0, 2000, inView);
  const hasNum = /\d/.test(value);
  return (
    <div style={{ textAlign: "center", padding: "32px 20px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8 }}>
      <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 900, fontSize: 52, color: T.orange, lineHeight: 1, marginBottom: 10, letterSpacing: "-0.02em" }}>
        {hasNum ? `${value.replace(/[\d]+/, "")}${num}${suffix}` : value}
      </div>
      <div style={{ color: T.muted, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1.5 }}>{label}</div>
    </div>
  );
}

function TiltCard({ children, style = {} }) {
  const el = useRef(null);
  const handleMove = (e) => {
    if (!el.current) return;
    const rect = el.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.current.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(10px)`;
  };
  const handleLeave = () => { if (el.current) el.current.style.transform = "perspective(600px) rotateY(0) rotateX(0) translateZ(0)"; };
  return <div ref={el} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ transition: "transform 0.1s ease", ...style }}>{children}</div>;
}

function RoiCalculator() {
  const [spend, setSpend] = useState(2000);
  const [customers, setCustomers] = useState(10);
  const [value, setValue] = useState(500);
  const [ref, inView] = useInView();

  const costPerCustomer = spend / Math.max(customers, 1);
  const projectedCustomers = Math.round(customers * 2.8);
  const extraRevenue = (projectedCustomers - customers) * value;
  const atlasPrice = 297;
  const saving = spend - atlasPrice;
  const roi = Math.round(((extraRevenue + saving) / atlasPrice) * 100);

  return (
    <section ref={ref} style={{ padding: "100px 32px", background: `linear-gradient(135deg, rgba(255,107,53,0.04) 0%, rgba(0,212,255,0.04) 100%)`, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <FadeSection style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={overline}>ROI Calculator</div>
          <h2 style={{ ...sectionTitle, textAlign: "center" }}>See Your <span style={{ color: T.orange }}>Exact Return</span></h2>
          <p style={{ color: T.muted, fontSize: 15, marginTop: 12 }}>Plug in your numbers. See what AtlasAI is actually worth to your business.</p>
        </FadeSection>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
          {/* Inputs */}
          <FadeSection delay={0.1}>
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 36 }}>
              {[
                { label: "Current monthly marketing spend", value: spend, set: setSpend, min: 0, max: 10000, step: 100, fmt: v => `$${v.toLocaleString()}` },
                { label: "New customers per month (currently)", value: customers, set: setCustomers, min: 1, max: 200, step: 1, fmt: v => `${v} customers` },
                { label: "Average customer value ($)", value: value, set: setValue, min: 50, max: 10000, step: 50, fmt: v => `$${v.toLocaleString()}` },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: T.muted, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{item.label}</label>
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.orange }}>{item.fmt(item.value)}</span>
                  </div>
                  <input type="range" min={item.min} max={item.max} step={item.step} value={item.value} onChange={e => item.set(Number(e.target.value))}
                    style={{ width: "100%", accentColor: T.orange, cursor: "pointer", height: 4 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: T.muted }}>{item.fmt(item.min)}</span>
                    <span style={{ fontSize: 10, color: T.muted }}>{item.fmt(item.max)}</span>
                  </div>
                </div>
              ))}
            </div>
          </FadeSection>

          {/* Results */}
          <FadeSection delay={0.2}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { label: "Current cost per customer", value: `$${Math.round(costPerCustomer).toLocaleString()}`, sub: "What you pay today", color: "#EF4444" },
                { label: "With AtlasAI Starter", value: "$297/mo", sub: "Your new marketing cost", color: T.orange },
                { label: "Projected customers/month", value: projectedCustomers, sub: "Based on avg 2.8x content increase", color: T.cyan },
                { label: "Extra revenue potential", value: `$${extraRevenue.toLocaleString()}`, sub: "From additional customers", color: T.green },
              ].map((item, i) => (
                <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: T.muted, opacity: 0.6 }}>{item.sub}</div>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: item.color, fontFamily: "system-ui, sans-serif", letterSpacing: "-0.02em" }}>{item.value}</div>
                </div>
              ))}

              {/* ROI Callout */}
              <div style={{ background: `linear-gradient(135deg, ${T.orange}, #E55A2B)`, borderRadius: 8, padding: "24px 28px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Estimated ROI with AtlasAI</div>
                <div style={{ fontSize: 56, fontWeight: 900, color: "#05070F", lineHeight: 1, letterSpacing: "-0.02em", fontFamily: "system-ui, sans-serif" }}>{roi > 999 ? "999+" : roi}%</div>
                <div style={{ fontSize: 13, color: "rgba(0,0,0,0.55)", marginTop: 8 }}>First month</div>
              </div>

              <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                style={{ background: T.bg, color: T.orange, border: `1px solid ${T.orange}`, padding: "14px 28px", borderRadius: 6, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.04em" }}>
                Get Started at $297/mo →
              </button>
            </div>
          </FadeSection>
        </div>
      </div>
    </section>
  );
}

function PricingToggle() {
  const [yearly, setYearly] = useState(false);
  return (
    <section id="pricing" style={{ padding: "100px 32px" }}>
      <div style={{ maxWidth: 1050, margin: "0 auto" }}>
        <FadeSection style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={overline}>Pricing</div>
          <h2 style={{ ...sectionTitle, textAlign: "center" }}>Agency Results.<br /><span style={{ color: T.orange }}>Startup Pricing.</span></h2>
          <p style={{ color: T.muted, fontSize: 15, marginTop: 12, marginBottom: 32 }}>No contracts. No retainers. Cancel anytime.</p>
          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: T.surface, border: `1px solid ${T.border}`, padding: "8px 20px", borderRadius: 40 }}>
            <span style={{ fontSize: 13, color: yearly ? T.muted : T.text, fontWeight: 500 }}>Monthly</span>
            <div onClick={() => setYearly(y => !y)} style={{ width: 44, height: 24, background: yearly ? T.orange : T.dim, borderRadius: 12, cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
              <div style={{ position: "absolute", top: 3, left: yearly ? 23 : 3, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "left 0.3s" }} />
            </div>
            <span style={{ fontSize: 13, color: yearly ? T.text : T.muted, fontWeight: 500 }}>Yearly <span style={{ color: T.green, fontSize: 11, fontWeight: 700 }}>Save 20%</span></span>
          </div>
        </FadeSection>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "center" }}>
          {PLANS.map((p, i) => (
            <FadeSection key={i} delay={i * 0.1} style={{ transform: p.highlight ? "scale(1.04)" : "scale(1)" }}>
              <TiltCard style={{ background: p.highlight ? `linear-gradient(135deg, ${T.orange}, #C4501F)` : T.surface, border: p.highlight ? "none" : `1px solid ${T.border}`, borderRadius: 12, padding: "40px 32px", position: "relative", overflow: "hidden" }}>
                {p.highlight && <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "rgba(255,255,255,0.06)", borderRadius: "50%" }} />}
                {p.highlight && <div style={{ position: "absolute", top: 16, right: 16, background: T.bg, color: T.orange, fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 20 }}>MOST POPULAR</div>}
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: p.highlight ? "rgba(255,255,255,0.5)" : T.muted, marginBottom: 12 }}>{p.name}</div>
                <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 900, fontSize: 52, color: p.highlight ? "#fff" : T.text, lineHeight: 1, letterSpacing: "-0.02em", marginBottom: 4 }}>
                  ${yearly ? p.yearlyPrice : p.price}<span style={{ fontSize: 16, fontWeight: 400, opacity: 0.5 }}>/mo</span>
                </div>
                {yearly && <div style={{ fontSize: 11, color: p.highlight ? "rgba(255,255,255,0.6)" : T.green, marginBottom: 12 }}>Save ${(p.price - p.yearlyPrice) * 12}/year</div>}
                <p style={{ fontSize: 13, color: p.highlight ? "rgba(255,255,255,0.7)" : T.muted, lineHeight: 1.6, margin: "16px 0 24px" }}>{p.desc}</p>
                <div style={{ height: 1, background: p.highlight ? "rgba(255,255,255,0.15)" : T.border, marginBottom: 24 }} />
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {p.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: p.highlight ? "rgba(255,255,255,0.85)" : "#B0AAA0", lineHeight: 1.5 }}>
                      <span style={{ color: p.highlight ? "#fff" : T.orange, marginTop: 1 }}>→</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                  style={{ width: "100%", padding: "14px 24px", background: p.highlight ? T.bg : T.orange, color: p.highlight ? T.orange : T.bg, border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {p.cta}
                </button>
              </TiltCard>
            </FadeSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialMarquee() {
  return (
    <section style={{ padding: "80px 0", borderTop: `1px solid ${T.border}`, overflow: "hidden" }}>
      <FadeSection style={{ textAlign: "center", marginBottom: 48, padding: "0 32px" }}>
        <div style={overline}>Social Proof</div>
        <h2 style={{ ...sectionTitle, textAlign: "center" }}>Businesses That <span style={{ color: T.orange }}>Made the Switch</span></h2>
      </FadeSection>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes marquee2 { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      `}</style>
      {[false, true].map((rev, row) => (
        <div key={row} style={{ overflow: "hidden", marginBottom: row ? 0 : 20 }}>
          <div style={{ display: "inline-flex", animation: `${rev ? "marquee2" : "marquee"} 30s linear infinite`, whiteSpace: "nowrap" }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} style={{ display: "inline-block", minWidth: 320, margin: "0 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "24px 28px", verticalAlign: "top", whiteSpace: "normal" }}>
                <div style={{ color: T.orange, fontSize: 14, letterSpacing: 2, marginBottom: 14 }}>{"★".repeat(t.stars)}</div>
                <p style={{ fontSize: 14, color: T.text, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>"{t.quote}"</p>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>{t.name} · {t.role}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

// ─── SHARED STYLES ─────────────────────────────────────────────────────────────
const overline = { color: T.orange, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16, display: "block" };
const sectionTitle = { fontFamily: "system-ui, sans-serif", fontWeight: 900, fontSize: 52, lineHeight: 1.1, color: T.text, letterSpacing: "-0.02em" };

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AtlasAIPremium() {
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", business: "" });
  const [submitted, setSubmitted] = useState(false);
  const [statsRef, statsInView] = useInView();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: "system-ui, -apple-system, sans-serif", minHeight: "100vh", overflowX: "hidden", cursor: "none" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.orange}; }
        ::selection { background: ${T.orange}; color: ${T.bg}; }
        input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-track { height: 4px; background: rgba(232,226,213,0.1); border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${T.orange}; margin-top: -7px; cursor: pointer; box-shadow: 0 0 10px rgba(255,107,53,0.4); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(4deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .shimmer { background: linear-gradient(90deg,${T.text} 0%,${T.orange} 40%,${T.cyan} 60%,${T.text} 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 3.5s linear infinite; }
        .float { animation:float 6s ease-in-out infinite; }
        .float2 { animation:float 9s ease-in-out 1.5s infinite; }
        button { cursor:none !important; }
        a { cursor:none !important; }
        .noise { position:fixed; inset:0; pointer-events:none; z-index:9990; opacity:0.025; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        @media(max-width:768px) { .hero-h1{font-size:48px!important;} .grid2{grid-template-columns:1fr!important;} .grid3{grid-template-columns:1fr!important;} .grid4{grid-template-columns:1fr 1fr!important;} }
      `}</style>

      {/* Noise texture */}
      <div className="noise" />

      {/* Custom cursor */}
      <Cursor />

      {/* Loader */}
      {!loaded && <Loader onDone={() => setLoaded(true)} />}

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "0 40px", background: scrolled ? "rgba(5,7,15,0.92)" : "transparent", backdropFilter: scrolled ? "blur(24px)" : "none", borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent", transition: "all 0.4s ease" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: T.orange }}>▲</span>
            <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: "0.1em" }}>ATLAS<span style={{ color: T.orange }}>AI</span></span>
          </div>
          <div style={{ display: "flex", gap: 36 }}>
            {["services", "pricing", "contact"].map(id => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: T.muted, fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "inherit", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = T.text} onMouseLeave={e => e.target.style.color = T.muted}>
                {id}
              </button>
            ))}
          </div>
          <button onClick={() => scrollTo("contact")} style={{ background: T.orange, color: T.bg, border: "none", padding: "10px 24px", fontFamily: "inherit", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", borderRadius: 4, transition: "all 0.2s" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 8px 24px rgba(255,107,53,0.4)`; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
            Free Audit →
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 32px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 700, height: 700, background: T.orange, borderRadius: "50%", filter: "blur(120px)", opacity: 0.07, top: -200, left: -200, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 500, height: 500, background: T.cyan, borderRadius: "50%", filter: "blur(100px)", opacity: 0.06, bottom: -100, right: -100, pointerEvents: "none" }} />
        <div className="float" style={{ position: "absolute", top: "22%", right: "7%", width: 90, height: 90, border: `1px solid rgba(255,107,53,0.15)`, borderRadius: 6, transform: "rotate(20deg)" }} />
        <div className="float2" style={{ position: "absolute", bottom: "25%", left: "5%", width: 50, height: 50, background: "rgba(0,212,255,0.06)", borderRadius: "50%", border: `1px solid rgba(0,212,255,0.15)` }} />

        <div style={{ maxWidth: 960, textAlign: "center", position: "relative", zIndex: 2, animation: "fadeUp 0.8s 0.3s ease both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,107,53,0.08)", border: `1px solid rgba(255,107,53,0.18)`, color: T.orange, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", padding: "8px 20px", borderRadius: 2, marginBottom: 36 }}>
            <span style={{ animation: "pulse 2s infinite" }}>◉</span>
            The Marketing Team You Can't Afford — For The Price You Can
          </div>

          <h1 className="hero-h1" style={{ fontFamily: "system-ui, sans-serif", fontWeight: 900, fontSize: 96, lineHeight: 0.95, letterSpacing: "-0.03em", color: T.text, marginBottom: 28 }}>
            WHAT A $10K/MO<br />
            <span className="shimmer">AGENCY DOES.</span><br />
            FOR $297.
          </h1>

          <p style={{ color: T.muted, fontSize: 18, lineHeight: 1.7, marginBottom: 44, maxWidth: 600, margin: "0 auto 44px" }}>
            AtlasAI runs your entire marketing operation using AI — social posts, SEO, emails, and ads — so you can focus on running your business.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("contact")} style={{ background: T.orange, color: T.bg, border: "none", padding: "17px 36px", fontFamily: "inherit", fontSize: 15, fontWeight: 800, letterSpacing: "0.04em", borderRadius: 4, transition: "all 0.25s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = `0 16px 40px rgba(255,107,53,0.45)`; }}
              onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
              Get Your Free Audit →
            </button>
            <button onClick={() => scrollTo("services")} style={{ background: "transparent", color: T.text, border: `1px solid rgba(232,226,213,0.15)`, padding: "17px 36px", fontFamily: "inherit", fontSize: 15, fontWeight: 500, borderRadius: 4, transition: "border-color 0.2s" }}
              onMouseEnter={e => e.target.style.borderColor = "rgba(232,226,213,0.4)"} onMouseLeave={e => e.target.style.borderColor = "rgba(232,226,213,0.15)"}>
              See What We Do ↓
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: T.muted, fontSize: 12, letterSpacing: "0.06em" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block", boxShadow: `0 0 8px ${T.green}` }} />
            No contracts · 48hr delivery · Cancel anytime
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: T.orange, padding: "14px 0", overflow: "hidden" }}>
        <div style={{ display: "inline-flex", animation: "ticker 20s linear infinite", whiteSpace: "nowrap" }}>
          {[...Array(2)].map((_, i) => (
            <span key={i}>
              {["AI Content Engine","SEO Domination","Ad Copywriting","Email Campaigns","Brand Strategy","Funnel Building","Social Media","Growth Systems"].map((t, j) => (
                <span key={j} style={{ fontFamily: "system-ui, sans-serif", fontWeight: 900, fontSize: 12, color: T.bg, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 24px" }}>
                  ✦ {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <section style={{ padding: "80px 32px", borderBottom: `1px solid ${T.border}` }} ref={statsRef}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="grid4">
          {[
            { value: "10", suffix: "x", label: "More Content Than Agencies" },
            { value: "48", suffix: "hr", label: "First Deliverable Turnaround" },
            { value: "297", suffix: "", label: "Starting Price Per Month ($)" },
            { value: "340", suffix: "%", label: "Avg. Engagement Increase" },
          ].map((s, i) => <StatCard key={i} {...s} inView={statsInView} />)}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ padding: "100px 32px" }}>
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <FadeSection style={{ textAlign: "center", marginBottom: 64 }}>
            <span style={overline}>What We Do</span>
            <h2 style={{ ...sectionTitle, textAlign: "center" }}>Everything A Marketing Team Does.<br /><span style={{ color: T.orange }}>Automated.</span></h2>
            <p style={{ color: T.muted, fontSize: 15, marginTop: 16 }}>One flat monthly fee. No hiring. No managing. No excuses.</p>
          </FadeSection>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="grid3">
            {SERVICES.map((s, i) => (
              <FadeSection key={i} delay={i * 0.1}>
                <TiltCard style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: "40px 32px", height: "100%", transition: "border-color 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHov} onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
                  <div style={{ fontSize: 28, color: T.orange, marginBottom: 20 }}>{s.icon}</div>
                  <h3 style={{ fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 14, letterSpacing: "-0.01em" }}>{s.title}</h3>
                  <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, marginBottom: 24 }}>{s.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {s.tags.map(t => <span key={t} style={{ fontSize: 10, fontWeight: 700, color: T.orange, background: "rgba(255,107,53,0.08)", border: `1px solid rgba(255,107,53,0.18)`, padding: "4px 10px", borderRadius: 2, letterSpacing: "0.1em", textTransform: "uppercase" }}>{t}</span>)}
                  </div>
                </TiltCard>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI CALCULATOR ── */}
      <RoiCalculator />

      {/* ── TESTIMONIALS ── */}
      <TestimonialMarquee />

      {/* ── PRICING ── */}
      <PricingToggle />

      {/* ── FAQ ── */}
      <section style={{ padding: "80px 32px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <FadeSection style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={overline}>FAQ</span>
            <h2 style={{ ...sectionTitle, textAlign: "center" }}>Questions <span style={{ color: T.orange }}>Answered.</span></h2>
          </FadeSection>
          {FAQS.map((f, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ borderBottom: `1px solid ${openFaq === i ? "rgba(255,107,53,0.25)" : T.border}`, padding: "24px 0", cursor: "none", transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 500, color: T.text, lineHeight: 1.5 }}>{f.q}</span>
                <span style={{ color: T.orange, fontSize: 22, fontWeight: 300, flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
              </div>
              {openFaq === i && <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8, marginTop: 16, animation: "fadeUp 0.3s ease" }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: "100px 32px", background: "rgba(255,107,53,0.03)", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }} className="grid2">
          <FadeSection>
            <span style={overline}>Get Started</span>
            <h2 style={sectionTitle}>Stop Losing Customers To Businesses<br /><span style={{ color: T.orange }}>With Bigger Budgets.</span></h2>
            <p style={{ color: T.muted, fontSize: 15, lineHeight: 1.8, marginTop: 20, maxWidth: 380 }}>We'll audit your entire online presence for free, show you exactly what's costing you customers, and build you a custom AI marketing plan.</p>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              {["Free 30-min strategy call","Custom AI content plan","No contracts, no pressure","Results delivered in 48 hours"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "#B0AAA0" }}>
                  <span style={{ color: T.orange }}>✓</span>{item}
                </div>
              ))}
            </div>
          </FadeSection>

          <FadeSection delay={0.15}>
            {!submitted ? (
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: 40 }}>
                {[{label:"Your Name", key:"name", placeholder:"e.g. John Smith"},{label:"Email Address",key:"email",placeholder:"john@business.com",type:"email"},{label:"Business Type",key:"business",placeholder:"e.g. Fitness Coach, Restaurant..."}].map(field => (
                  <div key={field.key} style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>{field.label}</label>
                    <input type={field.type || "text"} value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} placeholder={field.placeholder}
                      style={{ width: "100%", background: "rgba(232,226,213,0.03)", border: `1px solid ${T.border}`, color: T.text, padding: "13px 16px", borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", transition: "border-color 0.2s" }}
                      onFocus={e => e.target.style.borderColor = T.orange} onBlur={e => e.target.style.borderColor = T.border} />
                  </div>
                ))}
                <button onClick={() => form.name && form.email && setSubmitted(true)}
                  style={{ width: "100%", background: T.orange, color: T.bg, border: "none", padding: "15px 24px", fontFamily: "inherit", fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", borderRadius: 6, marginTop: 8, transition: "all 0.25s", opacity: (form.name && form.email) ? 1 : 0.4 }}
                  onMouseEnter={e => { if (form.name && form.email) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 12px 32px rgba(255,107,53,0.4)`; }}}
                  onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "none"; }}>
                  Book My Free Audit →
                </button>
                <p style={{ fontSize: 11, color: T.muted, textAlign: "center", marginTop: 12 }}>We respond within 2 hours during business hours</p>
              </div>
            ) : (
              <div style={{ background: "rgba(255,107,53,0.06)", border: `1px solid rgba(255,107,53,0.2)`, borderRadius: 10, padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 20 }}>✦</div>
                <h3 style={{ fontSize: 26, fontWeight: 900, color: T.orange, marginBottom: 12 }}>You're In!</h3>
                <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.8 }}>
                  We'll reach out to <strong style={{ color: T.text }}>{form.email}</strong> within 2 hours with your free audit and a custom AI marketing plan.
                </p>
              </div>
            )}
          </FadeSection>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "32px 40px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: T.orange }}>▲</span>
            <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "0.1em" }}>ATLAS<span style={{ color: T.orange }}>AI</span></span>
          </div>
          <p style={{ color: T.muted, fontSize: 12 }}>© 2026 AtlasAI · AI-Powered Marketing · All rights reserved</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy","Terms","Contact"].map(l => <span key={l} style={{ color: T.muted, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>{l}</span>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
