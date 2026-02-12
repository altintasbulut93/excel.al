-- ============================================
-- EXCEL.AL - SUPABASE DATABASE SCHEMA
-- Updated with proper RLS policies and admin support
-- ============================================

-- 1. PROFILES TABLE (User metadata)
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text unique,
  full_name text,
  avatar_url text,
  is_admin boolean default false,  -- Admin flag
  subscription_tier text default 'free', -- 'free', 'pro', 'enterprise'
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- 2. FINANCIAL MODELS TABLE
-- ============================================
create table if not exists public.financial_models (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  business_name text not null,
  sector text not null,
  inputs jsonb not null,
  outputs jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.financial_models enable row level security;

-- RLS Policies for financial_models

-- SELECT: Users can read their own models OR admins can read all
create policy "Users can view own models"
  on public.financial_models for select
  using (
    auth.uid() = user_id 
    OR 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- INSERT: Authenticated users can create models
create policy "Authenticated users can create models"
  on public.financial_models for insert
  with check (auth.uid() = user_id);

-- UPDATE: Users can update their own models OR admins can update all
create policy "Users can update own models"
  on public.financial_models for update
  using (
    auth.uid() = user_id 
    OR 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- DELETE: Users can delete their own models OR admins can delete all
create policy "Users can delete own models"
  on public.financial_models for delete
  using (
    auth.uid() = user_id 
    OR 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- 3. INDEXES for performance
-- ============================================
create index if not exists idx_models_user_id on public.financial_models(user_id);
create index if not exists idx_models_created_at on public.financial_models(created_at desc);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_is_admin on public.profiles(is_admin) where is_admin = true;

-- 4. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update timestamp function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_updated_at_models on public.financial_models;
create trigger set_updated_at_models
  before update on public.financial_models
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- ADMIN SETUP
-- ============================================
-- Run this AFTER creating your user account:
-- 
-- UPDATE public.profiles 
-- SET is_admin = true, subscription_tier = 'enterprise'
-- WHERE email = 'altintasbulut93@gmail.com';
-- ============================================
