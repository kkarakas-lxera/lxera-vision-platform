-- Fix email confirmation for test users
-- This needs to be run in Supabase SQL Editor

-- Update the auth.users table to mark emails as confirmed
-- Only update email_confirmed_at, as confirmed_at is a generated column
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email IN ('john.learner@lxera.ai', 'jane.admin@lxera.ai')
  AND email_confirmed_at IS NULL;

-- Also update the public.users table
UPDATE public.users 
SET email_verified = true
WHERE email IN ('john.learner@lxera.ai', 'jane.admin@lxera.ai');

-- Verify the update
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
WHERE email IN ('john.learner@lxera.ai', 'jane.admin@lxera.ai', 'kubilay.karakas@lxera.ai');

-- Also check the public.users table
SELECT 
  email,
  email_verified,
  role,
  company_id
FROM public.users
WHERE email IN ('john.learner@lxera.ai', 'jane.admin@lxera.ai', 'kubilay.karakas@lxera.ai');