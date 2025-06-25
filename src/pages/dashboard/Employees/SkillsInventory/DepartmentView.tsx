import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Users, Award } from 'lucide-react';

interface DepartmentSkills {
  department: string;
  employeeCount: number;
  skillsCount: number;
  coverage: number;
  topSkills: Array<{
    skill_name: string;
    count: number;
    avgProficiency: number;
  }>;
}

interface DepartmentViewProps {
  data: DepartmentSkills[];
  loading: boolean;
  searchTerm: string;
}

export function DepartmentView({ data, loading, searchTerm }: DepartmentViewProps) {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  const toggleDepartment = (dept: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(dept)) {
      newExpanded.delete(dept);
    } else {
      newExpanded.add(dept);
    }
    setExpandedDepts(newExpanded);
  };

  const filteredData = data.filter(dept => 
    dept.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.topSkills.some(skill => 
      skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getProficiencyColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-blue-600';
    if (level >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProficiencyLabel = (level: number) => {
    if (level >= 4) return 'Expert';
    if (level >= 3) return 'Advanced';
    if (level >= 2) return 'Intermediate';
    return 'Basic';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredData.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No departments found matching your search
        </div>
      ) : (
        filteredData.map((dept) => (
          <div key={dept.department} className="border rounded-lg overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleDepartment(dept.department)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    {expandedDepts.has(dept.department) ? 
                      <ChevronDown className="h-4 w-4" /> : 
                      <ChevronRight className="h-4 w-4" />
                    }
                  </Button>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      {dept.department}
                      <Badge variant="outline" className="text-xs">
                        {dept.employeeCount} people
                      </Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {dept.skillsCount} unique skills tracked
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Coverage</div>
                  <div className="flex items-center gap-2">
                    <Progress value={dept.coverage} className="w-20" />
                    <span className="text-sm font-medium">{dept.coverage}%</span>
                  </div>
                </div>
              </div>
            </div>

            {expandedDepts.has(dept.department) && (
              <div className="border-t px-4 py-3 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Top Skills in Department
                    </h4>
                    <div className="space-y-2">
                      {dept.topSkills.map((skill, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{skill.skill_name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {skill.count}
                            </Badge>
                            <span className={`text-xs font-medium ${getProficiencyColor(skill.avgProficiency)}`}>
                              {getProficiencyLabel(skill.avgProficiency)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Skills per person:</span>
                        <span className="font-medium">
                          {dept.employeeCount > 0 
                            ? Math.round(dept.skillsCount / dept.employeeCount)
                            : 0
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Employees with skills:</span>
                        <span className="font-medium">
                          {Math.round(dept.employeeCount * dept.coverage / 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline">
                    View People
                  </Button>
                  <Button size="sm" variant="outline">
                    Skills Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}