-- ==============================================================================
-- FIX RLS POLICIES FOR FINANCIAL MODELS AND EVENTS
-- Run this in your Supabase SQL Editor to resolve "Model not found" and RLS errors.
-- ==============================================================================

-- 1. Ensure RLS is enabled on the main table
ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts (clean slate for this table)
DROP POLICY IF EXISTS "Users can view own models" ON public.financial_models;
DROP POLICY IF EXISTS "Users can insert own models" ON public.financial_models;
DROP POLICY IF EXISTS "Users can update own models" ON public.financial_models;
DROP POLICY IF EXISTS "Users can delete own models" ON public.financial_models;

-- 3. Create comprehensive policies for financial_models
-- SELECT: Users can see their own models
CREATE POLICY "Users can view own models" 
ON public.financial_models 
FOR SELECT 
USING (auth.uid() = user_id);

-- INSERT: Users can create models (and must assign themselves as owner)
CREATE POLICY "Users can insert own models" 
ON public.financial_models 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own models
CREATE POLICY "Users can update own models" 
ON public.financial_models 
FOR UPDATE 
USING (auth.uid() = user_id);

-- DELETE: Users can delete their own models
CREATE POLICY "Users can delete own models" 
ON public.financial_models 
FOR DELETE 
USING (auth.uid() = user_id);


-- ==============================================================================
-- FIX MODEL EVENTS POLICIES (Just in case)
-- ==============================================================================

ALTER TABLE public.model_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own model events" ON public.model_events;
DROP POLICY IF EXISTS "Users can create events for own models" ON public.model_events;
DROP POLICY IF EXISTS "Users can update own model events" ON public.model_events;
DROP POLICY IF EXISTS "Users can delete own model events" ON public.model_events;

-- SELECT: View events if you own the parent model
CREATE POLICY "Users can view own model events" 
ON public.model_events 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.financial_models fm 
        WHERE fm.id = model_events.model_id 
        AND fm.user_id = auth.uid()
    )
);

-- INSERT: Create events if you own the parent model
CREATE POLICY "Users can create events for own models" 
ON public.model_events 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.financial_models fm 
        WHERE fm.id = model_events.model_id 
        AND fm.user_id = auth.uid()
    )
);

-- UPDATE: Update events if you own the parent model
CREATE POLICY "Users can update own model events" 
ON public.model_events 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.financial_models fm 
        WHERE fm.id = model_events.model_id 
        AND fm.user_id = auth.uid()
    )
);

-- DELETE: Delete events if you own the parent model
CREATE POLICY "Users can delete own model events" 
ON public.model_events 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.financial_models fm 
        WHERE fm.id = model_events.model_id 
        AND fm.user_id = auth.uid()
    )
);
