import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  CheckCircle2,
  Upload,
  RefreshCw,
  FileText,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OverviewStats {
  totalEmployees: number;
  activeAssessments: number;
  totalSkillsTracked: number;
  avgProficiency: number;
  recentUpdates: number;
  departmentCount: number;
}

interface RecentUpdate {
  id: string;
  type: 'skills_update' | 'new_employee' | 'assessment';
  message: string;
  timestamp: string;
  icon: React.ReactNode;
}

export function EmployeeOverview() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats>({
    totalEmployees: 0,
    activeAssessments: 0,
    totalSkillsTracked: 0,
    avgProficiency: 0,
    recentUpdates: 0,
    departmentCount: 0
  });
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchOverviewData();
    }
  }, [userProfile]);

  const fetchOverviewData = async () => {
    if (!userProfile?.company_id) return;

    try {
      setLoading(true);

      // Fetch employee count
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);

      // Fetch employees with skills profiles
      const { data: skillsProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          *,
          employees!inner(
            company_id,
            department,
            users!inner(full_name)
          )
        `)
        .eq('employees.company_id', userProfile.company_id);

      // Calculate total unique skills
      const allSkills = new Set();
      let totalProficiency = 0;
      let proficiencyCount = 0;

      skillsProfiles?.forEach(profile => {
        profile.extracted_skills?.forEach((skill: any) => {
          if (skill.skill_id) {
            allSkills.add(skill.skill_id);
          }
          if (skill.proficiency_level) {
            totalProficiency += skill.proficiency_level;
            proficiencyCount++;
          }
        });
      });

      // Get unique departments
      const departments = new Set(
        skillsProfiles?.map(p => p.employees.department).filter(Boolean)
      );

      // Calculate recent updates (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentCount = skillsProfiles?.filter(
        p => new Date(p.analyzed_at) > sevenDaysAgo
      ).length || 0;

      setStats({
        totalEmployees: employeeCount || 0,
        activeAssessments: skillsProfiles?.length || 0,
        totalSkillsTracked: allSkills.size,
        avgProficiency: proficiencyCount > 0 ? Math.round((totalProficiency / proficiencyCount) * 20) : 0,
        recentUpdates: recentCount,
        departmentCount: departments.size
      });

      // Fetch recent activity
      await fetchRecentActivity();

    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Fetch recent skills updates
      const { data: recentProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          *,
          employees!inner(
            users!inner(full_name)
          )
        `)
        .eq('employees.company_id', userProfile.company_id)
        .order('analyzed_at', { ascending: false })
        .limit(5);

      // Fetch recent employee additions
      const { data: recentEmployees } = await supabase
        .from('employees')
        .select('*, users!inner(full_name, created_at)')
        .eq('company_id', userProfile.company_id)
        .order('users.created_at', { ascending: false })
        .limit(5);

      const updates: RecentUpdate[] = [];

      // Add skills updates
      recentProfiles?.forEach(profile => {
        updates.push({
          id: profile.id,
          type: 'skills_update',
          message: `${profile.employees.users.full_name}'s skills updated`,
          timestamp: profile.analyzed_at,
          icon: <CheckCircle2 className="h-4 w-4" />
        });
      });

      // Add new employees
      recentEmployees?.forEach(emp => {
        const createdAt = emp.users.created_at;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        if (new Date(createdAt) > sevenDaysAgo) {
          updates.push({
            id: emp.id,
            type: 'new_employee',
            message: `${emp.users.full_name} joined the team`,
            timestamp: createdAt,
            icon: <Users className="h-4 w-4" />
          });
        }
      });

      // Sort by timestamp and take top 5
      updates.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentUpdates(updates.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
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
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">{stats.departmentCount} departments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Assessments</p>
                <p className="text-2xl font-bold text-foreground">{stats.activeAssessments}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalEmployees > 0 
                    ? `${Math.round((stats.activeAssessments / stats.totalEmployees) * 100)}% coverage`
                    : '0% coverage'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Skills Tracked</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalSkillsTracked}</p>
                <p className="text-xs text-muted-foreground">Unique skills</p>
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
                <p className="text-2xl font-bold text-foreground">{stats.avgProficiency}%</p>
                <p className="text-xs text-muted-foreground">{stats.recentUpdates} recent updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common employee management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              size="lg" 
              variant="outline"
              className="justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/dashboard/onboarding')}
            >
              <Upload className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Import Employees</div>
                <div className="text-xs text-muted-foreground">Add new team members</div>
              </div>
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="justify-start gap-3 h-auto py-4"
              onClick={() => navigate('/dashboard/employees?tab=skills')}
            >
              <RefreshCw className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Update Skills</div>
                <div className="text-xs text-muted-foreground">Run assessments</div>
              </div>
            </Button>

            <Button 
              size="lg" 
              variant="outline"
              className="justify-start gap-3 h-auto py-4"
              onClick={() => window.print()}
            >
              <FileText className="h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Export Data</div>
                <div className="text-xs text-muted-foreground">Generate reports</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Updates</CardTitle>
            <Button size="sm" variant="ghost" onClick={fetchOverviewData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentUpdates.length > 0 ? (
            <div className="space-y-4">
              {recentUpdates.map((update) => (
                <div key={update.id} className="flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-full">
                    {update.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{update.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(update.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No recent activity. Import employees or update skills to get started.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}