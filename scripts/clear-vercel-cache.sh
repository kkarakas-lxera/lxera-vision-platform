#!/bin/bash

# Script to force Vercel to clear build cache
# This can be run before deployment to ensure fresh builds

echo "Clearing Vercel build cache..."

# Update a dummy file to force cache invalidation
echo "/* Cache bust: $(date +%s) */" > src/cache-bust.css

# Clean local build artifacts
rm -rf dist
rm -rf .vercel

echo "Cache clearing complete. Ready for fresh deployment."