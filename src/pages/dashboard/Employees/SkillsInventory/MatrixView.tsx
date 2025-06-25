import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MatrixData {
  employees: Array<{
    id: string;
    name: string;
    skills: Map<string, number>;
  }>;
  skills: string[];
}

interface MatrixViewProps {
  companyId: string;
  searchTerm: string;
}

export function MatrixView({ companyId, searchTerm }: MatrixViewProps) {
  const [matrixData, setMatrixData] = useState<MatrixData>({ employees: [], skills: [] });
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [skillFilter, setSkillFilter] = useState<string[]>([]);

  useEffect(() => {
    if (companyId) {
      fetchMatrixData();
    }
  }, [companyId, departmentFilter]);

  const fetchMatrixData = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('employees')
        .select(`
          *,
          users!inner(full_name),
          st_employee_skills_profile!left(
            extracted_skills
          )
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (departmentFilter !== 'all') {
        query = query.eq('department', departmentFilter);
      }

      const { data: employeesData } = await query;

      if (!employeesData) return;

      // Extract all unique skills and departments
      const allSkills = new Set<string>();
      const uniqueDepts = new Set<string>();
      
      const processedEmployees = employeesData.map(emp => {
        if (emp.department) uniqueDepts.add(emp.department);
        
        const skillsMap = new Map<string, number>();
        
        if (emp.st_employee_skills_profile?.[0]?.extracted_skills) {
          emp.st_employee_skills_profile[0].extracted_skills.forEach((skill: any) => {
            if (skill.skill_name) {
              allSkills.add(skill.skill_name);
              skillsMap.set(skill.skill_name, skill.proficiency_level || 1);
            }
          });
        }
        
        return {
          id: emp.id,
          name: emp.users.full_name,
          skills: skillsMap
        };
      });

      // Sort skills by frequency
      const skillFrequency = new Map<string, number>();
      processedEmployees.forEach(emp => {
        emp.skills.forEach((_, skill) => {
          skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1);
        });
      });

      const sortedSkills = Array.from(allSkills)
        .sort((a, b) => (skillFrequency.get(b) || 0) - (skillFrequency.get(a) || 0))
        .slice(0, 15); // Limit to top 15 skills for display

      setMatrixData({
        employees: processedEmployees,
        skills: sortedSkills
      });
      setDepartments(Array.from(uniqueDepts).sort());
      setSkillFilter(sortedSkills); // Initially show all skills

    } catch (error) {
      console.error('Error fetching matrix data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProficiencyColor = (level: number) => {
    if (level >= 4) return 'bg-green-500';
    if (level >= 3) return 'bg-blue-500';
    if (level >= 2) return 'bg-orange-500';
    if (level >= 1) return 'bg-red-500';
    return 'bg-gray-200';
  };

  const getProficiencyLabel = (level: number) => {
    if (level >= 4) return 'Expert';
    if (level >= 3) return 'Advanced';
    if (level >= 2) return 'Intermediate';
    if (level >= 1) return 'Basic';
    return 'No Skill';
  };

  const exportMatrix = () => {
    // Create CSV content
    const headers = ['Employee', ...skillFilter];
    const rows = matrixData.employees.map(emp => {
      const row = [emp.name];
      skillFilter.forEach(skill => {
        const level = emp.skills.get(skill) || 0;
        row.push(level.toString());
      });
      return row;
    });
    
    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `skills-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter employees based on search term
  const filteredEmployees = matrixData.employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Array.from(emp.skills.keys()).some(skill => 
      skill.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading skills matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="text-sm text-muted-foreground">
            {filteredEmployees.length} employees × {skillFilter.length} skills
          </div>
        </div>
        
        <Button size="sm" variant="outline" onClick={exportMatrix}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Expert</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Advanced</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Intermediate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Basic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span>No Skill</span>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-background border p-2 text-left font-medium">
                Employee
              </th>
              {skillFilter.map(skill => (
                <th key={skill} className="border p-2 text-center font-medium text-sm">
                  <div className="writing-mode-vertical">
                    {skill}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={skillFilter.length + 1} className="text-center py-8 text-muted-foreground">
                  No employees found matching your search
                </td>
              </tr>
            ) : (
              filteredEmployees.map(employee => (
                <tr key={employee.id} className="hover:bg-muted/50">
                  <td className="sticky left-0 bg-background border p-2 font-medium">
                    {employee.name}
                  </td>
                  {skillFilter.map(skill => {
                    const proficiency = employee.skills.get(skill) || 0;
                    return (
                      <td key={skill} className="border p-1 text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div 
                                className={`w-6 h-6 rounded mx-auto ${getProficiencyColor(proficiency)}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{employee.name}</p>
                              <p>{skill}: {getProficiencyLabel(proficiency)}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          max-height: 120px;
        }
      `}</style>
    </div>
  );
}