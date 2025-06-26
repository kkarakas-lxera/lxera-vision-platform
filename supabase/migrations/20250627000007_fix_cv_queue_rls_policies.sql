-- Fix missing RLS policies for st_cv_processing_queue table
-- This migration adds the critical INSERT, UPDATE, and DELETE policies that are required
-- for the CV processing queue to function properly.

-- Add INSERT policy - allows companies to insert CV processing queue items for their own sessions
CREATE POLICY "Companies can insert queue items" ON st_cv_processing_queue
    FOR INSERT WITH CHECK (import_session_id IN (
        SELECT id FROM st_import_sessions WHERE company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    ));

-- Add UPDATE policy - allows companies to update processing status of their queue items
CREATE POLICY "Companies can update their queue items" ON st_cv_processing_queue
    FOR UPDATE USING (import_session_id IN (
        SELECT id FROM st_import_sessions WHERE company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    ));

-- Add DELETE policy - allows companies to clean up their completed queue items
CREATE POLICY "Companies can delete their queue items" ON st_cv_processing_queue
    FOR DELETE USING (import_session_id IN (
        SELECT id FROM st_import_sessions WHERE company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    ));

-- Grant execute permission on the queue processing function to authenticated users
-- This ensures the get_next_cv_for_processing function can be called
GRANT EXECUTE ON FUNCTION get_next_cv_for_processing(text) TO authenticated;

-- Add comment for documentation
COMMENT ON POLICY "Companies can insert queue items" ON st_cv_processing_queue IS 
    'Allows companies to queue CV processing jobs for their import sessions';
COMMENT ON POLICY "Companies can update their queue items" ON st_cv_processing_queue IS 
    'Allows updating queue item status during CV processing workflow';
COMMENT ON POLICY "Companies can delete their queue items" ON st_cv_processing_queue IS 
    'Allows cleanup of completed CV processing queue items';