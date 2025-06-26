-- Temporarily create a more permissive policy for debugging
-- This helps identify if the issue is with auth or policy logic

-- First, let's create a debug function that logs auth state
CREATE OR REPLACE FUNCTION debug_storage_auth(bucket_id text, file_path text)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  auth_uid uuid;
  user_data record;
BEGIN
  auth_uid := auth.uid();
  
  IF auth_uid IS NULL THEN
    RETURN json_build_object(
      'error', 'No auth.uid() found',
      'bucket_id', bucket_id,
      'file_path', file_path,
      'auth_uid', NULL
    );
  END IF;
  
  SELECT * INTO user_data 
  FROM public.users 
  WHERE id = auth_uid;
  
  RETURN json_build_object(
    'auth_uid', auth_uid,
    'user_role', user_data.role,
    'company_id', user_data.company_id,
    'bucket_id', bucket_id,
    'file_path', file_path,
    'path_matches_company', file_path LIKE user_data.company_id || '/%'
  );
END;
$$;

-- Create a temporary debug policy for CV uploads
-- This is more permissive but still requires authentication
CREATE POLICY "Debug CV Upload Policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employee-cvs' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('company_admin', 'super_admin')
  )
);

-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_storage_auth(text, text) TO authenticated;

-- Add a comment to track this is temporary
COMMENT ON POLICY "Debug CV Upload Policy" ON storage.objects IS 'Temporary debug policy - remove after fixing auth issue';