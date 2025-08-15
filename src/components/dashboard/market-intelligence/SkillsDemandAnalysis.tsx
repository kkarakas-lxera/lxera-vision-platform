import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface Skill {
  skill: string;
  percentage: string | number; // Database stores as string, convert to number
  demand: string | number;     // Database stores as string, convert to number
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

// Universal skill context generator - works for ANY skill
const generateSkillContext = (skillName: string): { description: string; tools: string[] } => {
  const normalizedSkill = skillName.toLowerCase().replace(/[^\w\s]/g, '').trim();
  
  // Programming Languages
  if (normalizedSkill.includes('python')) {
    return { description: 'Versatile programming language for data science, AI, web development, and automation', tools: ['Django', 'Flask', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch'] };
  }
  if (normalizedSkill.includes('javascript')) {
    return { description: 'Essential web programming language for frontend and backend development', tools: ['React', 'Node.js', 'Express', 'Angular', 'Vue.js', 'TypeScript'] };
  }
  if (normalizedSkill.includes('java')) {
    return { description: 'Enterprise-grade programming language for large-scale applications and systems', tools: ['Spring Framework', 'Maven', 'Hibernate', 'Apache Kafka', 'JUnit'] };
  }
  
  // Cloud & Infrastructure
  if (normalizedSkill.includes('aws') || normalizedSkill.includes('amazon web services')) {
    return { description: 'Leading cloud platform for scalable infrastructure and services', tools: ['EC2', 'S3', 'Lambda', 'RDS', 'CloudFormation', 'EKS'] };
  }
  if (normalizedSkill.includes('azure')) {
    return { description: 'Microsoft cloud platform for enterprise applications and services', tools: ['Azure DevOps', 'Azure Functions', 'AKS', 'Azure SQL', 'Power BI'] };
  }
  if (normalizedSkill.includes('docker')) {
    return { description: 'Containerization platform for application deployment and scaling', tools: ['Kubernetes', 'Docker Compose', 'Docker Registry', 'Helm'] };
  }
  
  // Data & Analytics  
  if (normalizedSkill.includes('sql')) {
    return { description: 'Database query language essential for data manipulation and analysis', tools: ['PostgreSQL', 'MySQL', 'SQL Server', 'BigQuery', 'Snowflake'] };
  }
  if (normalizedSkill.includes('machine learning') || normalizedSkill.includes('ml')) {
    return { description: 'AI technique for building predictive models and intelligent systems', tools: ['Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras', 'MLflow'] };
  }
  
  // Frontend Technologies
  if (normalizedSkill.includes('react')) {
    return { description: 'Popular JavaScript library for building user interfaces and web applications', tools: ['Redux', 'React Router', 'Next.js', 'Material-UI', 'Styled Components'] };
  }
  if (normalizedSkill.includes('css')) {
    return { description: 'Styling language for web design and responsive user interfaces', tools: ['Sass', 'Tailwind CSS', 'Bootstrap', 'CSS Grid', 'Flexbox'] };
  }
  
  // Business & Finance
  if (normalizedSkill.includes('finance') || normalizedSkill.includes('financial')) {
    return { description: 'Essential for managing business finances, analysis, and strategic planning', tools: ['Excel', 'SAP', 'QuickBooks', 'Tableau', 'Power BI'] };
  }
  if (normalizedSkill.includes('marketing')) {
    return { description: 'Promoting products/services through research, strategy, and campaigns', tools: ['Google Analytics', 'HubSpot', 'Salesforce', 'Facebook Ads', 'Mailchimp'] };
  }
  if (normalizedSkill.includes('sales')) {
    return { description: 'Building relationships and closing deals to drive business revenue', tools: ['Salesforce', 'HubSpot', 'Pipedrive', 'LinkedIn Sales Navigator', 'Zoom'] };
  }
  
  // Soft Skills
  if (normalizedSkill.includes('communication')) {
    return { description: 'Essential skill for collaboration, presentations, and stakeholder management', tools: ['Slack', 'Microsoft Teams', 'Zoom', 'Confluence', 'Notion'] };
  }
  if (normalizedSkill.includes('leadership')) {
    return { description: 'Guiding teams, making strategic decisions, and driving organizational success', tools: ['Slack', 'Jira', 'Asana', 'Microsoft Project', 'Zoom'] };
  }
  if (normalizedSkill.includes('project management') || normalizedSkill.includes('management')) {
    return { description: 'Planning, organizing, and executing projects from inception to completion', tools: ['Jira', 'Asana', 'Trello', 'Monday.com', 'Microsoft Project'] };
  }
  
  // Generic fallback based on skill category/type
  if (normalizedSkill.includes('problem') || normalizedSkill.includes('solving')) {
    return { description: 'Critical thinking and analytical skills to identify and resolve complex challenges', tools: ['Various analytical tools', 'Methodologies', 'Frameworks'] };
  }
  
  // Default context for any skill not specifically mapped
  return { 
    description: `Professional skill relevant to job requirements and career development in this field`, 
    tools: ['Industry-standard tools', 'Relevant software', 'Professional platforms'] 
  };
};

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
    'analyse': 'analysis',
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
                      const skillContext = generateSkillContext(skill.skill);
                      const isSkillExpanded = expandedSkills[skill.skill] ?? false;
                      
                      // Convert strings to numbers safely
                      const percentage = typeof skill.percentage === 'string' ? parseInt(skill.percentage) || 0 : skill.percentage;
                      const demand = typeof skill.demand === 'string' ? parseInt(skill.demand) || 0 : skill.demand;
                      
                      return (
                        <div key={skill.skill} className="border border-gray-50 rounded">
                          <div 
                            className="flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-25 transition-colors"
                            onClick={() => toggleSkillContext(skill.skill)}
                          >
                            {/* Skill Name with Info Icon */}
                            <div className="flex items-center gap-1 flex-shrink-0 w-40">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {normalizedSkillName}
                              </span>
                              <Info className="h-3 w-3 text-gray-400 hover:text-blue-600 transition-colors" />
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

                            {/* Expand Indicator */}
                            <div className="flex-shrink-0">
                              {isSkillExpanded ? (
                                <ChevronUp className="h-3 w-3 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                          
                          {/* Expandable Skill Context */}
                          {isSkillExpanded && (
                            <div className="px-2 pb-2 border-t border-gray-100 bg-gray-25">
                              <div className="pt-2 space-y-2">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                  {skillContext.description}
                                </p>
                                {skillContext.tools.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-600 mb-1">Common tools & technologies:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {skillContext.tools.map((tool, index) => (
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