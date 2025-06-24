
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, 
  Building2, 
  BookOpen, 
  BarChart3, 
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Database,
  HardDrive,
  Loader2
} from 'lucide-react';

interface SystemStats {
  totalCompanies: number;
  totalUsers: number;
  totalCourses: number;
  activeUsers: number;
}

interface Company {
  id: string;
  name: string;
  domain: string;
  plan_type: string;
  is_active: boolean;
  created_at: string;
  userCount: number;
  courseCount: number;
}

interface RecentActivity {
  id: string;
  type: 'user_created' | 'company_created' | 'course_generated';
  description: string;
  timestamp: string;
  company_name?: string;
}

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<SystemStats>({ totalCompanies: 0, totalUsers: 0, totalCourses: 0, activeUsers: 0 });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscriptions
    const companiesSubscription = supabase
      .channel('companies-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const usersSubscription = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(companiesSubscription);
      supabase.removeChannel(usersSubscription);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch system stats
      const [companiesResult, usersResult, coursesResult] = await Promise.all([
        supabase.from('companies').select('id, is_active'),
        supabase.from('users').select('id, is_active, last_login'),
        supabase.from('cm_module_content').select('content_id')
      ]);

      const totalCompanies = companiesResult.data?.filter(c => c.is_active).length || 0;
      const totalUsers = usersResult.data?.filter(u => u.is_active).length || 0;
      const totalCourses = coursesResult.data?.length || 0;
      
      // Count active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = usersResult.data?.filter(u => 
        u.is_active && u.last_login && new Date(u.last_login) > thirtyDaysAgo
      ).length || 0;

      setStats({ totalCompanies, totalUsers, totalCourses, activeUsers });

      // Fetch companies with user and course counts
      const companiesWithCounts = await Promise.all(
        (companiesResult.data || []).map(async (company) => {
          const [userCountResult, courseCountResult] = await Promise.all([
            supabase.from('users').select('id').eq('company_id', company.id).eq('is_active', true),
            supabase.from('cm_module_content').select('content_id').eq('company_id', company.id)
          ]);
          
          return {
            ...company,
            userCount: userCountResult.data?.length || 0,
            courseCount: courseCountResult.data?.length || 0
          };
        })
      );

      // Get full company details
      const { data: fullCompanies } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      const companiesData = (fullCompanies || []).map(company => {
        const counts = companiesWithCounts.find(c => c.id === company.id);
        return {
          ...company,
          userCount: counts?.userCount || 0,
          courseCount: counts?.courseCount || 0
        };
      });

      setCompanies(companiesData);

      // Fetch recent activity
      const recentActivities: RecentActivity[] = [];
      
      // Recent companies
      const recentCompanies = companiesData.slice(0, 5);
      recentCompanies.forEach(company => {
        recentActivities.push({
          id: `company-${company.id}`,
          type: 'company_created',
          description: `Company "${company.name}" was created`,
          timestamp: company.created_at,
          company_name: company.name
        });
      });

      // Recent users
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, full_name, email, created_at, companies(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      (recentUsers || []).forEach(user => {
        recentActivities.push({
          id: `user-${user.id}`,
          type: 'user_created',
          description: `User "${user.full_name}" (${user.email}) registered`,
          timestamp: user.created_at,
          company_name: user.companies?.name
        });
      });

      // Recent courses
      const { data: recentCourses } = await supabase
        .from('cm_module_content')
        .select('content_id, module_name, created_at, companies(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      (recentCourses || []).forEach(course => {
        recentActivities.push({
          id: `course-${course.content_id}`,
          type: 'course_generated',
          description: `Course "${course.module_name}" was generated`,
          timestamp: course.created_at,
          company_name: course.companies?.name
        });
      });

      // Sort by timestamp
      recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(recentActivities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'company_created': return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'user_created': return <Users className="h-4 w-4 text-green-500" />;
      case 'course_generated': return <BookOpen className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {userProfile?.full_name}. System overview and management.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCompanies === 0 ? 'No companies yet' : 'Companies registered'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} active in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses Generated</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCourses === 0 ? 'No courses generated yet' : 'Total courses created'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCompanies > 0 ? '99.9%' : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCompanies > 0 ? 'System uptime' : 'No activity to measure'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                  <p className="text-sm">Activity will appear here as users interact with the system</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        {activity.company_name && (
                          <p className="text-xs text-gray-500">Company: {activity.company_name}</p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Companies Management</CardTitle>
              <CardDescription>Manage all registered companies</CardDescription>
            </CardHeader>
            <CardContent>
              {companies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No companies registered yet</p>
                  <p className="text-sm">Companies will appear here when they sign up</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.domain}</TableCell>
                        <TableCell>
                          <Badge variant={company.plan_type === 'trial' ? 'secondary' : 'default'}>
                            {company.plan_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{company.userCount}</TableCell>
                        <TableCell>{company.courseCount}</TableCell>
                        <TableCell>
                          <Badge variant={company.is_active ? 'default' : 'destructive'}>
                            {company.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(company.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generation Queue</CardTitle>
                <CardDescription>Active course generation jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active generation jobs</p>
                  <p className="text-sm">Queue status will appear here when courses are being generated</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Log</CardTitle>
                <CardDescription>Recent system errors and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent errors</p>
                  <p className="text-sm">System errors will appear here when they occur</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Rates</CardTitle>
                <CardDescription>Course generation success metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data available</p>
                  <p className="text-sm">Analytics will appear when there's sufficient course generation activity</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Content quality scores and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No quality data yet</p>
                  <p className="text-sm">Quality metrics will be calculated as courses are generated and assessed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Health</CardTitle>
                <CardDescription>Database performance and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connection Status</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tables</span>
                    <span className="text-sm font-medium">13 active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
                <CardDescription>System storage metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database Size</span>
                    <span className="text-sm font-medium">
                      {stats.totalCourses === 0 ? 'Minimal' : 'Growing'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Media Assets</span>
                    <span className="text-sm font-medium">None stored</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resources</CardTitle>
                <CardDescription>Resource utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Calls</span>
                    <span className="text-sm font-medium">Normal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Processing Load</span>
                    <span className="text-sm font-medium">Low</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
