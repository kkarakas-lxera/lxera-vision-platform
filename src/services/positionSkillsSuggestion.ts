import { supabase } from '@/integrations/supabase/client';

export interface SuggestedSkill {
  skill_id?: string; // NESTA skill ID if matched
  skill_name: string;
  skill_type: string;
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  category: 'essential' | 'important' | 'nice-to-have';
  source: 'nesta' | 'ai';
  confidence?: number;
  description?: string;
}

export interface SkillSuggestionResult {
  position_title: string;
  total_suggestions: number;
  nesta_skills: SuggestedSkill[];
  ai_skills: SuggestedSkill[];
  combined_skills: SuggestedSkill[];
}

/**
 * Search NESTA taxonomy for relevant skills based on position title
 */
async function searchNESTASkills(positionTitle: string): Promise<SuggestedSkill[]> {
  try {
    // Extract keywords from position title
    const keywords = positionTitle.toLowerCase().split(' ')
      .filter(word => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word));

    // Search NESTA skills using the search function
    const searchPromises = keywords.map(keyword => 
      supabase.rpc('search_skills', {
        search_term: keyword,
        limit_count: 20
      })
    );

    const results = await Promise.all(searchPromises);
    const allSkills = results.flatMap(r => r.data || []);

    // Deduplicate and score skills based on relevance
    const skillMap = new Map<string, any>();
    allSkills.forEach(skill => {
      if (!skillMap.has(skill.skill_id)) {
        skillMap.set(skill.skill_id, {
          ...skill,
          relevance_score: 0
        });
      }
      // Increase relevance score for each keyword match
      skillMap.get(skill.skill_id).relevance_score += skill.relevance || 0.5;
    });

    // Convert to array and sort by relevance
    const uniqueSkills = Array.from(skillMap.values())
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 15); // Top 15 skills

    // Map to SuggestedSkill format
    return uniqueSkills.map((skill, index) => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      skill_type: skill.skill_type,
      proficiency_level: determineProficiencyLevel(positionTitle, skill.skill_name),
      category: index < 5 ? 'essential' : index < 10 ? 'important' : 'nice-to-have',
      source: 'nesta' as const,
      confidence: skill.relevance_score
    }));
  } catch (error) {
    console.error('Error searching NESTA skills:', error);
    return [];
  }
}

/**
 * Get AI-suggested skills using Supabase Edge Function
 */
async function getOpenAISuggestions(positionTitle: string): Promise<SuggestedSkill[]> {
  try {
    // Call Supabase Edge Function for AI suggestions
    const { data, error } = await supabase.functions.invoke('suggest-position-skills', {
      body: { position_title: positionTitle }
    });

    if (error) throw error;

    const skills = data?.skills || [];

    return skills.map((skill: any) => ({
      skill_name: skill.skill_name,
      skill_type: 'custom',
      proficiency_level: skill.proficiency_level || 'intermediate',
      category: skill.category || 'important',
      source: 'ai' as const,
      description: skill.description
    }));
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    // Fallback to predefined suggestions based on common position titles
    return getFallbackSuggestions(positionTitle);
  }
}

/**
 * Fallback suggestions when AI service is unavailable
 */
function getFallbackSuggestions(positionTitle: string): SuggestedSkill[] {
  const title = positionTitle.toLowerCase();
  const suggestions: SuggestedSkill[] = [];

  // Common skills for different roles
  if (title.includes('frontend') || title.includes('react')) {
    suggestions.push(
      { skill_name: 'Component Architecture', skill_type: 'custom', proficiency_level: 'advanced', category: 'important', source: 'ai', description: 'Designing scalable component systems' },
      { skill_name: 'State Management Patterns', skill_type: 'custom', proficiency_level: 'advanced', category: 'essential', source: 'ai', description: 'Redux, Context API, and modern state solutions' },
      { skill_name: 'Performance Optimization', skill_type: 'custom', proficiency_level: 'intermediate', category: 'important', source: 'ai', description: 'Web vitals and rendering optimization' },
      { skill_name: 'Accessibility (WCAG)', skill_type: 'custom', proficiency_level: 'intermediate', category: 'important', source: 'ai', description: 'Building inclusive web applications' },
      { skill_name: 'Micro-frontend Architecture', skill_type: 'custom', proficiency_level: 'basic', category: 'nice-to-have', source: 'ai', description: 'Module federation and distributed UI' }
    );
  }

  if (title.includes('backend') || title.includes('node')) {
    suggestions.push(
      { skill_name: 'API Design Patterns', skill_type: 'custom', proficiency_level: 'advanced', category: 'essential', source: 'ai', description: 'RESTful and GraphQL API design' },
      { skill_name: 'Database Optimization', skill_type: 'custom', proficiency_level: 'advanced', category: 'essential', source: 'ai', description: 'Query optimization and indexing strategies' },
      { skill_name: 'Microservices Architecture', skill_type: 'custom', proficiency_level: 'intermediate', category: 'important', source: 'ai', description: 'Distributed systems design' },
      { skill_name: 'Security Best Practices', skill_type: 'custom', proficiency_level: 'advanced', category: 'essential', source: 'ai', description: 'OWASP and secure coding' },
      { skill_name: 'Event-Driven Architecture', skill_type: 'custom', proficiency_level: 'intermediate', category: 'nice-to-have', source: 'ai', description: 'Message queues and event streaming' }
    );
  }

  if (title.includes('full') || title.includes('stack')) {
    suggestions.push(
      { skill_name: 'System Design', skill_type: 'custom', proficiency_level: 'advanced', category: 'essential', source: 'ai', description: 'End-to-end application architecture' },
      { skill_name: 'DevOps Practices', skill_type: 'custom', proficiency_level: 'intermediate', category: 'important', source: 'ai', description: 'CI/CD and infrastructure as code' },
      { skill_name: 'Cloud Architecture', skill_type: 'custom', proficiency_level: 'intermediate', category: 'important', source: 'ai', description: 'AWS, Azure, or GCP deployment' },
      { skill_name: 'Performance Monitoring', skill_type: 'custom', proficiency_level: 'intermediate', category: 'nice-to-have', source: 'ai', description: 'APM tools and optimization' }
    );
  }

  // Add common soft skills
  suggestions.push(
    { skill_name: 'Technical Communication', skill_type: 'custom', proficiency_level: 'advanced', category: 'essential', source: 'ai', description: 'Documentation and knowledge sharing' },
    { skill_name: 'Agile Methodologies', skill_type: 'custom', proficiency_level: 'intermediate', category: 'important', source: 'ai', description: 'Scrum and iterative development' },
    { skill_name: 'Problem Solving', skill_type: 'custom', proficiency_level: 'advanced', category: 'essential', source: 'ai', description: 'Analytical thinking and debugging' }
  );

  return suggestions;
}

