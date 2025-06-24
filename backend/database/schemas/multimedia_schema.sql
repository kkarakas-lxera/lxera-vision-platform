-- =====================================================
-- LXERA SAAS MULTIMEDIA MANAGEMENT SCHEMA (ENHANCED)
-- =====================================================
-- Multimedia tables with multi-tenant RLS
-- Original mm_* tables enhanced with company isolation
-- =====================================================

-- =====================================================
-- 1. MULTIMEDIA SESSIONS (ENHANCED WITH MULTI-TENANCY)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_multimedia_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Strong connections to existing schemas
    content_id UUID REFERENCES cm_module_content(content_id),
    course_id TEXT NOT NULL, -- Course identifier for grouping
    
    -- Employee and course context
    employee_name TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    course_title TEXT NOT NULL,
    total_modules INTEGER NOT NULL,
    
    -- Session configuration
    session_type TEXT CHECK (session_type IN ('per_module', 'complete_course', 'summary_only')) DEFAULT 'complete_course',
    personalization_level TEXT CHECK (personalization_level IN ('basic', 'standard', 'advanced')) DEFAULT 'standard',
    
    -- Generation pipeline settings
    pipeline_used TEXT DEFAULT 'simplified_pipeline',
    target_duration_minutes INTEGER DEFAULT 20,
    voice_settings JSONB DEFAULT '{"voice": "alloy", "speed": 1.0}',
    slide_template TEXT DEFAULT 'professional',
    video_quality TEXT DEFAULT 'standard',
    
    -- Progress tracking
    modules_processed INTEGER DEFAULT 0,
    assets_generated INTEGER DEFAULT 0,
    total_assets_planned INTEGER DEFAULT 0,
    
    -- Performance metrics
    total_processing_time_ms BIGINT,
    total_file_size_mb FLOAT DEFAULT 0,
    api_calls_made INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    generation_cost_usd DECIMAL(8,4) DEFAULT 0,
    
    -- Status and results
    status TEXT CHECK (status IN ('initializing', 'processing', 'completed', 'failed', 'archived')) DEFAULT 'initializing',
    completion_percentage FLOAT DEFAULT 0,
    error_message TEXT,
    
    -- Tracking
    created_by UUID REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mm_multimedia_sessions_company ON mm_multimedia_sessions(company_id);
CREATE INDEX idx_mm_multimedia_sessions_content ON mm_multimedia_sessions(content_id);
CREATE INDEX idx_mm_multimedia_sessions_course ON mm_multimedia_sessions(course_id);
CREATE INDEX idx_mm_multimedia_sessions_status ON mm_multimedia_sessions(status);
CREATE INDEX idx_mm_multimedia_sessions_employee ON mm_multimedia_sessions(employee_id);

-- RLS Policies
ALTER TABLE mm_multimedia_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can see all multimedia sessions" ON mm_multimedia_sessions
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company admins can manage their company multimedia" ON mm_multimedia_sessions
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Learners can view their multimedia sessions" ON mm_multimedia_sessions
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'learner' 
        AND employee_id IN (
            SELECT employee_id FROM employees e
            JOIN users u ON e.user_id = u.id
            WHERE u.id::text = auth.jwt() ->> 'sub'
        )
    );

-- =====================================================
-- 2. MULTIMEDIA ASSETS (ENHANCED)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_multimedia_assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Asset classification
    asset_type TEXT CHECK (asset_type IN ('audio', 'video', 'slides', 'script', 'thumbnail', 'preview')) NOT NULL,
    asset_subtype TEXT, -- narration, background, intro, slide_deck, etc.
    module_reference TEXT,
    
    -- File details
    original_filename TEXT,
    file_extension TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT,
    
    -- Generation details
    generation_method TEXT DEFAULT 'openai_tts',
    generation_parameters JSONB DEFAULT '{}',
    quality_level TEXT DEFAULT 'standard',
    
    -- Content metadata
    duration_seconds FLOAT,
    transcript TEXT,
    word_count INTEGER,
    
    -- Processing status
    processing_status TEXT CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'archived')) DEFAULT 'pending',
    processing_error TEXT,
    
    -- Access control
    access_level TEXT CHECK (access_level IN ('public', 'company', 'employee_only')) DEFAULT 'company',
    download_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    last_accessed TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_mm_multimedia_assets_company ON mm_multimedia_assets(company_id);
CREATE INDEX idx_mm_multimedia_assets_session ON mm_multimedia_assets(session_id);
CREATE INDEX idx_mm_multimedia_assets_type ON mm_multimedia_assets(asset_type);
CREATE INDEX idx_mm_multimedia_assets_status ON mm_multimedia_assets(processing_status);

-- RLS Policies
ALTER TABLE mm_multimedia_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can see their company assets" ON mm_multimedia_assets
    FOR ALL USING (
        (auth.jwt() ->> 'role' = 'super_admin') OR
        (auth.jwt() ->> 'role' IN ('company_admin', 'learner') AND company_id::text = auth.jwt() ->> 'company_id')
    );

