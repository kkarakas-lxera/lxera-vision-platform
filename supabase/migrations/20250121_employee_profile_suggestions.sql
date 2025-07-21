-- Create table for storing personalized profile suggestions
CREATE TABLE IF NOT EXISTS public.employee_profile_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  challenges TEXT[] NOT NULL DEFAULT '{}',
  growth_areas TEXT[] NOT NULL DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  context_used JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_profile_suggestions_employee_id 
ON employee_profile_suggestions(employee_id);

-- Enable RLS
ALTER TABLE employee_profile_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Employees can view their own suggestions" 
ON employee_profile_suggestions 
FOR SELECT 
USING (
  employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all suggestions" 
ON employee_profile_suggestions 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Add updated_at trigger
CREATE TRIGGER update_employee_profile_suggestions_updated_at
  BEFORE UPDATE ON employee_profile_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();