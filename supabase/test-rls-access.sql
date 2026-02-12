-- ============================================
-- RLS ACCESS TEST SCRIPT
-- Run these queries to verify RLS is working
-- ============================================

-- TEST 1: Check current authenticated user
SELECT 
  auth.uid() as current_user_id,
  auth.email() as current_email;

-- TEST 2: Check if profile exists for current user
SELECT 
  id,
  email,
  full_name,
  is_admin,
  subscription_tier,
  created_at
FROM public.profiles
WHERE id = auth.uid();

-- TEST 3: Check all profiles (should work if admin)
SELECT 
  id,
  email,
  is_admin,
  subscription_tier,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- TEST 4: Check financial models for current user
SELECT 
  id,
  business_name,
  sector,
  user_id,
  total_revenue,
  total_profit,
  created_at
FROM public.financial_models
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- TEST 5: Check ALL financial models (should work if admin)
SELECT 
  fm.id,
  fm.business_name,
  fm.sector,
  fm.user_id,
  p.email as owner_email,
  fm.total_revenue,
  fm.total_profit,
  fm.created_at
FROM public.financial_models fm
LEFT JOIN public.profiles p ON fm.user_id = p.id
ORDER BY fm.created_at DESC;

-- TEST 6: Count models by user
SELECT 
  p.email,
  COUNT(fm.id) as model_count
FROM public.profiles p
LEFT JOIN public.financial_models fm ON p.id = fm.user_id
GROUP BY p.email
ORDER BY model_count DESC;

-- TEST 7: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_status,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as check_status
FROM pg_policies
WHERE tablename IN ('profiles', 'financial_models')
ORDER BY tablename, policyname;

-- TEST 8: Verify RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'financial_models', 'scenario_templates');

-- ============================================
-- EXPECTED RESULTS
-- ============================================

/*
TEST 1: Should return your user ID and email
TEST 2: Should return your profile with is_admin = TRUE
TEST 3: Should return all profiles (if admin) or just yours (if not admin)
TEST 4: Should return your financial models
TEST 5: Should return ALL models with owner emails (if admin)
TEST 6: Should show model counts per user
TEST 7: Should list all active RLS policies
TEST 8: Should show rls_enabled = true for all tables
*/

-- ============================================
-- IF TESTS FAIL, RUN THIS EMERGENCY FIX
-- ============================================

-- Emergency: Disable RLS temporarily (NOT RECOMMENDED FOR PRODUCTION)
-- ALTER TABLE public.financial_models DISABLE ROW LEVEL SECURITY;

-- Emergency: Re-enable RLS
-- ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;

-- Emergency: Grant direct access (VERY DANGEROUS - ONLY FOR TESTING)
-- GRANT ALL ON public.financial_models TO authenticated;
