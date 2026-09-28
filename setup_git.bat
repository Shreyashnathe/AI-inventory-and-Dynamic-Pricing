@echo off
REM Script to initialize Git repository and push to GitHub
REM Save this as setup_git.bat and run by double-clicking

echo Initializing Git repository...

REM Check if we're already in a git repository
if exist ".git" (
    echo Already in a Git repository
) else (
    REM Initialize git repository
    git init
    echo Git repository initialized
)

REM Add all files
git add .

REM Make the first commit
git commit -m "Initial commit: StockPulse AI Inventory & Dynamic Pricing Engine"

REM Check if main branch exists and switch if needed
git checkout -b main

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Create a new repository on GitHub
echo 2. Add your GitHub repository as remote origin:
echo    git remote add origin https://github.com/YOUR_USERNAME/StockPulse-AI-Inventory-Dynamic-Pricing.git
echo 3. Push to GitHub:
echo    git push -u origin main
echo.

pause