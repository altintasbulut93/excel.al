-- ============================================
-- COUNTRIES & LOCALIZATION SYSTEM
-- Production-ready country support with flags
-- ============================================

-- 1. COUNTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.countries (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_local TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  default_locale TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  default_exchange_rate NUMERIC DEFAULT 1.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COUNTRY FINANCIAL RULES
-- ============================================
CREATE TABLE IF NOT EXISTS public.country_financial_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT REFERENCES countries(code) ON DELETE CASCADE,
  vat_rate NUMERIC DEFAULT 0,
  employer_social_contrib NUMERIC DEFAULT 0,
  employee_tax_brackets JSONB,
  typical_salary_benchmarks JSONB,
  typical_cost_multipliers JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(country_code)
);

-- 3. ADD COUNTRY TO PROFILES
-- ============================================
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS country_code TEXT REFERENCES countries(code),
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-US';

-- 4. SEED DATA - MAJOR COUNTRIES
-- ============================================

-- Turkey
INSERT INTO countries (code, name, name_local, flag_emoji, default_locale, currency_code, currency_symbol, default_exchange_rate) VALUES
('TR', 'Turkey', 'Türkiye', '🇹🇷', 'tr-TR', 'TRY', '₺', 1.0)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_local = EXCLUDED.name_local,
  flag_emoji = EXCLUDED.flag_emoji;

INSERT INTO country_financial_rules (country_code, vat_rate, employer_social_contrib, employee_tax_brackets, typical_salary_benchmarks, typical_cost_multipliers) VALUES
('TR', 0.20, 0.225, 
  '[
    {"min": 0, "max": 70000, "rate": 0.15, "deduction": 0},
    {"min": 70001, "max": 150000, "rate": 0.20, "deduction": 3500},
    {"min": 150001, "max": 550000, "rate": 0.27, "deduction": 14000},
    {"min": 550001, "max": 1900000, "rate": 0.35, "deduction": 58000},
    {"min": 1900001, "max": null, "rate": 0.40, "deduction": 153000}
  ]'::jsonb,
  '{
    "junior_dev": 45000,
    "senior_dev": 120000,
    "designer": 60000,
    "marketing": 50000,
    "sales": 55000
  }'::jsonb,
  '{
    "hosting_multiplier": 1.0,
    "office_rent_index": 1.2,
    "marketing_cpc": 0.8
  }'::jsonb
)
ON CONFLICT (country_code) DO UPDATE SET
  vat_rate = EXCLUDED.vat_rate,
  employer_social_contrib = EXCLUDED.employer_social_contrib,
  employee_tax_brackets = EXCLUDED.employee_tax_brackets,
  typical_salary_benchmarks = EXCLUDED.typical_salary_benchmarks,
  typical_cost_multipliers = EXCLUDED.typical_cost_multipliers,
  updated_at = NOW();

-- United States
INSERT INTO countries (code, name, name_local, flag_emoji, default_locale, currency_code, currency_symbol, default_exchange_rate) VALUES
('US', 'United States', 'United States', '🇺🇸', 'en-US', 'USD', '$', 0.029)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji;

INSERT INTO country_financial_rules (country_code, vat_rate, employer_social_contrib, employee_tax_brackets, typical_salary_benchmarks, typical_cost_multipliers) VALUES
('US', 0.00, 0.0765,
  '[
    {"min": 0, "max": 11000, "rate": 0.10, "deduction": 0},
    {"min": 11001, "max": 44725, "rate": 0.12, "deduction": 220},
    {"min": 44726, "max": 95375, "rate": 0.22, "deduction": 4697},
    {"min": 95376, "max": 182100, "rate": 0.24, "deduction": 6604},
    {"min": 182101, "max": 231250, "rate": 0.32, "deduction": 21168},
    {"min": 231251, "max": 578125, "rate": 0.35, "deduction": 28096},
    {"min": 578126, "max": null, "rate": 0.37, "deduction": 39672}
  ]'::jsonb,
  '{
    "junior_dev": 70000,
    "senior_dev": 150000,
    "designer": 80000,
    "marketing": 65000,
    "sales": 75000
  }'::jsonb,
  '{
    "hosting_multiplier": 1.0,
    "office_rent_index": 1.5,
    "marketing_cpc": 1.2
  }'::jsonb
)
ON CONFLICT (country_code) DO UPDATE SET
  vat_rate = EXCLUDED.vat_rate,
  employer_social_contrib = EXCLUDED.employer_social_contrib,
  employee_tax_brackets = EXCLUDED.employee_tax_brackets,
  updated_at = NOW();

-- United Kingdom
INSERT INTO countries (code, name, name_local, flag_emoji, default_locale, currency_code, currency_symbol, default_exchange_rate) VALUES
('UK', 'United Kingdom', 'United Kingdom', '🇬🇧', 'en-GB', 'GBP', '£', 0.024)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji;

