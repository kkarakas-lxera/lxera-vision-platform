import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  TrendingUp,
  Award,
  BarChart3,
  Target,
  FileText,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TeamStats {
  department: string;
  total_employees: number;
  employees_with_skills: number;
  total_skills: number;
  avg_proficiency: number;
  skill_categories: {
    technical: number;
    leadership: number;
    soft: number;
    domain: number;
  };
  top_skills: Array<{
    skill_name: string;
    employee_count: number;
    avg_proficiency: number;
  }>;
  skill_gaps: Array<{
    skill_name: string;
    required_count: number;
    current_count: number;
    gap: number;
  }>;
}

export function TeamsView() {
  const { userProfile } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchDepartments();
    }
  }, [userProfile]);

  useEffect(() => {
    if (selectedDepartment && userProfile?.company_id) {
      fetchTeamData(selectedDepartment);
    }
  }, [selectedDepartment, userProfile]);

  const fetchDepartments = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('department')
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);

      if (employees) {
        const uniqueDepts = Array.from(
          new Set(employees.map(e => e.department).filter(Boolean))
        ).sort();
        
        setDepartments(uniqueDepts);
        if (uniqueDepts.length > 0) {
          setSelectedDepartment(uniqueDepts[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchTeamData = async (department: string) => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      // Fetch employees in department with their skills
      const { data: teamEmployees } = await supabase
        .from('employees')
        .select(`
          *,
          users!inner(full_name),
          st_employee_skills_profile!left(
            extracted_skills,
            skills_match_score
          ),
          current_position_id,
          target_position_id,
          st_company_positions!current_position_id(
            position_title,
            required_skills
          )
        `)
        .eq('company_id', userProfile.company_id)
        .eq('department', department)
        .eq('is_active', true);

      if (!teamEmployees) return;

      // Process team data
      let totalSkills = 0;
      let totalProficiency = 0;
      let proficiencyCount = 0;
      const skillsMap = new Map<string, { count: number; totalProficiency: number }>();
      const skillCategories = { technical: 0, leadership: 0, soft: 0, domain: 0 };
      
      const employeesWithSkills = teamEmployees.filter(
        emp => emp.st_employee_skills_profile?.length > 0
      ).length;

      teamEmployees.forEach(emp => {
        if (emp.st_employee_skills_profile?.[0]?.extracted_skills) {
          const skills = emp.st_employee_skills_profile[0].extracted_skills;
          
          skills.forEach((skill: any) => {
            if (!skill.skill_name) return;
            
            totalSkills++;
            const proficiency = skill.proficiency_level || 2;
            totalProficiency += proficiency;
            proficiencyCount++;

            // Track skill frequency
            if (!skillsMap.has(skill.skill_name)) {
              skillsMap.set(skill.skill_name, { count: 0, totalProficiency: 0 });
            }
            const s = skillsMap.get(skill.skill_name)!;
            s.count++;
            s.totalProficiency += proficiency;

            // Categorize skills
            const category = skill.category || skill.skill_type || 'technical';
            if (category.includes('lead') || category.includes('manage')) {
              skillCategories.leadership++;
            } else if (category.includes('soft') || category.includes('communication')) {
              skillCategories.soft++;
            } else if (category.includes('domain') || category.includes('business')) {
              skillCategories.domain++;
            } else {
              skillCategories.technical++;
            }
          });
        }
      });

      // Calculate top skills
      const topSkills = Array.from(skillsMap.entries())
        .map(([name, data]) => ({
          skill_name: name,
          employee_count: data.count,
          avg_proficiency: data.totalProficiency / data.count
        }))
        .sort((a, b) => b.employee_count - a.employee_count)
        .slice(0, 10);

      // Calculate skill gaps (simplified - in production, compare with position requirements)
      const requiredSkills = new Set<string>();
      teamEmployees.forEach(emp => {
        if (emp.st_company_positions?.required_skills) {
          emp.st_company_positions.required_skills.forEach((req: any) => {
            requiredSkills.add(req.skill_name);
          });
        }
      });

      const skillGaps = Array.from(requiredSkills)
        .map(skillName => {
          const current = skillsMap.get(skillName);
          return {
            skill_name: skillName,
            required_count: teamEmployees.length, // Simplified: assume all need it
            current_count: current?.count || 0,
            gap: teamEmployees.length - (current?.count || 0)
          };
        })
        .filter(gap => gap.gap > 0)
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 5);

      setTeamStats({
        department,
        total_employees: teamEmployees.length,
        employees_with_skills: employeesWithSkills,
        total_skills: skillsMap.size,
        avg_proficiency: proficiencyCount > 0 ? totalProficiency / proficiencyCount : 0,
        skill_categories: skillCategories,
        top_skills: topSkills,
        skill_gaps: skillGaps
      });

    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportTeamReport = () => {
    if (!teamStats) return;

    // Create a detailed report
    const report = `Team Skills Report - ${teamStats.department}
Generated: ${new Date().toLocaleDateString()}

Team Overview:
- Total Employees: ${teamStats.total_employees}
- Employees with Skills Data: ${teamStats.employees_with_skills}
- Skills Coverage: ${Math.round((teamStats.employees_with_skills / teamStats.total_employees) * 100)}%
- Total Unique Skills: ${teamStats.total_skills}
- Average Proficiency: ${teamStats.avg_proficiency.toFixed(1)}/5

Top Skills:
${teamStats.top_skills.map((s, i) => 
  `${i + 1}. ${s.skill_name} - ${s.employee_count} people (Avg: ${s.avg_proficiency.toFixed(1)}/5)`
).join('\n')}

Skill Gaps:
${teamStats.skill_gaps.map((g, i) => 
  `${i + 1}. ${g.skill_name} - Need ${g.gap} more people`
).join('\n')}
`;

    // Download as text file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `team-report-${teamStats.department}-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!selectedDepartment && departments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No departments found. Add employees to see team analytics.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5" />
              <CardTitle className="text-lg">Team Analytics</CardTitle>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : teamStats ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Team Size</p>
                    <p className="text-2xl font-bold">{teamStats.total_employees}</p>
                    <p className="text-xs text-muted-foreground">
                      {teamStats.employees_with_skills} profiled
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Skills Coverage</p>
                    <p className="text-2xl font-bold">
                      {Math.round((teamStats.employees_with_skills / teamStats.total_employees) * 100)}%
                    </p>
                    <Progress 
                      value={(teamStats.employees_with_skills / teamStats.total_employees) * 100} 
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Unique Skills</p>
                    <p className="text-2xl font-bold">{teamStats.total_skills}</p>
                    <p className="text-xs text-muted-foreground">Across team</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Avg Proficiency</p>
                    <p className="text-2xl font-bold">{teamStats.avg_proficiency.toFixed(1)}/5</p>
                    <Progress 
                      value={(teamStats.avg_proficiency / 5) * 100} 
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Team Skills Analysis</CardTitle>
                <Button size="sm" variant="outline" onClick={exportTeamReport}>
                  <FileText className="h-4 w-4 mr-1" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="composition" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="composition">Skill Composition</TabsTrigger>
                  <TabsTrigger value="distribution">Top Skills</TabsTrigger>
                  <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
                </TabsList>

                <TabsContent value="composition" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {teamStats.skill_categories.technical}
                      </div>
                      <p className="text-sm text-muted-foreground">Technical Skills</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {teamStats.skill_categories.leadership}
                      </div>
                      <p className="text-sm text-muted-foreground">Leadership Skills</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {teamStats.skill_categories.soft}
                      </div>
                      <p className="text-sm text-muted-foreground">Soft Skills</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {teamStats.skill_categories.domain}
                      </div>
                      <p className="text-sm text-muted-foreground">Domain Skills</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="distribution" className="space-y-4">
                  <div className="space-y-3">
                    {teamStats.top_skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold text-muted-foreground">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">{skill.skill_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Average proficiency: {skill.avg_proficiency.toFixed(1)}/5
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {skill.employee_count} people
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="gaps" className="space-y-4">
                  {teamStats.skill_gaps.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No significant skill gaps identified for this team!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teamStats.skill_gaps.map((gap, idx) => (
                        <div key={idx} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              {gap.skill_name}
                            </h4>
                            <Badge variant="outline" className="text-orange-600">
                              Gap: {gap.gap} people
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Required:</span>
                              <span className="ml-2 font-medium">{gap.required_count}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Current:</span>
                              <span className="ml-2 font-medium">{gap.current_count}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Coverage:</span>
                              <span className="ml-2 font-medium">
                                {Math.round((gap.current_count / gap.required_count) * 100)}%
                              </span>
                            </div>
                          </div>
                          <Progress 
                            value={(gap.current_count / gap.required_count) * 100} 
                            className="mt-2"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}