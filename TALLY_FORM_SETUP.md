# Tally Form Setup Instructions

## Email Prefill Configuration

To enable email prefilling in your Tally form (w2dO6L), you need to:

1. **Add a Hidden Field**:
   - Go to your Tally form editor
   - Add a new "Hidden field" block
   - Name it exactly: `email` (lowercase)
   - This will capture the email parameter from the URL

2. **Connect to Email Field**:
   - Find your email input field in the form
   - Click on the field settings
   - Enable "Default answer"
   - Select the hidden `email` field as the default answer

3. **Test the Prefill**:
   - The waiting room will pass: `?email=user@example.com`
   - Tally will capture this in the hidden field
   - The email input will be prefilled with this value

## Alternative: Direct Field Prefill

If your email field has a specific ID or name in Tally:
1. Check the field's unique identifier in Tally
2. Update the URL parameter to match (e.g., if the field ID is "Email_123", use `?Email_123=user@example.com`)

## Current Implementation

The waiting room currently sends the email as:
```
https://tally.so/embed/w2dO6L?email=user@example.com
```

This expects a hidden field named "email" in your Tally form.