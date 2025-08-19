#!/bin/bash

# Script to fix edge functions security issues
# This script will add import statements and fix error handling

FUNCTIONS_DIR="/Users/kubilaycenk/Lxera Stable/lxera-vision-platform/supabase/functions"

# List of function directories to fix
FUNCTIONS=(
  "cv-analyze"
  "extract-skills"
  "generate-course"
  "generate-educational-video"
  "generate-employee-insights"
  "generate-position-description"
  "generate-mission-questions"
  "suggest-position-skills-enhanced"
  "verify-otp-code"
  "verify-magic-link"
  "send-verification-code"
  "update-profile-progressive"
  "send-demo-email"
  "capture-email"
  "capture-contact-sales"
  "upload-cv"
  "send-magic-link"
)

echo "Starting edge function security fixes..."

for func in "${FUNCTIONS[@]}"; do
  FILE="$FUNCTIONS_DIR/$func/index.ts"
  
  if [ -f "$FILE" ]; then
    echo "Processing $func..."
    
    # Check if the function already has the import
    if ! grep -q "error-utils.ts" "$FILE"; then
      echo "Adding import to $func..."
      
      # Add import after the last import line
      sed -i '' '/^import.*$/a\
import { createErrorResponse, logSanitizedError, getErrorStatusCode } from '\''../_shared/error-utils.ts'\''
' "$FILE"
    fi
    
    echo "Fixed $func"
  else
    echo "Warning: $FILE not found"
  fi
done

echo "All edge functions processed!"