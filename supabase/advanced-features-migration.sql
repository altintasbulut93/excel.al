-- ============================================
-- ADVANCED FEATURES MIGRATION
-- Industry Templates, Timeline Events, Reports
-- ============================================

-- 1. INDUSTRY TEMPLATES
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

-- 2. MODEL EVENTS (Timeline System)
-- ============================================
CREATE TABLE IF NOT EXISTS public.model_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES financial_models(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'hire', 'salary_change', 'price_change', 'one_time_cost', 'product_launch'
  event_name TEXT NOT NULL,
  effective_date DATE NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MONTHLY REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES financial_models(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'monthly', 'share', 'quarterly'
  report_month DATE NOT NULL,
  storage_path TEXT,
  public_url TEXT,
  social_image_path TEXT,
  visibility TEXT DEFAULT 'private', -- 'private', 'public', 'unlisted'
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 4. MONTHLY CHECKLISTS
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

-- 5. RLS POLICIES
-- ============================================

-- Industry Templates (Public Read)
ALTER TABLE public.industry_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are publicly readable"
  ON public.industry_templates FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage templates"
  ON public.industry_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Model Events (User Access)
ALTER TABLE public.model_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own model events"
  ON public.model_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_models
      WHERE id = model_events.model_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events for own models"
  ON public.model_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.financial_models
      WHERE id = model_events.model_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own model events"
  ON public.model_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_models
      WHERE id = model_events.model_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own model events"
  ON public.model_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_models
      WHERE id = model_events.model_id AND user_id = auth.uid()
    )
  );

-- Monthly Reports
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON public.monthly_reports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Public reports are viewable by anyone"
  ON public.monthly_reports FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can create own reports"
  ON public.monthly_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reports"
  ON public.monthly_reports FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reports"
  ON public.monthly_reports FOR DELETE
  USING (user_id = auth.uid());

-- Monthly Checklists
ALTER TABLE public.monthly_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists"
  ON public.monthly_checklists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own checklists"
  ON public.monthly_checklists FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own checklists"
  ON public.monthly_checklists FOR UPDATE
  USING (user_id = auth.uid());

-- 6. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_model_events_model_id ON public.model_events(model_id);
CREATE INDEX IF NOT EXISTS idx_model_events_effective_date ON public.model_events(effective_date);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_model_id ON public.monthly_reports(model_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_user_id ON public.monthly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_visibility ON public.monthly_reports(visibility);
CREATE INDEX IF NOT EXISTS idx_monthly_checklists_user_model ON public.monthly_checklists(user_id, model_id);
CREATE INDEX IF NOT EXISTS idx_monthly_checklists_month ON public.monthly_checklists(month);

-- 7. SEED DATA - INDUSTRY TEMPLATES
-- ============================================

-- SaaS Template
INSERT INTO industry_templates (code, name, description, icon, default_revenue_items, default_cost_items) VALUES
('saas', 'SaaS', 'Software as a Service business model', '💻',
  '[
    {"id": "monthly_subs", "name": "Monthly Subscriptions", "type": "recurring", "unit": "subscribers", "price": 50, "growth_rate": 10},
    {"id": "annual_subs", "name": "Annual Subscriptions", "type": "recurring", "unit": "subscribers", "price": 500, "growth_rate": 5},
    {"id": "enterprise", "name": "Enterprise Deals", "type": "one_time", "unit": "deals", "price": 10000, "growth_rate": 2}
  ]'::jsonb,
  '[
    {"id": "cloud_hosting", "name": "Cloud Hosting (AWS/GCP)", "type": "variable", "category": "infrastructure", "monthly": 500, "per_user": 2},
    {"id": "software_licenses", "name": "Software Licenses", "type": "fixed", "category": "software", "monthly": 1000},
    {"id": "customer_support", "name": "Customer Support Team", "type": "fixed", "category": "personnel", "monthly": 15000},
    {"id": "development", "name": "Development Team", "type": "fixed", "category": "personnel", "monthly": 40000},
    {"id": "marketing", "name": "Marketing & Ads", "type": "variable", "category": "marketing", "monthly": 5000}
  ]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_revenue_items = EXCLUDED.default_revenue_items,
  default_cost_items = EXCLUDED.default_cost_items,
  updated_at = NOW();

-- E-commerce Template
INSERT INTO industry_templates (code, name, description, icon, default_revenue_items, default_cost_items) VALUES
('ecommerce', 'E-commerce', 'Online retail and marketplace', '🛒',
  '[
    {"id": "product_sales", "name": "Product Sales", "type": "recurring", "unit": "orders", "price": 100, "growth_rate": 15},
    {"id": "shipping_fees", "name": "Shipping Fees", "type": "recurring", "unit": "orders", "price": 10, "growth_rate": 15},
    {"id": "marketplace_fees", "name": "Marketplace Commission", "type": "recurring", "unit": "orders", "price": 20, "growth_rate": 15}
  ]'::jsonb,
  '[
    {"id": "inventory", "name": "Inventory & COGS", "type": "variable", "category": "cogs", "monthly": 20000, "percentage": 40},
    {"id": "shipping_costs", "name": "Shipping & Logistics", "type": "variable", "category": "logistics", "monthly": 3000},
    {"id": "platform_fees", "name": "Platform Fees (Shopify/WooCommerce)", "type": "fixed", "category": "software", "monthly": 300},
    {"id": "payment_processing", "name": "Payment Processing", "type": "variable", "category": "fees", "monthly": 1000, "percentage": 2.5},
    {"id": "marketing", "name": "Digital Marketing", "type": "variable", "category": "marketing", "monthly": 8000},
    {"id": "customer_service", "name": "Customer Service", "type": "fixed", "category": "personnel", "monthly": 10000}
  ]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_revenue_items = EXCLUDED.default_revenue_items,
  default_cost_items = EXCLUDED.default_cost_items,
  updated_at = NOW();

