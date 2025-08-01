// Enhanced Employee Onboarding Types

export interface EnhancedImportSession {
  id: string;
  company_id: string;
  import_type: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  created_by: string;
  csv_file_path?: string;
  error_log?: any[];
  // New enhanced fields
  session_metadata?: Record<string, any>;
  active_position_id?: string;
  analysis_config?: Record<string, any>;
  bulk_analysis_status?: string;
}

export interface EnhancedImportSessionItem {
  id: string;
  import_session_id: string;
  employee_email: string;
  employee_id?: string;
  employee_name?: string;
  current_position_code?: string;
  target_position_code?: string;
  cv_filename?: string;
  status?: string;
  error_message?: string;
  skills_profile_id?: string;
  created_at?: string;
  processed_at?: string;
  // New enhanced fields
  cv_analysis_result?: any;
  confidence_score?: number;
  position_match_analysis?: any;
  suggested_positions?: PositionSuggestion[];
  analysis_started_at?: string;
  analysis_completed_at?: string;
  analysis_tokens_used?: number;
  // Soft delete fields
  deleted_at?: string;
  deleted_by?: string;
}

export interface EnhancedSkillsProfile {
  id: string;
  employee_id: string;
  cv_file_path?: string;
  cv_summary?: string;
  extracted_skills?: ExtractedSkill[];
  current_position_id?: string;
  target_position_id?: string;
  skills_match_score?: number;
  career_readiness_score?: number;
  analyzed_at?: string;
  updated_at?: string;
  // New enhanced fields
  skills_analysis_version?: number;
  experience_years?: number;
  education_level?: string;
  certifications?: Certification[];
  industry_experience?: IndustryExperience[];
  soft_skills?: ExtractedSkill[];
  technical_skills?: ExtractedSkill[];
  languages?: Language[];
  projects_summary?: string;
  analysis_metadata?: Record<string, any>;
}

export interface ExtractedSkill {
  skill_id?: string;
  skill_name: string;
  category?: 'technical' | 'soft' | 'domain' | 'tool' | 'language';
  proficiency_level?: number;
  years_experience?: number;
  evidence?: string;
  context?: string;
  confidence?: number;
  source?: string;
  is_manual?: boolean;
  added_at?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  date?: string;
  id?: string;
  expires?: string;
  verification_url?: string;
}

export interface IndustryExperience {
  company: string;
  industry: string;
  years: number;
  role?: string;
}

export interface Language {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Advanced' | 'Intermediate' | 'Basic';
}

export interface AnalysisTemplate {
  id: string;
  company_id: string;
  template_name: string;
  template_type: 'cv_analysis' | 'position_mapping' | 'skills_extraction' | 'gap_analysis';
  prompt_template: string;
  system_prompt?: string;
  parameters?: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    [key: string]: any;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CVProcessingQueueItem {
  id: string;
  import_session_id: string;
  session_item_id: string;
  cv_file_path: string;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  retry_count: number;
  max_retries: number;
  error_details?: any;
  processor_id?: string;
  enqueued_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface PositionMappingSuggestion {
  id: string;
  company_id: string;
  source_text: string;
  suggested_position_id?: string;
  confidence_score: number;
  reasoning?: string;
  metadata?: Record<string, any>;
  created_at: string;
  last_used_at: string;
}

export interface PositionSuggestion {
  positionId: string;
  positionTitle: string;
  positionCode: string;
  matchScore: number;
  confidence: number;
  reasoning: string;
  strengthAreas: string[];
  gapAreas: string[];
}

export interface LLMUsageMetric {
  id: string;
  company_id: string;
  user_id?: string;
  service_type: string;
  model_used: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_estimate?: number;
  duration_ms?: number;
  success: boolean;
  error_code?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ImportSessionAnalytics {
  session_id: string;
  company_id: string;
  import_type: string;
  session_status: string;
  total_employees: number;
  successful: number;
  failed: number;
  created_at: string;
  completed_at?: string;
  active_position_id?: string;
  position_title?: string;
  position_code?: string;
  total_items: number;
  analyzed_cvs: number;
  avg_confidence_score?: number;
  total_tokens_used?: number;
  avg_analysis_time_seconds?: number;
}

// Utility types for API responses
export interface CVAnalysisResponse {
  success: boolean;
  message?: string;
  employee_id?: string;
  file_path?: string;
  skills_extracted?: number;
  match_score?: number;
  analysis_time_ms?: number;
  tokens_used?: number;
  cost_estimate?: number;
  error?: string;
  request_id?: string;
}

export interface QueueStatusResponse {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled?: number;
}

export interface BulkProcessingProgress {
  sessionId: string;
  totalQueued: number;
  processed: number;
  successful: number;
  failed: number;
  currentItem?: {
    itemId: string;
    employeeName?: string;
    status: string;
    progress: number;
  };
  estimatedTimeRemaining?: number;
}

// Undo Operations Types
export interface UndoOperation {
  id: string;
  company_id: string;
  user_id: string;
  operation_type: 'import' | 'delete' | 'update' | 'batch_delete';
  affected_count: number;
  operation_data: {
    session_id?: string;
    activated_employees?: Array<{
      employee_id: string;
      user_id: string;
      email: string;
      name: string;
    }>;
    items?: Array<{
      item_id: string;
      employee_name: string;
      employee_email: string;
      position_code?: string;
      field_values?: Record<string, any>;
    }>;
    item_ids?: string[];
  };
  session_id?: string;
  created_at: string;
  expires_at: string;
  undone_at?: string;
  undone_by?: string;
}

// Batch History Types
export interface BatchHistoryItem {
  session_id: string;
  company_id: string;
  created_at: string;
  created_by: string;
  total_employees: number;
  successful: number;
  failed: number;
  status: string;
  spreadsheet_mode?: boolean;
  active_position_id?: string;
  created_by_name?: string;
  created_by_email?: string;
  position_title?: string;
  position_code?: string;
  current_active_employees: number;
  deleted_items: number;
  batch_details?: {
    total_items: number;
    active_employees: Array<{
      id: string;
      name: string;
      email: string;
      position: string;
      is_active: boolean;
    }>;
    session_items: Array<{
      id: string;
      name: string;
      email: string;
      status: string;
      deleted_at?: string;
    }>;
  };
}