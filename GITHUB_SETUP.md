# GitHub Repository Setup

This guide will help you set up the GitHub repository and push your code.

## Step 1: Initialize Git Repository

If you haven't already initialized git:

```bash
cd bolt-review-system
git init
```

## Step 2: Create .gitignore

The `.gitignore` file is already created. It includes:
- `node_modules/`
- `dist/`
- `.env` files
- Editor files
- Build artifacts

## Step 3: Stage and Commit Files

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Review widget system with Supabase integration"
```

## Step 4: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `review-widget` (or your preferred name)
3. Description: "Embeddable review widget system"
4. Choose Public or Private
5. **Don't** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 5: Connect and Push

```bash
# Add remote (replace with your username and repo name)
git remote add origin https://github.com/YOUR_USERNAME/review-widget.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 6: Set Up GitHub Secrets (Optional - for CI/CD)

If you want to use GitHub Actions for deployment:

1. Go to your repository on GitHub
2. Click Settings > Secrets and variables > Actions
3. Add the following secrets:
   - `VERCEL_TOKEN` - Get from Vercel account settings
   - `VERCEL_ORG_ID` - Get from Vercel project settings
   - `VERCEL_PROJECT_ID` - Get from Vercel project settings
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## Step 7: Enable GitHub Actions (Optional)

The workflow file (`.github/workflows/deploy.yml`) is already created. To use it:

1. Make sure secrets are set (Step 6)
2. Push to main branch
3. Actions will run automatically

## Repository Structure

Your repository should look like this:

```
review-widget/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── widget/
│   └── ...
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── setup.sql
├── .gitignore
├── package.json
├── README.md
├── DEPLOYMENT.md
├── WIDGET_INTEGRATION.md
└── vercel.json
```

## Next Steps

After pushing to GitHub:

1. Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Vercel
2. Set up Supabase (see [ENV_SETUP.md](./ENV_SETUP.md))
3. Test the widget integration (see [WIDGET_INTEGRATION.md](./WIDGET_INTEGRATION.md))

## Troubleshooting

### Authentication Issues

If you get authentication errors:

```bash
# Use GitHub CLI
gh auth login

# Or use SSH instead of HTTPS
git remote set-url origin git@github.com:YOUR_USERNAME/review-widget.git
```

### Large Files

If you have large files, consider using Git LFS:

```bash
git lfs install
git lfs track "*.psd"
git add .gitattributes
```

### Branch Protection

To protect the main branch:

1. Go to Settings > Branches
2. Add rule for `main` branch
3. Require pull request reviews
4. Require status checks to pass

