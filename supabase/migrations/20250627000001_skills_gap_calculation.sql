-- Skills gap calculation function
CREATE OR REPLACE FUNCTION calculate_employee_skills_gap(
  p_employee_id UUID
)
RETURNS TABLE (
  skill_id UUID,
  skill_name TEXT,
  skill_type TEXT,
  required_level TEXT,
  current_level TEXT,
  gap_severity TEXT,
  is_mandatory BOOLEAN,
  match_percentage INTEGER
) AS $$
DECLARE
  v_position_id UUID;
  v_company_id UUID;
BEGIN
  -- Get employee's position and company
  SELECT 
    COALESCE(esp.target_position_id, e.current_position_id),
    e.company_id
  INTO v_position_id, v_company_id
  FROM employees e
  LEFT JOIN st_employee_skills_profile esp ON esp.employee_id = e.id
  WHERE e.id = p_employee_id;

  IF v_position_id IS NULL THEN
    RAISE EXCEPTION 'No position assigned to employee';
  END IF;

  -- Calculate gaps for required skills
  RETURN QUERY
  WITH employee_skills AS (
    SELECT 
      es.skill_id,
      es.skill_name,
      es.proficiency_level,
      es.years_experience
    FROM st_employee_skills_profile esp
    CROSS JOIN LATERAL jsonb_to_recordset(esp.extracted_skills) AS es(
      skill_id UUID,
      skill_name TEXT,
      proficiency_level INTEGER,
      years_experience NUMERIC
    )
    WHERE esp.employee_id = p_employee_id
  ),
  position_requirements AS (
    SELECT 
      jsonb_array_elements(cp.required_skills) AS skill_data,
      true AS is_mandatory
    FROM st_company_positions cp
    WHERE cp.id = v_position_id
  ),
  all_requirements AS (
    SELECT 
      (skill_data->>'skill_id')::UUID AS skill_id,
      skill_data->>'skill_name' AS skill_name,
      skill_data->>'skill_type' AS skill_type,
      skill_data->>'proficiency_level' AS required_level,
      is_mandatory
    FROM position_requirements
  )
  SELECT 
    ar.skill_id,
    ar.skill_name,
    ar.skill_type,
    ar.required_level,
    CASE 
      WHEN es.proficiency_level IS NULL THEN 'none'
      WHEN es.proficiency_level = 1 THEN 'basic'
      WHEN es.proficiency_level = 2 THEN 'intermediate'
      WHEN es.proficiency_level = 3 THEN 'advanced'
      WHEN es.proficiency_level = 4 THEN 'expert'
      ELSE 'basic'
    END AS current_level,
    CASE
      WHEN es.skill_id IS NULL THEN 'critical'
      WHEN 
        (CASE ar.required_level 
          WHEN 'basic' THEN 1 
          WHEN 'intermediate' THEN 2 
          WHEN 'advanced' THEN 3 
          WHEN 'expert' THEN 4 
          ELSE 2 
        END) - COALESCE(es.proficiency_level, 0) >= 2 
      THEN 'critical'
      WHEN 
        (CASE ar.required_level 
          WHEN 'basic' THEN 1 
          WHEN 'intermediate' THEN 2 
          WHEN 'advanced' THEN 3 
          WHEN 'expert' THEN 4 
          ELSE 2 
        END) - COALESCE(es.proficiency_level, 0) = 1 
      THEN 'important'
      WHEN 
        (CASE ar.required_level 
          WHEN 'basic' THEN 1 
          WHEN 'intermediate' THEN 2 
          WHEN 'advanced' THEN 3 
          WHEN 'expert' THEN 4 
          ELSE 2 
        END) <= COALESCE(es.proficiency_level, 0)
      THEN 'none'
      ELSE 'minor'
    END AS gap_severity,
    ar.is_mandatory,
    CASE 
      WHEN es.skill_id IS NULL THEN 0
      ELSE LEAST(100, 
        (COALESCE(es.proficiency_level, 0)::NUMERIC / 
         CASE ar.required_level 
           WHEN 'basic' THEN 1 
           WHEN 'intermediate' THEN 2 
           WHEN 'advanced' THEN 3 
           WHEN 'expert' THEN 4 
           ELSE 2 
         END * 100)::INTEGER
      )
    END AS match_percentage
  FROM all_requirements ar
  LEFT JOIN employee_skills es ON es.skill_id = ar.skill_id
  ORDER BY 
    ar.is_mandatory DESC,
    CASE 
      WHEN es.skill_id IS NULL THEN 0
      ELSE 1
    END,
    match_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to update employee skills match scores
CREATE OR REPLACE FUNCTION update_employee_skills_scores(
  p_employee_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_total_required INTEGER;
  v_met_required INTEGER;
  v_critical_gaps INTEGER;
  v_skills_match_score INTEGER;
  v_career_readiness_score INTEGER;
BEGIN
  -- Count required skills and matches
  SELECT 
    COUNT(*),
    COUNT(CASE WHEN match_percentage >= 100 THEN 1 END),
    COUNT(CASE WHEN gap_severity = 'critical' AND is_mandatory THEN 1 END)
  INTO v_total_required, v_met_required, v_critical_gaps
  FROM calculate_employee_skills_gap(p_employee_id)
  WHERE is_mandatory = true;

  -- Calculate scores
  v_skills_match_score := CASE 
    WHEN v_total_required > 0 
    THEN (v_met_required::NUMERIC / v_total_required * 100)::INTEGER
    ELSE 100
  END;

  v_career_readiness_score := GREATEST(0, 100 - (v_critical_gaps * 20));

  -- Update employee skills profile
  UPDATE st_employee_skills_profile
  SET 
    skills_match_score = v_skills_match_score,
    career_readiness_score = v_career_readiness_score,
    gap_analysis_completed_at = NOW(),
    updated_at = NOW()
  WHERE employee_id = p_employee_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate skills gap after CV analysis
CREATE OR REPLACE FUNCTION trigger_calculate_skills_gap()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate if we have extracted skills
  IF NEW.extracted_skills IS NOT NULL AND 
     jsonb_array_length(NEW.extracted_skills) > 0 THEN
    PERFORM update_employee_skills_scores(NEW.employee_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS calculate_skills_gap_after_cv_analysis ON st_employee_skills_profile;
CREATE TRIGGER calculate_skills_gap_after_cv_analysis
  AFTER INSERT OR UPDATE OF extracted_skills
  ON st_employee_skills_profile
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_skills_gap();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_skills_profile_scores 
  ON st_employee_skills_profile(skills_match_score, career_readiness_score);

CREATE INDEX IF NOT EXISTS idx_employee_skills_profile_gap_analysis 
  ON st_employee_skills_profile(gap_analysis_completed_at);

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_employee_skills_gap(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_employee_skills_scores(UUID) TO authenticated;