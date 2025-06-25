-- Fix CV Upload Storage Policies
-- This script adds missing WITH CHECK policies for file uploads

-- First, check if the policies need WITH CHECK clauses
-- The current INSERT policies for CV uploads don't have WITH CHECK

-- Drop and recreate the CV upload INSERT policy with proper WITH CHECK
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_1" ON storage.objects;

CREATE POLICY "Company admins can upload CVs"
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'employee-cvs' AND
  auth.uid() IN (
    SELECT u.id
    FROM auth.users u
    JOIN public.users pu ON u.id = pu.id
    WHERE pu.role IN ('company_admin', 'super_admin')
    AND (
      -- File path must start with user's company_id
      substring(name FROM '^([^/]+)') = pu.company_id::text
      OR pu.role = 'super_admin'
    )
  )
);

-- Also fix the import files INSERT policy
DROP POLICY IF EXISTS "Company admins can manage import files ixky1b_1" ON storage.objects;

CREATE POLICY "Company admins can upload import files"
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'import-files' AND
  auth.uid() IN (
    SELECT u.id
    FROM auth.users u
    JOIN public.users pu ON u.id = pu.id
    WHERE pu.role IN ('company_admin', 'super_admin')
    AND (
      -- File path must start with user's company_id
      substring(name FROM '^([^/]+)') = pu.company_id::text
      OR pu.role = 'super_admin'
    )
  )
);

-- Add a helpful function to validate file paths before upload
CREATE OR REPLACE FUNCTION public.validate_cv_upload_path(
  file_path TEXT,
  user_company_id UUID,
  employee_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if path follows expected format: {company_id}/cvs/{employee_id}/{filename}
  IF file_path !~ ('^' || user_company_id::text || '/cvs/' || employee_id::text || '/[^/]+$') THEN
    RAISE EXCEPTION 'Invalid file path format. Expected: %/cvs/%/filename', user_company_id, employee_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON POLICY "Company admins can upload CVs" ON storage.objects IS 
  'Allows company admins to upload CV files to employee-cvs bucket with company_id prefix validation';

COMMENT ON POLICY "Company admins can upload import files" ON storage.objects IS 
  'Allows company admins to upload import files to import-files bucket with company_id prefix validation';

COMMENT ON FUNCTION public.validate_cv_upload_path IS 
  'Validates that CV file paths follow the required format: {company_id}/cvs/{employee_id}/{filename}';