-- Verify RLS policies are correct
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_clause,
    with_check
FROM pg_policies
WHERE tablename = 'reviews'
    AND schemaname = 'public'
ORDER BY policyname;

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'reviews'
    AND schemaname = 'public';

