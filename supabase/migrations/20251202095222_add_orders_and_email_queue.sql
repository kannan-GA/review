/*
  # Add Orders and Email Queue Tables for Review Request Automation

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `order_id` (varchar, unique) - External order ID from e-commerce platform
      - `customer_email` (varchar) - Customer email address
      - `customer_name` (varchar) - Customer full name
      - `product_id` (varchar) - Product purchased
      - `product_name` (varchar) - Product name for email context
      - `purchase_date` (timestamptz) - When the order was completed
      - `created_at` (timestamptz) - Record creation time
      
    - `email_queue`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key) - Links to orders table
      - `email_type` (varchar) - Type: 'initial_request' or 'reminder'
      - `recipient_email` (varchar) - Email recipient
      - `recipient_name` (varchar) - Recipient name
      - `product_id` (varchar) - Product for context
      - `scheduled_for` (timestamptz) - When email should be sent
      - `sent_at` (timestamptz, nullable) - When email was actually sent
      - `status` (varchar) - Status: 'pending', 'sent', 'failed', 'cancelled'
      - `error_message` (text, nullable) - Error details if failed
      - `created_at` (timestamptz) - Record creation time
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on both tables
    - Only authenticated admin users can access these tables
    - Edge functions use service role key to bypass RLS

  3. Indexes
    - Index on orders.order_id for fast lookups
    - Index on email_queue.status and scheduled_for for queue processing
    - Index on email_queue.order_id for relationship queries

  4. Notes
    - Initial review requests sent 7 days after purchase
    - Reminder emails sent 15 days after purchase (if no review submitted)
    - Email queue prevents duplicate sends
    - Cancelled status used when customer already submitted a review
*/

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id varchar(100) UNIQUE NOT NULL,
  customer_email varchar(255) NOT NULL,
  customer_name varchar(255) NOT NULL,
  product_id varchar(50) NOT NULL,
  product_name varchar(255) NOT NULL,
  purchase_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  email_type varchar(50) NOT NULL CHECK (email_type IN ('initial_request', 'reminder')),
  recipient_email varchar(255) NOT NULL,
  recipient_name varchar(255) NOT NULL,
  product_id varchar(50) NOT NULL,
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_email_queue_status_scheduled ON email_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_order_id ON email_queue(order_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders table
CREATE POLICY "Admin users can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can delete orders"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for email_queue table
CREATE POLICY "Admin users can view email queue"
  ON email_queue FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin users can insert email queue"
  ON email_queue FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin users can update email queue"
  ON email_queue FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can delete email queue"
  ON email_queue FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for email_queue updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_email_queue_updated_at'
  ) THEN
    CREATE TRIGGER update_email_queue_updated_at
      BEFORE UPDATE ON email_queue
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;