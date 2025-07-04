import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  MessageSquare, 
  Star, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Download,
  Search,
  Filter,
  Bug,
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CompanyFeedbackRecord {
  id: string;
  company_id: string;
  user_id: string;
  type: 'bug_report' | 'feature_request' | 'general_feedback';
  category: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved' | 'wont_fix';
  user_email: string;
  user_name: string;
  created_at: string;
  metadata?: any;
  // Joined fields
  company_name?: string;
}

interface FeedbackStats {
  totalFeedback: number;
  criticalIssues: number;
  averageRating: number;
  satisfactionRate: number;
  todaysFeedback: number;
  weeklyGrowth: number;
}

const CustomerFeedback: React.FC = () => {
  const { userProfile } = useAuth();
  const [feedbacks, setFeedbacks] = useState<CompanyFeedbackRecord[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    criticalIssues: 0,
    averageRating: 0,
    satisfactionRate: 0,
    todaysFeedback: 0,
    weeklyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (userProfile) {
      fetchFeedbackData();
    }
  }, [userProfile]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);

      // Fetch feedback with company information
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('company_feedback')
        .select(`
          *,
          companies!company_feedback_company_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
        toast.error('Failed to load feedback data');
        return;
      }

      // Transform data to include company name
      const transformedData: CompanyFeedbackRecord[] = (feedbackData || []).map(item => ({
        ...item,
        company_name: item.companies?.name || 'Unknown Company'
      }));

      setFeedbacks(transformedData);

      // Calculate statistics
      const total = transformedData.length;
      const critical = transformedData.filter(f => f.priority === 'high' && f.status === 'new').length;
      
      // Calculate satisfaction rate from general feedback
      const generalFeedbacks = transformedData.filter(f => f.type === 'general_feedback');
      const satisfactionRatings = generalFeedbacks
        .map(f => f.metadata?.satisfaction_rating)
        .filter(rating => rating != null);
      
      const avgRating = satisfactionRatings.length > 0 
        ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length 
        : 0;

      const satisfactionRate = satisfactionRatings.length > 0
        ? (satisfactionRatings.filter(rating => rating >= 4).length / satisfactionRatings.length) * 100
        : 0;

      // Today's feedback
      const today = new Date().toISOString().split('T')[0];
      const todaysCount = transformedData.filter(f => 
        f.created_at.startsWith(today)
      ).length;

      // Weekly growth (mock calculation)
      const weeklyGrowth = 12; // Placeholder

      setStats({
        totalFeedback: total,
        criticalIssues: critical,
        averageRating: avgRating,
        satisfactionRate,
        todaysFeedback: todaysCount,
        weeklyGrowth
      });

    } catch (error) {
      console.error('Error fetching feedback data:', error);
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'critical' && feedback.priority === 'high') ||
      (filterType === 'bug_report' && feedback.type === 'bug_report') ||
      (filterType === 'feature_request' && feedback.type === 'feature_request') ||
      (filterType === 'general_feedback' && feedback.type === 'general_feedback');

    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const csvData = filteredFeedbacks.map(feedback => ({
      Date: new Date(feedback.created_at).toLocaleDateString(),
      Type: feedback.type.replace('_', ' '),
      Company: feedback.company_name,
      User: feedback.user_name,
      Email: feedback.user_email,
      Title: feedback.title,
      Priority: feedback.priority,
      Status: feedback.status,
      Category: feedback.category
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customer_feedback.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug_report': return <Bug className="h-4 w-4 text-red-500" />;
      case 'feature_request': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'general_feedback': return <MessageSquare className="h-4 w-4 text-green-500" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    };
    return <Badge variant={variants[priority as keyof typeof variants] as any}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      new: 'destructive',
      in_progress: 'secondary',
      resolved: 'default',
      wont_fix: 'outline'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
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
          <h1 className="text-3xl font-bold">Customer Feedback</h1>
          <p className="text-muted-foreground mt-1">Feature requests and bug reports from company administrators</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{stats.totalFeedback}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{stats.satisfactionRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{stats.todaysFeedback}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Growth</p>
                <p className="text-2xl font-bold text-green-600">+{stats.weeklyGrowth}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Feedback</SelectItem>
            <SelectItem value="critical">Critical Issues</SelectItem>
            <SelectItem value="bug_report">Bug Reports</SelectItem>
            <SelectItem value="feature_request">Feature Requests</SelectItem>
            <SelectItem value="general_feedback">General Feedback</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Feedback</CardTitle>
          <CardDescription>
            {filteredFeedbacks.length} feedback submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedbacks.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(feedback.type)}
                        <span className="text-sm font-medium">
                          {feedback.type.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{feedback.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {feedback.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{feedback.company_name}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{feedback.user_name}</p>
                        <p className="text-xs text-muted-foreground">{feedback.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(feedback.priority)}</TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{feedback.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatTimeAgo(feedback.created_at)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerFeedback;