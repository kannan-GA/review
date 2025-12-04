-- ============================================
-- VERIFY SUPABASE API KEY AND RLS SETUP
-- ============================================
-- This script helps verify your setup is correct

-- 1. Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'reviews'
    AND schemaname = 'public';

-- 2. Show all policies on reviews table
SELECT 
    tablename,
    policyname,
    cmd as operation,
    roles,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'reviews'
    AND schemaname = 'public'
ORDER BY policyname;

-- 3. Check if there's an INSERT policy
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'reviews'
    AND schemaname = 'public'
    AND cmd = 'INSERT';

-- Expected result: You should see at least one INSERT policy with roles containing 'public' or 'anon'

