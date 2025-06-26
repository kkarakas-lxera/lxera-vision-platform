-- Fix CV analysis issues and add company-wide skills gap function
-- This migration addresses critical issues preventing CV analysis workflow

-- 1. Create company-wide skills gap calculation function
-- This function aggregates skills gap analysis across all employees in a company
CREATE OR REPLACE FUNCTION calculate_skills_gap(
    p_company_id UUID
) RETURNS TABLE (
    position_code TEXT,
    position_title TEXT,
    employee_count INTEGER,
    avg_match_percentage DECIMAL(5,2),
    critical_gaps_count INTEGER,
    total_gaps_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH company_employees AS (
        SELECT 
            e.id as employee_id,
            e.current_position_id,
            cp.position_code,
            cp.position_title,
            esp.skills_match_score
        FROM employees e
        LEFT JOIN st_company_positions cp ON e.current_position_id = cp.id
        LEFT JOIN st_employee_skills_profile esp ON esp.employee_id = e.id
        WHERE e.company_id = p_company_id
        AND e.current_position_id IS NOT NULL
    ),
    position_stats AS (
        SELECT 
            ce.position_code,
            ce.position_title,
            COUNT(ce.employee_id) as employee_count,
            AVG(COALESCE(ce.skills_match_score, 0)) as avg_match_percentage,
            COUNT(CASE WHEN COALESCE(ce.skills_match_score, 0) < 50 THEN 1 END) as critical_gaps_count,
            COUNT(CASE WHEN COALESCE(ce.skills_match_score, 0) < 80 THEN 1 END) as total_gaps_count
        FROM company_employees ce
        GROUP BY ce.position_code, ce.position_title
    )
    SELECT 
        ps.position_code,
        ps.position_title,
        ps.employee_count::INTEGER,
        ROUND(ps.avg_match_percentage, 2) as avg_match_percentage,
        ps.critical_gaps_count::INTEGER,
        ps.total_gaps_count::INTEGER
    FROM position_stats ps
    ORDER BY ps.avg_match_percentage ASC, ps.critical_gaps_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION calculate_skills_gap(UUID) TO authenticated;

-- 2. The st_import_session_items table already exists with import_session_id column
-- Just ensure all required columns exist for our use case
ALTER TABLE st_import_session_items 
ADD COLUMN IF NOT EXISTS employee_name TEXT,
ADD COLUMN IF NOT EXISTS employee_email TEXT,
ADD COLUMN IF NOT EXISTS cv_file_path TEXT;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'st_import_session_items_session_employee_key'
    ) THEN
        ALTER TABLE st_import_session_items 
        ADD CONSTRAINT st_import_session_items_session_employee_key 
        UNIQUE(import_session_id, employee_id);
    END IF;
END $$;

-- 3. Create helper function to auto-create session items for direct analysis
CREATE OR REPLACE FUNCTION create_session_items_for_employees(
    p_session_id UUID,
    p_employee_ids UUID[]
) RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_employee_id UUID;
BEGIN
    -- Create session items for each employee
    FOREACH v_employee_id IN ARRAY p_employee_ids
    LOOP
        INSERT INTO st_import_session_items (
            import_session_id,
            employee_id,
            employee_name,
            employee_email,
            cv_file_path,
            status
        )
        SELECT 
            p_session_id,
            e.id,
            u.full_name,
            u.email,
            e.cv_file_path,
            'pending'
        FROM employees e
        LEFT JOIN users u ON e.user_id = u.id
        WHERE e.id = v_employee_id
        AND e.cv_file_path IS NOT NULL
        ON CONFLICT (import_session_id, employee_id) DO NOTHING;
        
        GET DIAGNOSTICS v_count = ROW_COUNT;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_session_items_for_employees(UUID, UUID[]) TO authenticated;

-- 4. Add indexes for better performance (using correct column names)
CREATE INDEX IF NOT EXISTS idx_session_items_import_session_employee ON st_import_session_items(import_session_id, employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_cv_file_path ON employees(cv_file_path) WHERE cv_file_path IS NOT NULL;

-- 5. Add helpful comments
COMMENT ON FUNCTION calculate_skills_gap(UUID) IS 'Calculate company-wide skills gap analysis by position';
COMMENT ON FUNCTION create_session_items_for_employees(UUID, UUID[]) IS 'Helper function to create session items for direct CV analysis';
COMMENT ON TABLE st_import_session_items IS 'Tracks individual employees within import sessions for CV analysis';