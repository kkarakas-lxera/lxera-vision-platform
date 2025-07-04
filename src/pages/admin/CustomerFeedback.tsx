import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
  ExternalLink,
  Eye,
  Edit,
  MessageCircle,
  Building2,
  Calendar,
  MoreHorizontal
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
  resolvedThisWeek: number;
  pendingFeedback: number;
  companiesWithFeedback: number;
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
    resolvedThisWeek: 0,
    pendingFeedback: 0,
    companiesWithFeedback: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [companies, setCompanies] = useState<Array<{id: string, name: string}>>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<CompanyFeedbackRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (userProfile) {
      fetchFeedbackData();
    }
  }, [userProfile]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);

      // Fetch feedback data
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('company_feedback')
        .select('*')
        .order('created_at', { ascending: false });
        
      // Fetch companies data separately
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name');

      if (feedbackError) {
        console.error('Error fetching feedback:', feedbackError);
        toast.error('Failed to load feedback data');
        return;
      }
      
      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        toast.error('Failed to load company data');
        return;
      }

      // Create company lookup map
      const companyMap = new Map((companiesData || []).map(company => [company.id, company.name]));

      // Transform data to include company name
      const transformedData: CompanyFeedbackRecord[] = (feedbackData || []).map(item => ({
        ...item,
        company_name: companyMap.get(item.company_id) || 'Unknown Company'
      }));

      setFeedbacks(transformedData);
      setCompanies(companiesData || []);

      // Calculate statistics
      const total = transformedData.length;
      const critical = transformedData.filter(f => f.priority === 'high' && f.status === 'new').length;
      const pending = transformedData.filter(f => f.status === 'new' || f.status === 'in_progress').length;
      
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

      // This week's resolved feedback
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const resolvedThisWeek = transformedData.filter(f => {
        const updatedDate = new Date(f.updated_at);
        return f.status === 'resolved' && updatedDate > oneWeekAgo;
      }).length;

      // Unique companies with feedback
      const uniqueCompanies = new Set(transformedData.map(f => f.company_id)).size;

      setStats({
        totalFeedback: total,
        criticalIssues: critical,
        averageRating: avgRating,
        satisfactionRate,
        todaysFeedback: todaysCount,
        resolvedThisWeek,
        pendingFeedback: pending,
        companiesWithFeedback: uniqueCompanies
      });

    } catch (error) {
      console.error('Error fetching feedback data:', error);
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  // Status update function
  const updateFeedbackStatus = async (feedbackId: string, newStatus: string, notes?: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
      if (notes) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from('company_feedback')
        .update(updateData)
        .eq('id', feedbackId);

      if (error) {
        console.error('Error updating feedback:', error);
        toast.error('Failed to update feedback status');
        return;
      }

      toast.success(`Feedback marked as ${newStatus.replace('_', ' ')}`);
      fetchFeedbackData(); // Refresh data
      setIsDetailModalOpen(false);
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback status');
    }
  };

  // Open detail modal
  const openDetailModal = (feedback: CompanyFeedbackRecord) => {
    setSelectedFeedback(feedback);
    setAdminNotes(feedback.admin_notes || '');
    setIsDetailModalOpen(true);
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
      (filterType === 'general_feedback' && feedback.type === 'general_feedback') ||
      (filterType === 'new' && feedback.status === 'new') ||
      (filterType === 'in_progress' && feedback.status === 'in_progress') ||
      (filterType === 'resolved' && feedback.status === 'resolved');

    const matchesCompany = 
      selectedCompany === 'all' || feedback.company_id === selectedCompany;

    return matchesSearch && matchesFilter && matchesCompany;
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
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
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
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingFeedback}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved This Week</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedThisWeek}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Companies</p>
                <p className="text-2xl font-bold">{stats.companiesWithFeedback}</p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type/status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Feedback</SelectItem>
            <SelectItem value="critical">Critical Issues</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
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
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailModal(feedback)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {feedback.status === 'new' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFeedbackStatus(feedback.id, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                        {feedback.status === 'in_progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFeedbackStatus(feedback.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Feedback Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeedback && getTypeIcon(selectedFeedback.type)}
              {selectedFeedback?.title}
            </DialogTitle>
            <DialogDescription>
              Submitted by {selectedFeedback?.user_name} from {selectedFeedback?.company_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-6">
              {/* Feedback Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedFeedback.type)}
                    <span className="text-sm">{selectedFeedback.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Priority</label>
                  <div className="mt-1">
                    {getPriorityBadge(selectedFeedback.priority)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedFeedback.status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedFeedback.category}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Submitted</label>
                  <p className="text-sm mt-1">{new Date(selectedFeedback.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm mt-1">{new Date(selectedFeedback.updated_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedFeedback.description}</p>
                </div>
              </div>

              {/* Metadata */}
              {selectedFeedback.metadata && Object.keys(selectedFeedback.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Additional Information</label>
                  <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedFeedback.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key.replace('_', ' ')}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                <Textarea
                  placeholder="Add internal notes about this feedback..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  {selectedFeedback.status === 'new' && (
                    <Button 
                      onClick={() => updateFeedbackStatus(selectedFeedback.id, 'in_progress', adminNotes)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Working
                    </Button>
                  )}
                  {selectedFeedback.status === 'in_progress' && (
                    <Button 
                      onClick={() => updateFeedbackStatus(selectedFeedback.id, 'resolved', adminNotes)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Resolved
                    </Button>
                  )}
                  {selectedFeedback.status === 'resolved' && (
                    <Button 
                      variant="outline"
                      onClick={() => updateFeedbackStatus(selectedFeedback.id, 'in_progress', adminNotes)}
                    >
                      Reopen
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => updateFeedbackStatus(selectedFeedback.id, 'wont_fix', adminNotes)}
                  >
                    Won't Fix
                  </Button>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => updateFeedbackStatus(selectedFeedback.id, selectedFeedback.status, adminNotes)}
                >
                  Update Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerFeedback;