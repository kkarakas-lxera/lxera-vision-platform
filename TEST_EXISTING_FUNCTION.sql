-- Check if the function exists and what it returns
SELECT * FROM get_user_auth_data(auth.uid());

-- Check the function definition
SELECT 
    proname as function_name,
    proargnames as parameter_names,
    prosrc as function_body
FROM pg_proc
WHERE proname = 'get_user_auth_data';

-- Test with a specific user ID (jane.admin@lxera.ai)
SELECT * FROM get_user_auth_data('67f6d9ff-7095-4080-ae36-8332e1d50271'::uuid);

-- Check if auth.uid() is working
SELECT 
    auth.uid() as current_auth_uid,
    u.id,
    u.role,
    u.company_id
FROM public.users u
WHERE u.id = auth.uid();

-- Test the exact storage policy logic
WITH auth_data AS (
    SELECT * FROM get_user_auth_data(auth.uid())
)
SELECT 
    'Auth UID' as check,
    auth.uid()::text as value
UNION ALL
SELECT 
    'User Role from function' as check,
    user_role as value
FROM auth_data
UNION ALL
SELECT 
    'Company ID from function' as check,
    user_company_id::text as value
FROM auth_data
UNION ALL
SELECT 
    'Test path' as check,
    '67d7bff4-1149-4f37-952e-af1841fb67fa/test.pdf' as value
UNION ALL
SELECT 
    'Path prefix matches' as check,
    (substring('67d7bff4-1149-4f37-952e-af1841fb67fa/test.pdf' FROM '^([^/]+)') = user_company_id::text)::text as value
FROM auth_data;