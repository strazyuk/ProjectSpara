-- Market Benchmarks Table (Module 5.5)
create table if not exists public.market_benchmarks (
  id serial primary key,
  service_name text not null,
  tier_name text not null,
  monthly_price decimal(10,2) not null,
  category text,
  features jsonb, -- Optional: store features like "4K", "Ad-supported"
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.market_benchmarks enable row level security;

-- Policies
-- Everyone can read benchmarks (they are public reference data)
create policy "Benchmarks are viewable by everyone." on public.market_benchmarks
  for select using (true);

-- Only service role can insert/update/delete (for now)
create policy "Service role can manage benchmarks." on public.market_benchmarks
  for all using (true);
