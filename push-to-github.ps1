#!/usr/bin/env pwsh
# Push Clinical Management System to GitHub

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Clinical Management System - GitHub Push" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Set-Location "c:\Users\Kumar\Desktop\Clinical Project"

# Check git initialization
if (-not (Test-Path .git)) {
    Write-Host "✅ Initializing Git repository..." -ForegroundColor Green
    git init
    git config user.name "Kumar"
    git config user.email "kumarkatalon2@gmail.com"
}

# Stage files
Write-Host "✅ Staging files..." -ForegroundColor Green
git add --all

# Commit if there are changes
$output = git diff --cached --name-only
if ($output) {
    Write-Host "✅ Committing files..." -ForegroundColor Green
    git commit -m "Clinical Management System - Complete application with deployment guides"
} else {
    Write-Host "ℹ️ No new changes to commit" -ForegroundColor Yellow
}

# Switch to main branch
Write-Host "✅ Switching to main branch..." -ForegroundColor Green
git branch -M main

# Remove old remote
git remote remove origin 2>$null

# Add remote
Write-Host "✅ Adding remote repository..." -ForegroundColor Green
git remote add origin https://github.com/kumarkatalon2-ux/Clinic-Management-System.git

# Configure credentials
Write-Host "✅ Configuring Git credentials..." -ForegroundColor Green
git config --global credential.helper wincred

# Push
Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "When prompted, enter:" -ForegroundColor Yellow
Write-Host "  Username: kumarkatalon2-ux" -ForegroundColor White
Write-Host "  Password: Your new Personal Access Token" -ForegroundColor White
Write-Host ""

git push -u origin main

# Check result
if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ SUCCESS! Your code has been pushed to GitHub!" -ForegroundColor Green
    Write-Host "`n🔗 View your repository:" -ForegroundColor Cyan
    Write-Host "   https://github.com/kumarkatalon2-ux/Clinic-Management-System" -ForegroundColor Blue
    Write-Host ""
} else {
    Write-Host "`n❌ Push failed. Please check:" -ForegroundColor Red
    Write-Host "   1. Your Personal Access Token is correct" -ForegroundColor Yellow
    Write-Host "   2. Token has 'repo' permissions" -ForegroundColor Yellow
    Write-Host "   3. Token is not expired" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
