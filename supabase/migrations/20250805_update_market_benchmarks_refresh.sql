-- Update expiration to 2 weeks instead of 30 days
ALTER TABLE market_skills_benchmarks 
ALTER COLUMN expires_at SET DEFAULT NOW() + INTERVAL '14 days';

-- Update existing rows to have 14-day expiration from now
UPDATE market_skills_benchmarks 
SET expires_at = NOW() + INTERVAL '14 days'
WHERE expires_at > NOW() + INTERVAL '14 days';

-- Create a function to refresh stale benchmarks (older than 14 days)
CREATE OR REPLACE FUNCTION refresh_stale_market_benchmarks()
RETURNS TABLE(role_name TEXT, industry TEXT, department TEXT) AS $$
BEGIN
  -- Return roles that need refreshing (expired or about to expire in 1 day)
  RETURN QUERY
  SELECT DISTINCT 
    mb.role_name,
    mb.industry,
    mb.department
  FROM market_skills_benchmarks mb
  WHERE mb.expires_at < NOW() + INTERVAL '1 day'
  ORDER BY mb.expires_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get active benchmark configurations (for scheduled refresh)
CREATE OR REPLACE FUNCTION get_active_benchmark_configs()
RETURNS TABLE(
  role_name TEXT,
  industry TEXT,
  department TEXT,
  last_generated TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (mb.role_name, mb.industry, mb.department)
    mb.role_name,
    mb.industry,
    mb.department,
    mb.generated_at as last_generated,
    mb.expires_at
  FROM market_skills_benchmarks mb
  ORDER BY mb.role_name, mb.industry, mb.department, mb.generated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a last_refreshed column to track refresh attempts
ALTER TABLE market_skills_benchmarks
ADD COLUMN IF NOT EXISTS last_refresh_attempt TIMESTAMPTZ;

-- Create an index for efficient refresh queries
CREATE INDEX IF NOT EXISTS idx_market_skills_refresh 
ON market_skills_benchmarks(expires_at, last_refresh_attempt);

-- Add RLS policy for the new functions
GRANT EXECUTE ON FUNCTION refresh_stale_market_benchmarks() TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_benchmark_configs() TO authenticated;