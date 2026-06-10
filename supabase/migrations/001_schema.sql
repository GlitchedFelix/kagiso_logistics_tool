-- ================================================================
-- DriveLedger Schema
-- Run this in your Supabase SQL editor
-- ================================================================

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text,
  platform      text not null default 'Uber',
  city          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Subscriptions
create table if not exists public.subscriptions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  status                text not null default 'trialing',
  plan                  text not null default 'monthly',
  amount_cents          integer not null default 9900,
  currency              text not null default 'ZAR',
  payfast_token         text,
  payfast_payment_id    text,
  trial_ends_at         timestamptz,
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint subscriptions_user_unique unique (user_id)
);

-- Trips
create table if not exists public.trips (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  trip_date        date not null,
  platform         text not null default 'Uber',
  earnings         numeric(10,2) not null default 0,
  tip              numeric(10,2) not null default 0,
  bonus            numeric(10,2) not null default 0,
  platform_fee     numeric(10,2) not null default 0,
  duration_minutes integer,
  distance_km      numeric(8,2),
  trip_ref         text,
  notes            text,
  created_at       timestamptz not null default now()
);

-- Expenses
create table if not exists public.expenses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  expense_date   date not null,
  category       text not null default 'Fuel',
  amount         numeric(10,2) not null,
  description    text,
  created_at     timestamptz not null default now()
);

-- Saved date ranges
create table if not exists public.saved_date_ranges (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  label      text not null,
  start_date date not null,
  end_date   date not null,
  created_at timestamptz not null default now()
);

-- Auto-update updated_at on profiles and subscriptions
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- Auto-create profile + subscription on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.subscriptions (user_id, status, trial_ends_at)
  values (new.id, 'trialing', now() + interval '7 days');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
