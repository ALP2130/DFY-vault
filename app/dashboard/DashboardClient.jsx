import { useState, useCallback } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#07090F",
  surface: "#0E1420",
  surfaceAlt: "#141C2E",
  border: "rgba(232,226,213,0.07)",
  borderHov: "rgba(255,107,53,0.35)",
  orange: "#FF6B35",
  cyan: "#00D4FF",
  green: "#00E5A0",
  text: "#E8E2D5",
  muted: "#586070",
  dim: "#2A3345",
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const NICHES = [
  "Restaurant / Food & Beverage","Salon / Beauty & Wellness",
  "Fitness / Gym / Personal Training","Real Estate",
  "Coaching / Consulting","E-commerce / Retail",
  "Healthcare / Medical","Legal Services",
  "Home Services / Contractor","Technology / SaaS","Other",
];
const TONES = ["Professional","Friendly & Conversational","Bold & Direct","Witty & Playful","Luxury / Premium","Educational"];
const PLATFORMS = ["Instagram","Facebook","LinkedIn","TikTok","Twitter/X","General"];

// ─── API HELPER ───────────────────────────────────────────────────────────────
async function askClaude(systemPrompt, userPrompt) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await res.json();
    return data?.content?.[0]?.text ?? "Error: could not generate content.";
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      ...s.btnGhost, fontSize: 12, padding: "6px 14px",
      color: copied ? T.green : T.muted,
      borderColor: copied ? T.green : T.border,
    }}>
      {copied ? "✓ Copied!" : "Copy"}
    </button>
  );
}

