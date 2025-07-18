-- Create table for real-time CV analysis status updates
CREATE TABLE IF NOT EXISTS cv_analysis_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- Unique ID for each analysis session
  status TEXT NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, session_id)
);

-- Create index for faster lookups
CREATE INDEX idx_cv_analysis_status_employee_session 
ON cv_analysis_status(employee_id, session_id);

-- Enable RLS
ALTER TABLE cv_analysis_status ENABLE ROW LEVEL SECURITY;

-- Policy for employees to read their own status
CREATE POLICY "Employees can view own CV analysis status" 
ON cv_analysis_status 
FOR SELECT 
TO authenticated 
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

-- Policy for service role to insert/update (edge functions)
CREATE POLICY "Service role can manage CV analysis status" 
ON cv_analysis_status 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_cv_analysis_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_cv_analysis_status_updated_at
BEFORE UPDATE ON cv_analysis_status
FOR EACH ROW
EXECUTE FUNCTION update_cv_analysis_status_updated_at();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE cv_analysis_status;