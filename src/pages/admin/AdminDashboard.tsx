
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
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CompactDemoRequestsTable from "@/components/admin/DemoRequestsManagement/CompactDemoRequestsTable";

interface DashboardStats {
  totalEmployees: number;
  totalCourses: number;
  activeLearners: number;
  completionRate: number;
  totalDemoRequests: number;
  newDemoRequests: number;
}

interface DemoRequestRecord {
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

const AdminDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalCourses: 0,
    activeLearners: 0,
    completionRate: 0,
    totalDemoRequests: 0,
    newDemoRequests: 0
  });
  const [recentDemoRequests, setRecentDemoRequests] = useState<DemoRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchDashboardData();
    }
  }, [userProfile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic stats
      const [employeesData, coursesData, assignmentsData, demoRequestsData] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact' }),
        supabase.from('cm_module_content').select('content_id', { count: 'exact' }),
        supabase.from('course_assignments').select('id, status, progress_percentage'),
        supabase.from('demo_requests').select('*').order('created_at', { ascending: false })
      ]);

      const totalEmployees = employeesData.count || 0;
      const totalCourses = coursesData.count || 0;
      const assignments = assignmentsData.data || [];
      const activeLearners = assignments.filter(a => a.status === 'in_progress').length;
      const completedAssignments = assignments.filter(a => a.status === 'completed').length;
      const completionRate = assignments.length > 0 ? (completedAssignments / assignments.length) * 100 : 0;

      const demoRequests = demoRequestsData.data || [];
      const newDemoRequests = demoRequests.filter(r => r.status === 'new').length;

      setStats({
        totalEmployees,
        totalCourses,
        activeLearners,
        completionRate,
        totalDemoRequests: demoRequests.length,
        newDemoRequests
      });

      // Map demo requests to proper format
      const mappedRequests: DemoRequestRecord[] = demoRequests.slice(0, 5).map(req => ({
        id: req.id,
        first_name: req.first_name,
        last_name: req.last_name,
        email: req.email,
        company: req.company,
        status: req.status,
        created_at: req.created_at,
        job_title: req.job_title,
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
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    // Navigate to demo request details
    console.log('View details for:', id);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your platform activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.totalEmployees}</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.totalCourses}</span>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Learners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.activeLearners}</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</span>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Requests Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Demo Requests
              <Badge variant="secondary">{stats.newDemoRequests} new</Badge>
            </CardTitle>
            <CardDescription>Recent demo requests from potential customers</CardDescription>
          </CardHeader>
          <CardContent>
            <CompactDemoRequestsTable 
              requests={recentDemoRequests}
              onViewDetails={handleViewDetails}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Manage Employees
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              Course Management
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics & Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
