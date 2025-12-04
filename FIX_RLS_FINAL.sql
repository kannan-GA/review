-- ============================================
-- FINAL FIX FOR REVIEWS INSERT RLS POLICY
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop ALL existing policies on reviews
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'reviews' 
        AND schemaname = 'public'
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.reviews', r.policyname);
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Step 3: Create SELECT policy
CREATE POLICY "reviews_select_approved"
  ON public.reviews
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Step 4: Create INSERT policy for anonymous users
-- Supabase uses 'anon' role for anonymous users
CREATE POLICY "reviews_insert_anon"
  ON public.reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Step 5: Also create for authenticated users (if needed)
CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 6: Verify policies
SELECT 
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies
WHERE tablename = 'reviews'
    AND schemaname = 'public'
ORDER BY policyname;

-- Expected output:
-- You should see:
-- 1. reviews_select_approved (SELECT, {public})
-- 2. reviews_insert_anon (INSERT, {anon})
-- 3. reviews_insert_authenticated (INSERT, {authenticated})

