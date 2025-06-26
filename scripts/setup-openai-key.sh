#!/bin/bash

# Load environment variables from .env file
source .env

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "Error: OPENAI_API_KEY not found in .env file"
    exit 1
fi

echo "Setting OpenAI API key in Supabase..."

# Set the secret in Supabase
supabase secrets set OPENAI_API_KEY=$OPENAI_API_KEY

# Deploy the analyze-cv function
echo "Deploying analyze-cv edge function..."
supabase functions deploy analyze-cv

echo "Setup complete! Your OpenAI API key is now configured in Supabase."
echo "The analyze-cv function has been deployed and is ready to use."