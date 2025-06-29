-- Create Research Results table for storing Research Agent output
CREATE TABLE IF NOT EXISTS cm_research_results (
    research_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES cm_course_plans(plan_id),
    session_id TEXT NOT NULL,
    
    -- Research outputs
    research_findings JSONB NOT NULL,
    content_library JSONB,
    module_mappings JSONB,
    
    -- Metadata
    total_topics INTEGER,
    total_sources INTEGER,
    research_agent_version TEXT DEFAULT 'v2',
    
    -- Session data
    search_queries JSONB[],
    sources_analyzed JSONB[],
    synthesis_sessions JSONB[],
    tool_calls JSONB[],
    execution_metrics JSONB,
    
    -- Tracking
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_cm_research_results_plan ON cm_research_results(plan_id);
CREATE INDEX idx_cm_research_results_session ON cm_research_results(session_id);
CREATE INDEX idx_cm_research_results_created ON cm_research_results(created_at);