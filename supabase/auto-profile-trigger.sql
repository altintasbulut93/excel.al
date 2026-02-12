-- ============================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- This ensures every user gets a profile automatically
-- ============================================

-- Step 1: Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Backfill existing users (create profiles for users without profiles)
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 4: Grant admin access to specific user
UPDATE public.profiles
SET 
  is_admin = TRUE,
  subscription_tier = 'enterprise',
  updated_at = NOW()
WHERE email = 'altintasbulut93@gmail.com';

-- Step 5: Verify the update
SELECT id, email, is_admin, subscription_tier, created_at
FROM public.profiles
WHERE email = 'altintasbulut93@gmail.com';
