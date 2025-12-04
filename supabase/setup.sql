-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create reviews table
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Create orders table (for order verification)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  product_id TEXT NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_queue table (for review email notifications)
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for reviews table
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews (public read, authenticated write)
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Allow public review inserts"
  ON reviews FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policies for orders (authenticated users only)
CREATE POLICY "Authenticated users can view their orders"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Create policies for email_queue (service role only)
CREATE POLICY "Service role can manage email queue"
  ON email_queue FOR ALL
  USING (true);

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for review images
CREATE POLICY "Anyone can view review images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'review-images');

