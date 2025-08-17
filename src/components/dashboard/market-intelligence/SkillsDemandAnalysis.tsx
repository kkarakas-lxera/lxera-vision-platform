import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface Skill {
  skill: string;
  percentage: string | number; // Database stores as string, convert to number
  demand: string | number;     // Database stores as string, convert to number
  context?: {                  // AI-generated context from backend
    description: string;
    tools: string[];
  };
}

interface CategoryData {
  category: string;
  total_percentage: number;
  skill_count: number;
  skills: Skill[];
}

interface SkillsDemandAnalysisProps {
  skillsByCategory: CategoryData[];
}


// Frontend skill normalization (matching backend logic)
const normalizeSkillName = (skill: string): string => {
  let normalized = skill.toLowerCase().trim();
  
  // Language translations
  const translations: Record<string, string> = {
    // Turkish
    'pazarlama': 'marketing',
    'analiz': 'analysis',
    'yönetim': 'management',
    'satış': 'sales',
    'iletişim': 'communication',
    'liderlik': 'leadership',
    'proje': 'project',
    'müşteri': 'customer',
    'hizmet': 'service',
    'deneyim': 'experience',
    
    // French  
    'ventes': 'sales',
    'gestion': 'management',
    'marketing': 'marketing',
    'communication': 'communication',
    'leadership': 'leadership',
    'analyser': 'analysis',
    'projet': 'project',
    'client': 'customer',
    'service': 'service',
    'expérience': 'experience',
    
    // German
    'verkauf': 'sales',
    'verwaltung': 'management',
    'kommunikation': 'communication',
    'führung': 'leadership',
    'analyse': 'analysis',
    'projekt': 'project',
    'kunde': 'customer',
    'dienst': 'service',
    'erfahrung': 'experience',
    
    // Spanish
    'ventas': 'sales',
    'gestión': 'management',
    'comunicación': 'communication',
    'liderazgo': 'leadership',
    'análisis': 'analysis',
    'proyecto': 'project',
    'cliente': 'customer',
    'servicio': 'service',
    'experiencia': 'experience'
  };
  
  // Apply translations
  for (const [foreign, english] of Object.entries(translations)) {
    if (normalized.includes(foreign)) {
      normalized = normalized.replace(foreign, english);
    }
  }
  
  // Generic consolidation patterns
  normalized = normalized
    .replace(/^(digital|online|web|mobile|social)\s+/, '')
    .replace(/\s+(specialist|expert|manager|lead|senior|junior)$/, '')
    .replace(/\s+(skills?|experience|knowledge)$/, '')
    .replace(/^(advanced|intermediate|basic|senior|junior)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize first letter of each word
  return normalized
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function SkillsDemandAnalysis({ skillsByCategory }: SkillsDemandAnalysisProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showAllSkills, setShowAllSkills] = useState<Record<string, boolean>>({});
  const [expandedSkills, setExpandedSkills] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleShowAll = (category: string) => {
    setShowAllSkills(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleSkillContext = (skillName: string) => {
    setExpandedSkills(prev => ({
      ...prev,
      [skillName]: !prev[skillName]
    }));
  };

  const INITIAL_DISPLAY_COUNT = 5;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Skills Demand Analysis</h2>
      <div className="space-y-3">
        {skillsByCategory.map((categoryData: CategoryData) => {
          const isExpanded = expandedCategories[categoryData.category] ?? true; // Default expanded
          const showAll = showAllSkills[categoryData.category] ?? false;
          const displaySkills = showAll 
            ? categoryData.skills 
            : categoryData.skills.slice(0, INITIAL_DISPLAY_COUNT);
          const hasMore = categoryData.skills.length > INITIAL_DISPLAY_COUNT;

          return (
            <div key={categoryData.category} className="bg-white border border-gray-100 rounded-lg">
              {/* Category Header - Clickable */}
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCategory(categoryData.category)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{categoryData.category}</h3>
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                    {categoryData.total_percentage}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">
                    {categoryData.skill_count} skills
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Skills in Category - Collapsible */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-3">
                  <div className="space-y-2">
                    {displaySkills.map((skill: Skill, skillIndex: number) => {
                      const normalizedSkillName = normalizeSkillName(skill.skill);
                      const hasContext = skill.context && skill.context.description && skill.context.tools;
                      const isSkillExpanded = expandedSkills[skill.skill] ?? false;
                      
                      // Convert strings to numbers safely
                      const percentage = typeof skill.percentage === 'string' ? parseInt(skill.percentage) || 0 : skill.percentage;
                      const demand = typeof skill.demand === 'string' ? parseInt(skill.demand) || 0 : skill.demand;
                      
                      return (
                        <div key={skill.skill} className="border border-gray-50 rounded">
                          <div 
                            className={`flex items-center gap-3 p-2 transition-colors ${
                              hasContext ? 'cursor-pointer hover:bg-gray-25' : ''
                            }`}
                            onClick={hasContext ? () => toggleSkillContext(skill.skill) : undefined}
                          >
                            {/* Skill Name with Info Icon */}
                            <div className="flex items-center gap-1 flex-shrink-0 w-40">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {normalizedSkillName}
                              </span>
                              {hasContext && (
                                <Info className="h-3 w-3 text-gray-400 hover:text-blue-600 transition-colors" />
                              )}
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="flex-1 bg-gray-100 rounded-full h-3 relative min-w-0">
                              <div 
                                className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${Math.max(2, percentage)}%` }}
                              />
                              <div className="absolute inset-0 flex items-center justify-end pr-2">
                                <span className="text-xs font-medium text-white mix-blend-difference">
                                  {percentage}%
                                </span>
                              </div>
                            </div>
                            
                            {/* Job Count */}
                            <div className="flex-shrink-0 w-16 text-xs text-gray-500 text-right">
                              {demand} jobs
                            </div>

                            {/* Expand Indicator - Only show if there's context */}
                            {hasContext && (
                              <div className="flex-shrink-0">
                                {isSkillExpanded ? (
                                  <ChevronUp className="h-3 w-3 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Expandable Skill Context - Only show if context exists */}
                          {isSkillExpanded && hasContext && skill.context && (
                            <div className="px-2 pb-2 border-t border-gray-100 bg-gray-25">
                              <div className="pt-2 space-y-2">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {skill.context.description}
                                </p>
                                {skill.context.tools && skill.context.tools.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 mb-1">Common tools & technologies:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {skill.context.tools.map((tool, index) => (
                                        <span key={index} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                                          {tool}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Show More/Less Toggle */}
                    {hasMore && (
                      <div className="flex justify-center pt-2 border-t border-gray-50">
                        <button
                          onClick={() => toggleShowAll(categoryData.category)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                        >
                          {showAll ? (
                            <>
                              Show Less
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              Show {categoryData.skills.length - INITIAL_DISPLAY_COUNT} More Skills
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}