#!/bin/bash

# Script to initialize Git repository and push to GitHub
# Save this as setup_git.sh and run: bash setup_git.sh

echo "Initializing Git repository..."

# Check if we're already in a git repository
if [ -d ".git" ]; then
    echo "Already in a Git repository"
else
    # Initialize git repository
    git init
    echo "Git repository initialized"
fi

# Add all files
git add .

# Make the first commit
git commit -m "Initial commit: StockPulse AI Inventory & Dynamic Pricing Engine"

# Check if main branch exists and switch if needed
git checkout -b main

# Add remote origin (replace with your actual repository URL)
# Uncomment the line below and replace with your repository URL
# git remote add origin https://github.com/YOUR_USERNAME/StockPulse-AI-Inventory-Dynamic-Pricing.git

# Push to GitHub
# Uncomment the line below to push to GitHub
# git push -u origin main

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Replace the URL in this script with your repository URL"
echo "3. Uncomment the 'git remote add' and 'git push' lines"
echo "4. Run the script again"