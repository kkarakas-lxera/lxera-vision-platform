-- Add missing columns to early_access_leads table
ALTER TABLE early_access_leads 
ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz,
ADD COLUMN IF NOT EXISTS heard_about text;

-- Update assign_waitlist_position function to handle new waitlist logic
CREATE OR REPLACE FUNCTION assign_waitlist_position(lead_id uuid)
RETURNS integer AS $$
DECLARE
  new_position integer;
BEGIN
  -- Get the next position
  SELECT COALESCE(MAX(waitlist_position), 0) + 1 INTO new_position
  FROM early_access_leads
  WHERE status IN ('waitlisted', 'invited', 'converted');
  
  -- Update the lead
  UPDATE early_access_leads
  SET 
    waitlist_position = new_position,
    status = 'waitlisted'
  WHERE id = lead_id;
  
  RETURN new_position;
END;
$$ LANGUAGE plpgsql;

-- Remove tally_submission_id from demo_requests table if it exists
ALTER TABLE demo_requests 
DROP COLUMN IF EXISTS tally_submission_id;

-- Add index for profile_completed_at for performance
CREATE INDEX IF NOT EXISTS idx_early_access_leads_profile_completed_at 
ON early_access_leads(profile_completed_at) 
WHERE profile_completed_at IS NOT NULL;

-- Add index for heard_about for analytics
CREATE INDEX IF NOT EXISTS idx_early_access_leads_heard_about 
ON early_access_leads(heard_about) 
WHERE heard_about IS NOT NULL;