// ─── GENERATED OUTPUT BLOCK ───────────────────────────────────────────────────
function OutputBlock({ content, onSave, label }) {
  if (!content) return null;
  return (
    <div style={{ marginTop: 20, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 12, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{label}</span>
        <div style={{ display: "flex", gap: 8 }}>
          {onSave && <button onClick={onSave} style={{ ...s.btnGhost, fontSize: 12, padding: "6px 14px", color: T.orange, borderColor: "rgba(255,107,53,0.3)" }}>Save</button>}
          <CopyBtn text={content} />
        </div>
      </div>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", padding: "20px", margin: 0, fontSize: 14, lineHeight: 1.8, color: T.text, fontFamily: "inherit", background: "transparent" }}>
        {content}
      </pre>
    </div>
  );
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "40px 20px" }}>
      <div style={{
        width: 36, height: 36, border: `3px solid ${T.border}`,
        borderTop: `3px solid ${T.orange}`, borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <span style={{ color: T.muted, fontSize: 13 }}>AI is generating your content…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── INPUT COMPONENTS ─────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>{label}</label>
      {hint && <p style={{ fontSize: 12, color: T.muted, margin: "-4px 0 8px", opacity: 0.7 }}>{hint}</p>}
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, multiline }) {
  const style = { ...s.input, minHeight: multiline ? 100 : "auto", resize: multiline ? "vertical" : "none" };
  return multiline
    ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} rows={4} />
    : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={style} />;
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...s.input, cursor: "pointer", appearance: "none" }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({ name: "", niche: "", tone: "", audience: "", usp: "", goals: "" });
  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const stepContent = [
    {
      title: "What's your business?",
      subtitle: "We'll use this to personalise all your AI content.",
      fields: (
        <>
          <Field label="Business Name"><Input value={profile.name} onChange={v => set("name", v)} placeholder="e.g. Peak Performance Gym" /></Field>
          <Field label="Business Niche"><Select value={profile.niche} onChange={v => set("niche", v)} options={NICHES} placeholder="Select your niche…" /></Field>
        </>
      ),
      valid: profile.name && profile.niche,
    },
    {
      title: "Who's your audience?",
      subtitle: "The more specific, the better your content will perform.",
      fields: (
        <>
          <Field label="Target Audience" hint="Be specific — age, lifestyle, pain points"><Input value={profile.audience} onChange={v => set("audience", v)} placeholder="e.g. Busy professionals aged 30-45 who want to get fit but have no time" multiline /></Field>
          <Field label="Brand Tone"><Select value={profile.tone} onChange={v => set("tone", v)} options={TONES} placeholder="Select your tone…" /></Field>
        </>
      ),
      valid: profile.audience && profile.tone,
    },
    {
      title: "What makes you different?",
      subtitle: "Your unique advantage — we'll bake this into every piece of content.",
      fields: (
        <>
          <Field label="Unique Selling Proposition (USP)"><Input value={profile.usp} onChange={v => set("usp", v)} placeholder="e.g. The only gym offering 24/7 personal AI coaching + real trainers" /></Field>
          <Field label="Primary Business Goal"><Select value={profile.goals} onChange={v => set("goals", v)} options={["Get more leads","Increase foot traffic","Grow online sales","Build brand awareness","Launch a new product/service","Retain existing customers"]} placeholder="Select your goal…" /></Field>
        </>
      ),
      valid: profile.usp && profile.goals,
    },
  ];

  const cur = stepContent[step - 1];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 540 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: T.orange, fontSize: 20 }}>▲</span>
            <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "0.1em", color: T.text }}>ATLAS<span style={{ color: T.orange }}>AI</span></span>
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{ width: n === step ? 28 : 8, height: 4, borderRadius: 2, background: n === step ? T.orange : n < step ? "rgba(255,107,53,0.3)" : T.dim, transition: "all 0.3s ease" }} />
          ))}
        </div>

        {/* Card */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: T.text, marginBottom: 8, letterSpacing: "-0.02em" }}>{cur.title}</h2>
          <p style={{ color: T.muted, fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>{cur.subtitle}</p>
          {cur.fields}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {step > 1
              ? <button onClick={() => setStep(s => s - 1)} style={{ ...s.btnGhost, padding: "12px 24px" }}>← Back</button>
              : <div />}
            {step < 3
              ? <button onClick={() => cur.valid && setStep(s => s + 1)} style={{ ...s.btnPrimary, opacity: cur.valid ? 1 : 0.4, cursor: cur.valid ? "pointer" : "not-allowed" }}>Continue →</button>
              : <button onClick={() => cur.valid && onComplete(profile)} style={{ ...s.btnPrimary, opacity: cur.valid ? 1 : 0.4, cursor: cur.valid ? "pointer" : "not-allowed" }}>Launch My Dashboard →</button>}
          </div>
        </div>

        <p style={{ textAlign: "center", color: T.muted, fontSize: 12, marginTop: 20 }}>Step {step} of 3 · Your data stays in your browser</p>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ profile, activeTab, setActiveTab, savedCount }) {
  const navItems = [
    { id: "overview", icon: "◈", label: "Overview" },
    { id: "social", icon: "◉", label: "Social Posts" },
    { id: "blog", icon: "✦", label: "Blog Articles" },
    { id: "email", icon: "⬡", label: "Email Campaigns" },
    { id: "ads", icon: "▲", label: "Ad Copy" },
    { id: "saved", icon: "★", label: `Saved (${savedCount})` },
  ];

  return (
    <div style={{ width: 220, flexShrink: 0, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", padding: "28px 0", minHeight: "100vh" }}>
      {/* Logo */}
      <div style={{ padding: "0 24px 28px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T.orange, fontSize: 14 }}>▲</span>
          <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "0.1em", color: T.text }}>ATLAS<span style={{ color: T.orange }}>AI</span></span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "10px 12px", borderRadius: 6,
              background: activeTab === item.id ? "rgba(255,107,53,0.1)" : "transparent",
              border: "none", cursor: "pointer", textAlign: "left",
              color: activeTab === item.id ? T.orange : T.muted,
              fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400,
              marginBottom: 2, transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 11, width: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Profile card */}
      <div style={{ margin: "0 12px", padding: "14px", background: T.surfaceAlt, borderRadius: 8, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, color: T.orange, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Workspace</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4, wordBreak: "break-word" }}>{profile.name}</div>
        <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.4 }}>{profile.niche}</div>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function OverviewTab({ profile, setActiveTab, savedCount }) {
  const generators = [
    { id: "social", color: T.orange, icon: "◉", title: "Social Posts", desc: "Generate 5 ready-to-post captions for any platform" },
    { id: "blog", color: T.cyan, icon: "✦", title: "Blog Article", desc: "Full SEO article outline + intro paragraph" },
    { id: "email", color: T.green, icon: "⬡", title: "Email Campaign", desc: "Subject line + complete email body copy" },
    { id: "ads", color: "#A78BFA", icon: "▲", title: "Ad Copy", desc: "3 high-converting ad variations for any platform" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 8, letterSpacing: "-0.02em" }}>
          Welcome back, <span style={{ color: T.orange }}>{profile.name.split(" ")[0]}</span>
        </h1>
        <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6 }}>Your AI marketing engine is ready. What do you want to create today?</p>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Saved Pieces", value: savedCount, color: T.orange },
          { label: "Brand Tone", value: profile.tone.split(" ")[0], color: T.cyan },
          { label: "Goal", value: profile.goals.split(" ").slice(0, 3).join(" "), color: T.green },
        ].map((stat, i) => (
          <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 18px" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick launch */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Generate Content</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {generators.map(g => (
            <button key={g.id} onClick={() => setActiveTab(g.id)} style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "18px 20px", cursor: "pointer",
              textAlign: "left", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.background = T.surfaceAlt; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; }}
            >
              <div style={{ fontSize: 16, marginBottom: 8, color: g.color }}>{g.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>{g.title}</div>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Profile summary */}
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20, marginTop: 24 }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Your Brand Profile</div>
        {[
          { k: "Audience", v: profile.audience },
          { k: "USP", v: profile.usp },
          { k: "Goal", v: profile.goals },
        ].map(row => (
          <div key={row.k} style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 13 }}>
            <span style={{ color: T.orange, fontWeight: 600, width: 70, flexShrink: 0 }}>{row.k}</span>
            <span style={{ color: T.muted, lineHeight: 1.5, wordBreak: "break-word" }}>{row.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SOCIAL POSTS TAB ─────────────────────────────────────────────────────────
function SocialTab({ profile, onSave }) {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("Instagram");
  const [count, setCount] = useState("5");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic) return;
    setLoading(true); setOutput("");
    const sys = `You are an expert social media copywriter for ${profile.name}, a ${profile.niche} business. Brand tone: ${profile.tone}. Target audience: ${profile.audience}. USP: ${profile.usp}.`;
    const prompt = `Generate ${count} unique, high-performing ${platform} captions about: "${topic}".
Each caption should:
- Be on-brand and speak directly to: ${profile.audience}
- Include relevant hashtags (${platform === "LinkedIn" ? "3–5" : "8–12"} hashtags)
- Have a clear call-to-action
- Vary in style (question, story, tip, bold statement, testimonial-style)
Format each post clearly numbered 1, 2, 3... with a blank line between each.`;
    const result = await askClaude(sys, prompt);
    setOutput(result); setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: "-0.01em" }}>Social Posts Generator</h2>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>Generate platform-ready captions, personalised to your brand voice.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Platform"><Select value={platform} onChange={setPlatform} options={PLATFORMS} /></Field>
        <Field label="Number of Posts"><Select value={count} onChange={setCount} options={["3", "5", "7", "10"]} /></Field>
      </div>
      <Field label="Topic / Theme" hint="e.g. 'Our summer sale starts Friday' or 'Tips for getting fit without a gym'">
        <Input value={topic} onChange={setTopic} placeholder="What's this content about?" multiline />
      </Field>
      <button onClick={generate} disabled={!topic || loading} style={{ ...s.btnPrimary, opacity: (!topic || loading) ? 0.4 : 1, cursor: (!topic || loading) ? "not-allowed" : "pointer" }}>
        {loading ? "Generating…" : `Generate ${count} Posts →`}
      </button>

      {loading && <Spinner />}
      <OutputBlock content={output} label={`${count} ${platform} Posts`} onSave={() => onSave({ type: "Social Posts", platform, topic, content: output })} />
    </div>
  );
}

