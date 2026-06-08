"use client";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const T = { bg: "#07090F", surface: "#0E1420", border: "rgba(232,226,213,0.07)", orange: "#FF6B35", text: "#E8E2D5", muted: "#586070" };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createBrowserClient();
  const router = useRouter();

  const handle = async () => {
    setLoading(true); setError(""); setSuccess("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Check your email to confirm your account, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const googleAuth = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/dashboard` },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: T.orange, fontSize: 20 }}>▲</span>
            <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: "0.1em", color: T.text }}>
              ATLAS<span style={{ color: T.orange }}>AI</span>
            </span>
          </a>
        </div>

        {/* Card */}
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 6 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ color: T.muted, fontSize: 13, marginBottom: 28 }}>
            {mode === "login" ? "Log in to your marketing dashboard." : "Start generating AI content in minutes."}
          </p>

          {/* Google OAuth */}
          <button onClick={googleAuth} style={{ ...btn, background: "rgba(232,226,213,0.05)", border: `1px solid ${T.border}`, color: T.text, width: "100%", marginBottom: 20, gap: 10 }}>
            <span style={{ fontSize: 16 }}>G</span> Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: T.border }} />
            <span style={{ color: T.muted, fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: T.border }} />
          </div>

          {/* Email + Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com" style={inputStyle} onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" style={inputStyle} onKeyDown={e => e.key === "Enter" && handle()} />
          </div>

          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 16 }}>{error}</div>}
          {success && <div style={{ background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.3)", color: "#00E5A0", fontSize: 13, padding: "10px 14px", borderRadius: 6, marginBottom: 16 }}>{success}</div>}

          <button onClick={handle} disabled={loading || !email || !password} style={{ ...btn, background: T.orange, color: "#080C14", width: "100%", fontWeight: 700, opacity: (loading || !email || !password) ? 0.5 : 1 }}>
            {loading ? "Please wait…" : mode === "login" ? "Log In →" : "Create Account →"}
          </button>
        </div>

        <p style={{ textAlign: "center", color: T.muted, fontSize: 13, marginTop: 20 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
            style={{ background: "none", border: "none", color: T.orange, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {mode === "login" ? "Sign up free" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "12px 24px", borderRadius: 6, border: "none",
  cursor: "pointer", fontSize: 14, fontFamily: "inherit", transition: "opacity 0.2s",
};
const inputStyle: React.CSSProperties = {
  width: "100%", background: "rgba(232,226,213,0.04)", border: "1px solid rgba(232,226,213,0.07)",
  color: "#E8E2D5", padding: "12px 14px", borderRadius: 6, fontSize: 14,
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "#586070", marginBottom: 8,
};
