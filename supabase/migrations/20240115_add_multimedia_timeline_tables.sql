-- Migration: Add multimedia timeline and slide notes tables
-- Description: Tables for storing video timelines, slide notes, and educational multimedia metadata

-- Create mm_video_timelines table for storing video synchronization data
CREATE TABLE IF NOT EXISTS mm_video_timelines (
    timeline_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES mm_multimedia_sessions(session_id),
    content_id UUID REFERENCES cm_module_content(content_id),
    module_name TEXT NOT NULL,
    
    -- Timeline data
    total_duration FLOAT NOT NULL, -- Total video duration in seconds
    narration_file_path TEXT NOT NULL, -- Path to complete narration audio
    slide_count INTEGER NOT NULL,
    
    -- Audio settings used
    voice_used TEXT NOT NULL DEFAULT 'nova',
    speech_speed FLOAT NOT NULL DEFAULT 1.0,
    audio_language TEXT NOT NULL DEFAULT 'en',
    
    -- Timeline JSON data
    audio_segments JSONB NOT NULL DEFAULT '[]', -- Array of audio segment details
    slide_transitions JSONB NOT NULL DEFAULT '[]', -- Array of slide transition points
    
    -- Video output information
    video_file_path TEXT,
    video_duration FLOAT,
    video_file_size BIGINT,
    video_resolution TEXT,
    video_fps INTEGER,
    
    -- Status tracking
    generation_status TEXT NOT NULL DEFAULT 'pending',
    generation_started_at TIMESTAMPTZ,
    generation_completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'
);

-- Create mm_slide_notes table for storing detailed slide content
CREATE TABLE IF NOT EXISTS mm_slide_notes (
    note_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timeline_id UUID REFERENCES mm_video_timelines(timeline_id) ON DELETE CASCADE,
    content_id UUID REFERENCES cm_module_content(content_id),
    
    -- Slide identification
    slide_id TEXT NOT NULL, -- e.g., 'slide_1', 'slide_2'
    slide_number INTEGER NOT NULL,
    content_section TEXT NOT NULL, -- e.g., 'title', 'introduction', 'core_content'
    
    -- Slide content
    slide_title TEXT NOT NULL,
    main_points JSONB NOT NULL DEFAULT '[]', -- Array of bullet points
    detailed_notes TEXT NOT NULL, -- Full speaker notes
    
    -- Timing information
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    duration FLOAT GENERATED ALWAYS AS (end_time - start_time) STORED,
    
    -- Visual and animation data
    visual_elements JSONB DEFAULT '[]', -- Suggested visual elements
    timing_cues JSONB DEFAULT '[]', -- Detailed timing for animations
    transitions JSONB DEFAULT '{}', -- Entry/exit transitions
    
    -- Generated slide information
    slide_image_path TEXT,
    slide_template_used TEXT,
    design_theme TEXT DEFAULT 'professional',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    emphasis_points JSONB DEFAULT '[]' -- Words/phrases to emphasize
);