// ─── BLOG ARTICLES TAB ────────────────────────────────────────────────────────
function BlogTab({ profile, onSave }) {
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic) return;
    setLoading(true); setOutput("");
    const sys = `You are an expert SEO content strategist and writer for ${profile.name}, a ${profile.niche} business. Brand tone: ${profile.tone}. Target audience: ${profile.audience}.`;
    const prompt = `Create a full SEO blog article plan + intro for this topic: "${topic}"${keyword ? ` (target keyword: "${keyword}")` : ""}.

Deliver:

**ARTICLE TITLE** (SEO-optimised, compelling)

**META DESCRIPTION** (150-160 chars)

**ARTICLE OUTLINE**
- Introduction hook
- H2 sections (5-7) with brief bullet points for each
- Conclusion / CTA

**OPENING PARAGRAPH** (full 150-word intro, written in ${profile.tone} tone, speaking to: ${profile.audience})

Make the content genuinely useful, not generic. Reference the audience's specific pain points.`;
    const result = await askClaude(sys, prompt);
    setOutput(result); setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: "-0.01em" }}>Blog Article Generator</h2>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>Full SEO outline + opening paragraph, ready for you to expand.</p>

      <Field label="Article Topic" hint="e.g. '5 ways to get fit without leaving home'">
        <Input value={topic} onChange={setTopic} placeholder="What do you want to write about?" multiline />
      </Field>
      <Field label="Target SEO Keyword (optional)" hint="e.g. 'home workout for beginners'">
        <Input value={keyword} onChange={setKeyword} placeholder="Primary keyword to rank for" />
      </Field>
      <button onClick={generate} disabled={!topic || loading} style={{ ...s.btnPrimary, opacity: (!topic || loading) ? 0.4 : 1, cursor: (!topic || loading) ? "not-allowed" : "pointer" }}>
        {loading ? "Generating…" : "Generate Article Plan →"}
      </button>

      {loading && <Spinner />}
      <OutputBlock content={output} label="Blog Article Plan + Intro" onSave={() => onSave({ type: "Blog Article", topic, content: output })} />
    </div>
  );
}

