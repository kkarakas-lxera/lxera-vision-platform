-- Create market intelligence requests table
CREATE TABLE IF NOT EXISTS market_intelligence_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  position_id UUID REFERENCES st_company_positions(id) ON DELETE SET NULL,
  position_title TEXT,
  regions TEXT[] DEFAULT '{}',
  countries TEXT[] DEFAULT '{}',
  date_window TEXT NOT NULL DEFAULT '30d' CHECK (date_window IN ('24h', '7d', '30d', '90d', 'custom')),
  since_date DATE,
  focus_area TEXT NOT NULL DEFAULT 'all_skills' CHECK (focus_area IN ('technical', 'all_skills')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'scraping', 'analyzing', 'completed', 'failed')),
  status_message TEXT,
  scraped_data JSONB,
  ai_insights TEXT,
  analysis_data JSONB,
  error_details JSONB,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_intelligence_company_id ON market_intelligence_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_status ON market_intelligence_requests(status);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_created_at ON market_intelligence_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_intelligence_position_id ON market_intelligence_requests(position_id);

-- RLS Policies
ALTER TABLE market_intelligence_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to read requests from their company
CREATE POLICY "Users can view company market intelligence requests" ON market_intelligence_requests
  FOR SELECT
  TO authenticated
  USING (company_id = (SELECT get_user_company_id(auth.uid()))::uuid);

-- Allow users to create requests for their company
CREATE POLICY "Users can create company market intelligence requests" ON market_intelligence_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (company_id = (SELECT get_user_company_id(auth.uid()))::uuid);

-- Allow users to update requests from their company
CREATE POLICY "Users can update company market intelligence requests" ON market_intelligence_requests
  FOR UPDATE
  TO authenticated
  USING (company_id = (SELECT get_user_company_id(auth.uid()))::uuid);

-- Allow users to delete requests from their company
CREATE POLICY "Users can delete company market intelligence requests" ON market_intelligence_requests
  FOR DELETE
  TO authenticated
  USING (company_id = (SELECT get_user_company_id(auth.uid()))::uuid);

-- Allow service role full access for edge functions
CREATE POLICY "Service role full access to market intelligence requests" ON market_intelligence_requests
  FOR ALL
  TO service_role
  USING (true);

-- Update timestamp trigger
CREATE TRIGGER update_market_intelligence_requests_updated_at 
  BEFORE UPDATE ON market_intelligence_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();