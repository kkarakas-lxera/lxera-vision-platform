-- Check all storage policies for employee-cvs bucket
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND (policyname LIKE '%CV%' OR policyname LIKE '%cv%' OR policyname LIKE '%employee%')
ORDER BY policyname;

-- Check if auth.uid() is working
SELECT auth.uid() as current_auth_uid;

-- Check current user's details
SELECT 
    id,
    email,
    role,
    company_id,
    full_name
FROM public.users
WHERE id = auth.uid();

-- Test the storage policy logic manually
WITH current_user_info AS (
    SELECT 
        id,
        role,
        company_id
    FROM public.users
    WHERE id = auth.uid()
)
SELECT 
    'Auth UID' as check_type,
    auth.uid()::text as value
UNION ALL
SELECT 
    'User Role' as check_type,
    role::text as value
FROM current_user_info
UNION ALL
SELECT 
    'Company ID' as check_type,
    company_id::text as value
FROM current_user_info
UNION ALL
SELECT 
    'Is Admin' as check_type,
    (role IN ('company_admin', 'super_admin'))::text as value
FROM current_user_info;

-- Check the exact policy conditions
-- This will show what the policy is checking for
SELECT 
    policyname,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname = 'Company admins can manage CVs 16feqwx_1';

-- Alternative: List ALL storage policies to find the exact one
SELECT 
    policyname,
    cmd,
    permissive,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
ORDER BY policyname;