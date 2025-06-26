-- Enhanced Employee Onboarding Phase 1: Database Schema Updates and Core LLM Services
-- This migration adds necessary fields and tables for the enhanced onboarding system

-- 1. Add enhanced metadata fields to st_import_sessions
ALTER TABLE st_import_sessions
ADD COLUMN IF NOT EXISTS session_metadata jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS active_position_id uuid REFERENCES st_company_positions(id),
ADD COLUMN IF NOT EXISTS analysis_config jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bulk_analysis_status text DEFAULT 'pending';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_import_sessions_active_position ON st_import_sessions(active_position_id);

-- 2. Enhance st_import_session_items with CV analysis data
ALTER TABLE st_import_session_items
ADD COLUMN IF NOT EXISTS cv_analysis_result jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
ADD COLUMN IF NOT EXISTS position_match_analysis jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS suggested_positions jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS analysis_started_at timestamptz,
ADD COLUMN IF NOT EXISTS analysis_completed_at timestamptz,
ADD COLUMN IF NOT EXISTS analysis_tokens_used integer DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_items_confidence ON st_import_session_items(confidence_score);
CREATE INDEX IF NOT EXISTS idx_session_items_analysis_status ON st_import_session_items(status, analysis_completed_at);

-- 3. Enhance st_employee_skills_profile with detailed analysis
ALTER TABLE st_employee_skills_profile
ADD COLUMN IF NOT EXISTS skills_analysis_version integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience_years decimal(3,1),
ADD COLUMN IF NOT EXISTS education_level text,
ADD COLUMN IF NOT EXISTS certifications jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS industry_experience jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS soft_skills jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS technical_skills jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS languages jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS projects_summary text,
ADD COLUMN IF NOT EXISTS analysis_metadata jsonb DEFAULT '{}';

-- 4. Create table for storing LLM analysis templates and prompts
CREATE TABLE IF NOT EXISTS st_analysis_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_name text NOT NULL,
    template_type text NOT NULL CHECK (template_type IN ('cv_analysis', 'position_mapping', 'skills_extraction', 'gap_analysis')),
    prompt_template text NOT NULL,
    system_prompt text,
    parameters jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES users(id),
    UNIQUE(company_id, template_name)
);

-- 5. Create table for bulk CV processing queue
CREATE TABLE IF NOT EXISTS st_cv_processing_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    import_session_id uuid NOT NULL REFERENCES st_import_sessions(id) ON DELETE CASCADE,
    session_item_id uuid NOT NULL REFERENCES st_import_session_items(id) ON DELETE CASCADE,
    cv_file_path text NOT NULL,
    priority integer DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    retry_count integer DEFAULT 0,
    max_retries integer DEFAULT 3,
    error_details jsonb,
    processor_id text,
    enqueued_at timestamptz DEFAULT now(),
    started_at timestamptz,
    completed_at timestamptz,
    UNIQUE(session_item_id)
);

-- Create indexes for queue processing
CREATE INDEX IF NOT EXISTS idx_cv_queue_status_priority ON st_cv_processing_queue(status, priority DESC, enqueued_at);
CREATE INDEX IF NOT EXISTS idx_cv_queue_session ON st_cv_processing_queue(import_session_id);

-- 6. Create table for position mapping suggestions
CREATE TABLE IF NOT EXISTS st_position_mapping_suggestions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    source_text text NOT NULL,
    suggested_position_id uuid REFERENCES st_company_positions(id),
    confidence_score decimal(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    last_used_at timestamptz DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_position_suggestions_lookup ON st_position_mapping_suggestions(company_id, source_text);

-- 7. Create analysis metrics table for tracking LLM usage
CREATE TABLE IF NOT EXISTS st_llm_usage_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id),
    service_type text NOT NULL,
    model_used text NOT NULL,
    input_tokens integer NOT NULL,
    output_tokens integer NOT NULL,
    total_tokens integer GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
    cost_estimate decimal(10,6),
    duration_ms integer,
    success boolean DEFAULT true,
    error_code text,
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_llm_metrics_company_date ON st_llm_usage_metrics(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_llm_metrics_service ON st_llm_usage_metrics(service_type, created_at DESC);

-- 8. Add RLS policies for new tables
ALTER TABLE st_analysis_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE st_cv_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE st_position_mapping_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE st_llm_usage_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for st_analysis_templates
CREATE POLICY "Companies can manage their own templates" ON st_analysis_templates
    FOR ALL USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for st_cv_processing_queue
CREATE POLICY "Companies can view their own queue items" ON st_cv_processing_queue
    FOR SELECT USING (import_session_id IN (
        SELECT id FROM st_import_sessions WHERE company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    ));

-- RLS Policies for st_position_mapping_suggestions
CREATE POLICY "Companies can manage their own suggestions" ON st_position_mapping_suggestions
    FOR ALL USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- RLS Policies for st_llm_usage_metrics
CREATE POLICY "Companies can view their own metrics" ON st_llm_usage_metrics
    FOR SELECT USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));

