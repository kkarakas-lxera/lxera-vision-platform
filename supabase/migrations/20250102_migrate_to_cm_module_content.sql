-- Migration: Migrate gamification tables from cm_content_sections to cm_module_content
-- Date: 2025-01-02
-- Purpose: Consolidate content storage to use only cm_module_content table

-- =====================================================
-- 1. Update game_missions table
-- =====================================================

-- First, add new columns to track module content and section
ALTER TABLE game_missions 
ADD COLUMN IF NOT EXISTS module_content_id UUID REFERENCES cm_module_content(content_id),
ADD COLUMN IF NOT EXISTS section_name TEXT CHECK (section_name IN ('introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments'));

-- Update existing missions to reference cm_module_content
-- This assumes content_section_id was in format "content_id-section_name"
UPDATE game_missions gm
SET 
    module_content_id = cs.content_id,
    section_name = cs.section_name
FROM cm_content_sections cs
WHERE gm.content_section_id = cs.section_id;

-- For missions that don't have a match in cm_content_sections, 
-- try to parse the content_section_id if it's in "uuid-section" format
UPDATE game_missions
SET 
    module_content_id = CAST(SPLIT_PART(content_section_id::text, '-', 1) AS UUID),
    section_name = SPLIT_PART(content_section_id::text, '-', 2)
WHERE module_content_id IS NULL
  AND content_section_id IS NOT NULL
  AND content_section_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-\w+$';

-- =====================================================
-- 2. Update game_questions table (no direct reference, linked via missions)
-- =====================================================
-- No changes needed - questions are linked to missions

-- =====================================================
-- 3. Update game_sessions table
-- =====================================================

-- Add new columns
ALTER TABLE game_sessions
ADD COLUMN IF NOT EXISTS module_content_id UUID REFERENCES cm_module_content(content_id),
ADD COLUMN IF NOT EXISTS section_name TEXT CHECK (section_name IN ('introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments'));

-- Update from cm_content_sections
UPDATE game_sessions gs
SET 
    module_content_id = cs.content_id,
    section_name = cs.section_name
FROM cm_content_sections cs
WHERE gs.content_section_id = cs.section_id;

-- Update from parsed content_section_id
UPDATE game_sessions
SET 
    module_content_id = CAST(SPLIT_PART(content_section_id::text, '-', 1) AS UUID),
    section_name = SPLIT_PART(content_section_id::text, '-', 2)
WHERE module_content_id IS NULL
  AND content_section_id IS NOT NULL
  AND content_section_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-\w+$';

-- =====================================================
-- 4. Create indexes for performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_game_missions_module_content ON game_missions(module_content_id);
CREATE INDEX IF NOT EXISTS idx_game_missions_section ON game_missions(section_name);
CREATE INDEX IF NOT EXISTS idx_game_sessions_module_content ON game_sessions(module_content_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_section ON game_sessions(section_name);

-- =====================================================
-- 5. Add comments for clarity
-- =====================================================

COMMENT ON COLUMN game_missions.module_content_id IS 'Reference to the module content in cm_module_content';
COMMENT ON COLUMN game_missions.section_name IS 'Which section of the module this mission is for (introduction, core_content, etc.)';
COMMENT ON COLUMN game_sessions.module_content_id IS 'Reference to the module content in cm_module_content';
COMMENT ON COLUMN game_sessions.section_name IS 'Which section of the module this session is for';

-- =====================================================
-- 6. Note: We're keeping the old content_section_id columns for now
-- They can be dropped in a future migration after verifying everything works
-- =====================================================