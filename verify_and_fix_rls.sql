-- ============================================
-- VERIFY AND FIX RLS POLICIES
-- ============================================
-- This script will:
-- 1. Show existing policies
-- 2. Drop all conflicting policies
-- 3. Create the correct policies

-- ============================================
-- STEP 1: Check existing policies (for reference)
-- ============================================
-- Uncomment to see what policies exist:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename IN ('reviews', 'orders')
-- ORDER BY tablename, policyname;

-- ============================================
-- STEP 2: Fix REVIEWS table policies
-- ============================================

-- Drop ALL existing policies on reviews table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reviews') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON reviews', r.policyname);
    END LOOP;
END $$;

-- Create SELECT policy: Anyone can view approved reviews
CREATE POLICY "Allow public to view approved reviews"
  ON reviews
  FOR SELECT
  TO public
  USING (status = 'approved');

-- Create INSERT policy: Anyone can insert reviews
CREATE POLICY "Allow public to insert reviews"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================
-- STEP 3: Fix ORDERS table policies
-- ============================================

-- Drop ALL existing policies on orders table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON orders', r.policyname);
    END LOOP;
END $$;

-- Create SELECT policy: Anyone can read orders (needed for order verification)
CREATE POLICY "Allow public to read orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

-- Create INSERT policy: Anyone can insert orders
CREATE POLICY "Allow public to insert orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================
-- STEP 4: Verify RLS is enabled
-- ============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Verify policies were created
-- ============================================
-- Uncomment to verify:
-- SELECT tablename, policyname, cmd, roles
-- FROM pg_policies 
-- WHERE tablename IN ('reviews', 'orders')
-- ORDER BY tablename, policyname;

