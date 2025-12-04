# Manual RLS Policy Setup in Supabase Dashboard

## Step-by-Step Guide

### Step 1: Open Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project: `vrxrpqsiwgfoaepyuqjw`

### Step 2: Navigate to Table Editor
1. Click on **Table Editor** in the left sidebar
2. Find and click on the **`reviews`** table

### Step 3: Open RLS Policies
1. Click on the **"Policies"** tab (next to "Columns", "Indexes", etc.)
2. You should see a list of existing policies

### Step 4: Delete Existing Policies (if any)
1. For each existing policy on the `reviews` table:
   - Click on the policy name
   - Click the **"Delete"** or trash icon
   - Confirm deletion

### Step 5: Create New INSERT Policy
1. Click the **"New Policy"** button (usually at the top right)
2. Choose **"Create a policy from scratch"** or **"For full customization"**
3. Fill in the form:
   - **Policy name**: `reviews_insert_anon`
   - **Allowed operation**: Select **"INSERT"**
   - **Target roles**: Select **"anon"** (or check the box for "anon")
   - **USING expression**: Leave empty or put `true`
   - **WITH CHECK expression**: Put `true`
4. Click **"Review"** or **"Save"**

### Step 6: Create SELECT Policy (if needed)
1. Click **"New Policy"** again
2. Fill in:
   - **Policy name**: `reviews_select_approved`
   - **Allowed operation**: Select **"SELECT"**
   - **Target roles**: Select **"public"** (or check "public")
   - **USING expression**: Put `status = 'approved'`
   - **WITH CHECK expression**: Leave empty
3. Click **"Save"**

### Step 7: Verify RLS is Enabled
1. Still in the **"Policies"** tab
2. Look for a toggle or setting that says **"Enable Row Level Security"**
3. Make sure it's **ON/Enabled** (should be green/checked)

### Alternative: Using SQL Editor (Easier)
If the UI is confusing, you can also:

1. Go to **SQL Editor** in the left sidebar
2. Click **"New Query"**
3. Paste this simple SQL:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "reviews_insert_anon" ON reviews;
DROP POLICY IF EXISTS "reviews_insert_public" ON reviews;
DROP POLICY IF EXISTS "reviews_select_approved" ON reviews;

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy for anonymous users
CREATE POLICY "reviews_insert_anon"
  ON reviews
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create SELECT policy
CREATE POLICY "reviews_select_approved"
  ON reviews
  FOR SELECT
  TO public
  USING (status = 'approved');
```

4. Click **"Run"** button (or press Ctrl+Enter)

### Step 8: Test
After creating the policy:
1. Go back to your app or run the test script
2. Try inserting a review
3. It should work now!

## Troubleshooting

### If you can't find the Policies tab:
- Make sure you're viewing the `reviews` table
- Some Supabase versions have it under **"Authentication" → "Policies"** in the left sidebar

### If the policy doesn't work:
- Make sure RLS is enabled (toggle should be ON)
- Check that the policy shows `anon` in the roles column
- Try creating a policy with no role restriction (leave roles empty or select "public")

### Quick Check:
After creating the policy, you should see:
- Policy name: `reviews_insert_anon`
- Operation: `INSERT`
- Roles: `anon` or `{anon}`
- WITH CHECK: `true`

