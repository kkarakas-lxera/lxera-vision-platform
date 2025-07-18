-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_profile_invitations_updated_at ON public.profile_invitations;

-- Drop the columns if they exist and re-add them
ALTER TABLE public.profile_invitations 
  DROP COLUMN IF EXISTS created_at,
  DROP COLUMN IF EXISTS updated_at;

ALTER TABLE public.profile_invitations 
  ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create or replace the updated_at function specific to this table
CREATE OR REPLACE FUNCTION public.handle_profile_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger with the specific function
CREATE TRIGGER update_profile_invitations_updated_at
  BEFORE UPDATE ON public.profile_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_invitations_updated_at();