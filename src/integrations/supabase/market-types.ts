// Market Benchmark Types - Manual definitions for RPC functions and tables
// These are not auto-generated due to Supabase type generation limitations

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

// Extend the Database type with our custom functions
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
        get_top_missing_skills: {
          Args: { company_id: string };
          Returns: TopMissingSkill[];
        };
        get_departments_benchmark_data: {
          Args: Record<string, never>;
          Returns: DepartmentBenchmarkData[];
        };
      };
      Tables: Database['public']['Tables'] & {
        // market_benchmark_cache removed - pure on-demand now!
        market_skills_benchmarks: {
          Row: MarketSkillsBenchmark;
          Insert: Partial<MarketSkillsBenchmark>;
          Update: Partial<MarketSkillsBenchmark>;
          Relationships: [];
        };
      };
    };
  }
}