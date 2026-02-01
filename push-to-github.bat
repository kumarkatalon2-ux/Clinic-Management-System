@echo off
REM This script pushes your code to GitHub safely

cd "c:\Users\Kumar\Desktop\Clinical Project"

echo.
echo ========================================
echo Clinical Management System - GitHub Push
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo ❌ Git not initialized. Initializing now...
    git init
    git config user.name "Kumar"
    git config user.email "kumarkatalon2@gmail.com"
)

REM Stage all files
echo ✅ Staging files...
git add --all

REM Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo ℹ️ No new changes to commit
) else (
    echo ✅ Committing files...
    git commit -m "Clinical Management System - Complete application with deployment guides"
)

REM Ensure we're on main branch
git branch -M main

REM Remove old remote if exists
git remote remove origin 2>nul

REM Add remote
echo ✅ Adding remote repository...
git remote add origin https://github.com/kumarkatalon2-ux/Clinic-Management-System.git

REM Configure git credentials helper
echo ✅ Configuring credentials...
git config --global credential.helper wincred

REM Push to GitHub
echo.
echo 📤 Pushing to GitHub...
echo (Enter your GitHub username and Personal Access Token when prompted)
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS! Your code has been pushed to GitHub!
    echo.
    echo 🔗 View your repository:
    echo    https://github.com/kumarkatalon2-ux/Clinic-Management-System
    echo.
) else (
    echo.
    echo ❌ Push failed. Check your token and try again.
    echo.
)

pause
