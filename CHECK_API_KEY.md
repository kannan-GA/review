# API Key Verification Checklist

## Step 1: Verify Environment Variables

### For Local Development:
1. Check if `.env` file exists in the root directory
2. Open `.env` file and verify:
   ```env
   VITE_SUPABASE_URL=https://vrxrpqsiwgfoaepyuqjw.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Make sure there are NO spaces around the `=` sign
4. Make sure the values are NOT wrapped in quotes (unless they contain spaces)

### For Production (Vercel):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these variables are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Make sure they're set for the correct environment (Production, Preview, Development)

## Step 2: Get Correct API Keys from Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `vrxrpqsiwgfoaepyuqjw`
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL**: Should be `https://vrxrpqsiwgfoaepyuqjw.supabase.co`
   - **anon public** key: This is the long JWT token (starts with `eyJ...`)

## Step 3: Verify the Key in Browser Console

1. Open your deployed app: `https://review-red-kappa.vercel.app`
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Look for these console.log messages:
   - `supabaseUrl` - should show your Supabase URL
   - `supabaseKey` - should show your anon key (first few characters)

## Step 4: Test the API Key Directly

Run this curl command (replace with your actual anon key):

```bash
curl 'https://vrxrpqsiwgfoaepyuqjw.supabase.co/rest/v1/reviews?select=*' \
  -H 'apikey: YOUR_ANON_KEY_HERE' \
  -H 'Authorization: Bearer YOUR_ANON_KEY_HERE'
```

If this returns data (even empty array), the key works.
If it returns 401, the key is wrong or expired.

## Step 5: Common Issues

### Issue: Key is undefined
- **Solution**: Restart dev server after creating/updating `.env` file
- **For Vercel**: Redeploy after adding environment variables

### Issue: Wrong key type
- **Solution**: Make sure you're using the **anon public** key, NOT the service_role key
- The anon key is safe to use in client-side code
- The service_role key should NEVER be used in client-side code

### Issue: Key format
- **Solution**: The key should be a JWT token starting with `eyJ`
- It should be very long (hundreds of characters)
- No quotes, no spaces

## Step 6: Quick Fix Script

If you're unsure, create/update your `.env` file:

```env
VITE_SUPABASE_URL=https://vrxrpqsiwgfoaepyuqjw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeHJwcXNpd2dmb2FlcHl1cWp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MTc5NTQsImV4cCI6MjA4MDM5Mzk1NH0.i8Qisf8J4JSdxdyW6H3G6p6OmF8zOzTzuO7XSBdNhSU
```

Then:
1. **Local**: Restart dev server (`npm run dev`)
2. **Vercel**: Go to Settings → Environment Variables → Update → Redeploy

