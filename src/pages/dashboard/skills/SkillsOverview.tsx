import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  Users, 
  Target, 
  BookOpen,
  TrendingUp,
  FileText,
  ChevronRight,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface PositionCoverage {
  position_id: string;
  position_title: string;
  position_code: string;
  total_employees: number;
  analyzed_employees: number;
  avg_match_score: number;
}

interface DepartmentSummary {
  department: string;
  total_employees: number;
  analyzed_employees: number;
  avg_skills_match: number;
  critical_gaps: number;
  moderate_gaps: number;
  exceeding_targets: number;
}

interface CriticalSkillsGap {
  skill_name: string;
  employees_with_gap: number;
  avg_proficiency: number;
  gap_severity: 'critical' | 'moderate' | 'minor';
  department: string;
}

interface RecentAnalysis {
  employee_id: string;
  employee_name: string;
  position_title: string;
  skills_match_score: number;
  analyzed_at: string;
}

export default function SkillsOverview() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [analyzedEmployees, setAnalyzedEmployees] = useState(0);
  const [avgMatchScore, setAvgMatchScore] = useState(0);
  const [totalSkills, setTotalSkills] = useState(0);
  const [positionCoverage, setPositionCoverage] = useState<PositionCoverage[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [departmentSummaries, setDepartmentSummaries] = useState<DepartmentSummary[]>([]);
  const [criticalSkillsGaps, setCriticalSkillsGaps] = useState<CriticalSkillsGap[]>([]);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchSkillsData();
    }
  }, [userProfile]);

  const fetchSkillsData = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Get total employees
      const { count: totalCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id);

      setTotalEmployees(totalCount || 0);

      // Get analyzed employees and their data
      const { data: skillsProfiles, error: skillsError } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          employee_id,
          skills_match_score,
          analyzed_at,
          extracted_skills,
          employees!inner(
            id,
            current_position_id,
            company_id,
            users!inner(
              full_name,
              email
            )
          )
        `)
        .eq('employees.company_id', userProfile.company_id)
        .not('analyzed_at', 'is', null);

      if (skillsError) {
        console.error('Error fetching skills profiles:', skillsError);
      }

      if (skillsProfiles) {
        setAnalyzedEmployees(skillsProfiles.length);
        
        // Calculate average match score
        const avgScore = skillsProfiles.reduce((sum, profile) => 
          sum + (parseFloat(profile.skills_match_score) || 0), 0
        ) / skillsProfiles.length;
        setAvgMatchScore(Math.round(avgScore));

        // Count unique skills
        const allSkills = new Set();
        skillsProfiles.forEach(profile => {
          if (Array.isArray(profile.extracted_skills)) {
            profile.extracted_skills.forEach(skill => {
              if (typeof skill === 'string') {
                allSkills.add(skill);
              } else if (skill?.skill_name) {
                allSkills.add(skill.skill_name);
              }
            });
          }
        });
        setTotalSkills(allSkills.size);
      }

      // Get position coverage
      const { data: positions } = await supabase
        .from('st_company_positions')
        .select('id, position_title, position_code')
        .eq('company_id', userProfile.company_id);

      if (positions && skillsProfiles) {
        const coveragePromises = positions.map(async (position) => {
          const positionEmployees = skillsProfiles.filter(
            profile => profile.employees.current_position_id === position.id
          );
          
          const avgMatch = positionEmployees.length > 0
            ? positionEmployees.reduce((sum, emp) => 
                sum + (parseFloat(emp.skills_match_score) || 0), 0
              ) / positionEmployees.length
            : 0;

          // Get total employees in this position
          const { count: positionTotal } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', userProfile.company_id)
            .eq('current_position_id', position.id);

          return {
            position_id: position.id,
            position_title: position.position_title,
            position_code: position.position_code,
            total_employees: positionTotal || 0,
            analyzed_employees: positionEmployees.length,
            avg_match_score: Math.round(avgMatch)
          };
        });

        const coverage = await Promise.all(coveragePromises);
        setPositionCoverage(coverage);
      }

      // Get recent analyses
      if (skillsProfiles) {
        const recent = skillsProfiles
          .map(profile => ({
            employee_id: profile.employee_id,
            employee_name: profile.employees.users?.full_name || 'Unknown',
            position_title: positions?.find(p => p.id === profile.employees.current_position_id)?.position_title || 'Unknown',
            skills_match_score: parseFloat(profile.skills_match_score) || 0,
            analyzed_at: profile.analyzed_at
          }))
          .sort((a, b) => new Date(b.analyzed_at).getTime() - new Date(a.analyzed_at).getTime())
          .slice(0, 5);

        setRecentAnalyses(recent);
      }

      // Fetch department summaries
      await fetchDepartmentSummaries();
      
      // Fetch critical skills gaps
      await fetchCriticalSkillsGaps();

    } catch (error) {
      console.error('Error fetching skills data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load skills data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentSummaries = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data: departmentData, error } = await supabase
        .from('v_department_skills_summary')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('avg_skills_match', { ascending: false });

      if (error) {
        console.error('Error fetching department summaries:', error);
        return;
      }

      if (departmentData) {
        setDepartmentSummaries(departmentData);
      }
    } catch (error) {
      console.error('Error fetching department summaries:', error);
    }
  };

  const fetchCriticalSkillsGaps = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data: gapsData, error } = await supabase
        .from('v_critical_skills_gaps')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('employees_with_gap', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching critical skills gaps:', error);
        return;
      }

      if (gapsData) {
        setCriticalSkillsGaps(gapsData);
      }
    } catch (error) {
      console.error('Error fetching critical skills gaps:', error);
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

  const coveragePercentage = totalEmployees > 0 
    ? Math.round((analyzedEmployees / totalEmployees) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Compact Header with Integrated Metrics */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Skills Analytics</h1>
            <p className="text-sm text-muted-foreground">Team skills development overview</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Coverage</div>
              <div className="text-lg font-semibold">{coveragePercentage}%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Avg Score</div>
              <div className="text-lg font-semibold">{avgMatchScore}%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Analyzed</div>
              <div className="text-lg font-semibold">{analyzedEmployees}</div>
            </div>
          </div>
        </div>
        
        {/* Compact Progress Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>{analyzedEmployees} of {totalEmployees} employees</span>
              <span>{totalSkills} skills • {positionCoverage.length} roles</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${coveragePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Streamlined Department Grid */}
      {departmentSummaries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Departments</h2>
            <span className="text-sm text-muted-foreground">{departmentSummaries.length} teams</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {departmentSummaries.map((dept) => {
              const getDepartmentIcon = (deptName: string) => {
                switch (deptName.toLowerCase()) {
                  case 'finance': return '💼';
                  case 'engineering': return '🔧';
                  case 'marketing': return '📢';
                  case 'operations': return '⚙️';
                  default: return '🏢';
                }
              };

              const getScoreColor = (score: number) => {
                if (score >= 80) return 'text-green-600';
                if (score >= 60) return 'text-orange-600';
                return 'text-red-600';
              };

              const getStatusIndicator = (dept: typeof departmentSummaries[0]) => {
                if (dept.critical_gaps > 0) return { color: 'bg-red-500', label: `${dept.critical_gaps} critical` };
                if (dept.moderate_gaps > 0) return { color: 'bg-orange-500', label: `${dept.moderate_gaps} moderate` };
                return { color: 'bg-green-500', label: 'Good' };
              };

              const status = getStatusIndicator(dept);

              return (
                <div
                  key={dept.department}
                  className="bg-card border rounded-lg p-3 hover:shadow-md cursor-pointer transition-all duration-200 hover:border-primary/20"
                  onClick={() => navigate(`/dashboard/skills/department/${encodeURIComponent(dept.department)}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{getDepartmentIcon(dept.department)}</span>
                      <span className="font-medium text-sm">{dept.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.color}`} />
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xl font-bold ${getScoreColor(dept.avg_skills_match)}`}>
                      {Math.round(dept.avg_skills_match)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dept.analyzed_employees}/{dept.total_employees} people
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{status.label}</span>
                    <div className="h-1 w-16 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 rounded-full ${
                          dept.avg_skills_match >= 80 ? 'bg-green-500' :
                          dept.avg_skills_match >= 60 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${dept.avg_skills_match}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Critical Skills Gaps - Compact */}
      {criticalSkillsGaps.length > 0 && (
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Priority Skills</h2>
            <span className="text-sm text-muted-foreground">{criticalSkillsGaps.length} gaps found</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {criticalSkillsGaps.slice(0, 6).map((gap) => {
              const getSeverityColor = (severity: string) => {
                switch (severity) {
                  case 'critical': return 'border-red-200 bg-red-50';
                  case 'moderate': return 'border-orange-200 bg-orange-50';
                  default: return 'border-yellow-200 bg-yellow-50';
                }
              };

              const getSeverityDot = (severity: string) => {
                switch (severity) {
                  case 'critical': return 'bg-red-500';
                  case 'moderate': return 'bg-orange-500';
                  default: return 'bg-yellow-500';
                }
              };

              return (
                <div key={`${gap.skill_name}-${gap.department}`} 
                     className={`border rounded-lg p-2 ${getSeverityColor(gap.gap_severity)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getSeverityDot(gap.gap_severity)}`} />
                      <span className="font-medium text-sm">{gap.skill_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{gap.avg_proficiency}/5</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {gap.department} • {gap.employees_with_gap} people
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Compact Position Coverage & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Position Coverage */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Position Coverage</h2>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/dashboard/onboarding')}
              className="h-7 px-2 text-xs"
            >
              Analyze More
            </Button>
          </div>
          <div className="space-y-2">
            {positionCoverage.slice(0, 4).map((position) => {
              const coveragePercent = position.total_employees > 0
                ? Math.round((position.analyzed_employees / position.total_employees) * 100)
                : 0;

              return (
                <div key={position.position_id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate">{position.position_title}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {position.analyzed_employees}/{position.total_employees}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300 rounded-full"
                        style={{ width: `${coveragePercent}%` }}
                      />
                    </div>
                  </div>
                  {position.analyzed_employees > 0 && (
                    <span className="text-sm font-medium ml-3">
                      {position.avg_match_score}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Analysis Activity */}
        {recentAnalyses.length > 0 && (
          <div className="bg-card rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {recentAnalyses.slice(0, 4).map((analysis) => (
                <div key={analysis.employee_id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{analysis.employee_name}</p>
                    <p className="text-xs text-muted-foreground">{analysis.position_title}</p>
                  </div>
                  <div className="text-right ml-2">
                    <div className={`text-sm font-medium ${
                      analysis.skills_match_score >= 80 ? 'text-green-600' :
                      analysis.skills_match_score >= 60 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {Math.round(analysis.skills_match_score)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(analysis.analyzed_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compact Actions */}
      <div className="flex justify-center gap-2 pt-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/dashboard/skills/employees')}
          className="h-8 px-3 text-xs"
        >
          <Users className="h-3 w-3 mr-1" />
          All Employees
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/dashboard/skills/positions')}
          className="h-8 px-3 text-xs"
        >
          <Target className="h-3 w-3 mr-1" />
          Positions
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/dashboard/skills/report')}
          className="h-8 px-3 text-xs"
        >
          <FileText className="h-3 w-3 mr-1" />
          Export
        </Button>
      </div>
    </div>
  );
}