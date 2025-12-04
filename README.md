# Review System

A comprehensive review system for order-based reviews. Features include review submission, rating display, image uploads, order verification, and Supabase integration.

## Features

- ⭐ Star rating system
- 📝 Review form with image uploads
- 🔗 Order-specific review pages
- 🗄️ Supabase database integration
- 📧 Email notifications (optional)
- 🎯 Admin dashboard with review moderation
- 💰 Incentive system for 5-star reviews
- 🚀 Vercel deployment ready

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
review-system/
├── src/
│   ├── components/       # React components
│   ├── pages/           # Page components (Reviews, Admin, OrderReview)
│   └── types.ts         # TypeScript types
├── supabase/
│   ├── migrations/      # Database migrations
│   ├── functions/       # Edge functions
│   └── setup.sql        # Database setup
├── public/              # Static assets
└── dist/                # Build output
```

## Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Deploy to Vercel and Supabase
- [Environment Setup](./ENV_SETUP.md) - Configure environment variables
- [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes

## Usage

### For Customers - Add Review Link

In your e-commerce app, add a link to the review page:

```html
<!-- Simple HTML -->
<a href="https://your-app.vercel.app/#/review?orderId=ORDER-123">
  Add Review
</a>
```

```jsx
// React example
<Link to={`/#/review?orderId=${order.orderId}`}>
  Add Review
</Link>
```

### For Admins - Access Admin Dashboard

Add `?admin=true` to the URL or set in browser console:
```javascript
localStorage.setItem('isAdmin', 'true');
```

Then access: `https://your-app.vercel.app/#/admin`

## Environment Variables

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

See [ENV_SETUP.md](./ENV_SETUP.md) for details.

## Supabase Setup

1. Create a Supabase project
2. Run the SQL script from `supabase/setup.sql`
3. Get your API keys from Settings > API
4. Add keys to environment variables

## Deployment

### Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Supabase** - Backend & database
- **Vercel** - Hosting

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
