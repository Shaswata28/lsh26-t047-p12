-- ============================================================
-- Personal Ledger Manager – Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── profiles ────────────────────────────────────────────────
create table if not exists profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null unique,
  name            text,
  monthly_salary  numeric(12,2) not null default 0,
  currency        text not null default 'BDT',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

-- ── expenses ────────────────────────────────────────────────
create table if not exists expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  amount       numeric(12,2) not null,
  date         date not null,
  shop         text,
  category     text not null default 'Other',
  notes        text,
  receipt_url  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index expenses_user_date on expenses(user_id, date desc);

alter table expenses enable row level security;

create policy "Users can view own expenses"
  on expenses for select using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on expenses for insert with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on expenses for update using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on expenses for delete using (auth.uid() = user_id);

-- ── pockets ─────────────────────────────────────────────────
create table if not exists pockets (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete cascade not null,
  name                  text not null,
  target_amount         numeric(12,2) not null,
  item_details          text,
  monthly_contribution  numeric(12,2) not null,
  saved_amount          numeric(12,2) not null default 0,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table pockets enable row level security;

create policy "Users can view own pockets"
  on pockets for select using (auth.uid() = user_id);

create policy "Users can insert own pockets"
  on pockets for insert with check (auth.uid() = user_id);

create policy "Users can update own pockets"
  on pockets for update using (auth.uid() = user_id);

create policy "Users can delete own pockets"
  on pockets for delete using (auth.uid() = user_id);

-- ── pocket_contributions ─────────────────────────────────────
create table if not exists pocket_contributions (
  id         uuid primary key default gen_random_uuid(),
  pocket_id  uuid references pockets(id) on delete cascade not null,
  user_id    uuid references auth.users(id) on delete cascade not null,
  amount     numeric(12,2) not null,
  date       date not null,
  notes      text,
  created_at timestamptz not null default now()
);

alter table pocket_contributions enable row level security;

create policy "Users can view own contributions"
  on pocket_contributions for select using (auth.uid() = user_id);

create policy "Users can insert own contributions"
  on pocket_contributions for insert with check (auth.uid() = user_id);

create policy "Users can delete own contributions"
  on pocket_contributions for delete using (auth.uid() = user_id);

-- ── Storage bucket for receipts ──────────────────────────────
insert into storage.buckets (id, name, public)
  values ('receipts', 'receipts', false)
  on conflict do nothing;

create policy "Users upload own receipts"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users view own receipts"
  on storage.objects for select
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own receipts"
  on storage.objects for delete
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

-- ── updated_at trigger ───────────────────────────────────────
create or replace function set_updated_at()
  returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger expenses_updated_at
  before update on expenses
  for each row execute function set_updated_at();

create trigger pockets_updated_at
  before update on pockets
  for each row execute function set_updated_at();
