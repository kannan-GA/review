# Deployment Guide

This guide covers deploying the Review Widget to Vercel and setting up Supabase.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Supabase account (free tier available)
- Node.js 18+ installed locally

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Project Name: `review-system`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be created (2-3 minutes)

### 1.2 Set Up Database

1. In Supabase Dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste the contents of `supabase/setup.sql`
4. Click "Run" to execute the SQL
5. Verify tables are created in Table Editor

### 1.3 Get API Keys

1. Go to Settings > API
2. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - anon/public key
   - service_role key (keep this secret!)

## Step 2: Push to GitHub

### 2.1 Initialize Git Repository

```bash
cd bolt-review-system
git init
git add .
git commit -m "Initial commit: Review widget system"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository (e.g., `review-widget`)
3. Don't initialize with README (we already have files)

### 2.3 Push to GitHub

```bash
git remote add origin https://github.com/your-username/review-widget.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite configuration

### 3.2 Configure Build Settings

- **Framework Preset**: Vite
- **Root Directory**: `bolt-review-system` (if repo is in subdirectory)
- **Build Command**: `npm run build:all`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Add Environment Variables

In Vercel project settings, add:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

## Step 4: Update Widget URLs

After deployment, update the widget integration URLs in:
- `WIDGET_INTEGRATION.md`
- Any documentation or examples

The widget will be available at:
- Main app: `https://your-project.vercel.app`
- Widget file: `https://your-project.vercel.app/widget/review-widget.iife.js`

## Step 5: Test the Widget

1. Visit your deployed app
2. Test the review form
3. Check Supabase dashboard to verify reviews are being saved
4. Test widget embedding on a test page

## Continuous Deployment

Vercel automatically deploys on every push to main branch. For other branches, it creates preview deployments.

## Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update widget URLs in your integration code

## Monitoring

- Check Vercel dashboard for deployment status
- Monitor Supabase dashboard for database usage
- Set up error tracking (e.g., Sentry) for production

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify all dependencies are in `package.json`
- Ensure Node.js version is compatible

### Widget Not Loading
- Check CORS settings in Vercel
- Verify widget file is accessible
- Check browser console for errors

### Database Errors
- Verify Supabase credentials are correct
- Check RLS policies allow necessary operations
- Ensure tables are created correctly

