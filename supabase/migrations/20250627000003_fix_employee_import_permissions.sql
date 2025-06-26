-- Fix RLS policies for employee import functionality
-- This migration addresses permission errors during CSV import

-- 0. Add missing column that was referenced but not created in previous migrations
ALTER TABLE st_employee_skills_profile
ADD COLUMN IF NOT EXISTS gap_analysis_completed_at timestamptz;

-- 1. Fix users table policies to allow employee creation
-- Drop existing restrictive policies that might be blocking
DROP POLICY IF EXISTS "Users can see their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Create more permissive policies for authenticated users
CREATE POLICY "Authenticated users can read their own data" ON users
    FOR SELECT USING (
        id = auth.uid() OR
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Authenticated users can update their own data" ON users
    FOR UPDATE USING (id = auth.uid());

-- Allow authenticated users to create new users for their company
CREATE POLICY "Company users can create new users in their company" ON users
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- 2. Fix employees table to allow joins with users
DROP POLICY IF EXISTS "Learners can see their own employee record" ON employees;

-- Create more comprehensive policy for employees
CREATE POLICY "Authenticated users can read employees in their company" ON employees
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Authenticated users can insert employees in their company" ON employees
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Authenticated users can update employees in their company" ON employees
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- 3. Add missing policies for st_import_session_items
ALTER TABLE st_import_session_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage import session items for their company" ON st_import_session_items
    FOR ALL USING (
        import_session_id IN (
            SELECT id FROM st_import_sessions 
            WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
        )
    );

-- 4. Add missing policies for st_employee_skills_profile
ALTER TABLE st_employee_skills_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read skills profiles for their company employees" ON st_employee_skills_profile
    FOR SELECT USING (
        employee_id IN (
            SELECT id FROM employees 
            WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can manage skills profiles for their company employees" ON st_employee_skills_profile
    FOR ALL USING (
        employee_id IN (
            SELECT id FROM employees 
            WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
        )
    );

-- 5. Create the missing calculate_match_score RPC function for company-wide analysis
CREATE OR REPLACE FUNCTION calculate_match_score(
    p_company_id uuid
) RETURNS TABLE (
    position_code text,
    position_title text,
    total_employees bigint,
    avg_match_percentage numeric,
    employees_with_gaps bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.position_code,
        cp.position_title,
        COUNT(DISTINCT e.id) AS total_employees,
        COALESCE(AVG(esp.skills_match_score), 0) AS avg_match_percentage,
        COUNT(DISTINCT CASE WHEN esp.skills_match_score < 80 THEN e.id END) AS employees_with_gaps
    FROM st_company_positions cp
    JOIN employees e ON e.current_position_id = cp.id
    LEFT JOIN st_employee_skills_profile esp ON esp.employee_id = e.id
    WHERE cp.company_id = p_company_id
    GROUP BY cp.id, cp.position_code, cp.position_title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create the position match score function alias
CREATE OR REPLACE FUNCTION calculate_match_score(
    p_position_skills jsonb,
    p_employee_skills jsonb
) RETURNS decimal AS $$
BEGIN
    -- Call the existing function with parameters in correct order
    RETURN calculate_position_match_score(p_employee_skills, p_position_skills);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_match_score(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_match_score(jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_position_match_score TO authenticated;

-- 6. Ensure proper permissions on st_import_sessions
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their company import sessions" ON st_import_sessions;
DROP POLICY IF EXISTS "Users can create import sessions for their company" ON st_import_sessions;
DROP POLICY IF EXISTS "Users can update their company import sessions" ON st_import_sessions;

-- Create the policies
CREATE POLICY "Users can read their company import sessions" ON st_import_sessions
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can create import sessions for their company" ON st_import_sessions
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update their company import sessions" ON st_import_sessions
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

-- 7. Add helper function to safely check user permissions (in public schema)
CREATE OR REPLACE FUNCTION public.has_company_access(check_company_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND company_id = check_company_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create a more permissive view for employee data that handles the joins
CREATE OR REPLACE VIEW v_company_employees AS
SELECT 
    e.id,
    e.user_id,
    e.company_id,
    e.position,
    e.department,
    e.cv_file_path,
    e.skills_last_analyzed,
    e.is_active,
    u.full_name,
    u.email,
    esp.skills_match_score,
    esp.career_readiness_score,
    esp.gap_analysis_completed_at
FROM employees e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN st_employee_skills_profile esp ON esp.employee_id = e.id
WHERE e.company_id IN (SELECT company_id FROM users WHERE id = auth.uid());

-- Grant access to the view
GRANT SELECT ON v_company_employees TO authenticated;

-- Add comment documentation
COMMENT ON POLICY "Company users can create new users in their company" ON users IS 'Allows authenticated users to create new users for employee import';
COMMENT ON FUNCTION calculate_match_score IS 'Alias function for calculate_position_match_score to maintain backward compatibility';
COMMENT ON VIEW v_company_employees IS 'Simplified view for querying employee data with user information';