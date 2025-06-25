-- Create storage buckets for employee onboarding system
-- This migration sets up storage buckets for CVs and import files

-- Note: Storage buckets must be created via Supabase Dashboard or Management API
-- This file documents the required bucket configurations and RLS policies

-- Bucket 1: employee-cvs
-- Purpose: Store employee CV/resume files (PDF, DOCX)
-- Access: Private - only accessible to company admins and the employee
-- File size limit: 10MB
-- Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- Bucket 2: import-files  
-- Purpose: Store CSV import files for bulk employee onboarding
-- Access: Private - only accessible to company admins who created the import
-- File size limit: 50MB
-- Allowed MIME types: text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

-- Storage metadata table to track file uploads
CREATE TABLE IF NOT EXISTS st_file_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_name TEXT NOT NULL CHECK (bucket_name IN ('employee-cvs', 'import-files')),
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    entity_type TEXT CHECK (entity_type IN ('employee', 'import_session')),
    entity_id UUID, -- References either employee_id or import_session_id
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(bucket_name, file_path)
);

-- Indexes
CREATE INDEX idx_st_file_uploads_company ON st_file_uploads(company_id);
CREATE INDEX idx_st_file_uploads_entity ON st_file_uploads(entity_type, entity_id);
CREATE INDEX idx_st_file_uploads_deleted ON st_file_uploads(deleted_at) WHERE deleted_at IS NULL;

-- RLS Policies for file uploads table
ALTER TABLE st_file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "File uploads viewable by company members" ON st_file_uploads
    FOR SELECT
    TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "File uploads manageable by company admins" ON st_file_uploads
    FOR ALL
    TO authenticated
    USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid() AND role IN ('company_admin', 'super_admin')
        )
    );

-- Storage RLS Policies (to be applied via Supabase Dashboard)
-- These are documented here for reference

/*
-- Policy for employee-cvs bucket
-- Allow company admins to upload/read/delete CVs for their company
INSERT INTO storage.policies (bucket_id, name, definition, operation)
VALUES 
(
    'employee-cvs',
    'Company admins can manage CVs',
    $$
    (
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            JOIN public.users pu ON u.id = pu.id
            WHERE pu.role IN ('company_admin', 'super_admin')
            AND (
                -- Check if file path starts with user's company_id
                SUBSTRING(name FROM '^([^/]+)') = pu.company_id::text
                OR pu.role = 'super_admin'
            )
        )
    )
    $$,
    'ALL'
);

-- Allow employees to read their own CV
INSERT INTO storage.policies (bucket_id, name, definition, operation)
VALUES 
(
    'employee-cvs',
    'Employees can read own CV',
    $$
    (
        auth.uid() IN (
            SELECT e.user_id FROM public.employees e
            JOIN public.st_file_uploads f ON f.entity_id = e.id
            WHERE f.entity_type = 'employee'
            AND f.bucket_name = 'employee-cvs'
            AND f.file_path = name
        )
    )
    $$,
    'SELECT'
);

-- Policy for import-files bucket
-- Only allow company admins to manage import files for their company
INSERT INTO storage.policies (bucket_id, name, definition, operation)
VALUES 
(
    'import-files',
    'Company admins can manage import files',
    $$
    (
        auth.uid() IN (
            SELECT u.id FROM auth.users u
            JOIN public.users pu ON u.id = pu.id
            WHERE pu.role IN ('company_admin', 'super_admin')
            AND (
                -- Check if file path starts with user's company_id
                SUBSTRING(name FROM '^([^/]+)') = pu.company_id::text
                OR pu.role = 'super_admin'
            )
        )
    )
    $$,
    'ALL'
);
*/

