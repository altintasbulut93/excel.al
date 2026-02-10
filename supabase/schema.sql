
-- Users Table (Managed by Supabase Auth usually, but here is a custom profile table)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Financial Models Table
create table if not exists public.financial_models (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id), -- Optional for anonymous initially
  business_name text not null,
  sector text not null,
  inputs jsonb not null, -- The entire input state
  outputs jsonb,         -- Calculated results (optional, can be re-calculated)
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS Policies (Row Level Security)
alter table public.financial_models enable row level security;

-- Policy: Anyone can insert (For MVP simplicity, normally restricted to owner)
create policy "Public can create models" 
on public.financial_models for insert with check (true);

-- Policy: Anyone can read public models (For MVP simplicity)
create policy "Public models are viewable by everyone" 
on public.financial_models for select using (true);

-- Indexes
create index if not exists idx_models_user_id on public.financial_models(user_id);
