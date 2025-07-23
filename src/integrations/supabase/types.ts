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
      cm_course_plans: {
        Row: {
          agent_turns: number | null
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
            referencedRelation: "v_company_employees"
            referencedColumns: ["id"]
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
            foreignKeyName: "cm_module_content_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "v_company_employees"
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
      cm_research_results: {
        Row: {
          content_library: Json | null
          created_at: string | null
          execution_metrics: Json | null
          module_mappings: Json | null
          plan_id: string | null
          research_agent_version: string | null
          research_findings: Json
          research_id: string
          search_queries: Json[] | null
          session_id: string
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
          execution_metrics?: Json | null
          module_mappings?: Json | null
          plan_id?: string | null
          research_agent_version?: string | null
          research_findings: Json
          research_id?: string
          search_queries?: Json[] | null
          session_id: string
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
          execution_metrics?: Json | null
          module_mappings?: Json | null
          plan_id?: string | null
          research_agent_version?: string | null
          research_findings?: Json
          research_id?: string
          search_queries?: Json[] | null
          session_id?: string
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
          onboarding_mode: string | null
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
          onboarding_mode?: string | null
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
          onboarding_mode?: string | null
          plan_type?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      content_feedback: {
        Row: {
          content_id: string
          created_at: string | null
          feedback_type: string
          id: string
          is_positive: boolean
          section_id: string | null
          timestamp_seconds: number | null
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string | null
          feedback_type: string
          id?: string
          is_positive: boolean
          section_id?: string | null
          timestamp_seconds?: number | null
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string | null
          feedback_type?: string
          id?: string
          is_positive?: boolean
          section_id?: string | null
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
            foreignKeyName: "content_feedback_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "cm_content_sections"
            referencedColumns: ["section_id"]
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
            referencedRelation: "v_company_employees"
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
          assignment_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string | null
          section_name: string
          time_spent_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          assignment_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string | null
          section_name: string
          time_spent_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_id?: string | null
          section_name?: string
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
      chat_messages: {
        Row: {
          id: string
          employee_id: string
          user_id: string
          message_type: string
          content: string
          metadata: Json | null
          step: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          user_id: string
          message_type: string
          content: string
          metadata?: Json | null
          step?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          user_id?: string
          message_type?: string
          content?: string
          metadata?: Json | null
          step?: string | null
          created_at?: string | null
          updated_at?: string | null
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
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      cv_analysis_results: {
        Row: {
          id: string
          employee_id: string
          extracted_skills: Json | null
          work_experience: Json | null
          education: Json | null
          analysis_status: string | null
          analyzed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          extracted_skills?: Json | null
          work_experience?: Json | null
          education?: Json | null
          analysis_status?: string | null
          analyzed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          extracted_skills?: Json | null
          work_experience?: Json | null
          education?: Json | null
          analysis_status?: string | null
          analyzed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cv_analysis_results_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      employee_profile_sections: {
        Row: {
          id: string
          employee_id: string
          section_name: string
          is_complete: boolean | null
          completed_at: string | null
          data: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          section_name: string
          is_complete?: boolean | null
          completed_at?: string | null
          data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          section_name?: string
          is_complete?: boolean | null
          completed_at?: string | null
          data?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_profile_sections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
        ]
      }
      employee_skills_validation: {
        Row: {
          id: string
          employee_id: string
          skill_name: string
          skill_id: string | null
          proficiency_level: number | null
          validation_order: number | null
          is_from_position: boolean | null
          is_from_cv: boolean | null
          validated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          skill_name: string
          skill_id?: string | null
          proficiency_level?: number | null
          validation_order?: number | null
          is_from_position?: boolean | null
          is_from_cv?: boolean | null
          validated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          skill_name?: string
          skill_id?: string | null
          proficiency_level?: number | null
          validation_order?: number | null
          is_from_position?: boolean | null
          is_from_cv?: boolean | null
          validated_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_skills_validation_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          }
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
            referencedRelation: "v_company_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          budget_range: string | null
          company: string
          company_size: string | null
          country: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          job_title: string | null
          last_name: string
          message: string | null
          notes: string | null
          phone: string | null
          processed_at: string | null
          processed_by: string | null
          referral_source: string | null
          source: string | null
          status: string | null
          submitted_at: string | null
          ticket_type: 'demo_request' | 'contact_sales' | 'early_access'
          timeline: string | null
          updated_at: string | null
          use_case: string | null
        }
        Insert: {
          budget_range?: string | null
          company: string
          company_size?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          job_title?: string | null
          last_name: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          referral_source?: string | null
          source?: string | null
          status?: string | null
          submitted_at?: string | null
          ticket_type?: 'demo_request' | 'contact_sales' | 'early_access'
          timeline?: string | null
          updated_at?: string | null
          use_case?: string | null
        }
        Update: {
          budget_range?: string | null
          company?: string
          company_size?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          job_title?: string | null
          last_name?: string
          message?: string | null
          notes?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          referral_source?: string | null
          source?: string | null
          status?: string | null
          submitted_at?: string | null
          ticket_type?: 'demo_request' | 'contact_sales' | 'early_access'
          timeline?: string | null
          updated_at?: string | null
          use_case?: string | null
        }
        Relationships: []
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
            referencedRelation: "v_company_employees"
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
          last_learning_date: string | null
          learning_streak: number | null
          learning_style: Json | null
          manager_id: string | null
          position: string | null
          skill_level: string | null
          skills_last_analyzed: string | null
          target_position_id: string | null
          total_learning_hours: number | null
          updated_at: string | null
          user_id: string | null
          profile_builder_points: number | null
          profile_builder_streak: number | null
          skills_validation_completed: boolean | null
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
          last_learning_date?: string | null
          learning_streak?: number | null
          learning_style?: Json | null
          manager_id?: string | null
          position?: string | null
          skill_level?: string | null
          skills_last_analyzed?: string | null
          target_position_id?: string | null
          total_learning_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
          profile_builder_points?: number | null
          profile_builder_streak?: number | null
          skills_validation_completed?: boolean | null
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
          last_learning_date?: string | null
          learning_streak?: number | null
          learning_style?: Json | null
          manager_id?: string | null
          position?: string | null
          skill_level?: string | null
          skills_last_analyzed?: string | null
          target_position_id?: string | null
          total_learning_hours?: number | null
          updated_at?: string | null
          user_id?: string | null
          profile_builder_points?: number | null
          profile_builder_streak?: number | null
          skills_validation_completed?: boolean | null
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
            referencedRelation: "v_company_employees"
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
      st_analysis_templates: {
        Row: {
          company_id: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          parameters: Json | null
          prompt_template: string
          system_prompt: string | null
          template_name: string
          template_type: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          prompt_template: string
          system_prompt?: string | null
          template_name: string
          template_type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          prompt_template?: string
          system_prompt?: string | null
          template_name?: string
          template_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_analysis_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_analysis_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      st_company_positions: {
        Row: {
          ai_suggestions: Json | null
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
          ai_suggestions?: Json | null
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
          ai_suggestions?: Json | null
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
      st_cv_processing_queue: {
        Row: {
          completed_at: string | null
          cv_file_path: string
          enqueued_at: string | null
          error_details: Json | null
          id: string
          import_session_id: string
          max_retries: number | null
          priority: number | null
          processor_id: string | null
          retry_count: number | null
          session_item_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          cv_file_path: string
          enqueued_at?: string | null
          error_details?: Json | null
          id?: string
          import_session_id: string
          max_retries?: number | null
          priority?: number | null
          processor_id?: string | null
          retry_count?: number | null
          session_item_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          cv_file_path?: string
          enqueued_at?: string | null
          error_details?: Json | null
          id?: string
          import_session_id?: string
          max_retries?: number | null
          priority?: number | null
          processor_id?: string | null
          retry_count?: number | null
          session_item_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_cv_processing_queue_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "st_import_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_cv_processing_queue_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "v_import_session_analytics"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "st_cv_processing_queue_session_item_id_fkey"
            columns: ["session_item_id"]
            isOneToOne: true
            referencedRelation: "st_import_session_items"
            referencedColumns: ["id"]
          },
        ]
      }
      st_employee_skills_profile: {
        Row: {
          analysis_metadata: Json | null
          analyzed_at: string | null
          career_readiness_score: number | null
          certifications: Json | null
          current_position_id: string | null
          cv_file_path: string | null
          cv_summary: string | null
          education_level: string | null
          employee_id: string
          experience_years: number | null
          extracted_skills: Json[] | null
          gap_analysis_completed_at: string | null
          id: string
          industry_experience: Json | null
          languages: Json | null
          projects_summary: string | null
          skills_analysis_version: number | null
          skills_match_score: number | null
          soft_skills: Json | null
          target_position_id: string | null
          technical_skills: Json | null
          updated_at: string | null
        }
        Insert: {
          analysis_metadata?: Json | null
          analyzed_at?: string | null
          career_readiness_score?: number | null
          certifications?: Json | null
          current_position_id?: string | null
          cv_file_path?: string | null
          cv_summary?: string | null
          education_level?: string | null
          employee_id: string
          experience_years?: number | null
          extracted_skills?: Json[] | null
          gap_analysis_completed_at?: string | null
          id?: string
          industry_experience?: Json | null
          languages?: Json | null
          projects_summary?: string | null
          skills_analysis_version?: number | null
          skills_match_score?: number | null
          soft_skills?: Json | null
          target_position_id?: string | null
          technical_skills?: Json | null
          updated_at?: string | null
        }
        Update: {
          analysis_metadata?: Json | null
          analyzed_at?: string | null
          career_readiness_score?: number | null
          certifications?: Json | null
          current_position_id?: string | null
          cv_file_path?: string | null
          cv_summary?: string | null
          education_level?: string | null
          employee_id?: string
          experience_years?: number | null
          extracted_skills?: Json[] | null
          gap_analysis_completed_at?: string | null
          id?: string
          industry_experience?: Json | null
          languages?: Json | null
          projects_summary?: string | null
          skills_analysis_version?: number | null
          skills_match_score?: number | null
          soft_skills?: Json | null
          target_position_id?: string | null
          technical_skills?: Json | null
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
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_employee_skills_profile_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "v_company_employees"
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
          analysis_completed_at: string | null
          analysis_started_at: string | null
          analysis_tokens_used: number | null
          confidence_score: number | null
          created_at: string | null
          current_position_code: string | null
          cv_analysis_result: Json | null
          cv_file_path: string | null
          cv_filename: string | null
          employee_email: string
          employee_id: string | null
          employee_name: string | null
          error_message: string | null
          id: string
          import_session_id: string
          position_match_analysis: Json | null
          processed_at: string | null
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
          employee_email: string
          employee_id?: string | null
          employee_name?: string | null
          error_message?: string | null
          id?: string
          import_session_id: string
          position_match_analysis?: Json | null
          processed_at?: string | null
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
          employee_email?: string
          employee_id?: string | null
          employee_name?: string | null
          error_message?: string | null
          id?: string
          import_session_id?: string
          position_match_analysis?: Json | null
          processed_at?: string | null
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
            referencedRelation: "v_company_employees"
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
            foreignKeyName: "st_import_session_items_import_session_id_fkey"
            columns: ["import_session_id"]
            isOneToOne: false
            referencedRelation: "v_import_session_analytics"
            referencedColumns: ["session_id"]
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
          active_position_id: string | null
          analysis_config: Json | null
          bulk_analysis_status: string | null
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
          session_metadata: Json | null
          status: string | null
          successful: number | null
          total_employees: number
        }
        Insert: {
          active_position_id?: string | null
          analysis_config?: Json | null
          bulk_analysis_status?: string | null
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
          session_metadata?: Json | null
          status?: string | null
          successful?: number | null
          total_employees?: number
        }
        Update: {
          active_position_id?: string | null
          analysis_config?: Json | null
          bulk_analysis_status?: string | null
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
          session_metadata?: Json | null
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
          company_id: string
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
          company_id: string
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
          company_id?: string
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
      st_position_mapping_suggestions: {
        Row: {
          company_id: string
          confidence_score: number
          created_at: string | null
          id: string
          last_used_at: string | null
          metadata: Json | null
          reasoning: string | null
          source_text: string
          suggested_position_id: string | null
        }
        Insert: {
          company_id: string
          confidence_score: number
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          reasoning?: string | null
          source_text: string
          suggested_position_id?: string | null
        }
        Update: {
          company_id?: string
          confidence_score?: number
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          metadata?: Json | null
          reasoning?: string | null
          source_text?: string
          suggested_position_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "st_position_mapping_suggestions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "st_position_mapping_suggestions_suggested_position_id_fkey"
            columns: ["suggested_position_id"]
            isOneToOne: false
            referencedRelation: "st_company_positions"
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
            referencedRelation: "v_company_employees"
            referencedColumns: ["id"]
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
      v_company_employees: {
        Row: {
          career_readiness_score: number | null
          company_id: string | null
          cv_file_path: string | null
          department: string | null
          email: string | null
          full_name: string | null
          gap_analysis_completed_at: string | null
          id: string | null
          is_active: boolean | null
          position: string | null
          skills_last_analyzed: string | null
          skills_match_score: number | null
          user_id: string | null
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
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      v_critical_skills_gaps: {
        Row: {
          avg_proficiency: number | null
          company_id: string | null
          critical_count: number | null
          department: string | null
          employees_with_gap: number | null
          gap_severity: string | null
          moderate_count: number | null
          skill_name: string | null
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
      v_department_skills_summary: {
        Row: {
          analyzed_employees: number | null
          avg_skills_match: number | null
          company_id: string | null
          critical_gaps: number | null
          department: string | null
          exceeding_targets: number | null
          moderate_gaps: number | null
          total_employees: number | null
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
      v_import_session_analytics: {
        Row: {
          active_position_id: string | null
          analyzed_cvs: number | null
          avg_analysis_time_seconds: number | null
          avg_confidence_score: number | null
          company_id: string | null
          completed_at: string | null
          created_at: string | null
          failed: number | null
          import_type: string | null
          position_code: string | null
          position_title: string | null
          session_id: string | null
          session_status: string | null
          successful: number | null
          total_employees: number | null
          total_items: number | null
          total_tokens_used: number | null
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
        ]
      }
      v_skills_trends_monthly: {
        Row: {
          analyses_count: number | null
          analysis_month: string | null
          avg_match_score: number | null
          company_id: string | null
          critical_gaps_count: number | null
          department: string | null
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
    }
    Functions: {
      admin_reset_user_password: {
        Args: { user_email: string; new_password: string }
        Returns: string
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
      check_auth_uid: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_user_exists_by_email: {
        Args: { p_email: string }
        Returns: {
          user_id: string
          user_exists: boolean
        }[]
      }
      cleanup_old_import_files: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      create_session_items_for_employees: {
        Args: { p_session_id: string; p_employee_ids: string[] }
        Returns: number
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
      has_company_access: {
        Args: { check_company_id: string }
        Returns: boolean
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
      upsert_section_progress: {
        Args: {
          p_assignment_id: string
          p_section_name: string
          p_module_id?: string
          p_completed?: boolean
          p_time_spent_seconds?: number
        }
        Returns: {
          assignment_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          module_id: string | null
          section_name: string
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
