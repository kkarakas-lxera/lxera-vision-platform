import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User,
  Mail,
  Building2,
  Target,
  Search,
  Download,
  FileText,
  Award,
  Calendar,
  ChevronRight,
  Grid,
  List
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface EmployeeProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department: string;
  position: string;
  current_position_title?: string;
  target_position_title?: string;
  skills_count: number;
  avg_proficiency: number;
  skills_match_score?: number;
  last_analyzed?: string;
  top_skills: Array<{
    skill_name: string;
    proficiency_level: number;
  }>;
}

export function IndividualProfiles() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchEmployeeProfiles();
    }
  }, [userProfile]);

  const fetchEmployeeProfiles = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      const { data: employeesData } = await supabase
        .from('employees')
        .select(`
          *,
          users!inner(full_name, email),
          st_employee_skills_profile!left(
            extracted_skills,
            skills_match_score,
            analyzed_at
          ),
          current_position:st_company_positions!current_position_id(position_title),
          target_position:st_company_positions!target_position_id(position_title)
        `)
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);

      if (!employeesData) return;

      // Extract unique departments
      const uniqueDepts = new Set<string>();
      
      // Process employee data
      const profiles: EmployeeProfile[] = employeesData.map(emp => {
        if (emp.department) uniqueDepts.add(emp.department);

        const skills = emp.st_employee_skills_profile?.[0]?.extracted_skills || [];
        const totalProficiency = skills.reduce((sum: number, skill: any) => 
          sum + (skill.proficiency_level || 0), 0
        );
        
        const topSkills = skills
          .filter((skill: any) => skill.skill_name)
          .sort((a: any, b: any) => (b.proficiency_level || 0) - (a.proficiency_level || 0))
          .slice(0, 3);

        return {
          id: emp.id,
          user_id: emp.user_id,
          full_name: emp.users.full_name,
          email: emp.users.email,
          department: emp.department || 'Unassigned',
          position: emp.position || 'No position',
          current_position_title: emp.current_position?.position_title,
          target_position_title: emp.target_position?.position_title,
          skills_count: skills.length,
          avg_proficiency: skills.length > 0 ? totalProficiency / skills.length : 0,
          skills_match_score: emp.st_employee_skills_profile?.[0]?.skills_match_score,
          last_analyzed: emp.st_employee_skills_profile?.[0]?.analyzed_at,
          top_skills: topSkills
        };
      });

      setEmployees(profiles);
      setDepartments(Array.from(uniqueDepts).sort());
    } catch (error) {
      console.error('Error fetching employee profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    
    const matchesSkill = !skillFilter || 
      emp.top_skills.some(skill => 
        skill.skill_name.toLowerCase().includes(skillFilter.toLowerCase())
      );
    
    return matchesSearch && matchesDepartment && matchesSkill;
  });

  const toggleEmployeeSelection = (id: string) => {
    const newSelection = new Set(selectedEmployees);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedEmployees(newSelection);
  };

  const selectAll = () => {
    if (selectedEmployees.size === filteredEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const exportSelected = () => {
    const toExport = selectedEmployees.size > 0 
      ? employees.filter(e => selectedEmployees.has(e.id))
      : filteredEmployees;

    const csv = [
      ['Name', 'Email', 'Department', 'Position', 'Skills Count', 'Avg Proficiency', 'Match Score'],
      ...toExport.map(emp => [
        emp.full_name,
        emp.email,
        emp.department,
        emp.position,
        emp.skills_count,
        emp.avg_proficiency.toFixed(1),
        emp.skills_match_score || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee-profiles-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
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

            <Input
              placeholder="Filter by skill..."
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-48"
            />

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedEmployees.size > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedEmployees.size} employee{selectedEmployees.size > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={exportSelected}>
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedEmployees(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Profiles */}
      <div className="space-y-4">
        {/* Select All */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={selectedEmployees.size === filteredEmployees.length && filteredEmployees.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-sm font-medium">Select All ({filteredEmployees.length})</span>
          </label>
          
          <Button size="sm" variant="outline" onClick={exportSelected}>
            <FileText className="h-4 w-4 mr-1" />
            Export {selectedEmployees.size > 0 ? 'Selected' : 'All'}
          </Button>
        </div>

        {filteredEmployees.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No employees found matching your criteria</p>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {filteredEmployees.map((employee) => (
              <Card 
                key={employee.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedEmployees.has(employee.id)}
                      onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div 
                      className="flex items-center justify-between flex-1"
                      onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-foreground">{employee.full_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {employee.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm font-medium">{employee.position}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {employee.department}
                          </p>
                        </div>

                        <div className="text-center">
                          <div className="text-lg font-bold">{employee.skills_count}</div>
                          <div className="text-xs text-muted-foreground">Skills</div>
                        </div>

                        {employee.skills_match_score && (
                          <div className="text-center">
                            <div className="text-lg font-bold">{employee.skills_match_score}%</div>
                            <div className="text-xs text-muted-foreground">Match</div>
                          </div>
                        )}

                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee) => (
              <Card 
                key={employee.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/dashboard/employees/${employee.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Checkbox
                      checked={selectedEmployees.has(employee.id)}
                      onCheckedChange={() => toggleEmployeeSelection(employee.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <h3 className="font-medium text-foreground mb-1">{employee.full_name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{employee.position}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Department</span>
                      <span className="font-medium">{employee.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Skills</span>
                      <span className="font-medium">{employee.skills_count}</span>
                    </div>
                    {employee.skills_match_score && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Match Score</span>
                        <Badge variant="outline">{employee.skills_match_score}%</Badge>
                      </div>
                    )}
                  </div>

                  {employee.top_skills.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs font-medium mb-2">Top Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {employee.top_skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill.skill_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}