// ─── EMAIL TAB ────────────────────────────────────────────────────────────────
function EmailTab({ profile, onSave }) {
  const [emailType, setEmailType] = useState("Promotional");
  const [purpose, setPurpose] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const EMAIL_TYPES = ["Promotional / Offer", "Welcome Email", "Newsletter", "Follow-up", "Re-engagement", "Product Launch", "Event Invitation"];

  const generate = async () => {
    if (!purpose) return;
    setLoading(true); setOutput("");
    const sys = `You are an expert email copywriter for ${profile.name}, a ${profile.niche} business. Brand tone: ${profile.tone}. Target audience: ${profile.audience}. USP: ${profile.usp}.`;
    const prompt = `Write a complete ${emailType} email.

Email purpose: ${purpose}

Deliver:
**SUBJECT LINE** (write 3 options — curiosity, benefit, and urgency angles)

**PREVIEW TEXT** (90 chars)

**EMAIL BODY** — full written email including:
- Personalised greeting
- Engaging opening (hook)
- Main body (clear value/message)
- Social proof element (invent a plausible testimonial if needed)
- Clear CTA (button text + urgency)
- Sign-off

Write in ${profile.tone} tone. Keep it punchy. No fluff. Aim for a 35%+ open rate and high click-through.`;
    const result = await askClaude(sys, prompt);
    setOutput(result); setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: "-0.01em" }}>Email Campaign Generator</h2>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>Full email with subject lines, body copy, and CTA — ready to send.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Email Type"><Select value={emailType} onChange={setEmailType} options={EMAIL_TYPES} /></Field>
      </div>
      <Field label="What's the email about?" hint="e.g. '20% off sale this weekend only' or 'New service launch: AI business audit'">
        <Input value={purpose} onChange={setPurpose} placeholder="Describe the purpose and key message of this email…" multiline />
      </Field>
      <button onClick={generate} disabled={!purpose || loading} style={{ ...s.btnPrimary, opacity: (!purpose || loading) ? 0.4 : 1, cursor: (!purpose || loading) ? "not-allowed" : "pointer" }}>
        {loading ? "Generating…" : "Generate Email →"}
      </button>

      {loading && <Spinner />}
      <OutputBlock content={output} label={`${emailType} Email`} onSave={() => onSave({ type: "Email", emailType, purpose, content: output })} />
    </div>
  );
}

