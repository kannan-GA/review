-- Fix Reviews Insert Policy
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public review inserts" ON reviews;

CREATE POLICY "Allow public review inserts"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Fix Orders Policies
-- Drop ALL existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view their orders" ON orders;
DROP POLICY IF EXISTS "Admin users can view all orders" ON orders;
DROP POLICY IF EXISTS "Service role can insert orders" ON orders;
DROP POLICY IF EXISTS "Allow service role order inserts" ON orders;
DROP POLICY IF EXISTS "Allow authenticated order inserts" ON orders;
DROP POLICY IF EXISTS "Allow public order reads" ON orders;
DROP POLICY IF EXISTS "Allow public order inserts" ON orders;

-- Now create the new policies
CREATE POLICY "Allow public order reads"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public order inserts"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

