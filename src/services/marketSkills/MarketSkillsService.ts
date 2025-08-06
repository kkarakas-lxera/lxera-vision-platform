import { supabase } from '@/integrations/supabase/client';
import type { MarketSkillData, DepartmentMarketGap } from '@/types/marketSkills';

interface SkillInsight {
  skill_name: string;
  why_crucial: string;
  market_context: string;
  impact_score: number;
}

interface Citation {
  id: number;
  text: string;
  source: string;
  url?: string;
}

interface MarketInsights {
  executive_summary: string;
  skill_insights: SkillInsight[];
  competitive_positioning: string;
  talent_strategy: string;
  citations: Citation[];
}

interface MarketBenchmarkResponse {
  skills: MarketSkillData[];
  insights?: MarketInsights;
  cached: boolean;
  generated_at?: string;
  expires_at?: string;
}

interface InternalSkill {
  skill_name: string;
  proficiency_level?: number;
  source?: 'ai' | 'cv' | 'verified';
}

interface OrganizationBenchmarkData {
  market_coverage_rate: number;
  industry_alignment_index: number;
  top_missing_skills: Array<{
    skill_name: string;
    affected_employees: number;
    severity: 'critical' | 'moderate' | 'minor';
  }>;
  total_employees: number;
  analyzed_employees: number;
  departments_count: number;
}

interface DepartmentBenchmarkData {
  department: string;
  benchmark_health_score: number; // 0-10
  impact_score: number; // 0-10
  market_skill_breakdown: {
    critical: number;
    emerging: number;
    foundational: number;
  };
  employee_count: number;
  analyzed_count: number;
  avg_market_match: number;
  top_gaps: Array<{
    skill_name: string;
    gap_percentage: number;
    category: 'critical' | 'emerging' | 'foundational';
  }>;
}

interface EmployeeBenchmarkData {
  employee_id: string;
  name: string;
  department: string;
  position: string;
  market_match_percentage: number;
  critical_gaps_count: number;
  skills_by_source: {
    ai: number;
    cv: number;
    verified: number;
  };
  top_missing_skills: Array<{
    skill_name: string;
    category: 'critical' | 'emerging' | 'foundational';
    market_importance: number;
  }>;
  last_analyzed: Date | null;
}

interface ComprehensiveBenchmarkData {
  organization: OrganizationBenchmarkData;
  departments: DepartmentBenchmarkData[];
  employees: EmployeeBenchmarkData[];
  generated_at: Date;
}

