-- Create table for tracking CV analysis metrics and performance
CREATE TABLE IF NOT EXISTS cv_analysis_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    analysis_time_ms INTEGER NOT NULL,
    cv_length INTEGER NOT NULL,
    skills_extracted INTEGER NOT NULL,
    match_percentage DECIMAL(5,2),
    gaps_found INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'timeout')),
    error_message TEXT,
    openai_tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_cv_analysis_metrics_employee ON cv_analysis_metrics(employee_id);
CREATE INDEX idx_cv_analysis_metrics_status ON cv_analysis_metrics(status);
CREATE INDEX idx_cv_analysis_metrics_created ON cv_analysis_metrics(created_at DESC);
CREATE INDEX idx_cv_analysis_metrics_request ON cv_analysis_metrics(request_id);

-- Create RLS policies
ALTER TABLE cv_analysis_metrics ENABLE ROW LEVEL SECURITY;

-- Company admins can view their company's analysis metrics
CREATE POLICY "Company admins can view analysis metrics" ON cv_analysis_metrics
    FOR SELECT
    TO authenticated
    USING (
        employee_id IN (
            SELECT e.id FROM employees e
            JOIN users u ON u.id = auth.uid()
            WHERE e.company_id = u.company_id 
            AND u.role IN ('company_admin', 'super_admin')
        )
    );

-- Create view for analysis statistics
CREATE OR REPLACE VIEW cv_analysis_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as analysis_date,
    COUNT(*) as total_analyses,
    COUNT(*) FILTER (WHERE status = 'success') as successful_analyses,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_analyses,
    AVG(analysis_time_ms) FILTER (WHERE status = 'success') as avg_analysis_time_ms,
    AVG(skills_extracted) FILTER (WHERE status = 'success') as avg_skills_extracted,
    AVG(match_percentage) FILTER (WHERE status = 'success') as avg_match_percentage,
    AVG(cv_length) as avg_cv_length
FROM cv_analysis_metrics
GROUP BY DATE_TRUNC('day', created_at);

-- Grant access to the view
GRANT SELECT ON cv_analysis_stats TO authenticated;

-- Add comments
COMMENT ON TABLE cv_analysis_metrics IS 'Tracks performance metrics and results of CV analysis operations';
COMMENT ON VIEW cv_analysis_stats IS 'Aggregated statistics for CV analysis performance monitoring';