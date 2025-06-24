-- =====================================================
-- MULTIMEDIA MANAGEMENT SCHEMA (PUBLIC VERSION)
-- =====================================================
-- This creates all multimedia tables in the public schema with mm_ prefix
-- Strongly connected to existing content management and pipeline execution
-- Course-specific multimedia assets with proper scalability
-- =====================================================

-- =====================================================
-- 1. MULTIMEDIA SESSIONS (Course-level multimedia generation)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_multimedia_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Strong connections to existing schemas
    execution_id UUID, -- References agent-backend.pipeline_executions(id)
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
    success_rate FLOAT DEFAULT 0, -- percentage of successful asset generation
    error_details JSONB,
    
    -- Output organization
    output_directory TEXT NOT NULL,
    package_ready BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for multimedia sessions
CREATE INDEX idx_mm_multimedia_sessions_execution ON mm_multimedia_sessions(execution_id);
CREATE INDEX idx_mm_multimedia_sessions_course ON mm_multimedia_sessions(course_id);
CREATE INDEX idx_mm_multimedia_sessions_employee ON mm_multimedia_sessions(employee_name);
CREATE INDEX idx_mm_multimedia_sessions_status ON mm_multimedia_sessions(status);
CREATE INDEX idx_mm_multimedia_sessions_created ON mm_multimedia_sessions(created_at);

-- RLS Policy
ALTER TABLE mm_multimedia_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for service role" ON mm_multimedia_sessions
    FOR ALL USING (true);

-- =====================================================
-- 2. MULTIMEDIA ASSETS (Individual multimedia files)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_multimedia_assets (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Strong connections to existing schemas
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    content_id UUID, -- References cm_module_content(content_id) - can be NULL for course-level assets
    execution_id UUID, -- References agent-backend.pipeline_executions(id)
    
    -- Course and module context
    course_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    section_name TEXT, -- NULL for full module assets, specific section name for section assets
    
    -- Asset classification
    asset_type TEXT CHECK (asset_type IN ('audio', 'video', 'slides', 'script', 'image', 'document')) NOT NULL,
    asset_category TEXT CHECK (asset_category IN ('module_complete', 'section', 'summary', 'intro', 'course_overview')) NOT NULL,
    asset_purpose TEXT CHECK (asset_purpose IN ('narration', 'presentation', 'reference', 'assessment', 'navigation')),
    
    -- File information (metadata only - files stored on filesystem)
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT DEFAULT 0,
    file_format TEXT NOT NULL, -- mp3, mp4, png, txt, pdf, etc.
    file_hash TEXT, -- For deduplication and integrity checking
    
    -- Content metadata
    duration_seconds FLOAT, -- for audio/video
    dimensions TEXT, -- for images/videos (e.g., "1920x1080")
    slide_count INTEGER, -- for presentations
    word_count INTEGER, -- for scripts/documents
    
    -- Generation details
    generated_with TEXT, -- 'openai_tts', 'simplified_pipeline', 'professional_template'
    generation_settings JSONB DEFAULT '{}', -- voice settings, video settings, etc.
    personalization_data JSONB DEFAULT '{}', -- employee-specific customizations applied
    
    -- Quality and processing
    quality_level TEXT CHECK (quality_level IN ('draft', 'standard', 'high', 'professional')) DEFAULT 'standard',
    processing_duration_ms BIGINT,
    generation_attempts INTEGER DEFAULT 1,
    
    -- Status tracking
    status TEXT CHECK (status IN ('generating', 'completed', 'failed', 'archived', 'deleted')) DEFAULT 'generating',
    ready_for_delivery BOOLEAN DEFAULT FALSE,
    
    -- Access and usage tracking
    access_level TEXT CHECK (access_level IN ('public', 'employee_only', 'admin_only')) DEFAULT 'employee_only',
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT mm_valid_section_reference CHECK (
        (section_name IS NULL AND asset_category IN ('module_complete', 'course_overview')) OR
        (section_name IS NOT NULL AND asset_category IN ('section', 'intro', 'summary'))
    )
);

