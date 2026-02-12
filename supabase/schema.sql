-- ============================================
-- SUPABASE SCHEMA - STRATEGIC FINANCIAL MODULES
-- Updated with Unit Economics, Scenarios, Parameters
-- ============================================

-- 1. PROFILES TABLE (Enhanced)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT username_length CHECK (CHAR_LENGTH(full_name) >= 3)
);

-- 2. FINANCIAL MODELS TABLE (Enhanced with Strategic Modules)
-- ============================================
CREATE TABLE IF NOT EXISTS public.financial_models (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  business_name TEXT NOT NULL,
  sector TEXT NOT NULL,
  
  -- Input Data (JSONB for flexibility)
  inputs JSONB NOT NULL,
  
  -- Calculated Results
  outputs JSONB,
  
  -- NEW: Strategic Module Results
  unit_economics JSONB,  -- {cac, arpu, ltv, ltvCacRatio, paybackPeriod}
  scenarios JSONB,       -- [{type, name, monthly[], summary}]
  parameters JSONB,      -- {usdRate, inflationRate, salaryIncreaseRate, taxRate}
  cost_structure JSONB,  -- {totalFixed, totalVariable, fixedPercentage, variablePercentage}
  
  -- NEW: Key Metrics (for quick queries)
  total_revenue NUMERIC,
  total_profit NUMERIC,
  breakeven_month INTEGER,
  cac NUMERIC,
  ltv NUMERIC,
  ltv_cac_ratio NUMERIC,
  churn_rate NUMERIC,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SCENARIO TEMPLATES TABLE (Optional - for saving scenario presets)
-- ============================================
CREATE TABLE IF NOT EXISTS public.scenario_templates (
  id UUID DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  scenario_data JSONB NOT NULL, -- {type, growthRate, churnRate, conversionRate}
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_templates ENABLE ROW LEVEL SECURITY;

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

-- Scenario Templates Policies
CREATE POLICY "Users can view own templates and public templates"
  ON public.scenario_templates FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create templates"
  ON public.scenario_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON public.scenario_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.scenario_templates FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_models_user_id ON public.financial_models(user_id);
CREATE INDEX IF NOT EXISTS idx_models_created_at ON public.financial_models(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_models_ltv_cac ON public.financial_models(ltv_cac_ratio) WHERE ltv_cac_ratio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_models_sector ON public.financial_models(sector);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;
CREATE INDEX IF NOT EXISTS idx_templates_public ON public.scenario_templates(is_public) WHERE is_public = TRUE;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_models ON public.financial_models;
CREATE TRIGGER set_updated_at_models
  BEFORE UPDATE ON public.financial_models
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================
-- ANALYTICS VIEWS (Optional - for admin dashboard)
-- ============================================

CREATE OR REPLACE VIEW public.model_analytics AS
SELECT 
  fm.sector,
  COUNT(*) as model_count,
  AVG(fm.total_revenue) as avg_revenue,
  AVG(fm.ltv_cac_ratio) as avg_ltv_cac,
  AVG(fm.churn_rate) as avg_churn
FROM public.financial_models fm
WHERE fm.total_revenue IS NOT NULL
GROUP BY fm.sector;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert default scenario templates
INSERT INTO public.scenario_templates (name, description, scenario_data, is_public)
VALUES 
  ('SaaS Agresif Büyüme', 'Hızlı büyüyen SaaS startuplar için', 
   '{"type": "best", "growthRate": 0.25, "churnRate": 0.03, "conversionRate": 0.15}'::jsonb, TRUE),
  ('E-ticaret Standart', 'Ortalama e-ticaret metrikleri', 
   '{"type": "base", "growthRate": 0.10, "churnRate": 0.05, "conversionRate": 0.10}'::jsonb, TRUE),
  ('Konservatif Yaklaşım', 'Düşük riskli projeksiyon', 
   '{"type": "worst", "growthRate": 0.05, "churnRate": 0.08, "conversionRate": 0.05}'::jsonb, TRUE)
ON CONFLICT DO NOTHING;
