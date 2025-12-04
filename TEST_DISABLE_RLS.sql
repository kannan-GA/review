-- ============================================
-- TEMPORARY TEST: Disable RLS to verify that's the issue
-- ============================================
-- WARNING: This is ONLY for testing. Re-enable RLS after testing!

-- Disable RLS temporarily
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Test your insert now - if it works, RLS is definitely the issue
-- If it still fails, the problem is something else (permissions, constraints, etc.)

-- After testing, re-enable RLS:
-- ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

