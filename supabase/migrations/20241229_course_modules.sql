-- Create course_modules table to track multiple modules per course assignment
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES course_assignments(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    module_number INTEGER NOT NULL,
    module_title TEXT NOT NULL,
    is_unlocked BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, module_number)
);

-- Add RLS policies
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Policy for employees to view their own course modules
CREATE POLICY "Employees can view own course modules" ON public.course_modules
    FOR SELECT USING (
        assignment_id IN (
            SELECT id FROM course_assignments 
            WHERE employee_id IN (
                SELECT id FROM employees WHERE user_id = auth.uid()
            )
        )
    );

-- Policy for employees to update their own course module progress
CREATE POLICY "Employees can update own course module progress" ON public.course_modules
    FOR UPDATE USING (
        assignment_id IN (
            SELECT id FROM course_assignments 
            WHERE employee_id IN (
                SELECT id FROM employees WHERE user_id = auth.uid()
            )
        )
    );

-- Add indexes for performance
CREATE INDEX idx_course_modules_assignment ON public.course_modules(assignment_id);
CREATE INDEX idx_course_modules_content ON public.course_modules(content_id);

-- Update course_assignments to track overall multi-module progress
ALTER TABLE public.course_assignments 
ADD COLUMN IF NOT EXISTS total_modules INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS modules_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_module_id UUID REFERENCES course_modules(id);

-- Function to update course assignment progress when module completes
CREATE OR REPLACE FUNCTION update_course_progress_on_module_complete()
RETURNS TRIGGER AS $$
BEGIN
    -- Update modules_completed count
    UPDATE course_assignments
    SET 
        modules_completed = (
            SELECT COUNT(*) FROM course_modules 
            WHERE assignment_id = NEW.assignment_id AND is_completed = true
        ),
        progress_percentage = ROUND(
            (SELECT COUNT(*) FROM course_modules 
             WHERE assignment_id = NEW.assignment_id AND is_completed = true)::numeric / 
            (SELECT COUNT(*) FROM course_modules WHERE assignment_id = NEW.assignment_id) * 100
        ),
        updated_at = NOW()
    WHERE id = NEW.assignment_id;
    
    -- Mark course as completed if all modules done
    UPDATE course_assignments
    SET 
        status = 'completed',
        completed_at = NOW()
    WHERE id = NEW.assignment_id
    AND modules_completed = total_modules
    AND status != 'completed';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for module completion
CREATE TRIGGER trigger_update_course_on_module_complete
AFTER UPDATE OF is_completed ON public.course_modules
FOR EACH ROW
WHEN (NEW.is_completed = true AND OLD.is_completed = false)
EXECUTE FUNCTION update_course_progress_on_module_complete();

-- Update existing course_section_progress to include module context
ALTER TABLE public.course_section_progress
ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES course_modules(id);

-- Add comment for clarity
COMMENT ON TABLE public.course_modules IS 'Tracks individual modules within a course assignment for multi-module courses';
COMMENT ON COLUMN public.course_modules.is_unlocked IS 'Whether the learner has access to this module (for progressive unlocking)';
COMMENT ON COLUMN public.course_modules.module_number IS 'Order of the module in the course (1-based)';