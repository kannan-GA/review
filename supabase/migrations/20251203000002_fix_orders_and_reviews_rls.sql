/*
  # Fix Orders and Reviews RLS Policies for Anonymous Access

  This migration fixes RLS policies to allow anonymous users to:
  1. Insert reviews (for public review submission)
  2. Read orders by order_id (for order verification in review flow)

  1. Changes
    - Fix reviews insert policy to allow anonymous users
    - Add orders select policy to allow anonymous users to read orders by order_id
    - This is needed for the order review page to work

  2. Notes
    - Orders can be read by anyone (needed for order verification)
    - Reviews can be inserted by anyone (needed for public review submission)
*/

-- ============================================
-- FIX REVIEWS TABLE POLICIES
-- ============================================

-- Drop existing insert policy if it exists (in case migration wasn't run)
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public review inserts" ON reviews;

-- Create policy that allows anonymous users to insert reviews
CREATE POLICY "Allow public review inserts"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ============================================
-- FIX ORDERS TABLE POLICIES
-- ============================================

-- Drop ALL existing policies on orders table to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view their orders" ON orders;
DROP POLICY IF EXISTS "Admin users can view all orders" ON orders;
DROP POLICY IF EXISTS "Service role can insert orders" ON orders;
DROP POLICY IF EXISTS "Allow service role order inserts" ON orders;
DROP POLICY IF EXISTS "Allow authenticated order inserts" ON orders;
DROP POLICY IF EXISTS "Allow public order reads" ON orders;
DROP POLICY IF EXISTS "Allow public order inserts" ON orders;

-- Allow anyone to read orders (needed for order verification in review flow)
CREATE POLICY "Allow public order reads"
  ON orders
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert orders (needed for webhooks/backend that use anon key)
-- Service role bypasses RLS, but this allows anon key inserts too
-- Using 'public' covers both anonymous and authenticated users
CREATE POLICY "Allow public order inserts"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

