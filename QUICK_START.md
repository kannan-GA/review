# Quick Start Guide

Get your review widget up and running in 5 minutes!

## 1. Clone and Install

```bash
git clone https://github.com/your-username/review-widget.git
cd review-widget/bolt-review-system
npm install
```

## 2. Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase/setup.sql`
4. Go to Settings > API and copy:
   - Project URL
   - anon/public key

## 3. Configure Environment

Create `.env` file:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## 5. Build Widget

```bash
npm run build:widget
```

The widget will be in `dist/widget/review-widget.iife.js`

## 6. Deploy to Vercel

1. Push to GitHub (see [GITHUB_SETUP.md](./GITHUB_SETUP.md))
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables
5. Deploy!

## 7. Embed Widget

Add to any website:

```html
<script 
  src="https://your-app.vercel.app/widget/review-widget.iife.js"
  data-review-widget
  data-product-id="product-123"
  data-supabase-url="your-supabase-url"
  data-supabase-key="your-supabase-key"
></script>

<div id="review-widget-container"></div>
```

Done! 🎉

## Need Help?

- [Full Documentation](./README.md)
- [Widget Integration](./WIDGET_INTEGRATION.md)
- [Deployment Guide](./DEPLOYMENT.md)

