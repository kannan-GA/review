-- ============================================
-- COMPLETE SUPABASE SETUP - RUN THIS NOW
-- ============================================
-- This script sets up everything from scratch:
-- 1. Creates all tables
-- 2. Sets up indexes
-- 3. Creates triggers
-- 4. Enables RLS with correct policies
-- ============================================

-- ============================================
-- STEP 1: Enable Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 2: Create Reviews Table
-- ============================================
-- Drop table if it exists with wrong schema (optional - only if you want fresh start)
-- DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  author TEXT,
  avatar_url TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add order_id column separately to ensure it's UUID type
-- This handles the case where table exists but column doesn't, or has wrong type
DO $$ 
BEGIN
    -- If column exists but is wrong type (TEXT/VARCHAR), drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'order_id' 
        AND data_type IN ('text', 'character varying')
    ) THEN
        ALTER TABLE reviews DROP COLUMN order_id;
    END IF;
    
    -- Add column as UUID if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' AND column_name = 'order_id'
    ) THEN
        ALTER TABLE reviews ADD COLUMN order_id UUID;
    END IF;
END $$;

-- ============================================
-- STEP 3: Create Orders Table
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  purchase_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 4: Create Email Queue Table
-- ============================================
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('review_submitted', 'review_approved', 'incentive_link')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 5: Fix order_id column type and add Foreign Key
-- ============================================
-- Handle order_id column: ensure it exists as UUID type (not TEXT)
DO $$ 
BEGIN
    -- If column exists but is wrong type (TEXT/VARCHAR), drop it first
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'order_id' 
        AND data_type IN ('text', 'character varying', 'varchar')
    ) THEN
        -- Drop any existing foreign key constraint first
        ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_order_id_fkey;
        -- Drop the column
        ALTER TABLE reviews DROP COLUMN order_id;
    END IF;
    
    -- Add column as UUID if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        AND column_name = 'order_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE reviews ADD COLUMN order_id UUID;
    END IF;
    
    -- Now add the foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'reviews_order_id_fkey'
        AND table_name = 'reviews'
    ) THEN
        ALTER TABLE reviews 
        ADD CONSTRAINT reviews_order_id_fkey 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- STEP 6: Create Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);

-- ============================================
-- STEP 7: Create Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- STEP 8: Create Triggers
-- ============================================
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 9: Enable Row Level Security
-- ============================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 10: Drop ALL Existing Policies (Clean Slate)
-- ============================================
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on reviews
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'reviews' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.reviews', r.policyname);
    END LOOP;
    
    -- Drop all policies on orders
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'orders' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.orders', r.policyname);
    END LOOP;
    
    -- Drop all policies on email_queue
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'email_queue' AND schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.email_queue', r.policyname);
    END LOOP;
END $$;

-- ============================================
-- STEP 11: Create Reviews Policies
-- ============================================
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

-- ============================================
-- STEP 12: Create Orders Policies
-- ============================================
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

-- ============================================
-- STEP 13: Create Email Queue Policies
-- ============================================
-- Allow service role to manage email queue (service role bypasses RLS anyway)
CREATE POLICY "email_queue_all_public"
  ON public.email_queue
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 14: Create Storage Bucket (if needed)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 15: Create Storage Policies
-- ============================================
-- Drop existing storage policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage'
        AND policyname LIKE '%review-images%'
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
    END LOOP;
END $$;

-- Anyone can view review images
CREATE POLICY "review_images_select_public"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'review-images');

-- Anyone can upload review images
CREATE POLICY "review_images_insert_public"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'review-images');

-- ============================================
-- STEP 16: Verify Setup
-- ============================================
-- Show all created policies
SELECT 
    tablename, 
    policyname, 
    cmd as operation,
    roles
FROM pg_policies 
WHERE tablename IN ('reviews', 'orders', 'email_queue') 
    AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('reviews', 'orders', 'email_queue')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

