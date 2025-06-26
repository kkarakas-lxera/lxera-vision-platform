-- Drop existing function if it exists (it has a different parameter name)
DROP FUNCTION IF EXISTS get_user_auth_data(uuid);

-- Create the get_user_auth_data function that the storage policy expects
-- Note: The parameter must be named 'user_uuid' to match the existing signature
CREATE OR REPLACE FUNCTION get_user_auth_data(user_uuid uuid)
RETURNS TABLE (user_role text, user_company_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Return the user's role and company_id from the users table
  RETURN QUERY
  SELECT 
    u.role::text as user_role,
    u.company_id as user_company_id
  FROM public.users u
  WHERE u.id = user_uuid
  LIMIT 1;
  
  -- If no user found, return empty result
  IF NOT FOUND THEN
    RETURN;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_auth_data(uuid) TO authenticated;

-- Add comment explaining the function
COMMENT ON FUNCTION get_user_auth_data(uuid) IS 'Returns user role and company_id for storage RLS policies';

-- Test the function (you can run this separately)
-- SELECT * FROM get_user_auth_data(auth.uid());