-- Indexes for multimedia assets
CREATE INDEX idx_mm_multimedia_assets_session ON mm_multimedia_assets(session_id);
CREATE INDEX idx_mm_multimedia_assets_content ON mm_multimedia_assets(content_id);
CREATE INDEX idx_mm_multimedia_assets_execution ON mm_multimedia_assets(execution_id);
CREATE INDEX idx_mm_multimedia_assets_course ON mm_multimedia_assets(course_id);
CREATE INDEX idx_mm_multimedia_assets_module ON mm_multimedia_assets(module_name);
CREATE INDEX idx_mm_multimedia_assets_type ON mm_multimedia_assets(asset_type);
CREATE INDEX idx_mm_multimedia_assets_category ON mm_multimedia_assets(asset_category);
CREATE INDEX idx_mm_multimedia_assets_status ON mm_multimedia_assets(status);
CREATE INDEX idx_mm_multimedia_assets_hash ON mm_multimedia_assets(file_hash);
CREATE INDEX idx_mm_multimedia_assets_created ON mm_multimedia_assets(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_mm_multimedia_assets_course_module ON mm_multimedia_assets(course_id, module_name);
CREATE INDEX idx_mm_multimedia_assets_type_status ON mm_multimedia_assets(asset_type, status);

-- RLS Policy
ALTER TABLE mm_multimedia_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for service role" ON mm_multimedia_assets
    FOR ALL USING (true);

-- =====================================================
-- 3. SCRIPT GENERATIONS (Narration scripts with personalization)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_script_generations (
    script_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Strong connections
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    content_id UUID, -- References cm_module_content(content_id)
    asset_id UUID REFERENCES mm_multimedia_assets(asset_id) ON DELETE CASCADE,
    
    -- Course and content context
    course_id TEXT NOT NULL,
    module_name TEXT NOT NULL,
    section_name TEXT, -- NULL for full module scripts
    
    -- Script details
    script_type TEXT CHECK (script_type IN ('full_module', 'section', 'summary', 'intro', 'transition')) NOT NULL,
    script_purpose TEXT CHECK (script_purpose IN ('narration', 'presentation', 'assessment', 'introduction')),
    
    -- Content transformation
    source_content TEXT NOT NULL, -- Original module content from cm_module_content
    generated_script TEXT NOT NULL, -- Narration-ready script with personalization
    script_metadata JSONB DEFAULT '{}', -- Additional script information
    
    -- Personalization tracking
    employee_context JSONB NOT NULL, -- {name, role, level, goals}
    personalization_applied JSONB DEFAULT '{}', -- {name_insertions: 15, role_context: 8, examples_added: 3}
    personalization_level TEXT CHECK (personalization_level IN ('basic', 'standard', 'advanced')) DEFAULT 'standard',
    
    -- Script metrics
    original_word_count INTEGER DEFAULT 0,
    script_word_count INTEGER DEFAULT 0,
    estimated_duration_minutes FLOAT DEFAULT 0,
    compression_ratio FLOAT, -- script_words / original_words
    
    -- Quality and processing
    readability_score FLOAT,
    pacing_adjustments JSONB DEFAULT '{}', -- {pauses: [...], emphasis: [...], speed_changes: [...]}
    quality_checks JSONB DEFAULT '{}', -- Quality validation results
    
    -- Generation details
    generated_with TEXT DEFAULT 'openai_gpt',
    generation_settings JSONB DEFAULT '{}',
    generation_duration_ms BIGINT,
    
    -- Status
    status TEXT CHECK (status IN ('generating', 'completed', 'failed', 'needs_review')) DEFAULT 'generating',
    approved_for_audio BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for script generations
CREATE INDEX idx_mm_script_generations_session ON mm_script_generations(session_id);
CREATE INDEX idx_mm_script_generations_content ON mm_script_generations(content_id);
CREATE INDEX idx_mm_script_generations_asset ON mm_script_generations(asset_id);
CREATE INDEX idx_mm_script_generations_course ON mm_script_generations(course_id);
CREATE INDEX idx_mm_script_generations_module ON mm_script_generations(module_name);
CREATE INDEX idx_mm_script_generations_type ON mm_script_generations(script_type);
CREATE INDEX idx_mm_script_generations_status ON mm_script_generations(status);

-- RLS Policy
ALTER TABLE mm_script_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for service role" ON mm_script_generations
    FOR ALL USING (true);

-- =====================================================
-- 4. EMPLOYEE MULTIMEDIA PREFERENCES (Course-specific preferences)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_employee_preferences (
    preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Employee identification
    employee_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    course_id TEXT, -- NULL for global preferences, specific course_id for course-specific
    
    -- Audio preferences
    preferred_voice TEXT DEFAULT 'alloy',
    preferred_speed FLOAT DEFAULT 1.0,
    audio_format TEXT DEFAULT 'mp3',
    include_background_music BOOLEAN DEFAULT FALSE,
    
    -- Video preferences  
    preferred_resolution TEXT DEFAULT '1920x1080',
    slide_animation_level TEXT CHECK (slide_animation_level IN ('none', 'minimal', 'standard', 'dynamic')) DEFAULT 'standard',
    video_format TEXT DEFAULT 'mp4',
    include_captions BOOLEAN DEFAULT TRUE,
    
    -- Content preferences
    personalization_level TEXT CHECK (personalization_level IN ('basic', 'standard', 'advanced')) DEFAULT 'standard',
    include_name_in_narration BOOLEAN DEFAULT TRUE,
    role_specific_examples BOOLEAN DEFAULT TRUE,
    technical_depth TEXT CHECK (technical_depth IN ('basic', 'intermediate', 'advanced')) DEFAULT 'intermediate',
    
    -- Delivery preferences
    module_chunking TEXT CHECK (module_chunking IN ('full_module', 'by_section', 'summary_only', 'mixed')) DEFAULT 'full_module',
    progress_tracking BOOLEAN DEFAULT TRUE,
    offline_capable BOOLEAN DEFAULT TRUE,
    
    -- Learning style preferences
    visual_learning_emphasis BOOLEAN DEFAULT TRUE,
    practical_examples_focus BOOLEAN DEFAULT TRUE,
    assessment_style TEXT CHECK (assessment_style IN ('quiz', 'practical', 'mixed')) DEFAULT 'mixed',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure uniqueness per employee per course
    UNIQUE(employee_id, course_id)
);

-- Indexes for employee preferences
CREATE INDEX idx_mm_employee_preferences_employee ON mm_employee_preferences(employee_id);
CREATE INDEX idx_mm_employee_preferences_course ON mm_employee_preferences(course_id);
CREATE INDEX idx_mm_employee_preferences_employee_course ON mm_employee_preferences(employee_id, course_id);

-- RLS Policy
ALTER TABLE mm_employee_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for service role" ON mm_employee_preferences
    FOR ALL USING (true);

-- =====================================================
-- 5. FILE STORAGE TRACKING (Storage location and access management)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_file_storage (
    storage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Asset connection
    asset_id UUID NOT NULL REFERENCES mm_multimedia_assets(asset_id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    
    -- Course context
    course_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    
    -- Storage details
    storage_type TEXT CHECK (storage_type IN ('local', 's3', 'gcs', 'azure', 'cdn')) DEFAULT 'local',
    storage_location TEXT NOT NULL, -- bucket name, directory path, etc.
    file_path TEXT NOT NULL, -- full path to file
    public_url TEXT, -- CDN or public access URL
    private_url TEXT, -- Authenticated access URL
    
    -- File metadata for storage management
    storage_size_bytes BIGINT DEFAULT 0,
    content_hash TEXT, -- For integrity verification
    compression_type TEXT, -- gzip, none, etc.
    encryption_status TEXT CHECK (encryption_status IN ('none', 'at_rest', 'in_transit', 'both')) DEFAULT 'none',
    
    -- Access control and tracking
    access_level TEXT CHECK (access_level IN ('public', 'employee_only', 'course_participants', 'admin_only')) DEFAULT 'employee_only',
    download_count INTEGER DEFAULT 0,
    stream_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    
    -- Lifecycle management
    expiration_date TIMESTAMP WITH TIME ZONE,
    backup_status TEXT CHECK (backup_status IN ('none', 'pending', 'completed', 'failed')) DEFAULT 'none',
    archive_status TEXT CHECK (archive_status IN ('active', 'archived', 'deleted')) DEFAULT 'active',
    
    -- Performance tracking
    average_download_time_ms INTEGER,
    bandwidth_usage_mb FLOAT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for file storage
CREATE INDEX idx_mm_file_storage_asset ON mm_file_storage(asset_id);
CREATE INDEX idx_mm_file_storage_session ON mm_file_storage(session_id);
CREATE INDEX idx_mm_file_storage_course ON mm_file_storage(course_id);
CREATE INDEX idx_mm_file_storage_employee ON mm_file_storage(employee_name);
CREATE INDEX idx_mm_file_storage_type ON mm_file_storage(storage_type);
CREATE INDEX idx_mm_file_storage_access ON mm_file_storage(access_level);
CREATE INDEX idx_mm_file_storage_archive ON mm_file_storage(archive_status);
CREATE INDEX idx_mm_file_storage_hash ON mm_file_storage(content_hash);

-- RLS Policy
ALTER TABLE mm_file_storage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for service role" ON mm_file_storage
    FOR ALL USING (true);

-- =====================================================
-- 6. MULTIMEDIA ANALYTICS (Performance and usage tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_multimedia_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Session and course context
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    
    -- Generation performance metrics
    total_generation_time_ms BIGINT DEFAULT 0,
    assets_generated_successfully INTEGER DEFAULT 0,
    assets_generation_failed INTEGER DEFAULT 0,
    
    -- Content metrics
    total_audio_duration_minutes FLOAT DEFAULT 0,
    total_video_duration_minutes FLOAT DEFAULT 0,
    total_slides_generated INTEGER DEFAULT 0,
    total_scripts_word_count INTEGER DEFAULT 0,
    
    -- File size metrics
    total_storage_size_mb FLOAT DEFAULT 0,
    average_file_size_mb FLOAT DEFAULT 0,
    largest_file_size_mb FLOAT DEFAULT 0,
    
    -- Quality metrics
    average_generation_quality FLOAT DEFAULT 0,
    personalization_score FLOAT DEFAULT 0, -- How well personalized the content is
    completion_rate FLOAT DEFAULT 0, -- Percentage of planned assets completed
    
    -- API and cost metrics
    total_api_calls INTEGER DEFAULT 0,
    total_tokens_consumed INTEGER DEFAULT 0,
    total_generation_cost_usd DECIMAL(10,4) DEFAULT 0,
    cost_per_minute_usd DECIMAL(6,4) DEFAULT 0,
    
    -- Usage metrics (populated when content is accessed)
    content_access_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    streaming_hours FLOAT DEFAULT 0,
    
    -- Performance insights
    bottleneck_stages TEXT[], -- Stages that took longest
    optimization_suggestions JSONB DEFAULT '{}',
    generation_errors JSONB DEFAULT '{}',
    
    -- Comparison metrics
    efficiency_score FLOAT DEFAULT 0, -- Compared to baseline
    time_vs_target_ratio FLOAT DEFAULT 0,
    cost_vs_budget_ratio FLOAT DEFAULT 0,
    
    -- Timestamps
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_period_start TIMESTAMP WITH TIME ZONE,
    data_period_end TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for multimedia analytics
CREATE INDEX idx_mm_multimedia_analytics_session ON mm_multimedia_analytics(session_id);
CREATE INDEX idx_mm_multimedia_analytics_course ON mm_multimedia_analytics(course_id);
CREATE INDEX idx_mm_multimedia_analytics_employee ON mm_multimedia_analytics(employee_name);
CREATE INDEX idx_mm_multimedia_analytics_date ON mm_multimedia_analytics(calculation_date);

-- RLS Policy
ALTER TABLE mm_multimedia_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for service role" ON mm_multimedia_analytics
    FOR ALL USING (true);

-- =====================================================
-- UTILITY FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update multimedia session statistics
CREATE OR REPLACE FUNCTION update_mm_session_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update session statistics when assets are added/updated
    IF TG_TABLE_NAME = 'mm_multimedia_assets' THEN
        UPDATE mm_multimedia_sessions SET
            assets_generated = (
                SELECT COUNT(*) FROM mm_multimedia_assets 
                WHERE session_id = NEW.session_id AND status = 'completed'
            ),
            total_file_size_mb = (
                SELECT COALESCE(SUM(file_size_bytes), 0) / (1024 * 1024)
                FROM mm_multimedia_assets 
                WHERE session_id = NEW.session_id AND status = 'completed'
            ),
            updated_at = NOW()
        WHERE session_id = NEW.session_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically set file hash and size
CREATE OR REPLACE FUNCTION update_mm_asset_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Update word count for scripts
    IF NEW.asset_type = 'script' AND NEW.word_count IS NULL THEN
        -- This would be updated by the application when the actual file is processed
        NEW.word_count = 0;
    END IF;
    
    -- Update timestamps
    NEW.updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_mm_multimedia_assets_metadata
    BEFORE INSERT OR UPDATE ON mm_multimedia_assets
    FOR EACH ROW EXECUTE FUNCTION update_mm_asset_metadata();

CREATE TRIGGER update_mm_session_statistics
    AFTER INSERT OR UPDATE ON mm_multimedia_assets
    FOR EACH ROW EXECUTE FUNCTION update_mm_session_stats();

-- =====================================================
-- INITIAL SETUP AND VERIFICATION
-- =====================================================

-- Insert initial verification record
INSERT INTO mm_multimedia_sessions (
    session_id, 
    course_id, 
    employee_name, 
    employee_id, 
    course_title, 
    total_modules,
    output_directory
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'schema_verification',
    'System',
    'system',
    'Multimedia Schema Installation Verification',
    0,
    '/dev/null'
) ON CONFLICT (session_id) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'MULTIMEDIA SCHEMA INSTALLATION COMPLETE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Schema: public (with mm_ prefix)';
    RAISE NOTICE 'Tables Created: 6';
    RAISE NOTICE 'Functions Created: 2';
    RAISE NOTICE 'Triggers Created: 2';
    RAISE NOTICE 'Indexes Created: 30+';
    RAISE NOTICE 'RLS Policies: Enabled on all tables';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Connected to: cm_module_content, pipeline_executions';
    RAISE NOTICE 'Course-specific multimedia tracking enabled';
    RAISE NOTICE 'Scalable with mm_ prefix for all tables';
    RAISE NOTICE '==============================================';
END $$;