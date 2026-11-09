-- ============================================================
-- BALLEN DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ============================================================

-- 1. WAITLIST TABLE
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text not null,
  guess text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for waitlist
alter table public.waitlist enable row level security;

-- Allow anyone (anon) to submit to the waitlist
create policy "Allow anonymous waitlist insertion"
  on public.waitlist
  for insert
  to anon
  with check (true);

-- Allow upsert for anonymous users so users can update their guess/phone
create policy "Allow anonymous waitlist update on email match"
  on public.waitlist
  for update
  to anon
  using (true)
  with check (true);

-- 2. SCORES TABLE (LEADERBOARD)
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  player_email text unique,
  score integer not null check (score >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- In case table already exists without player_email:
alter table public.scores add column if not exists player_email text unique;

-- Indexes for lightning-fast leaderboard queries
create index if not exists scores_score_idx on public.scores (score desc, created_at asc);

-- Enable RLS for scores
alter table public.scores enable row level security;

-- Allow anyone to view scores
create policy "Allow public score reading"
  on public.scores
  for select
  to anon, authenticated
  using (true);

-- Allow anyone to submit scores
create policy "Allow anonymous score insertion"
  on public.scores
  for insert
  to anon, authenticated
  with check (true);

-- Allow anonymous score update (to replace their existing score when sharing again)
create policy "Allow anonymous score update"
  on public.scores
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- 3. ENABLE SUPABASE REALTIME REPLICATION FOR LIVE LEADERBOARD
alter publication supabase_realtime add table public.scores;
