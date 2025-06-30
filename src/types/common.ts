// Common type definitions to replace 'any' usage

export interface SkillData {
  skill_id?: string | null;
  skill_name: string;
  proficiency_level: number;
  years_experience?: number | null;
  evidence?: string;
  category?: string;
  context?: string;
  confidence?: number;
  source?: string;
}

export interface GapAnalysisData {
  skill_name: string;
  required_level: number;
  current_level: number;
  gap: number;
  gap_severity?: 'critical' | 'major' | 'moderate' | 'minor';
  skill_type?: string;
}

export interface CVAnalysisResult {
  summary: string;
  skills: SkillData[];
  overall_fit: string;
  total_experience_years?: number;
  education?: Array<{
    degree: string;
    institution: string;
    year?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
  }>;
  work_experience?: Array<{
    company: string;
    position: string;
    years?: number;
    description?: string;
  }>;
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
  }>;
}

export interface CourseContent {
  title: string;
  description?: string;
  content?: string;
  type?: string;
  duration?: number;
  topics?: string[];
  objectives?: string[];
}

export interface EmployeeData {
  id: string;
  name: string;
  email?: string;
  position?: string;
  department?: string;
  skills?: SkillData[];
  currentPosition?: string;
  targetPosition?: string;
  matchScore?: number;
  readinessScore?: number;
  skillsCount?: number;
  recentCourses?: number;
  completedCourses?: number;
}

export interface CompanyPosition {
  id: string;
  position_code: string;
  position_title: string;
  position_level?: string;
  department?: string;
  description?: string;
  required_skills: SkillData[];
  nice_to_have_skills?: SkillData[];
  ai_suggestions?: SkillData[];
  is_template?: boolean;
  created_at: string;
  employee_count?: number;
}

export interface SessionData {
  id: string;
  company_id: string;
  import_type: string;
  status: string;
  created_at: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
  total_employees?: number;
  employees_analyzed?: number;
  analysis_progress?: number;
}

export interface DemoRequest {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle?: string;
  phone?: string;
  companySize?: string;
  country?: string;
  message?: string;
  source?: string;
  status?: string;
  created_at?: string;
}