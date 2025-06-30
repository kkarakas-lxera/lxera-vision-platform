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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Skills Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track and analyze your team's skills development
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Skills Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {analyzedEmployees} of {totalEmployees} employees analyzed
                </span>
                <span className="text-sm font-medium">{coveragePercentage}%</span>
              </div>
              <Progress value={coveragePercentage} className="h-2" />
            </div>
            {analyzedEmployees > 0 && (
              <div className="text-center py-4">
                <div className="text-3xl font-bold">{avgMatchScore}%</div>
                <div className="text-sm text-muted-foreground">average skills match</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Analyzed
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyzedEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {totalEmployees} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Match Score
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMatchScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              average match
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Skills
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSkills}</div>
            <p className="text-xs text-muted-foreground mt-1">
              unique skills tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Positions
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positionCoverage.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              roles defined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Position Coverage */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Position Coverage</CardTitle>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => navigate('/dashboard/onboarding')}
            >
              Analyze More
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positionCoverage.map((position) => {
              const coveragePercent = position.total_employees > 0
                ? Math.round((position.analyzed_employees / position.total_employees) * 100)
                : 0;

              return (
                <div key={position.position_id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{position.position_title}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {position.analyzed_employees} of {position.total_employees} analyzed
                      </span>
                    </div>
                    {position.analyzed_employees > 0 && (
                      <span className="text-sm font-medium">
                        {position.avg_match_score}% avg
                      </span>
                    )}
                  </div>
                  <Progress value={coveragePercent} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Analysis Activity */}
      {recentAnalyses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Analysis Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnalyses.map((analysis) => (
                <div key={analysis.employee_id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{analysis.employee_name}</p>
                    <p className="text-xs text-muted-foreground">{analysis.position_title}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={analysis.skills_match_score >= 80 ? 'default' : 'secondary'}>
                      {Math.round(analysis.skills_match_score)}% match
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(analysis.analyzed_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => navigate('/dashboard/skills/employees')}>
          <Users className="h-4 w-4 mr-2" />
          View All Employees
        </Button>
        <Button variant="outline" onClick={() => navigate('/dashboard/skills/positions')}>
          <Target className="h-4 w-4 mr-2" />
          Position Requirements
        </Button>
        <Button variant="outline" onClick={() => navigate('/dashboard/skills/report')}>
          <FileText className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
}