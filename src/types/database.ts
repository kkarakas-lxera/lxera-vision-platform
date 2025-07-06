// Database type definitions to replace 'any' usage

import { SkillData, GapAnalysisData } from './common';

// Employee related types
export interface Employee {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  position?: string;
  current_position_id?: string;
  target_position_id?: string;
  department?: string;
  status?: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  cv_uploaded?: boolean;
  cv_analysis_completed?: boolean;
  skills_profile?: {
    skills: SkillData[];
    total_skills: number;
    last_updated?: string;
  };
}

export interface EmployeeImportSession {
  id: string;
  company_id: string;
  import_type: 'csv' | 'manual' | 'bulk';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at?: string;
  total_employees: number;
  employees_imported: number;
  employees_analyzed: number;
  position_id?: string;
  position_title?: string;
  metadata?: {
    file_name?: string;
    errors?: string[];
    warnings?: string[];
  };
}

// Course related types
export interface Course {
  id: string;
  title: string;
  description?: string;
  duration_hours?: number;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at?: string;
  is_published: boolean;
  metadata?: Record<string, unknown>;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  module_order: number;
  duration_minutes?: number;
  content?: string;
  objectives?: string[];
  created_at: string;
  updated_at?: string;
}

export interface ModuleContent {
  id: string;
  module_id: string;
  content_type: 'text' | 'video' | 'quiz' | 'assignment';
  title: string;
  content?: string;
  order_index: number;
  duration_minutes?: number;
  metadata?: Record<string, unknown>;
}

// Analytics types
export interface CourseAnalytics {
  course_id: string;
  total_enrollments: number;
  completion_rate: number;
  average_progress: number;
  average_score?: number;
  modules: Array<{
    module_id: string;
    title: string;
    completion_rate: number;
    average_time_spent: number;
    status: 'draft' | 'quality_check' | 'approved';
  }>;
}

export interface EmployeeProgress {
  id: string;
  employee_id: string;
  course_id: string;
  module_id?: string;
  progress_percentage: number;
  completed_at?: string;
  time_spent_minutes: number;
  last_accessed: string;
  quiz_scores?: Record<string, number>;
}

// Game/Gamification types
export interface GameMission {
  id: string;
  content_section_id?: string;
  module_content_id?: string;
  employee_id: string;
  company_id: string;
  mission_title: string;
  mission_description?: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  points_value: number;
  estimated_minutes: number;
  questions_count: number;
  skill_focus: string[];
  category: 'finance' | 'marketing' | 'hr' | 'production' | 'general';
  section_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface GameQuestion {
  id: string;
  mission_id: string;
  question_text: string;
  question_type: 'multiple_choice';
  options: string[];
  correct_answer: number;
  explanation?: string;
  skill_focus: string;
  source_content_snippet?: string;
  difficulty_score?: number;
  ai_generated: boolean;
}

export interface GameSession {
  id: string;
  employee_id: string;
  mission_id: string;
  questions_answered: number;
  correct_answers: number;
  points_earned: number;
  time_spent_seconds: number;
  accuracy_percentage: number;
  skill_improvements: Record<string, number>;
  session_status: 'active' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
}

export interface EmployeeGameProgress {
  employee_id: string;
  total_points: number;
  total_missions_completed: number;
  total_questions_answered: number;
  total_correct_answers: number;
  current_streak: number;
  longest_streak: number;
  current_level: number;
  skill_levels: Record<string, number>;
  puzzle_progress: Record<string, unknown>;
  achievements: string[];
  last_played_date?: string;
  created_at: string;
  updated_at: string;
}

// Company and position types
export interface Company {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  created_at: string;
  updated_at?: string;
  settings?: Record<string, unknown>;
}

export interface Position {
  id: string;
  company_id: string;
  position_code: string;
  position_title: string;
  position_level?: string;
  department?: string;
  description?: string;
  required_skills?: Array<{
    skill_id?: string;
    skill_name: string;
    required_level: number;
  }>;
  nice_to_have_skills?: Array<{
    skill_id?: string;
    skill_name: string;
    required_level: number;
  }>;
  is_template: boolean;
  created_at: string;
  updated_at?: string;
}

// User and authentication types
export interface UserProfile {
  id: string;
  email: string;
  role: 'super_admin' | 'company_admin' | 'learner';
  company_id?: string;
  employee_id?: string;
  created_at: string;
  updated_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Event and interaction types
export interface SwipeInteraction {
  task_id: string;
  direction: 'left' | 'right';
  category: string;
  timestamp: string;
}

export interface InterestScore {
  id: string;
  employee_id: string;
  category: 'finance' | 'marketing' | 'hr' | 'production' | 'general';
  interest_score: number;
  updated_at: string;
}

// Ticket/Support types
export interface Ticket {
  id: string;
  user_id: string;
  company_id?: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
  created_at: string;
}

// Skills management types
export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  parent_category_id?: string;
  created_at: string;
}

export interface EmployeeSkillAssessment {
  id: string;
  employee_id: string;
  skill_id: string;
  assessed_level: number;
  assessment_date: string;
  assessed_by?: string;
  assessment_type: 'self' | 'manager' | 'system' | 'cv_analysis';
  evidence?: string;
}

// Types for function parameters
export interface AnalyzeSkillsParams {
  employeeId: string;
  sessionId?: string;
  forceReanalysis?: boolean;
}

export interface GenerateCourseParams {
  companyId: string;
  positionId: string;
  skillGaps: GapAnalysisData[];
  employeeCount?: number;
}

export interface UpdateProgressParams {
  employeeId: string;
  courseId: string;
  moduleId: string;
  progress: number;
  timeSpent?: number;
}

// Error types
export interface DatabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

// Chart/Visualization data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface SkillDistribution {
  skill_name: string;
  employee_count: number;
  average_proficiency: number;
  proficiency_distribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
  };
}