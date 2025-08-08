// Market Benchmark Types - Manual definitions for RPC functions and tables
// These are not auto-generated due to Supabase type generation limitations
import type { Database } from './types';

// MarketBenchmarkCache interface removed - no more caching!

export interface MarketSkillsBenchmark {
  id: string;
  role_name: string;
  industry?: string;
  department?: string;
  skills: any;
  metadata?: any;
  source_model?: string;
  generated_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
  last_refresh_attempt?: string;
}

// Extended employee type with market gap fields
export interface EmployeeWithMarketGap {
  market_gap_data?: any;
  market_gap_updated_at?: string;
}

// RPC function return types
export interface OrganizationStats {
  total_employees: number;
  analyzed_employees: number;
  departments_count: number;
  critical_gaps_count: number;
  moderate_gaps_count: number;
}

export interface DepartmentBenchmarkRPCData {
  department: string;
  total_employees: number;
  analyzed_employees: number;
  critical_gaps_count: number;
  moderate_gaps_count: number;
  match_percentage: number;
}

export interface TopMissingSkill {
  skill_name: string;
  affected_employees: number;
  total_employees: number;
  percentage_affected: number;
  severity: string;
}

export interface ActiveBenchmarkConfig {
  role_name: string;
  industry?: string;
  department?: string;
  skills_count: number;
  last_refresh: string;
  expires_at: string;
  is_stale: boolean;
}

// Current-state market match rows
export interface OrganizationMarketMatchCurrentRow {
  company_id: string;
  baseline_id: string | null;
  market_coverage_rate: number;
  industry_alignment_index: number;
  critical_skills_count: number;
  moderate_skills_count: number;
  top_missing_skills: Array<{ skill_name: string; affected_employees?: number; severity?: 'critical' | 'moderate' | 'minor' }>;
  last_computed_at: string;
}

export interface DepartmentMarketMatchCurrentRow {
  company_id: string;
  department: string;
  baseline_id: string | null;
  avg_market_match: number;
  critical_gaps: number;
  emerging_gaps: number;
  top_gaps: Array<{ skill_name: string; gap_percentage: number; category: 'critical' | 'emerging' | 'foundational' }>;
  analyzed_count: number;
  employee_count: number;
  last_computed_at: string;
}

export interface EmployeeMarketMatchCurrentRow {
  company_id: string;
  employee_id: string;
  baseline_id: string | null;
  market_match_percentage: number;
  top_missing_skills: Array<{ skill_name: string; category: 'critical' | 'emerging' | 'foundational'; market_importance: number }>;
  skills_by_source: { ai: number; cv: number; verified: number };
  last_computed_at: string;
}

// Extend the Database type with our custom functions and tables
declare module './types' {
  interface Database {
    public: {
      Functions: Database['public']['Functions'] & {
        refresh_stale_market_benchmarks: {
          Args: Record<string, never>;
          Returns: any;
        };
        get_active_benchmark_configs: {
          Args: Record<string, never>;
          Returns: ActiveBenchmarkConfig[];
        };
        get_organization_stats: {
          Args: Record<string, never>;
          Returns: OrganizationStats;
        };
        // Keep flexible to avoid compile-time drift with DB
        get_top_missing_skills: {
          Args: any;
          Returns: any;
        };
        get_departments_benchmark_data: {
          Args: Record<string, never>;
          Returns: any[];
        };
      };
      Tables: Database['public']['Tables'] & {
        market_skills_benchmarks: {
          Row: MarketSkillsBenchmark;
          Insert: Partial<MarketSkillsBenchmark>;
          Update: Partial<MarketSkillsBenchmark>;
          Relationships: [];
        };
        organization_market_match_current: {
          Row: OrganizationMarketMatchCurrentRow;
          Insert: Partial<OrganizationMarketMatchCurrentRow>;
          Update: Partial<OrganizationMarketMatchCurrentRow>;
          Relationships: [];
        };
        department_market_match_current: {
          Row: DepartmentMarketMatchCurrentRow;
          Insert: Partial<DepartmentMarketMatchCurrentRow>;
          Update: Partial<DepartmentMarketMatchCurrentRow>;
          Relationships: [];
        };
        employee_market_match_current: {
          Row: EmployeeMarketMatchCurrentRow;
          Insert: Partial<EmployeeMarketMatchCurrentRow>;
          Update: Partial<EmployeeMarketMatchCurrentRow>;
          Relationships: [];
        };
      };
    };
  }
}

// Export an augmented Database type that includes our custom tables/functions
export type AugmentedDatabase = Omit<Database, 'public'> & {
  public: {
    Tables: Database['public']['Tables'] & {
      organization_market_match_current: {
        Row: OrganizationMarketMatchCurrentRow;
        Insert: Partial<OrganizationMarketMatchCurrentRow>;
        Update: Partial<OrganizationMarketMatchCurrentRow>;
        Relationships: [];
      };
      department_market_match_current: {
        Row: DepartmentMarketMatchCurrentRow;
        Insert: Partial<DepartmentMarketMatchCurrentRow>;
        Update: Partial<DepartmentMarketMatchCurrentRow>;
        Relationships: [];
      };
      employee_market_match_current: {
        Row: EmployeeMarketMatchCurrentRow;
        Insert: Partial<EmployeeMarketMatchCurrentRow>;
        Update: Partial<EmployeeMarketMatchCurrentRow>;
        Relationships: [];
      };
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'] & {
      refresh_stale_market_benchmarks: {
        Args: Record<string, never>;
        Returns: any;
      };
      get_active_benchmark_configs: {
        Args: Record<string, never>;
        Returns: ActiveBenchmarkConfig[];
      };
      get_organization_stats: {
        Args: Record<string, never>;
        Returns: OrganizationStats;
      };
      get_top_missing_skills: {
        Args: any;
        Returns: any;
      };
      get_departments_benchmark_data: {
        Args: Record<string, never>;
        Returns: any[];
      };
    };
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
};