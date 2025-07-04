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
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackRecord {
  id: string;
  content_id: string;
  section_id: string | null;
  user_id: string;
  feedback_type: string;
  is_positive: boolean;
  timestamp_seconds: number | null;
  created_at: string;
  // Joined fields
  user_name?: string;
  company_name?: string;
  content_title?: string;
  section_name?: string;
}

interface FeedbackStats {
  totalFeedback: number;
  criticalIssues: number;
  averageRating: number;
  satisfactionRate: number;
  todaysFeedback: number;
  weeklyGrowth: number;
}

interface FeatureRequest {
  feature: string;
  count: number;
  percentage: number;
}

const CustomerFeedback: React.FC = () => {
  const { userProfile } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackRecord[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    criticalIssues: 0,
    averageRating: 0,
    satisfactionRate: 0,
    todaysFeedback: 0,
    weeklyGrowth: 0
  });
  const [featureRequests, setFeatureRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'positive' | 'negative'>('all');
  const [sortField, setSortField] = useState<'created_at' | 'feedback_type' | 'is_positive'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    if (userProfile) {
      fetchFeedbackData();
    }
  }, [userProfile]);

  useEffect(() => {
    applyFilters();
  }, [feedback, searchTerm, filterType, sortField, sortDirection]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      
      // Fetch feedback data first
      const { data: feedbackData, error } = await supabase
        .from('content_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data with basic info for now
      const transformedFeedback: FeedbackRecord[] = (feedbackData || []).map(item => ({
        ...item,
        user_name: 'User', // Simplified for demo
        company_name: 'Company', // Simplified for demo
        content_title: 'Content', // Simplified for demo
        section_name: null
      }));

      setFeedback(transformedFeedback);
      
      // Calculate stats
      const total = transformedFeedback.length;
      const critical = transformedFeedback.filter(f => !f.is_positive).length;
      const positive = transformedFeedback.filter(f => f.is_positive).length;
      const avgRating = total > 0 ? (positive / total) * 5 : 0;
      const satisfactionRate = total > 0 ? (positive / total) * 100 : 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = transformedFeedback.filter(f => {
        const feedbackDate = new Date(f.created_at);
        return feedbackDate >= today;
      }).length;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekCount = transformedFeedback.filter(f => {
        const feedbackDate = new Date(f.created_at);
        return feedbackDate >= weekAgo;
      }).length;

      const prevWeekStart = new Date();
      prevWeekStart.setDate(prevWeekStart.getDate() - 14);
      const prevWeekEnd = new Date();
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
      const prevWeekCount = transformedFeedback.filter(f => {
        const feedbackDate = new Date(f.created_at);
        return feedbackDate >= prevWeekStart && feedbackDate < prevWeekEnd;
      }).length;

      const weeklyGrowth = prevWeekCount > 0 ? ((thisWeekCount - prevWeekCount) / prevWeekCount) * 100 : 0;

      setStats({
        totalFeedback: total,
        criticalIssues: critical,
        averageRating: avgRating,
        satisfactionRate: satisfactionRate,
        todaysFeedback: todayCount,
        weeklyGrowth: weeklyGrowth
      });

      // Generate mock feature requests (in a real app, this would come from analyzing feedback text)
      const mockFeatures: FeatureRequest[] = [
        { feature: 'Dark Mode', count: 23, percentage: 15.3 },
        { feature: 'Mobile App', count: 18, percentage: 12.0 },
        { feature: 'Offline Support', count: 15, percentage: 10.0 },
        { feature: 'Advanced Search', count: 12, percentage: 8.0 },
        { feature: 'Team Collaboration', count: 9, percentage: 6.0 }
      ];
      setFeatureRequests(mockFeatures);
      
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      toast.error('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedback];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(f =>
        f.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.content_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.feedback_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(f => 
        filterType === 'positive' ? f.is_positive : !f.is_positive
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === 'is_positive') {
        aValue = aValue ? 1 : 0;
        bValue = bValue ? 1 : 0;
      }

      const comparison = aValue > bValue ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredFeedback(filtered);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'User', 'Company', 'Content', 'Section', 'Type', 'Sentiment', 'Rating'].join(','),
      ...filteredFeedback.map(f => [
        new Date(f.created_at).toLocaleDateString(),
        f.user_name || '',
        f.company_name || '',
        f.content_title || '',
        f.section_name || '',
        f.feedback_type,
        f.is_positive ? 'Positive' : 'Negative',
        f.is_positive ? '5' : '1'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSentimentBadge = (isPositive: boolean) => {
    return (
      <Badge variant={isPositive ? 'default' : 'destructive'}>
        {isPositive ? (
          <><CheckCircle className="h-3 w-3 mr-1" /> Positive</>
        ) : (
          <><XCircle className="h-3 w-3 mr-1" /> Negative</>
        )}
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
          <h1 className="text-3xl font-bold">Customer Feedback</h1>
          <p className="text-muted-foreground mt-1">Monitor and analyze customer feedback across all content</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={fetchFeedbackData} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{stats.totalFeedback}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalIssues}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                <p className="text-2xl font-bold">{stats.satisfactionRate.toFixed(0)}%</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">{stats.todaysFeedback}</p>
              </div>
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Growth</p>
                <p className={`text-2xl font-bold ${stats.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.weeklyGrowth >= 0 ? '+' : ''}{stats.weeklyGrowth.toFixed(1)}%
                </p>
              </div>
              {stats.weeklyGrowth >= 0 ? (
                <ArrowUp className="h-6 w-6 text-green-600" />
              ) : (
                <ArrowDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Feedback Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Feedback Priority Queue</CardTitle>
            <CardDescription>All customer feedback sorted by priority and recency</CardDescription>
            
            {/* Filters */}
            <div className="flex gap-4 mt-4">
              <div className="flex-1">
                <Input
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Feedback</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="negative">Critical Issues</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('created_at')}
                    >
                      Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('feedback_type')}
                    >
                      Type {sortField === 'feedback_type' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('is_positive')}
                    >
                      Sentiment {sortField === 'is_positive' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.length > 0 ? (
                    filteredFeedback.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {formatTimeAgo(item.created_at)}
                        </TableCell>
                        <TableCell>{item.user_name}</TableCell>
                        <TableCell>{item.company_name}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.content_title}</p>
                            {item.section_name && (
                              <p className="text-sm text-muted-foreground">{item.section_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.feedback_type}</Badge>
                        </TableCell>
                        <TableCell>
                          {getSentimentBadge(item.is_positive)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No feedback found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Most Requested Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Most Requested Features
            </CardTitle>
            <CardDescription>Top feature requests from feedback analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featureRequests.map((request, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.feature}</p>
                    <p className="text-sm text-muted-foreground">{request.count} requests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{request.percentage}%</p>
                    <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${request.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerFeedback;