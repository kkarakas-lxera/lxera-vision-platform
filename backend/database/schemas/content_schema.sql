-- =====================================================
-- LXERA SAAS CONTENT MANAGEMENT SCHEMA (ENHANCED)
-- =====================================================
-- Content Management tables with multi-tenant RLS
-- Original cm_* tables enhanced with company isolation
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MODULE CONTENT STORAGE (ENHANCED WITH MULTI-TENANCY)
-- =====================================================

CREATE TABLE IF NOT EXISTS cm_module_content (
    content_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Original fields
    module_name TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    session_id TEXT NOT NULL,
    
    -- Content sections (stored separately for granular updates)
    introduction TEXT,
    core_content TEXT, 
    practical_applications TEXT,
    case_studies TEXT,
    assessments TEXT,
    
    -- Module metadata
    module_spec JSONB NOT NULL, -- specifications, personalization context, etc.
    research_context JSONB, -- research findings integrated
    
    -- Content metrics
    total_word_count INTEGER DEFAULT 0,
    section_word_counts JSONB DEFAULT '{}', -- {"introduction": 800, "core_content": 1800, ...}
    
    -- Status tracking
    status TEXT DEFAULT 'draft', -- draft, quality_check, revision, approved, failed
    priority_level TEXT DEFAULT 'medium', -- critical, high, medium, low
    revision_count INTEGER DEFAULT 0,
    
    -- Assignment tracking
    assigned_to UUID REFERENCES employees(id),
    created_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_quality_check TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT cm_valid_status CHECK (status IN ('draft', 'quality_check', 'revision', 'approved', 'failed')),
    CONSTRAINT cm_valid_priority CHECK (priority_level IN ('critical', 'high', 'medium', 'low'))
);

-- Indexes for efficient queries
CREATE INDEX idx_cm_module_content_company ON cm_module_content(company_id);
CREATE INDEX idx_cm_module_content_session ON cm_module_content(session_id);
CREATE INDEX idx_cm_module_content_employee ON cm_module_content(employee_name);
CREATE INDEX idx_cm_module_content_status ON cm_module_content(status);
CREATE INDEX idx_cm_module_content_created ON cm_module_content(created_at);
CREATE INDEX idx_cm_module_content_assigned ON cm_module_content(assigned_to);

-- Enhanced RLS Policies
ALTER TABLE cm_module_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can see all content" ON cm_module_content
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company admins can manage their company content" ON cm_module_content
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Learners can view content assigned to them" ON cm_module_content
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'learner' 
        AND assigned_to IN (
            SELECT id FROM employees WHERE user_id::text = auth.jwt() ->> 'sub'
        )
    );

-- =====================================================
-- 2. QUALITY ASSESSMENTS TRACKING (ENHANCED)
-- =====================================================

CREATE TABLE IF NOT EXISTS cm_quality_assessments (
    assessment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Assessment results
    overall_score DECIMAL(3,1), -- 0.0 to 10.0
    section_scores JSONB DEFAULT '{}', -- {"introduction": 8.5, "core_content": 7.2, ...}
    
    -- Quality criteria evaluation
    accuracy_score DECIMAL(3,1),
    clarity_score DECIMAL(3,1),
    completeness_score DECIMAL(3,1),
    engagement_score DECIMAL(3,1),
    personalization_score DECIMAL(3,1),
    
    -- Assessment details
    quality_feedback TEXT,
    word_count_assessment JSONB, -- target vs actual word counts
    critical_issues TEXT[], -- array of critical issues found
    improvement_suggestions TEXT[], -- array of suggestions
    
    -- Assessment context
    assessment_criteria TEXT DEFAULT 'accuracy,clarity,completeness,engagement,personalization',
    module_context JSONB, -- priority level, target score, etc.
    
    -- Results
    passed BOOLEAN,
    requires_revision BOOLEAN DEFAULT false,
    sections_needing_work TEXT[], -- sections that need improvement
    
    -- Tracking
    assessed_by UUID REFERENCES users(id),
    
    -- Timestamps
    assessed_at TIMESTAMPTZ DEFAULT NOW(),
    assessment_duration_seconds INTEGER
);

