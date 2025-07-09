#!/bin/bash

# Deploy Edge Functions to Supabase
# Make sure you have Supabase CLI installed and are logged in

echo "Deploying Edge Functions to Supabase..."

# Deploy send-verification-code function
echo "Deploying send-verification-code..."
supabase functions deploy send-verification-code

# Deploy verify-otp-code function
echo "Deploying verify-otp-code..."
supabase functions deploy verify-otp-code

# Deploy verify-magic-link function
echo "Deploying verify-magic-link..."
supabase functions deploy verify-magic-link

echo "Edge Functions deployment complete!"
echo ""
echo "Make sure the following environment variables are set in your Supabase project:"
echo "- RESEND_API_KEY (for sending emails)"
echo "- SUPABASE_URL"
echo "- SUPABASE_SERVICE_ROLE_KEY"