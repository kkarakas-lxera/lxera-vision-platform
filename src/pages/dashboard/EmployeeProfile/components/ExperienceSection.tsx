import React from 'react';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Building, MapPin, ChevronRight } from 'lucide-react';

interface ExperienceSectionProps {
  employee: {
    profile_data?: {
      work_experience?: Array<{
        position?: string;
        title?: string; // Support both field names
        company: string;
        location?: string;
        start_date?: string;
        end_date?: string;
        duration?: string; // Support duration field
        is_current?: boolean;
        description?: string;
        technologies?: string[];
      }>;
      current_work?: {
        projects?: Array<string> | Array<{
          name: string;
          description?: string;
          role?: string;
          technologies?: string[];
        }>;
        teamSize?: string;
        roleInTeam?: string;
      };
    };
  };
}

export function ExperienceSection({ employee }: ExperienceSectionProps) {
  const workExperience = employee.profile_data?.work_experience || [];
  const currentProjects = employee.profile_data?.current_work?.projects || [];
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0 && remainingMonths > 0) {
      return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `${years} yr${years > 1 ? 's' : ''}`;
    } else {
      return `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
    }
  };

  const summary = workExperience.length > 0 
    ? `${workExperience.length} positions • ${workExperience[0]?.company} (${workExperience[0]?.duration?.includes('Current') ? 'Current' : 'Previous'})`
    : 'No work experience data available';

  return (
    <CollapsibleCard
      title="Professional Experience"
      icon={<Briefcase className="h-5 w-5" />}
      summary={summary}
    >
      <div className="space-y-3">
        {workExperience.length === 0 && currentProjects.length === 0 ? (
          <p className="text-muted-foreground text-center py-6 text-sm">
            No work experience data available
          </p>
        ) : (
          <>
            {/* Work Experience - Compact Timeline */}
            {workExperience.length > 0 && (
              <div className="space-y-2">
                {workExperience.map((exp, index) => (
                  <div key={index} className="group relative hover:bg-gray-50/50 rounded-lg transition-colors p-3 -mx-3">
                    {/* Timeline connector */}
                    {index < workExperience.length - 1 && (
                      <div className="absolute left-[18px] top-[38px] bottom-[-8px] w-[1px] bg-gray-200" />
                    )}
                    
                    <div className="flex gap-3">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 mt-1.5">
                        <div className="w-2 h-2 rounded-full bg-gray-400 group-hover:bg-primary transition-colors" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm leading-tight">{exp.position || exp.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <span className="font-medium">{exp.company}</span>
                              {exp.location && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span>{exp.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {exp.duration || (exp.start_date ? 
                              `${formatDate(exp.start_date)} - ${exp.is_current ? 'Present' : formatDate(exp.end_date || '')}` 
                              : 'Duration')}
                          </div>
                        </div>
                        
                        {/* Description - more compact */}
                        {exp.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-1.5">
                            {exp.description}
                          </p>
                        )}
                        
                        {/* Technologies - smaller badges */}
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {exp.technologies.slice(0, 5).map((tech, i) => (
                              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-gray-200">
                                {tech}
                              </Badge>
                            ))}
                            {exp.technologies.length > 5 && (
                              <span className="text-[10px] text-muted-foreground px-1">+{exp.technologies.length - 5}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current Projects - Compact list */}
            {currentProjects.length > 0 && (
              <div className="border-t pt-3 mt-3">
                <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Current Projects</h4>
                <div className="space-y-1.5">
                  {currentProjects.map((project, index) => {
                    // Handle both string and object formats
                    const projectName = typeof project === 'string' ? project : project.name;
                    const projectRole = typeof project === 'object' ? project.role : undefined;
                    const projectDescription = typeof project === 'object' ? project.description : undefined;
                    const projectTechnologies = typeof project === 'object' ? project.technologies : undefined;
                    
                    return (
                      <div key={index} className="flex items-center gap-2 group">
                        <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{projectName}</span>
                            {projectRole && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-gray-200">
                                {projectRole}
                              </Badge>
                            )}
                          </div>
                          {projectDescription && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{projectDescription}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CollapsibleCard>
  );
}