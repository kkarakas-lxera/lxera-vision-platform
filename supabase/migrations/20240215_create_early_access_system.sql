-- Create early access leads table (separate from users)
CREATE TABLE IF NOT EXISTS early_access_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  company text,
  role text,
  use_case text,
  
  -- Status tracking
  status text DEFAULT 'email_captured' CHECK (status IN ('email_captured', 'email_verified', 'profile_completed', 'waitlisted', 'invited', 'converted')),
  waitlist_position integer,
  
  -- Enrichment data from Clearbit/Apollo
  enrichment_data jsonb DEFAULT '{}',
  
  -- Tracking
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz DEFAULT now(),
  onboarded_at timestamptz,
  invited_at timestamptz,
  converted_to_user_id uuid REFERENCES users(id),
  
  -- Referral tracking
  referral_code text UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  referred_by uuid REFERENCES early_access_leads(id),
  referral_count integer DEFAULT 0
);

-- Create lead sessions for magic links (not auth)
CREATE TABLE IF NOT EXISTS lead_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES early_access_leads(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 32),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Email preferences for leads
CREATE TABLE IF NOT EXISTS lead_email_preferences (
  lead_id uuid REFERENCES early_access_leads(id) ON DELETE CASCADE,
  email_type text NOT NULL CHECK (email_type IN ('welcome', 'waitlist_update', 'weekly_content', 'position_improved', 'product_updates')),
  opted_in boolean DEFAULT true,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (lead_id, email_type)
);

-- Email log for tracking what we sent
CREATE TABLE IF NOT EXISTS lead_email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES early_access_leads(id) ON DELETE CASCADE,
  email_type text NOT NULL,
  subject text,
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz,
  metadata jsonb DEFAULT '{}'
);

-- Demo requests (separate tracking)
CREATE TABLE IF NOT EXISTS demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES early_access_leads(id),
  email text NOT NULL,
  name text,
  company text,
  job_title text,
  phone text,
  demo_focus text,
  specific_requirements text,
  preferred_date date,
  timezone text,
  tally_submission_id text,
  created_at timestamptz DEFAULT now(),
  scheduled_at timestamptz,
  completed_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'no_show', 'cancelled'))
);

-- Create indexes for performance
CREATE INDEX idx_early_access_leads_email ON early_access_leads(email);
CREATE INDEX idx_early_access_leads_status ON early_access_leads(status);
CREATE INDEX idx_early_access_leads_waitlist_position ON early_access_leads(waitlist_position) WHERE status = 'waitlisted';
CREATE INDEX idx_lead_sessions_token ON lead_sessions(token) WHERE used = false AND expires_at > now();
CREATE INDEX idx_demo_requests_email ON demo_requests(email);

-- Create view for waitlist analytics
CREATE VIEW waitlist_analytics AS
SELECT 
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'email_captured') as email_only,
  COUNT(*) FILTER (WHERE status = 'profile_completed') as profile_completed,
  COUNT(*) FILTER (WHERE status = 'waitlisted') as waitlisted,
  COUNT(*) FILTER (WHERE status = 'invited') as invited,
  COUNT(*) FILTER (WHERE status = 'converted') as converted,
  COUNT(*) FILTER (WHERE referral_count > 0) as has_referrals,
  AVG(referral_count) as avg_referrals
FROM early_access_leads;

-- Create function to assign waitlist position
CREATE OR REPLACE FUNCTION assign_waitlist_position(lead_email text)
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
  WHERE email = lead_email;
  
  RETURN new_position;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle referral rewards
CREATE OR REPLACE FUNCTION process_referral(referrer_id uuid)
RETURNS void AS $$
DECLARE
  current_position integer;
  referral_bonus integer := 50; -- Jump 50 spots per referral
BEGIN
  -- Increment referral count
  UPDATE early_access_leads
  SET referral_count = referral_count + 1
  WHERE id = referrer_id;
  
  -- Get current position
  SELECT waitlist_position INTO current_position
  FROM early_access_leads
  WHERE id = referrer_id AND status = 'waitlisted';
  
  -- Improve position (lower number is better)
  IF current_position IS NOT NULL AND current_position > referral_bonus THEN
    UPDATE early_access_leads
    SET waitlist_position = current_position - referral_bonus
    WHERE id = referrer_id;
    
    -- Adjust others who were jumped
    UPDATE early_access_leads
    SET waitlist_position = waitlist_position + 1
    WHERE status = 'waitlisted'
      AND waitlist_position >= (current_position - referral_bonus)
      AND waitlist_position < current_position
      AND id != referrer_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE early_access_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (leads can check their own status)
CREATE POLICY "Public can check lead status by email" ON early_access_leads
  FOR SELECT USING (true);

CREATE POLICY "Public can insert new leads" ON early_access_leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage all leads" ON early_access_leads
  FOR ALL USING (auth.role() = 'service_role');

-- Similar policies for other tables
CREATE POLICY "Service role can manage sessions" ON lead_sessions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email preferences" ON lead_email_preferences
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage email log" ON lead_email_log
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage demo requests" ON demo_requests
  FOR ALL USING (auth.role() = 'service_role');