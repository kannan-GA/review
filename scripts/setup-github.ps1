# GitHub Setup Script for Windows PowerShell
# This script helps you push your code to GitHub

Write-Host "🚀 Review Widget - GitHub Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  Warning: .env file not found" -ForegroundColor Yellow
    Write-Host "   Create .env file with your Supabase credentials" -ForegroundColor Yellow
    Write-Host "   See ENV_SETUP.md for details" -ForegroundColor Yellow
}

# Add all files
Write-Host ""
Write-Host "📝 Staging files..." -ForegroundColor Yellow
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    Write-Host "💾 Creating commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: Review widget system with Supabase integration"
    Write-Host "✅ Commit created" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No changes to commit" -ForegroundColor Cyan
}

# Ask for GitHub repository URL
Write-Host ""
$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "❌ No repository URL provided. Exiting." -ForegroundColor Red
    exit 1
}

# Check if remote already exists
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "🔄 Updating remote origin..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
} else {
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
    git remote add origin $repoUrl
}

# Push to GitHub
Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Set up Supabase (see ENV_SETUP.md)"
    Write-Host "2. Deploy to Vercel (see DEPLOYMENT.md)"
    Write-Host "3. Test the widget (see WIDGET_INTEGRATION.md)"
} else {
    Write-Host ""
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host "   Make sure you have:" -ForegroundColor Yellow
    Write-Host "   - Created the repository on GitHub"
    Write-Host "   - Set up authentication (SSH key or personal access token)"
}