/**
 * Determine proficiency level based on position title seniority
 */
function determineProficiencyLevel(
  positionTitle: string, 
  skillName: string
): 'basic' | 'intermediate' | 'advanced' | 'expert' {
  const title = positionTitle.toLowerCase();
  
  // Seniority indicators
  const juniorIndicators = ['junior', 'entry', 'associate', 'trainee', 'intern'];
  const seniorIndicators = ['senior', 'lead', 'principal', 'staff', 'architect', 'manager', 'director'];
  const expertIndicators = ['expert', 'specialist', 'consultant', 'advisor'];

  if (juniorIndicators.some(ind => title.includes(ind))) {
    return 'basic';
  } else if (expertIndicators.some(ind => title.includes(ind))) {
    return 'expert';
  } else if (seniorIndicators.some(ind => title.includes(ind))) {
    return 'advanced';
  }
  
  return 'intermediate';
}

/**
 * Map AI-suggested skills to NESTA taxonomy where possible
 */
async function mapAISkillsToNESTA(
  aiSkills: SuggestedSkill[], 
  nestaSkills: SuggestedSkill[]
): Promise<SuggestedSkill[]> {
  const mappedSkills: SuggestedSkill[] = [];
  const nestaSkillNames = new Set(nestaSkills.map(s => s.skill_name.toLowerCase()));

  for (const aiSkill of aiSkills) {
    // Check if AI skill already exists in NESTA results
    if (nestaSkillNames.has(aiSkill.skill_name.toLowerCase())) {
      continue; // Skip duplicates
    }

    // Try to find in NESTA database
    const { data: searchResults } = await supabase.rpc('search_skills', {
      search_term: aiSkill.skill_name,
      limit_count: 3
    });

    if (searchResults && searchResults.length > 0) {
      // Found in NESTA - map it
      const bestMatch = searchResults[0];
      mappedSkills.push({
        ...aiSkill,
        skill_id: bestMatch.skill_id,
        skill_type: bestMatch.skill_type,
        source: 'ai' // Keep AI source but add NESTA ID
      });
    } else {
      // Not in NESTA - keep as AI-only skill
      mappedSkills.push(aiSkill);
    }
  }

  return mappedSkills;
}

/**
 * Main function to suggest skills for a position
 */
export async function suggestPositionSkills(
  positionTitle: string
): Promise<SkillSuggestionResult> {
  try {
    // Run both searches in parallel
    const [nestaSkills, aiSkills] = await Promise.all([
      searchNESTASkills(positionTitle),
      getOpenAISuggestions(positionTitle)
    ]);

    // Map AI skills to NESTA where possible
    const mappedAISkills = await mapAISkillsToNESTA(aiSkills, nestaSkills);

    // Combine and deduplicate
    const allSkills = [...nestaSkills];
    
    // Add non-duplicate AI skills
    mappedAISkills.forEach(aiSkill => {
      const exists = allSkills.some(s => 
        s.skill_name.toLowerCase() === aiSkill.skill_name.toLowerCase()
      );
      if (!exists) {
        allSkills.push(aiSkill);
      }
    });

    // Sort by category priority
    const categoryOrder = { 'essential': 0, 'important': 1, 'nice-to-have': 2 };
    allSkills.sort((a, b) => {
      const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category];
      if (categoryDiff !== 0) return categoryDiff;
      
      // Within same category, prefer NESTA skills
      if (a.source !== b.source) {
        return a.source === 'nesta' ? -1 : 1;
      }
      
      return 0;
    });

    return {
      position_title: positionTitle,
      total_suggestions: allSkills.length,
      nesta_skills: nestaSkills,
      ai_skills: mappedAISkills,
      combined_skills: allSkills
    };
  } catch (error) {
    console.error('Error suggesting position skills:', error);
    return {
      position_title: positionTitle,
      total_suggestions: 0,
      nesta_skills: [],
      ai_skills: [],
      combined_skills: []
    };
  }
}