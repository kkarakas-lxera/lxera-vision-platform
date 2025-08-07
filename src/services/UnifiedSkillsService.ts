/**
 * UnifiedSkillsService - Single source of truth for all skills operations
 * 
 * This service standardizes all skill proficiency scales to 0-3 and provides
 * centralized gap calculation logic to replace scattered frontend calculations.
 * 
 * Standard Scale: 0=None, 1=Learning, 2=Using, 3=Expert
 */

import { supabase } from '@/lib/supabase';

export interface StandardSkill {
  skill_id?: string;
  skill_name: string;
  proficiency: number; // Always 0-3
  source?: 'cv' | 'verified' | 'ai_suggested' | 'position_requirement';
  years_experience?: number;
  evidence?: string;
}

export interface SkillGap {
  skill_name: string;
  required_level: number; // 0-3
  current_level: number;  // 0-3
  gap: number;           // difference
  severity: 'critical' | 'important' | 'minor' | 'none';
  employees_affected?: number;
  total_employees?: number;
}

export class UnifiedSkillsService {
  /**
   * Converts ANY proficiency format to standard 0-3 scale
   * Handles: text labels, 1-5, 0-5, 2-5, percentages, etc.
   */
  static convertToStandard(value: any): number {
    // Handle null/undefined
    if (value === null || value === undefined) return 0;
    
    // If already a number, convert to 0-3 range
    if (typeof value === 'number') {
      // Handle percentage (0-100)
      if (value > 10) {
        if (value >= 75) return 3;      // Expert
        if (value >= 50) return 2;      // Using
        if (value >= 25) return 1;      // Learning
        return 0;                        // None
      }
      
      // Handle 0-5 scale (SkillBadge current scale)
      if (value <= 5) {
        if (value >= 4) return 3;       // Expert
        if (value >= 3) return 2;       // Using
        if (value >= 1) return 1;       // Learning
        return 0;                        // None
      }
      
      // Already 0-3, just ensure bounds
      return Math.max(0, Math.min(3, Math.round(value)));
    }
    
    // Handle text proficiency levels
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase().trim();
      
      // Map all text variations to 0-3
      const textMappings: Record<string, number> = {
        // None/Zero
        'none': 0,
        'no experience': 0,
        'not applicable': 0,
        'n/a': 0,
        '': 0,
        
        // Learning (1)
        'learning': 1,
        'beginner': 1,
        'basic': 1,
        'fundamental': 1,
        'novice': 1,
        'entry': 1,
        'junior': 1,
        
        // Using (2)
        'using': 2,
        'intermediate': 2,
        'competent': 2,
        'proficient': 2,
        'good': 2,
        'solid': 2,
        'mid': 2,
        'middle': 2,
        
        // Expert (3)
        'expert': 3,
        'advanced': 3,
        'master': 3,
        'senior': 3,
        'specialist': 3,
        'guru': 3,
        'excellent': 3,
        'exceptional': 3
      };
      
      return textMappings[lowerValue] ?? 0;
    }
    
