-- Create market skills benchmarks table for storing AI-generated role/industry benchmarks
CREATE TABLE IF NOT EXISTS market_skills_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL,
  industry TEXT,
  department TEXT,
  skills JSONB NOT NULL, -- Array of {skill_name, match_percentage, category, market_demand}
  metadata JSONB, -- Store insights, trends, sources
  source_model TEXT DEFAULT 'gpt-4o',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_role_industry_dept UNIQUE(role_name, industry, department)
);

-- Add indexes for performance
CREATE INDEX idx_market_skills_role ON market_skills_benchmarks(role_name);
CREATE INDEX idx_market_skills_industry ON market_skills_benchmarks(industry);
CREATE INDEX idx_market_skills_department ON market_skills_benchmarks(department);
CREATE INDEX idx_market_skills_expires ON market_skills_benchmarks(expires_at);

-- Add columns to employees table for caching individual market gaps
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS market_gap_data JSONB,
ADD COLUMN IF NOT EXISTS market_gap_updated_at TIMESTAMPTZ;

-- Add columns to track market gap analysis at department level
ALTER TABLE st_employee_skills_profile
ADD COLUMN IF NOT EXISTS market_comparison JSONB,
ADD COLUMN IF NOT EXISTS market_comparison_updated_at TIMESTAMPTZ;

-- RLS Policies
ALTER TABLE market_skills_benchmarks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read benchmarks
CREATE POLICY "Market benchmarks readable by authenticated users" ON market_skills_benchmarks
  FOR SELECT
  TO authenticated
  USING (true);

-- Only allow system/admin to insert/update benchmarks
CREATE POLICY "Market benchmarks manageable by service role" ON market_skills_benchmarks
  FOR ALL
  TO service_role
  USING (true);

-- Function to clean expired benchmarks
CREATE OR REPLACE FUNCTION clean_expired_market_benchmarks()
RETURNS void AS $$
BEGIN
  DELETE FROM market_skills_benchmarks
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or generate market benchmarks
CREATE OR REPLACE FUNCTION get_market_benchmarks(
  p_role_name TEXT,
  p_industry TEXT DEFAULT NULL,
  p_department TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Check for existing non-expired benchmark
  SELECT skills INTO v_result
  FROM market_skills_benchmarks
  WHERE role_name = p_role_name
    AND (industry = p_industry OR (industry IS NULL AND p_industry IS NULL))
    AND (department = p_department OR (department IS NULL AND p_department IS NULL))
    AND expires_at > NOW()
  ORDER BY generated_at DESC
  LIMIT 1;
  
  -- Return result if found, otherwise return null (edge function will generate)
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp trigger
CREATE TRIGGER update_market_skills_benchmarks_updated_at 
  BEFORE UPDATE ON market_skills_benchmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
