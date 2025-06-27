import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Send,
  Download,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CourseGenerationModal from './CourseGenerationModal';

interface CourseData {
  content_id: string;
  module_name: string;
  employee_name: string;
  status: string;
  priority_level: string;
  total_word_count: number;
  created_at: string;
  updated_at: string;
  assignments?: CourseAssignment[];
}

interface CourseAssignment {
  id: string;
  employee_id: string;
  status: string;
  progress_percentage: number;
  due_date: string;
  started_at?: string;
  employee?: {
    full_name: string;
    email: string;
    position: string;
    department: string;
  };
}

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Metrics
  const [metrics, setMetrics] = useState({
    totalCourses: 0,
    activeAssignments: 0,
    completionRate: 0,
    avgProgress: 0
  });

  useEffect(() => {
    fetchCourses();
    fetchMetrics();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Fetch courses with assignments
      const { data: coursesData, error: coursesError } = await supabase
        .from('cm_module_content')
        .select(`
          *,
          course_assignments (
            id,
            employee_id,
            status,
            progress_percentage,
            due_date,
            started_at,
            employees!inner (
              user_id,
              position,
              department,
              users!inner (
                full_name,
                email
              )
            )
          )
        `)
        .eq('company_id', user?.company_id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      // Transform the data
      const transformedCourses = coursesData?.map(course => ({
        ...course,
        assignments: course.course_assignments?.map((assignment: any) => ({
          ...assignment,
          employee: {
            full_name: assignment.employees?.users?.full_name || 'Unknown',
            email: assignment.employees?.users?.email || '',
            position: assignment.employees?.position || '',
            department: assignment.employees?.department || ''
          }
        })) || []
      })) || [];

      setCourses(transformedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const { data: assignments, error } = await supabase
        .from('course_assignments')
        .select('status, progress_percentage')
        .eq('company_id', user?.company_id);

      if (error) throw error;

      const totalAssignments = assignments?.length || 0;
      const activeAssignments = assignments?.filter(a => a.status === 'in_progress').length || 0;
      const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
      const avgProgress = assignments?.reduce((sum, a) => sum + (a.progress_percentage || 0), 0) / (totalAssignments || 1);

      setMetrics({
        totalCourses: courses.length,
        activeAssignments,
        completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0,
        avgProgress: avgProgress || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const handleGenerationComplete = () => {
    fetchCourses();
    fetchMetrics();
    setShowGenerationModal(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      published: { label: 'Published', variant: 'default' as const },
      in_progress: { label: 'In Progress', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'success' as const },
      assigned: { label: 'Assigned', variant: 'outline' as const }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { label: 'High', className: 'bg-red-100 text-red-700' },
      medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
      low: { label: 'Low', className: 'bg-green-100 text-green-700' }
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.module_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.employee_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
    if (activeTab === 'all') return matchesSearch && matchesStatus;
    if (activeTab === 'active') return matchesSearch && matchesStatus && course.assignments?.some(a => a.status === 'in_progress');
    if (activeTab === 'completed') return matchesSearch && matchesStatus && course.assignments?.some(a => a.status === 'completed');
    
    return matchesSearch && matchesStatus;
  });

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-muted-foreground">Manage and track employee learning paths</p>
        </div>
        <Button onClick={() => setShowGenerationModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Courses
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.totalCourses}</span>
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
              <span className="text-2xl font-bold">{metrics.activeAssignments}</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metrics.avgProgress.toFixed(1)}%</span>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Course List */}
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No courses found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Generate courses for your employees to get started'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowGenerationModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate First Course
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course.content_id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">{course.module_name}</h3>
                            <p className="text-sm text-muted-foreground">Created for: {course.employee_name}</p>
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(course.status)}
                            {getPriorityBadge(course.priority_level)}
                          </div>
                        </div>

                        {/* Course Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>{course.total_word_count?.toLocaleString() || 0} words</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{course.assignments?.length || 0} assignments</span>
                          </div>
                        </div>

                        {/* Assignments Progress */}
                        {course.assignments && course.assignments.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium mb-2">Assigned Employees:</p>
                            <div className="space-y-2">
                              {course.assignments.slice(0, 3).map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-3">
                                    <div>
                                      <p className="text-sm font-medium">{assignment.employee?.full_name}</p>
                                      <p className="text-xs text-muted-foreground">{assignment.employee?.position}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Progress value={assignment.progress_percentage || 0} className="w-20" />
                                    <span className="text-sm font-medium">{assignment.progress_percentage || 0}%</span>
                                    {getStatusBadge(assignment.status)}
                                  </div>
                                </div>
                              ))}
                              {course.assignments.length > 3 && (
                                <p className="text-sm text-muted-foreground pl-2">
                                  +{course.assignments.length - 3} more employees
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/courses/${course.content_id}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reminders
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Course Generation Modal */}
      {showGenerationModal && (
        <CourseGenerationModal
          open={showGenerationModal}
          onClose={() => setShowGenerationModal(false)}
          onComplete={handleGenerationComplete}
        />
      )}
    </div>
  );
};

export default Courses;