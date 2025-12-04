#!/bin/bash

# GitHub Setup Script
# This script helps you push your code to GitHub

echo "🚀 Review Widget - GitHub Setup"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already initialized"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "   Create .env file with your Supabase credentials"
    echo "   See ENV_SETUP.md for details"
fi

# Add all files
echo ""
echo "📝 Staging files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    echo "💾 Creating commit..."
    git commit -m "Initial commit: Review widget system with Supabase integration"
    echo "✅ Commit created"
fi

# Ask for GitHub repository URL
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ No repository URL provided. Exiting."
    exit 1
fi

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo "🔄 Updating remote origin..."
    git remote set-url origin "$REPO_URL"
else
    echo "🔗 Adding remote origin..."
    git remote add origin "$REPO_URL"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "Next steps:"
    echo "1. Set up Supabase (see ENV_SETUP.md)"
    echo "2. Deploy to Vercel (see DEPLOYMENT.md)"
    echo "3. Test the widget (see WIDGET_INTEGRATION.md)"
else
    echo ""
    echo "❌ Failed to push to GitHub"
    echo "   Make sure you have:"
    echo "   - Created the repository on GitHub"
    echo "   - Set up authentication (SSH key or personal access token)"
fi

