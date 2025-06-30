
import type { SkillData, CriticalSkillsGap } from '@/types/common';

// Type guard for SkillData
export function isSkillData(obj: any): obj is SkillData {
  return obj && typeof obj === 'object' && 
         typeof obj.skill_name === 'string' && 
         typeof obj.proficiency_level === 'number';
}

// Convert Json array to SkillData array
export function parseSkillsArray(jsonArray: any): SkillData[] {
  if (!Array.isArray(jsonArray)) return [];
  
  return jsonArray
    .filter(isSkillData)
    .map(skill => ({
      skill_id: skill.skill_id || null,
      skill_name: skill.skill_name,
      proficiency_level: skill.proficiency_level,
      years_experience: skill.years_experience || null,
      evidence: skill.evidence,
      category: skill.category,
      context: skill.context,
      confidence: skill.confidence,
      source: skill.source
    }));
}

// Convert Json to required skills format
export function parseRequiredSkills(jsonArray: any): Array<{skill_id?: string; skill_name: string}> {
  if (!Array.isArray(jsonArray)) return [];
  
  return jsonArray
    .filter(skill => skill && typeof skill === 'object' && skill.skill_name)
    .map(skill => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name
    }));
}

// Convert string to gap severity
export function parseGapSeverity(severity: string): 'critical' | 'moderate' | 'minor' {
  if (severity === 'critical' || severity === 'moderate' || severity === 'minor') {
    return severity;
  }
  return 'moderate'; // default fallback
}

// Parse course structure from Json
export function parseCourseStructure(json: any): {
  title: string;
  description?: string;
  modules: Array<{
    week: number;
    title: string;
    topics: string[];
    duration: string;
    priority: string;
  }>;
} {
  if (typeof json === 'string') {
    try {
      json = JSON.parse(json);
    } catch {
      return { title: 'Unknown Course', modules: [] };
    }
  }
  
  if (!json || typeof json !== 'object') {
    return { title: 'Unknown Course', modules: [] };
  }
  
  return {
    title: json.title || 'Unknown Course',
    description: json.description,
    modules: Array.isArray(json.modules) ? json.modules.map(module => ({
      week: module.week || 1,
      title: module.title || 'Module',
      topics: Array.isArray(module.topics) ? module.topics : [],
      duration: module.duration || '1 week',
      priority: module.priority || 'medium'
    })) : []
  };
}
