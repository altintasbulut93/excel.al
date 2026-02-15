-- ============================================
-- FIX ADMIN & LOGIN ISSUES (UPDATED)
-- ============================================

-- 1. Auto-confirm the user's email (Fixes "Login failed" if email not confirmed)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'altintasbulut28@gmail.com';

-- 2. Ensure Profile Exists (Fixes missing profile issue)
-- Also ensures metadata is set
INSERT INTO public.profiles (id, email, full_name, is_admin, subscription_tier)
SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name',
    TRUE, -- Force Admin
    'enterprise' -- Force Enterprise
FROM auth.users
WHERE email = 'altintasbulut28@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
    is_admin = TRUE, 
    subscription_tier = 'enterprise';

-- 3. Verify Result
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'altintasbulut28@gmail.com';
SELECT email, is_admin, subscription_tier FROM public.profiles WHERE email = 'altintasbulut28@gmail.com';
