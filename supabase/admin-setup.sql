-- ============================================
-- ADMIN SETUP SCRIPT
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================

-- 1. Make altintasbulut93@gmail.com an admin
-- ============================================
UPDATE public.profiles 
SET 
  is_admin = true,
  subscription_tier = 'enterprise',
  updated_at = now()
WHERE email = 'altintasbulut93@gmail.com';

-- If profile doesn't exist yet, create it manually:
-- (Replace 'YOUR_USER_ID' with actual UUID from auth.users)
/*
INSERT INTO public.profiles (id, email, full_name, is_admin, subscription_tier)
VALUES (
  'YOUR_USER_ID'::uuid,
  'altintasbulut93@gmail.com',
  'Admin User',
  true,
  'enterprise'
)
ON CONFLICT (id) DO UPDATE
SET is_admin = true, subscription_tier = 'enterprise';
*/

-- 2. Verify admin status
-- ============================================
SELECT 
  id,
  email,
  is_admin,
  subscription_tier,
  created_at
FROM public.profiles
WHERE email = 'altintasbulut93@gmail.com';

-- 3. Check all financial models (admin view)
-- ============================================
SELECT 
  fm.id,
  fm.business_name,
  fm.sector,
  p.email as owner_email,
  fm.created_at
FROM public.financial_models fm
LEFT JOIN public.profiles p ON fm.user_id = p.id
ORDER BY fm.created_at DESC
LIMIT 10;

-- 4. Grant admin access to all existing models
-- ============================================
-- (No action needed - RLS policies already allow admin access)

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS policies on financial_models
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'financial_models';

-- Check total models count
SELECT 
  COUNT(*) as total_models,
  COUNT(DISTINCT user_id) as unique_users
FROM public.financial_models;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- If you can't see your models, check:
-- 1. Is RLS enabled?
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'financial_models';

-- 2. Do you have a profile?
SELECT * FROM public.profiles WHERE email = 'altintasbulut93@gmail.com';

-- 3. Are there any models?
SELECT COUNT(*) FROM public.financial_models;

-- 4. What's your user_id?
SELECT id, email FROM auth.users WHERE email = 'altintasbulut93@gmail.com';
