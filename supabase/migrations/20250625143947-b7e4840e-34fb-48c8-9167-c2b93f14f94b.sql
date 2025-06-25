
-- Create security definer function to get user role and company safely
CREATE OR REPLACE FUNCTION public.get_user_auth_data(user_uuid uuid)
RETURNS TABLE(user_role text, user_company_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT u.role, u.company_id
    FROM public.users u
    WHERE u.id = user_uuid;
END;
$$;

-- Drop existing problematic policy
DROP POLICY IF EXISTS "Company admins can manage CVs 16feqwx_1" ON storage.objects;

-- Create new policy using the security definer function
CREATE POLICY "Company admins can upload CVs"
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

-- Also create SELECT policy for reading CVs
CREATE POLICY "Company admins can read CVs"
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

-- Create UPDATE policy for managing CVs
CREATE POLICY "Company admins can update CVs"
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

-- Create DELETE policy for removing CVs
CREATE POLICY "Company admins can delete CVs"
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

-- Also create the employee-cvs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-cvs', 'employee-cvs', false)
ON CONFLICT (id) DO NOTHING;
