
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
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface DashboardMetrics {
  totalEmployees: number;
  activeLearningPaths: number;
  skillsCoverage: number;
  avgReadinessScore: number;
}

interface RecentActivity {
  id: string;
  type: 'onboarding' | 'completion' | 'analysis';
  message: string;
  timestamp: string;
  icon: React.ReactNode;
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeLearningPaths: 0,
    skillsCoverage: 0,
    avgReadinessScore: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [skillsGapData, setSkillsGapData] = useState<any[]>([]);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchDashboardData();
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      // Fetch employee count
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id);

      // Fetch active learning paths (course assignments)
      const { count: activePaths } = await supabase
        .from('course_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id)
        .in('status', ['assigned', 'in_progress']);

      // Fetch skills profiles for coverage calculation
      const { data: skillsProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          skills_match_score,
          career_readiness_score,
          employees!inner(company_id)
        `)
        .eq('employees.company_id', userProfile.company_id);

      // Calculate metrics
      const avgMatchScore = skillsProfiles?.length 
        ? skillsProfiles.reduce((acc, p) => acc + (p.skills_match_score || 0), 0) / skillsProfiles.length
        : 0;

      const avgReadiness = skillsProfiles?.length
        ? skillsProfiles.reduce((acc, p) => acc + (p.career_readiness_score || 0), 0) / skillsProfiles.length
        : 0;

      setMetrics({
        totalEmployees: employeeCount || 0,
        activeLearningPaths: activePaths || 0,
        skillsCoverage: Math.round(avgMatchScore),
        avgReadinessScore: Math.round(avgReadiness)
      });

      // Fetch recent activities
      await fetchRecentActivities();
      
      // Fetch skills gap overview
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

      // Fetch recent CV analyses with proper employee fields
      const { data: analyses } = await supabase
        .from('st_employee_skills_profile')
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
        .order('analyzed_at', { ascending: false })
        .limit(3);

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
          message: `Analyzed CV for ${analysis.employees.users.full_name}`,
          timestamp: analysis.analyzed_at,
          icon: <CheckCircle2 className="h-4 w-4" />
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
      // This would typically aggregate skills gaps across all employees
      // For now, we'll fetch position requirements as a proxy
      const { data: positions } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .limit(5);

      if (positions) {
        const gapData = positions.map(pos => ({
          position: pos.position_title,
          requiredSkills: pos.required_skills?.length || 0,
          coverage: Math.floor(Math.random() * 100) // In production, calculate actual coverage
        }));
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48" />
          ))}
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
                <div className="font-semibold">Onboard New Employees</div>
                <div className="text-xs opacity-70">Import CSV & analyze CVs</div>
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
              onClick={() => navigate('/dashboard/analytics')}
            >
              <div className="bg-muted p-2 rounded-lg">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-semibold">View Analytics</div>
                <div className="text-xs text-muted-foreground">Skills insights & gaps</div>
              </div>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
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
              Active team members
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

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Skills Coverage
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
                Readiness Score
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
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>

        {/* Skills Gap Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Skills Gap Overview</CardTitle>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => navigate('/dashboard/analytics')}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {skillsGapData.length > 0 ? (
              <div className="space-y-4">
                {skillsGapData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.position}</span>
                      <span className="text-muted-foreground">{item.coverage}%</span>
                    </div>
                    <Progress value={item.coverage} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  Define positions to see skills gap analysis
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
