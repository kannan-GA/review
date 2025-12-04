-- ============================================
-- LAST RESORT FIX - Try everything
-- ============================================

-- Step 1: Check for RESTRICTIVE policies (these block everything)
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'reviews'
    AND schemaname = 'public'
    AND permissive = 'RESTRICTIVE';

-- Step 2: Drop ALL policies including restrictive ones
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

-- Step 3: Temporarily disable RLS to test
-- ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Step 4: Re-enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Step 5: Create a very permissive INSERT policy (no role restriction)
-- This allows ANY role to insert
CREATE POLICY "reviews_insert_all"
  ON public.reviews
  FOR INSERT
  WITH CHECK (true);

-- Step 6: Also create explicit anon policy
CREATE POLICY "reviews_insert_anon_explicit"
  ON public.reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Step 7: Create public policy
CREATE POLICY "reviews_insert_public_explicit"
  ON public.reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Step 8: Verify
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'reviews'
    AND schemaname = 'public'
ORDER BY policyname;