-- Indexes
CREATE INDEX idx_cm_quality_assessments_company ON cm_quality_assessments(company_id);
CREATE INDEX idx_cm_quality_assessments_content ON cm_quality_assessments(content_id);
CREATE INDEX idx_cm_quality_assessments_score ON cm_quality_assessments(overall_score);
CREATE INDEX idx_cm_quality_assessments_passed ON cm_quality_assessments(passed);
CREATE INDEX idx_cm_quality_assessments_date ON cm_quality_assessments(assessed_at);

-- RLS Policies
ALTER TABLE cm_quality_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can see all assessments" ON cm_quality_assessments
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company users can see their company assessments" ON cm_quality_assessments
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

-- =====================================================
-- 3. CONTENT SECTIONS (ENHANCED)
-- =====================================================

CREATE TABLE IF NOT EXISTS cm_content_sections (
    section_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Section details
    section_name TEXT NOT NULL, -- introduction, core_content, practical_applications, etc.
    section_content TEXT NOT NULL,
    section_metadata JSONB DEFAULT '{}', -- additional section-specific data
    
    -- Section metrics
    word_count INTEGER DEFAULT 0,
    character_count INTEGER DEFAULT 0,
    
    -- Section status
    status TEXT DEFAULT 'current', -- current, outdated, enhanced, archived
    enhancement_count INTEGER DEFAULT 0,
    
    -- Quality tracking for this section
    last_quality_score DECIMAL(3,1),
    quality_issues TEXT[],
    
    -- Version control
    version_number INTEGER DEFAULT 1,
    parent_section_id UUID REFERENCES cm_content_sections(section_id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT cm_valid_section_status CHECK (status IN ('current', 'outdated', 'enhanced', 'archived')),
    CONSTRAINT cm_valid_section_name CHECK (section_name IN ('introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments', 'full_module'))
);

-- Indexes
CREATE INDEX idx_cm_content_sections_company ON cm_content_sections(company_id);
CREATE INDEX idx_cm_content_sections_content ON cm_content_sections(content_id);
CREATE INDEX idx_cm_content_sections_name ON cm_content_sections(section_name);
CREATE INDEX idx_cm_content_sections_status ON cm_content_sections(status);
CREATE UNIQUE INDEX idx_cm_content_sections_current ON cm_content_sections(content_id, section_name) 
    WHERE status = 'current';

-- RLS Policies
ALTER TABLE cm_content_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can see their company sections" ON cm_content_sections
    FOR ALL USING (
        (auth.jwt() ->> 'role' = 'super_admin') OR
        (auth.jwt() ->> 'role' IN ('company_admin', 'learner') AND company_id::text = auth.jwt() ->> 'company_id')
    );

-- =====================================================
-- COPY REMAINING TABLES (4-7) WITH COMPANY_ID ENHANCEMENTS
-- =====================================================

-- 4. Enhancement Sessions (Enhanced)
CREATE TABLE IF NOT EXISTS cm_enhancement_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    quality_assessment_id UUID REFERENCES cm_quality_assessments(assessment_id),
    
    -- Enhancement strategy
    enhancement_type TEXT DEFAULT 'targeted', -- targeted, comprehensive, research_driven
    sections_to_enhance TEXT[] NOT NULL,
    sections_preserved TEXT[] DEFAULT '{}',
    
    -- Enhancement execution
    research_conducted BOOLEAN DEFAULT false,
    content_regenerated BOOLEAN DEFAULT false,
    integration_completed BOOLEAN DEFAULT false,
    
    -- Enhancement results
    word_count_before INTEGER,
    word_count_after INTEGER,
    quality_score_before DECIMAL(3,1),
    quality_score_after DECIMAL(3,1),
    
    -- Token usage tracking
    enhancement_tokens_used INTEGER,
    content_tokens_used INTEGER,
    total_tokens_saved INTEGER, -- compared to full regeneration
    
    -- Status and outcomes
    status TEXT DEFAULT 'started', -- started, research_complete, content_enhanced, completed, failed
    success BOOLEAN,
    error_details TEXT,
    
    -- Tracking
    initiated_by UUID REFERENCES users(id),
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Constraints
    CONSTRAINT cm_valid_enhancement_type CHECK (enhancement_type IN ('targeted', 'comprehensive', 'research_driven')),
    CONSTRAINT cm_valid_enhancement_status CHECK (status IN ('started', 'research_complete', 'content_enhanced', 'completed', 'failed'))
);

