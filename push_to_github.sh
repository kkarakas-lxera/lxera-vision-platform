#!/bin/bash

echo "GitHub Push Script for LXERA Vision Platform"
echo "============================================"
echo ""
echo "This script will push your changes to GitHub."
echo ""
echo "IMPORTANT: GitHub now requires Personal Access Tokens instead of passwords."
echo "If you haven't created one yet:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Give it a name like 'LXERA Push Token'"
echo "4. Select 'repo' scope"
echo "5. Generate and copy the token"
echo ""
echo "When prompted:"
echo "- Username: kkarakas-lxera"
echo "- Password: [paste your Personal Access Token]"
echo ""
echo "Press Enter to continue..."
read

# Push to GitHub
git push origin main

echo ""
echo "Push complete! Check the output above for any errors."