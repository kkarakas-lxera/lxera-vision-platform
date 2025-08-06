export interface MarketSkillData {
  skill_name: string;
  match_percentage: number;
  source?: 'ai' | 'cv' | 'verified';
  confidence?: number;
  category?: 'critical' | 'emerging' | 'foundational';
}

export interface DepartmentMarketGap {
  department: string;
  industry: string;
  skills: MarketSkillData[];
  last_updated?: Date;
}

export interface EmployeeMarketGap {
  employee_id: string;
  role: string;
  industry: string;
  skills: MarketSkillData[];
  overall_match: number;
  last_updated?: Date;
}