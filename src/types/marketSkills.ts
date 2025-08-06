export interface MarketSkillData {
  skill_name: string;
  match_percentage: number;
  source?: 'ai' | 'cv' | 'verified';
  confidence?: number;
  category?: 'critical' | 'emerging' | 'foundational';
}

export interface SkillInsight {
  skill_name: string;
  why_crucial: string;
  market_context: string;
  impact_score: number; // 1-10
}

export interface Citation {
  id: number;
  text: string;
  source: string;
  url?: string;
}

export interface MarketInsights {
  executive_summary: string;
  skill_insights: SkillInsight[];
  competitive_positioning: string;
  talent_strategy: string;
  citations: Citation[];
}

export interface DepartmentMarketGap {
  department: string;
  industry: string;
  skills: MarketSkillData[];
  insights?: MarketInsights;
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