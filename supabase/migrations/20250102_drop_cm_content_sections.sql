-- Migration: Drop cm_content_sections table
-- Date: 2025-01-02
-- Purpose: Complete migration to unified content storage in cm_module_content

-- =====================================================
-- 1. Drop foreign key constraints referencing cm_content_sections
-- =====================================================

-- Drop foreign key from game_missions if it still exists
ALTER TABLE game_missions 
DROP CONSTRAINT IF EXISTS game_missions_content_section_id_fkey;

-- Drop foreign key from game_sessions if it still exists
ALTER TABLE game_sessions
DROP CONSTRAINT IF EXISTS game_sessions_content_section_id_fkey;

-- Drop foreign key from content_feedback if it exists
ALTER TABLE content_feedback
DROP CONSTRAINT IF EXISTS content_feedback_content_section_id_fkey;

-- =====================================================
-- 2. Remove old content_section_id columns (optional - can keep for history)
-- =====================================================

-- Optionally drop the old columns after confirming everything works
-- For now, we'll keep them for reference but they won't be used

-- ALTER TABLE game_missions DROP COLUMN IF EXISTS content_section_id;
-- ALTER TABLE game_sessions DROP COLUMN IF EXISTS content_section_id;
-- ALTER TABLE content_feedback DROP COLUMN IF EXISTS content_section_id;

-- =====================================================
-- 3. Drop cm_content_sections table
-- =====================================================

DROP TABLE IF EXISTS cm_content_sections CASCADE;

-- =====================================================
-- 4. Update RLS policies that might reference cm_content_sections
-- =====================================================

-- No RLS policies directly reference cm_content_sections in joins,
-- so no policy updates needed

-- =====================================================
-- 5. Add helpful comments
-- =====================================================

COMMENT ON TABLE cm_module_content IS 'Unified content storage with version control, quality tracking, and section-level management. Replaces the deprecated cm_content_sections table.';

-- =====================================================
-- 6. Summary of changes
-- =====================================================

-- The cm_content_sections table has been removed.
-- All content is now stored in cm_module_content with enhanced features:
-- - Version control (version_number, parent_content_id, is_current_version)
-- - Section-level quality tracking (section_quality_scores, section_quality_issues)
-- - Section-level enhancement tracking (section_enhancement_count, section_status)
-- - Granular update timestamps (section_updated_at)
-- 
-- Use the provided functions for section management:
-- - update_module_section_with_version() - Update a section with optional versioning
-- - update_section_status() - Update the status of a section
-- - update_section_quality() - Update quality metrics for a section
--
-- Use the views for easier access:
-- - cm_module_content_current - Only current versions
-- - cm_module_content_versions - Version history