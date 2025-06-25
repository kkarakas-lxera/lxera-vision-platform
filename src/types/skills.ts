// Skills Taxonomy Types

export interface SkillTaxonomy {
  skill_id: string;
  skill_name: string;
  skill_type: 'category' | 'skill_group' | 'skill_cluster' | 'skill';
  parent_skill_id: string | null;
  hierarchy_level: number;
  esco_uri: string | null;
  description: string | null;
  aliases: string[] | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CompanyPosition {
  id: string;
  company_id: string;
  position_code: string;
  position_title: string;
  position_level: string | null;
  department: string | null;
  required_skills: SkillRequirement[];
  nice_to_have_skills: SkillRequirement[];
  is_template: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillRequirement {
  skill_id: string;
  skill_name: string;
  proficiency_level: number; // 1-5 scale
  is_mandatory: boolean;
}

export interface EmployeeSkillsProfile {
  id: string;
  employee_id: string;
  cv_file_path: string | null;
  cv_summary: string | null;
  extracted_skills: ExtractedSkill[];
  current_position_id: string | null;
  target_position_id: string | null;
  skills_match_score: number | null; // 0-100
  career_readiness_score: number | null; // 0-100
  analyzed_at: string;
  updated_at: string;
}

export interface ExtractedSkill {
  skill_id: string;
  skill_name: string;
  proficiency_level: number; // 1-5 scale
  years_experience: number | null;
  evidence: string | null; // Text from CV supporting this skill
}

export interface ImportSession {
  id: string;
  company_id: string;
  import_type: string;
  csv_file_path: string | null;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_log: ImportError[];
  created_by: string;
  created_at: string;
  completed_at: string | null;
}

export interface ImportError {
  row_number: number;
  employee_email: string;
  error_message: string;
  timestamp: string;
}

export interface ImportSessionItem {
  id: string;
  import_session_id: string;
  employee_email: string;
  employee_name: string | null;
  current_position_code: string | null;
  target_position_code: string | null;
  cv_filename: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  employee_id: string | null;
  skills_profile_id: string | null;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

// Skills Gap Analysis Types

export interface SkillGap {
  skill_id: string;
  skill_name: string;
  current_proficiency: number;
  required_proficiency: number;
  gap_size: number; // required - current
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimated_time_to_close: number; // in weeks
}

export interface PositionAnalysis {
  position: CompanyPosition;
  fit_score: number; // 0-100
  skill_gaps: SkillGap[];
  strengths: ExtractedSkill[]; // Skills where proficiency meets or exceeds requirements
  total_gap_score: number;
}

export interface EmployeeOnboardingData {
  email: string;
  full_name: string;
  department: string | null;
  current_position_code: string;
  target_position_code: string | null;
  cv_filename: string;
}

// API Response Types

export interface SkillSearchResult {
  skill_id: string;
  skill_name: string;
  skill_type: string;
  hierarchy_level: number;
  full_path: string; // e.g., "Technology > Programming > JavaScript"
  relevance: number;
}

export interface OnboardingProgress {
  session_id: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  percentage_complete: number;
  estimated_time_remaining: number; // seconds
  current_employee: string | null;
  current_step: 'uploading' | 'creating_accounts' | 'extracting_skills' | 'analyzing_gaps' | 'generating_courses' | 'completed';
}