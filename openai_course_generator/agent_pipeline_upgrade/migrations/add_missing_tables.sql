-- Migration: Add missing agent pipeline tables
-- Description: Creates tables for course plans, agent handoffs, and generation jobs
-- Author: Agent Pipeline Upgrade
-- Date: 2025-06-29

-- Course Plans table (stores Planning Agent output)
CREATE TABLE IF NOT EXISTS cm_course_plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    employee_name TEXT NOT NULL,
    session_id TEXT NOT NULL,
    
    -- Planning outputs
    course_structure JSONB NOT NULL,
    prioritized_gaps JSONB NOT NULL,
    research_strategy JSONB,
    learning_path JSONB,
    
    -- Metadata
    employee_profile JSONB,
    planning_agent_version TEXT DEFAULT 'v1',
    total_modules INTEGER,
    course_duration_weeks INTEGER,
    course_title TEXT,
    
    -- Tracking
    tool_calls JSONB[],
    execution_time_seconds DECIMAL,
    agent_turns INTEGER,
    
    status TEXT DEFAULT 'completed' CHECK (status IN ('planning', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Handoffs tracking
CREATE TABLE IF NOT EXISTS cm_agent_handoffs (
    handoff_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    from_agent TEXT NOT NULL,
    to_agent TEXT NOT NULL,
    handoff_context JSONB,
    content_id UUID REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    plan_id UUID REFERENCES cm_course_plans(plan_id) ON DELETE CASCADE,
    handoff_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    error_details TEXT,
    
    -- Additional tracking
    token_count INTEGER,
    execution_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0
);

-- Course Generation Jobs (for tracking bulk operations)
CREATE TABLE IF NOT EXISTS course_generation_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    initiated_by UUID NOT NULL,
    
    -- Job details
    total_employees INTEGER NOT NULL,
    successful_courses INTEGER DEFAULT 0,
    failed_courses INTEGER DEFAULT 0,
    
    -- Progress tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    current_phase TEXT,
    progress_percentage INTEGER DEFAULT 0,
    current_employee_id UUID,
    current_employee_name TEXT,
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Error tracking
    error_message TEXT,
    failed_employee_ids UUID[],
    
    -- Metadata
    job_config JSONB,
    statistics JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cm_course_plans_employee ON cm_course_plans(employee_id);
CREATE INDEX IF NOT EXISTS idx_cm_course_plans_session ON cm_course_plans(session_id);
CREATE INDEX IF NOT EXISTS idx_cm_course_plans_created ON cm_course_plans(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cm_agent_handoffs_session ON cm_agent_handoffs(session_id);
CREATE INDEX IF NOT EXISTS idx_cm_agent_handoffs_content ON cm_agent_handoffs(content_id);
CREATE INDEX IF NOT EXISTS idx_cm_agent_handoffs_timestamp ON cm_agent_handoffs(handoff_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_course_generation_jobs_company ON course_generation_jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_course_generation_jobs_status ON course_generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_course_generation_jobs_initiated_by ON course_generation_jobs(initiated_by);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cm_course_plans_updated_at 
    BEFORE UPDATE ON cm_course_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_generation_jobs_updated_at 
    BEFORE UPDATE ON course_generation_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust based on your roles)
GRANT ALL ON cm_course_plans TO authenticated;
GRANT ALL ON cm_agent_handoffs TO authenticated;
GRANT ALL ON course_generation_jobs TO authenticated;

GRANT SELECT ON cm_course_plans TO anon;
GRANT SELECT ON cm_agent_handoffs TO anon;
GRANT SELECT ON course_generation_jobs TO anon;

-- Add RLS policies (adjust based on your security requirements)
ALTER TABLE cm_course_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_agent_handoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see course plans for employees in their company
CREATE POLICY "Users can view course plans for their company" ON cm_course_plans
    FOR SELECT
    USING (
        employee_id IN (
            SELECT id FROM employees 
            WHERE company_id IN (
                SELECT company_id FROM employees 
                WHERE user_id = auth.uid()
            )
        )
    );

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to course plans" ON cm_course_plans
    FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to agent handoffs" ON cm_agent_handoffs
    FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to generation jobs" ON course_generation_jobs
    FOR ALL
    USING (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE cm_course_plans IS 'Stores output from the Planning Agent including course structure and gap analysis';
COMMENT ON TABLE cm_agent_handoffs IS 'Tracks handoffs between agents in the course generation pipeline';
COMMENT ON TABLE course_generation_jobs IS 'Tracks bulk course generation jobs and their progress';

COMMENT ON COLUMN cm_course_plans.plan_id IS 'Unique identifier for the course plan';
COMMENT ON COLUMN cm_course_plans.course_structure IS 'JSON structure of the planned course including modules and timeline';
COMMENT ON COLUMN cm_course_plans.prioritized_gaps IS 'Skills gaps prioritized by criticality and impact';

COMMENT ON COLUMN cm_agent_handoffs.handoff_context IS 'Context passed between agents including intermediate results';
COMMENT ON COLUMN cm_agent_handoffs.success IS 'Whether the handoff completed successfully';

COMMENT ON COLUMN course_generation_jobs.progress_percentage IS 'Overall job completion percentage (0-100)';
COMMENT ON COLUMN course_generation_jobs.current_phase IS 'Current phase: planning, research, content, quality, enhancement, multimedia, finalizing';