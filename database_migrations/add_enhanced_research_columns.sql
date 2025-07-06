-- Enhanced Research Migration Script
-- Adds optional columns to existing tables for enhanced research capabilities
-- ALL ADDITIONS ARE NON-BREAKING - Existing functionality remains unchanged

-- 1. Enhance cm_research_sessions table
ALTER TABLE cm_research_sessions 
ADD COLUMN IF NOT EXISTS research_agents JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS source_credibility_scores JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS multi_agent_coordination BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enhanced_research_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS research_methodology TEXT DEFAULT 'standard';

-- 2. Enhance cm_quality_assessments table  
ALTER TABLE cm_quality_assessments
ADD COLUMN IF NOT EXISTS source_credibility_score NUMERIC,
ADD COLUMN IF NOT EXISTS currency_timeliness_score NUMERIC,
ADD COLUMN IF NOT EXISTS source_diversity_score NUMERIC,
ADD COLUMN IF NOT EXISTS evidence_quality_score NUMERIC,
ADD COLUMN IF NOT EXISTS enhanced_assessment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assessment_methodology TEXT DEFAULT 'standard_5_dimensional';

-- 3. Enhance cm_research_results table
ALTER TABLE cm_research_results
ADD COLUMN IF NOT EXISTS source_types JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS credibility_analysis JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS research_methodology TEXT DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS enhanced_features_used BOOLEAN DEFAULT false;

-- 4. Add indexes for performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_research_sessions_enhanced 
ON cm_research_sessions(enhanced_research_enabled) 
WHERE enhanced_research_enabled = true;

CREATE INDEX IF NOT EXISTS idx_quality_assessments_enhanced 
ON cm_quality_assessments(enhanced_assessment) 
WHERE enhanced_assessment = true;

CREATE INDEX IF NOT EXISTS idx_research_results_enhanced 
ON cm_research_results(enhanced_features_used) 
WHERE enhanced_features_used = true;

-- 5. Add comments for documentation
COMMENT ON COLUMN cm_research_sessions.research_agents IS 'JSON array tracking which specialized agents (academic, industry, technical) were used';
COMMENT ON COLUMN cm_research_sessions.source_credibility_scores IS 'JSON object with credibility scores for different source types';
COMMENT ON COLUMN cm_research_sessions.multi_agent_coordination IS 'Boolean indicating if parallel multi-agent research was used';

COMMENT ON COLUMN cm_quality_assessments.enhanced_assessment IS 'Boolean indicating if 9-dimensional quality assessment was used';
COMMENT ON COLUMN cm_quality_assessments.assessment_methodology IS 'Text describing assessment method: standard_5_dimensional or enhanced_9_dimensional';

COMMENT ON COLUMN cm_research_results.enhanced_features_used IS 'Boolean indicating if enhanced research features were used';
COMMENT ON COLUMN cm_research_results.research_methodology IS 'Text describing research method: standard, enhanced_multi_agent, etc.';

-- 6. Create view for enhanced research analytics (optional)
CREATE OR REPLACE VIEW v_enhanced_research_analytics AS
SELECT 
    rs.research_id,
    rs.research_type,
    rs.enhanced_research_enabled,
    rs.multi_agent_coordination,
    rs.source_credibility_scores,
    rs.research_quality,
    rs.status,
    rs.started_at,
    rs.completed_at,
    
    rr.research_agent_version,
    rr.total_sources,
    rr.enhanced_features_used,
    rr.research_methodology as results_methodology,
    
    qa.overall_score as quality_score,
    qa.enhanced_assessment,
    qa.assessment_methodology,
    qa.source_credibility_score,
    qa.source_diversity_score,
    qa.passed as quality_passed
    
FROM cm_research_sessions rs
LEFT JOIN cm_research_results rr ON rs.research_id = rr.session_id
LEFT JOIN cm_quality_assessments qa ON rr.research_id = qa.content_id
WHERE rs.enhanced_research_enabled = true OR rr.enhanced_features_used = true;

COMMENT ON VIEW v_enhanced_research_analytics IS 'Analytics view for enhanced research performance tracking and comparison';