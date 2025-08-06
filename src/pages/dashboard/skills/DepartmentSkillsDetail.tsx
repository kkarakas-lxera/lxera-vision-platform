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
  AlertTriangle,
  GraduationCap,
  UserPlus,
  Brain,
  FileText,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { parseJsonSkills } from '@/utils/typeGuards';
import { marketSkillsService } from '@/services/marketSkills/MarketSkillsService';
import MarketGapBars from '@/components/dashboard/skills/MarketGapBars';
import type { MarketSkillData } from '@/types/marketSkills';

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
  const [marketGapSkills, setMarketGapSkills] = useState<MarketSkillData[]>([]);
  const [loadingMarketGaps, setLoadingMarketGaps] = useState(false);

  useEffect(() => {
    if (userProfile?.company_id && department) {
      fetchDepartmentData();
      fetchMarketGaps();
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

      const positionsMap = new Map();
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

          // Extract technical and soft skills using safe parsing
          const allSkills = parseJsonSkills(skillsProfile.extracted_skills);
          const technicalSkills = allSkills.filter(skill => skill.category === 'technical');
          const softSkills = allSkills.filter(skill => skill.category === 'soft');

          return {
            employee_id: emp.id,
            skills_match_score: skillsProfile.skills_match_score || 0,
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
            const skillName = skill.skill_name;
            const proficiency = skill.proficiency_level || 3;
            
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
            const skillName = skill.skill_name;
            const proficiency = skill.proficiency_level || 3;
            
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

  const fetchMarketGaps = async () => {
    if (!userProfile?.company_id || !department) return;

    setLoadingMarketGaps(true);
    try {
      // Get company industry
      const { data: companyData } = await supabase
        .from('companies')
        .select('industry')
        .eq('id', userProfile.company_id)
        .single();

      // Get all employees' skills for this department
      const { data: employeeSkills } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          extracted_skills,
          employees!inner(
            company_id,
            department
          )
        `)
        .eq('employees.company_id', userProfile.company_id)
        .eq('employees.department', decodeURIComponent(department))
        .not('extracted_skills', 'is', null);

      // Aggregate all skills
      const allSkills = employeeSkills?.flatMap(profile => 
        parseJsonSkills(profile.extracted_skills)
      ) || [];

      // Get market gaps
      const marketGap = await marketSkillsService.getDepartmentMarketGaps(
        decodeURIComponent(department),
        companyData?.industry,
        allSkills
      );

      setMarketGapSkills(marketGap.skills);
    } catch (error) {
      console.error('Error fetching market gaps:', error);
    } finally {
      setLoadingMarketGaps(false);
    }
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
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center gap-3 mb-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard/skills')}
            className="h-7 w-7 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-xl">{getDepartmentIcon(department)}</span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {decodeURIComponent(department)}
            </h1>
            <p className="text-sm text-muted-foreground">Department Skills Analysis</p>
          </div>
        </div>
        
        {/* Inline Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-lg font-bold">{departmentStats.totalEmployees}</div>
              <div className="text-xs text-muted-foreground">Team Size</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {departmentStats.analyzedEmployees}/{departmentStats.totalEmployees}
              </div>
              <div className="text-xs text-muted-foreground">Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{departmentStats.criticalGaps}</div>
              <div className="text-xs text-muted-foreground">Critical Gaps</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{departmentStats.moderateGaps}</div>
              <div className="text-xs text-muted-foreground">Moderate Gaps</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {departmentStats.criticalGaps > 5 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Action needed
              </Badge>
            )}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Department Health</div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={departmentStats.avgScore} 
                  className="w-20 h-2"
                />
                <span className="text-sm font-bold">{departmentStats.avgScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Skills Gap Section */}
      {marketGapSkills.length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Market Skills Comparison</h2>
            <Badge variant="outline" className="text-xs">
              <Brain className="h-3 w-3 mr-1" />
              2025 Market Data
            </Badge>
          </div>
          <MarketGapBars
            skills={marketGapSkills}
            role={decodeURIComponent(department)}
            showSource={true}
            className="text-sm"
          />
        </div>
      )}

      {/* Dense Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compact Skills Analysis */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Skills Analysis</h2>
            <span className="text-sm text-muted-foreground">{skillBreakdown.length} skills</span>
          </div>
          <div className="space-y-2">
            {skillBreakdown.slice(0, 8).map((skill) => {
              const needsTraining = skill.below_target_count > 0;
              const groupSize = skill.below_target_count;
              const isUrgent = skill.avg_proficiency < 2;
              
              return (
                <div key={skill.skill_name} className="border-b border-border/50 pb-2 last:border-b-0">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.skill_name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        skill.skill_type === 'technical' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {skill.skill_type === 'technical' ? 'Tech' : 'Soft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{skill.employees_count} have skill</span>
                      {needsTraining && (
                        <Badge variant={isUrgent ? "destructive" : "secondary"} className="text-xs px-1">
                          {skill.below_target_count} need training
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          skill.avg_proficiency < 2 ? 'bg-red-500' : 
                          skill.avg_proficiency < 3 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(skill.avg_proficiency / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-8">{skill.avg_proficiency.toFixed(1)}</span>
                  </div>
                  {needsTraining && (
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-gray-600">
                        {groupSize > 5 ? (
                          <>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              Group training ({groupSize} people)
                            </span>
                            <span className="text-green-600">~$2K total</span>
                          </>
                        ) : (
                          <>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Individual coaching
                            </span>
                            <span className="text-blue-600">~$500/person</span>
                          </>
                        )}
                      </div>
                      {isUrgent && (
                        <Badge variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Team Members */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Team Members</h2>
            <span className="text-sm text-muted-foreground">{employees.length} people</span>
          </div>
          <div className="space-y-2">
            {employees.map((employee) => {
              const readinessLevel = employee.skills_match_score >= 80 ? 'ready' : 
                                   employee.skills_match_score >= 60 ? 'developing' : 'needs-support';
              const skillsCount = (employee.technical_skills?.length || 0) + (employee.soft_skills?.length || 0);
              
              return (
                <div key={employee.employee_id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{employee.employee_name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{employee.position_title}</span>
                      <span>{skillsCount} skills</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {readinessLevel === 'ready' && (
                      <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Ready
                      </Badge>
                    )}
                    {readinessLevel === 'developing' && (
                      <Badge variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                        Developing
                      </Badge>
                    )}
                    {readinessLevel === 'needs-support' && (
                      <Badge variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                        Support needed
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