-- Create mm_educational_scripts table for storing generated scripts
CREATE TABLE IF NOT EXISTS mm_educational_scripts (
    script_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES cm_module_content(content_id),
    timeline_id UUID REFERENCES mm_video_timelines(timeline_id),
    
    -- Script information
    module_name TEXT NOT NULL,
    script_type TEXT NOT NULL DEFAULT 'educational', -- 'educational', 'summary', 'overview'
    target_duration INTEGER, -- Target duration in seconds
    actual_duration FLOAT, -- Actual duration after generation
    
    -- Script content
    full_narration TEXT NOT NULL,
    learning_objectives JSONB DEFAULT '[]',
    key_takeaways JSONB DEFAULT '[]',
    
    -- Personalization
    employee_id UUID,
    employee_name TEXT,
    employee_role TEXT,
    personalization_level TEXT DEFAULT 'standard',
    
    -- Generation details
    word_count INTEGER,
    slide_count INTEGER,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    generation_model TEXT DEFAULT 'gpt-4',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create mm_video_analytics table for tracking video performance
CREATE TABLE IF NOT EXISTS mm_video_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timeline_id UUID REFERENCES mm_video_timelines(timeline_id),
    video_file_path TEXT NOT NULL,
    
    -- Engagement metrics
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    average_watch_time FLOAT DEFAULT 0,
    completion_rate FLOAT DEFAULT 0,
    
    -- Quality metrics
    video_quality_score FLOAT,
    audio_quality_score FLOAT,
    sync_quality_score FLOAT,
    overall_quality_score FLOAT,
    
    -- Feedback
    positive_feedback_count INTEGER DEFAULT 0,
    negative_feedback_count INTEGER DEFAULT 0,
    feedback_comments JSONB DEFAULT '[]',
    
    -- Performance data
    generation_time_ms INTEGER,
    processing_cost DECIMAL(10, 4),
    storage_size_mb FLOAT,
    
    -- Timestamps
    first_viewed_at TIMESTAMPTZ,
    last_viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_mm_video_timelines_session_id ON mm_video_timelines(session_id);
CREATE INDEX idx_mm_video_timelines_content_id ON mm_video_timelines(content_id);
CREATE INDEX idx_mm_video_timelines_generation_status ON mm_video_timelines(generation_status);
CREATE INDEX idx_mm_video_timelines_created_at ON mm_video_timelines(created_at DESC);

CREATE INDEX idx_mm_slide_notes_timeline_id ON mm_slide_notes(timeline_id);
CREATE INDEX idx_mm_slide_notes_content_id ON mm_slide_notes(content_id);
CREATE INDEX idx_mm_slide_notes_slide_number ON mm_slide_notes(slide_number);

CREATE INDEX idx_mm_educational_scripts_content_id ON mm_educational_scripts(content_id);
CREATE INDEX idx_mm_educational_scripts_timeline_id ON mm_educational_scripts(timeline_id);
CREATE INDEX idx_mm_educational_scripts_employee_id ON mm_educational_scripts(employee_id);

CREATE INDEX idx_mm_video_analytics_timeline_id ON mm_video_analytics(timeline_id);
CREATE INDEX idx_mm_video_analytics_total_views ON mm_video_analytics(total_views DESC);

-- Add triggers for updated_at
CREATE TRIGGER update_mm_video_timelines_updated_at
    BEFORE UPDATE ON mm_video_timelines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mm_slide_notes_updated_at
    BEFORE UPDATE ON mm_slide_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mm_educational_scripts_updated_at
    BEFORE UPDATE ON mm_educational_scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mm_video_analytics_updated_at
    BEFORE UPDATE ON mm_video_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE mm_video_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE mm_slide_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mm_educational_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mm_video_analytics ENABLE ROW LEVEL SECURITY;

-- Policies for mm_video_timelines
CREATE POLICY "Users can view their own video timelines"
    ON mm_video_timelines FOR SELECT
    USING (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM mm_multimedia_sessions s
        WHERE s.session_id = mm_video_timelines.session_id
        AND s.employee_id = auth.uid()::text
    ));

CREATE POLICY "Service role can manage all video timelines"
    ON mm_video_timelines FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies for mm_slide_notes
CREATE POLICY "Users can view slide notes for their content"
    ON mm_slide_notes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM mm_video_timelines t
        WHERE t.timeline_id = mm_slide_notes.timeline_id
        AND (t.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM mm_multimedia_sessions s
            WHERE s.session_id = t.session_id
            AND s.employee_id = auth.uid()::text
        ))
    ));

CREATE POLICY "Service role can manage all slide notes"
    ON mm_slide_notes FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies for mm_educational_scripts
CREATE POLICY "Users can view their own scripts"
    ON mm_educational_scripts FOR SELECT
    USING (employee_id = auth.uid() OR EXISTS (
        SELECT 1 FROM mm_video_timelines t
        WHERE t.timeline_id = mm_educational_scripts.timeline_id
        AND t.created_by = auth.uid()
    ));

CREATE POLICY "Service role can manage all scripts"
    ON mm_educational_scripts FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Policies for mm_video_analytics
CREATE POLICY "Users can view analytics for their videos"
    ON mm_video_analytics FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM mm_video_timelines t
        WHERE t.timeline_id = mm_video_analytics.timeline_id
        AND (t.created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM mm_multimedia_sessions s
            WHERE s.session_id = t.session_id
            AND s.employee_id = auth.uid()::text
        ))
    ));

CREATE POLICY "Service role can manage all analytics"
    ON mm_video_analytics FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE mm_video_timelines IS 'Stores video timeline data including audio segments and slide transitions for educational videos';
COMMENT ON TABLE mm_slide_notes IS 'Stores detailed slide content including speaker notes, timing, and visual elements';
COMMENT ON TABLE mm_educational_scripts IS 'Stores generated educational scripts with personalization and learning objectives';
COMMENT ON TABLE mm_video_analytics IS 'Tracks video performance metrics and viewer engagement';

COMMENT ON COLUMN mm_video_timelines.audio_segments IS 'JSON array of audio segments with timing and file information';
COMMENT ON COLUMN mm_video_timelines.slide_transitions IS 'JSON array of slide transition points with timestamps and effects';
COMMENT ON COLUMN mm_slide_notes.timing_cues IS 'JSON array of timing cues for animations and emphasis';
COMMENT ON COLUMN mm_educational_scripts.learning_objectives IS 'JSON array of learning objectives extracted from content';