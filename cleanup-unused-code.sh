#!/bin/bash

# Script to remove unused code and components
# Run with: bash cleanup-unused-code.sh

echo "Starting cleanup of unused code..."

# Remove unused UI component
if [ -f "src/components/ui/input-otp.tsx" ]; then
    rm src/components/ui/input-otp.tsx
    echo "✓ Removed unused input-otp component"
fi

# Remove unused edge functions
UNUSED_FUNCTIONS=(
    "complete-skills-gap-signup"
    "cv-analyze"
    "cv-process"
    "delete-cv-data"
    "extract-skills"
    "finalize-skills-profile"
    "generate-course"
    "generate-course-agents"
    "generate-educational-video"
    "send-magic-link"
    "skills-gap-signup"
    "sync-hris-employees"
    "upload-cv"
    "verify-skills-gap-email"
)

for func in "${UNUSED_FUNCTIONS[@]}"; do
    if [ -d "supabase/functions/$func" ]; then
        rm -rf "supabase/functions/$func"
        echo "✓ Removed unused edge function: $func"
    fi
done

echo ""
echo "Cleanup complete! Next steps:"
echo "1. Remove localStorage lines from EarlyAccessLogin.tsx (lines ~204-205)"
echo "2. Consider consolidating CV analysis edge functions"
echo "3. Consider renaming /admin-login to /company-login for clarity"
echo "4. Run 'npm run lint' and 'npx tsc --noEmit' to verify no broken imports"