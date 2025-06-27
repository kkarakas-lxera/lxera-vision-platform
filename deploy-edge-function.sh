#!/bin/bash

# Deploy the generate-course edge function
echo "Deploying generate-course edge function..."

# Make sure we're in the project directory
cd "$(dirname "$0")"

# Deploy the function
npx supabase functions deploy generate-course --project-ref lxyfiyxqyibkueiqzjkr

echo "Edge function deployment complete!"
echo ""
echo "Note: Make sure you have set the OPENAI_API_KEY secret in your Supabase project:"
echo "npx supabase secrets set OPENAI_API_KEY=your-api-key-here --project-ref lxyfiyxqyibkueiqzjkr"