// ─── ADS TAB ──────────────────────────────────────────────────────────────────
function AdsTab({ profile, onSave }) {
  const [adPlatform, setAdPlatform] = useState("Facebook / Instagram");
  const [offer, setOffer] = useState("");
  const [budget, setBudget] = useState("$10/day");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const AD_PLATFORMS = ["Facebook / Instagram", "Google Search", "Google Display", "LinkedIn", "TikTok", "YouTube Pre-roll"];
  const BUDGETS = ["$5/day", "$10/day", "$25/day", "$50/day", "$100/day", "$500+/mo"];

  const generate = async () => {
    if (!offer) return;
    setLoading(true); setOutput("");
    const sys = `You are a world-class performance marketing copywriter for ${profile.name}, a ${profile.niche} business. Brand tone: ${profile.tone}. Audience: ${profile.audience}. USP: ${profile.usp}.`;
    const prompt = `Write 3 complete ${adPlatform} ad variations for this offer: "${offer}"

Daily budget context: ${budget}

For each ad variation, provide:
**AD VARIATION [1/2/3] — [Strategy Name e.g. "Pain Point" / "Social Proof" / "Curiosity"]**

${adPlatform.includes("Google") ? `
- Headline 1 (30 chars max)
- Headline 2 (30 chars max)
- Headline 3 (30 chars max)
- Description 1 (90 chars max)
- Description 2 (90 chars max)
` : `
- Primary Text (hook + body, max 125 words)
- Headline (40 chars max)
- Description (25 chars max)
- CTA Button: [text]
- Hook (first 3 seconds if video/reel)
`}

Also include:
**TARGETING SUGGESTIONS** for this audience: ${profile.audience}
**WHAT TO WATCH IN METRICS** (which KPIs matter most for this offer type)`;
    const result = await askClaude(sys, prompt);
    setOutput(result); setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: "-0.01em" }}>Ad Copy Generator</h2>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>3 high-converting ad variations with targeting recommendations.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Ad Platform"><Select value={adPlatform} onChange={setAdPlatform} options={AD_PLATFORMS} /></Field>
        <Field label="Daily Budget"><Select value={budget} onChange={setBudget} options={BUDGETS} /></Field>
      </div>
      <Field label="Offer / Product / Service to Promote" hint="e.g. 'Free trial of our AI marketing tool — no credit card needed'">
        <Input value={offer} onChange={setOffer} placeholder="Describe what you're promoting and the key offer or benefit…" multiline />
      </Field>
      <button onClick={generate} disabled={!offer || loading} style={{ ...s.btnPrimary, opacity: (!offer || loading) ? 0.4 : 1, cursor: (!offer || loading) ? "not-allowed" : "pointer" }}>
        {loading ? "Generating…" : "Generate 3 Ad Variations →"}
      </button>

      {loading && <Spinner />}
      <OutputBlock content={output} label={`3 ${adPlatform} Ad Variations`} onSave={() => onSave({ type: "Ad Copy", adPlatform, offer, content: output })} />
    </div>
  );
}

