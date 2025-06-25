import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Award, Target, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface EmployeeSkillSummary {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  total_skills: number;
  avg_proficiency: number;
  top_skills: Array<{
    skill_name: string;
    proficiency_level: number;
  }>;
  skills_match_score?: number;
}

interface PeopleViewProps {
  companyId: string;
  searchTerm: string;
}

export function PeopleView({ companyId, searchTerm }: PeopleViewProps) {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeSkillSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (companyId) {
      fetchEmployeeData();
    }
  }, [companyId]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);

      const { data: employeesData } = await supabase
        .from('employees')
        .select(`
          *,
          users!inner(full_name, email),
          st_employee_skills_profile!left(
            extracted_skills,
            skills_match_score
          )
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (!employeesData) return;

      // Extract unique departments
      const uniqueDepts = new Set<string>();
      
      // Process employee data
      const processedEmployees: EmployeeSkillSummary[] = employeesData.map(emp => {
        if (emp.department) uniqueDepts.add(emp.department);

        const skills = emp.st_employee_skills_profile?.[0]?.extracted_skills || [];
        const totalProficiency = skills.reduce((sum: number, skill: any) => 
          sum + (skill.proficiency_level || 0), 0
        );
        
        const topSkills = skills
          .filter((skill: any) => skill.skill_name)
          .sort((a: any, b: any) => (b.proficiency_level || 0) - (a.proficiency_level || 0))
          .slice(0, 3)
          .map((skill: any) => ({
            skill_name: skill.skill_name,
            proficiency_level: skill.proficiency_level || 0
          }));

        return {
          id: emp.id,
          name: emp.users.full_name,
          email: emp.users.email,
          department: emp.department || 'Unassigned',
          position: emp.position || 'No position',
          total_skills: skills.length,
          avg_proficiency: skills.length > 0 ? totalProficiency / skills.length : 0,
          top_skills: topSkills,
          skills_match_score: emp.st_employee_skills_profile?.[0]?.skills_match_score
        };
      });

      setEmployees(processedEmployees);
      setDepartments(Array.from(uniqueDepts).sort());
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.top_skills.some(skill => 
        skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const getProficiencyLabel = (level: number) => {
    if (level >= 4) return 'Expert';
    if (level >= 3) return 'Advanced';
    if (level >= 2) return 'Intermediate';
    return 'Basic';
  };

  const getProficiencyColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-blue-600';
    if (level >= 2) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
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
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      {/* Employee List */}
      <div className="space-y-3">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No employees found matching your criteria
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div 
              key={employee.id} 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{employee.name}</h3>
                      {employee.skills_match_score && (
                        <Badge variant="outline" className="text-xs">
                          {employee.skills_match_score}% match
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {employee.position} • {employee.department}
                    </p>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1 text-sm">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span>{employee.total_skills} skills</span>
                      </div>
                      
                      {employee.avg_proficiency > 0 && (
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(employee.avg_proficiency / 5) * 100} 
                            className="w-20 h-2"
                          />
                          <span className={`text-sm font-medium ${getProficiencyColor(employee.avg_proficiency)}`}>
                            {employee.avg_proficiency.toFixed(1)}/5
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {employee.top_skills.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">Top skills:</span>
                        {employee.top_skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill.skill_name} - {getProficiencyLabel(skill.proficiency_level)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}