-- =====================================================
-- 3. SCRIPT GENERATIONS (ENHANCED)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_script_generations (
    script_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Script source and transformation
    source_content_id UUID REFERENCES cm_module_content(content_id),
    source_section TEXT, -- introduction, core_content, etc.
    original_content TEXT NOT NULL,
    narration_script TEXT NOT NULL,
    
    -- Personalization tracking
    personalization_applied JSONB DEFAULT '{}',
    employee_context JSONB DEFAULT '{}',
    personalization_score DECIMAL(3,2) DEFAULT 0.50,
    
    -- Script quality metrics
    readability_score DECIMAL(3,2),
    pacing_score DECIMAL(3,2),
    engagement_score DECIMAL(3,2),
    estimated_duration_seconds FLOAT,
    
    -- Processing details
    transformation_method TEXT DEFAULT 'openai_gpt',
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    
    -- Status
    status TEXT CHECK (status IN ('draft', 'reviewed', 'approved', 'rejected', 'archived')) DEFAULT 'draft',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_mm_script_generations_company ON mm_script_generations(company_id);
CREATE INDEX idx_mm_script_generations_session ON mm_script_generations(session_id);
CREATE INDEX idx_mm_script_generations_content ON mm_script_generations(source_content_id);
CREATE INDEX idx_mm_script_generations_status ON mm_script_generations(status);

-- RLS Policies
ALTER TABLE mm_script_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can see their company scripts" ON mm_script_generations
    FOR ALL USING (
        (auth.jwt() ->> 'role' = 'super_admin') OR
        (auth.jwt() ->> 'role' IN ('company_admin', 'learner') AND company_id::text = auth.jwt() ->> 'company_id')
    );

-- =====================================================
-- 4. EMPLOYEE PREFERENCES (ENHANCED)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_employee_preferences (
    preference_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Audio preferences
    preferred_voice TEXT DEFAULT 'alloy',
    voice_speed DECIMAL(3,2) DEFAULT 1.00 CHECK (voice_speed >= 0.25 AND voice_speed <= 4.00),
    audio_quality TEXT DEFAULT 'standard' CHECK (audio_quality IN ('basic', 'standard', 'high')),
    
    -- Video preferences
    video_quality TEXT DEFAULT 'standard' CHECK (video_quality IN ('low', 'standard', 'high', 'ultra')),
    subtitle_enabled BOOLEAN DEFAULT true,
    auto_play BOOLEAN DEFAULT false,
    
    -- Content preferences
    content_personalization_level TEXT DEFAULT 'standard' CHECK (content_personalization_level IN ('minimal', 'standard', 'advanced')),
    learning_style JSONB DEFAULT '{}',
    preferred_examples TEXT[] DEFAULT '{}',
    
    -- Accessibility preferences
    screen_reader_compatible BOOLEAN DEFAULT false,
    high_contrast BOOLEAN DEFAULT false,
    large_fonts BOOLEAN DEFAULT false,
    
    -- Language and localization
    preferred_language TEXT DEFAULT 'en-US',
    time_zone TEXT DEFAULT 'UTC',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mm_employee_preferences_employee ON mm_employee_preferences(employee_id);
CREATE INDEX idx_mm_employee_preferences_company ON mm_employee_preferences(company_id);
CREATE UNIQUE INDEX idx_mm_employee_preferences_unique ON mm_employee_preferences(employee_id, company_id);

-- RLS Policies
ALTER TABLE mm_employee_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can see all preferences" ON mm_employee_preferences
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company admins can see their company preferences" ON mm_employee_preferences
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

CREATE POLICY "Employees can manage their own preferences" ON mm_employee_preferences
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'learner' 
        AND employee_id IN (
            SELECT id FROM employees WHERE user_id::text = auth.jwt() ->> 'sub'
        )
    );

-- =====================================================
-- 5. FILE STORAGE (ENHANCED)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_file_storage (
    storage_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID NOT NULL REFERENCES mm_multimedia_assets(asset_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Storage location
    storage_provider TEXT CHECK (storage_provider IN ('local', 'supabase', 's3', 'gcs', 'azure', 'cloudflare')) DEFAULT 'supabase',
    storage_path TEXT NOT NULL,
    public_url TEXT,
    cdn_url TEXT,
    
    -- File integrity
    file_hash TEXT,
    checksum_algorithm TEXT DEFAULT 'sha256',
    file_verified BOOLEAN DEFAULT false,
    
    -- Access control
    is_public BOOLEAN DEFAULT false,
    access_token TEXT,
    expires_at TIMESTAMPTZ,
    
    -- Usage tracking
    download_count INTEGER DEFAULT 0,
    total_bandwidth_mb DECIMAL(10,2) DEFAULT 0,
    last_accessed TIMESTAMPTZ,
    
    -- Storage management
    auto_cleanup BOOLEAN DEFAULT false,
    retention_days INTEGER,
    archived BOOLEAN DEFAULT false,
    
    -- Timestamps
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_mm_file_storage_company ON mm_file_storage(company_id);
CREATE INDEX idx_mm_file_storage_asset ON mm_file_storage(asset_id);
CREATE INDEX idx_mm_file_storage_provider ON mm_file_storage(storage_provider);
CREATE INDEX idx_mm_file_storage_public ON mm_file_storage(is_public);
CREATE UNIQUE INDEX idx_mm_file_storage_path ON mm_file_storage(storage_provider, storage_path);

-- RLS Policies
ALTER TABLE mm_file_storage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can see their company files" ON mm_file_storage
    FOR ALL USING (
        (auth.jwt() ->> 'role' = 'super_admin') OR
        (auth.jwt() ->> 'role' IN ('company_admin', 'learner') AND company_id::text = auth.jwt() ->> 'company_id')
    );

-- =====================================================
-- 6. MULTIMEDIA ANALYTICS (ENHANCED)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_multimedia_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Generation performance
    total_generation_time_seconds INTEGER,
    average_processing_time_per_asset DECIMAL(8,2),
    pipeline_efficiency_score DECIMAL(3,2),
    error_rate DECIMAL(3,2) DEFAULT 0.00,
    
    -- Content metrics
    total_assets_created INTEGER DEFAULT 0,
    total_file_size_mb DECIMAL(10,2) DEFAULT 0,
    average_asset_quality_score DECIMAL(3,2),
    content_personalization_effectiveness DECIMAL(3,2),
    
    -- Usage statistics
    total_views INTEGER DEFAULT 0,
    total_downloads INTEGER DEFAULT 0,
    average_engagement_time_seconds DECIMAL(8,2),
    completion_rate DECIMAL(3,2),
    
    -- Cost analysis
    generation_cost_usd DECIMAL(8,4) DEFAULT 0,
    storage_cost_usd DECIMAL(8,4) DEFAULT 0,
    bandwidth_cost_usd DECIMAL(8,4) DEFAULT 0,
    total_cost_usd DECIMAL(8,4) DEFAULT 0,
    
    -- Performance comparison
    tokens_used INTEGER DEFAULT 0,
    api_calls_made INTEGER DEFAULT 0,
    cost_per_asset DECIMAL(8,4),
    time_per_asset_seconds DECIMAL(8,2),
    
    -- Quality metrics
    user_satisfaction_score DECIMAL(3,2),
    technical_quality_score DECIMAL(3,2),
    content_accuracy_score DECIMAL(3,2),
    
    -- Timestamps
    analytics_generated_at TIMESTAMPTZ DEFAULT NOW(),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_mm_multimedia_analytics_company ON mm_multimedia_analytics(company_id);
CREATE INDEX idx_mm_multimedia_analytics_session ON mm_multimedia_analytics(session_id);
CREATE INDEX idx_mm_multimedia_analytics_period ON mm_multimedia_analytics(period_start, period_end);
CREATE INDEX idx_mm_multimedia_analytics_generated ON mm_multimedia_analytics(analytics_generated_at);

-- RLS Policies
ALTER TABLE mm_multimedia_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can see all analytics" ON mm_multimedia_analytics
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company admins can see their company analytics" ON mm_multimedia_analytics
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'company_admin' 
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Update preferences timestamp
CREATE TRIGGER update_mm_employee_preferences_updated_at
    BEFORE UPDATE ON mm_employee_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update analytics on asset creation
CREATE OR REPLACE FUNCTION update_multimedia_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update analytics when assets are completed
    IF NEW.processing_status = 'completed' AND OLD.processing_status != 'completed' THEN
        -- Update session analytics
        UPDATE mm_multimedia_sessions 
        SET assets_generated = assets_generated + 1,
            last_activity = NOW()
        WHERE session_id = NEW.session_id;
        
        -- Update or create analytics record
        INSERT INTO mm_multimedia_analytics (
            session_id, 
            company_id,
            total_assets_created,
            total_file_size_mb
        ) VALUES (
            NEW.session_id,
            NEW.company_id,
            1,
            NEW.file_size_bytes / (1024.0 * 1024.0)
        )
        ON CONFLICT (session_id) DO UPDATE SET
            total_assets_created = mm_multimedia_analytics.total_assets_created + 1,
            total_file_size_mb = mm_multimedia_analytics.total_file_size_mb + (NEW.file_size_bytes / (1024.0 * 1024.0)),
            analytics_generated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply analytics trigger
CREATE TRIGGER update_analytics_on_asset_completion
    AFTER UPDATE ON mm_multimedia_assets
    FOR EACH ROW EXECUTE FUNCTION update_multimedia_analytics();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'LXERA SAAS MULTIMEDIA SCHEMA INSTALLATION COMPLETE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Enhanced with multi-tenant RLS policies';
    RAISE NOTICE 'All mm_* tables now support company isolation';
    RAISE NOTICE 'Ready for multimedia pipeline integration!';
    RAISE NOTICE '==============================================';
END $$;