-- 9. Create function to calculate position match score
CREATE OR REPLACE FUNCTION calculate_position_match_score(
    p_employee_skills jsonb,
    p_position_required_skills jsonb
) RETURNS decimal AS $$
DECLARE
    v_matched_skills integer := 0;
    v_total_required integer := 0;
    v_score decimal;
BEGIN
    -- Count total required skills
    v_total_required := jsonb_array_length(p_position_required_skills);
    
    IF v_total_required = 0 THEN
        RETURN 0;
    END IF;
    
    -- Count matched skills
    SELECT COUNT(*)
    INTO v_matched_skills
    FROM jsonb_array_elements(p_position_required_skills) AS req_skill
    WHERE EXISTS (
        SELECT 1
        FROM jsonb_array_elements(p_employee_skills) AS emp_skill
        WHERE emp_skill->>'skill_id' = req_skill->>'skill_id'
        OR LOWER(emp_skill->>'skill_name') = LOWER(req_skill->>'skill_name')
    );
    
    -- Calculate percentage match
    v_score := ROUND((v_matched_skills::decimal / v_total_required) * 100, 2);
    
    RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get next CV from processing queue
CREATE OR REPLACE FUNCTION get_next_cv_for_processing(
    p_processor_id text
) RETURNS TABLE (
    queue_id uuid,
    session_item_id uuid,
    cv_file_path text,
    import_session_id uuid
) AS $$
BEGIN
    RETURN QUERY
    UPDATE st_cv_processing_queue
    SET 
        status = 'processing',
        processor_id = p_processor_id,
        started_at = now(),
        retry_count = retry_count + 1
    WHERE id = (
        SELECT id
        FROM st_cv_processing_queue
        WHERE status = 'pending'
        AND retry_count < max_retries
        ORDER BY priority DESC, enqueued_at
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING 
        id AS queue_id,
        session_item_id,
        cv_file_path,
        import_session_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Create default analysis templates
INSERT INTO st_analysis_templates (company_id, template_name, template_type, prompt_template, system_prompt)
SELECT DISTINCT c.id, 'default_cv_analysis', 'cv_analysis', 
    'Analyze this CV and extract the following information:
    1. Personal Information (name, contact details)
    2. Professional Summary
    3. Work Experience (with dates and descriptions)
    4. Education and Certifications
    5. Technical Skills (programming languages, tools, frameworks)
    6. Soft Skills
    7. Languages
    8. Notable Projects or Achievements
    
    Format the response as a structured JSON object.',
    'You are an expert HR analyst specializing in technical skill assessment and CV analysis. Extract information accurately and comprehensively.'
FROM companies c
WHERE NOT EXISTS (
    SELECT 1 FROM st_analysis_templates at
    WHERE at.template_name = 'default_cv_analysis' 
    AND at.company_id = c.id
);

-- 12. Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_st_analysis_templates_updated_at BEFORE UPDATE ON st_analysis_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Create view for import session analytics
CREATE OR REPLACE VIEW v_import_session_analytics AS
SELECT 
    s.id AS session_id,
    s.company_id,
    s.import_type,
    s.status AS session_status,
    s.total_employees,
    s.successful,
    s.failed,
    s.created_at,
    s.completed_at,
    s.active_position_id,
    p.position_title,
    p.position_code,
    COUNT(DISTINCT i.id) AS total_items,
    COUNT(DISTINCT CASE WHEN i.cv_analysis_result != '{}' THEN i.id END) AS analyzed_cvs,
    AVG(i.confidence_score) AS avg_confidence_score,
    SUM(i.analysis_tokens_used) AS total_tokens_used,
    AVG(EXTRACT(EPOCH FROM (i.analysis_completed_at - i.analysis_started_at))) AS avg_analysis_time_seconds
FROM st_import_sessions s
LEFT JOIN st_import_session_items i ON s.id = i.import_session_id
LEFT JOIN st_company_positions p ON s.active_position_id = p.id
GROUP BY s.id, s.company_id, s.import_type, s.status, s.total_employees, 
         s.successful, s.failed, s.created_at, s.completed_at, 
         s.active_position_id, p.position_title, p.position_code;

-- Grant access to authenticated users
GRANT SELECT ON v_import_session_analytics TO authenticated;

-- Add comment documentation
COMMENT ON TABLE st_analysis_templates IS 'Stores LLM prompt templates for various analysis types';
COMMENT ON TABLE st_cv_processing_queue IS 'Queue for bulk CV processing with priority and retry logic';
COMMENT ON TABLE st_position_mapping_suggestions IS 'Cached position mapping suggestions for improved performance';
COMMENT ON TABLE st_llm_usage_metrics IS 'Tracks LLM API usage for cost monitoring and optimization';
COMMENT ON VIEW v_import_session_analytics IS 'Analytics view for import session performance and metrics';