export class MarketSkillsService {
  /**
   * Fetch market benchmarks for a specific role/industry/department
   */
  async fetchMarketBenchmarks(
    role: string,
    industry?: string,
    department?: string,
    forceRefresh = false,
    includeInsights = false,
    companyContext?: any
  ): Promise<MarketBenchmarkResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-market-benchmarks', {
        body: { 
          role, 
          industry, 
          department, 
          force_refresh: forceRefresh,
          include_insights: includeInsights,
          company_context: companyContext
        }
      });

      if (error) {
        console.error('Error fetching market benchmarks:', error);
        throw error;
      }

      return data as MarketBenchmarkResponse;
    } catch (error) {
      console.error('MarketSkillsService error:', error);
      // Return empty skills on error
      return { skills: [], cached: false };
    }
  }

  /**
   * Compare internal skills with market benchmarks
   */
  public compareWithInternal(
    marketSkills: MarketSkillData[],
    internalSkills: InternalSkill[]
  ): MarketSkillData[] {
    // Create a map of internal skills for quick lookup
    const internalSkillsMap = new Map<string, InternalSkill>();
    internalSkills.forEach(skill => {
      if (skill.skill_name) {
        internalSkillsMap.set(skill.skill_name.toLowerCase(), skill);
      }
    });

    // Match market skills with internal skills
    return marketSkills.map(marketSkill => {
      const internalMatch = this.findMatchingSkill(marketSkill.skill_name, internalSkillsMap);
      
      if (internalMatch) {
        // Calculate actual match percentage based on proficiency
        const proficiencyScore = internalMatch.proficiency_level || 0;
        const actualMatch = Math.round((proficiencyScore / 5) * 100); // Assuming 5-level scale
        
        return {
          ...marketSkill,
          match_percentage: actualMatch,
          source: internalMatch.source
        };
      }
      
      // No internal match - skill is missing
      return {
        ...marketSkill,
        match_percentage: 0,
        source: undefined
      };
    });
  }

  /**
   * Fuzzy match skill names
   */
  private findMatchingSkill(
    marketSkillName: string,
    internalSkillsMap: Map<string, InternalSkill>
  ): InternalSkill | null {
    const normalizedMarket = marketSkillName.toLowerCase().trim();
    
    // Exact match
    if (internalSkillsMap.has(normalizedMarket)) {
      return internalSkillsMap.get(normalizedMarket)!;
    }

    // Try common variations
    const variations = [
      normalizedMarket.replace('.js', ''),
      normalizedMarket.replace('js', 'javascript'),
      normalizedMarket.replace(/\s+/g, ''),
      normalizedMarket.split(' ')[0] // First word only
    ];

    for (const variation of variations) {
      if (internalSkillsMap.has(variation)) {
        return internalSkillsMap.get(variation)!;
      }
    }

    // Partial match
    for (const [skillName, skill] of internalSkillsMap.entries()) {
      if (skillName.includes(normalizedMarket) || normalizedMarket.includes(skillName)) {
        return skill;
      }
    }

    return null;
  }

  /**
   * Get department-level market gaps
   */
  async getDepartmentMarketGaps(
    department: string,
    industry?: string,
    employeeSkills: InternalSkill[],
    companyContext?: {
      employees_count?: number;
      analyzed_count?: number;
      critical_gaps?: number;
      moderate_gaps?: number;
    },
    forceRefresh = false
  ): Promise<DepartmentMarketGap> {
    // Use department name as a proxy for role
    const benchmarks = await this.fetchMarketBenchmarks(
      department, 
      industry, 
      department, 
      forceRefresh,
      true, // Include insights
      companyContext
    );
    
    // Compare with aggregated employee skills
    const comparedSkills = this.compareWithInternal(benchmarks.skills, employeeSkills);
    
    // Use generated_at from benchmarks if available, otherwise use current date
    const lastUpdated = benchmarks.generated_at 
      ? new Date(benchmarks.generated_at)
      : new Date();
    
    return {
      department,
      industry: industry || 'General',
      skills: comparedSkills,
      insights: benchmarks.insights,
      last_updated: lastUpdated
    };
  }

  /**
   * Calculate average match score for a set of skills
   */
  calculateAverageMatch(skills: MarketSkillData[]): number {
    if (skills.length === 0) return 0;
    
    const totalMatch = skills.reduce((sum, skill) => sum + skill.match_percentage, 0);
    return Math.round(totalMatch / skills.length);
  }

  /**
   * Get critical gaps (skills with low match percentage)
   */
  getCriticalGaps(skills: MarketSkillData[], threshold = 50): MarketSkillData[] {
    return skills.filter(skill => 
      skill.match_percentage < threshold && 
      skill.category === 'critical'
    );
  }

  /**
   * Check and refresh stale market benchmarks
   * Should be called periodically (e.g., daily) to ensure data freshness
   */
  async refreshStaleBenchmarks(): Promise<void> {
    try {
      // Skip if refresh_stale_market_benchmarks doesn't exist
      // TODO: Deploy the refresh_stale_market_benchmarks function if needed
      console.log('Skipping stale benchmark refresh - function not deployed');
      return;
      
      // Get benchmarks that need refreshing
      const { data: staleConfigs, error } = await supabase
        .rpc('refresh_stale_market_benchmarks');

      if (error) {
        console.error('Error fetching stale benchmarks:', error);
        return;
      }

      if (!staleConfigs || staleConfigs.length === 0) {
        console.log('No stale benchmarks to refresh');
        return;
      }

      console.log(`Found ${staleConfigs.length} stale benchmark configurations to refresh`);

      // Refresh each stale configuration
      for (const config of staleConfigs) {
        try {
          await this.fetchMarketBenchmarks(
            config.role_name,
            config.industry,
            config.department,
            true // Force refresh
          );
          console.log(`Refreshed benchmark for ${config.role_name} - ${config.industry || 'all industries'} - ${config.department || 'all departments'}`);
        } catch (error) {
          console.error(`Failed to refresh benchmark for ${config.role_name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in refreshStaleBenchmarks:', error);
    }
  }

  /**
   * Get all active benchmark configurations with their refresh status
   */
  async getBenchmarkRefreshStatus(): Promise<any[]> {
    // Skip if get_active_benchmark_configs doesn't exist
    // TODO: Deploy the get_active_benchmark_configs function if needed
    console.log('Skipping benchmark config fetch - function not deployed');
    return [];
    
    const { data, error } = await supabase
      .rpc('get_active_benchmark_configs');

    if (error) {
      console.error('Error fetching benchmark configs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get employee-level market gaps with caching
   */
  async getEmployeeMarketGaps(
    employeeId: string,
    position: string,
    industry?: string,
    employeeSkills: InternalSkill[] = []
  ): Promise<MarketSkillData[]> {
    try {
      // Check for cached data first
      const { data: cachedData } = await supabase
        .from('employees')
        .select('market_gap_data, market_gap_updated_at')
        .eq('id', employeeId)
        .single();

      // If cached data exists and is less than 14 days old, use it
      if (cachedData?.market_gap_data && cachedData.market_gap_updated_at) {
        const cacheAge = Date.now() - new Date(cachedData.market_gap_updated_at).getTime();
        const fourteenDays = 14 * 24 * 60 * 60 * 1000;
        
        if (cacheAge < fourteenDays) {
          return cachedData.market_gap_data as MarketSkillData[];
        }
      }

      // Fetch fresh benchmarks
      const benchmarks = await this.fetchMarketBenchmarks(position, industry);
      
      // Compare with employee skills
      const comparedSkills = this.compareWithInternal(benchmarks.skills, employeeSkills);
      
      // Cache the results
      await supabase
        .from('employees')
        .update({
          market_gap_data: comparedSkills,
          market_gap_updated_at: new Date().toISOString()
        })
        .eq('id', employeeId);
      
      return comparedSkills;
    } catch (error) {
      console.error('Error getting employee market gaps:', error);
      return [];
    }
  }

  /**
   * Get organization-level benchmark data
   */
  async getOrganizationBenchmark(): Promise<OrganizationBenchmarkData & { executive_summary?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Get organization stats from RPC function (handles company ID resolution)
      const { data: stats, error: statsError } = await supabase
        .rpc('get_organization_stats');

      if (statsError) {
        console.error('Error fetching organization stats:', statsError);
        throw statsError;
      }

      // Get the user's actual company_id
      const { data: userDetails } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userData.user.id)
        .single();
      
      // Determine the actual company_id (could be user's company_id or the user id itself for admins)
      let companyId = userDetails?.company_id;
      if (!companyId) {
        // Check if user ID is itself a company (admin case)
        const { data: companyCheck } = await supabase
          .from('companies')
          .select('id')
          .eq('id', userData.user.id)
          .single();
        
        if (companyCheck) {
          companyId = userData.user.id;
        } else {
          // Check if user is an employee
          const { data: employeeCheck } = await supabase
            .from('employees')
            .select('company_id')
            .eq('user_id', userData.user.id)
            .single();
          
          companyId = employeeCheck?.company_id;
        }
      }

      if (!companyId) {
        console.warn('Could not determine company ID for user');
        return {
          market_coverage_rate: 0,
          industry_alignment_index: 0,
          top_missing_skills: [],
          total_employees: stats?.total_employees || 0,
          analyzed_employees: stats?.analyzed_employees || 0,
          departments_count: stats?.departments_count || 0
        };
      }

      // Get aggregated skills data
      const { data: skillsData, error: skillsError } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          extracted_skills,
          skills_match_score,
          employee:employees!inner(
            department,
            current_position:st_company_positions!employees_current_position_id_fkey(position_title),
            company_id
          )
        `)
        .eq('employee.company_id', companyId);

      if (skillsError) {
        console.error('Error fetching skills data:', skillsError);
        throw skillsError;
      }

      // Calculate market coverage and alignment
      const totalSkills = new Set<string>();
      const marketAlignedSkills = new Set<string>();
      let totalMatchScore = 0;
      let validScores = 0;

      skillsData?.forEach(profile => {
        if (profile.extracted_skills && Array.isArray(profile.extracted_skills)) {
          profile.extracted_skills.forEach((skill: any) => {
            if (skill.skill_name) {
              totalSkills.add(skill.skill_name.toLowerCase());
              if (skill.market_aligned) {
                marketAlignedSkills.add(skill.skill_name.toLowerCase());
              }
            }
          });
        }
        
        if (profile.skills_match_score !== null) {
          totalMatchScore += profile.skills_match_score;
          validScores++;
        }
      });

      const marketCoverageRate = totalSkills.size > 0 
        ? Math.round((marketAlignedSkills.size / totalSkills.size) * 100)
        : 0;

      const industryAlignmentIndex = validScores > 0 
        ? Math.round((totalMatchScore / validScores) / 10) // Convert to 0-10 scale
        : 0;

      // Get top missing skills
      const { data: missingSkills, error: missingError } = await supabase
        .rpc('get_top_missing_skills', { limit: 10 });

      if (missingError) {
        console.warn('Could not fetch missing skills:', missingError);
      }

      const topMissingSkills = (missingSkills || []).map((skill: any) => ({
        skill_name: skill.skill_name,
        affected_employees: skill.affected_count || 0,
        severity: skill.affected_count > stats.total_employees * 0.5 ? 'critical' as const :
                 skill.affected_count > stats.total_employees * 0.33 ? 'moderate' as const :
                 'minor' as const
      }));

      // Generate AI executive summary
      let executiveSummary: string | undefined;
      try {
        const { data: aiSummary } = await supabase.functions.invoke('generate-organization-summary', {
          body: {
            market_coverage_rate: marketCoverageRate,
            industry_alignment_index: industryAlignmentIndex,
            top_missing_skills: topMissingSkills,
            organization_stats: stats
          }
        });
        executiveSummary = aiSummary?.summary;
      } catch (error) {
        console.warn('Could not generate AI summary:', error);
      }

      return {
        market_coverage_rate: marketCoverageRate,
        industry_alignment_index: industryAlignmentIndex,
        top_missing_skills: topMissingSkills,
        total_employees: stats?.total_employees || 0,
        analyzed_employees: stats?.analyzed_employees || 0,
        departments_count: stats?.departments_count || 0,
        executive_summary: executiveSummary
      };
    } catch (error) {
      console.error('Error getting organization benchmark:', error);
      // Return empty data on error
      return {
        market_coverage_rate: 0,
        industry_alignment_index: 0,
        top_missing_skills: [],
        total_employees: 0,
        analyzed_employees: 0,
        departments_count: 0
      };
    }
  }

  /**
   * Get departments benchmark data
   */
  async getDepartmentsBenchmark(): Promise<(DepartmentBenchmarkData & { ai_explanation?: string })[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Get department stats from RPC function (handles company ID resolution)
      const { data: deptStats, error: statsError } = await supabase
        .rpc('get_departments_benchmark_data');

      if (statsError) {
        console.error('Error fetching department stats:', statsError);
        throw statsError;
      }

      // Process each department
      const departmentBenchmarks: (DepartmentBenchmarkData & { ai_explanation?: string })[] = [];

      for (const dept of deptStats || []) {
        // Calculate analyzed percentage
        const analyzed_percentage = dept.employee_count > 0 
          ? (dept.analyzed_count / dept.employee_count) * 100 
          : 0;

        // Calculate benchmark health score (0-10)
        const benchmarkHealthScore = Math.min(10, Math.round(
          (dept.avg_skills_match || 0) / 10 +
          Math.max(0, 5 - (dept.critical_gaps || 0)) +
          analyzed_percentage / 20
        ));

        // Calculate impact score based on employee count and gaps
        const impactScore = Math.min(10, Math.round(
          (dept.employee_count || 0) / 10 +
          (dept.critical_gaps || 0) * 2 +
          (100 - (dept.avg_skills_match || 0)) / 10
        ));

        // Use the critical and emerging gaps from the main query as breakdown
        const marketSkillBreakdown = {
          critical: dept.critical_gaps || 0,
          emerging: dept.emerging_gaps || 0,
          foundational: 0 // Not tracked in current implementation
        };

        // Create simplified top gaps based on available data
        const processedTopGaps = dept.critical_gaps > 0 ? [{
          skill_name: 'Skills Assessment Needed',
          gap_percentage: 100 - (dept.avg_skills_match || 0),
          category: 'critical' as const
        }] : [];

        // Generate simple AI explanation based on scores
        let aiExplanation: string | undefined;
        if (impactScore >= 7) {
          aiExplanation = `${dept.department} has high impact potential with ${dept.critical_gaps || 0} critical gaps affecting ${dept.employee_count} employees. Immediate attention recommended.`;
        } else if (impactScore >= 4) {
          aiExplanation = `${dept.department} shows moderate impact with ${dept.analyzed_count} of ${dept.employee_count} employees analyzed. Focus on closing critical gaps to improve market alignment.`;
        } else {
          aiExplanation = `${dept.department} is relatively well-positioned with ${Math.round(dept.avg_skills_match || 0)}% average skills match. Continue monitoring for emerging skill requirements.`;
        }

        departmentBenchmarks.push({
          department: dept.department,
          benchmark_health_score: benchmarkHealthScore,
          impact_score: impactScore,
          market_skill_breakdown: marketSkillBreakdown,
          employee_count: dept.employee_count || 0,
          analyzed_count: dept.analyzed_count || 0,
          avg_market_match: dept.avg_skills_match || 0,
          top_gaps: processedTopGaps,
          ai_explanation: aiExplanation
        });
      }

      return departmentBenchmarks;
    } catch (error) {
      console.error('Error getting departments benchmark:', error);
      return [];
    }
  }

  /**
   * Get employees benchmark data
   */
  async getEmployeesBenchmark(): Promise<EmployeeBenchmarkData[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Get employee benchmark data
      const { data: employeesData, error } = await supabase
        .from('employees')
        .select(`
          id,
          email,
          department,
          current_position:st_company_positions!employees_current_position_id_fkey(position_title),
          st_employee_skills_profile(
            skills_match_score,
            extracted_skills,
            gap_analysis_completed_at
          )
        `)
        .not('st_employee_skills_profile', 'is', null);

      if (error) {
        console.error('Error fetching employees data:', error);
        throw error;
      }

      // Process each employee
      const employeeBenchmarks: EmployeeBenchmarkData[] = [];

      for (const emp of employeesData || []) {
        const profile = emp.st_employee_skills_profile?.[0];
        if (!profile) continue;

        // Extract name from email if not available
        const name = emp.email.split('@')[0].replace(/[._]/g, ' ');
        
        // Calculate skills by source
        const skillsBySource = { ai: 0, cv: 0, verified: 0 };
        const topMissingSkills: EmployeeBenchmarkData['top_missing_skills'] = [];
        let criticalGapsCount = 0;

        if (profile.extracted_skills && Array.isArray(profile.extracted_skills)) {
          profile.extracted_skills.forEach((skill: any) => {
            const source = skill.source || 'ai';
            if (source in skillsBySource) {
              skillsBySource[source as keyof typeof skillsBySource]++;
            }

            // Check for gaps (missing or low proficiency skills)
            if (!skill.proficiency_level || skill.proficiency_level < 2) {
              const category = skill.market_importance > 8 ? 'critical' as const :
                             skill.market_importance > 5 ? 'emerging' as const :
                             'foundational' as const;
              
              if (category === 'critical') criticalGapsCount++;
              
              if (topMissingSkills.length < 5) {
                topMissingSkills.push({
                  skill_name: skill.skill_name,
                  category,
                  market_importance: skill.market_importance || 0
                });
              }
            }
          });
        }

        employeeBenchmarks.push({
          employee_id: emp.id,
          name,
          department: emp.department || 'Unknown',
          position: emp.current_position?.position_title || 'Unknown',
          market_match_percentage: profile.skills_match_score || 0,
          critical_gaps_count: criticalGapsCount,
          skills_by_source: skillsBySource,
          top_missing_skills: topMissingSkills,
          last_analyzed: profile.gap_analysis_completed_at 
            ? new Date(profile.gap_analysis_completed_at)
            : null
        });
      }

      return employeeBenchmarks;
    } catch (error) {
      console.error('Error getting employees benchmark:', error);
      return [];
    }
  }

  /**
   * Get comprehensive benchmark data combining all levels
   */
  async getComprehensiveBenchmark(): Promise<ComprehensiveBenchmarkData> {
    try {
      // Fetch all benchmark data in parallel
      const [organization, departments, employees] = await Promise.all([
        this.getOrganizationBenchmark(),
        this.getDepartmentsBenchmark(),
        this.getEmployeesBenchmark()
      ]);

      return {
        organization,
        departments,
        employees,
        generated_at: new Date()
      };
    } catch (error) {
      console.error('Error getting comprehensive benchmark:', error);
      // Return empty data structure on error
      return {
        organization: {
          market_coverage_rate: 0,
          industry_alignment_index: 0,
          top_missing_skills: [],
          total_employees: 0,
          analyzed_employees: 0,
          departments_count: 0
        },
        departments: [],
        employees: [],
        generated_at: new Date()
      };
    }
  }

  /**
   * Utility method to check if benchmarks need refresh
   */
  private fuzzyMatch(str1: string, str2: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_.]/g, '');
    return normalize(str1) === normalize(str2);
  }
}

// Export singleton instance
export const marketSkillsService = new MarketSkillsService();