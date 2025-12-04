# Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Vercel Configuration (optional)
VERCEL_URL=your_vercel_url

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy the following:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `VITE_SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Setting up Supabase Database

1. Run the SQL script from `supabase/setup.sql` in your Supabase SQL Editor
2. Or use Supabase CLI:
   ```bash
   supabase db push
   ```

