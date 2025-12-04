-- ============================================
-- DEBUG: Check what's actually happening
-- ============================================

-- 1. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'reviews'
    AND schemaname = 'public';

-- 2. Check for RESTRICTIVE policies (these block everything)
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

-- 3. Check all policies
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

-- 4. TEMPORARILY DISABLE RLS TO TEST
-- Uncomment the next line to disable RLS and test:
-- ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- After testing, if inserts work with RLS disabled, then re-enable:
-- ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

