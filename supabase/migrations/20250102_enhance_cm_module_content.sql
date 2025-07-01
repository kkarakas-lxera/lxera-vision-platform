-- Migration: Enhance cm_module_content with advanced features
-- Date: 2025-01-02
-- Purpose: Add version control, quality tracking, and enhancement features to cm_module_content

-- =====================================================
-- 1. Add new columns for advanced features
-- =====================================================

-- Version control columns
ALTER TABLE cm_module_content
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_content_id UUID REFERENCES cm_module_content(content_id),
ADD COLUMN IF NOT EXISTS is_current_version BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS version_notes TEXT;

-- Section-level quality tracking (JSONB for flexibility)
ALTER TABLE cm_module_content
ADD COLUMN IF NOT EXISTS section_quality_scores JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS section_quality_issues JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS section_last_assessed JSONB DEFAULT '{}';

-- Section-level enhancement tracking
ALTER TABLE cm_module_content
ADD COLUMN IF NOT EXISTS section_enhancement_count JSONB DEFAULT '{
  "introduction": 0,
  "core_content": 0,
  "practical_applications": 0,
  "case_studies": 0,
  "assessments": 0
}',
ADD COLUMN IF NOT EXISTS section_status JSONB DEFAULT '{
  "introduction": "current",
  "core_content": "current",
  "practical_applications": "current",
  "case_studies": "current",
  "assessments": "current"
}';

-- Section-level timestamps for granular tracking
ALTER TABLE cm_module_content
ADD COLUMN IF NOT EXISTS section_updated_at JSONB DEFAULT '{}';

-- Enhancement session tracking
ALTER TABLE cm_module_content
ADD COLUMN IF NOT EXISTS last_enhancement_id UUID REFERENCES cm_enhancement_sessions(session_id),
ADD COLUMN IF NOT EXISTS enhancement_history JSONB DEFAULT '[]';

-- =====================================================
-- 2. Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cm_module_content_version ON cm_module_content(version_number);
CREATE INDEX IF NOT EXISTS idx_cm_module_content_parent ON cm_module_content(parent_content_id);
CREATE INDEX IF NOT EXISTS idx_cm_module_content_current ON cm_module_content(is_current_version) WHERE is_current_version = true;
CREATE INDEX IF NOT EXISTS idx_cm_module_content_section_status ON cm_module_content USING GIN(section_status);

-- =====================================================
-- 3. Add helper functions for section management
-- =====================================================

