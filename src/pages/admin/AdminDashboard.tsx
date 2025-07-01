import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  BarChart3,
  FileText,
  Settings,
  ArrowUpRight,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import DemoRequestDetailModal from '@/components/admin/DemoRequestsManagement/DemoRequestDetailModal';

interface DashboardStats {
  totalEmployees: number;
  totalCourses: number;
  activeLearners: number;
  completionRate: number;
  totalDemoRequests: number;
  newDemoRequests: number;
  totalCompanies: number;
  activeCompanies: number;
}

interface LocalDemoRequestRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  status: string;
  created_at: string;
  job_title?: string;
  phone?: string;
  company_size?: string;
  country?: string;
  message?: string;
  source?: string;
  notes?: string;
  processed_by?: string;
  processed_at?: string;
  submitted_at?: string;
  updated_at?: string;
}

interface RecentActivity {
  id: string;
  type: 'demo_request' | 'company_joined' | 'course_completed';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
}

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalCourses: 0,
    activeLearners: 0,
    completionRate: 0,
    totalDemoRequests: 0,
    newDemoRequests: 0,
    totalCompanies: 0,
    activeCompanies: 0
  });
  const [recentDemoRequests, setRecentDemoRequests] = useState<LocalDemoRequestRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemoRequest, setSelectedDemoRequest] = useState<LocalDemoRequestRecord | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    if (userProfile) {
      fetchDashboardData();
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        employeesData, 
        coursesData, 
        assignmentsData, 
        demoRequestsData,
        companiesData
      ] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact' }),
        supabase.from('cm_module_content').select('content_id', { count: 'exact' }),
        supabase.from('course_assignments').select('id, status, progress_percentage'),
        supabase.from('demo_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('companies').select('id, created_at', { count: 'exact' })
      ]);

      const totalEmployees = employeesData.count || 0;
      const totalCourses = coursesData.count || 0;
      const assignments = assignmentsData.data || [];
      const activeLearners = assignments.filter(a => a.status === 'in_progress').length;
      const completedAssignments = assignments.filter(a => a.status === 'completed').length;
      const completionRate = assignments.length > 0 ? (completedAssignments / assignments.length) * 100 : 0;

      const demoRequests = demoRequestsData.data || [];
      const newDemoRequests = demoRequests.filter(r => r.status === 'new').length;

      const totalCompanies = companiesData.count || 0;
      const activeCompanies = companiesData.data?.filter(c => {
        const createdDate = new Date(c.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate > thirtyDaysAgo;
      }).length || 0;

      setStats({
        totalEmployees,
        totalCourses,
        activeLearners,
        completionRate,
        totalDemoRequests: demoRequests.length,
        newDemoRequests,
        totalCompanies,
        activeCompanies
      });

      // Map demo requests
      const mappedRequests: LocalDemoRequestRecord[] = demoRequests.slice(0, 5).map(req => ({
        id: req.id,
        first_name: req.first_name,
        last_name: req.last_name,
        email: req.email,
        company: req.company,
        status: req.status,
        created_at: req.created_at,
        job_title: req.job_title || '',
        phone: req.phone,
        company_size: req.company_size,
        country: req.country,
        message: req.message,
        source: req.source,
        notes: req.notes,
        processed_by: req.processed_by,
        processed_at: req.processed_at,
        submitted_at: req.submitted_at,
        updated_at: req.updated_at
      }));
      
      setRecentDemoRequests(mappedRequests);

      // Create recent activity
      const activities: RecentActivity[] = [];
      
      // Add recent demo requests to activity
      demoRequests.slice(0, 3).forEach(req => {
        activities.push({
          id: req.id,
          type: 'demo_request',
          title: 'New Demo Request',
          description: `${req.first_name} ${req.last_name} from ${req.company}`,
          timestamp: req.created_at,
          icon: <Mail className="h-4 w-4" />
        });
      });

      // Sort activities by timestamp
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivity(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDemoDetails = (request: LocalDemoRequestRecord) => {
    setSelectedDemoRequest(request);
    setIsDemoModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'default', label: 'New' },
      contacted: { color: 'secondary', label: 'Contacted' },
      qualified: { color: 'success', label: 'Qualified' },
      converted: { color: 'success', label: 'Converted' },
      rejected: { color: 'destructive', label: 'Rejected' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    
    return (
      <Badge variant={config.color as any}>
        {config.label}
      </Badge>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your platform overview.</p>
        </div>
        <Button onClick={() => navigate('/admin/analytics')} variant="outline">
          <BarChart3 className="h-4 w-4 mr-2" />
          View Analytics
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/companies')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                <p className="text-3xl font-bold mt-1">{stats.totalCompanies}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeCompanies} active
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold mt-1">{stats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeLearners} active learners
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/courses')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-3xl font-bold mt-1">{stats.totalCourses}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completionRate.toFixed(0)}% completion
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/demo-requests')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Demo Requests</p>
                <p className="text-3xl font-bold mt-1">{stats.totalDemoRequests}</p>
                {stats.newDemoRequests > 0 && (
                  <Badge variant="default" className="mt-1">
                    {stats.newDemoRequests} new
                  </Badge>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/companies')}
            >
              <Building className="h-4 w-4 mr-2" />
              Manage Companies
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/courses')}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Course Management
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/demo-requests')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Demo Requests
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/analytics')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics & Reports
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Platform Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Demo Requests Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Demo Requests</CardTitle>
            <CardDescription>Latest demo requests from potential customers</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/demo-requests')}>
            View All
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentDemoRequests.map((request) => (
              <div 
                key={request.id} 
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleViewDemoDetails(request)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">
                        {request.first_name} {request.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{request.company}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{request.email}</span>
                  <span>{formatTimeAgo(request.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demo Request Detail Modal */}
      <DemoRequestDetailModal
        request={selectedDemoRequest}
        isOpen={isDemoModalOpen}
        onClose={() => {
          setIsDemoModalOpen(false);
          setSelectedDemoRequest(null);
        }}
        onStatusUpdate={fetchDashboardData}
      />
    </div>
  );
};

export default AdminDashboard;