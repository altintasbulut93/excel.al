-- ============================================
-- FIX RLS ACCESS FOR USER
-- Email: altintasbulut93@gmail.com
-- ============================================

-- Step 1: Check if user exists in auth.users
-- Run this first to get the user_id
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'altintasbulut93@gmail.com';

-- Step 2: Create or update profile (use the ID from Step 1)
-- IMPORTANT: Replace 'USER_ID_HERE' with the actual UUID from Step 1
INSERT INTO public.profiles (id, email, full_name, is_admin, subscription_tier)
VALUES (
  'USER_ID_HERE', -- Replace with actual user ID
  'altintasbulut93@gmail.com',
  'Bulut Altıntaş',
  TRUE, -- Set as admin for full access
  'enterprise'
)
ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  is_admin = TRUE,
  subscription_tier = 'enterprise',
  updated_at = NOW();

-- Step 3: Verify profile was created/updated
SELECT id, email, is_admin, subscription_tier, created_at
FROM public.profiles
WHERE email = 'altintasbulut93@gmail.com';

-- Step 4: Check existing financial models
SELECT id, business_name, user_id, created_at
FROM public.financial_models
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Drop existing RLS policies (to recreate them fresh)
DROP POLICY IF EXISTS "Users can view own models" ON public.financial_models;
DROP POLICY IF EXISTS "Authenticated users can create models" ON public.financial_models;
DROP POLICY IF EXISTS "Users can update own models" ON public.financial_models;
DROP POLICY IF EXISTS "Users can delete own models" ON public.financial_models;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Step 6: Create NEW RLS policies with better logic
-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Financial Models Policies
CREATE POLICY "Users can view own models"
  ON public.financial_models FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Authenticated users can create models"
  ON public.financial_models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own models"
  ON public.financial_models FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Users can delete own models"
  ON public.financial_models FOR DELETE
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Step 7: ALTERNATIVE - Temporary Full Access Policy (if above doesn't work)
-- This gives FULL access to specific email - USE WITH CAUTION
/*
CREATE POLICY "Full access for specific user"
  ON public.financial_models FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'altintasbulut93@gmail.com'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE email = 'altintasbulut93@gmail.com'
    )
  );
*/

-- Step 8: Verify policies are active
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'financial_models'
ORDER BY policyname;

-- Step 9: Test query (should return all models if logged in as altintasbulut93@gmail.com)
-- Run this while logged in to the app
SELECT 
  id, 
  business_name, 
  sector,
  total_revenue,
  total_profit,
  created_at
FROM public.financial_models
ORDER BY created_at DESC;

-- ============================================
-- TROUBLESHOOTING QUERIES
-- ============================================

-- Check current user
SELECT auth.uid(), auth.email();

-- Check if profile exists for current user
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'financial_models');

-- Count models by user
SELECT user_id, COUNT(*) as model_count
FROM public.financial_models
GROUP BY user_id;
