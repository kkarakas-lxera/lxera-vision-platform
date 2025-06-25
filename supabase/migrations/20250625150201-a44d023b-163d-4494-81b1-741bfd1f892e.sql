
-- STEP 1: Clean up ALL existing CV-related storage policies
-- First, let's see what policies currently exist
SELECT policyname, cmd, with_check IS NOT NULL as has_with_check, qual IS NOT NULL as has_using
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND (policyname ILIKE '%cv%' OR policyname ILIKE '%employee%')
ORDER BY policyname, cmd;

-- Drop ALL existing CV and employee-cvs related policies to start fresh
DROP POLICY IF EXISTS "CV Upload - Company Admins Only" ON storage.objects;
DROP POLICY IF EXISTS "CV Read - Company Admins Only" ON storage.objects;
DROP POLICY IF EXISTS "CV Update - Company Admins Only" ON storage.objects;
DROP POLICY IF EXISTS "CV Delete - Company Admins Only" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can upload CVs" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can read CVs" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can update CVs" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can delete CVs" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_0" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_1" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_2" ON storage.objects;
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_3" ON storage.objects;

-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-cvs', 'employee-cvs', false)
ON CONFLICT (id) DO NOTHING;

-- STEP 2: Create ONE clean set of policies using simplified logic
-- Policy for INSERT (uploading files) - SINGLE POLICY
CREATE POLICY "employee_cvs_insert_policy"
ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
    bucket_id = 'employee-cvs' AND
    EXISTS (
        SELECT 1 
        FROM public.get_user_auth_data(auth.uid()) AS auth_data
        WHERE auth_data.user_role IN ('company_admin', 'super_admin')
        AND (
            -- File path must start with user's company_id for company_admin
            (auth_data.user_role = 'company_admin' AND substring(name FROM '^([^/]+)') = auth_data.user_company_id::text)
            OR auth_data.user_role = 'super_admin'
        )
    )
);

-- Policy for SELECT (reading files) - SINGLE POLICY
CREATE POLICY "employee_cvs_select_policy"
ON storage.objects
FOR SELECT 
TO authenticated
USING (
    bucket_id = 'employee-cvs' AND
    EXISTS (
        SELECT 1 
        FROM public.get_user_auth_data(auth.uid()) AS auth_data
        WHERE auth_data.user_role IN ('company_admin', 'super_admin')
        AND (
            (auth_data.user_role = 'company_admin' AND substring(name FROM '^([^/]+)') = auth_data.user_company_id::text)
            OR auth_data.user_role = 'super_admin'
        )
    )
);

-- Policy for UPDATE - SINGLE POLICY
CREATE POLICY "employee_cvs_update_policy"
ON storage.objects
FOR UPDATE 
TO authenticated
USING (
    bucket_id = 'employee-cvs' AND
    EXISTS (
        SELECT 1 
        FROM public.get_user_auth_data(auth.uid()) AS auth_data
        WHERE auth_data.user_role IN ('company_admin', 'super_admin')
        AND (
            (auth_data.user_role = 'company_admin' AND substring(name FROM '^([^/]+)') = auth_data.user_company_id::text)
            OR auth_data.user_role = 'super_admin'
        )
    )
);

-- Policy for DELETE - SINGLE POLICY
CREATE POLICY "employee_cvs_delete_policy"
ON storage.objects
FOR DELETE 
TO authenticated
USING (
    bucket_id = 'employee-cvs' AND
    EXISTS (
        SELECT 1 
        FROM public.get_user_auth_data(auth.uid()) AS auth_data
        WHERE auth_data.user_role IN ('company_admin', 'super_admin')
        AND (
            (auth_data.user_role = 'company_admin' AND substring(name FROM '^([^/]+)') = auth_data.user_company_id::text)
            OR auth_data.user_role = 'super_admin'
        )
    )
);

-- STEP 3: Verify final state - should show exactly 4 policies
SELECT policyname, cmd, with_check IS NOT NULL as has_with_check, qual IS NOT NULL as has_using
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE 'employee_cvs_%'
ORDER BY policyname, cmd;

-- Test the get_user_auth_data function to ensure it works
SELECT 'Testing get_user_auth_data function - should return user role and company_id for authenticated users' as test_note;