-- Function to update a single section with automatic versioning
CREATE OR REPLACE FUNCTION update_module_section_with_version(
    p_content_id UUID,
    p_section_name TEXT,
    p_section_content TEXT,
    p_create_version BOOLEAN DEFAULT false,
    p_version_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_new_content_id UUID;
    v_current_record RECORD;
BEGIN
    -- Get current record
    SELECT * INTO v_current_record 
    FROM cm_module_content 
    WHERE content_id = p_content_id AND is_current_version = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Content not found or not current version: %', p_content_id;
    END IF;
    
    IF p_create_version THEN
        -- Create new version
        v_new_content_id := gen_random_uuid();
        
        -- Insert new version with all content copied
        INSERT INTO cm_module_content (
            content_id, company_id, module_name, employee_name, session_id,
            introduction, core_content, practical_applications, case_studies, assessments,
            module_spec, research_context, total_word_count, section_word_counts,
            status, priority_level, revision_count, assigned_to, created_by,
            version_number, parent_content_id, is_current_version, version_notes,
            section_quality_scores, section_quality_issues, section_enhancement_count,
            section_status, section_updated_at
        )
        SELECT 
            v_new_content_id, company_id, module_name, employee_name, session_id,
            CASE WHEN p_section_name = 'introduction' THEN p_section_content ELSE introduction END,
            CASE WHEN p_section_name = 'core_content' THEN p_section_content ELSE core_content END,
            CASE WHEN p_section_name = 'practical_applications' THEN p_section_content ELSE practical_applications END,
            CASE WHEN p_section_name = 'case_studies' THEN p_section_content ELSE case_studies END,
            CASE WHEN p_section_name = 'assessments' THEN p_section_content ELSE assessments END,
            module_spec, research_context, total_word_count, section_word_counts,
            status, priority_level, revision_count + 1, assigned_to, created_by,
            version_number + 1, content_id, true, p_version_notes,
            section_quality_scores, section_quality_issues, 
            jsonb_set(section_enhancement_count, ARRAY[p_section_name], 
                (COALESCE((section_enhancement_count->>p_section_name)::int, 0) + 1)::text::jsonb),
            jsonb_set(section_status, ARRAY[p_section_name], '"enhanced"'::jsonb),
            jsonb_set(COALESCE(section_updated_at, '{}'::jsonb), ARRAY[p_section_name], to_jsonb(NOW()))
        FROM cm_module_content
        WHERE content_id = p_content_id;
        
        -- Mark old version as non-current
        UPDATE cm_module_content 
        SET is_current_version = false 
        WHERE content_id = p_content_id;
        
        -- Update word counts for new version
        UPDATE cm_module_content
        SET 
            section_word_counts = jsonb_set(
                section_word_counts, 
                ARRAY[p_section_name], 
                to_jsonb(array_length(string_to_array(p_section_content, ' '), 1))
            ),
            total_word_count = (
                SELECT SUM(word_count)::int
                FROM (
                    SELECT array_length(string_to_array(introduction, ' '), 1) as word_count
                    UNION ALL
                    SELECT array_length(string_to_array(core_content, ' '), 1)
                    UNION ALL
                    SELECT array_length(string_to_array(practical_applications, ' '), 1)
                    UNION ALL
                    SELECT array_length(string_to_array(case_studies, ' '), 1)
                    UNION ALL
                    SELECT array_length(string_to_array(assessments, ' '), 1)
                ) counts
            )
        WHERE content_id = v_new_content_id;
        
        RETURN v_new_content_id;
    ELSE
        -- Update in place without versioning
        UPDATE cm_module_content
        SET 
            introduction = CASE WHEN p_section_name = 'introduction' THEN p_section_content ELSE introduction END,
            core_content = CASE WHEN p_section_name = 'core_content' THEN p_section_content ELSE core_content END,
            practical_applications = CASE WHEN p_section_name = 'practical_applications' THEN p_section_content ELSE practical_applications END,
            case_studies = CASE WHEN p_section_name = 'case_studies' THEN p_section_content ELSE case_studies END,
            assessments = CASE WHEN p_section_name = 'assessments' THEN p_section_content ELSE assessments END,
            section_updated_at = jsonb_set(COALESCE(section_updated_at, '{}'::jsonb), ARRAY[p_section_name], to_jsonb(NOW())),
            section_enhancement_count = jsonb_set(section_enhancement_count, ARRAY[p_section_name], 
                (COALESCE((section_enhancement_count->>p_section_name)::int, 0) + 1)::text::jsonb),
            updated_at = NOW()
        WHERE content_id = p_content_id;
        
        RETURN p_content_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update section status
CREATE OR REPLACE FUNCTION update_section_status(
    p_content_id UUID,
    p_section_name TEXT,
    p_status TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    IF p_status NOT IN ('current', 'outdated', 'enhanced', 'archived') THEN
        RAISE EXCEPTION 'Invalid status: %. Must be one of: current, outdated, enhanced, archived', p_status;
    END IF;
    
    UPDATE cm_module_content
    SET 
        section_status = jsonb_set(section_status, ARRAY[p_section_name], to_jsonb(p_status)),
        updated_at = NOW()
    WHERE content_id = p_content_id AND is_current_version = true;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to update section quality
CREATE OR REPLACE FUNCTION update_section_quality(
    p_content_id UUID,
    p_section_name TEXT,
    p_quality_score DECIMAL(3,1),
    p_quality_issues TEXT[]
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE cm_module_content
    SET 
        section_quality_scores = jsonb_set(section_quality_scores, ARRAY[p_section_name], to_jsonb(p_quality_score)),
        section_quality_issues = jsonb_set(section_quality_issues, ARRAY[p_section_name], to_jsonb(p_quality_issues)),
        section_last_assessed = jsonb_set(COALESCE(section_last_assessed, '{}'::jsonb), ARRAY[p_section_name], to_jsonb(NOW())),
        updated_at = NOW()
    WHERE content_id = p_content_id AND is_current_version = true;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. Create views for easier access
-- =====================================================

-- View to get only current versions
CREATE OR REPLACE VIEW cm_module_content_current AS
SELECT * FROM cm_module_content WHERE is_current_version = true;

-- View to get version history
CREATE OR REPLACE VIEW cm_module_content_versions AS
SELECT 
    c.content_id,
    c.module_name,
    c.version_number,
    c.version_notes,
    c.created_at as version_created_at,
    c.created_by as version_created_by,
    p.content_id as parent_version_id,
    p.version_number as parent_version_number
FROM cm_module_content c
LEFT JOIN cm_module_content p ON c.parent_content_id = p.content_id
ORDER BY c.module_name, c.version_number DESC;

-- =====================================================
-- 5. Add comments for clarity
-- =====================================================

COMMENT ON COLUMN cm_module_content.version_number IS 'Version number of this content, starts at 1';
COMMENT ON COLUMN cm_module_content.parent_content_id IS 'Reference to the previous version of this content';
COMMENT ON COLUMN cm_module_content.is_current_version IS 'Whether this is the current active version';
COMMENT ON COLUMN cm_module_content.section_quality_scores IS 'JSON object with section names as keys and quality scores as values';
COMMENT ON COLUMN cm_module_content.section_quality_issues IS 'JSON object with section names as keys and arrays of issues as values';
COMMENT ON COLUMN cm_module_content.section_enhancement_count IS 'JSON object tracking how many times each section has been enhanced';
COMMENT ON COLUMN cm_module_content.section_status IS 'JSON object with section status (current, outdated, enhanced, archived)';
COMMENT ON COLUMN cm_module_content.section_updated_at IS 'JSON object tracking when each section was last updated';

-- =====================================================
-- 6. Migrate existing data
-- =====================================================

-- Ensure all existing records have the new default values
UPDATE cm_module_content
SET 
    version_number = COALESCE(version_number, 1),
    is_current_version = COALESCE(is_current_version, true),
    section_enhancement_count = COALESCE(section_enhancement_count, '{
        "introduction": 0,
        "core_content": 0,
        "practical_applications": 0,
        "case_studies": 0,
        "assessments": 0
    }'::jsonb),
    section_status = COALESCE(section_status, '{
        "introduction": "current",
        "core_content": "current",
        "practical_applications": "current",
        "case_studies": "current",
        "assessments": "current"
    }'::jsonb)
WHERE version_number IS NULL;