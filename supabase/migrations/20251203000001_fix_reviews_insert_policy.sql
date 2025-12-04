/*
  # Fix Reviews Insert RLS Policy

  This migration fixes the Row Level Security policy for inserting reviews.
  The previous policy may not have been working correctly for anonymous users.

  1. Changes
    - Drop existing insert policy if it exists
    - Create a new policy that explicitly allows anonymous inserts
    - Ensure the policy works for both authenticated and anonymous users

  2. Notes
    - This allows anyone (including anonymous users) to insert reviews
    - The policy uses WITH CHECK (true) to allow all inserts
*/

-- Drop existing insert policy if it exists
DROP POLICY IF EXISTS "Anyone can insert reviews" ON reviews;

-- Create a new policy that explicitly allows anonymous and authenticated inserts
-- Using 'public' role allows both anonymous and authenticated users
CREATE POLICY "Allow public review inserts"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (true);

