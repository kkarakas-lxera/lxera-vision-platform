import { supabase } from '@/integrations/supabase/client';

export interface SkillGapMission {
  id: string;
  title: string;
  description: string;
  target_skill_id: string;
  target_skill_name: string;
  current_skill_level: number;
  required_skill_level: number;
  skill_gap_size: number;
  gap_severity: 'critical' | 'moderate' | 'minor';
  position_title: string;
  department: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  points_value: number;
  estimated_minutes: number;
  content_section_id?: string;
  module_content_id?: string;
}

export interface EmployeeSkillGap {
  skill_id: string;
  skill_name: string;
  current_level: number;
  required_level: number;
  gap_size: number;
  gap_severity: 'critical' | 'moderate' | 'minor';
  skill_category: string;
  is_mandatory: boolean;
  position_title: string;
  department: string;
}

export class SkillGapMissionService {
  
  static async getEmployeeSkillGaps(employeeId: string): Promise<EmployeeSkillGap[]> {
    try {
      // First get the employee data
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id, current_position_id, user_id')
        .eq('id', employeeId)
        .single();

      
      if (employeeError || !employeeData) {
        console.error('Error fetching employee:', employeeError);
        return [];
      }

      if (!employeeData.current_position_id) {
        console.warn('Employee has no position assigned');
        return [];
      }

      // Then get the position data separately to avoid RLS issues
      const { data: positionData, error: positionError } = await supabase
        .from('st_company_positions')
        .select(`
          position_title,
          department,
          required_skills,
          nice_to_have_skills
        `)
        .eq('id', employeeData.current_position_id)
        .single();

      
      if (positionError || !positionData) {
        console.error('Error fetching position:', positionError);
        return [];
      }

      const allRequiredSkills = [
        ...(positionData.required_skills || []),
        ...(positionData.nice_to_have_skills || [])
      ];


      // Get employee's current skill levels from extracted skills
      const { data: skillProfile } = await supabase
        .from('st_employee_skills_profile')
        .select('extracted_skills')
        .eq('employee_id', employeeId)
        .single();

      const extractedSkills = skillProfile?.extracted_skills || [];
      
      // Create a map of current skills by name (since skill_id might not be populated)
      const skillsMap = new Map();
      
      for (const skill of extractedSkills) {
        const skillName = skill.skill_name?.toLowerCase().trim();
        if (skillName) {
          skillsMap.set(skillName, {
            current_level: skill.proficiency_level || 1,
            skill_name: skill.skill_name,
            skill_type: skill.category || 'general'
          });
        }
      }
      

      // Calculate gaps for required skills
      const skillGaps: EmployeeSkillGap[] = [];

      for (const reqSkill of allRequiredSkills) {
        const skillId = reqSkill.skill_id;
        const skillName = reqSkill.skill_name?.toLowerCase().trim();
        const requiredLevel = typeof reqSkill.proficiency_level === 'number' ? 
          reqSkill.proficiency_level : 
          this.mapProficiencyToLevel(reqSkill.proficiency_level);
        
        
        // Try to find current skill by name
        const currentSkill = skillsMap.get(skillName);
        const currentLevel = currentSkill?.current_level || 1;
        
        
        if (currentLevel < requiredLevel) {
          const gapSize = requiredLevel - currentLevel;
          
          skillGaps.push({
            skill_id: skillId,
            skill_name: reqSkill.skill_name,
            current_level: currentLevel,
            required_level: requiredLevel,
            gap_size: gapSize,
            gap_severity: this.calculateGapSeverity(gapSize, reqSkill.is_mandatory),
            skill_category: currentSkill?.skill_type || reqSkill.skill_type || 'general',
            is_mandatory: reqSkill.is_mandatory || false,
            position_title: positionData.position_title,
            department: positionData.department || 'General'
          });
        }
      }

      
      // Sort by severity and gap size
      return skillGaps.sort((a, b) => {
        const severityOrder = { critical: 3, moderate: 2, minor: 1 };
        const aSeverity = severityOrder[a.gap_severity];
        const bSeverity = severityOrder[b.gap_severity];
        
        if (aSeverity !== bSeverity) return bSeverity - aSeverity;
        return b.gap_size - a.gap_size;
      });

    } catch (error) {
      console.error('Error getting employee skill gaps:', error);
      return [];
    }
  }

