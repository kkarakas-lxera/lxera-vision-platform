-- Create cv_analysis_results table to store temporary CV analysis data
CREATE TABLE IF NOT EXISTS cv_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  extracted_skills JSONB,
  work_experience JSONB,
  education JSONB,
  analysis_status TEXT DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  analyzed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Create employee_skills_validation table for card-based skill validation
CREATE TABLE IF NOT EXISTS employee_skills_validation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_id UUID REFERENCES st_skills_taxonomy(skill_id),
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 0 AND 3),
  -- 0: None, 1: Basic/Learning, 2: Good/Using, 3: Expert
  validation_order INTEGER,
  is_from_position BOOLEAN DEFAULT FALSE,
  is_from_cv BOOLEAN DEFAULT FALSE,
  validated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, skill_name)
);

-- Create indexes for performance
CREATE INDEX idx_cv_analysis_results_employee ON cv_analysis_results(employee_id);
CREATE INDEX idx_cv_analysis_results_status ON cv_analysis_results(analysis_status);
CREATE INDEX idx_employee_skills_validation_lookup ON employee_skills_validation(employee_id, validation_order);
CREATE INDEX idx_employee_skills_validation_employee ON employee_skills_validation(employee_id);

-- Enable RLS
ALTER TABLE cv_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills_validation ENABLE ROW LEVEL SECURITY;

-- RLS policies for cv_analysis_results
CREATE POLICY "Service role can manage cv_analysis_results" ON cv_analysis_results
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view own cv_analysis_results" ON cv_analysis_results
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- RLS policies for employee_skills_validation
CREATE POLICY "Service role can manage employee_skills_validation" ON employee_skills_validation
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Users can view own skills validation" ON employee_skills_validation
  FOR SELECT USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own skills validation" ON employee_skills_validation
  FOR INSERT USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own skills validation records" ON employee_skills_validation
  FOR UPDATE USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cv_analysis_results_updated_at
  BEFORE UPDATE ON cv_analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();