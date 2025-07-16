-- Phase 1: Foundation & Mode Selection

-- 1. Add company mode setting
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS onboarding_mode TEXT DEFAULT 'manual' 
  CHECK (onboarding_mode IN ('manual', 'automated'));

-- 2. Add position mapping table
CREATE TABLE IF NOT EXISTS position_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  hris_job_title TEXT NOT NULL,
  position_id UUID REFERENCES st_company_positions(id) ON DELETE SET NULL,
  confidence_score DECIMAL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, hris_job_title)
);

-- 3. Extend employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS hris_id TEXT,
ADD COLUMN IF NOT EXISTS hris_data JSONB,
ADD COLUMN IF NOT EXISTS linkedin_profile_url TEXT,
ADD COLUMN IF NOT EXISTS profile_data JSONB,
ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_completion_date TIMESTAMPTZ;

-- Add RLS policies for position_mappings
ALTER TABLE position_mappings ENABLE ROW LEVEL SECURITY;

-- Company admins can manage position mappings for their company
CREATE POLICY "Company admins can manage position mappings" ON position_mappings
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin')
    )
  );

-- Update trigger for position_mappings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_position_mappings_updated_at BEFORE UPDATE ON position_mappings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();