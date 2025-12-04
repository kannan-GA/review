/*
  # Add order_id to reviews table

  1. Changes
    - Add `order_id` column to `reviews` table
    - Create foreign key relationship to `orders` table
    - Add index for faster queries

  2. Notes
    - Links reviews to specific orders
    - Allows tracking which order a review came from
    - Enables verified purchase verification
*/

-- Add order_id column to reviews table
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);

-- Add comment for documentation
COMMENT ON COLUMN reviews.order_id IS 'Links review to the order it was submitted for';