// ─── SAVED TAB ────────────────────────────────────────────────────────────────
function SavedTab({ saved, onDelete }) {
  if (!saved.length) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>★</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>No saved content yet</h3>
      <p style={{ color: T.muted, fontSize: 14 }}>Generate content and click "Save" to store it here.</p>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6, letterSpacing: "-0.01em" }}>Saved Content</h2>
      <p style={{ color: T.muted, fontSize: 14, marginBottom: 28 }}>{saved.length} saved piece{saved.length !== 1 ? "s" : ""}.</p>
      {saved.map((item, i) => (
        <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.orange, letterSpacing: "0.08em", textTransform: "uppercase" }}>{item.type}</span>
              {item.topic && <span style={{ fontSize: 12, color: T.muted, marginLeft: 10 }}>— {item.topic?.slice(0, 60)}{item.topic?.length > 60 ? "…" : ""}</span>}
              {item.offer && <span style={{ fontSize: 12, color: T.muted, marginLeft: 10 }}>— {item.offer?.slice(0, 60)}{item.offer?.length > 60 ? "…" : ""}</span>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <CopyBtn text={item.content} />
              <button onClick={() => onDelete(i)} style={{ ...s.btnGhost, fontSize: 12, padding: "6px 14px", color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" }}>Delete</button>
            </div>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", padding: "16px 18px", margin: 0, fontSize: 13, lineHeight: 1.7, color: T.muted, fontFamily: "inherit", maxHeight: 200, overflow: "auto" }}>
            {item.content}
          </pre>
        </div>
      ))}
    </div>
  );
}

// ─── DASHBOARD SHELL ──────────────────────────────────────────────────────────
function Dashboard({ profile }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [saved, setSaved] = useState([]);

  const saveContent = useCallback((item) => {
    setSaved(prev => [{ ...item, savedAt: new Date().toLocaleDateString() }, ...prev]);
  }, []);

  const deleteContent = useCallback((idx) => {
    setSaved(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const tabProps = { profile, onSave: saveContent };

  const tabs = {
    overview: <OverviewTab {...tabProps} setActiveTab={setActiveTab} savedCount={saved.length} />,
    social: <SocialTab {...tabProps} />,
    blog: <BlogTab {...tabProps} />,
    email: <EmailTab {...tabProps} />,
    ads: <AdsTab {...tabProps} />,
    saved: <SavedTab saved={saved} onDelete={deleteContent} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif", color: T.text }}>
      <Sidebar profile={profile} activeTab={activeTab} setActiveTab={setActiveTab} savedCount={saved.length} />
      <main style={{ flex: 1, padding: "40px 44px", overflowY: "auto", minWidth: 0 }}>
        <div style={{ maxWidth: 720 }}>
          {tabs[activeTab] || tabs.overview}
        </div>
      </main>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AtlasApp() {
  const [profile, setProfile] = useState(null);
  if (!profile) return <Onboarding onComplete={setProfile} />;
  return <Dashboard profile={profile} />;
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const s = {
  btnPrimary: {
    background: T.orange, color: "#080C14", border: "none",
    padding: "13px 28px", fontWeight: 700, fontSize: 14,
    letterSpacing: "0.04em", borderRadius: 6, cursor: "pointer",
    fontFamily: "inherit", transition: "opacity 0.2s",
  },
  btnGhost: {
    background: "transparent", color: T.muted,
    border: `1px solid ${T.border}`,
    padding: "10px 20px", fontWeight: 500, fontSize: 14,
    borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
    transition: "all 0.2s",
  },
  input: {
    background: T.surface, border: `1px solid ${T.border}`,
    color: T.text, fontFamily: "inherit", fontSize: 14,
    padding: "12px 16px", borderRadius: 6, width: "100%",
    outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
};
