-- ============================================
-- 0. EXTENSIONS & PREREQUISITES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure financial_models table exists (Core Dependency)
CREATE TABLE IF NOT EXISTS public.financial_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id column exists in financial_models
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'financial_models' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.financial_models ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Ensure critical columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'inputs') THEN
        ALTER TABLE public.financial_models ADD COLUMN inputs JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'business_name') THEN
        ALTER TABLE public.financial_models ADD COLUMN business_name TEXT DEFAULT 'My Business';
    END IF;

     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'sector') THEN
        ALTER TABLE public.financial_models ADD COLUMN sector TEXT DEFAULT 'Technology';
    END IF;

    -- ADDING STRATEGIC COLUMNS IF MISSING
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'unit_economics') THEN
        ALTER TABLE public.financial_models ADD COLUMN unit_economics JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'scenarios') THEN
        ALTER TABLE public.financial_models ADD COLUMN scenarios JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'parameters') THEN
        ALTER TABLE public.financial_models ADD COLUMN parameters JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'cost_structure') THEN
        ALTER TABLE public.financial_models ADD COLUMN cost_structure JSONB;
    END IF;

    -- ADDING NUMERIC METRICS IF MISSING
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'ltv_cac_ratio') THEN
        ALTER TABLE public.financial_models ADD COLUMN ltv_cac_ratio NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'cac') THEN
        ALTER TABLE public.financial_models ADD COLUMN cac NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'ltv') THEN
        ALTER TABLE public.financial_models ADD COLUMN ltv NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'total_revenue') THEN
        ALTER TABLE public.financial_models ADD COLUMN total_revenue NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'total_profit') THEN
        ALTER TABLE public.financial_models ADD COLUMN total_profit NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'churn_rate') THEN
        ALTER TABLE public.financial_models ADD COLUMN churn_rate NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_models' AND column_name = 'breakeven_month') THEN
        ALTER TABLE public.financial_models ADD COLUMN breakeven_month INTEGER;
    END IF;
END $$;


-- ============================================
-- 1. INDUSTRY TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.industry_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  default_revenue_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_cost_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. MODEL EVENTS TABLE (Timeline)
-- ============================================
CREATE TABLE IF NOT EXISTS public.model_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES financial_models(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  effective_date DATE NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. MONTHLY REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES financial_models(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  report_month DATE NOT NULL,
  storage_path TEXT,
  public_url TEXT,
  social_image_path TEXT,
  visibility TEXT DEFAULT 'private',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- ============================================
-- 4. MONTHLY CHECKLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.monthly_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id UUID REFERENCES financial_models(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, model_id, month)
);

-- ============================================
-- 5. RLS POLICIES (Security)
-- ============================================

-- Industry Templates (Public Read)
ALTER TABLE public.industry_templates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'industry_templates' AND policyname = 'Templates are publicly readable'
    ) THEN
        CREATE POLICY "Templates are publicly readable" ON public.industry_templates FOR SELECT USING (is_active = TRUE);
    END IF;
END $$;

-- Model Events (User Access)
ALTER TABLE public.model_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Using alias 'fm' for clarity to prevent ambiguity errors
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'model_events' AND policyname = 'Users can view own model events'
    ) THEN
        CREATE POLICY "Users can view own model events" ON public.model_events FOR SELECT USING (
            EXISTS (SELECT 1 FROM public.financial_models fm WHERE fm.id = model_events.model_id AND fm.user_id = auth.uid())
        );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'model_events' AND policyname = 'Users can create events for own models'
    ) THEN
        CREATE POLICY "Users can create events for own models" ON public.model_events FOR INSERT WITH CHECK (
            EXISTS (SELECT 1 FROM public.financial_models fm WHERE fm.id = model_events.model_id AND fm.user_id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'model_events' AND policyname = 'Users can update own model events'
    ) THEN
        CREATE POLICY "Users can update own model events" ON public.model_events FOR UPDATE USING (
            EXISTS (SELECT 1 FROM public.financial_models fm WHERE fm.id = model_events.model_id AND fm.user_id = auth.uid())
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'model_events' AND policyname = 'Users can delete own model events'
    ) THEN
        CREATE POLICY "Users can delete own model events" ON public.model_events FOR DELETE USING (
            EXISTS (SELECT 1 FROM public.financial_models fm WHERE fm.id = model_events.model_id AND fm.user_id = auth.uid())
        );
    END IF;
END $$;

-- Monthly Reports
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'monthly_reports' AND policyname = 'Users can view own reports'
    ) THEN
        CREATE POLICY "Users can view own reports" ON public.monthly_reports FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'monthly_reports' AND policyname = 'Users can create own reports'
    ) THEN
        CREATE POLICY "Users can create own reports" ON public.monthly_reports FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
