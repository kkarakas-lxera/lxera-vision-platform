export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'super_admin' | 'company_admin' | 'learner'
          company_id: string | null
          is_active: boolean
          email_verified: boolean
          position: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: 'super_admin' | 'company_admin' | 'learner'
          company_id?: string | null
          is_active?: boolean
          email_verified?: boolean
          position?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'super_admin' | 'company_admin' | 'learner'
          company_id?: string | null
          is_active?: boolean
          email_verified?: boolean
          position?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      employees: {
        Row: {
          id: string
          company_id: string
          user_id: string | null
          employee_id: string | null
          position: string | null
          department: string | null
          skill_level: string | null
          career_goal: string | null
          current_position_id: string | null
          target_position_id: string | null
          cv_file_path: string | null
          cv_extracted_data: Json | null
          skills_last_analyzed: string | null
          is_active: boolean | null
          hired_date: string | null
          last_activity: string | null
          courses_completed: number | null
          total_learning_hours: number | null
          learning_style: Json | null
          key_tools: string[] | null
          manager_id: string | null
          employee_role: string | null
          created_at: string | null
          updated_at: string | null
          learning_streak: number | null
          last_learning_date: string | null
        }
        Insert: {
          id?: string
          company_id: string
          user_id?: string | null
          employee_id?: string | null
          position?: string | null
          department?: string | null
          skill_level?: string | null
          career_goal?: string | null
          current_position_id?: string | null
          target_position_id?: string | null
          cv_file_path?: string | null
          cv_extracted_data?: Json | null
          skills_last_analyzed?: string | null
          is_active?: boolean | null
          hired_date?: string | null
          last_activity?: string | null
          courses_completed?: number | null
          total_learning_hours?: number | null
          learning_style?: Json | null
          key_tools?: string[] | null
          manager_id?: string | null
          employee_role?: string | null
          created_at?: string | null
          updated_at?: string | null
          learning_streak?: number | null
          last_learning_date?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          user_id?: string | null
          employee_id?: string | null
          position?: string | null
          department?: string | null
          skill_level?: string | null
          career_goal?: string | null
          current_position_id?: string | null
          target_position_id?: string | null
          cv_file_path?: string | null
          cv_extracted_data?: Json | null
          skills_last_analyzed?: string | null
          is_active?: boolean | null
          hired_date?: string | null
          last_activity?: string | null
          courses_completed?: number | null
          total_learning_hours?: number | null
          learning_style?: Json | null
          key_tools?: string[] | null
          manager_id?: string | null
          employee_role?: string | null
          created_at?: string | null
          updated_at?: string | null
          learning_streak?: number | null
          last_learning_date?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          domain: string
          logo_url: string | null
          plan_type: string | null
          max_employees: number | null
          max_courses: number | null
          is_active: boolean | null
          settings: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          domain: string
          logo_url?: string | null
          plan_type?: string | null
          max_employees?: number | null
          max_courses?: number | null
          is_active?: boolean | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          logo_url?: string | null
          plan_type?: string | null
          max_employees?: number | null
          max_courses?: number | null
          is_active?: boolean | null
          settings?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      course_assignments: {
        Row: {
          id: string
          employee_id: string
          course_id: string
          company_id: string
          assigned_by: string | null
          assigned_at: string | null
          started_at: string | null
          completed_at: string | null
          status: string | null
          progress_percentage: number | null
          current_section: string | null
          quiz_score: number | null
          completion_time_minutes: number | null
          feedback: Json | null
          priority: string | null
          due_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          course_id: string
          company_id: string
          assigned_by?: string | null
          assigned_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          status?: string | null
          progress_percentage?: number | null
          current_section?: string | null
          quiz_score?: number | null
          completion_time_minutes?: number | null
          feedback?: Json | null
          priority?: string | null
          due_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          course_id?: string
          company_id?: string
          assigned_by?: string | null
          assigned_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          status?: string | null
          progress_percentage?: number | null
          current_section?: string | null
          quiz_score?: number | null
          completion_time_minutes?: number | null
          feedback?: Json | null
          priority?: string | null
          due_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      cm_module_content: {
        Row: {
          content_id: string
          session_id: string
          company_id: string
          employee_name: string
          module_name: string
          module_spec: Json
          introduction: string | null
          core_content: string | null
          case_studies: string | null
          practical_applications: string | null
          assessments: string | null
          research_context: Json | null
          section_word_counts: Json | null
          total_word_count: number | null
          status: string | null
          priority_level: string | null
          created_by: string | null
          assigned_to: string | null
          revision_count: number | null
          last_quality_check: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          content_id?: string
          session_id: string
          company_id: string
          employee_name: string
          module_name: string
          module_spec: Json
          introduction?: string | null
          core_content?: string | null
          case_studies?: string | null
          practical_applications?: string | null
          assessments?: string | null
          research_context?: Json | null
          section_word_counts?: Json | null
          total_word_count?: number | null
          status?: string | null
          priority_level?: string | null
          created_by?: string | null
          assigned_to?: string | null
          revision_count?: number | null
          last_quality_check?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          session_id?: string
          company_id?: string
          employee_name?: string
          module_name?: string
          module_spec?: Json
          introduction?: string | null
          core_content?: string | null
          case_studies?: string | null
          practical_applications?: string | null
          assessments?: string | null
          research_context?: Json | null
          section_word_counts?: Json | null
          total_word_count?: number | null
          status?: string | null
          priority_level?: string | null
          created_by?: string | null
          assigned_to?: string | null
          revision_count?: number | null
          last_quality_check?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      course_section_progress: {
        Row: {
          id: string
          assignment_id: string
          section_name: string
          completed: boolean
          completed_at: string | null
          time_spent_seconds: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          assignment_id: string
          section_name: string
          completed?: boolean
          completed_at?: string | null
          time_spent_seconds?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          assignment_id?: string
          section_name?: string
          completed?: boolean
          completed_at?: string | null
          time_spent_seconds?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }
      video_progress: {
        Row: {
          id: string
          employee_id: string
          course_id: string
          video_url: string
          progress_seconds: number
          total_seconds: number | null
          completed: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          course_id: string
          video_url: string
          progress_seconds?: number
          total_seconds?: number | null
          completed?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          course_id?: string
          video_url?: string
          progress_seconds?: number
          total_seconds?: number | null
          completed?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      st_company_positions: {
        Row: {
          id: string
          company_id: string
          position_code: string
          position_title: string
          position_level: string | null
          department: string | null
          description: string | null
          required_skills: Json[]
          nice_to_have_skills: Json[]
          ai_suggestions: Json[] | null
          is_template: boolean
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id: string
          position_code: string
          position_title: string
          position_level?: string | null
          department?: string | null
          description?: string | null
          required_skills: Json[]
          nice_to_have_skills?: Json[]
          ai_suggestions?: Json[] | null
          is_template?: boolean
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          position_code?: string
          position_title?: string
          position_level?: string | null
          department?: string | null
          description?: string | null
          required_skills?: Json[]
          nice_to_have_skills?: Json[]
          ai_suggestions?: Json[] | null
          is_template?: boolean
          created_at?: string | null
          created_by?: string | null
        }
      }
    }
  }
}