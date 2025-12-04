-- ============================================
-- ULTIMATE FIX - Try everything possible
-- ============================================

-- Step 1: Completely disable RLS first
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL policies
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

-- Step 3: Re-enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy WITHOUT specifying role (applies to ALL roles)
CREATE POLICY "reviews_insert_all_roles"
  ON public.reviews
  FOR INSERT
  WITH CHECK (true);

-- Step 5: Also create explicit anon policy
CREATE POLICY "reviews_insert_anon_role"
  ON public.reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Step 6: Create for authenticated
CREATE POLICY "reviews_insert_authenticated_role"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Step 7: Create for public
CREATE POLICY "reviews_insert_public_role"
  ON public.reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Step 8: Verify all policies
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

