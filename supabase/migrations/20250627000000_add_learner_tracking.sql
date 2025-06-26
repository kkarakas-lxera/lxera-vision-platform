-- Add learner tracking fields to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS learning_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_learning_date DATE;

-- Create course section progress tracking table
CREATE TABLE IF NOT EXISTS course_section_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES course_assignments(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(assignment_id, section_name)
);

-- Add current section tracking to course_assignments
ALTER TABLE course_assignments
ADD COLUMN IF NOT EXISTS current_section TEXT;

-- Create video progress tracking table
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  video_url TEXT NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  total_seconds INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, course_id, video_url)
);

-- Add RLS policies for learners
ALTER TABLE course_section_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_progress ENABLE ROW LEVEL SECURITY;

-- Policy for course section progress
CREATE POLICY "Learners can view their own section progress" ON course_section_progress
  FOR SELECT USING (
    assignment_id IN (
      SELECT id FROM course_assignments 
      WHERE employee_id IN (
        SELECT id FROM employees 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Learners can update their own section progress" ON course_section_progress
  FOR INSERT USING (
    assignment_id IN (
      SELECT id FROM course_assignments 
      WHERE employee_id IN (
        SELECT id FROM employees 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Learners can modify their own section progress" ON course_section_progress
  FOR UPDATE USING (
    assignment_id IN (
      SELECT id FROM course_assignments 
      WHERE employee_id IN (
        SELECT id FROM employees 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy for video progress
CREATE POLICY "Learners can manage their own video progress" ON video_progress
  FOR ALL USING (
    employee_id IN (
      SELECT id FROM employees 
      WHERE user_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_section_progress_assignment ON course_section_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_employee ON video_progress(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);