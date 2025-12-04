-- TEMPORARY: Disable RLS to test if that's the issue
-- WARNING: This removes all security - only for testing!

ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;

-- Now test your insert
-- If it works, RLS is definitely the problem
-- If it still fails, the problem is something else (permissions, constraints, etc.)

-- After testing, re-enable with:
-- ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

