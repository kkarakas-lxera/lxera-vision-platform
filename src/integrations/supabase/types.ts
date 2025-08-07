export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      _backup_position_mappings: {
        Row: {
          approved_by: string | null
          company_id: string | null
          confidence_score: number | null
          created_at: string | null
          hris_job_title: string | null
          id: string | null
          position_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          company_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          hris_job_title?: string | null
          id?: string | null
          position_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          company_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          hris_job_title?: string | null
          id?: string | null
          position_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _backup_skill_assessment_history: {
        Row: {
          assessment_date: string | null
          assessment_version: string | null
          calculated_level: number | null
          context: Json | null
          created_at: string | null
          employee_id: string | null
          id: string | null
          position_id: string | null
          questions: Json | null
          required_level: number | null
          responses: Json | null
          skill_id: string | null
          skill_name: string | null
          time_taken: number | null
          updated_at: string | null
        }
        Insert: {
          assessment_date?: string | null
          assessment_version?: string | null
          calculated_level?: number | null
          context?: Json | null
          created_at?: string | null
          employee_id?: string | null
          id?: string | null
          position_id?: string | null
          questions?: Json | null
          required_level?: number | null
          responses?: Json | null
          skill_id?: string | null
          skill_name?: string | null
          time_taken?: number | null
          updated_at?: string | null
        }
        Update: {
          assessment_date?: string | null
          assessment_version?: string | null
          calculated_level?: number | null
          context?: Json | null
          created_at?: string | null
          employee_id?: string | null
          id?: string | null
          position_id?: string | null
          questions?: Json | null
          required_level?: number | null
          responses?: Json | null
          skill_id?: string | null
          skill_name?: string | null
          time_taken?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _backup_st_analysis_templates: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          is_active: boolean | null
          parameters: Json | null
          prompt_template: string | null
          system_prompt: string | null
          template_name: string | null
          template_type: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          is_active?: boolean | null
          parameters?: Json | null
          prompt_template?: string | null
          system_prompt?: string | null
          template_name?: string | null
          template_type?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string | null
          is_active?: boolean | null
          parameters?: Json | null
          prompt_template?: string | null
          system_prompt?: string | null
          template_name?: string | null
          template_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      _backup_st_cv_processing_queue: {
        Row: {
          completed_at: string | null
          cv_file_path: string | null
          enqueued_at: string | null
          error_details: Json | null
          id: string | null
          import_session_id: string | null
          max_retries: number | null
          priority: number | null
          processor_id: string | null
          retry_count: number | null
          session_item_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          cv_file_path?: string | null
          enqueued_at?: string | null
          error_details?: Json | null
          id?: string | null
          import_session_id?: string | null
          max_retries?: number | null
          priority?: number | null
          processor_id?: string | null
          retry_count?: number | null
          session_item_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          cv_file_path?: string | null
          enqueued_at?: string | null
          error_details?: Json | null
          id?: string | null
          import_session_id?: string | null
          max_retries?: number | null
          priority?: number | null
          processor_id?: string | null
          retry_count?: number | null
          session_item_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      _backup_st_file_uploads: {
        Row: {
          bucket_name: string | null
          company_id: string | null
          created_at: string | null
          deleted_at: string | null
          entity_id: string | null
          entity_type: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string | null
          metadata: Json | null
          mime_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          bucket_name?: string | null
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string | null
          metadata?: Json | null
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          bucket_name?: string | null
          company_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string | null
          metadata?: Json | null
          mime_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      _backup_st_position_mapping_suggestions: {
        Row: {
          company_id: string | null
          confidence_score: number | null
          created_at: string | null
          id: string | null
          last_used_at: string | null
          metadata: Json | null
          reasoning: string | null
          source_text: string | null
          suggested_position_id: string | null
        }
        Insert: {
          company_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string | null
          last_used_at?: string | null
          metadata?: Json | null
          reasoning?: string | null
          source_text?: string | null
          suggested_position_id?: string | null
        }
        Update: {
          company_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string | null
          last_used_at?: string | null
          metadata?: Json | null
          reasoning?: string | null
          source_text?: string | null
          suggested_position_id?: string | null
        }
        Relationships: []
      }
      _backup_st_skills_taxonomy: {
        Row: {
          aliases: string[] | null
          created_at: string | null
          description: string | null
          esco_uri: string | null
          hierarchy_level: number | null
          metadata: Json | null
          parent_skill_id: string | null
          skill_id: string | null
          skill_name: string | null
          skill_type: string | null
          updated_at: string | null
        }
        Insert: {
          aliases?: string[] | null
          created_at?: string | null
          description?: string | null
          esco_uri?: string | null
          hierarchy_level?: number | null
          metadata?: Json | null
          parent_skill_id?: string | null
          skill_id?: string | null
          skill_name?: string | null
          skill_type?: string | null
          updated_at?: string | null
        }
        Update: {
          aliases?: string[] | null
          created_at?: string | null
          description?: string | null
          esco_uri?: string | null
          hierarchy_level?: number | null
          metadata?: Json | null
          parent_skill_id?: string | null
          skill_id?: string | null
          skill_name?: string | null
          skill_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      available_tasks: {
        Row: {
          category: string
          content_section_id: string | null
          created_at: string | null
          description: string | null
          difficulty_level: string
          id: string
          is_active: boolean | null
          points_value: number
          title: string
        }
        Insert: {
          category: string
          content_section_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level: string
          id?: string
          is_active?: boolean | null
          points_value: number
          title: string
        }
        Update: {
          category?: string
          content_section_id?: string | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string
          id?: string
          is_active?: boolean | null
          points_value?: number
          title?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          message_type: string
          metadata: Json | null
          step: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          message_type: string
          metadata?: Json | null
          step?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          message_type?: string
          metadata?: Json | null
          step?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      cm_agent_handoffs: {
        Row: {
          content_id: string | null
          error_details: string | null
          execution_time_ms: number | null
          from_agent: string
          handoff_context: Json | null
          handoff_id: string
          handoff_timestamp: string | null
          plan_id: string | null
          retry_count: number | null
          session_id: string
          success: boolean | null
          to_agent: string
          token_count: number | null
        }
        Insert: {
          content_id?: string | null
          error_details?: string | null
          execution_time_ms?: number | null
          from_agent: string
          handoff_context?: Json | null
          handoff_id?: string
          handoff_timestamp?: string | null
          plan_id?: string | null
          retry_count?: number | null
          session_id: string
          success?: boolean | null
          to_agent: string
          token_count?: number | null
        }
        Update: {
          content_id?: string | null
          error_details?: string | null
          execution_time_ms?: number | null
          from_agent?: string
          handoff_context?: Json | null
          handoff_id?: string
          handoff_timestamp?: string | null
          plan_id?: string | null
          retry_count?: number | null
          session_id?: string
          success?: boolean | null
          to_agent?: string
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_agent_handoffs_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "cm_agent_handoffs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cm_course_plans"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      cm_course_plans: {
        Row: {
          agent_turns: number | null
          company_id: string
          course_duration_weeks: number | null
          course_structure: Json
          course_title: string | null
          created_at: string | null
          employee_id: string
          employee_name: string
          employee_profile: Json
          error_message: string | null
          execution_time_seconds: number | null
          learning_path: Json
          plan_id: string
          planning_agent_version: string | null
          prioritized_gaps: Json
          research_strategy: Json
          session_id: string
          status: string | null
          tool_calls: Json | null
          total_modules: number | null
          updated_at: string | null
        }
        Insert: {
          agent_turns?: number | null
          company_id: string
          course_duration_weeks?: number | null
          course_structure: Json
          course_title?: string | null
          created_at?: string | null
          employee_id: string
          employee_name: string
          employee_profile: Json
          error_message?: string | null
          execution_time_seconds?: number | null
          learning_path: Json
          plan_id?: string
          planning_agent_version?: string | null
          prioritized_gaps: Json
          research_strategy: Json
          session_id: string
          status?: string | null
          tool_calls?: Json | null
          total_modules?: number | null
          updated_at?: string | null
        }
        Update: {
          agent_turns?: number | null
          company_id?: string
          course_duration_weeks?: number | null
          course_structure?: Json
          course_title?: string | null
          created_at?: string | null
          employee_id?: string
          employee_name?: string
          employee_profile?: Json
          error_message?: string | null
          execution_time_seconds?: number | null
          learning_path?: Json
          plan_id?: string
          planning_agent_version?: string | null
          prioritized_gaps?: Json
          research_strategy?: Json
          session_id?: string
          status?: string | null
          tool_calls?: Json | null
          total_modules?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_course_plans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
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
          draft_content: Json | null
          employee_name: string
          enhancement_history: Json | null
          introduction: string | null
          is_current_version: boolean | null
          is_draft: boolean | null
          last_edited_at: string | null
          last_edited_by: string | null
          last_enhancement_id: string | null
          last_quality_check: string | null
          module_id: string | null
          module_name: string
          module_spec: Json
          parent_content_id: string | null
          plan_id: string | null
          practical_applications: string | null
          priority_level: string | null
          research_context: Json | null
          revision_count: number | null
          section_enhancement_count: Json | null
          section_last_assessed: Json | null
          section_quality_issues: Json | null
          section_quality_scores: Json | null
          section_status: Json | null
          section_updated_at: Json | null
          section_word_counts: Json | null
          session_id: string
          status: string | null
          total_word_count: number | null
          updated_at: string | null
          version_notes: string | null
          version_number: number | null
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
          draft_content?: Json | null
          employee_name: string
          enhancement_history?: Json | null
          introduction?: string | null
          is_current_version?: boolean | null
          is_draft?: boolean | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          last_enhancement_id?: string | null
          last_quality_check?: string | null
          module_id?: string | null
          module_name: string
          module_spec: Json
          parent_content_id?: string | null
          plan_id?: string | null
          practical_applications?: string | null
          priority_level?: string | null
          research_context?: Json | null
          revision_count?: number | null
          section_enhancement_count?: Json | null
          section_last_assessed?: Json | null
          section_quality_issues?: Json | null
          section_quality_scores?: Json | null
          section_status?: Json | null
          section_updated_at?: Json | null
          section_word_counts?: Json | null
          session_id: string
          status?: string | null
          total_word_count?: number | null
          updated_at?: string | null
          version_notes?: string | null
          version_number?: number | null
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
          draft_content?: Json | null
          employee_name?: string
          enhancement_history?: Json | null
          introduction?: string | null
          is_current_version?: boolean | null
          is_draft?: boolean | null
          last_edited_at?: string | null
          last_edited_by?: string | null
          last_enhancement_id?: string | null
          last_quality_check?: string | null
          module_id?: string | null
          module_name?: string
          module_spec?: Json
          parent_content_id?: string | null
          plan_id?: string | null
          practical_applications?: string | null
          priority_level?: string | null
          research_context?: Json | null
          revision_count?: number | null
          section_enhancement_count?: Json | null
          section_last_assessed?: Json | null
          section_quality_issues?: Json | null
          section_quality_scores?: Json | null
          section_status?: Json | null
          section_updated_at?: Json | null
          section_word_counts?: Json | null
          session_id?: string
          status?: string | null
          total_word_count?: number | null
          updated_at?: string | null
          version_notes?: string | null
          version_number?: number | null
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
            foreignKeyName: "cm_module_content_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
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
          {
            foreignKeyName: "cm_module_content_last_enhancement_id_fkey"
            columns: ["last_enhancement_id"]
            isOneToOne: false
            referencedRelation: "cm_enhancement_sessions"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "cm_module_content_parent_content_id_fkey"
            columns: ["parent_content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
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
          assessment_methodology: string | null
          clarity_score: number | null
          company_id: string
          completeness_score: number | null
          content_id: string
          critical_issues: string[] | null
          currency_timeliness_score: number | null
          engagement_score: number | null
          enhanced_assessment: boolean | null
          evidence_quality_score: number | null
          improvement_suggestions: string[] | null
          module_context: Json | null
          overall_score: number | null
          passed: boolean | null
          personalization_score: number | null
          quality_feedback: string | null
          requires_revision: boolean | null
          section_scores: Json | null
          sections_needing_work: string[] | null
          source_credibility_score: number | null
          source_diversity_score: number | null
          word_count_assessment: Json | null
        }
        Insert: {
          accuracy_score?: number | null
          assessed_at?: string | null
          assessed_by?: string | null
          assessment_criteria?: string | null
          assessment_duration_seconds?: number | null
          assessment_id?: string
          assessment_methodology?: string | null
          clarity_score?: number | null
          company_id: string
          completeness_score?: number | null
          content_id: string
          critical_issues?: string[] | null
          currency_timeliness_score?: number | null
          engagement_score?: number | null
          enhanced_assessment?: boolean | null
          evidence_quality_score?: number | null
          improvement_suggestions?: string[] | null
          module_context?: Json | null
          overall_score?: number | null
          passed?: boolean | null
          personalization_score?: number | null
          quality_feedback?: string | null
          requires_revision?: boolean | null
          section_scores?: Json | null
          sections_needing_work?: string[] | null
          source_credibility_score?: number | null
          source_diversity_score?: number | null
          word_count_assessment?: Json | null
        }
        Update: {
          accuracy_score?: number | null
          assessed_at?: string | null
          assessed_by?: string | null
          assessment_criteria?: string | null
          assessment_duration_seconds?: number | null
          assessment_id?: string
          assessment_methodology?: string | null
          clarity_score?: number | null
          company_id?: string
          completeness_score?: number | null
          content_id?: string
          critical_issues?: string[] | null
          currency_timeliness_score?: number | null
          engagement_score?: number | null
          enhanced_assessment?: boolean | null
          evidence_quality_score?: number | null
          improvement_suggestions?: string[] | null
          module_context?: Json | null
          overall_score?: number | null
          passed?: boolean | null
          personalization_score?: number | null
          quality_feedback?: string | null
          requires_revision?: boolean | null
          section_scores?: Json | null
          sections_needing_work?: string[] | null
          source_credibility_score?: number | null
          source_diversity_score?: number | null
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
      cm_research_results: {
        Row: {
          content_library: Json | null
          created_at: string | null
          credibility_analysis: Json | null
          enhanced_features_used: boolean | null
          execution_metrics: Json | null
          module_mappings: Json | null
          plan_id: string | null
          research_agent_version: string | null
          research_findings: Json
          research_id: string
          research_methodology: string | null
          search_queries: Json[] | null
          session_id: string
          source_types: Json | null
          sources_analyzed: Json[] | null
          status: string | null
          synthesis_sessions: Json[] | null
          tool_calls: Json[] | null
          total_sources: number | null
          total_topics: number | null
          updated_at: string | null
        }
        Insert: {
          content_library?: Json | null
          created_at?: string | null
          credibility_analysis?: Json | null
          enhanced_features_used?: boolean | null
          execution_metrics?: Json | null
          module_mappings?: Json | null
          plan_id?: string | null
          research_agent_version?: string | null
          research_findings: Json
          research_id?: string
          research_methodology?: string | null
          search_queries?: Json[] | null
          session_id: string
          source_types?: Json | null
          sources_analyzed?: Json[] | null
          status?: string | null
          synthesis_sessions?: Json[] | null
          tool_calls?: Json[] | null
          total_sources?: number | null
          total_topics?: number | null
          updated_at?: string | null
        }
        Update: {
          content_library?: Json | null
          created_at?: string | null
          credibility_analysis?: Json | null
          enhanced_features_used?: boolean | null
          execution_metrics?: Json | null
          module_mappings?: Json | null
          plan_id?: string | null
          research_agent_version?: string | null
          research_findings?: Json
          research_id?: string
          research_methodology?: string | null
          search_queries?: Json[] | null
          session_id?: string
          source_types?: Json | null
          sources_analyzed?: Json[] | null
          status?: string | null
          synthesis_sessions?: Json[] | null
          tool_calls?: Json[] | null
          total_sources?: number | null
          total_topics?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cm_research_results_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cm_course_plans"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      cm_research_sessions: {
        Row: {
          company_id: string
          completed_at: string | null
          content_id: string
          current_examples: string[] | null
          enhanced_research_enabled: boolean | null
          enhancement_session_id: string | null
          error_details: string | null
          industry_trends: string[] | null
          key_insights: string[] | null
          multi_agent_coordination: boolean | null
          research_agents: Json | null
          research_duration_seconds: number | null
          research_id: string
          research_methodology: string | null
          research_package: Json | null
          research_quality: number | null
          research_results: Json | null
          research_topics: string[]
          research_type: string | null
          source_credibility_scores: Json | null
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
          enhanced_research_enabled?: boolean | null
          enhancement_session_id?: string | null
          error_details?: string | null
          industry_trends?: string[] | null
          key_insights?: string[] | null
          multi_agent_coordination?: boolean | null
          research_agents?: Json | null
          research_duration_seconds?: number | null
          research_id?: string
          research_methodology?: string | null
          research_package?: Json | null
          research_quality?: number | null
          research_results?: Json | null
          research_topics: string[]
          research_type?: string | null
          source_credibility_scores?: Json | null
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
          enhanced_research_enabled?: boolean | null
          enhancement_session_id?: string | null
          error_details?: string | null
          industry_trends?: string[] | null
          key_insights?: string[] | null
          multi_agent_coordination?: boolean | null
          research_agents?: Json | null
          research_duration_seconds?: number | null
          research_id?: string
          research_methodology?: string | null
          research_package?: Json | null
          research_quality?: number | null
          research_results?: Json | null
          research_topics?: string[]
          research_type?: string | null
          source_credibility_scores?: Json | null
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
          benchmark_last_regenerated_at: string | null
          benchmark_regenerate_count: number | null
          benchmark_regenerate_reset_at: string | null
          created_at: string | null
          domain: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_courses: number | null
          max_employees: number | null
          name: string
          onboarding_mode: string | null
          plan_type: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          benchmark_last_regenerated_at?: string | null
          benchmark_regenerate_count?: number | null
          benchmark_regenerate_reset_at?: string | null
          created_at?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_courses?: number | null
          max_employees?: number | null
          name: string
          onboarding_mode?: string | null
          plan_type?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          benchmark_last_regenerated_at?: string | null
          benchmark_regenerate_count?: number | null
          benchmark_regenerate_reset_at?: string | null
          created_at?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_courses?: number | null
          max_employees?: number | null
          name?: string
          onboarding_mode?: string | null
          plan_type?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      company_feedback: {
        Row: {
          admin_notes: string | null
          category: string
          company_id: string
          created_at: string
          description: string
          expected_users: number | null
          id: string
          importance: string | null
          metadata: Json | null
          priority: string
          satisfaction_rating: number | null
          status: string
          title: string
          type: string
          updated_at: string
          user_email: string | null
          user_id: string
          user_name: string | null
          would_recommend: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          company_id: string
          created_at?: string
          description: string
          expected_users?: number | null
          id?: string
          importance?: string | null
          metadata?: Json | null
          priority: string
          satisfaction_rating?: number | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_email?: string | null
          user_id: string
          user_name?: string | null
          would_recommend?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          company_id?: string
          created_at?: string
          description?: string
          expected_users?: number | null
          id?: string
          importance?: string | null
          metadata?: Json | null
          priority?: string
          satisfaction_rating?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string
          user_name?: string | null
          would_recommend?: string | null
        }
        Relationships: []
      }
      contact_sales: {
        Row: {
          company: string
          created_at: string | null
          deleted_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          source: string | null
          status: string | null
          team_size: string
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          deleted_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          source?: string | null
          status?: string | null
          team_size: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          source?: string | null
          status?: string | null
          team_size?: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      content_feedback: {
        Row: {
          assessment_section: string | null
          confidence_level: number | null
          content_id: string
          created_at: string | null
          feedback_type: string
          id: string
          is_positive: boolean
          peer_review_data: Json | null
          section_id: string | null
          submission_files: string[] | null
          timestamp_seconds: number | null
          user_id: string
        }
        Insert: {
          assessment_section?: string | null
          confidence_level?: number | null
          content_id: string
          created_at?: string | null
          feedback_type: string
          id?: string
          is_positive: boolean
          peer_review_data?: Json | null
          section_id?: string | null
          submission_files?: string[] | null
          timestamp_seconds?: number | null
          user_id: string
        }
        Update: {
          assessment_section?: string | null
          confidence_level?: number | null
          content_id?: string
          created_at?: string | null
          feedback_type?: string
          id?: string
          is_positive?: boolean
          peer_review_data?: Json | null
          section_id?: string | null
          submission_files?: string[] | null
          timestamp_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_feedback_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "content_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
          current_module_id: string | null
          current_section: string | null
          due_date: string | null
          employee_id: string
          feedback: Json | null
          id: string
          modules_completed: number | null
          plan_id: string | null
          priority: string | null
          progress_percentage: number | null
          quiz_score: number | null
          started_at: string | null
          status: string | null
          total_modules: number | null
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
          current_module_id?: string | null
          current_section?: string | null
          due_date?: string | null
          employee_id: string
          feedback?: Json | null
          id?: string
          modules_completed?: number | null
          plan_id?: string | null
          priority?: string | null
          progress_percentage?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string | null
          total_modules?: number | null
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
          current_module_id?: string | null
          current_section?: string | null
          due_date?: string | null
          employee_id?: string
          feedback?: Json | null
          id?: string
          modules_completed?: number | null
          plan_id?: string | null
          priority?: string | null
          progress_percentage?: number | null
          quiz_score?: number | null
          started_at?: string | null
          status?: string | null
          total_modules?: number | null
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
            foreignKeyName: "course_assignments_current_module_id_fkey"
            columns: ["current_module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "course_assignments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cm_course_plans"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      course_content_versions: {
        Row: {
          change_summary: string | null
          content_id: string
          content_snapshot: Json
          created_at: string | null
          edited_by: string | null
          id: string
          is_published: boolean | null
          module_id: string
          plan_id: string
          version_number: number
        }
        Insert: {
          change_summary?: string | null
          content_id: string
          content_snapshot: Json
          created_at?: string | null
          edited_by?: string | null
          id?: string
          is_published?: boolean | null
          module_id: string
          plan_id: string
          version_number: number
        }
        Update: {
          change_summary?: string | null
          content_id?: string
          content_snapshot?: Json
          created_at?: string | null
          edited_by?: string | null
          id?: string
          is_published?: boolean | null
          module_id?: string
          plan_id?: string
          version_number?: number
        }
        Relationships: []
      }
      course_edit_history: {
        Row: {
          action_type: string
          content_id: string
          created_at: string | null
          editor_id: string
          id: string
          module_id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          action_type: string
          content_id: string
          created_at?: string | null
          editor_id: string
          id?: string
          module_id: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          action_type?: string
          content_id?: string
          created_at?: string | null
          editor_id?: string
          id?: string
          module_id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: []
      }
      course_edit_permissions: {
        Row: {
          can_edit_all_courses: boolean | null
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          specific_course_ids: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_edit_all_courses?: boolean | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          specific_course_ids?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_edit_all_courses?: boolean | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          specific_course_ids?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_edit_permissions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      course_generation_jobs: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string | null
          current_employee_name: string | null
          current_phase: string | null
          employee_ids: string[] | null
          error_message: string | null
          failed_courses: number | null
          id: string
          initiated_by: string
          processed_employees: number | null
          progress_percentage: number | null
          results: Json | null
          status: string
          successful_courses: number | null
          total_employees: number
          updated_at: string | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          current_employee_name?: string | null
          current_phase?: string | null
          employee_ids?: string[] | null
          error_message?: string | null
          failed_courses?: number | null
          id?: string
          initiated_by: string
          processed_employees?: number | null
          progress_percentage?: number | null
          results?: Json | null
          status?: string
          successful_courses?: number | null
          total_employees: number
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_employee_name?: string | null
          current_phase?: string | null
          employee_ids?: string[] | null
          error_message?: string | null
          failed_courses?: number | null
          id?: string
          initiated_by?: string
          processed_employees?: number | null
          progress_percentage?: number | null
          results?: Json | null
          status?: string
          successful_courses?: number | null
          total_employees?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_generation_jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_generation_jobs_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          assignment_id: string
          completed_at: string | null
          content_id: string
          created_at: string | null
          id: string
          is_completed: boolean | null
          is_unlocked: boolean | null
          module_number: number
          module_title: string
          progress_percentage: number | null
          started_at: string | null
          updated_at: string | null
        }
        Insert: {
          assignment_id: string
          completed_at?: string | null
          content_id: string
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_unlocked?: boolean | null
          module_number: number
          module_title: string
          progress_percentage?: number | null
          started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string
          completed_at?: string | null
          content_id?: string
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          is_unlocked?: boolean | null
          module_number?: number
          module_title?: string
          progress_percentage?: number | null
          started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "course_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_modules_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
        ]
      }
      course_section_progress: {
        Row: {
          assessment_data: Json | null
          assessment_type: string | null
          assignment_id: string
          attempt_number: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          max_score: number | null
          module_id: string | null
          score: number | null
          section_name: string
          started_at: string | null
          submitted_at: string | null
          time_spent_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          assessment_data?: Json | null
          assessment_type?: string | null
          assignment_id: string
          attempt_number?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          module_id?: string | null
          score?: number | null
          section_name: string
          started_at?: string | null
          submitted_at?: string | null
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          assessment_data?: Json | null
          assessment_type?: string | null
          assignment_id?: string
          attempt_number?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          max_score?: number | null
          module_id?: string | null
          score?: number | null
          section_name?: string
          started_at?: string | null
          submitted_at?: string | null
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_section_progress_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "course_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_section_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      cv_analysis_metrics: {
        Row: {
          analysis_time_ms: number
          created_at: string | null
          cv_length: number
          employee_id: string
          error_message: string | null
          gaps_found: number
          id: string
          match_percentage: number | null
          openai_tokens_used: number | null
          request_id: string
          skills_extracted: number
          status: string
        }
        Insert: {
          analysis_time_ms: number
          created_at?: string | null
          cv_length: number
          employee_id: string
          error_message?: string | null
          gaps_found: number
          id?: string
          match_percentage?: number | null
          openai_tokens_used?: number | null
          request_id: string
          skills_extracted: number
          status: string
        }
        Update: {
          analysis_time_ms?: number
          created_at?: string | null
          cv_length?: number
          employee_id?: string
          error_message?: string | null
          gaps_found?: number
          id?: string
          match_percentage?: number | null
          openai_tokens_used?: number | null
          request_id?: string
          skills_extracted?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cv_analysis_metrics_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_analysis_metrics_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      cv_analysis_results: {
        Row: {
          analysis_status: string | null
          analyzed_at: string | null
          created_at: string | null
          education: Json | null
          employee_id: string | null
          extracted_skills: Json | null
          id: string
          updated_at: string | null
          work_experience: Json | null
        }
        Insert: {
          analysis_status?: string | null
          analyzed_at?: string | null
          created_at?: string | null
          education?: Json | null
          employee_id?: string | null
          extracted_skills?: Json | null
          id?: string
          updated_at?: string | null
          work_experience?: Json | null
        }
        Update: {
          analysis_status?: string | null
          analyzed_at?: string | null
          created_at?: string | null
          education?: Json | null
          employee_id?: string | null
          extracted_skills?: Json | null
          id?: string
          updated_at?: string | null
          work_experience?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_analysis_results_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_analysis_results_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      cv_analysis_status: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          message: string | null
          metadata: Json | null
          progress: number | null
          session_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          message?: string | null
          metadata?: Json | null
          progress?: number | null
          session_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          progress?: number | null
          session_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_analysis_status_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cv_analysis_status_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      demo_captures: {
        Row: {
          calendly_scheduled: boolean | null
          company: string | null
          company_size: string | null
          completed_at: string | null
          created_at: string | null
          deleted_at: string | null
          demo_completed: boolean | null
          email: string
          id: string
          name: string | null
          scheduled_at: string | null
          source: string
          status: string | null
          step_completed: number | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          calendly_scheduled?: boolean | null
          company?: string | null
          company_size?: string | null
          completed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          demo_completed?: boolean | null
          email: string
          id?: string
          name?: string | null
          scheduled_at?: string | null
          source: string
          status?: string | null
          step_completed?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          calendly_scheduled?: boolean | null
          company?: string | null
          company_size?: string | null
          completed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          demo_completed?: boolean | null
          email?: string
          id?: string
          name?: string | null
          scheduled_at?: string | null
          source?: string
          status?: string | null
          step_completed?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      early_access_leads: {
        Row: {
          auth_user_id: string | null
          company: string | null
          converted_to_auth_at: string | null
          converted_to_company_id: string | null
          converted_to_user_id: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          enrichment_data: Json | null
          heard_about: string | null
          id: string
          invited_at: string | null
          name: string | null
          onboarded_at: string | null
          password_set: boolean | null
          profile_completed_at: string | null
          referral_code: string | null
          referral_count: number | null
          referred_by: string | null
          role: string | null
          source: string | null
          status: string | null
          team_size: string | null
          use_case: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          waitlist_position: number | null
        }
        Insert: {
          auth_user_id?: string | null
          company?: string | null
          converted_to_auth_at?: string | null
          converted_to_company_id?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          enrichment_data?: Json | null
          heard_about?: string | null
          id?: string
          invited_at?: string | null
          name?: string | null
          onboarded_at?: string | null
          password_set?: boolean | null
          profile_completed_at?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          role?: string | null
          source?: string | null
          status?: string | null
          team_size?: string | null
          use_case?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          waitlist_position?: number | null
        }
        Update: {
          auth_user_id?: string | null
          company?: string | null
          converted_to_auth_at?: string | null
          converted_to_company_id?: string | null
          converted_to_user_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          enrichment_data?: Json | null
          heard_about?: string | null
          id?: string
          invited_at?: string | null
          name?: string | null
          onboarded_at?: string | null
          password_set?: boolean | null
          profile_completed_at?: string | null
          referral_code?: string | null
          referral_count?: number | null
          referred_by?: string | null
          role?: string | null
          source?: string | null
          status?: string | null
          team_size?: string | null
          use_case?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          waitlist_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "early_access_leads_converted_to_company_id_fkey"
            columns: ["converted_to_company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_access_leads_converted_to_user_id_fkey"
            columns: ["converted_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "early_access_leads_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "early_access_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_course_intentions: {
        Row: {
          course_outline: Json
          created_at: string | null
          employee_id: string
          id: string
          intended_start_date: string | null
          intention: string
          updated_at: string | null
        }
        Insert: {
          course_outline: Json
          created_at?: string | null
          employee_id: string
          id?: string
          intended_start_date?: string | null
          intention: string
          updated_at?: string | null
        }
        Update: {
          course_outline?: Json
          created_at?: string | null
          employee_id?: string
          id?: string
          intended_start_date?: string | null
          intention?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_course_intentions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_course_intentions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_current_work: {
        Row: {
          created_at: string | null
          description: string | null
          employee_id: string | null
          expected_end_date: string | null
          id: string
          is_primary: boolean | null
          project_name: string
          role_in_project: string | null
          start_date: string | null
          status: string | null
          team_size: number | null
          technologies: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          expected_end_date?: string | null
          id?: string
          is_primary?: boolean | null
          project_name: string
          role_in_project?: string | null
          start_date?: string | null
          status?: string | null
          team_size?: number | null
          technologies?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          expected_end_date?: string | null
          id?: string
          is_primary?: boolean | null
          project_name?: string
          role_in_project?: string | null
          start_date?: string | null
          status?: string | null
          team_size?: number | null
          technologies?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_current_work_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_current_work_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_cv_data: {
        Row: {
          employee_id: string
          file_data: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          employee_id: string
          file_data: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          employee_id?: string
          file_data?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_cv_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_cv_data_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_daily_tasks: {
        Row: {
          created_at: string | null
          description: string | null
          employee_id: string | null
          id: string
          percentage_of_time: number | null
          task_category: string
          tools_used: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          percentage_of_time?: number | null
          task_category: string
          tools_used?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          employee_id?: string | null
          id?: string
          percentage_of_time?: number | null
          task_category?: string
          tools_used?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_daily_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_daily_tasks_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_game_progress: {
        Row: {
          achievements: Json | null
          created_at: string | null
          current_level: number | null
          current_streak: number | null
          employee_id: string
          last_played_date: string | null
          longest_streak: number | null
          puzzle_progress: Json | null
          skill_levels: Json | null
          total_correct_answers: number | null
          total_missions_completed: number | null
          total_points: number | null
          total_questions_answered: number | null
          updated_at: string | null
        }
        Insert: {
          achievements?: Json | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          employee_id: string
          last_played_date?: string | null
          longest_streak?: number | null
          puzzle_progress?: Json | null
          skill_levels?: Json | null
          total_correct_answers?: number | null
          total_missions_completed?: number | null
          total_points?: number | null
          total_questions_answered?: number | null
          updated_at?: string | null
        }
        Update: {
          achievements?: Json | null
          created_at?: string | null
          current_level?: number | null
          current_streak?: number | null
          employee_id?: string
          last_played_date?: string | null
          longest_streak?: number | null
          puzzle_progress?: Json | null
          skill_levels?: Json | null
          total_correct_answers?: number | null
          total_missions_completed?: number | null
          total_points?: number | null
          total_questions_answered?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_game_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_game_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_profile_sections: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data: Json | null
          employee_id: string | null
          id: string
          is_complete: boolean | null
          section_name: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          employee_id?: string | null
          id?: string
          is_complete?: boolean | null
          section_name: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          employee_id?: string | null
          id?: string
          is_complete?: boolean | null
          section_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_profile_sections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_profile_sections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_profile_suggestions: {
        Row: {
          challenges: string[]
          context_used: Json | null
          created_at: string | null
          employee_id: string
          generated_at: string | null
          growth_areas: string[]
          id: string
          updated_at: string | null
        }
        Insert: {
          challenges?: string[]
          context_used?: Json | null
          created_at?: string | null
          employee_id: string
          generated_at?: string | null
          growth_areas?: string[]
          id?: string
          updated_at?: string | null
        }
        Update: {
          challenges?: string[]
          context_used?: Json | null
          created_at?: string | null
          employee_id?: string
          generated_at?: string | null
          growth_areas?: string[]
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_profile_suggestions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_profile_suggestions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_skills: {
        Row: {
          created_at: string | null
          employee_id: string
          evidence: string | null
          id: string
          proficiency: number
          skill_id: string | null
          skill_name: string
          source: string
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          evidence?: string | null
          id?: string
          proficiency: number
          skill_id?: string | null
          skill_name: string
          source: string
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          evidence?: string | null
          id?: string
          proficiency?: number
          skill_id?: string | null
          skill_name?: string
          source?: string
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_tools: {
        Row: {
          category: string | null
          created_at: string | null
          employee_id: string | null
          frequency: string | null
          id: string
          last_used: string | null
          proficiency: string | null
          tool_name: string
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          employee_id?: string | null
          frequency?: string | null
          id?: string
          last_used?: string | null
          proficiency?: string | null
          tool_name: string
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          employee_id?: string | null
          frequency?: string | null
          id?: string
          last_used?: string | null
          proficiency?: string | null
          tool_name?: string
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_tools_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_tools_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
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
          cv_analysis_data: Json | null
          cv_data_verified: boolean | null
          cv_extracted_data: Json | null
          cv_file_path: string | null
          cv_uploaded_at: string | null
          department: string | null
          employee_id: string | null
          employee_role: string | null
          hired_date: string | null
          hris_data: Json | null
          hris_id: string | null
          id: string
          import_session_id: string | null
          is_active: boolean | null
          key_tools: string[] | null
          last_activity: string | null
          last_learning_date: string | null
          learning_streak: number | null
          learning_style: Json | null
          manager_id: string | null
          market_gap_data: Json | null
          market_gap_updated_at: string | null
          position: string | null
          profile_builder_points: number | null
          profile_builder_streak: number | null
          profile_complete: boolean | null
          profile_completion_date: string | null
          profile_data: Json | null
          profile_last_updated: string | null
          skill_level: string | null
          skills_last_analyzed: string | null
          skills_validation_completed: boolean | null
          target_position_id: string | null
          time_in_role: string | null
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
          cv_analysis_data?: Json | null
          cv_data_verified?: boolean | null
          cv_extracted_data?: Json | null
          cv_file_path?: string | null
          cv_uploaded_at?: string | null
          department?: string | null
          employee_id?: string | null
          employee_role?: string | null
          hired_date?: string | null
          hris_data?: Json | null
          hris_id?: string | null
          id?: string
          import_session_id?: string | null
          is_active?: boolean | null
          key_tools?: string[] | null
          last_activity?: string | null
          last_learning_date?: string | null
          learning_streak?: number | null
          learning_style?: Json | null
          manager_id?: string | null
          market_gap_data?: Json | null
          market_gap_updated_at?: string | null
          position?: string | null
          profile_builder_points?: number | null
          profile_builder_streak?: number | null
          profile_complete?: boolean | null
          profile_completion_date?: string | null
          profile_data?: Json | null
          profile_last_updated?: string | null
          skill_level?: string | null
          skills_last_analyzed?: string | null
          skills_validation_completed?: boolean | null
          target_position_id?: string | null
          time_in_role?: string | null
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
          cv_analysis_data?: Json | null
          cv_data_verified?: boolean | null
          cv_extracted_data?: Json | null
          cv_file_path?: string | null
          cv_uploaded_at?: string | null
          department?: string | null
          employee_id?: string | null
          employee_role?: string | null
          hired_date?: string | null
          hris_data?: Json | null
          hris_id?: string | null
          id?: string
          import_session_id?: string | null
          is_active?: boolean | null
          key_tools?: string[] | null
          last_activity?: string | null
          last_learning_date?: string | null
          learning_streak?: number | null
          learning_style?: Json | null
          manager_id?: string | null
          market_gap_data?: Json | null
          market_gap_updated_at?: string | null
          position?: string | null
          profile_builder_points?: number | null
          profile_builder_streak?: number | null
          profile_complete?: boolean | null
          profile_completion_date?: string | null
          profile_data?: Json | null
          profile_last_updated?: string | null
          skill_level?: string | null
          skills_last_analyzed?: string | null
          skills_validation_completed?: boolean | null
          target_position_id?: string | null
          time_in_role?: string | null
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
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
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
          {
            foreignKeyName: "fk_employees_import_session"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "st_import_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employees_import_session"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "v_batch_history"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "fk_employees_import_session"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "v_import_session_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      game_missions: {
        Row: {
          category: string | null
          company_id: string | null
          content_section_id: string | null
          created_at: string | null
          current_skill_level: number | null
          difficulty_level: string
          employee_id: string | null
          estimated_minutes: number | null
          gap_severity: string | null
          id: string
          is_active: boolean | null
          mission_description: string | null
          mission_title: string
          module_content_id: string | null
          points_value: number
          position_id: string | null
          questions_count: number | null
          required_skill_level: number | null
          section_name: string | null
          skill_focus: string[] | null
          skill_gap_size: number | null
          target_skill_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          company_id?: string | null
          content_section_id?: string | null
          created_at?: string | null
          current_skill_level?: number | null
          difficulty_level: string
          employee_id?: string | null
          estimated_minutes?: number | null
          gap_severity?: string | null
          id?: string
          is_active?: boolean | null
          mission_description?: string | null
          mission_title: string
          module_content_id?: string | null
          points_value?: number
          position_id?: string | null
          questions_count?: number | null
          required_skill_level?: number | null
          section_name?: string | null
          skill_focus?: string[] | null
          skill_gap_size?: number | null
          target_skill_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string | null
          content_section_id?: string | null
          created_at?: string | null
          current_skill_level?: number | null
          difficulty_level?: string
          employee_id?: string | null
          estimated_minutes?: number | null
          gap_severity?: string | null
          id?: string
          is_active?: boolean | null
          mission_description?: string | null
          mission_title?: string
          module_content_id?: string | null
          points_value?: number
          position_id?: string | null
          questions_count?: number | null
          required_skill_level?: number | null
          section_name?: string | null
          skill_focus?: string[] | null
          skill_gap_size?: number | null
          target_skill_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_missions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_missions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_missions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "game_missions_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
          {
            foreignKeyName: "game_missions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_progress_state: {
        Row: {
          completed_at: string | null
          content_section_id: string | null
          created_at: string | null
          current_question_index: number | null
          employee_id: string
          final_results: Json | null
          game_mode: string | null
          id: string
          mission_id: string
          responses: Json | null
          section_name: string | null
          selected_task: Json | null
          started_at: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          content_section_id?: string | null
          created_at?: string | null
          current_question_index?: number | null
          employee_id: string
          final_results?: Json | null
          game_mode?: string | null
          id?: string
          mission_id: string
          responses?: Json | null
          section_name?: string | null
          selected_task?: Json | null
          started_at?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          content_section_id?: string | null
          created_at?: string | null
          current_question_index?: number | null
          employee_id?: string
          final_results?: Json | null
          game_mode?: string | null
          id?: string
          mission_id?: string
          responses?: Json | null
          section_name?: string | null
          selected_task?: Json | null
          started_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_progress_state_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_progress_state_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "game_progress_state_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "game_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_questions: {
        Row: {
          ai_generated: boolean | null
          content_section_id: string | null
          correct_answer: number
          created_at: string | null
          difficulty_score: number | null
          explanation: string | null
          id: string
          mission_id: string | null
          options: Json
          question_text: string
          question_type: string
          skill_focus: string
          source_content_snippet: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          content_section_id?: string | null
          correct_answer: number
          created_at?: string | null
          difficulty_score?: number | null
          explanation?: string | null
          id?: string
          mission_id?: string | null
          options?: Json
          question_text: string
          question_type?: string
          skill_focus: string
          source_content_snippet?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          content_section_id?: string | null
          correct_answer?: number
          created_at?: string | null
          difficulty_score?: number | null
          explanation?: string | null
          id?: string
          mission_id?: string | null
          options?: Json
          question_text?: string
          question_type?: string
          skill_focus?: string
          source_content_snippet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_questions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "game_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          accuracy_percentage: number | null
          completed_at: string | null
          content_section_id: string | null
          correct_answers: number | null
          employee_id: string | null
          id: string
          mission_id: string | null
          module_content_id: string | null
          points_earned: number | null
          questions_answered: number | null
          section_name: string | null
          session_status: string | null
          skill_improvements: Json | null
          started_at: string | null
          time_spent_seconds: number | null
        }
        Insert: {
          accuracy_percentage?: number | null
          completed_at?: string | null
          content_section_id?: string | null
          correct_answers?: number | null
          employee_id?: string | null
          id?: string
          mission_id?: string | null
          module_content_id?: string | null
          points_earned?: number | null
          questions_answered?: number | null
          section_name?: string | null
          session_status?: string | null
          skill_improvements?: Json | null
          started_at?: string | null
          time_spent_seconds?: number | null
        }
        Update: {
          accuracy_percentage?: number | null
          completed_at?: string | null
          content_section_id?: string | null
          correct_answers?: number | null
          employee_id?: string | null
          id?: string
          mission_id?: string | null
          module_content_id?: string | null
          points_earned?: number | null
          questions_answered?: number | null
          section_name?: string | null
          session_status?: string | null
          skill_improvements?: Json | null
          started_at?: string | null
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "game_sessions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "game_missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_module_content_id_fkey"
            columns: ["module_content_id"]
            isOneToOne: false
            referencedRelation: "cm_module_content"
            referencedColumns: ["content_id"]
          },
        ]
      }
      hris_connections: {
        Row: {
          access_token: string | null
          company_id: string | null
          connection_id: string | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          sync_error: string | null
          sync_status: string | null
          token_expires_at: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          company_id?: string | null
          connection_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          sync_error?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          company_id?: string | null
          connection_id?: string | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          sync_error?: string | null
          sync_status?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hris_connections_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      hris_sync_logs: {
        Row: {
          company_id: string | null
          completed_at: string | null
          employees_created: number | null
          employees_synced: number | null
          employees_updated: number | null
          errors: Json | null
          id: string
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          employees_created?: number | null
          employees_synced?: number | null
          employees_updated?: number | null
          errors?: Json | null
          id?: string
          started_at?: string | null
          status: string
          sync_type: string
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          employees_created?: number | null
          employees_synced?: number | null
          employees_updated?: number | null
          errors?: Json | null
          id?: string
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "hris_sync_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          lead_id: string | null
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          lead_id?: string | null
          token?: string
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          lead_id?: string | null
          token?: string
          used?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_sessions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "early_access_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      market_benchmark_snapshots: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          metrics: Json
          snapshot_date: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          metrics: Json
          snapshot_date?: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          metrics?: Json
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_benchmark_snapshots_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      market_skills_benchmarks: {
        Row: {
          created_at: string | null
          department: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          industry: string | null
          last_refresh_attempt: string | null
          metadata: Json | null
          role_name: string
          skills: Json
          source_model: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          industry?: string | null
          last_refresh_attempt?: string | null
          metadata?: Json | null
          role_name: string
          skills: Json
          source_model?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          industry?: string | null
          last_refresh_attempt?: string | null
          metadata?: Json | null
          role_name?: string
          skills?: Json
          source_model?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      peer_review_assignments: {
        Row: {
          assigned_at: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          review_data: Json | null
          reviewer_employee_id: string | null
          section_progress_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          review_data?: Json | null
          reviewer_employee_id?: string | null
          section_progress_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          review_data?: Json | null
          reviewer_employee_id?: string | null
          section_progress_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_review_assignments_reviewer_employee_id_fkey"
            columns: ["reviewer_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peer_review_assignments_reviewer_employee_id_fkey"
            columns: ["reviewer_employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "peer_review_assignments_section_progress_id_fkey"
            columns: ["section_progress_id"]
            isOneToOne: false
            referencedRelation: "course_section_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      position_drafts: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          draft_data: Json
          id: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          draft_data: Json
          id?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          draft_data?: Json
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "position_drafts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_invitations: {
        Row: {
          completed_at: string | null
          created_at: string | null
          email_clicked_at: string | null
          email_clicked_count: number | null
          email_clicks: Json | null
          email_opened_at: string | null
          email_opened_count: number | null
          email_tracking_data: Json | null
          employee_id: string | null
          expires_at: string | null
          id: string
          invitation_token: string | null
          last_reminder_at: string | null
          reminder_count: number | null
          resend_email_id: string | null
          sent_at: string | null
          updated_at: string | null
          viewed_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          email_clicked_at?: string | null
          email_clicked_count?: number | null
          email_clicks?: Json | null
          email_opened_at?: string | null
          email_opened_count?: number | null
          email_tracking_data?: Json | null
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          last_reminder_at?: string | null
          reminder_count?: number | null
          resend_email_id?: string | null
          sent_at?: string | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          email_clicked_at?: string | null
          email_clicked_count?: number | null
          email_clicks?: Json | null
          email_opened_at?: string | null
          email_opened_count?: number | null
          email_tracking_data?: Json | null
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          invitation_token?: string | null
          last_reminder_at?: string | null
          reminder_count?: number | null
          resend_email_id?: string | null
          sent_at?: string | null
          updated_at?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_invitations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_invitations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      puzzle_progress: {
        Row: {
          category: string
          completed_at: string | null
          employee_id: string | null
          id: string
          pieces_unlocked: number | null
          puzzle_size: number | null
          skill_id: string | null
          skill_name: string | null
          total_pieces: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          completed_at?: string | null
          employee_id?: string | null
          id?: string
          pieces_unlocked?: number | null
          puzzle_size?: number | null
          skill_id?: string | null
          skill_name?: string | null
          total_pieces?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          completed_at?: string | null
          employee_id?: string | null
          id?: string
          pieces_unlocked?: number | null
          puzzle_size?: number | null
          skill_id?: string | null
          skill_name?: string | null
          total_pieces?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "puzzle_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "puzzle_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      skill_assessment_history: {
        Row: {
          assessment_date: string | null
          assessment_version: string | null
          calculated_level: number | null
          context: Json | null
          created_at: string | null
          employee_id: string
          id: string
          position_id: string | null
          questions: Json
          required_level: number | null
          responses: Json
          skill_id: string | null
          skill_name: string
          time_taken: number | null
          updated_at: string | null
        }
        Insert: {
          assessment_date?: string | null
          assessment_version?: string | null
          calculated_level?: number | null
          context?: Json | null
          created_at?: string | null
          employee_id: string
          id?: string
          position_id?: string | null
          questions?: Json
          required_level?: number | null
          responses?: Json
          skill_id?: string | null
          skill_name: string
          time_taken?: number | null
          updated_at?: string | null
        }
        Update: {
          assessment_date?: string | null
          assessment_version?: string | null
          calculated_level?: number | null
          context?: Json | null
          created_at?: string | null
          employee_id?: string
          id?: string
          position_id?: string | null
          questions?: Json
          required_level?: number | null
          responses?: Json
          skill_id?: string | null
          skill_name?: string
          time_taken?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_assessment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "skill_assessment_history_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_assessment_questions: {
        Row: {
          assessment_context: Json | null
          created_at: string | null
          employee_id: string
          generated_at: string | null
          id: string
          is_used: boolean | null
          position_id: string | null
          questions: Json
          skill_id: string | null
          skill_name: string
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          assessment_context?: Json | null
          created_at?: string | null
          employee_id: string
          generated_at?: string | null
          id?: string
          is_used?: boolean | null
          position_id?: string | null
          questions: Json
          skill_id?: string | null
          skill_name: string
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          assessment_context?: Json | null
          created_at?: string | null
          employee_id?: string
          generated_at?: string | null
          id?: string
          is_used?: boolean | null
          position_id?: string | null
          questions?: Json
          skill_id?: string | null
          skill_name?: string
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessment_questions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_assessment_questions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "skill_assessment_questions_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      skills_gap_cache: {
        Row: {
          calculated_at: string | null
          entity_id: string
          entity_type: string
          gaps: Json
          id: string
        }
        Insert: {
          calculated_at?: string | null
          entity_id: string
          entity_type: string
          gaps?: Json
          id?: string
        }
        Update: {
          calculated_at?: string | null
          entity_id?: string
          entity_type?: string
          gaps?: Json
          id?: string
        }
        Relationships: []
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
          nice_to_have_skills: Json | null
          position_code: string
          position_level: string | null
          position_title: string
          required_skills: Json | null
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
          nice_to_have_skills?: Json | null
          position_code: string
          position_level?: string | null
          position_title: string
          required_skills?: Json | null
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
          nice_to_have_skills?: Json | null
          position_code?: string
          position_level?: string | null
          position_title?: string
          required_skills?: Json | null
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
      st_import_session_items: {
        Row: {
          analysis_completed_at: string | null
          analysis_started_at: string | null
          analysis_tokens_used: number | null
          confidence_score: number | null
          created_at: string | null
          current_position_code: string | null
          cv_analysis_result: Json | null
          cv_file_path: string | null
          cv_filename: string | null
          deleted_at: string | null
          deleted_by: string | null
          employee_email: string
          employee_id: string | null
          employee_name: string | null
          error_message: string | null
          field_values: Json | null
          id: string
          import_session_id: string
          is_deleted: boolean | null
          last_modified: string | null
          position_match_analysis: Json | null
          processed_at: string | null
          row_order: number | null
          skills_profile_id: string | null
          status: string | null
          suggested_positions: Json | null
          target_position_code: string | null
        }
        Insert: {
          analysis_completed_at?: string | null
          analysis_started_at?: string | null
          analysis_tokens_used?: number | null
          confidence_score?: number | null
          created_at?: string | null
          current_position_code?: string | null
          cv_analysis_result?: Json | null
          cv_file_path?: string | null
          cv_filename?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          employee_email: string
          employee_id?: string | null
          employee_name?: string | null
          error_message?: string | null
          field_values?: Json | null
          id?: string
          import_session_id: string
          is_deleted?: boolean | null
          last_modified?: string | null
          position_match_analysis?: Json | null
          processed_at?: string | null
          row_order?: number | null
          skills_profile_id?: string | null
          status?: string | null
          suggested_positions?: Json | null
          target_position_code?: string | null
        }
        Update: {
          analysis_completed_at?: string | null
          analysis_started_at?: string | null
          analysis_tokens_used?: number | null
          confidence_score?: number | null
          created_at?: string | null
          current_position_code?: string | null
          cv_analysis_result?: Json | null
          cv_file_path?: string | null
          cv_filename?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          employee_email?: string
          employee_id?: string | null
          employee_name?: string | null
          error_message?: string | null
          field_values?: Json | null
          id?: string
          import_session_id?: string
          is_deleted?: boolean | null
          last_modified?: string | null
          position_match_analysis?: Json | null
          processed_at?: string | null
          row_order?: number | null
          skills_profile_id?: string | null
          status?: string | null
          suggested_positions?: Json | null
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
            foreignKeyName: "st_import_session_items_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "st_import_session_items_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "st_import_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_import_session_items_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "v_batch_history"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "st_import_session_items_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "v_import_session_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      st_import_sessions: {
        Row: {
          active_position_id: string | null
          analysis_config: Json | null
          bulk_analysis_status: string | null
          checklist_state: Json | null
          company_id: string
          completed_at: string | null
          created_at: string | null
          created_by: string
          csv_file_path: string | null
          error_log: Json[] | null
          failed: number | null
          id: string
          import_type: string | null
          last_active: string | null
          processed: number | null
          session_metadata: Json | null
          spreadsheet_mode: boolean | null
          status: string | null
          successful: number | null
          total_employees: number
        }
        Insert: {
          active_position_id?: string | null
          analysis_config?: Json | null
          bulk_analysis_status?: string | null
          checklist_state?: Json | null
          company_id: string
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          csv_file_path?: string | null
          error_log?: Json[] | null
          failed?: number | null
          id?: string
          import_type?: string | null
          last_active?: string | null
          processed?: number | null
          session_metadata?: Json | null
          spreadsheet_mode?: boolean | null
          status?: string | null
          successful?: number | null
          total_employees?: number
        }
        Update: {
          active_position_id?: string | null
          analysis_config?: Json | null
          bulk_analysis_status?: string | null
          checklist_state?: Json | null
          company_id?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          csv_file_path?: string | null
          error_log?: Json[] | null
          failed?: number | null
          id?: string
          import_type?: string | null
          last_active?: string | null
          processed?: number | null
          session_metadata?: Json | null
          spreadsheet_mode?: boolean | null
          status?: string | null
          successful?: number | null
          total_employees?: number
        }
        Relationships: [
          {
            foreignKeyName: "st_import_sessions_active_position_id_fkey"
            columns: ["active_position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
            referencedColumns: ["id"]
          },
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
      st_llm_usage_metrics: {
        Row: {
          company_id: string | null
          cost_estimate: number | null
          created_at: string | null
          duration_ms: number | null
          error_code: string | null
          id: string
          input_tokens: number
          metadata: Json | null
          model_used: string
          output_tokens: number
          service_type: string
          success: boolean | null
          total_tokens: number | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          id?: string
          input_tokens: number
          metadata?: Json | null
          model_used: string
          output_tokens: number
          service_type: string
          success?: boolean | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          cost_estimate?: number | null
          created_at?: string | null
          duration_ms?: number | null
          error_code?: string | null
          id?: string
          input_tokens?: number
          metadata?: Json | null
          model_used?: string
          output_tokens?: number
          service_type?: string
          success?: boolean | null
          total_tokens?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_llm_usage_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_llm_usage_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      undo_operations: {
        Row: {
          affected_ids: string[]
          affected_table: string
          company_id: string
          created_at: string | null
          executed: boolean | null
          expires_at: string | null
          id: string
          operation_data: Json
          operation_type: string
          user_id: string
        }
        Insert: {
          affected_ids: string[]
          affected_table: string
          company_id: string
          created_at?: string | null
          executed?: boolean | null
          expires_at?: string | null
          id?: string
          operation_data: Json
          operation_type: string
          user_id: string
        }
        Update: {
          affected_ids?: string[]
          affected_table?: string
          company_id?: string
          created_at?: string | null
          executed?: boolean | null
          expires_at?: string | null
          id?: string
          operation_data?: Json
          operation_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "undo_operations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
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
          metadata: Json | null
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
          metadata?: Json | null
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
          metadata?: Json | null
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
      verification_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      video_progress: {
        Row: {
          completed: boolean | null
          course_id: string
          created_at: string | null
          employee_id: string
          id: string
          progress_seconds: number | null
          total_seconds: number | null
          updated_at: string | null
          video_url: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          created_at?: string | null
          employee_id: string
          id?: string
          progress_seconds?: number | null
          total_seconds?: number | null
          updated_at?: string | null
          video_url: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          progress_seconds?: number | null
          total_seconds?: number | null
          updated_at?: string | null
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_progress_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
        ]
      }
    }
    Views: {
      cv_analysis_stats: {
        Row: {
          analysis_date: string | null
          avg_analysis_time_ms: number | null
          avg_cv_length: number | null
          avg_match_percentage: number | null
          avg_skills_extracted: number | null
          failed_analyses: number | null
          successful_analyses: number | null
          total_analyses: number | null
        }
        Relationships: []
      }
      enhanced_employee_skills_dashboard: {
        Row: {
          analyzed_at: string | null
          career_readiness_score: number | null
          company_id: string | null
          current_work_complete: boolean | null
          daily_tasks_complete: boolean | null
          employee_email: string | null
          employee_id: string | null
          employee_name: string | null
          position_code: string | null
          position_title: string | null
          profile_completion_percentage: number | null
          skills_match_score: number | null
          skills_sources: Json | null
          tools_complete: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      latest_skill_assessments: {
        Row: {
          assessment_date: string | null
          assessment_version: string | null
          calculated_level: number | null
          context: Json | null
          created_at: string | null
          employee_id: string | null
          id: string | null
          position_id: string | null
          questions: Json | null
          required_level: number | null
          responses: Json | null
          skill_id: string | null
          skill_name: string | null
          time_taken: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_assessment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "enhanced_employee_skills_dashboard"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "skill_assessment_history_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      st_skills_overview: {
        Row: {
          avg_proficiency: number | null
          company_id: string | null
          cv_extracted_count: number | null
          employee_count: number | null
          manual_count: number | null
          max_proficiency: number | null
          min_proficiency: number | null
          skill_name: string | null
          verified_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      unified_leads: {
        Row: {
          company: string | null
          company_size: string | null
          created_at: string | null
          email: string | null
          id: string | null
          lead_type: string | null
          name: string | null
          source: string | null
          step_completed: number | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Relationships: []
      }
      v_active_spreadsheet_items: {
        Row: {
          checklist_state: Json | null
          company_id: string | null
          current_position_code: string | null
          cv_file_path: string | null
          cv_filename: string | null
          employee_email: string | null
          employee_name: string | null
          field_values: Json | null
          id: string | null
          import_session_id: string | null
          last_modified: string | null
          row_order: number | null
          spreadsheet_mode: boolean | null
          status: string | null
          target_position_code: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_import_session_items_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "st_import_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_import_session_items_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "v_batch_history"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "st_import_session_items_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "v_import_session_analytics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_import_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      v_batch_history: {
        Row: {
          active_items: number | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          deleted_items: number | null
          failed: number | null
          import_type: string | null
          last_active: string | null
          processed: number | null
          session_id: string | null
          session_metadata: Json | null
          status: string | null
          successful: number | null
          total_employees: number | null
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
      v_import_session_analytics: {
        Row: {
          company_id: string | null
          completed_at: string | null
          created_at: string | null
          failed: number | null
          id: string | null
          import_type: string | null
          processed: number | null
          status: string | null
          successful: number | null
          total_employees: number | null
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          failed?: number | null
          id?: string | null
          import_type?: string | null
          processed?: number | null
          status?: string | null
          successful?: number | null
          total_employees?: number | null
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          failed?: number | null
          id?: string | null
          import_type?: string | null
          processed?: number | null
          status?: string | null
          successful?: number | null
          total_employees?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "st_import_sessions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      v_skills_trends_monthly: {
        Row: {
          avg_match_score: number | null
          employees_analyzed: number | null
          total_analyses: number | null
          trend_month: string | null
        }
        Relationships: []
      }
      waitlist_analytics: {
        Row: {
          avg_position: number | null
          referral_signups: number | null
          signup_date: string | null
          total_signups: number | null
          verified_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_spreadsheet_row: {
        Args: { p_session_id: string; p_field_values: Json }
        Returns: string
      }
      admin_reset_user_password: {
        Args: { user_email: string; new_password: string }
        Returns: string
      }
      assign_waitlist_position: {
        Args: { lead_email: string } | { lead_id: string }
        Returns: number
      }
      batch_delete_items: {
        Args: { p_item_ids: string[] }
        Returns: Json
      }
      batch_update_rows: {
        Args: { p_session_id: string; p_updates: Json[] }
        Returns: Json
      }
      calculate_department_skills_gaps: {
        Args: { p_company_id: string; p_department: string }
        Returns: {
          critical_gaps: number
          moderate_gaps: number
          minor_gaps: number
        }[]
      }
      calculate_employee_profile_completeness: {
        Args: { p_employee_id: string }
        Returns: number
      }
      calculate_employee_skills_gap: {
        Args: { p_employee_id: string }
        Returns: {
          skill_id: string
          skill_name: string
          skill_type: string
          required_level: string
          current_level: string
          gap_severity: string
          is_mandatory: boolean
          match_percentage: number
        }[]
      }
      calculate_enhanced_skills_gap: {
        Args: { p_company_id: string }
        Returns: {
          position_code: string
          position_title: string
          employee_count: number
          avg_match_percentage: number
          critical_gaps_count: number
          total_gaps_count: number
          current_work_insights: Json
          daily_tasks_insights: Json
          tools_insights: Json
          profile_completion_rate: number
        }[]
      }
      calculate_match_score: {
        Args: { p_company_id: string }
        Returns: {
          position_code: string
          position_title: string
          total_employees: number
          avg_match_percentage: number
          employees_with_gaps: number
        }[]
      }
      calculate_position_match_score: {
        Args: { p_employee_skills: Json; p_position_required_skills: Json }
        Returns: number
      }
      calculate_skills_gap: {
        Args: { p_company_id: string }
        Returns: {
          position_code: string
          position_title: string
          employee_count: number
          avg_match_percentage: number
          critical_gaps_count: number
          total_gaps_count: number
        }[]
      }
      calculate_skills_gaps: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: Json
      }
      can_edit_course: {
        Args: { p_plan_id: string }
        Returns: boolean
      }
      check_and_use_regeneration: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_pending_major_changes: {
        Args: { p_module_id: string }
        Returns: {
          has_major_changes: boolean
          affected_employees: number
        }[]
      }
      check_user_exists_by_email: {
        Args: { p_email: string }
        Returns: {
          user_id: string
          user_exists: boolean
        }[]
      }
      clean_expired_benchmark_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clean_expired_market_benchmarks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_skills_gap_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_undo_operations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_expired_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_cv_analysis_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_import_files: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_old_spreadsheet_drafts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      convert_to_standard_proficiency: {
        Args: { value: unknown }
        Returns: number
      }
      create_company_user: {
        Args: {
          p_email: string
          p_password_hash: string
          p_full_name: string
          p_role?: string
        }
        Returns: string
      }
      create_empty_rows: {
        Args: { p_session_id: string; p_count?: number }
        Returns: number
      }
      create_session_items_for_employees: {
        Args: { p_session_id: string; p_employee_ids: string[] }
        Returns: number
      }
      generate_skills_gap_report_with_insights: {
        Args: { p_company_id: string }
        Returns: Json
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
      get_active_benchmark_configs: {
        Args: Record<PropertyKey, never>
        Returns: {
          role_name: string
          industry: string
          department: string
          skills_count: number
          last_refresh: string
          expires_at: string
          is_stale: boolean
        }[]
      }
      get_batch_history: {
        Args: { p_company_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          session_id: string
          created_by_name: string
          created_at: string
          total_employees: number
          active_items: number
          deleted_items: number
          status: string
          session_metadata: Json
        }[]
      }
      get_department_skill_breakdown: {
        Args: { dept_name: string }
        Returns: {
          critical_count: number
          emerging_count: number
          foundational_count: number
          total_skills: number
        }[]
      }
      get_department_top_gaps: {
        Args: { dept_name: string; gap_limit?: number }
        Returns: {
          skill_name: string
          gap_percentage: number
          category: string
          affected_employees: number
        }[]
      }
      get_departments_benchmark_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          department: string
          employee_count: number
          analyzed_count: number
          avg_skills_match: number
          critical_gaps: number
          emerging_gaps: number
        }[]
      }
      get_employee_verification_status: {
        Args: { p_employee_id: string }
        Returns: {
          total_skills: number
          verified_skills: number
          verification_percentage: number
          last_verification_date: string
          position_readiness_score: number
        }[]
      }
      get_market_benchmarks: {
        Args: {
          p_role_name: string
          p_industry?: string
          p_department?: string
        }
        Returns: Json
      }
      get_module_content_for_admin: {
        Args: { p_content_id: string; p_company_id: string }
        Returns: {
          content_id: string
          module_name: string
          module_spec: Json
          introduction: string
          core_content: string
          practical_applications: string
          case_studies: string
          assessments: string
          total_word_count: number
          status: string
          priority_level: string
          assigned_to: string
          company_id: string
          created_at: string
          updated_at: string
        }[]
      }
      get_module_content_for_learner: {
        Args: { p_content_id: string }
        Returns: {
          content_id: string
          module_name: string
          module_spec: Json
          introduction: string
          core_content: string
          practical_applications: string
          case_studies: string
          assessments: string
          total_word_count: number
          status: string
          priority_level: string
          company_id: string
          created_at: string
          updated_at: string
        }[]
      }
      get_next_cv_for_processing: {
        Args: { p_processor_id: string }
        Returns: {
          queue_id: string
          session_item_id: string
          cv_file_path: string
          import_session_id: string
        }[]
      }
      get_organization_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_employees: number
          analyzed_employees: number
          departments_count: number
          avg_skills_match: number
          critical_gaps_count: number
          moderate_gaps_count: number
        }[]
      }
      get_pending_import_counts: {
        Args: { p_company_id: string }
        Returns: Json
      }
      get_regeneration_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_session_items_detailed: {
        Args: { p_session_id: string }
        Returns: {
          item_id: string
          employee_name: string
          employee_email: string
          department: string
          position_title: string
          status: string
          created_at: string
          deleted_at: string
          can_undo: boolean
        }[]
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
      get_skills_gaps: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_force_refresh?: boolean
        }
        Returns: Json
      }
      get_skills_insights_from_profile: {
        Args: { p_employee_id: string }
        Returns: Json
      }
      get_spreadsheet_rows: {
        Args: { p_session_id: string }
        Returns: {
          id: string
          import_session_id: string
          employee_name: string
          employee_email: string
          current_position_code: string
          field_values: Json
          status: string
          created_at: string
          last_modified: string
        }[]
      }
      get_top_missing_skills: {
        Args: { gap_limit?: number }
        Returns: {
          skill_name: string
          affected_employees: number
          severity: string
          avg_gap_score: number
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
      has_company_access: {
        Args: { check_company_id: string }
        Returns: boolean
      }
      is_course_editor: {
        Args: { p_user_id: string; p_company_id: string }
        Returns: boolean
      }
      is_major_content_change: {
        Args: { p_old_content: Json; p_new_content: Json }
        Returns: boolean
      }
      migrate_skills_to_unified: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      notify_course_update: {
        Args: {
          p_plan_id: string
          p_editor_name: string
          p_course_title: string
          p_change_summary?: string
        }
        Returns: number
      }
      process_referral: {
        Args: { referrer_id: string }
        Returns: undefined
      }
      refresh_stale_market_benchmarks: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      reset_module_progress_for_major_change: {
        Args: {
          p_content_id: string
          p_module_id: string
          p_plan_id: string
          p_reason?: string
        }
        Returns: number
      }
      restore_regeneration_count: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      save_spreadsheet_cell: {
        Args: { p_item_id: string; p_field: string; p_value: string }
        Returns: Json
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
      soft_delete_row: {
        Args: { p_item_id: string }
        Returns: Json
      }
      take_benchmark_snapshot: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      test_auth_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      test_employee_cv_upload_policy: {
        Args: {
          test_user_id: string
          test_bucket_id: string
          test_file_path: string
        }
        Returns: Json
      }
      test_storage_insert_as_user: {
        Args: {
          test_user_id: string
          test_bucket_id: string
          test_object_name: string
        }
        Returns: Json
      }
      transform_cv_data_fields: {
        Args: { cv_data: Json }
        Returns: Json
      }
      undo_last_operation: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_employee_skills_scores: {
        Args: { p_employee_id: string }
        Returns: undefined
      }
      update_module_section_with_version: {
        Args: {
          p_content_id: string
          p_section_name: string
          p_section_content: string
          p_create_version?: boolean
          p_version_notes?: string
        }
        Returns: string
      }
      update_section_quality: {
        Args: {
          p_content_id: string
          p_section_name: string
          p_quality_score: number
          p_quality_issues: string[]
        }
        Returns: boolean
      }
      update_section_status: {
        Args: { p_content_id: string; p_section_name: string; p_status: string }
        Returns: boolean
      }
      upsert_section_progress: {
        Args: {
          p_assignment_id: string
          p_section_name: string
          p_module_id?: string
          p_completed?: boolean
          p_time_spent_seconds?: number
        }
        Returns: {
          assessment_data: Json | null
          assessment_type: string | null
          assignment_id: string
          attempt_number: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          max_score: number | null
          module_id: string | null
          score: number | null
          section_name: string
          started_at: string | null
          submitted_at: string | null
          time_spent_seconds: number | null
          updated_at: string | null
        }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