-- Function to validate file upload
CREATE OR REPLACE FUNCTION validate_file_upload(
    p_bucket_name TEXT,
    p_file_name TEXT,
    p_file_size INTEGER,
    p_mime_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_max_size INTEGER;
    v_allowed_types TEXT[];
BEGIN
    -- Set limits based on bucket
    IF p_bucket_name = 'employee-cvs' THEN
        v_max_size := 10485760; -- 10MB in bytes
        v_allowed_types := ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    ELSIF p_bucket_name = 'import-files' THEN
        v_max_size := 52428800; -- 50MB in bytes
        v_allowed_types := ARRAY['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    ELSE
        RETURN FALSE;
    END IF;
    
    -- Check file size
    IF p_file_size > v_max_size THEN
        RAISE EXCEPTION 'File size exceeds maximum allowed size of % bytes', v_max_size;
    END IF;
    
    -- Check MIME type
    IF NOT (p_mime_type = ANY(v_allowed_types)) THEN
        RAISE EXCEPTION 'File type % is not allowed for bucket %', p_mime_type, p_bucket_name;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to generate storage path
CREATE OR REPLACE FUNCTION generate_storage_path(
    p_bucket_name TEXT,
    p_company_id UUID,
    p_entity_id UUID,
    p_file_name TEXT
) RETURNS TEXT AS $$
DECLARE
    v_safe_filename TEXT;
    v_timestamp TEXT;
BEGIN
    -- Sanitize filename
    v_safe_filename := regexp_replace(p_file_name, '[^a-zA-Z0-9._-]', '_', 'g');
    v_timestamp := to_char(NOW(), 'YYYYMMDD_HH24MISS');
    
    IF p_bucket_name = 'employee-cvs' THEN
        -- Format: {company_id}/cvs/{employee_id}/{timestamp}_{filename}
        RETURN format('%s/cvs/%s/%s_%s', p_company_id, p_entity_id, v_timestamp, v_safe_filename);
    ELSIF p_bucket_name = 'import-files' THEN
        -- Format: {company_id}/imports/{import_session_id}/{filename}
        RETURN format('%s/imports/%s/%s', p_company_id, p_entity_id, v_safe_filename);
    ELSE
        RAISE EXCEPTION 'Invalid bucket name: %', p_bucket_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old import files (called by scheduled job)
CREATE OR REPLACE FUNCTION cleanup_old_import_files() RETURNS void AS $$
DECLARE
    v_file RECORD;
    v_cutoff_date TIMESTAMPTZ;
BEGIN
    -- Delete import files older than 30 days
    v_cutoff_date := NOW() - INTERVAL '30 days';
    
    -- Mark files as deleted in our tracking table
    UPDATE st_file_uploads
    SET deleted_at = NOW()
    WHERE bucket_name = 'import-files'
    AND created_at < v_cutoff_date
    AND deleted_at IS NULL;
    
    -- Note: Actual file deletion from storage would be handled by a background job
    -- that reads the deleted_at timestamp and removes files via Supabase Storage API
END;
$$ LANGUAGE plpgsql;

-- Add file upload tracking triggers
CREATE OR REPLACE FUNCTION track_cv_upload() RETURNS TRIGGER AS $$
BEGIN
    -- Update employee record with CV path
    IF NEW.bucket_name = 'employee-cvs' AND NEW.entity_type = 'employee' THEN
        UPDATE employees 
        SET cv_file_path = NEW.file_path
        WHERE id = NEW.entity_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_cv_upload_trigger
    AFTER INSERT ON st_file_uploads
    FOR EACH ROW
    WHEN (NEW.bucket_name = 'employee-cvs')
    EXECUTE FUNCTION track_cv_upload();

-- Comments for developers
COMMENT ON TABLE st_file_uploads IS 'Tracks all file uploads to storage buckets for the employee onboarding system';
COMMENT ON COLUMN st_file_uploads.bucket_name IS 'Storage bucket name: employee-cvs or import-files';
COMMENT ON COLUMN st_file_uploads.file_path IS 'Full path in storage bucket including folder structure';
COMMENT ON COLUMN st_file_uploads.entity_type IS 'Type of entity this file belongs to: employee or import_session';
COMMENT ON COLUMN st_file_uploads.entity_id IS 'ID of the related entity (employee_id or import_session_id)';
COMMENT ON FUNCTION validate_file_upload IS 'Validates file uploads against bucket-specific rules for size and type';
COMMENT ON FUNCTION generate_storage_path IS 'Generates consistent storage paths with proper folder structure';
COMMENT ON FUNCTION cleanup_old_import_files IS 'Marks old import files for deletion - to be called by scheduled job';