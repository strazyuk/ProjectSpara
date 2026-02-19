-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (from Module 5.1)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- Turn on RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Transactions table (Module 5.2)
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  plaid_transaction_id text unique,
  name text,
  merchant_name text,
  amount decimal(10,2),
  date date,
  category text,
  raw_json jsonb,
  created_at timestamp with time zone default now()
);

-- Turn on RLS
alter table public.transactions enable row level security;

-- Policies for transactions
create policy "Users can view their own transactions." on public.transactions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions." on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Service role can manage all transactions." on public.transactions
  for all using (true);