-- Consulting Template
INSERT INTO industry_templates (code, name, description, icon, default_revenue_items, default_cost_items) VALUES
('consulting', 'Consulting', 'Professional services and consulting', '👔',
  '[
    {"id": "hourly_billing", "name": "Hourly Billing", "type": "recurring", "unit": "hours", "price": 150, "growth_rate": 5},
    {"id": "project_fees", "name": "Project Fees", "type": "one_time", "unit": "projects", "price": 25000, "growth_rate": 3},
    {"id": "retainer", "name": "Monthly Retainer", "type": "recurring", "unit": "clients", "price": 5000, "growth_rate": 2}
  ]'::jsonb,
  '[
    {"id": "consultants", "name": "Consultant Salaries", "type": "fixed", "category": "personnel", "monthly": 30000},
    {"id": "office", "name": "Office Rent", "type": "fixed", "category": "overhead", "monthly": 3000},
    {"id": "software", "name": "Software & Tools", "type": "fixed", "category": "software", "monthly": 500},
    {"id": "travel", "name": "Travel & Expenses", "type": "variable", "category": "expenses", "monthly": 2000},
    {"id": "marketing", "name": "Marketing & BD", "type": "fixed", "category": "marketing", "monthly": 3000}
  ]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_revenue_items = EXCLUDED.default_revenue_items,
  default_cost_items = EXCLUDED.default_cost_items,
  updated_at = NOW();

-- Marketplace Template
INSERT INTO industry_templates (code, name, description, icon, default_revenue_items, default_cost_items) VALUES
('marketplace', 'Marketplace', 'Two-sided marketplace platform', '🏪',
  '[
    {"id": "transaction_fees", "name": "Transaction Fees", "type": "recurring", "unit": "transactions", "price": 50, "growth_rate": 20},
    {"id": "listing_fees", "name": "Listing Fees", "type": "recurring", "unit": "listings", "price": 10, "growth_rate": 15},
    {"id": "premium_features", "name": "Premium Features", "type": "recurring", "unit": "users", "price": 30, "growth_rate": 10}
  ]'::jsonb,
  '[
    {"id": "platform_development", "name": "Platform Development", "type": "fixed", "category": "personnel", "monthly": 35000},
    {"id": "hosting", "name": "Cloud Hosting", "type": "variable", "category": "infrastructure", "monthly": 2000},
    {"id": "payment_processing", "name": "Payment Processing", "type": "variable", "category": "fees", "monthly": 1500, "percentage": 3},
    {"id": "customer_support", "name": "Customer Support", "type": "fixed", "category": "personnel", "monthly": 12000},
    {"id": "marketing", "name": "User Acquisition", "type": "variable", "category": "marketing", "monthly": 10000}
  ]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_revenue_items = EXCLUDED.default_revenue_items,
  default_cost_items = EXCLUDED.default_cost_items,
  updated_at = NOW();

-- Mobile App Template
INSERT INTO industry_templates (code, name, description, icon, default_revenue_items, default_cost_items) VALUES
('mobile_app', 'Mobile App', 'Mobile application business', '📱',
  '[
    {"id": "in_app_purchases", "name": "In-App Purchases", "type": "recurring", "unit": "purchases", "price": 5, "growth_rate": 25},
    {"id": "subscriptions", "name": "Premium Subscriptions", "type": "recurring", "unit": "subscribers", "price": 10, "growth_rate": 15},
    {"id": "ads_revenue", "name": "Ad Revenue", "type": "recurring", "unit": "impressions", "price": 0.01, "growth_rate": 30}
  ]'::jsonb,
  '[
    {"id": "development", "name": "App Development Team", "type": "fixed", "category": "personnel", "monthly": 40000},
    {"id": "app_store_fees", "name": "App Store Fees", "type": "variable", "category": "fees", "monthly": 1000, "percentage": 30},
    {"id": "backend_hosting", "name": "Backend & API Hosting", "type": "variable", "category": "infrastructure", "monthly": 1500},
    {"id": "push_notifications", "name": "Push Notification Service", "type": "fixed", "category": "software", "monthly": 200},
    {"id": "user_acquisition", "name": "User Acquisition", "type": "variable", "category": "marketing", "monthly": 8000}
  ]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  default_revenue_items = EXCLUDED.default_revenue_items,
  default_cost_items = EXCLUDED.default_cost_items,
  updated_at = NOW();

-- 8. VERIFICATION QUERIES
-- ============================================

-- Check templates
-- SELECT code, name, icon FROM industry_templates ORDER BY code;

-- Check events
-- SELECT event_type, event_name, effective_date FROM model_events ORDER BY effective_date;

-- Check reports
-- SELECT report_type, visibility, created_at FROM monthly_reports ORDER BY created_at DESC;
