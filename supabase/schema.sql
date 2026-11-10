-- ============================================================
-- BALLEN STANDARDIZED DATABASE SCHEMA & RLS POLICIES
-- ============================================================

-- 1. WAITLIST TABLE (One Account Per Email AND Number)
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  guess text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist
alter table public.waitlist add column if not exists phone text;
alter table public.waitlist add column if not exists guess text;
alter table public.waitlist add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Clean up any duplicate test rows before applying unique constraints (keeps latest)
delete from public.waitlist a
using public.waitlist b
where a.created_at < b.created_at
  and (
    lower(trim(a.email)) = lower(trim(b.email))
    or regexp_replace(a.phone, '\D', '', 'g') = regexp_replace(b.phone, '\D', '', 'g')
  );

-- Enforce strictly 1 account per email AND 1 account per phone number
drop index if exists waitlist_email_unique;
create unique index waitlist_email_unique on public.waitlist (lower(trim(email)));

drop index if exists waitlist_phone_unique;
create unique index waitlist_phone_unique on public.waitlist (regexp_replace(phone, '\D', '', 'g'));

-- Enable RLS for waitlist
alter table public.waitlist enable row level security;

-- Policies: allow anonymous & authenticated visitors to read, insert, and update their account
drop policy if exists "Allow public waitlist lookup" on public.waitlist;
create policy "Allow public waitlist lookup"
  on public.waitlist
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow anonymous waitlist insertion" on public.waitlist;
drop policy if exists "Allow public waitlist insertion" on public.waitlist;
create policy "Allow public waitlist insertion"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow anonymous waitlist update on email match" on public.waitlist;
drop policy if exists "Allow public waitlist update" on public.waitlist;
create policy "Allow public waitlist update"
  on public.waitlist
  for update
  to anon, authenticated
  using (true)
  with check (true);


-- 2. SCORES TABLE (Leaderboard — 1 Highest Score Per Account)
create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  player_name text not null,
  player_email text,
  player_phone text,
  score integer not null check (score >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure columns exist
alter table public.scores add column if not exists player_email text;
alter table public.scores add column if not exists player_phone text;
alter table public.scores add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Clean up any duplicate test rows on scores before applying constraints (keeps highest score)
delete from public.scores a
using public.scores b
where (a.score < b.score or (a.score = b.score and a.created_at < b.created_at))
  and (
    (a.player_email is not null and b.player_email is not null and lower(trim(a.player_email)) = lower(trim(b.player_email)))
    or (a.player_phone is not null and b.player_phone is not null and regexp_replace(a.player_phone, '\D', '', 'g') = regexp_replace(b.player_phone, '\D', '', 'g'))
  );

-- Enforce 1 score record per account
drop index if exists scores_email_unique;
create unique index scores_email_unique on public.scores (lower(trim(player_email)))
  where player_email is not null and player_email <> '';

drop index if exists scores_phone_unique;
create unique index scores_phone_unique on public.scores (regexp_replace(player_phone, '\D', '', 'g'))
  where player_phone is not null and player_phone <> '';

-- Fast leaderboard index
create index if not exists scores_score_idx on public.scores (score desc, created_at asc);

-- Enable RLS for scores
alter table public.scores enable row level security;

-- Policies: allow public reading (CRITICAL so every device/tab sees the live leaderboard)
drop policy if exists "Allow public score reading" on public.scores;
create policy "Allow public score reading"
  on public.scores
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow anonymous score insertion" on public.scores;
drop policy if exists "Allow public score insertion" on public.scores;
create policy "Allow public score insertion"
  on public.scores
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow anonymous score update" on public.scores;
drop policy if exists "Allow public score update" on public.scores;
create policy "Allow public score update"
  on public.scores
  for update
  to anon, authenticated
  using (true)
  with check (true);