-- 5. Research Sessions (Enhanced)
CREATE TABLE IF NOT EXISTS cm_research_sessions (
    research_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enhancement_session_id UUID REFERENCES cm_enhancement_sessions(session_id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Research parameters
    research_topics TEXT[] NOT NULL,
    research_type TEXT DEFAULT 'web_search', -- web_search, industry_trends, examples, statistics
    
    -- Research execution
    tavily_queries_made INTEGER DEFAULT 0,
    research_results JSONB DEFAULT '{}', -- structured research findings
    key_insights TEXT[],
    current_examples TEXT[],
    industry_trends TEXT[],
    
    -- Research summary for Content Agent
    research_package JSONB, -- formatted package for Content Agent
    research_quality DECIMAL(3,1), -- quality of research findings
    
    -- Performance metrics
    research_duration_seconds INTEGER,
    tokens_used INTEGER,
    
    -- Status
    status TEXT DEFAULT 'started', -- started, completed, failed
    success BOOLEAN,
    error_details TEXT,
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT cm_valid_research_type CHECK (research_type IN ('web_search', 'industry_trends', 'examples', 'statistics')),
    CONSTRAINT cm_valid_research_status CHECK (status IN ('started', 'completed', 'failed'))
);

-- 6. Assessment Details (Enhanced)
CREATE TABLE IF NOT EXISTS cm_assessment_details (
    detail_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES cm_quality_assessments(assessment_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Detailed assessment breakdown
    section_name TEXT NOT NULL,
    section_content_snippet TEXT, -- first 500 chars for reference
    
    -- Specific quality metrics
    word_count_actual INTEGER,
    word_count_target INTEGER,
    word_count_deficit INTEGER,
    
    -- Quality issues found
    specific_issues JSONB DEFAULT '{}', -- {"clarity": ["issue1", "issue2"], "completeness": ["issue3"]}
    improvement_priority TEXT DEFAULT 'medium', -- critical, high, medium, low
    
    -- Recommendations
    specific_recommendations TEXT[],
    research_suggestions TEXT[], -- what to research for this section
    enhancement_type_needed TEXT, -- examples, depth, trends, statistics
    
    -- Assessment context
    assessment_criteria_met BOOLEAN DEFAULT false,
    meets_minimum_quality BOOLEAN DEFAULT false,
    requires_web_research BOOLEAN DEFAULT false,
    
    -- Timestamps
    assessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Improvement Outcomes (Enhanced)
CREATE TABLE IF NOT EXISTS cm_improvement_outcomes (
    outcome_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enhancement_session_id UUID NOT NULL REFERENCES cm_enhancement_sessions(session_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Before/After comparison
    quality_improvement DECIMAL(3,1), -- score difference
    word_count_change INTEGER,
    section_improvements JSONB DEFAULT '{}', -- per-section improvements
    
    -- Enhancement effectiveness
    enhancement_success_rate DECIMAL(3,2), -- 0.00 to 1.00
    research_effectiveness DECIMAL(3,1), -- how well research improved content
    content_integration_quality DECIMAL(3,1),
    
    -- Specific improvements achieved
    issues_resolved TEXT[],
    new_features_added TEXT[], -- examples, trends, insights, etc.
    content_quality_gains JSONB, -- specific quality improvements
    
    -- Performance impact
    token_efficiency DECIMAL(5,2), -- tokens saved vs full regeneration
    time_efficiency INTEGER, -- seconds saved
    cost_efficiency DECIMAL(8,4), -- cost saved
    
    -- Learning insights
    improvement_patterns JSONB, -- patterns identified for future enhancements
    research_insights JSONB, -- insights about research effectiveness
    
    -- Status
    outcome_calculated BOOLEAN DEFAULT false,
    calculation_method TEXT DEFAULT 'automated',
    
    -- Timestamps
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing indexes and RLS policies for tables 4-7
CREATE INDEX idx_cm_enhancement_sessions_company ON cm_enhancement_sessions(company_id);
CREATE INDEX idx_cm_research_sessions_company ON cm_research_sessions(company_id);
CREATE INDEX idx_cm_assessment_details_company ON cm_assessment_details(company_id);
CREATE INDEX idx_cm_improvement_outcomes_company ON cm_improvement_outcomes(company_id);

-- RLS Policies for remaining tables
ALTER TABLE cm_enhancement_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_assessment_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_improvement_outcomes ENABLE ROW LEVEL SECURITY;

-- Apply same RLS pattern to all content tables
DO $$
DECLARE
    table_name TEXT;
    tables TEXT[] := ARRAY['cm_enhancement_sessions', 'cm_research_sessions', 'cm_assessment_details', 'cm_improvement_outcomes'];
BEGIN
    FOREACH table_name IN ARRAY tables
    LOOP
        EXECUTE format('
            CREATE POLICY "Super admins can see all %s" ON %s
                FOR ALL USING (auth.jwt() ->> ''role'' = ''super_admin'');
                
            CREATE POLICY "Company users can see their company %s" ON %s
                FOR ALL USING (
                    auth.jwt() ->> ''role'' IN (''company_admin'', ''learner'')
                    AND company_id::text = auth.jwt() ->> ''company_id''
                );
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- =====================================================
-- UPDATED UTILITY FUNCTIONS
-- =====================================================

-- Enhanced word count function
CREATE OR REPLACE FUNCTION update_cm_word_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update word count for cm_module_content
    IF TG_TABLE_NAME = 'cm_module_content' THEN
        NEW.total_word_count = (
            COALESCE(array_length(string_to_array(NEW.introduction, ' '), 1), 0) +
            COALESCE(array_length(string_to_array(NEW.core_content, ' '), 1), 0) +
            COALESCE(array_length(string_to_array(NEW.practical_applications, ' '), 1), 0) +
            COALESCE(array_length(string_to_array(NEW.case_studies, ' '), 1), 0) +
            COALESCE(array_length(string_to_array(NEW.assessments, ' '), 1), 0)
        );
        
        NEW.section_word_counts = jsonb_build_object(
            'introduction', COALESCE(array_length(string_to_array(NEW.introduction, ' '), 1), 0),
            'core_content', COALESCE(array_length(string_to_array(NEW.core_content, ' '), 1), 0),
            'practical_applications', COALESCE(array_length(string_to_array(NEW.practical_applications, ' '), 1), 0),
            'case_studies', COALESCE(array_length(string_to_array(NEW.case_studies, ' '), 1), 0),
            'assessments', COALESCE(array_length(string_to_array(NEW.assessments, ' '), 1), 0)
        );
        
        NEW.updated_at = NOW();
    END IF;
    
    -- Update word count for cm_content_sections
    IF TG_TABLE_NAME = 'cm_content_sections' THEN
        NEW.word_count = COALESCE(array_length(string_to_array(NEW.section_content, ' '), 1), 0);
        NEW.character_count = LENGTH(NEW.section_content);
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_cm_module_content_word_counts
    BEFORE INSERT OR UPDATE ON cm_module_content
    FOR EACH ROW EXECUTE FUNCTION update_cm_word_counts();

CREATE TRIGGER update_cm_content_sections_word_counts
    BEFORE INSERT OR UPDATE ON cm_content_sections
    FOR EACH ROW EXECUTE FUNCTION update_cm_word_counts();

-- Apply updated_at triggers to new fields
CREATE TRIGGER update_cm_enhancement_sessions_updated_at
    BEFORE UPDATE ON cm_enhancement_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'LXERA SAAS CONTENT SCHEMA INSTALLATION COMPLETE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Enhanced with multi-tenant RLS policies';
    RAISE NOTICE 'All cm_* tables now support company isolation';
    RAISE NOTICE 'Ready for SaaS platform integration!';
    RAISE NOTICE '==============================================';
END $$;