-- ============================================
-- 1. ENSURE PROFILES TABLE EXISTS
-- ============================================
-- ... (rest of the table creation logic is same as before if needed)

-- ============================================
-- 5. MAKE USER ADMIN (UPDATED)
-- ============================================
UPDATE public.profiles
SET 
  is_admin = TRUE,
  subscription_tier = 'enterprise'
WHERE email = 'altintasbulut28@gmail.com';

-- ============================================
-- 6. VERIFICATION
-- ============================================
SELECT email, is_admin, subscription_tier FROM public.profiles WHERE email = 'altintasbulut28@gmail.com';
