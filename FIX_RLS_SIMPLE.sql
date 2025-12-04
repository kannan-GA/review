-- ============================================
-- SIMPLEST POSSIBLE FIX
-- ============================================

-- Just disable RLS temporarily to test
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Test your insert now - if this works, we know RLS is the issue
-- Then we can figure out why the policies aren't working

