-- ═══════════════════════════════════════════════════════════════════
-- ATLASAI — SUPABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. PROFILES ─────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with business profile data
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  email           text,
  business_name   text,
  niche           text,
  tone            text,
  audience        text,
  usp             text,
  goals           text,
  plan            text default 'free',     -- 'free' | 'starter' | 'growth' | 'agency'
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive', -- 'active' | 'inactive' | 'canceled' | 'past_due'
  generations_used integer default 0,
  generations_limit integer default 5,     -- free = 5, starter = 30, growth = 100, agency = -1 (unlimited)
  onboarding_complete boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. SAVED CONTENT ────────────────────────────────────────────────────────
create table if not exists public.saved_content (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  type        text not null,           -- 'social' | 'blog' | 'email' | 'ads'
  title       text,
  topic       text,
  platform    text,
  content     text not null,
  metadata    jsonb default '{}',
  created_at  timestamptz default now()
);

-- ── 3. GENERATION LOG ────────────────────────────────────────────────────────
-- Track every AI generation for usage billing + analytics
create table if not exists public.generation_log (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  type        text not null,
  tokens_used integer default 0,
  created_at  timestamptz default now()
);

-- ── 4. ROW LEVEL SECURITY (RLS) ──────────────────────────────────────────────
-- Users can only see their own data
alter table public.profiles enable row level security;
alter table public.saved_content enable row level security;
alter table public.generation_log enable row level security;

-- Profiles: users read/update only their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Saved content: full CRUD on own content
create policy "Users can manage own content"
  on public.saved_content for all using (auth.uid() = user_id);

-- Generation log: users can insert + view own logs
create policy "Users can view own logs"
  on public.generation_log for select using (auth.uid() = user_id);
create policy "Users can insert own logs"
  on public.generation_log for insert with check (auth.uid() = user_id);

-- Service role can do everything (for webhooks + server actions)
create policy "Service role full access profiles"
  on public.profiles for all using (auth.role() = 'service_role');
create policy "Service role full access content"
  on public.saved_content for all using (auth.role() = 'service_role');

-- ── 5. INDEXES ───────────────────────────────────────────────────────────────
create index if not exists idx_saved_content_user_id on public.saved_content(user_id);
create index if not exists idx_saved_content_type on public.saved_content(type);
create index if not exists idx_generation_log_user_id on public.generation_log(user_id);
create index if not exists idx_profiles_stripe_customer on public.profiles(stripe_customer_id);

-- ── 6. PLAN LIMITS FUNCTION ──────────────────────────────────────────────────
-- Call this to set limits when a user upgrades
create or replace function public.set_plan_limits(
  user_id uuid,
  new_plan text
) returns void as $$
begin
  update public.profiles set
    plan = new_plan,
    generations_limit = case new_plan
      when 'free'    then 5
      when 'starter' then 30
      when 'growth'  then 100
      when 'agency'  then -1   -- unlimited
      else 5
    end,
    updated_at = now()
  where id = user_id;
end;
$$ language plpgsql security definer;

-- ── 7. UPDATED_AT TRIGGER ─────────────────────────────────────────────────────
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- ✅ Schema complete. Copy this entire file into Supabase SQL Editor and Run.
-- ═══════════════════════════════════════════════════════════════════
