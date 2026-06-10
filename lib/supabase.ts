import {
  createBrowserClient as _createBrowserClient,
  createServerClient as _createServerClient,
} from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Types ─────────────────────────────────────────────────────────────────────
export type Profile = {
  id: string;
  email: string;
  business_name: string | null;
  niche: string | null;
  tone: string | null;
  audience: string | null;
  usp: string | null;
  goals: string | null;
  plan: "free" | "starter" | "growth" | "agency";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string;
  generations_used: number;
  generations_limit: number;
  onboarding_complete: boolean;
};

export type SavedContent = {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  topic: string | null;
  platform: string | null;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

// ── Client component client (use in "use client" components) ─────────────────
export const createBrowserClient = () =>
  _createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Server component client (use in Server Components + Route Handlers) ──────
export const createServerClient = () => {
  const cookieStore = cookies();
  return _createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server Components can't set cookies — safe to ignore
          }
        });
      },
    },
  });
};

// ── Admin client (service role — for webhooks ONLY, never expose to browser) ─
export const createAdminClient = () =>
  createClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// ── Plan limits helper ────────────────────────────────────────────────────────
export const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 30,
  growth: 100,
  agency: -1, // unlimited
};

export const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  growth: "Growth",
  agency: "Agency",
};

export function canGenerate(profile: Profile): boolean {
  if (profile.plan === "agency") return true;
  return profile.generations_used < profile.generations_limit;
}

export function generationsLeft(profile: Profile): number {
  if (profile.plan === "agency") return Infinity;
  return Math.max(0, profile.generations_limit - profile.generations_used);
}
