import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Users, 
  Target,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface DepartmentEmployee {
  employee_id: string;
  employee_name: string;
  position_title: string;
  skills_match_score: number;
  analyzed_at: string;
  technical_skills: any[];
  soft_skills: any[];
}

interface DepartmentSkillBreakdown {
  skill_name: string;
  employees_count: number;
  avg_proficiency: number;
  below_target_count: number;
  skill_type: 'technical' | 'soft';
}

export default function DepartmentSkillsDetail() {
  const { department } = useParams<{ department: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<DepartmentEmployee[]>([]);
  const [skillBreakdown, setSkillBreakdown] = useState<DepartmentSkillBreakdown[]>([]);
  const [departmentStats, setDepartmentStats] = useState({
    totalEmployees: 0,
    analyzedEmployees: 0,
    avgScore: 0,
    criticalGaps: 0,
    moderateGaps: 0
  });

  useEffect(() => {
    if (userProfile?.company_id && department) {
      fetchDepartmentData();
    }
  }, [userProfile, department]);

  const fetchDepartmentData = async () => {
    if (!userProfile?.company_id || !department) return;

    try {
      setLoading(true);

      // First fetch employees in the department
      const { data: employeesInDept, error: empError } = await supabase
        .from('employees')
        .select(`
          id,
          department,
          current_position_id,
          user_id,
          users!employees_user_id_fkey(full_name)
        `)
        .eq('company_id', userProfile.company_id)
        .eq('department', decodeURIComponent(department));

      if (empError) {
        console.error('Error fetching employees:', empError);
        throw empError;
      }

      if (!employeesInDept?.length) {
        setEmployees([]);
        setDepartmentStats({
          totalEmployees: 0,
          analyzedEmployees: 0,
          avgScore: 0,
          criticalGaps: 0,
          moderateGaps: 0
        });
        setLoading(false);
        return;
      }

      const employeeIds = employeesInDept.map(emp => emp.id);

      // Fetch skills profiles for these employees
      const { data: skillsData, error: skillsError } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          employee_id,
          skills_match_score,
          analyzed_at,
          extracted_skills
        `)
        .in('employee_id', employeeIds)
        .not('analyzed_at', 'is', null);

      if (skillsError) {
        console.error('Error fetching skills profiles:', skillsError);
        throw skillsError;
      }

      // Fetch positions for these employees
      const positionIds = employeesInDept
        .map(emp => emp.current_position_id)
        .filter(Boolean);

      let positionsMap = new Map();
      if (positionIds.length > 0) {
        const { data: positionsData } = await supabase
          .from('st_company_positions')
          .select('id, position_title')
          .in('id', positionIds);

        if (positionsData) {
          positionsData.forEach(pos => {
            positionsMap.set(pos.id, pos.position_title);
          });
        }
      }

      // Combine the data
      const employeesData = employeesInDept
        .map(emp => {
          const skillsProfile = skillsData?.find(sp => sp.employee_id === emp.id);
          if (!skillsProfile) return null;

          // Extract technical and soft skills from extracted_skills array
          const extractedSkills = Array.isArray(skillsProfile.extracted_skills) ? skillsProfile.extracted_skills : [];
          const technicalSkills = extractedSkills.filter(skill => skill?.category === 'technical');
          const softSkills = extractedSkills.filter(skill => skill?.category === 'soft');

          return {
            employee_id: emp.id,
            skills_match_score: parseFloat(skillsProfile.skills_match_score) || 0,
            analyzed_at: skillsProfile.analyzed_at,
            technical_skills: technicalSkills,
            soft_skills: softSkills,
            employees: {
              id: emp.id,
              department: emp.department,
              current_position_id: emp.current_position_id,
              users: emp.users,
              position_title: positionsMap.get(emp.current_position_id) || 'Not Assigned'
            }
          };
        })
        .filter(Boolean);

      const formattedEmployees = employeesData.map(profile => ({
        employee_id: profile.employee_id,
        employee_name: profile.employees.users?.full_name || 'Unknown',
        position_title: profile.employees.position_title || 'Not Assigned',
        skills_match_score: profile.skills_match_score,
        analyzed_at: profile.analyzed_at,
        technical_skills: profile.technical_skills,
        soft_skills: profile.soft_skills
      }));

      setEmployees(formattedEmployees);

      // Calculate department stats
      const totalAnalyzed = formattedEmployees.length;
      const totalInDept = employeesInDept.length;
      const avgScore = totalAnalyzed > 0 
        ? formattedEmployees.reduce((sum, emp) => sum + emp.skills_match_score, 0) / totalAnalyzed 
        : 0;
      const criticalCount = formattedEmployees.filter(emp => emp.skills_match_score < 50).length;
      const moderateCount = formattedEmployees.filter(emp => emp.skills_match_score >= 50 && emp.skills_match_score < 70).length;

      setDepartmentStats({
        totalEmployees: totalInDept,
        analyzedEmployees: totalAnalyzed,
        avgScore: Math.round(avgScore),
        criticalGaps: criticalCount,
        moderateGaps: moderateCount
      });

      // Generate skill breakdown
      const skillMap = new Map<string, { total: number; proficiencies: number[]; type: 'technical' | 'soft' }>();

      formattedEmployees.forEach(employee => {
        // Process technical skills
        if (Array.isArray(employee.technical_skills)) {
          employee.technical_skills.forEach(skill => {
            const skillName = typeof skill === 'string' ? skill : skill?.skill_name;
            const proficiency = typeof skill === 'object' ? (skill?.proficiency_level || 3) : 3;
            
            if (skillName) {
              if (!skillMap.has(skillName)) {
                skillMap.set(skillName, { total: 0, proficiencies: [], type: 'technical' });
              }
              const existing = skillMap.get(skillName)!;
              existing.total++;
              existing.proficiencies.push(proficiency);
            }
          });
        }

        // Process soft skills
        if (Array.isArray(employee.soft_skills)) {
          employee.soft_skills.forEach(skill => {
            const skillName = typeof skill === 'string' ? skill : skill?.skill_name;
            const proficiency = typeof skill === 'object' ? (skill?.proficiency_level || 3) : 3;
            
            if (skillName) {
              if (!skillMap.has(skillName)) {
                skillMap.set(skillName, { total: 0, proficiencies: [], type: 'soft' });
              }
              const existing = skillMap.get(skillName)!;
              existing.total++;
              existing.proficiencies.push(proficiency);
            }
          });
        }
      });

      // Convert to breakdown format
      const breakdown: DepartmentSkillBreakdown[] = Array.from(skillMap.entries())
        .map(([skillName, data]) => ({
          skill_name: skillName,
          employees_count: data.total,
          avg_proficiency: data.proficiencies.reduce((sum, p) => sum + p, 0) / data.proficiencies.length,
          below_target_count: data.proficiencies.filter(p => p < 4).length,
          skill_type: data.type
        }))
        .filter(skill => skill.employees_count >= 1) // Show all skills
        .sort((a, b) => b.below_target_count - a.below_target_count);

      setSkillBreakdown(breakdown);

    } catch (error) {
      console.error('Error fetching department data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load department data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getDepartmentIcon = (deptName: string) => {
    switch (deptName?.toLowerCase()) {
      case 'finance': return '💼';
      case 'engineering': return '🔧';
      case 'marketing': return '📢';
      case 'operations': return '⚙️';
      default: return '🏢';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Department not specified</p>
        <Button onClick={() => navigate('/dashboard/skills')} className="mt-4">
          Back to Skills Overview
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/skills')}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getDepartmentIcon(department)}</span>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {decodeURIComponent(department)} Department
            </h1>
            <p className="text-muted-foreground">
              Skills analysis and performance breakdown
            </p>
          </div>
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total People
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentStats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {departmentStats.analyzedEmployees} analyzed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentStats.avgScore}%</div>
            <Progress value={departmentStats.avgScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Critical Gaps
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {departmentStats.criticalGaps}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              below 50% match
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Moderate Gaps
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {departmentStats.moderateGaps}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              50-70% match
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills Analysis</CardTitle>
            <p className="text-sm text-muted-foreground">
              Skills performance breakdown for {decodeURIComponent(department)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillBreakdown.slice(0, 8).map((skill) => (
                <div key={skill.skill_name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.skill_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {skill.skill_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {skill.employees_count} people
                      </span>
                      {skill.below_target_count > 0 && (
                        <span className="text-xs text-red-600">
                          {skill.below_target_count} need training
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={(skill.avg_proficiency / 5) * 100} 
                    className={`h-2 ${
                      skill.avg_proficiency < 2 ? '[&>div]:bg-red-500' : 
                      skill.avg_proficiency < 3 ? '[&>div]:bg-orange-500' : ''
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* People in Department */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
            <p className="text-sm text-muted-foreground">
              Individual performance overview
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.map((employee) => (
                <div key={employee.employee_id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{employee.employee_name}</p>
                    <p className="text-xs text-muted-foreground">{employee.position_title}</p>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        employee.skills_match_score >= 80 ? 'default' : 
                        employee.skills_match_score >= 60 ? 'secondary' : 'destructive'
                      }
                    >
                      {Math.round(employee.skills_match_score)}% match
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(employee.analyzed_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}