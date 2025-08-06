import { supabase } from '@/integrations/supabase/client';
import type { MarketSkillData, DepartmentMarketGap } from '@/types/marketSkills';

interface MarketBenchmarkResponse {
  skills: MarketSkillData[];
  cached: boolean;
}

interface InternalSkill {
  skill_name: string;
  proficiency_level?: number;
  source?: 'ai' | 'cv' | 'verified';
}

export class MarketSkillsService {
  /**
   * Fetch market benchmarks for a specific role/industry/department
   */
  async fetchMarketBenchmarks(
    role: string,
    industry?: string,
    department?: string,
    forceRefresh = false
  ): Promise<MarketBenchmarkResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-market-benchmarks', {
        body: { 
          role, 
          industry, 
          department, 
          force_refresh: forceRefresh 
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
  compareWithInternal(
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
    employeeSkills: InternalSkill[]
  ): Promise<DepartmentMarketGap> {
    // Use department name as a proxy for role
    const benchmarks = await this.fetchMarketBenchmarks(department, industry, department);
    
    // Compare with aggregated employee skills
    const comparedSkills = this.compareWithInternal(benchmarks.skills, employeeSkills);
    
    return {
      department,
      industry: industry || 'General',
      skills: comparedSkills,
      last_updated: new Date()
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
   * Utility method to check if benchmarks need refresh
   */
  private fuzzyMatch(str1: string, str2: string): boolean {
    const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_.]/g, '');
    return normalize(str1) === normalize(str2);
  }
}

// Export singleton instance
export const marketSkillsService = new MarketSkillsService();