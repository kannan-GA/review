/*
  # Fix Database Security Issues

  This migration addresses security and performance issues identified in the database:

  1. **Add Missing Index**
     - Add index on `admin_sessions.admin_user_id` to cover the foreign key for optimal query performance

  2. **Remove Unused Indexes**
     The following indexes were created but are not being used by queries:
     - `idx_orders_order_id` - Redundant with UNIQUE constraint index `orders_order_id_key`
     - `idx_orders_customer_email` - Not used in current queries
     - `idx_email_queue_status_scheduled` - Not used in current queries
     - `idx_email_queue_order_id` - Not used in current queries
     - `idx_reviews_product_status` - Not used in current queries
     - `idx_reviews_status` - Not used in current queries
     - `idx_reviews_created_at` - Not used in current queries
     - `idx_products_product_id` - Redundant with UNIQUE constraint index `products_product_id_key`
     - `idx_admin_users_email` - Redundant with UNIQUE constraint index `admin_users_email_key`
     - `idx_admin_sessions_token` - Redundant with UNIQUE constraint index `admin_sessions_session_token_key`
     - `idx_admin_sessions_expires` - Not used in current queries

  3. **Fix Function Search Path Security**
     - Update `update_updated_at_column` function with immutable search_path to prevent security vulnerabilities

  ## Security Notes
  - Foreign key indexes improve join performance and prevent table locks
  - Removing unused indexes reduces storage overhead and improves write performance
  - Setting search_path in functions prevents potential SQL injection attacks
*/

-- 1. Add missing foreign key index for admin_sessions
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_user_id ON admin_sessions(admin_user_id);

-- 2. Drop unused indexes
DROP INDEX IF EXISTS idx_orders_order_id;
DROP INDEX IF EXISTS idx_orders_customer_email;
DROP INDEX IF EXISTS idx_email_queue_status_scheduled;
DROP INDEX IF EXISTS idx_email_queue_order_id;
DROP INDEX IF EXISTS idx_reviews_product_status;
DROP INDEX IF EXISTS idx_reviews_status;
DROP INDEX IF EXISTS idx_reviews_created_at;
DROP INDEX IF EXISTS idx_products_product_id;
DROP INDEX IF EXISTS idx_admin_users_email;
DROP INDEX IF EXISTS idx_admin_sessions_token;
DROP INDEX IF EXISTS idx_admin_sessions_expires;

-- 3. Fix function search path security issue
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;