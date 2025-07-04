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
  Zap,
  MessageSquare,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import TicketDetailModal from '@/components/admin/TicketsManagement/TicketDetailModal';
import { ticketService, TicketRecord } from '@/services/ticketService';

interface DashboardStats {
  totalEmployees: number;
  totalCourses: number;
  activeLearners: number;
  completionRate: number;
  totalTickets: number;
  newTickets: number;
  totalCompanies: number;
  activeCompanies: number;
  totalFeedback: number;
  criticalIssues: number;
  averageRating: number;
  newFeedback: number;
}


interface RecentActivity {
  id: string;
  type: 'ticket' | 'company_joined' | 'course_completed';
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
    totalTickets: 0,
    newTickets: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalFeedback: 0,
    criticalIssues: 0,
    averageRating: 0,
    newFeedback: 0
  });
  const [recentTickets, setRecentTickets] = useState<TicketRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

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
        ticketsData,
        companiesData,
        feedbackData
      ] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact' }),
        supabase.from('cm_module_content').select('content_id', { count: 'exact' }),
        supabase.from('course_assignments').select('id, status, progress_percentage'),
        supabase.from('tickets').select('*').order('submitted_at', { ascending: false }),
        supabase.from('companies').select('id, created_at', { count: 'exact' }),
        supabase.from('content_feedback').select('*').order('created_at', { ascending: false })
      ]);

      const totalEmployees = employeesData.count || 0;
      const totalCourses = coursesData.count || 0;
      const assignments = assignmentsData.data || [];
      const activeLearners = assignments.filter(a => a.status === 'in_progress').length;
      const completedAssignments = assignments.filter(a => a.status === 'completed').length;
      const completionRate = assignments.length > 0 ? (completedAssignments / assignments.length) * 100 : 0;

      const tickets = ticketsData.data || [];
      const newTickets = tickets.filter(t => t.status === 'new').length;

      const totalCompanies = companiesData.count || 0;
      const activeCompanies = companiesData.data?.filter(c => {
        const createdDate = new Date(c.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate > thirtyDaysAgo;
      }).length || 0;

      const allFeedback = feedbackData.data || [];
      const criticalIssues = allFeedback.filter(f => !f.is_positive).length;
      const positiveFeedback = allFeedback.filter(f => f.is_positive).length;
      const averageRating = allFeedback.length > 0 ? (positiveFeedback / allFeedback.length) * 5 : 0;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const newFeedback = allFeedback.filter(f => {
        const feedbackDate = new Date(f.created_at!);
        return feedbackDate > oneDayAgo;
      }).length;

      setStats({
        totalEmployees,
        totalCourses,
        activeLearners,
        completionRate,
        totalTickets: tickets.length,
        newTickets,
        totalCompanies,
        activeCompanies,
        totalFeedback: allFeedback.length,
        criticalIssues,
        averageRating,
        newFeedback
      });

      // Set recent tickets
      setRecentTickets(tickets.slice(0, 5) as TicketRecord[]);

      // Create recent activity
      const activities: RecentActivity[] = [];
      
      // Add recent tickets to activity
      tickets.slice(0, 3).forEach(ticket => {
        const typeLabels = {
          demo_request: 'Demo Request',
          contact_sales: 'Sales Contact',
          early_access: 'Early Access'
        };
        activities.push({
          id: ticket.id,
          type: 'ticket',
          title: `New ${typeLabels[ticket.ticket_type as keyof typeof typeLabels]}`,
          description: `${ticket.first_name} ${ticket.last_name}${ticket.company ? ` from ${ticket.company}` : ''}`,
          timestamp: ticket.submitted_at,
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

  const handleViewTicketDetails = (ticket: TicketRecord) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/tickets')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Tickets</p>
                <p className="text-3xl font-bold mt-1">{stats.totalTickets}</p>
                {stats.newTickets > 0 && (
                  <Badge variant="default" className="mt-1">
                    {stats.newTickets} new
                  </Badge>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/customer-feedback')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customer Feedback</p>
                <p className="text-3xl font-bold mt-1">{stats.totalFeedback}</p>
                <div className="flex items-center gap-2 mt-1">
                  {stats.criticalIssues > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {stats.criticalIssues} critical
                    </Badge>
                  )}
                  {stats.averageRating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground">
                        {stats.averageRating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600" />
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
              onClick={() => navigate('/admin/tickets')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Customer Tickets
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/admin/customer-feedback')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Customer Feedback
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

      {/* Recent Tickets Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>Latest customer interactions across all types</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/tickets')}>
            View All
            <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentTickets.map((ticket) => {
              const typeIcons = {
                demo_request: '🎯',
                contact_sales: '💰',
                early_access: '🚀'
              };
              return (
                <div 
                  key={ticket.id} 
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleViewTicketDetails(ticket)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{typeIcons[ticket.ticket_type]}</span>
                      <div>
                        <p className="font-medium">
                          {ticket.first_name} {ticket.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{ticket.company || ticket.ticket_type.replace(/_/g, ' ')}</p>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{ticket.email}</span>
                    <span>{formatTimeAgo(ticket.submitted_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isTicketModalOpen}
        onClose={() => {
          setIsTicketModalOpen(false);
          setSelectedTicket(null);
        }}
        onStatusUpdate={fetchDashboardData}
      />
    </div>
  );
};

export default AdminDashboard;