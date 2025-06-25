
-- First, let's see what policies currently exist for the employee-cvs bucket
SELECT policyname, cmd, with_check, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%CV%' OR policyname LIKE '%employee-cvs%'
ORDER BY policyname;

-- Drop all the old conflicting policies for employee-cvs bucket
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_0" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_1" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_2" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_3" ON storage.objects;

-- Also drop any other old CV-related policies that might exist
DROP POLICY IF EXISTS "Enable read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON storage.objects;

-- Clean up any old policies that might conflict
DROP POLICY IF EXISTS "Company admins can upload CVs old" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can read CVs old" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can update CVs old" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can delete CVs old" ON storage.objects;

-- Ensure we have the bucket created (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-cvs', 'employee-cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Create clean, consistent policies using the security definer function approach
-- These should be the ONLY policies for employee-cvs bucket

-- Policy for INSERT (uploading files)
CREATE POLICY "CV Upload - Company Admins Only"
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'employee-cvs' AND
    substring(name FROM '^([^/]+)') IN (
        SELECT auth_data.user_company_id::text
        FROM public.get_user_auth_data(auth.uid()) AS auth_data
        WHERE auth_data.user_role IN ('company_admin', 'super_admin')
    )
);

-- Policy for SELECT (reading files)
CREATE POLICY "CV Read - Company Admins Only"
ON storage.objects
FOR SELECT 
TO authenticated
USING (
    bucket_id = 'employee-cvs' AND
    substring(name FROM '^([^/]+)') IN (
        SELECT auth_data.user_company_id::text
        FROM public.get_user_auth_data(auth.uid()) AS auth_data
        WHERE auth_data.user_role IN ('company_admin', 'super_admin')
    )
);

-- Policy for UPDATE
CREATE POLICY "CV Update - Company Admins Only"
ON storage.objects
FOR UPDATE 
TO authenticated
USING (
    bucket_id = 'employee-cvs' AND
    substring(name FROM '^([^/]+)') IN (
        SELECT auth_data.user_company_id::text
        FROM public.get_user_auth_data(auth.uid()) AS auth_data
        WHERE auth_data.user_role IN ('company_admin', 'super_admin')
    )
);

-- Policy for DELETE
CREATE POLICY "CV Delete - Company Admins Only"
ON storage.objects
FOR DELETE 
TO authenticated
USING (
    bucket_id = 'employee-cvs' AND
    substring(name FROM '^([^/]+)') IN (
        SELECT auth_data.user_company_id::text
        FROM public.get_user_auth_data(auth.uid()) AS auth_data
        WHERE auth_data.user_role IN ('company_admin', 'super_admin')
    )
);

-- Verify the final policies
SELECT policyname, cmd, with_check IS NOT NULL as has_with_check, qual IS NOT NULL as has_using
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%CV%'
ORDER BY policyname, cmd;
