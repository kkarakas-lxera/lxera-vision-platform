-- =====================================================
-- COURSE PLANNING RESULTS TABLE
-- =====================================================
-- This table stores the complete planning results from the Planning Agent
-- including course structure, skills gaps, research strategy, and learning path
-- =====================================================

CREATE TABLE IF NOT EXISTS cm_course_plans (
    plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    employee_name TEXT NOT NULL,
    session_id TEXT NOT NULL,
    
    -- Planning results from agent tools
    course_structure JSONB NOT NULL, -- Full course structure with modules, weeks, etc.
    prioritized_gaps JSONB NOT NULL, -- Prioritized skill gaps analysis
    research_strategy JSONB NOT NULL, -- Research queries for each module
    learning_path JSONB NOT NULL, -- Personalized learning path
    employee_profile JSONB NOT NULL, -- Analyzed employee profile
    
    -- Metadata
    planning_agent_version TEXT DEFAULT 'v1',
    total_modules INTEGER,
    course_duration_weeks INTEGER,
    course_title TEXT,
    
    -- Agent execution details
    tool_calls JSONB, -- Record of all tool calls made
    execution_time_seconds NUMERIC,
    agent_turns INTEGER,
    
    -- Status tracking
    status TEXT DEFAULT 'completed' CHECK (status IN ('planning', 'completed', 'failed')),
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key to employees table
    CONSTRAINT fk_employee FOREIGN KEY (employee_id) 
        REFERENCES employees(id) ON DELETE CASCADE
);

-- Indexes for efficient queries
CREATE INDEX idx_cm_course_plans_employee ON cm_course_plans(employee_id);
CREATE INDEX idx_cm_course_plans_session ON cm_course_plans(session_id);
CREATE INDEX idx_cm_course_plans_status ON cm_course_plans(status);
CREATE INDEX idx_cm_course_plans_created ON cm_course_plans(created_at);

-- Enable Row Level Security
ALTER TABLE cm_course_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policy for service role access
CREATE POLICY "Enable all access for service role" ON cm_course_plans
    FOR ALL USING (true);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_cm_course_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_cm_course_plans_updated_at
    BEFORE UPDATE ON cm_course_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_cm_course_plans_updated_at();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'COURSE PLANS TABLE CREATED SUCCESSFULLY';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Table: cm_course_plans';
    RAISE NOTICE 'Purpose: Store planning agent results';
    RAISE NOTICE 'Indexes: 4 created';
    RAISE NOTICE 'RLS: Enabled';
    RAISE NOTICE '==============================================';
END $$;