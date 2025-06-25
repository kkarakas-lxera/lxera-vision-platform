// Storage-related TypeScript types

export type StorageBucket = 'employee-cvs' | 'import-files';

export interface FileUploadResult {
  success: boolean;
  filePath?: string;
  fileUrl?: string;
  error?: string;
}

export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
}

export interface FileUploadMetadata {
  id: string;
  bucket_name: StorageBucket;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  company_id: string;
  uploaded_by: string;
  entity_type: 'employee' | 'import_session';
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
  deleted_at?: string;
}

export interface StorageError {
  code: string;
  message: string;
  details?: any;
}

export interface BulkUploadProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  percentage: number;
}

export interface ImportFileData {
  employee_email: string;
  employee_name: string;
  current_position: string;
  target_position?: string;
  department?: string;
  cv_filename?: string;
}

export interface CVAnalysisResult {
  employee_id: string;
  extracted_skills: Array<{
    skill_id: string;
    skill_name: string;
    proficiency_level: number;
    years_experience?: number;
    evidence?: string;
  }>;
  work_experience: Array<{
    company: string;
    position: string;
    duration: string;
    responsibilities: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: string;
  }>;
  certifications: string[];
  summary: string;
}