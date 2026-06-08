import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient, createAdminClient, canGenerate } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

// ── Rate limit store (in-memory, resets on cold start) ────────────────────────
const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const maxPerMinute = 5;

  const entry = rateLimit.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(userId, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth check ───────────────────────────────────────────────────────
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Load profile + check generation limit ────────────────────────────
    const admin = createAdminClient();
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!canGenerate(profile)) {
      return NextResponse.json(
        { error: "Generation limit reached", upgrade: true },
        { status: 403 }
      );
    }

    // ── 3. Rate limit ───────────────────────────────────────────────────────
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute." },
        { status: 429 }
      );
    }

    // ── 4. Parse request body ───────────────────────────────────────────────
    const { systemPrompt, userPrompt, type } = await req.json();

    if (!systemPrompt || !userPrompt || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── 5. Call Claude ──────────────────────────────────────────────────────
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    // ── 6. Increment usage counter + log generation ─────────────────────────
    await Promise.all([
      admin
        .from("profiles")
        .update({ generations_used: profile.generations_used + 1 })
        .eq("id", user.id),
      admin
        .from("generation_log")
        .insert({ user_id: user.id, type, tokens_used: tokensUsed }),
    ]);

    return NextResponse.json({ text, tokensUsed });

  } catch (err) {
    console.error("[generate] error:", err);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
