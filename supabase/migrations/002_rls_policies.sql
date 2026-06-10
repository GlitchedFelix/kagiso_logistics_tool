-- ================================================================
-- Row Level Security Policies
-- Every user can only access their own data
-- ================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.trips enable row level security;
alter table public.expenses enable row level security;
alter table public.saved_date_ranges enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Subscriptions
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id);

-- Trips
create policy "Users can view own trips"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on public.trips for update
  using (auth.uid() = user_id);

create policy "Users can delete own trips"
  on public.trips for delete
  using (auth.uid() = user_id);

-- Expenses
create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);

-- Saved date ranges
create policy "Users can manage own saved ranges"
  on public.saved_date_ranges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
