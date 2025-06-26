-- Create a function to check current auth.uid() for debugging
CREATE OR REPLACE FUNCTION check_auth_uid()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'auth_uid', auth.uid(),
    'current_user', current_user,
    'session_user', session_user,
    'has_auth', auth.uid() IS NOT NULL
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_auth_uid() TO authenticated;