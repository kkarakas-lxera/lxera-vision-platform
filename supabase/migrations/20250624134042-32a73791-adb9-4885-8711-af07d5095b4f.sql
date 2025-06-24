
-- =====================================================
-- LXERA SAAS MULTIMEDIA MANAGEMENT SCHEMA
-- =====================================================
-- Multimedia asset management for course content
-- Enhanced with multi-tenant RLS and company isolation
-- =====================================================

-- =====================================================
-- 1. MULTIMEDIA SESSIONS (tracking multimedia generation)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_multimedia_sessions (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Session details
    session_type TEXT DEFAULT 'full_generation', -- full_generation, slide_only, audio_only, video_only
    module_name TEXT NOT NULL,
    employee_name TEXT NOT NULL,
    
    -- Generation parameters
    generation_config JSONB DEFAULT '{}', -- configuration for multimedia generation
    content_sections TEXT[] NOT NULL, -- sections to process
    
    -- Status tracking
    status TEXT DEFAULT 'started', -- started, processing, completed, failed
    current_stage TEXT, -- current processing stage
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Results
    total_assets_generated INTEGER DEFAULT 0,
    slides_generated INTEGER DEFAULT 0,
    audio_files_generated INTEGER DEFAULT 0,
    video_files_generated INTEGER DEFAULT 0,
    
    -- Performance metrics
    processing_duration_seconds INTEGER,
    tokens_used INTEGER DEFAULT 0,
    
    -- Error handling
    error_details TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Tracking
    initiated_by UUID REFERENCES users(id),
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT mm_valid_session_type CHECK (session_type IN ('full_generation', 'slide_only', 'audio_only', 'video_only')),
    CONSTRAINT mm_valid_status CHECK (status IN ('started', 'processing', 'completed', 'failed'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_sessions_company ON mm_multimedia_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_sessions_content ON mm_multimedia_sessions(content_id);
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_sessions_status ON mm_multimedia_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_sessions_started ON mm_multimedia_sessions(started_at);

-- RLS Policies
ALTER TABLE mm_multimedia_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can see all multimedia sessions" ON mm_multimedia_sessions
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company users can see their company multimedia sessions" ON mm_multimedia_sessions
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

-- =====================================================
-- 2. MULTIMEDIA ASSETS (storing generated assets)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_multimedia_assets (
    asset_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Asset details
    asset_type TEXT NOT NULL, -- slide, audio, video, image, document
    asset_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER,
    mime_type TEXT,
    
    -- Content association
    section_name TEXT, -- which content section this asset belongs to
    slide_number INTEGER, -- for slide assets
    duration_seconds DECIMAL(8,2), -- for audio/video assets
    
    -- Asset metadata
    generation_config JSONB DEFAULT '{}', -- specific config used for this asset
    quality_metrics JSONB DEFAULT '{}', -- quality scores and metrics
    
    -- Processing details
    processing_time_seconds INTEGER,
    tokens_used INTEGER DEFAULT 0,
    generation_prompt TEXT, -- prompt used to generate this asset
    
    -- Status
    status TEXT DEFAULT 'generated', -- generated, processed, optimized, failed
    is_active BOOLEAN DEFAULT true,
    
    -- Storage details
    storage_bucket TEXT DEFAULT 'course-assets',
    storage_path TEXT,
    public_url TEXT,
    
    -- Version control
    version_number INTEGER DEFAULT 1,
    parent_asset_id UUID REFERENCES mm_multimedia_assets(asset_id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT mm_valid_asset_type CHECK (asset_type IN ('slide', 'audio', 'video', 'image', 'document')),
    CONSTRAINT mm_valid_asset_status CHECK (status IN ('generated', 'processed', 'optimized', 'failed'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_assets_company ON mm_multimedia_assets(company_id);
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_assets_session ON mm_multimedia_assets(session_id);
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_assets_content ON mm_multimedia_assets(content_id);
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_assets_type ON mm_multimedia_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_assets_section ON mm_multimedia_assets(section_name);
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_assets_status ON mm_multimedia_assets(status);
CREATE INDEX IF NOT EXISTS idx_mm_multimedia_assets_active ON mm_multimedia_assets(is_active);

-- RLS Policies
ALTER TABLE mm_multimedia_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can see all multimedia assets" ON mm_multimedia_assets
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

CREATE POLICY "Company users can see their company multimedia assets" ON mm_multimedia_assets
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        AND company_id::text = auth.jwt() ->> 'company_id'
    );

-- =====================================================
-- 3. SLIDE PRESENTATIONS (organizing slides into presentations)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_slide_presentations (
    presentation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Presentation details
    presentation_name TEXT NOT NULL,
    presentation_type TEXT DEFAULT 'module_slides', -- module_slides, section_slides, summary_slides
    
    -- Slides organization
    total_slides INTEGER DEFAULT 0,
    slide_order JSONB DEFAULT '[]', -- ordered array of asset_ids
    
    -- Presentation metadata
    template_used TEXT,
    theme_config JSONB DEFAULT '{}',
    
    -- Export formats
    pdf_generated BOOLEAN DEFAULT false,
    pptx_generated BOOLEAN DEFAULT false,
    html_generated BOOLEAN DEFAULT false,
    
    -- File references
    pdf_asset_id UUID REFERENCES mm_multimedia_assets(asset_id),
    pptx_asset_id UUID REFERENCES mm_multimedia_assets(asset_id),
    html_asset_id UUID REFERENCES mm_multimedia_assets(asset_id),
    
    -- Status
    status TEXT DEFAULT 'draft', -- draft, generated, exported, published
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT mm_valid_presentation_type CHECK (presentation_type IN ('module_slides', 'section_slides', 'summary_slides')),
    CONSTRAINT mm_valid_presentation_status CHECK (status IN ('draft', 'generated', 'exported', 'published'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mm_slide_presentations_company ON mm_slide_presentations(company_id);
CREATE INDEX IF NOT EXISTS idx_mm_slide_presentations_session ON mm_slide_presentations(session_id);
CREATE INDEX IF NOT EXISTS idx_mm_slide_presentations_content ON mm_slide_presentations(content_id);
CREATE INDEX IF NOT EXISTS idx_mm_slide_presentations_type ON mm_slide_presentations(presentation_type);
CREATE INDEX IF NOT EXISTS idx_mm_slide_presentations_status ON mm_slide_presentations(status);

-- RLS Policies
ALTER TABLE mm_slide_presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can see their company presentations" ON mm_slide_presentations
    FOR ALL USING (
        (auth.jwt() ->> 'role' = 'super_admin') OR
        (auth.jwt() ->> 'role' IN ('company_admin', 'learner') AND company_id::text = auth.jwt() ->> 'company_id')
    );

-- =====================================================
-- 4. AUDIO NARRATIONS (organizing audio files)
-- =====================================================

CREATE TABLE IF NOT EXISTS mm_audio_narrations (
    narration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES mm_multimedia_sessions(session_id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES cm_module_content(content_id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Narration details
    narration_name TEXT NOT NULL,
    narration_type TEXT DEFAULT 'full_module', -- full_module, section_narration, slide_narration
    section_name TEXT, -- for section-specific narrations
    
    -- Audio details
    total_duration_seconds DECIMAL(8,2) DEFAULT 0,
    audio_segments JSONB DEFAULT '[]', -- ordered array of audio asset_ids with timings
    
    -- Generation parameters
    voice_config JSONB DEFAULT '{}', -- voice settings used
    script_content TEXT, -- text that was narrated
    
    -- Audio files
    master_audio_id UUID REFERENCES mm_multimedia_assets(asset_id),
    segments_audio_ids UUID[], -- individual segment audio files
    
    -- Processing status
    synthesis_completed BOOLEAN DEFAULT false,
    segments_merged BOOLEAN DEFAULT false,
    
    -- Status
    status TEXT DEFAULT 'draft', -- draft, generated, processed, published
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT mm_valid_narration_type CHECK (narration_type IN ('full_module', 'section_narration', 'slide_narration')),
    CONSTRAINT mm_valid_narration_status CHECK (status IN ('draft', 'generated', 'processed', 'published'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mm_audio_narrations_company ON mm_audio_narrations(company_id);
CREATE INDEX IF NOT EXISTS idx_mm_audio_narrations_session ON mm_audio_narrations(session_id);
CREATE INDEX IF NOT EXISTS idx_mm_audio_narrations_content ON mm_audio_narrations(content_id);
CREATE INDEX IF NOT EXISTS idx_mm_audio_narrations_type ON mm_audio_narrations(narration_type);
CREATE INDEX IF NOT EXISTS idx_mm_audio_narrations_status ON mm_audio_narrations(status);

-- RLS Policies
ALTER TABLE mm_audio_narrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can see their company narrations" ON mm_audio_narrations
    FOR ALL USING (
        (auth.jwt() ->> 'role' = 'super_admin') OR
        (auth.jwt() ->> 'role' IN ('company_admin', 'learner') AND company_id::text = auth.jwt() ->> 'company_id')
    );

-- =====================================================
-- 5. STORAGE BUCKET FOR COURSE ASSETS
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'course-assets',
    'course-assets',
    true,
    52428800, -- 50MB limit
    ARRAY[
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'video/mp4', 'video/webm',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/html'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for course assets
CREATE POLICY "Company users can upload assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'course-assets' AND
        auth.jwt() ->> 'role' IN ('super_admin', 'company_admin', 'learner')
    );

CREATE POLICY "Company users can view their company assets" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'course-assets' AND (
            auth.jwt() ->> 'role' = 'super_admin' OR
            auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        )
    );

CREATE POLICY "Company users can update their company assets" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'course-assets' AND (
            auth.jwt() ->> 'role' = 'super_admin' OR
            auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        )
    );

CREATE POLICY "Company users can delete their company assets" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'course-assets' AND (
            auth.jwt() ->> 'role' = 'super_admin' OR
            auth.jwt() ->> 'role' IN ('company_admin', 'learner')
        )
    );

-- =====================================================
-- 6. TRIGGERS FOR MULTIMEDIA TABLES
-- =====================================================

-- Apply updated_at triggers to multimedia tables
CREATE TRIGGER update_mm_multimedia_sessions_updated_at
    BEFORE UPDATE ON mm_multimedia_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mm_multimedia_assets_updated_at
    BEFORE UPDATE ON mm_multimedia_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mm_slide_presentations_updated_at
    BEFORE UPDATE ON mm_slide_presentations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mm_audio_narrations_updated_at
    BEFORE UPDATE ON mm_audio_narrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
