-- ============================================
-- INVESTOR DASHBOARD & SHARE SYSTEM
-- Safe & Secure Model Sharing
-- ============================================

-- 1. MODEL SHARES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.model_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES financial_models(id) ON DELETE CASCADE,
  share_token UUID DEFAULT gen_random_uuid(),
  is_password_protected BOOLEAN DEFAULT FALSE,
  password_hash TEXT, -- Stored securely if needed, or simple check
  expires_at TIMESTAMPTZ,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent multiple active shares for same model if desired, or allow multiple
  UNIQUE(share_token)
);

-- 2. RLS POLICIES
-- ============================================
ALTER TABLE public.model_shares ENABLE ROW LEVEL SECURITY;

-- Owner can manage their shares
CREATE POLICY "Users can view own model shares"
  ON public.model_shares FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_models
      WHERE id = model_shares.model_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for own models"
  ON public.model_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.financial_models
      WHERE id = model_shares.model_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own shares"
  ON public.model_shares FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.financial_models
      WHERE id = model_shares.model_id AND user_id = auth.uid()
    )
  );

-- Public Access (via Token) - CRITICAL for "Investor View"
-- We need a function or unauthenticated access policy for reading specific share data
-- However, standard RLS blocks anon. We will use a secure RPC function instead for fetching shared data.

-- 3. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_model_shares_token ON public.model_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_model_shares_model_id ON public.model_shares(model_id);

-- 4. SECURE FUNCTIONS
-- ============================================

-- Function to get shared model data safely without exposing everything
CREATE OR REPLACE FUNCTION public.get_shared_model(token_uuid UUID, password_input TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  share_record public.model_shares%ROWTYPE;
  model_record public.financial_models%ROWTYPE;
BEGIN
  -- 1. Find the share record
  SELECT * INTO share_record FROM public.model_shares WHERE share_token = token_uuid LIMIT 1;
  
  -- 2. Validate existence
  IF share_record IS NULL THEN
    RETURN jsonb_build_object('error', 'Share link not found', 'code', 404);
  END IF;

  -- 3. Validate Expiry
  IF share_record.expires_at IS NOT NULL AND share_record.expires_at < NOW() THEN
    RETURN jsonb_build_object('error', 'Share link expired', 'code', 410);
  END IF;

  -- 4. Validate Password (Simple exact match for MVP, hash ideally)
  IF share_record.is_password_protected THEN
    IF password_input IS NULL OR share_record.password_hash IS DISTINCT FROM password_input THEN
       RETURN jsonb_build_object('error', 'Password required', 'code', 401, 'is_password_protected', true);
    END IF;
  END IF;

  -- 5. Fetch Model Data
  SELECT * INTO model_record FROM public.financial_models WHERE id = share_record.model_id;

  -- 6. Increment View Count
  UPDATE public.model_shares SET views = views + 1 WHERE id = share_record.id;

  -- 7. Return Sanitized Data
  RETURN jsonb_build_object(
    'business_name', model_record.business_name,
    'sector', model_record.sector,
    'id', model_record.id,
    'inputs', model_record.inputs,
    'outputs', model_record.outputs,
    'unit_economics', model_record.unit_economics,
    'created_at', model_record.created_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
