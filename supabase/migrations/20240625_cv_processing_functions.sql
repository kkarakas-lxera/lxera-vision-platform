-- CV Processing Support Functions
-- Functions to support CV analysis and skills matching

-- Function to calculate skills gap between employee and position
CREATE OR REPLACE FUNCTION calculate_skills_gap(
    p_employee_id UUID,
    p_position_id UUID
) RETURNS TABLE (
    skill_id UUID,
    skill_name TEXT,
    required_proficiency INTEGER,
    current_proficiency INTEGER,
    gap INTEGER,
    is_mandatory BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH employee_skills AS (
        SELECT 
            (skill->>'skill_id')::UUID as skill_id,
            skill->>'skill_name' as skill_name,
            COALESCE((skill->>'proficiency_level')::INTEGER, 0) as proficiency_level
        FROM st_employee_skills_profile esp,
        LATERAL jsonb_array_elements(esp.extracted_skills) skill
        WHERE esp.employee_id = p_employee_id
    ),
    position_requirements AS (
        SELECT 
            (req->>'skill_id')::UUID as skill_id,
            req->>'skill_name' as skill_name,
            COALESCE((req->>'proficiency_level')::INTEGER, 3) as required_level,
            COALESCE((req->>'is_mandatory')::BOOLEAN, false) as is_mandatory
        FROM st_company_positions cp,
        LATERAL jsonb_array_elements(cp.required_skills) req
        WHERE cp.id = p_position_id
    )
    SELECT 
        COALESCE(pr.skill_id, es.skill_id) as skill_id,
        COALESCE(pr.skill_name, es.skill_name) as skill_name,
        COALESCE(pr.required_level, 0) as required_proficiency,
        COALESCE(es.proficiency_level, 0) as current_proficiency,
        GREATEST(0, COALESCE(pr.required_level, 0) - COALESCE(es.proficiency_level, 0)) as gap,
        COALESCE(pr.is_mandatory, false) as is_mandatory
    FROM position_requirements pr
    FULL OUTER JOIN employee_skills es ON pr.skill_id = es.skill_id
    WHERE pr.skill_id IS NOT NULL  -- Only show required skills
    ORDER BY is_mandatory DESC, gap DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate overall match score
CREATE OR REPLACE FUNCTION calculate_match_score(
    p_employee_id UUID,
    p_position_id UUID
) RETURNS TABLE (
    overall_score DECIMAL(5,2),
    mandatory_skills_met INTEGER,
    mandatory_skills_total INTEGER,
    optional_skills_met INTEGER,
    optional_skills_total INTEGER
) AS $$
DECLARE
    v_mandatory_met INTEGER := 0;
    v_mandatory_total INTEGER := 0;
    v_optional_met INTEGER := 0;
    v_optional_total INTEGER := 0;
    v_overall_score DECIMAL(5,2) := 0;
BEGIN
    -- Calculate mandatory skills coverage
    SELECT 
        COUNT(*) FILTER (WHERE gap = 0),
        COUNT(*)
    INTO v_mandatory_met, v_mandatory_total
    FROM calculate_skills_gap(p_employee_id, p_position_id)
    WHERE is_mandatory = true;
    
    -- Calculate optional skills coverage
    SELECT 
        COUNT(*) FILTER (WHERE gap = 0),
        COUNT(*)
    INTO v_optional_met, v_optional_total
    FROM calculate_skills_gap(p_employee_id, p_position_id)
    WHERE is_mandatory = false;
    
    -- Calculate overall score (70% weight on mandatory, 30% on optional)
    IF v_mandatory_total > 0 OR v_optional_total > 0 THEN
        v_overall_score := (
            CASE 
                WHEN v_mandatory_total > 0 
                THEN (v_mandatory_met::DECIMAL / v_mandatory_total) * 70
                ELSE 0
            END +
            CASE 
                WHEN v_optional_total > 0 
                THEN (v_optional_met::DECIMAL / v_optional_total) * 30
                ELSE 0
            END
        );
    END IF;
    
    RETURN QUERY
    SELECT 
        v_overall_score,
        v_mandatory_met,
        v_mandatory_total,
        v_optional_met,
        v_optional_total;
END;
$$ LANGUAGE plpgsql;

-- Function to suggest learning paths based on skills gaps
CREATE OR REPLACE FUNCTION suggest_learning_paths(
    p_employee_id UUID,
    p_position_id UUID,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
    skill_id UUID,
    skill_name TEXT,
    skill_gap INTEGER,
    suggested_courses JSONB,
    estimated_duration_hours INTEGER,
    priority TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH skills_to_learn AS (
        SELECT * FROM calculate_skills_gap(p_employee_id, p_position_id)
        WHERE gap > 0
        ORDER BY is_mandatory DESC, gap DESC
        LIMIT p_limit
    )
    SELECT 
        stl.skill_id,
        stl.skill_name,
        stl.gap,
        -- In production, this would join with actual course catalog
        jsonb_build_array(
            jsonb_build_object(
                'course_name', 'Introduction to ' || stl.skill_name,
                'duration_hours', stl.gap * 10,
                'level', 'beginner'
            ),
            jsonb_build_object(
                'course_name', 'Advanced ' || stl.skill_name,
                'duration_hours', stl.gap * 15,
                'level', 'intermediate'
            )
        ) as suggested_courses,
        stl.gap * 25 as estimated_duration_hours,
        CASE 
            WHEN stl.is_mandatory THEN 'high'
            WHEN stl.gap >= 3 THEN 'medium'
            ELSE 'low'
        END as priority
    FROM skills_to_learn stl;
END;
$$ LANGUAGE plpgsql;

-- Function to track CV processing status
CREATE OR REPLACE FUNCTION update_cv_processing_status(
    p_employee_id UUID,
    p_status TEXT,
    p_message TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO cv_processing_log (
        employee_id,
        status,
        message,
        created_at
    ) VALUES (
        p_employee_id,
        p_status,
        p_message,
        NOW()
    );
    
    -- Update employee record with latest status
    UPDATE employees
    SET 
        cv_processing_status = p_status,
        cv_processing_message = p_message,
        cv_processing_updated_at = NOW()
    WHERE id = p_employee_id;
END;
$$ LANGUAGE plpgsql;

-- Create CV processing log table
CREATE TABLE IF NOT EXISTS cv_processing_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_cv_processing_log_employee ON cv_processing_log(employee_id);
CREATE INDEX idx_cv_processing_log_status ON cv_processing_log(status);
CREATE INDEX idx_cv_processing_log_created ON cv_processing_log(created_at DESC);

-- Add CV processing status columns to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS cv_processing_status TEXT DEFAULT 'pending' 
    CHECK (cv_processing_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS cv_processing_message TEXT,
ADD COLUMN IF NOT EXISTS cv_processing_updated_at TIMESTAMPTZ;

-- RLS for CV processing log
ALTER TABLE cv_processing_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CV processing log viewable by company admins" ON cv_processing_log
    FOR SELECT
    TO authenticated
    USING (
        employee_id IN (
            SELECT e.id FROM employees e
            JOIN users u ON u.id = auth.uid()
            WHERE (e.company_id = u.company_id AND u.role IN ('company_admin', 'super_admin'))
            OR u.role = 'super_admin'
        )
    );

-- Function to get employee skills summary
CREATE OR REPLACE FUNCTION get_employee_skills_summary(p_employee_id UUID)
RETURNS TABLE (
    total_skills INTEGER,
    technical_skills INTEGER,
    soft_skills INTEGER,
    average_proficiency DECIMAL(3,2),
    last_updated TIMESTAMPTZ,
    top_skills JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH skill_stats AS (
        SELECT 
            jsonb_array_elements(extracted_skills) as skill,
            analyzed_at
        FROM st_employee_skills_profile
        WHERE employee_id = p_employee_id
        ORDER BY analyzed_at DESC
        LIMIT 1
    ),
    skill_summary AS (
        SELECT 
            COUNT(*)::INTEGER as total_skills,
            COUNT(*) FILTER (WHERE skill->>'category' = 'technical')::INTEGER as technical_skills,
            COUNT(*) FILTER (WHERE skill->>'category' = 'soft')::INTEGER as soft_skills,
            AVG((skill->>'proficiency_level')::INTEGER)::DECIMAL(3,2) as average_proficiency,
            MAX(analyzed_at) as last_updated,
            jsonb_agg(
                skill 
                ORDER BY (skill->>'proficiency_level')::INTEGER DESC
                LIMIT 5
            ) as top_skills
        FROM skill_stats
    )
    SELECT * FROM skill_summary;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update employee skills summary after CV analysis
CREATE OR REPLACE FUNCTION update_employee_skills_summary() RETURNS TRIGGER AS $$
BEGIN
    -- Update match scores for current and target positions
    IF NEW.current_position_id IS NOT NULL THEN
        UPDATE st_employee_skills_profile
        SET skills_match_score = (
            SELECT overall_score 
            FROM calculate_match_score(NEW.employee_id, NEW.current_position_id)
        )
        WHERE id = NEW.id;
    END IF;
    
    IF NEW.target_position_id IS NOT NULL THEN
        UPDATE st_employee_skills_profile
        SET career_readiness_score = (
            SELECT overall_score 
            FROM calculate_match_score(NEW.employee_id, NEW.target_position_id)
        )
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_skills_scores
    AFTER INSERT OR UPDATE OF extracted_skills, current_position_id, target_position_id
    ON st_employee_skills_profile
    FOR EACH ROW
    EXECUTE FUNCTION update_employee_skills_summary();

-- Comments
COMMENT ON FUNCTION calculate_skills_gap IS 'Calculates the skills gap between an employee and a position';
COMMENT ON FUNCTION calculate_match_score IS 'Calculates how well an employee matches a position based on skills';
COMMENT ON FUNCTION suggest_learning_paths IS 'Suggests learning paths to close skills gaps';
COMMENT ON FUNCTION get_employee_skills_summary IS 'Gets a summary of employee skills from their profile';