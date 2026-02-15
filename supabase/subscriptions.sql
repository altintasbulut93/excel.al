-- ==============================================================================
-- SUBSCRIPTIONS TABLE
-- Tracks Stripe subscription status for each user
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_status TEXT, -- 'active', 'trialing', 'past_due', 'canceled', etc.
  stripe_current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id) -- One subscription per user for now
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- 1. Users can view their own subscription
CREATE POLICY "Users can view own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Service Role (Server) can full access (Implicit in Supabase, but good to know)
-- No public insert/update allowed. Only via Webhook (Service Role).

-- ==============================================================================
-- TRIGGER TO UPDATE PROFILE TIER
-- When subscription is active, update profile.subscription_tier to 'pro'
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_subscription_update() 
RETURNS TRIGGER AS $$
BEGIN
  -- If status is active or trialing, set tier to pro
  IF NEW.stripe_status IN ('active', 'trialing') THEN
    UPDATE public.profiles 
    SET subscription_tier = 'pro' 
    WHERE id = NEW.user_id;
  ELSE
    -- Revert to free if canceled/unpaid
    UPDATE public.profiles 
    SET subscription_tier = 'free' 
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.handle_subscription_update();