END $$;

-- Monthly Checklists
ALTER TABLE public.monthly_checklists ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'monthly_checklists' AND policyname = 'Users can view own checklists'
    ) THEN
        CREATE POLICY "Users can view own checklists" ON public.monthly_checklists FOR SELECT USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'monthly_checklists' AND policyname = 'Users can create own checklists'
    ) THEN
        CREATE POLICY "Users can create own checklists" ON public.monthly_checklists FOR INSERT WITH CHECK (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'monthly_checklists' AND policyname = 'Users can update own checklists'
    ) THEN
        CREATE POLICY "Users can update own checklists" ON public.monthly_checklists FOR UPDATE USING (user_id = auth.uid());
    END IF;
END $$;

-- ============================================
-- 6. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_model_events_model_id ON public.model_events(model_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_model_id ON public.monthly_reports(model_id);
CREATE INDEX IF NOT EXISTS idx_monthly_checklists_user_model ON public.monthly_checklists(user_id, model_id);

-- ============================================
-- 7. SEED DATA - INDUSTRY TEMPLATES
-- ============================================

-- SaaS Template
INSERT INTO industry_templates (code, name, description, icon, default_revenue_items, default_cost_items) VALUES
('saas', 'SaaS', 'Software as a Service business model', '💻',
  '[
    {"id": "monthly_subs", "name": "Monthly Subscriptions", "type": "recurring", "unit": "subscribers", "price": 50, "growth_rate": 10},
    {"id": "annual_subs", "name": "Annual Subscriptions", "type": "recurring", "unit": "subscribers", "price": 500, "growth_rate": 5}
  ]'::jsonb,
  '[
    {"id": "cloud_hosting", "name": "Cloud Hosting", "type": "variable", "category": "infrastructure", "monthly": 500},
    {"id": "marketing", "name": "Digital Marketing", "type": "variable", "category": "marketing", "monthly": 2000}
  ]'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- E-commerce Template
INSERT INTO industry_templates (code, name, description, icon, default_revenue_items, default_cost_items) VALUES
('ecommerce', 'E-commerce', 'Online retail and marketplace', '🛒',
  '[
    {"id": "product_sales", "name": "Product Sales", "type": "recurring", "unit": "orders", "price": 100, "growth_rate": 15}
  ]'::jsonb,
  '[
    {"id": "inventory", "name": "Inventory & COGS", "type": "variable", "category": "cogs", "monthly": 5000},
    {"id": "shipping", "name": "Shipping Costs", "type": "variable", "category": "logistics", "monthly": 1000}
  ]'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- Consulting Template
INSERT INTO industry_templates (code, name, description, icon, default_revenue_items, default_cost_items) VALUES
('consulting', 'Consulting', 'Professional services', '👔',
  '[
    {"id": "hourly_billing", "name": "Hourly Services", "type": "recurring", "unit": "hours", "price": 200, "growth_rate": 5}
  ]'::jsonb,
  '[
    {"id": "office", "name": "Office Rent", "type": "fixed", "category": "overhead", "monthly": 2000},
    {"id": "software", "name": "Software Tools", "type": "fixed", "category": "software", "monthly": 300}
  ]'::jsonb
)
ON CONFLICT (code) DO NOTHING;