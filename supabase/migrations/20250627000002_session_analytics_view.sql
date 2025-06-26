-- Create a view for import session analytics
CREATE OR REPLACE VIEW v_import_session_analytics AS
SELECT 
  s.id AS session_id,
  s.company_id,
  s.import_type,
  s.total_employees,
  s.processed,
  s.successful,
  s.failed,
  s.status,
  s.created_at,
  s.created_by,
  s.active_position_id,
  p.position_title,
  p.position_code,
  s.session_metadata,
  s.analysis_config,
  s.bulk_analysis_status,
  -- Calculate success rate
  CASE 
    WHEN s.processed > 0 
    THEN ROUND((s.successful::NUMERIC / s.processed) * 100, 2)
    ELSE 0
  END AS success_rate,
  -- Count employees with completed analysis
  (
    SELECT COUNT(*)
    FROM st_import_session_items si
    JOIN st_employee_skills_profile esp ON esp.employee_id = si.employee_id
    WHERE si.session_id = s.id
    AND esp.gap_analysis_completed_at IS NOT NULL
  ) AS employees_with_gap_analysis,
  -- Average skills match score for session
  (
    SELECT ROUND(AVG(esp.skills_match_score), 2)
    FROM st_import_session_items si
    JOIN st_employee_skills_profile esp ON esp.employee_id = si.employee_id
    WHERE si.session_id = s.id
    AND esp.skills_match_score IS NOT NULL
  ) AS avg_skills_match_score,
  -- Average career readiness score
  (
    SELECT ROUND(AVG(esp.career_readiness_score), 2)
    FROM st_import_session_items si
    JOIN st_employee_skills_profile esp ON esp.employee_id = si.employee_id
    WHERE si.session_id = s.id
    AND esp.career_readiness_score IS NOT NULL
  ) AS avg_career_readiness_score,
  -- Total tokens used in session
  (
    SELECT SUM(si.analysis_tokens_used)
    FROM st_import_session_items si
    WHERE si.session_id = s.id
  ) AS total_tokens_used,
  -- Processing duration
  EXTRACT(EPOCH FROM (s.updated_at - s.created_at)) AS processing_duration_seconds
FROM st_import_sessions s
LEFT JOIN st_company_positions p ON p.id = s.active_position_id;

-- Grant access
GRANT SELECT ON v_import_session_analytics TO authenticated;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_import_session_items_session_analysis 
  ON st_import_session_items(session_id, employee_id);

-- Create a summary view for company-wide skills analytics
CREATE OR REPLACE VIEW v_company_skills_analytics AS
SELECT 
  c.id AS company_id,
  c.company_name,
  -- Total employees
  (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id AND e.is_active = true) AS total_employees,
  -- Employees with CVs
  (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id AND e.is_active = true AND e.cv_file_path IS NOT NULL) AS employees_with_cv,
  -- Employees with skills analysis
  (SELECT COUNT(DISTINCT esp.employee_id) 
   FROM st_employee_skills_profile esp 
   JOIN employees e ON e.id = esp.employee_id 
   WHERE e.company_id = c.id) AS employees_analyzed,
  -- Average skills match
  (SELECT ROUND(AVG(esp.skills_match_score), 2)
   FROM st_employee_skills_profile esp 
   JOIN employees e ON e.id = esp.employee_id 
   WHERE e.company_id = c.id) AS avg_skills_match,
  -- Top missing skills
  (SELECT jsonb_agg(
     jsonb_build_object(
       'skill_name', skill_data.skill_name,
       'employees_missing', skill_data.employees_missing,
       'severity', skill_data.avg_severity
     ) ORDER BY skill_data.employees_missing DESC
   )
   FROM (
     SELECT 
       g.skill_name,
       COUNT(DISTINCT g.employee_id) AS employees_missing,
       MODE() WITHIN GROUP (ORDER BY g.gap_severity) AS avg_severity
     FROM (
       SELECT * FROM calculate_employee_skills_gap(e.id)
       WHERE gap_severity != 'none'
     ) g
     JOIN employees e ON e.company_id = c.id
     GROUP BY g.skill_name
     LIMIT 10
   ) skill_data
  ) AS top_missing_skills,
  -- Total positions
  (SELECT COUNT(*) FROM st_company_positions cp WHERE cp.company_id = c.id) AS total_positions,
  -- Positions with employees
  (SELECT COUNT(DISTINCT e.current_position_id) 
   FROM employees e 
   WHERE e.company_id = c.id AND e.current_position_id IS NOT NULL) AS positions_with_employees
FROM companies c;

-- Grant access
GRANT SELECT ON v_company_skills_analytics TO authenticated;