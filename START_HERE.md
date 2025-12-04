# 🚀 START HERE - Simple Step-by-Step Guide

Follow these steps in order to get your review widget up and running:

## Step 1: Set Up Supabase (10 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `review-system`
   - Database password: (save this!)
   - Region: Choose closest to you
4. Wait 2-3 minutes for project to create
5. Go to **SQL Editor** → Click "New Query"
6. Open `supabase/setup.sql` file and copy ALL the code
7. Paste into SQL Editor and click **Run**
8. Go to **Settings** → **API**
9. Copy these values (you'll need them):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string)

## Step 2: Create Environment File (2 minutes)

1. In `bolt-review-system` folder, create a file named `.env`
2. Add this content (replace with YOUR values from Step 1):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Test Locally (5 minutes)

1. Open terminal in `bolt-review-system` folder
2. Run:
   ```bash
   npm install
   npm run dev
   ```
3. Open browser to `http://localhost:5173`
4. Test the review form - it should work!

## Step 4: Push to GitHub (5 minutes)

### Option A: Using Script (Easiest)
- **Windows**: Run `.\scripts\setup-github.ps1` in PowerShell
- **Mac/Linux**: Run `chmod +x scripts/setup-github.sh && ./scripts/setup-github.sh`

### Option B: Manual
1. Go to [github.com](https://github.com) and create new repository
2. In terminal, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

## Step 5: Deploy to Vercel (10 minutes)

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `bolt-review-system` (if needed)
   - **Build Command**: `npm run build:all`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - Click "Environment Variables"
   - Add `VITE_SUPABASE_URL` = your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` = your anon key
6. Click **Deploy**
7. Wait 2-3 minutes
8. Your app is live! Copy the URL (e.g., `https://your-project.vercel.app`)

## Step 6: Build Widget (2 minutes)

After Vercel deploys, the widget file will be at:
```
https://your-project.vercel.app/widget/review-widget.iife.js
```

## Step 7: Use Widget in Your Project

Add this to any HTML page:

```html
<script 
  src="https://your-project.vercel.app/widget/review-widget.iife.js"
  data-review-widget
  data-product-id="product-123"
  data-supabase-url="https://xxxxx.supabase.co"
  data-supabase-key="your_anon_key"
></script>

<div id="review-widget-container"></div>
```

## ✅ Done!

Your review widget is now:
- ✅ Set up with Supabase
- ✅ Deployed on Vercel
- ✅ Ready to embed anywhere

## Need Help?

- Can't find Supabase keys? → See `ENV_SETUP.md`
- Widget not working? → See `WIDGET_INTEGRATION.md`
- Deployment issues? → See `DEPLOYMENT.md`

