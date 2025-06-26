-- Fix infinite recursion by using SECURITY DEFINER functions instead of complex RLS policies
-- This approach bypasses RLS for specific operations while maintaining security

-- Drop the policy that causes infinite recursion
DROP POLICY IF EXISTS "Users can see others in same company" ON users;

-- Create a SECURITY DEFINER function to check if a user exists by email
-- This function runs with the privileges of its creator, bypassing RLS
CREATE OR REPLACE FUNCTION check_user_exists_by_email(p_email text)
RETURNS TABLE (user_id uuid, user_exists boolean) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user exists and is in the same company as the caller
    RETURN QUERY
    SELECT 
        u.id as user_id,
        true as user_exists
    FROM users u
    WHERE u.email = p_email
    AND u.company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    LIMIT 1;
    
    -- If no user found, return NULL with false
    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::uuid, false::boolean;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a function for company admins to create users
CREATE OR REPLACE FUNCTION create_company_user(
    p_email text,
    p_password_hash text,
    p_full_name text,
    p_role text DEFAULT 'learner'
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_company_id uuid;
    v_user_role text;
BEGIN
    -- Get the calling user's company_id and role
    SELECT company_id, role INTO v_company_id, v_user_role
    FROM users
    WHERE id = auth.uid();
    
    -- Check if caller is a company admin
    IF v_user_role != 'company_admin' THEN
        RAISE EXCEPTION 'Only company admins can create users';
    END IF;
    
    -- Create the user
    INSERT INTO users (email, password_hash, full_name, role, company_id, is_active, email_verified)
    VALUES (p_email, p_password_hash, p_full_name, p_role, v_company_id, true, false)
    RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_user_exists_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_company_user(text, text, text, text) TO authenticated;

-- Note: The basic RLS policies from the emergency fix remain in place:
-- - "Users can see their own data"
-- - "Users can update their own data"
-- - "Super admins can see all users"
-- - "Company admins can create company users" (for direct INSERT)
-- - "Company admins can update company users"