export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cm_content_sections: {
        Row: {
          character_count: number | null
          company_id: string
          content_id: string
          created_at: string | null
          enhancement_count: number | null
          last_quality_score: number | null
          parent_section_id: string | null
          quality_issues: string[] | null
          section_content: string
          section_id: string
          section_metadata: Json | null
          section_name: string
          status: string | null
          updated_at: string | null
          version_number: number | null
          word_count: number | null
        }
        Insert: {
          character_count?: number | null
          company_id: string
          content_id: string
          created_at?: string | null
          enhancement_count?: number | null
          last_quality_score?: number | null
          parent_section_id?: string | null
          quality_issues?: string[] | null
          section_content: string
          section_id?: string
          section_metadata?: Json | null
          section_name: string
          status?: string | null
          updated_at?: string | null
          version_number?: number | null
          word_count?: number | null
        }
        Update: {
          character_count?: number | null
          company_id?: string
          content_id?: string
          created_at?: string | null
          enhancement_count?: number | null
          last_quality_score?: number | null
          parent_section_id?: string | null
          quality_issues?: string[] | null
          section_content?: string
          section_id?: string
          section_metadata?: Json | null
          section_name?: string
          status?: string | null
          updated_at?: string | null
          version_number?: number | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_content_sections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_content_sections_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "cm_content_sections_parent_section_id_fkey"
            columns: ["parent_section_id"]
            isOneToOne: false
            referencedRelation: "cm_content_sections"
            referencedColumns: ["section_id"]
          },
        ]
      }
      cm_enhancement_sessions: {
        Row: {
          company_id: string
          completed_at: string | null
          content_id: string
          content_regenerated: boolean | null
          content_tokens_used: number | null
          duration_seconds: number | null
          enhancement_tokens_used: number | null
          enhancement_type: string | null
          error_details: string | null
          initiated_by: string | null
          integration_completed: boolean | null
          quality_assessment_id: string | null
          quality_score_after: number | null
          quality_score_before: number | null
          research_conducted: boolean | null
          sections_preserved: string[] | null
          sections_to_enhance: string[]
          session_id: string
          started_at: string | null
          status: string | null
          success: boolean | null
          total_tokens_saved: number | null
          word_count_after: number | null
          word_count_before: number | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          content_id: string
          content_regenerated?: boolean | null
          content_tokens_used?: number | null
          duration_seconds?: number | null
          enhancement_tokens_used?: number | null
          enhancement_type?: string | null
          error_details?: string | null
          initiated_by?: string | null
          integration_completed?: boolean | null
          quality_assessment_id?: string | null
          quality_score_after?: number | null
          quality_score_before?: number | null
          research_conducted?: boolean | null
          sections_preserved?: string[] | null
          sections_to_enhance: string[]
          session_id?: string
          started_at?: string | null
          status?: string | null
          success?: boolean | null
          total_tokens_saved?: number | null
          word_count_after?: number | null
          word_count_before?: number | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          content_id?: string
          content_regenerated?: boolean | null
          content_tokens_used?: number | null
          duration_seconds?: number | null
          enhancement_tokens_used?: number | null
          enhancement_type?: string | null
          error_details?: string | null
          initiated_by?: string | null
          integration_completed?: boolean | null
          quality_assessment_id?: string | null
          quality_score_after?: number | null
          quality_score_before?: number | null
          research_conducted?: boolean | null
          sections_preserved?: string[] | null
          sections_to_enhance?: string[]
          session_id?: string
          started_at?: string | null
          status?: string | null
          success?: boolean | null
          total_tokens_saved?: number | null
          word_count_after?: number | null
          word_count_before?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_enhancement_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_enhancement_sessions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "cm_enhancement_sessions_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_enhancement_sessions_quality_assessment_id_fkey"
            columns: ["quality_assessment_id"]
            isOneToOne: false
            referencedRelation: "cm_quality_assessments"
            referencedColumns: ["assessment_id"]
          },
        ]
      }
      cm_module_content: {
        Row: {
          assessments: string | null
          assigned_to: string | null
          case_studies: string | null
          company_id: string
          content_id: string
          core_content: string | null
          created_at: string | null
          created_by: string | null
          employee_name: string
          introduction: string | null
          last_quality_check: string | null
          module_name: string
          module_spec: Json
          practical_applications: string | null
          priority_level: string | null
          research_context: Json | null
          revision_count: number | null
          section_word_counts: Json | null
          session_id: string
          status: string | null
          total_word_count: number | null
          updated_at: string | null
        }
        Insert: {
          assessments?: string | null
          assigned_to?: string | null
          case_studies?: string | null
          company_id: string
          content_id?: string
          core_content?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_name: string
          introduction?: string | null
          last_quality_check?: string | null
          module_name: string
          module_spec: Json
          practical_applications?: string | null
          priority_level?: string | null
          research_context?: Json | null
          revision_count?: number | null
          section_word_counts?: Json | null
          session_id: string
          status?: string | null
          total_word_count?: number | null
          updated_at?: string | null
        }
        Update: {
          assessments?: string | null
          assigned_to?: string | null
          case_studies?: string | null
          company_id?: string
          content_id?: string
          core_content?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_name?: string
          introduction?: string | null
          last_quality_check?: string | null
          module_name?: string
          module_spec?: Json
          practical_applications?: string | null
          priority_level?: string | null
          research_context?: Json | null
          revision_count?: number | null
          section_word_counts?: Json | null
          session_id?: string
          status?: string | null
          total_word_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_module_content_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_module_content_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_module_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cm_quality_assessments: {
        Row: {
          accuracy_score: number | null
          assessed_at: string | null
          assessed_by: string | null
          assessment_criteria: string | null
          assessment_duration_seconds: number | null
          assessment_id: string
          clarity_score: number | null
          company_id: string
          completeness_score: number | null
          content_id: string
          critical_issues: string[] | null
          engagement_score: number | null
          improvement_suggestions: string[] | null
          module_context: Json | null
          overall_score: number | null
          passed: boolean | null
          personalization_score: number | null
          quality_feedback: string | null
          requires_revision: boolean | null
          section_scores: Json | null
          sections_needing_work: string[] | null
          word_count_assessment: Json | null
        }
        Insert: {
          accuracy_score?: number | null
          assessed_at?: string | null
          assessed_by?: string | null
          assessment_criteria?: string | null
          assessment_duration_seconds?: number | null
          assessment_id?: string
          clarity_score?: number | null
          company_id: string
          completeness_score?: number | null
          content_id: string
          critical_issues?: string[] | null
          engagement_score?: number | null
          improvement_suggestions?: string[] | null
          module_context?: Json | null
          overall_score?: number | null
          passed?: boolean | null
          personalization_score?: number | null
          quality_feedback?: string | null
          requires_revision?: boolean | null
          section_scores?: Json | null
          sections_needing_work?: string[] | null
          word_count_assessment?: Json | null
        }
        Update: {
          accuracy_score?: number | null
          assessed_at?: string | null
          assessed_by?: string | null
          assessment_criteria?: string | null
          assessment_duration_seconds?: number | null
          assessment_id?: string
          clarity_score?: number | null
          company_id?: string
          completeness_score?: number | null
          content_id?: string
          critical_issues?: string[] | null
          engagement_score?: number | null
          improvement_suggestions?: string[] | null
          module_context?: Json | null
          overall_score?: number | null
          passed?: boolean | null
          personalization_score?: number | null
          quality_feedback?: string | null
          requires_revision?: boolean | null
          section_scores?: Json | null
          sections_needing_work?: string[] | null
          word_count_assessment?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_quality_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_quality_assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_quality_assessments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
        ]
      }
      cm_research_sessions: {
        Row: {
          company_id: string
          completed_at: string | null
          content_id: string
          current_examples: string[] | null
          enhancement_session_id: string | null
          error_details: string | null
          industry_trends: string[] | null
          key_insights: string[] | null
          research_duration_seconds: number | null
          research_id: string
          research_package: Json | null
          research_quality: number | null
          research_results: Json | null
          research_topics: string[]
          research_type: string | null
          started_at: string | null
          status: string | null
          success: boolean | null
          tavily_queries_made: number | null
          tokens_used: number | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          content_id: string
          current_examples?: string[] | null
          enhancement_session_id?: string | null
          error_details?: string | null
          industry_trends?: string[] | null
          key_insights?: string[] | null
          research_duration_seconds?: number | null
          research_id?: string
          research_package?: Json | null
          research_quality?: number | null
          research_results?: Json | null
          research_topics: string[]
          research_type?: string | null
          started_at?: string | null
          status?: string | null
          success?: boolean | null
          tavily_queries_made?: number | null
          tokens_used?: number | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          content_id?: string
          current_examples?: string[] | null
          enhancement_session_id?: string | null
          error_details?: string | null
          industry_trends?: string[] | null
          key_insights?: string[] | null
          research_duration_seconds?: number | null
          research_id?: string
          research_package?: Json | null
          research_quality?: number | null
          research_results?: Json | null
          research_topics?: string[]
          research_type?: string | null
          started_at?: string | null
          status?: string | null
          success?: boolean | null
          tavily_queries_made?: number | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_research_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cm_research_sessions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "cm_research_sessions_enhancement_session_id_fkey"
            columns: ["enhancement_session_id"]
            isOneToOne: false
            referencedRelation: "cm_enhancement_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_courses: number | null
          max_employees: number | null
          name: string
          plan_type: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_courses?: number | null
          max_employees?: number | null
          name: string
          plan_type?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_courses?: number | null
          max_employees?: number | null
          name?: string
          plan_type?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          company_id: string
          completed_at: string | null
          completion_time_minutes: number | null
          course_id: string
          created_at: string | null
          due_date: string | null
          employee_id: string
          feedback: Json | null
          id: string
          priority: string | null
          progress_percentage: number | null
          quiz_score: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          company_id: string
          completed_at?: string | null
          completion_time_minutes?: number | null
          course_id: string
          created_at?: string | null
          due_date?: string | null
          employee_id: string
          feedback?: Json | null
          id?: string
          priority?: string | null
          progress_percentage?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          company_id?: string
          completed_at?: string | null
          completion_time_minutes?: number | null
          course_id?: string
          created_at?: string | null
          due_date?: string | null
          employee_id?: string
          feedback?: Json | null
          id?: string
          priority?: string | null
          progress_percentage?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          career_goal: string | null
          company_id: string
          courses_completed: number | null
          created_at: string | null
          current_position_id: string | null
          cv_extracted_data: Json | null
          cv_file_path: string | null
          department: string | null
          employee_id: string | null
          employee_role: string | null
          hired_date: string | null
          id: string
          is_active: boolean | null
          key_tools: string[] | null
          last_activity: string | null
          learning_style: Json | null
          manager_id: string | null
          position: string | null
          skill_level: string | null
          skills_last_analyzed: string | null
          target_position_id: string | null
          total_learning_hours: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          career_goal?: string | null
          company_id: string
          courses_completed?: number | null
          created_at?: string | null
          current_position_id?: string | null
          cv_extracted_data?: Json | null
          cv_file_path?: string | null
          department?: string | null
          employee_id?: string | null
          employee_role?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          key_tools?: string[] | null
          last_activity?: string | null
          learning_style?: Json | null
          manager_id?: string | null
          position?: string | null
          skill_level?: string | null
          skills_last_analyzed?: string | null
          target_position_id?: string | null
          total_learning_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          career_goal?: string | null
          company_id?: string
          courses_completed?: number | null
          created_at?: string | null
          current_position_id?: string | null
          cv_extracted_data?: Json | null
          cv_file_path?: string | null
          department?: string | null
          employee_id?: string | null
          employee_role?: string | null
          hired_date?: string | null
          id?: string
          is_active?: boolean | null
          key_tools?: string[] | null
          last_activity?: string | null
          learning_style?: Json | null
          manager_id?: string | null
          position?: string | null
          skill_level?: string | null
          skills_last_analyzed?: string | null
          target_position_id?: string | null
          total_learning_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_current_position_id_fkey"
            columns: ["current_position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_target_position_id_fkey"
            columns: ["target_position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mm_audio_narrations: {
        Row: {
          audio_segments: Json | null
          company_id: string
          content_id: string
          created_at: string | null
          is_active: boolean | null
          master_audio_id: string | null
          narration_id: string
          narration_name: string
          narration_type: string | null
          script_content: string | null
          section_name: string | null
          segments_audio_ids: string[] | null
          segments_merged: boolean | null
          session_id: string
          status: string | null
          synthesis_completed: boolean | null
          total_duration_seconds: number | null
          updated_at: string | null
          voice_config: Json | null
        }
        Insert: {
          audio_segments?: Json | null
          company_id: string
          content_id: string
          created_at?: string | null
          is_active?: boolean | null
          master_audio_id?: string | null
          narration_id?: string
          narration_name: string
          narration_type?: string | null
          script_content?: string | null
          section_name?: string | null
          segments_audio_ids?: string[] | null
          segments_merged?: boolean | null
          session_id: string
          status?: string | null
          synthesis_completed?: boolean | null
          total_duration_seconds?: number | null
          updated_at?: string | null
          voice_config?: Json | null
        }
        Update: {
          audio_segments?: Json | null
          company_id?: string
          content_id?: string
          created_at?: string | null
          is_active?: boolean | null
          master_audio_id?: string | null
          narration_id?: string
          narration_name?: string
          narration_type?: string | null
          script_content?: string | null
          section_name?: string | null
          segments_audio_ids?: string[] | null
          segments_merged?: boolean | null
          session_id?: string
          status?: string | null
          synthesis_completed?: boolean | null
          total_duration_seconds?: number | null
          updated_at?: string | null
          voice_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mm_audio_narrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mm_audio_narrations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "mm_audio_narrations_master_audio_id_fkey"
            columns: ["master_audio_id"]
            isOneToOne: false
            referencedRelation: "mm_multimedia_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "mm_audio_narrations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mm_multimedia_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      mm_multimedia_assets: {
        Row: {
          asset_id: string
          asset_name: string
          asset_type: string
          company_id: string
          content_id: string
          created_at: string | null
          duration_seconds: number | null
          file_path: string
          file_size_bytes: number | null
          generation_config: Json | null
          generation_prompt: string | null
          is_active: boolean | null
          mime_type: string | null
          parent_asset_id: string | null
          processing_time_seconds: number | null
          public_url: string | null
          quality_metrics: Json | null
          section_name: string | null
          session_id: string
          slide_number: number | null
          status: string | null
          storage_bucket: string | null
          storage_path: string | null
          tokens_used: number | null
          updated_at: string | null
          version_number: number | null
        }
        Insert: {
          asset_id?: string
          asset_name: string
          asset_type: string
          company_id: string
          content_id: string
          created_at?: string | null
          duration_seconds?: number | null
          file_path: string
          file_size_bytes?: number | null
          generation_config?: Json | null
          generation_prompt?: string | null
          is_active?: boolean | null
          mime_type?: string | null
          parent_asset_id?: string | null
          processing_time_seconds?: number | null
          public_url?: string | null
          quality_metrics?: Json | null
          section_name?: string | null
          session_id: string
          slide_number?: number | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          version_number?: number | null
        }
        Update: {
          asset_id?: string
          asset_name?: string
          asset_type?: string
          company_id?: string
          content_id?: string
          created_at?: string | null
          duration_seconds?: number | null
          file_path?: string
          file_size_bytes?: number | null
          generation_config?: Json | null
          generation_prompt?: string | null
          is_active?: boolean | null
          mime_type?: string | null
          parent_asset_id?: string | null
          processing_time_seconds?: number | null
          public_url?: string | null
          quality_metrics?: Json | null
          section_name?: string | null
          session_id?: string
          slide_number?: number | null
          status?: string | null
          storage_bucket?: string | null
          storage_path?: string | null
          tokens_used?: number | null
          updated_at?: string | null
          version_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mm_multimedia_assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mm_multimedia_assets_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "mm_multimedia_assets_parent_asset_id_fkey"
            columns: ["parent_asset_id"]
            isOneToOne: false
            referencedRelation: "mm_multimedia_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "mm_multimedia_assets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mm_multimedia_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      mm_multimedia_sessions: {
        Row: {
          audio_files_generated: number | null
          company_id: string
          completed_at: string | null
          content_id: string
          content_sections: string[]
          current_stage: string | null
          employee_name: string
          error_details: string | null
          generation_config: Json | null
          initiated_by: string | null
          module_name: string
          processing_duration_seconds: number | null
          progress_percentage: number | null
          retry_count: number | null
          session_id: string
          session_type: string | null
          slides_generated: number | null
          started_at: string | null
          status: string | null
          tokens_used: number | null
          total_assets_generated: number | null
          video_files_generated: number | null
        }
        Insert: {
          audio_files_generated?: number | null
          company_id: string
          completed_at?: string | null
          content_id: string
          content_sections: string[]
          current_stage?: string | null
          employee_name: string
          error_details?: string | null
          generation_config?: Json | null
          initiated_by?: string | null
          module_name: string
          processing_duration_seconds?: number | null
          progress_percentage?: number | null
          retry_count?: number | null
          session_id?: string
          session_type?: string | null
          slides_generated?: number | null
          started_at?: string | null
          status?: string | null
          tokens_used?: number | null
          total_assets_generated?: number | null
          video_files_generated?: number | null
        }
        Update: {
          audio_files_generated?: number | null
          company_id?: string
          completed_at?: string | null
          content_id?: string
          content_sections?: string[]
          current_stage?: string | null
          employee_name?: string
          error_details?: string | null
          generation_config?: Json | null
          initiated_by?: string | null
          module_name?: string
          processing_duration_seconds?: number | null
          progress_percentage?: number | null
          retry_count?: number | null
          session_id?: string
          session_type?: string | null
          slides_generated?: number | null
          started_at?: string | null
          status?: string | null
          tokens_used?: number | null
          total_assets_generated?: number | null
          video_files_generated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mm_multimedia_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mm_multimedia_sessions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "mm_multimedia_sessions_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      mm_slide_presentations: {
        Row: {
          company_id: string
          content_id: string
          created_at: string | null
          html_asset_id: string | null
          html_generated: boolean | null
          is_active: boolean | null
          pdf_asset_id: string | null
          pdf_generated: boolean | null
          pptx_asset_id: string | null
          pptx_generated: boolean | null
          presentation_id: string
          presentation_name: string
          presentation_type: string | null
          session_id: string
          slide_order: Json | null
          status: string | null
          template_used: string | null
          theme_config: Json | null
          total_slides: number | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          content_id: string
          created_at?: string | null
          html_asset_id?: string | null
          html_generated?: boolean | null
          is_active?: boolean | null
          pdf_asset_id?: string | null
          pdf_generated?: boolean | null
          pptx_asset_id?: string | null
          pptx_generated?: boolean | null
          presentation_id?: string
          presentation_name: string
          presentation_type?: string | null
          session_id: string
          slide_order?: Json | null
          status?: string | null
          template_used?: string | null
          theme_config?: Json | null
          total_slides?: number | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          content_id?: string
          created_at?: string | null
          html_asset_id?: string | null
          html_generated?: boolean | null
          is_active?: boolean | null
          pdf_asset_id?: string | null
          pdf_generated?: boolean | null
          pptx_asset_id?: string | null
          pptx_generated?: boolean | null
          presentation_id?: string
          presentation_name?: string
          presentation_type?: string | null
          session_id?: string
          slide_order?: Json | null
          status?: string | null
          template_used?: string | null
          theme_config?: Json | null
          total_slides?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mm_slide_presentations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mm_slide_presentations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "mm_slide_presentations_html_asset_id_fkey"
            columns: ["html_asset_id"]
            isOneToOne: false
            referencedRelation: "mm_multimedia_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "mm_slide_presentations_pdf_asset_id_fkey"
            columns: ["pdf_asset_id"]
            isOneToOne: false
            referencedRelation: "mm_multimedia_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "mm_slide_presentations_pptx_asset_id_fkey"
            columns: ["pptx_asset_id"]
            isOneToOne: false
            referencedRelation: "mm_multimedia_assets"
            referencedColumns: ["asset_id"]
          },
          {
            foreignKeyName: "mm_slide_presentations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "mm_multimedia_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      st_company_positions: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          department: string | null
          description: string | null
          id: string
          is_template: boolean | null
          nice_to_have_skills: Json[] | null
          position_code: string
          position_level: string | null
          position_title: string
          required_skills: Json[] | null
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          nice_to_have_skills?: Json[] | null
          position_code: string
          position_level?: string | null
          position_title: string
          required_skills?: Json[] | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          description?: string | null
          id?: string
          is_template?: boolean | null
          nice_to_have_skills?: Json[] | null
          position_code?: string
          position_level?: string | null
          position_title?: string
          required_skills?: Json[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_company_positions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_company_positions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      st_employee_skills_profile: {
        Row: {
          analyzed_at: string | null
          career_readiness_score: number | null
          current_position_id: string | null
          cv_file_path: string | null
          cv_summary: string | null
          employee_id: string
          extracted_skills: Json[] | null
          id: string
          skills_match_score: number | null
          target_position_id: string | null
          updated_at: string | null
        }
        Insert: {
          analyzed_at?: string | null
          career_readiness_score?: number | null
          current_position_id?: string | null
          cv_file_path?: string | null
          cv_summary?: string | null
          employee_id: string
          extracted_skills?: Json[] | null
          id?: string
          skills_match_score?: number | null
          target_position_id?: string | null
          updated_at?: string | null
        }
        Update: {
          analyzed_at?: string | null
          career_readiness_score?: number | null
          current_position_id?: string | null
          cv_file_path?: string | null
          cv_summary?: string | null
          employee_id?: string
          extracted_skills?: Json[] | null
          id?: string
          skills_match_score?: number | null
          target_position_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_employee_skills_profile_current_position_id_fkey"
            columns: ["current_position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_employee_skills_profile_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_employee_skills_profile_target_position_id_fkey"
            columns: ["target_position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      st_file_uploads: {
        Row: {
          bucket_name: string
          company_id: string
          created_at: string | null
          deleted_at: string | null
          entity_id: string | null
          entity_type: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          metadata: Json | null
          mime_type: string
          uploaded_by: string
        }
        Insert: {
          bucket_name: string
          company_id: string
          created_at?: string | null
          deleted_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          metadata?: Json | null
          mime_type: string
          uploaded_by: string
        }
        Update: {
          bucket_name?: string
          company_id?: string
          created_at?: string | null
          deleted_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          metadata?: Json | null
          mime_type?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "st_file_uploads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_file_uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      st_import_session_items: {
        Row: {
          created_at: string | null
          current_position_code: string | null
          cv_filename: string | null
          employee_email: string
          employee_id: string | null
          employee_name: string | null
          error_message: string | null
          id: string
          import_session_id: string
          processed_at: string | null
          skills_profile_id: string | null
          status: string | null
          target_position_code: string | null
        }
        Insert: {
          created_at?: string | null
          current_position_code?: string | null
          cv_filename?: string | null
          employee_email: string
          employee_id?: string | null
          employee_name?: string | null
          error_message?: string | null
          id?: string
          import_session_id: string
          processed_at?: string | null
          skills_profile_id?: string | null
          status?: string | null
          target_position_code?: string | null
        }
        Update: {
          created_at?: string | null
          current_position_code?: string | null
          cv_filename?: string | null
          employee_email?: string
          employee_id?: string | null
          employee_name?: string | null
          error_message?: string | null
          id?: string
          import_session_id?: string
          processed_at?: string | null
          skills_profile_id?: string | null
          status?: string | null
          target_position_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_import_session_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_import_session_items_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "st_import_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_import_session_items_skills_profile_id_fkey"
            columns: ["skills_profile_id"]
            isOneToOne: false
            referencedRelation: "st_employee_skills_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      st_import_sessions: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          created_by: string
          csv_file_path: string | null
          error_log: Json[] | null
          failed: number | null
          id: string
          import_type: string | null
          processed: number | null
          status: string | null
          successful: number | null
          total_employees: number
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          csv_file_path?: string | null
          error_log?: Json[] | null
          failed?: number | null
          id?: string
          import_type?: string | null
          processed?: number | null
          status?: string | null
          successful?: number | null
          total_employees?: number
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          csv_file_path?: string | null
          error_log?: Json[] | null
          failed?: number | null
          id?: string
          import_type?: string | null
          processed?: number | null
          status?: string | null
          successful?: number | null
          total_employees?: number
        }
        Relationships: [
          {
            foreignKeyName: "st_import_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_import_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      st_skills_taxonomy: {
        Row: {
          aliases: string[] | null
          created_at: string | null
          description: string | null
          esco_uri: string | null
          hierarchy_level: number
          metadata: Json | null
          parent_skill_id: string | null
          skill_id: string
          skill_name: string
          skill_type: string | null
          updated_at: string | null
        }
        Insert: {
          aliases?: string[] | null
          created_at?: string | null
          description?: string | null
          esco_uri?: string | null
          hierarchy_level?: number
          metadata?: Json | null
          parent_skill_id?: string | null
          skill_id?: string
          skill_name: string
          skill_type?: string | null
          updated_at?: string | null
        }
        Update: {
          aliases?: string[] | null
          created_at?: string | null
          description?: string | null
          esco_uri?: string | null
          hierarchy_level?: number
          metadata?: Json | null
          parent_skill_id?: string | null
          skill_id?: string
          skill_name?: string
          skill_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_skills_taxonomy_parent_skill_id_fkey"
            columns: ["parent_skill_id"]
            isOneToOne: false
            referencedRelation: "st_skills_taxonomy"
            referencedColumns: ["skill_id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          department: string | null
          email: string
          email_verified: boolean | null
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          learning_preferences: Json | null
          password_hash: string
          phone: string | null
          position: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          email_verified?: boolean | null
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          learning_preferences?: Json | null
          password_hash: string
          phone?: string | null
          position?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          email_verified?: boolean | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          learning_preferences?: Json | null
          password_hash?: string
          phone?: string | null
          position?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_import_files: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_storage_path: {
        Args: {
          p_bucket_name: string
          p_company_id: string
          p_entity_id: string
          p_file_name: string
        }
        Returns: string
      }
      get_skill_path: {
        Args: { skill_uuid: string }
        Returns: {
          skill_id: string
          skill_name: string
          skill_type: string
          hierarchy_level: number
        }[]
      }
      get_user_auth_data: {
        Args: { user_uuid: string }
        Returns: {
          user_role: string
          user_company_id: string
        }[]
      }
      get_user_company_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      search_skills: {
        Args: { search_term: string; limit_count?: number }
        Returns: {
          skill_id: string
          skill_name: string
          skill_type: string
          hierarchy_level: number
          full_path: string
          relevance: number
        }[]
      }
      validate_file_upload: {
        Args: {
          p_bucket_name: string
          p_file_name: string
          p_file_size: number
          p_mime_type: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
