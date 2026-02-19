-- Bargain Cache Table (Module 5.5 Optimization)
create table if not exists public.bargain_cache (
  user_id uuid references auth.users(id) on delete cascade primary key,
  data jsonb,
  last_checked_at timestamp with time zone default now(),
  is_rate_limited boolean default false
);

-- Enable RLS
alter table public.bargain_cache enable row level security;

-- Policies
create policy "Users can view their own bargain cache." on public.bargain_cache
  for select using (auth.uid() = user_id);

create policy "Service role can manage all bargain cache." on public.bargain_cache
  for all using (true);
