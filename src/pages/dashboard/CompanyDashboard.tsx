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
  Activity,
  CheckCircle2,
  AlertTriangle
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

      // Set up real-time subscriptions
      const employeesSubscription = supabase
        .channel('dashboard-employees')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'employees',
            filter: `company_id=eq.${userProfile.company_id}`
          },
          () => {
            console.log('Employee data changed, refreshing dashboard...');
            fetchDashboardData();
          }
        )
        .subscribe();

      const profilesSubscription = supabase
        .channel('dashboard-profiles')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'st_employee_skills_profile'
          },
          () => {
            console.log('Skills profile changed, refreshing dashboard...');
            fetchDashboardData();
          }
        )
        .subscribe();

      const assignmentsSubscription = supabase
        .channel('dashboard-assignments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'course_assignments'
          },
          () => {
            console.log('Course assignments changed, refreshing dashboard...');
            fetchDashboardData();
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(employeesSubscription);
        supabase.removeChannel(profilesSubscription);
        supabase.removeChannel(assignmentsSubscription);
      };
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      // Fetch employees first
      const { data: employees, count: employeeCount } = await supabase
        .from('employees')
        .select(`
          id,
          cv_file_path,
          skills_last_analyzed,
          current_position_id
        `, { count: 'exact' })
        .eq('company_id', userProfile.company_id);

      // Count employees with CVs
      const employeesWithCVs = employees?.filter(e => e.cv_file_path)?.length || 0;
      
      // Get employee IDs for skills profile query
      const employeeIds = employees?.map(e => e.id) || [];
      
      // Fetch skills profiles separately to bypass RLS
      const { data: skillsProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select('employee_id, skills_match_score, career_readiness_score, analyzed_at')
        .in('employee_id', employeeIds);

      // Count analyzed CVs (employees with skills profiles)
      const analyzedCVs = skillsProfiles?.length || 0;

      // Calculate averages from skills profiles
      const avgMatchScore = skillsProfiles?.length 
        ? skillsProfiles.reduce((acc, profile) => acc + (parseFloat(profile.skills_match_score) || 0), 0) / skillsProfiles.length
        : 0;

      const avgReadiness = skillsProfiles?.length
        ? skillsProfiles.reduce((acc, profile) => acc + (parseFloat(profile.career_readiness_score) || 0), 0) / skillsProfiles.length
        : 0;

      // Fetch active learning paths through employees join
      const { data: activeAssignments } = await supabase
        .from('course_assignments')
        .select('id, employee_id')
        .in('employee_id', employeeIds)
        .in('status', ['assigned', 'in_progress']);

      const activePaths = activeAssignments?.length || 0;

      // Calculate positions with gaps manually
      const { data: positions } = await supabase
        .from('st_company_positions')
        .select('id, position_title')
        .eq('company_id', userProfile.company_id);

      let positionsWithGaps = 0;
      let criticalGaps = 0;

      if (positions && skillsProfiles) {
        // Create a map of employee positions to match scores
        const positionScores = new Map();
        
        for (const employee of employees || []) {
          if (employee.current_position_id) {
            const profile = skillsProfiles.find(p => p.employee_id === employee.id);
            if (profile) {
              const score = parseFloat(profile.skills_match_score) || 0;
              if (!positionScores.has(employee.current_position_id)) {
                positionScores.set(employee.current_position_id, []);
              }
              positionScores.get(employee.current_position_id).push(score);
            }
          }
        }

        // Calculate average scores per position
        for (const [positionId, scores] of positionScores) {
          const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          if (avgScore < 80) positionsWithGaps++;
          if (avgScore < 50) criticalGaps += scores.filter((s: number) => s < 50).length;
        }
      }

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

      // Get employee IDs for the company
      const { data: companyEmployees } = await supabase
        .from('employees')
        .select('id, user_id')
        .eq('company_id', userProfile.company_id);

      const employeeIds = companyEmployees?.map(e => e.id) || [];
      const userIds = companyEmployees?.map(e => e.user_id).filter(Boolean) || [];

      // Fetch user names separately
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds);

      const userMap = new Map();
      users?.forEach(user => userMap.set(user.id, user.full_name));

      // Fetch recent skills profiles for gap discoveries
      const { data: recentProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select('employee_id, skills_match_score, analyzed_at, extracted_skills')
        .in('employee_id', employeeIds)
        .order('analyzed_at', { ascending: false })
        .limit(5);

      // Map employee IDs to names
      const employeeNameMap = new Map();
      companyEmployees?.forEach(emp => {
        const userName = userMap.get(emp.user_id) || 'Unknown Employee';
        employeeNameMap.set(emp.id, userName);
      });

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

      // Add analysis activities from recent profiles
      recentProfiles?.forEach(profile => {
        const employeeName = employeeNameMap.get(profile.employee_id) || 'Unknown Employee';
        const skillsCount = Array.isArray(profile.extracted_skills) ? profile.extracted_skills.length : 0;
        const matchScore = parseFloat(profile.skills_match_score) || 0;
        
        activities.push({
          id: `analysis-${profile.employee_id}`,
          type: 'analysis',
          message: `Analyzed CV for ${employeeName} (${skillsCount} skills found)`,
          timestamp: profile.analyzed_at,
          icon: <CheckCircle2 className="h-4 w-4" />
        });

        // Add gap activity if score is low
        if (matchScore < 70) {
          activities.push({
            id: `gap-${profile.employee_id}`,
            type: 'gap_found',
            message: `Skills gap identified for ${employeeName} (${Math.round(matchScore)}% match)`,
            timestamp: profile.analyzed_at,
            icon: <AlertTriangle className="h-4 w-4 text-orange-500" />
          });
        }
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
      // Fetch positions first
      const { data: positions } = await supabase
        .from('st_company_positions')
        .select('id, position_title, position_code, required_skills')
        .eq('company_id', userProfile.company_id);

      // Fetch employees with their positions
      const { data: employees } = await supabase
        .from('employees')
        .select('id, current_position_id')
        .eq('company_id', userProfile.company_id)
        .not('current_position_id', 'is', null);

      // Get employee IDs
      const employeeIds = employees?.map(e => e.id) || [];

      // Fetch skills profiles
      const { data: skillsProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select('employee_id, skills_match_score')
        .in('employee_id', employeeIds);

      if (positions && employees) {
        // Create a map of skills profiles
        const profileMap = new Map();
        skillsProfiles?.forEach(profile => {
          profileMap.set(profile.employee_id, parseFloat(profile.skills_match_score) || 0);
        });

        // Calculate coverage for each position
        const gapData: SkillGapOverview[] = [];
        
        for (const position of positions) {
          const employeesInPosition = employees.filter(e => e.current_position_id === position.id);
          
          if (employeesInPosition.length > 0) {
            const scores = employeesInPosition
              .map(e => profileMap.get(e.id) || 0)
              .filter(score => score > 0);
            
            const avgMatch = scores.length > 0
              ? scores.reduce((acc, score) => acc + score, 0) / scores.length
              : 0;

            gapData.push({
              position: position.position_title,
              position_code: position.position_code || position.position_title,
              requiredSkills: position.required_skills?.length || 0,
              coverage: Math.round(avgMatch),
              employeesInPosition: employeesInPosition.length,
              avgMatchScore: Math.round(avgMatch)
            });
          }
        }

        // Sort by coverage (lowest first) and take top 5
        gapData.sort((a, b) => a.coverage - b.coverage);
        setSkillsGapData(gapData.slice(0, 5));
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
      <div className="space-y-3">
        <h2 className="text-base font-medium text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="h-9 justify-start font-normal"
            onClick={() => navigate('/dashboard/positions')}
          >
            <Target className="h-4 w-4 mr-2 text-muted-foreground" />
            Define Position Requirements
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="h-9 justify-start font-normal"
            onClick={() => navigate('/dashboard/onboarding')}
          >
            <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
            Onboard Employees
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="h-9 justify-start font-normal"
            onClick={() => navigate('/dashboard/employees')}
          >
            <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
            View Skills Gap Analysis
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="h-9 justify-start font-normal"
            onClick={() => navigate('/dashboard/courses')}
          >
            <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
            Assign Courses
          </Button>
        </div>
      </div>

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