import { supabase } from '@/integrations/supabase/client';
import type { MarketSkillData, DepartmentMarketGap } from '@/types/marketSkills';
import type { ExtractedSkill } from '@/types/skills';
// Import market benchmark types for RPC functions

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
    affected_percentage?: number;
    severity: 'critical' | 'moderate' | 'minor';
  }>;
  critical_skills_count?: number;
  moderate_skills_count?: number;
  minor_skills_count?: number;
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
  private auditLog: Array<{ timestamp: Date; step: string; data: any }> = [];
  private debugMode: boolean = false;
  
  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    if (enabled) {
      console.log('🔍 Market Benchmark Debug Mode: ENABLED');
    }
  }
  
  /**
   * Add entry to audit log
   */
  private logAudit(step: string, data: any): void {
    const entry = {
      timestamp: new Date(),
      step,
      data: { ...data }
    };
    
    this.auditLog.push(entry);
    
    if (this.debugMode) {
      console.log(`[AUDIT] ${step}:`, data);
    }
    
    // Keep only last 100 entries to prevent memory issues
    if (this.auditLog.length > 100) {
      this.auditLog = this.auditLog.slice(-100);
    }
  }
  
  /**
   * Get audit log entries
   */
  getAuditLog(): Array<{ timestamp: Date; step: string; data: any }> {
    return [...this.auditLog];
  }
  
  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    this.auditLog = [];
  }
  
  /**
   * Standardized method to count analyzed employees
   * An employee is considered "analyzed" if they have:
   * 1. A skills profile with analyzed_at timestamp, OR
   * 2. skills_last_analyzed timestamp in employees table
   */
  private isEmployeeAnalyzed(employee: {
    skills_profile?: {
      analyzed_at?: string | null;
      gap_analysis_completed_at?: string | null;
    } | null;
    skills_last_analyzed?: string | null;
  }): boolean {
    return !!(
      employee.skills_profile?.analyzed_at || 
      employee.skills_profile?.gap_analysis_completed_at ||
      employee.skills_last_analyzed
    );
  }
  
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
    // Ensure parameters are arrays
    if (!Array.isArray(marketSkills)) {
      console.warn('compareWithInternal: marketSkills is not an array', marketSkills);
      return [];
    }
    if (!Array.isArray(internalSkills)) {
      console.warn('compareWithInternal: internalSkills is not an array', internalSkills);
      return marketSkills; // Return market skills unchanged if no internal skills to compare
    }
    
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
    employeeSkills: InternalSkill[],
    industry?: string,
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
      // Refresh stale market benchmarks via RPC
      // @ts-ignore - RPC function exists but types not generated
      const { data: staleConfigs, error: staleError } = await supabase.rpc('refresh_stale_market_benchmarks');
      if (staleError) {
        console.error('Error fetching stale benchmarks:', staleError);
        return;
      }

      const configs = staleConfigs as any[];
      if (!configs || configs.length === 0) {
        console.log('No stale benchmarks to refresh');
        return;
      }

      console.log(`Found ${configs.length} stale benchmark configurations to refresh`);

      // Refresh each stale configuration
      for (const config of configs) {
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
    // @ts-ignore - RPC function exists but types not generated
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
          return cachedData.market_gap_data as unknown as MarketSkillData[];
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
          market_gap_data: comparedSkills as unknown as any,
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
      // @ts-ignore - RPC function exists but types not generated
      const { data: stats, error: statsError } = await supabase
        .rpc('get_organization_stats');

      if (statsError) {
        console.error('Error fetching organization stats:', statsError);
        throw statsError;
      }

      // RPC returns single object, not array
      const orgStats = Array.isArray(stats) ? stats[0] : stats;

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
          critical_skills_count: 0,
          moderate_skills_count: 0,
          minor_skills_count: 0,
          total_employees: orgStats?.total_employees || 0,
          analyzed_employees: orgStats?.analyzed_employees || 0,
          departments_count: orgStats?.departments_count || 0
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

      // Calculate market coverage and alignment based on skills match scores
      let totalMatchScore = 0;
      let validScores = 0;
      let totalProficiencySum = 0;
      let skillCount = 0;
      let employeesWithHighSkills = 0;
      let totalEmployeesAnalyzed = 0;
      
      this.logAudit('Starting calculations', {
        totalEmployees: orgStats?.total_employees,
        analyzedEmployees: orgStats?.analyzed_employees,
        skillsDataCount: skillsData?.length
      });

      skillsData?.forEach(profile => {
        // Standardized check: employee is analyzed if they have extracted skills
        const isAnalyzed = profile.extracted_skills && 
                          Array.isArray(profile.extracted_skills) && 
                          profile.extracted_skills.length > 0;
        
        if (isAnalyzed) {
          totalEmployeesAnalyzed++;
          
          let employeeSkillSum = 0;
          let employeeSkillCount = 0;
          
          (profile.extracted_skills as unknown as ExtractedSkill[]).forEach((skill: ExtractedSkill) => {
            if (skill.skill_name && typeof skill.proficiency_level === 'number') {
              // Calculate coverage based on proficiency levels (0-5 scale)
              totalProficiencySum += skill.proficiency_level;
              employeeSkillSum += skill.proficiency_level;
              skillCount++;
              employeeSkillCount++;
            }
          });
          
          // Track employees with high skill levels (avg proficiency >= 3)
          if (employeeSkillCount > 0) {
            const avgProficiency = employeeSkillSum / employeeSkillCount;
            if (avgProficiency >= 3) {
              employeesWithHighSkills++;
            }
          }
        }
        
        if (profile.skills_match_score !== null && profile.skills_match_score !== undefined) {
          // Validate and clamp skills_match_score to 0-100 range
          const score = Number(profile.skills_match_score);
          const validatedScore = Math.min(100, Math.max(0, score));
          
          // Log warning if score was out of expected range
          if (score < 0 || score > 100) {
            console.warn(`Invalid skills_match_score ${score} for profile, clamped to ${validatedScore}`);
          }
          
          totalMatchScore += validatedScore;
          validScores++;
        }
      });

      // Market coverage: Percentage of employees with adequate skills (proficiency >= 3)
      // This better represents organizational readiness
      const marketCoverageRate = totalEmployeesAnalyzed > 0 
        ? Math.round((employeesWithHighSkills / totalEmployeesAnalyzed) * 100)
        : 0;

      // Industry alignment: Average of skills match scores on 0-10 scale
      // Using a more nuanced calculation that considers the distribution
      const avgMatchScore = validScores > 0 ? totalMatchScore / validScores : 0;
      // Fix: Ensure proper conversion from 0-100 to 0-10 scale
      // If avgMatchScore is 50%, we want 5.0/10, not 0.5/10
      const industryAlignmentIndex = validScores > 0 
        ? Math.min(10, Math.max(0, Math.round((avgMatchScore / 100) * 10)))
        : 0;
      
      this.logAudit('Coverage and Alignment calculated', {
        totalEmployeesAnalyzed,
        employeesWithHighSkills,
        marketCoverageRate,
        totalMatchScore,
        validScores,
        avgMatchScore,
        industryAlignmentIndex,
        statsAnalyzedEmployees: orgStats?.analyzed_employees, // Log the RPC value for comparison
        skillsDataCount: skillsData?.length
      });
      
      console.log('Employee analysis discrepancy check:', {
        calculatedAnalyzed: totalEmployeesAnalyzed,
        rpcAnalyzed: orgStats?.analyzed_employees,
        skillsProfiles: skillsData?.length
      });

      // Get top missing skills
      // @ts-ignore - RPC function exists but types not generated
      const { data: missingSkills, error: missingError } = await supabase
        .rpc('get_top_missing_skills', { gap_limit: 10 });

      if (missingError) {
        console.warn('Could not fetch missing skills:', missingError);
      }

      // Standardize severity classification across the platform
      // Critical: >50% of employees affected
      // Moderate: >33% but <=50% of employees affected  
      // Minor: <=33% of employees affected
      const totalEmployees = orgStats?.total_employees || 1;
      const topMissingSkills = ((missingSkills || []) as any[]).map((skill: any) => {
        const affectedCount = skill.affected_employees || skill.affected_count || 0;
        const affectedPercentage = (affectedCount / totalEmployees) * 100;
        
        // Use consistent thresholds for severity classification
        let severity: 'critical' | 'moderate' | 'minor';
        if (affectedPercentage > 50) {
          severity = 'critical';
        } else if (affectedPercentage > 33) {
          severity = 'moderate';
        } else {
          severity = 'minor';
        }
        
        return {
          skill_name: skill.skill_name,
          affected_employees: affectedCount,
          affected_percentage: Math.round(affectedPercentage),
          severity: skill.severity || severity // Use DB severity if available, otherwise calculate
        };
      });
      
      // Count skills by severity for consistent display
      const criticalSkillsCount = topMissingSkills.filter(s => s.severity === 'critical').length;
      const moderateSkillsCount = topMissingSkills.filter(s => s.severity === 'moderate').length;
      const minorSkillsCount = topMissingSkills.filter(s => s.severity === 'minor').length;
      
      this.logAudit('Missing skills analyzed', {
        totalMissingSkills: topMissingSkills.length,
        criticalSkillsCount,
        moderateSkillsCount,
        minorSkillsCount,
        topSkills: topMissingSkills.slice(0, 3).map(s => ({
          name: s.skill_name,
          severity: s.severity,
          affected: s.affected_employees
        }))
      });

      // Generate AI executive summary using existing market benchmarks function
      let executiveSummary: string | undefined;
      
      try {
        // Get company industry if available
        const { data: companyData } = await supabase
          .from('companies')
          .select('settings')
          .eq('id', companyId)
          .single();
        
        const industry = (companyData?.settings as any)?.industry as string | undefined;
        
        // Get primary department if available
        const { data: primaryDept } = await supabase
          .from('employees')
          .select('department')
          .eq('company_id', companyId)
          .not('department', 'is', null)
          .limit(1)
          .single();
        
        // Use existing fetchMarketBenchmarks with insights enabled
        const benchmarkResponse = await this.fetchMarketBenchmarks(
          'General Manager', // Use a generic role instead of 'organization'
          industry || 'General',
          primaryDept?.department || 'General Operations',
          false,
          true, // include_insights = true
          {
            employees_count: orgStats?.total_employees,
            analyzed_count: orgStats?.analyzed_employees,
            critical_gaps: orgStats?.critical_gaps_count,
            moderate_gaps: orgStats?.moderate_gaps_count
          }
        );
        
        executiveSummary = benchmarkResponse.insights?.executive_summary;
      } catch (error) {
        console.warn('Could not generate AI summary:', error);
      }
      
      // Fallback to basic summary if AI generation fails
      if (!executiveSummary && totalEmployeesAnalyzed > 0) {
        executiveSummary = `Your organization has analyzed ${totalEmployeesAnalyzed} of ${orgStats?.total_employees || 0} employees across ${orgStats?.departments_count || 0} departments. ` +
          `Current market coverage is at ${marketCoverageRate}% with an industry alignment index of ${industryAlignmentIndex}/10. ` +
          `Focus on addressing ${topMissingSkills.length} critical skill gaps to improve market competitiveness.`;
      }

      return {
        market_coverage_rate: marketCoverageRate,
        industry_alignment_index: industryAlignmentIndex,
        top_missing_skills: topMissingSkills,
        critical_skills_count: criticalSkillsCount,
        moderate_skills_count: moderateSkillsCount,
        minor_skills_count: minorSkillsCount,
        total_employees: orgStats?.total_employees || 0,
        analyzed_employees: totalEmployeesAnalyzed, // Use our calculated value, not the RPC value
        departments_count: orgStats?.departments_count || 0,
        executive_summary: executiveSummary
      };
    } catch (error) {
      console.error('Error getting organization benchmark:', error);
      // Return empty data on error
      return {
        market_coverage_rate: 0,
        industry_alignment_index: 0,
        top_missing_skills: [],
        critical_skills_count: 0,
        moderate_skills_count: 0,
        minor_skills_count: 0,
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
      // @ts-ignore - RPC function not in generated types
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
        // Higher score = better health
        // Based on: skills match, gap reduction, and analysis coverage
        // Fix: Ensure very low match scores cap the overall health score
        const skillsMatch = dept.avg_skills_match || 0;
        const baseHealthScore = 
          (skillsMatch / 100) * 4 +  // 40% weight on skills match (0-4 points)
          Math.max(0, 3 - (dept.critical_gaps || 0) * 0.5) + // 30% weight on few gaps (0-3 points)
          (analyzed_percentage / 100) * 3;  // 30% weight on analysis coverage (0-3 points)
        
        // Apply cap based on match percentage to ensure logical consistency
        // If match < 10%, cap health at 2.0
        // If match < 25%, cap health at 3.5
        // If match < 40%, cap health at 5.0
        let healthScoreCap = 10;
        if (skillsMatch < 10) {
          healthScoreCap = 2.0;
        } else if (skillsMatch < 25) {
          healthScoreCap = 3.5;
        } else if (skillsMatch < 40) {
          healthScoreCap = 5.0;
        }
        
        const benchmarkHealthScore = Math.min(healthScoreCap, Math.round(baseHealthScore));

        // Calculate impact score based on business risk
        // Higher score = higher risk/impact if not addressed
        // Based on: size of department, number of gaps, and skills deficit
        const gapSeverity = dept.critical_gaps || 0;
        const skillsDeficit = 100 - (dept.avg_skills_match || 0);
        const sizeImpact = Math.min(dept.employee_count || 0, 20) / 20; // Normalize to 0-1
        
        const impactScore = Math.round(
          (gapSeverity / 3) * 3 +  // Critical gaps impact (0-3 points)
          (skillsDeficit / 100) * 4 +  // Skills deficit impact (0-4 points)
          sizeImpact * 3  // Department size impact (0-3 points)
        );

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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      console.log('Getting employee benchmark for user:', userData.user.id);

      // Get the user's company_id first
      const { data: userDetails } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', userData.user.id)
        .single();
      
      console.log('User details:', userDetails);
      
      // Determine the actual company_id
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
          console.log('User is a company admin, using user ID as company ID');
        } else {
          // Check if user is an employee
          const { data: employeeCheck } = await supabase
            .from('employees')
            .select('company_id')
            .eq('user_id', userData.user.id)
            .single();
          
          companyId = employeeCheck?.company_id;
          console.log('User is an employee, company_id from employees table:', companyId);
        }
      }

      if (!companyId) {
        console.warn('Could not determine company ID for user');
        return [];
      }

      console.log('Fetching employee benchmark data for company:', companyId);

      // Get employees with skills profiles using explicit filter
      console.log('About to query st_employee_skills_profile with company_id:', companyId);
      
      const { data: employeesData, error } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          employee_id,
          skills_match_score,
          extracted_skills,
          gap_analysis_completed_at,
          employees!inner(
            id,
            department,
            user_id,
            current_position_id,
            company_id,
            users(email, full_name),
            st_company_positions!employees_current_position_id_fkey(position_title)
          )
        `)
        .eq('employees.company_id', companyId)
        .not('skills_match_score', 'is', null);

      console.log('Supabase query response:', { data: employeesData, error });
      
      if (error) {
        console.error('Error fetching employees data:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }

      console.log('Employees data fetched:', employeesData?.length || 0, 'employees');
      console.log('Raw employees data:', JSON.stringify(employeesData, null, 2));

      // Process each skills profile
      const employeeBenchmarks: EmployeeBenchmarkData[] = [];

      for (const profile of employeesData || []) {
        const employee = profile.employees;
        if (!employee) {
          console.log('Skipping profile without employee data');
          continue;
        }

        // Use full name from user data, fallback to email-based name
        const userData = employee.users?.[0] || employee.users; // Handle both array and object response
        const name = userData?.full_name || 
                    (userData?.email ? userData.email.split('@')[0].replace(/[._]/g, ' ') : 'Unknown');
        
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

        const positionData = employee.st_company_positions?.[0] || employee.st_company_positions;
        
        employeeBenchmarks.push({
          employee_id: employee.id,
          name,
          department: employee.department || 'Unknown',
          position: positionData?.position_title || 'Unknown',
          market_match_percentage: Number(profile.skills_match_score) || 0,
          critical_gaps_count: criticalGapsCount,
          skills_by_source: skillsBySource,
          top_missing_skills: topMissingSkills,
          last_analyzed: profile.gap_analysis_completed_at 
            ? new Date(profile.gap_analysis_completed_at)
            : null
        });
      }

      console.log('Processed employee benchmarks:', employeeBenchmarks.length);
      console.log('Employee benchmarks data:', JSON.stringify(employeeBenchmarks, null, 2));
      return employeeBenchmarks;
    } catch (error) {
      console.error('Error getting employees benchmark - full error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  /**
   * Get comprehensive benchmark data
   * Checks if we have previously generated data, returns empty if not
   * Use regenerate button to generate/update data
   */
  async getComprehensiveBenchmark(): Promise<ComprehensiveBenchmarkData> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      // Get company to check last generation time
      const { data: company } = await supabase
        .from('companies')
        .select('benchmark_last_regenerated_at')
        .or(`id.eq.${userData.user.id},id.in.(select company_id from users where id='${userData.user.id}'),id.in.(select company_id from employees where user_id='${userData.user.id}')`)
        .single();

      // If never generated, return empty data
      if (!company?.benchmark_last_regenerated_at) {
        console.log('📊 No benchmark data generated yet. Use regenerate button to generate.');
        return {
          organization: {
            market_coverage_rate: 0,
            industry_alignment_index: 0,
            top_missing_skills: [],
            critical_skills_count: 0,
            moderate_skills_count: 0,
            minor_skills_count: 0,
            total_employees: 0,
            analyzed_employees: 0,
            departments_count: 0
          },
          departments: [],
          employees: [],
          generated_at: null,
          never_generated: true
        } as any;
      }

      // We have generated before - fetch the current data
      console.log('📊 Fetching existing benchmark data...');
      
      const [organization, departments, employees] = await Promise.all([
        this.getOrganizationBenchmark(),
        this.getDepartmentsBenchmark(),
        this.getEmployeesBenchmark()
      ]);
      
      return {
        organization,
        departments,
        employees,
        generated_at: new Date(company.benchmark_last_regenerated_at)
      };
    } catch (error) {
      console.error('Error getting comprehensive benchmark:', error);
      // Return empty data structure on error
      return {
        organization: {
          market_coverage_rate: 0,
          industry_alignment_index: 0,
          top_missing_skills: [],
          critical_skills_count: 0,
          moderate_skills_count: 0,
          minor_skills_count: 0,
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
   * Force regenerate benchmark data (consumes a regeneration)
   * This should only be called from the regenerate button
   */
  async forceRegenerate(): Promise<ComprehensiveBenchmarkData> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    console.log('🔄 Force regenerating benchmark data...');
    
    // Generate fresh data
    const [organization, departments, employees] = await Promise.all([
      this.getOrganizationBenchmark(),
      this.getDepartmentsBenchmark(),
      this.getEmployeesBenchmark()
    ]);
    
    console.log('✨ Fresh benchmark data generated!');
    
    // Take a snapshot for historical tracking
    try {
      await supabase.rpc('take_benchmark_snapshot');
      console.log('📸 Snapshot taken for historical tracking');
    } catch (error) {
      console.error('Failed to take snapshot:', error);
      // Don't fail the whole operation if snapshot fails
    }
    
    return {
      organization,
      departments,
      employees,
      generated_at: new Date()
    };
  }
  
  /**
   * Utility method to check if benchmarks need refresh
   */
  // Utility method for string matching - reserved for future use
  // @ts-ignore - Method intentionally kept for future features
  private fuzzyMatch(str1: string, str2: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_.]/g, '');
    return normalize(str1) === normalize(str2);
  }
}

// Export singleton instance
export const marketSkillsService = new MarketSkillsService();
