import React from 'react';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Calendar, Building, MapPin } from 'lucide-react';

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
      <div className="space-y-6">
        {workExperience.length === 0 && currentProjects.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No work experience data available
          </p>
        ) : (
          <>
            {/* Work Experience Timeline */}
            {workExperience.length > 0 && (
              <div className="space-y-4">
                {workExperience.map((exp, index) => (
                  <div key={index} className="relative">
                    {index < workExperience.length - 1 && (
                      <div className="absolute left-2 top-10 bottom-0 w-0.5 bg-border" />
                    )}
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary mt-1" />
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold">{exp.position || exp.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building className="h-3 w-3" />
                              <span>{exp.company}</span>
                              {exp.location && (
                                <>
                                  <span>•</span>
                                  <MapPin className="h-3 w-3" />
                                  <span>{exp.location}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {exp.duration || (exp.start_date ? 
                                  `${formatDate(exp.start_date)} - ${exp.is_current ? 'Present' : formatDate(exp.end_date || '')}` 
                                  : 'Duration not specified')}
                              </span>
                            </div>
                            {exp.start_date && (
                              <div className="text-xs">
                                {calculateDuration(exp.start_date, exp.is_current ? undefined : exp.end_date)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {exp.description && (
                          <p className="text-sm text-muted-foreground">{exp.description}</p>
                        )}
                        
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {exp.technologies.map((tech, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current Projects */}
            {currentProjects.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Current Projects</h4>
                <div className="grid gap-3">
                  {currentProjects.map((project, index) => {
                    // Handle both string and object formats
                    const projectName = typeof project === 'string' ? project : project.name;
                    const projectRole = typeof project === 'object' ? project.role : undefined;
                    const projectDescription = typeof project === 'object' ? project.description : undefined;
                    const projectTechnologies = typeof project === 'object' ? project.technologies : undefined;
                    
                    return (
                      <div key={index} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <h5 className="font-medium">{projectName}</h5>
                          {projectRole && (
                            <Badge variant="outline" className="text-xs">
                              {projectRole}
                            </Badge>
                          )}
                        </div>
                        {projectDescription && (
                          <p className="text-sm text-muted-foreground">{projectDescription}</p>
                        )}
                        {projectTechnologies && projectTechnologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {projectTechnologies.map((tech: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
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