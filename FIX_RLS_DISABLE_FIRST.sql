-- ============================================
-- STEP 1: Disable RLS to test
-- ============================================
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Now test your insert with: .\test_api_key.ps1
-- If it works, RLS is the problem
-- If it still fails, the problem is something else

-- ============================================
-- STEP 2: If disabling RLS worked, try this fix
-- ============================================
-- Re-enable RLS
-- ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop all policies
-- DO $$ 
-- DECLARE
--     r RECORD;
-- BEGIN
--     FOR r IN (
--         SELECT policyname 
--         FROM pg_policies 
--         WHERE tablename = 'reviews' 
--         AND schemaname = 'public'
--     ) 
--     LOOP
--         EXECUTE format('DROP POLICY IF EXISTS %I ON public.reviews', r.policyname);
--     END LOOP;
-- END $$;

-- Create ONE simple policy that should work
-- CREATE POLICY "reviews_insert_allow_all"
--   ON public.reviews
--   FOR INSERT
--   TO anon, authenticated, public
--   WITH CHECK (true);

