-- Subscriptions Table (Module 5.3)
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  amount decimal(10,2),
  currency text default 'USD',
  frequency text, -- 'monthly', 'yearly', etc.
  category text,
  merchant_name text,
  is_active boolean default true,
  detected_at timestamp with time zone default now(),
  next_billing_date date,
  created_at timestamp with time zone default now()
);

-- Turn on RLS
alter table public.subscriptions enable row level security;

-- Policies for subscriptions
create policy "Users can view their own subscriptions." on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can update their own subscriptions." on public.subscriptions
  for update using (auth.uid() = user_id);

create policy "Service role can manage all subscriptions." on public.subscriptions
  for all using (true);
