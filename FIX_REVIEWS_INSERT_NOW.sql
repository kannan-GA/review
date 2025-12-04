-- ============================================
-- FIX REVIEWS INSERT RLS POLICY - RUN THIS NOW
-- ============================================
-- This script will fix the RLS policy to allow anonymous inserts

-- Step 1: Check current policies (for debugging)
SELECT 
    tablename, 
    policyname, 
    cmd as operation,
    roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'reviews' 
    AND schemaname = 'public'
ORDER BY policyname;

-- Step 2: Drop ALL existing policies on reviews table
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
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Step 4: Create SELECT policy (view approved reviews)
CREATE POLICY "reviews_select_approved"
  ON public.reviews
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Step 5: Create INSERT policy (allow anonymous inserts)
-- This is the critical one that's failing
-- Using 'public' role includes both anon and authenticated users in Supabase
CREATE POLICY "reviews_insert_public"
  ON public.reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Alternative: If above doesn't work, also try explicit anon role (uncomment if needed)
-- CREATE POLICY "reviews_insert_anon"
--   ON public.reviews
--   FOR INSERT
--   TO anon
--   WITH CHECK (true);

-- Step 6: Verify policies were created
SELECT 
    tablename, 
    policyname, 
    cmd as operation,
    roles,
    with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'reviews' 
    AND schemaname = 'public'
ORDER BY policyname;

-- Step 7: Test query (this should show the policies)
-- If you see "reviews_insert_public" with operation = "INSERT" and roles = "{public}", it's correct

