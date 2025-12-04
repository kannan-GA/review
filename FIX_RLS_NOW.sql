-- ============================================
-- COMPLETE RLS FIX FOR REVIEWS AND ORDERS
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Drop ALL existing policies on reviews table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reviews' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.reviews', r.policyname);
    END LOOP;
END $$;

-- Step 2: Drop ALL existing policies on orders table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', r.policyname);
    END LOOP;
END $$;

-- Step 3: Ensure RLS is enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Step 4: Create reviews policies
-- SELECT: Anyone can view approved reviews
CREATE POLICY "reviews_select_approved"
  ON public.reviews
  FOR SELECT
  TO public
  USING (status = 'approved');

-- INSERT: Anyone (including anonymous) can insert reviews
CREATE POLICY "reviews_insert_public"
  ON public.reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Step 5: Create orders policies
-- SELECT: Anyone can read orders (needed for order verification)
CREATE POLICY "orders_select_public"
  ON public.orders
  FOR SELECT
  TO public
  USING (true);

-- INSERT: Anyone can insert orders
CREATE POLICY "orders_insert_public"
  ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Step 6: Verify policies were created
SELECT 
    tablename, 
    policyname, 
    cmd as operation,
    roles
FROM pg_policies 
WHERE tablename IN ('reviews', 'orders') 
    AND schemaname = 'public'
ORDER BY tablename, policyname;