  static async generateSkillGapMissions(
    employeeId: string, 
    companyId: string,
    contentId?: string,
    sectionName?: string
  ): Promise<SkillGapMission[]> {
    try {
      // Get employee's skill gaps
      const skillGaps = await this.getEmployeeSkillGaps(employeeId);
      
      if (skillGaps.length === 0) {
        return [];
      }

      // Get relevant course content if available
      const contentSections: any[] = [];
      if (contentId) {
        const { data: modules } = await supabase
          .from('cm_module_content')
          .select('*')
          .eq('content_id', contentId);

        if (modules) {
          const sectionNames = sectionName ? [sectionName] : 
            ['introduction', 'core_content', 'practical_applications', 'case_studies'];
          
          for (const module of modules) {
            for (const section of sectionNames) {
              const content = module[section];
              if (content && content.trim() && content !== 'Content will be available when unlocked') {
                contentSections.push({
                  section_id: `${module.content_id}-${section}`,
                  content_id: module.content_id,
                  section_name: section,
                  title: section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  content: content,
                  module_name: module.module_name
                });
              }
            }
          }
        }
      }

      // Generate missions for top skill gaps
      const missions: SkillGapMission[] = [];
      const topGaps = skillGaps.slice(0, 8); // Focus on top 8 gaps

      for (const gap of topGaps) {
        // Find matching content section if available
        const matchingContent = contentSections.find(section => 
          this.skillMatchesContent(gap.skill_name, section.content, section.title)
        );

        // Generate missions for different difficulty levels
        const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
        
        for (const difficulty of difficulties) {
          const mission = this.createMissionFromGap(
            gap, 
            difficulty, 
            matchingContent,
            companyId
          );
          missions.push(mission);
        }
      }

      return missions;

    } catch (error) {
      console.error('Error generating skill gap missions:', error);
      return [];
    }
  }

  private static createMissionFromGap(
    gap: EmployeeSkillGap, 
    difficulty: 'easy' | 'medium' | 'hard',
    content?: any,
    companyId?: string
  ): SkillGapMission {
    const pointValues = { easy: 15, medium: 25, hard: 40 };
    const timeEstimates = { easy: 3, medium: 5, hard: 8 };
    
    const severityEmoji = {
      critical: '🔥',
      moderate: '⚡',
      minor: '💡'
    };

    const difficultyPrefix = {
      easy: 'Quick Start',
      medium: 'Deep Dive', 
      hard: 'Master'
    };

    const title = `${severityEmoji[gap.gap_severity]} ${difficultyPrefix[difficulty]}: ${gap.skill_name}`;
    
    const description = `Level up your ${gap.position_title} skills! ` +
      `Current: Level ${gap.current_level} → Target: Level ${gap.required_level}. ` +
      `${gap.is_mandatory ? 'Required skill' : 'Nice-to-have skill'} for your role.`;

    return {
      id: `skill-gap-${gap.skill_id}-${difficulty}`,
      title,
      description,
      target_skill_id: gap.skill_id,
      target_skill_name: gap.skill_name,
      current_skill_level: gap.current_level,
      required_skill_level: gap.required_level,
      skill_gap_size: gap.gap_size,
      gap_severity: gap.gap_severity,
      position_title: gap.position_title,
      department: gap.department,
      difficulty_level: difficulty,
      points_value: pointValues[difficulty] + (gap.gap_severity === 'critical' ? 10 : 0),
      estimated_minutes: timeEstimates[difficulty],
      content_section_id: content?.section_id,
      module_content_id: content?.content_id
    };
  }

  private static skillMatchesContent(skillName: string, content: string, title: string): boolean {
    const searchText = (skillName + ' ' + content + ' ' + title).toLowerCase();
    const skillKeywords = skillName.toLowerCase().split(/[\s-_]+/);
    
    // Check if at least 50% of skill keywords appear in content
    const matches = skillKeywords.filter(keyword => 
      keyword.length > 2 && searchText.includes(keyword)
    );
    
    return matches.length >= Math.ceil(skillKeywords.length * 0.5);
  }

  private static mapProficiencyToLevel(proficiency: string): number {
    const mapping = {
      'beginner': 2,
      'intermediate': 3,
      'advanced': 4,
      'expert': 5
    };
    return mapping[proficiency.toLowerCase() as keyof typeof mapping] || 3;
  }

  private static calculateGapSeverity(gapSize: number, isMandatory: boolean): 'critical' | 'moderate' | 'minor' {
    if (isMandatory && gapSize >= 2) return 'critical';
    if (gapSize >= 3) return 'critical';
    if (gapSize >= 2) return 'moderate';
    return 'minor';
  }

  // Save missions to database
  static async saveMissions(missions: SkillGapMission[], employeeId: string, companyId: string) {
    try {
      const missionRecords = missions.map(mission => ({
        employee_id: employeeId,
        company_id: companyId,
        mission_title: mission.title,
        mission_description: mission.description,
        difficulty_level: mission.difficulty_level,
        points_value: mission.points_value,
        estimated_minutes: mission.estimated_minutes,
        target_skill_id: mission.target_skill_id,
        current_skill_level: mission.current_skill_level,
        required_skill_level: mission.required_skill_level,
        skill_gap_size: mission.skill_gap_size,
        gap_severity: mission.gap_severity,
        content_section_id: mission.content_section_id,
        module_content_id: mission.module_content_id,
        category: mission.department.toLowerCase(), // Keep for UI theming
        is_active: true
      }));

      const { data, error } = await supabase
        .from('game_missions')
        .insert(missionRecords)
        .select();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error saving missions:', error);
      throw error;
    }
  }
}