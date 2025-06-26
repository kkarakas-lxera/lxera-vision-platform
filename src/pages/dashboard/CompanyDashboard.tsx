import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  GraduationCap, 
  Target, 
  TrendingUp,
  Upload,
  Building2,
  BarChart3,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface DashboardMetrics {
  totalEmployees: number;
  activeLearningPaths: number;
  skillsCoverage: number;
  avgReadinessScore: number;
  employeesWithCVs: number;
  analyzedCVs: number;
  positionsWithGaps: number;
  criticalGaps: number;
}

interface RecentActivity {
  id: string;
  type: 'onboarding' | 'completion' | 'analysis' | 'gap_found';
  message: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface SkillGapOverview {
  position: string;
  position_code: string;
  requiredSkills: number;
  coverage: number;
  employeesInPosition: number;
  avgMatchScore: number;
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeLearningPaths: 0,
    skillsCoverage: 0,
    avgReadinessScore: 0,
    employeesWithCVs: 0,
    analyzedCVs: 0,
    positionsWithGaps: 0,
    criticalGaps: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [skillsGapData, setSkillsGapData] = useState<SkillGapOverview[]>([]);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchDashboardData();
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      // Fetch employees with CV status
      const { data: employees, count: employeeCount } = await supabase
        .from('employees')
        .select(`
          id,
          cv_file_path,
          skills_last_analyzed,
          st_employee_skills_profile (
            skills_match_score,
            career_readiness_score
          )
        `, { count: 'exact' })
        .eq('company_id', userProfile.company_id);

      // Count employees with CVs and analyzed CVs
      const employeesWithCVs = employees?.filter(e => e.cv_file_path)?.length || 0;
      const analyzedCVs = employees?.filter(e => e.skills_last_analyzed)?.length || 0;

      // Fetch active learning paths (course assignments)
      const { count: activePaths } = await supabase
        .from('course_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id)
        .in('status', ['assigned', 'in_progress']);

      // Calculate average scores from actual data
      const avgMatchScore = employees?.length 
        ? employees.reduce((acc, e) => acc + (e.st_employee_skills_profile?.[0]?.skills_match_score || 0), 0) / employees.length
        : 0;

      const avgReadiness = employees?.length
        ? employees.reduce((acc, e) => acc + (e.st_employee_skills_profile?.[0]?.career_readiness_score || 0), 0) / employees.length
        : 0;

      // Fetch gap analysis data using the RPC function
      const { data: gapAnalysis } = await supabase
        .rpc('calculate_skills_gap', {
          p_company_id: userProfile.company_id
        });

      // Count positions with gaps and critical gaps
      const positionsWithGaps = new Set(gapAnalysis?.filter((gap: any) => gap.match_percentage < 80).map((gap: any) => gap.position_code)).size;
      const criticalGaps = gapAnalysis?.filter((gap: any) => gap.match_percentage < 50).length || 0;

      setMetrics({
        totalEmployees: employeeCount || 0,
        activeLearningPaths: activePaths || 0,
        skillsCoverage: Math.round(avgMatchScore),
        avgReadinessScore: Math.round(avgReadiness),
        employeesWithCVs,
        analyzedCVs,
        positionsWithGaps,
        criticalGaps
      });

      // Fetch recent activities
      await fetchRecentActivities();
      
      // Fetch skills gap overview with real data
      await fetchSkillsGapOverview();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Fetch recent import sessions
      const { data: imports } = await supabase
        .from('st_import_sessions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent CV analyses
      const { data: analyses } = await supabase
        .from('cv_analysis_metrics')
        .select(`
          *,
          employees!inner(
            id,
            user_id,
            company_id,
            users!inner(full_name)
          )
        `)
        .eq('employees.company_id', userProfile.company_id)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent gap discoveries
      const { data: recentGaps } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          *,
          employees!inner(
            position,
            users!inner(full_name)
          )
        `)
        .eq('employees.company_id', userProfile.company_id)
        .lt('skills_match_score', 70)
        .order('analyzed_at', { ascending: false })
        .limit(2);

      // Combine and format activities
      const activities: RecentActivity[] = [];

      imports?.forEach(imp => {
        activities.push({
          id: imp.id,
          type: 'onboarding',
          message: `Imported ${imp.successful} employees successfully`,
          timestamp: imp.created_at,
          icon: <Upload className="h-4 w-4" />
        });
      });

      analyses?.forEach(analysis => {
        activities.push({
          id: analysis.id,
          type: 'analysis',
          message: `Analyzed CV for ${analysis.employees.users.full_name} (${analysis.skills_extracted} skills found)`,
          timestamp: analysis.created_at,
          icon: <CheckCircle2 className="h-4 w-4" />
        });
      });

      recentGaps?.forEach(gap => {
        activities.push({
          id: gap.id,
          type: 'gap_found',
          message: `Skills gap identified for ${gap.employees.users.full_name} (${Math.round(gap.skills_match_score)}% match)`,
          timestamp: gap.analyzed_at,
          icon: <AlertTriangle className="h-4 w-4 text-orange-500" />
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchSkillsGapOverview = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Fetch positions with employee counts and gap analysis
      const { data: positions } = await supabase
        .from('st_company_positions')
        .select(`
          *,
          employees!inner(
            id,
            st_employee_skills_profile (
              skills_match_score
            )
          )
        `)
        .eq('company_id', userProfile.company_id);

      if (positions) {
        // Calculate real coverage for each position
        const gapData: SkillGapOverview[] = positions.map(pos => {
          const employeesInPosition = pos.employees?.length || 0;
          const avgMatch = employeesInPosition > 0
            ? pos.employees.reduce((acc: number, emp: any) => 
                acc + (emp.st_employee_skills_profile?.[0]?.skills_match_score || 0), 0
              ) / employeesInPosition
            : 0;

          return {
            position: pos.position_title,
            position_code: pos.position_code,
            requiredSkills: pos.required_skills?.length || 0,
            coverage: Math.round(avgMatch),
            employeesInPosition,
            avgMatchScore: Math.round(avgMatch)
          };
        }).filter(pos => pos.employeesInPosition > 0) // Only show positions with employees
          .sort((a, b) => a.coverage - b.coverage) // Show worst coverage first
          .slice(0, 5); // Top 5

        setSkillsGapData(gapData);
      }
    } catch (error) {
      console.error('Error fetching skills gap data:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {userProfile?.full_name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your team's skills development
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Building2 className="h-3 w-3" />
          Company Admin
        </Badge>
      </div>

      {/* Quick Actions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              size="lg" 
              className="justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/dashboard/onboarding')}
            >
              <div className="bg-primary-foreground/10 p-2 rounded-lg">
                <Upload className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Add Team Members</div>
                <div className="text-xs opacity-70">Import & assess skills</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>

            <Button 
              size="lg"
              variant="outline" 
              className="justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/dashboard/positions')}
            >
              <div className="bg-muted p-2 rounded-lg">
                <Target className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Define Positions</div>
                <div className="text-xs text-muted-foreground">Set skill requirements</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>

            <Button 
              size="lg"
              variant="outline" 
              className="justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/dashboard/employees')}
            >
              <div className="bg-muted p-2 rounded-lg">
                <Brain className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">View Team Skills</div>
                <div className="text-xs text-muted-foreground">Analyze gaps & progress</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - Two Rows */}
      <div className="space-y-4">
        {/* First Row - Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Employees
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.employeesWithCVs} with CVs uploaded
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CV Analysis
                </CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.analyzedCVs}</div>
              <Progress 
                value={metrics.totalEmployees > 0 ? (metrics.analyzedCVs / metrics.totalEmployees) * 100 : 0} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Skills Match
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.skillsCoverage}%</div>
              <Progress value={metrics.skillsCoverage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Career Readiness
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.avgReadinessScore}%</div>
              <Progress value={metrics.avgReadinessScore} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Second Row - Gap Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={metrics.positionsWithGaps > 0 ? "border-orange-200" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Positions with Gaps
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.positionsWithGaps}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Need skill development
              </p>
            </CardContent>
          </Card>

          <Card className={metrics.criticalGaps > 0 ? "border-red-200" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Critical Gaps
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.criticalGaps}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Below 50% match
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Learning
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeLearningPaths}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Courses in progress
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="bg-muted p-2 rounded-full">
                      {activity.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activity. Start by adding team members!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Skills Gap Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Position Skills Coverage</CardTitle>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/dashboard/employees')}
              >
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {skillsGapData.length > 0 ? (
              <div className="space-y-4">
                {skillsGapData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.position}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({item.employeesInPosition} employees)
                        </span>
                      </div>
                      <span className={`font-medium ${
                        item.coverage >= 80 ? 'text-green-600' : 
                        item.coverage >= 60 ? 'text-orange-600' : 
                        'text-red-600'
                      }`}>
                        {item.coverage}%
                      </span>
                    </div>
                    <Progress 
                      value={item.coverage} 
                      className={`h-2 ${
                        item.coverage < 60 ? '[&>div]:bg-red-500' : 
                        item.coverage < 80 ? '[&>div]:bg-orange-500' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  No skills data available yet. Upload CVs and analyze skills to see coverage.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}