    // Default to 0 for any unhandled type
    return 0;
  }

  /**
   * Calculate skill gaps for an employee against their position requirements
   * This replaces all frontend gap calculation logic
   */
  static async calculateEmployeeGaps(employeeId: string): Promise<SkillGap[]> {
    try {
      // Get employee's current skills and position requirements
      const { data: employee } = await supabase
        .from('employees')
        .select(`
          id,
          current_position_id,
          cv_analysis_data,
          positions:current_position_id (
            required_skills,
            nice_to_have_skills
          ),
          employee_skills (
            skill_name,
            proficiency,
            source
          )
        `)
        .eq('id', employeeId)
        .single();

      if (!employee || !employee.positions) {
        return [];
      }

      const gaps: SkillGap[] = [];
      const requiredSkills = employee.positions.required_skills || [];
      
      // Process each required skill
      for (const reqSkill of requiredSkills) {
        const skillName = reqSkill.skill_name;
        const requiredLevel = this.convertToStandard(reqSkill.proficiency_level);
        
        // Find current level from employee_skills table
        let currentLevel = 0;
        
        // Check employee skills (already in 0-3 scale)
        const employeeSkill = employee.employee_skills?.find(
          (s: any) => s.skill_name.toLowerCase() === skillName.toLowerCase()
        );
        
        if (employeeSkill) {
          currentLevel = employeeSkill.proficiency; // Already 0-3
        } else if (employee.cv_analysis_data?.extracted_skills) {
          // Fallback to CV data if not in employee_skills yet
          const cvSkills = employee.cv_analysis_data.extracted_skills;
          const cvSkill = cvSkills.find(
            (s: any) => s.skill_name?.toLowerCase() === skillName.toLowerCase()
          );
          
          if (cvSkill) {
            currentLevel = this.convertToStandard(cvSkill.proficiency_level || 0);
          }
        }
        
        // Calculate gap
        const gap = requiredLevel - currentLevel;
        
        // Determine severity based on gap size
        let severity: SkillGap['severity'] = 'none';
        if (gap > 0) {
          if (gap >= 2) severity = 'critical';      // 2+ levels behind
          else if (gap === 1) severity = 'important'; // 1 level behind
          else severity = 'minor';                    // Fractional gap
        }
        
        gaps.push({
          skill_name: skillName,
          required_level: requiredLevel,
          current_level: currentLevel,
          gap: Math.max(0, gap),
          severity
        });
      }
      
      return gaps;
    } catch (error) {
      console.error('Error calculating employee gaps:', error);
      return [];
    }
  }

  /**
   * Calculate organization-wide skill gaps
   * This replaces frontend calculations in SkillsGapAnalysis.tsx
   */
  static async calculateOrganizationGaps(companyId: string): Promise<SkillGap[]> {
    try {
      // Get all employees with their skills and positions
      const { data: employees } = await supabase
        .from('employees')
        .select(`
          id,
          current_position_id,
          cv_analysis_data,
          positions:current_position_id (
            required_skills
          ),
          employee_skills (
            skill_name,
            proficiency,
            source
          )
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (!employees || employees.length === 0) {
        return [];
      }

      // Aggregate gaps across all employees
      const skillGapMap = new Map<string, {
        totalRequired: number;
        totalWithGap: number;
        totalGapSize: number;
        requiredLevel: number;
      }>();

      for (const employee of employees) {
        if (!employee.positions?.required_skills) continue;
        
        const requiredSkills = employee.positions.required_skills || [];
        
        for (const reqSkill of requiredSkills) {
          const skillName = reqSkill.skill_name;
          const requiredLevel = this.convertToStandard(reqSkill.proficiency_level);
          
          // Initialize map entry
          if (!skillGapMap.has(skillName)) {
            skillGapMap.set(skillName, {
              totalRequired: 0,
              totalWithGap: 0,
              totalGapSize: 0,
              requiredLevel
            });
          }
          
          const mapEntry = skillGapMap.get(skillName)!;
          mapEntry.totalRequired++;
          
          // Find current level from employee_skills table
          let currentLevel = 0;
          
          // Check employee skills (already in 0-3 scale)
          const employeeSkill = employee.employee_skills?.find(
            (s: any) => s.skill_name.toLowerCase() === skillName.toLowerCase()
          );
          
          if (employeeSkill) {
            currentLevel = employeeSkill.proficiency; // Already 0-3
          } else if (employee.cv_analysis_data?.extracted_skills) {
            // Fallback to CV data if not in employee_skills yet
            const cvSkills = employee.cv_analysis_data.extracted_skills;
            const cvSkill = cvSkills.find(
              (s: any) => s.skill_name?.toLowerCase() === skillName.toLowerCase()
            );
            
            if (cvSkill) {
              currentLevel = this.convertToStandard(cvSkill.proficiency_level || 0);
            }
          }
          
          // Track gap
          const gap = requiredLevel - currentLevel;
          if (gap > 0) {
            mapEntry.totalWithGap++;
            mapEntry.totalGapSize += gap;
          }
        }
      }

      // Convert map to array of gaps with severity
      const gaps: SkillGap[] = [];
      
      for (const [skillName, data] of skillGapMap.entries()) {
        const percentageAffected = (data.totalWithGap / data.totalRequired) * 100;
        const avgGap = data.totalWithGap > 0 ? data.totalGapSize / data.totalWithGap : 0;
        
        // Determine severity based on percentage affected (matching frontend logic)
        let severity: SkillGap['severity'] = 'none';
        if (percentageAffected > 50) severity = 'critical';
        else if (percentageAffected > 33) severity = 'important';
        else if (percentageAffected > 0) severity = 'minor';
        
        gaps.push({
          skill_name: skillName,
          required_level: data.requiredLevel,
          current_level: Math.round(data.requiredLevel - avgGap),
          gap: avgGap,
          severity,
          employees_affected: data.totalWithGap,
          total_employees: data.totalRequired
        });
      }
      
      // Sort by severity and number affected
      gaps.sort((a, b) => {
        const severityOrder = { critical: 0, important: 1, minor: 2, none: 3 };
        const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
        if (severityDiff !== 0) return severityDiff;
        return (b.employees_affected || 0) - (a.employees_affected || 0);
      });
      
      return gaps;
    } catch (error) {
      console.error('Error calculating organization gaps:', error);
      return [];
    }
  }

  /**
   * Store calculated gaps in database for caching
   */
  static async cacheGaps(
    entityId: string, 
    entityType: 'employee' | 'organization',
    gaps: SkillGap[]
  ): Promise<void> {
    try {
      await supabase
        .from('skills_gap_cache')
        .upsert({
          entity_id: entityId,
          entity_type: entityType,
          gaps: gaps,
          calculated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error caching gaps:', error);
    }
  }

  /**
   * Get cached gaps if recent enough (default 1 hour)
   */
  static async getCachedGaps(
    entityId: string,
    entityType: 'employee' | 'organization',
    maxAgeMs: number = 3600000
  ): Promise<SkillGap[] | null> {
    try {
      const { data } = await supabase
        .from('skills_gap_cache')
        .select('gaps, calculated_at')
        .eq('entity_id', entityId)
        .eq('entity_type', entityType)
        .single();

      if (!data) return null;

      const age = Date.now() - new Date(data.calculated_at).getTime();
      if (age > maxAgeMs) return null;

      return data.gaps;
    } catch (error) {
      return null;
    }
  }

  /**
   * Unified method to get gaps with caching
   */
  static async getGaps(
    entityId: string,
    entityType: 'employee' | 'organization',
    forceRefresh: boolean = false
  ): Promise<SkillGap[]> {
    // Check cache first unless forced refresh
    if (!forceRefresh) {
      const cached = await this.getCachedGaps(entityId, entityType);
      if (cached) return cached;
    }

    // Calculate fresh gaps
    const gaps = entityType === 'employee'
      ? await this.calculateEmployeeGaps(entityId)
      : await this.calculateOrganizationGaps(entityId);

    // Cache the results
    await this.cacheGaps(entityId, entityType, gaps);

    return gaps;
  }

  /**
   * Convert legacy skill data to standard format
   */
  static convertLegacySkills(skills: any[]): StandardSkill[] {
    if (!Array.isArray(skills)) return [];
    
    return skills.map(skill => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name || skill.name || '',
      proficiency: this.convertToStandard(
        skill.proficiency_level || 
        skill.proficiency || 
        skill.level || 
        skill.proficiencyLevel
      ),
      source: skill.source || 'cv',
      years_experience: skill.years_experience || skill.yearsExperience,
      evidence: skill.evidence || skill.description
    }));
  }

  /**
   * Batch convert multiple employees' skills to standard format
   */
  static async standardizeEmployeeSkills(employeeIds: string[]): Promise<void> {
    try {
      for (const employeeId of employeeIds) {
        // Get all skills from various sources
        const { data: employee } = await supabase
          .from('employees')
          .select(`
            id,
            cv_analysis_data,
            employee_skills (
              skill_name,
              proficiency,
              source
            )
          `)
          .eq('id', employeeId)
          .single();

        if (!employee) continue;

        // Convert all skills to standard format
        const standardSkills: StandardSkill[] = [];

        // Process existing employee_skills
        if (employee.employee_skills && employee.employee_skills.length > 0) {
          employee.employee_skills.forEach((skill: any) => {
            standardSkills.push({
              skill_name: skill.skill_name,
              proficiency: skill.proficiency, // Already 0-3
              source: skill.source || 'cv'
            });
          });
        } else if (employee.cv_analysis_data?.extracted_skills) {
          // Fallback to CV data if employee_skills not populated
          const extracted = this.convertLegacySkills(
            employee.cv_analysis_data.extracted_skills
          );
          extracted.forEach(s => {
            s.source = 'cv';
            standardSkills.push(s);
          });
        }

        // Store in unified format (will be used by new table)
        await this.storeStandardSkills(employeeId, standardSkills);
      }
    } catch (error) {
      console.error('Error standardizing employee skills:', error);
    }
  }

  /**
   * Store skills in unified format
   */
  private static async storeStandardSkills(
    employeeId: string,
    skills: StandardSkill[]
  ): Promise<void> {
    // Write to the employee_skills table
    const unifiedSkills = skills.map(skill => ({
      employee_id: employeeId,
      skill_id: skill.skill_id || null,
      skill_name: skill.skill_name,
      proficiency: skill.proficiency,
      source: skill.source || 'cv',
      updated_at: new Date().toISOString()
    }));

    // Delete existing skills for this employee to avoid duplicates
    await supabase
      .from('employee_skills')
      .delete()
      .eq('employee_id', employeeId);

    // Insert new standardized skills
    if (unifiedSkills.length > 0) {
      const { error } = await supabase
        .from('employee_skills')
        .insert(unifiedSkills);
      
      if (error) {
        console.error('Error storing standardized skills:', error);
      } else {
        console.log(`Stored ${unifiedSkills.length} skills for employee ${employeeId}`);
      }
    }
  }
}

export default UnifiedSkillsService;