INSERT INTO country_financial_rules (country_code, vat_rate, employer_social_contrib, employee_tax_brackets, typical_salary_benchmarks, typical_cost_multipliers) VALUES
('UK', 0.20, 0.138,
  '[
    {"min": 0, "max": 12570, "rate": 0.00, "deduction": 0},
    {"min": 12571, "max": 50270, "rate": 0.20, "deduction": 0},
    {"min": 50271, "max": 125140, "rate": 0.40, "deduction": 10054},
    {"min": 125141, "max": null, "rate": 0.45, "deduction": 16308}
  ]'::jsonb,
  '{
    "junior_dev": 35000,
    "senior_dev": 75000,
    "designer": 40000,
    "marketing": 35000,
    "sales": 40000
  }'::jsonb,
  '{
    "hosting_multiplier": 1.0,
    "office_rent_index": 1.8,
    "marketing_cpc": 1.1
  }'::jsonb
)
ON CONFLICT (country_code) DO UPDATE SET
  vat_rate = EXCLUDED.vat_rate,
  employer_social_contrib = EXCLUDED.employer_social_contrib,
  employee_tax_brackets = EXCLUDED.employee_tax_brackets,
  updated_at = NOW();

-- Germany
INSERT INTO countries (code, name, name_local, flag_emoji, default_locale, currency_code, currency_symbol, default_exchange_rate) VALUES
('DE', 'Germany', 'Deutschland', '🇩🇪', 'de-DE', 'EUR', '€', 0.027)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  name_local = EXCLUDED.name_local,
  flag_emoji = EXCLUDED.flag_emoji;

INSERT INTO country_financial_rules (country_code, vat_rate, employer_social_contrib, employee_tax_brackets, typical_salary_benchmarks, typical_cost_multipliers) VALUES
('DE', 0.19, 0.20,
  '[
    {"min": 0, "max": 11604, "rate": 0.00, "deduction": 0},
    {"min": 11605, "max": 66760, "rate": 0.14, "deduction": 0},
    {"min": 66761, "max": 277825, "rate": 0.42, "deduction": 18693},
    {"min": 277826, "max": null, "rate": 0.45, "deduction": 27028}
  ]'::jsonb,
  '{
    "junior_dev": 45000,
    "senior_dev": 85000,
    "designer": 50000,
    "marketing": 45000,
    "sales": 50000
  }'::jsonb,
  '{
    "hosting_multiplier": 1.0,
    "office_rent_index": 1.4,
    "marketing_cpc": 1.0
  }'::jsonb
)
ON CONFLICT (country_code) DO UPDATE SET
  vat_rate = EXCLUDED.vat_rate,
  employer_social_contrib = EXCLUDED.employer_social_contrib,
  employee_tax_brackets = EXCLUDED.employee_tax_brackets,
  updated_at = NOW();

-- France
INSERT INTO countries (code, name, name_local, flag_emoji, default_locale, currency_code, currency_symbol, default_exchange_rate) VALUES
('FR', 'France', 'France', '🇫🇷', 'fr-FR', 'EUR', '€', 0.027)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  flag_emoji = EXCLUDED.flag_emoji;

INSERT INTO country_financial_rules (country_code, vat_rate, employer_social_contrib, employee_tax_brackets, typical_salary_benchmarks, typical_cost_multipliers) VALUES
('FR', 0.20, 0.42,
  '[
    {"min": 0, "max": 11294, "rate": 0.00, "deduction": 0},
    {"min": 11295, "max": 28797, "rate": 0.11, "deduction": 0},
    {"min": 28798, "max": 82341, "rate": 0.30, "deduction": 5471},
    {"min": 82342, "max": 177106, "rate": 0.41, "deduction": 14527},
    {"min": 177107, "max": null, "rate": 0.45, "deduction": 21611}
  ]'::jsonb,
  '{
    "junior_dev": 38000,
    "senior_dev": 70000,
    "designer": 42000,
    "marketing": 38000,
    "sales": 45000
  }'::jsonb,
  '{
    "hosting_multiplier": 1.0,
    "office_rent_index": 1.6,
    "marketing_cpc": 0.95
  }'::jsonb
)
ON CONFLICT (country_code) DO UPDATE SET
  vat_rate = EXCLUDED.vat_rate,
  employer_social_contrib = EXCLUDED.employer_social_contrib,
  employee_tax_brackets = EXCLUDED.employee_tax_brackets,
  updated_at = NOW();

-- 5. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_financial_rules ENABLE ROW LEVEL SECURITY;

-- Everyone can read countries
CREATE POLICY "Countries are publicly readable"
  ON public.countries FOR SELECT
  USING (TRUE);

-- Everyone can read country rules
CREATE POLICY "Country rules are publicly readable"
  ON public.country_financial_rules FOR SELECT
  USING (TRUE);

-- Only admins can modify countries
CREATE POLICY "Admins can manage countries"
  ON public.countries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can modify country rules
CREATE POLICY "Admins can manage country rules"
  ON public.country_financial_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- 6. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON public.profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_country_rules_country_code ON public.country_financial_rules(country_code);

-- 7. VERIFICATION QUERIES
-- ============================================

-- Check countries
-- SELECT code, name, flag_emoji, currency_symbol FROM countries ORDER BY code;

-- Check rules
-- SELECT country_code, vat_rate, employer_social_contrib FROM country_financial_rules ORDER BY country_code;

-- Check profiles with countries
-- SELECT email, country_code, locale FROM profiles WHERE country_code IS NOT NULL;
