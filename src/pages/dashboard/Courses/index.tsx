import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Users, 
  TrendingUp, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CourseGenerationModal from './CourseGenerationModal';

interface CourseAssignment {
  id: string;
  employee_name: string;
  course_title: string;
  progress_percentage: number;
  status: string;
  assigned_at: string;
  due_date?: string;
  modules_completed: number;
  total_modules: number;
  priority: string;
}

interface CourseStats {
  totalCourses: number;
  activeLearners: number;
  completionRate: number;
  averageProgress: number;
}

const CoursesPage = () => {
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState<CourseAssignment[]>([]);
  const [stats, setStats] = useState<CourseStats>({
    totalCourses: 0,
    activeLearners: 0,
    completionRate: 0,
    averageProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [modules, setModules] = useState<any[]>([]);

  useEffect(() => {
    if (userProfile) {
      fetchCourses();
    }
  }, [userProfile]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      let companyId;
      if ('company_id' in userProfile) {
        companyId = userProfile.company_id;
      }
      
      if (!companyId) {
        toast.error('Company information not found');
        return;
      }

      const { data: assignments, error } = await supabase
        .from('course_assignments')
        .select(`
          *,
          employees!inner(
            id,
            users!inner(full_name)
          ),
          cm_module_content!inner(
            module_name
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedCourses: CourseAssignment[] = (assignments || []).map(assignment => ({
        id: assignment.id,
        employee_name: assignment.employees?.users?.full_name || 'Unknown',
        course_title: assignment.cm_module_content?.module_name || 'Untitled Course',
        progress_percentage: assignment.progress_percentage || 0,
        status: assignment.status || 'assigned',
        assigned_at: assignment.assigned_at,
        due_date: assignment.due_date,
        modules_completed: assignment.modules_completed || 0,
        total_modules: assignment.total_modules || 1,
        priority: assignment.priority || 'medium'
      }));

      setCourses(mappedCourses);

      // Calculate stats
      const totalCourses = mappedCourses.length;
      const activeLearners = mappedCourses.filter(c => c.status === 'in_progress').length;
      const completedCourses = mappedCourses.filter(c => c.status === 'completed').length;
      const completionRate = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;
      const averageProgress = totalCourses > 0 
        ? mappedCourses.reduce((sum, course) => sum + course.progress_percentage, 0) / totalCourses 
        : 0;

      setStats({
        totalCourses,
        activeLearners,
        completionRate,
        averageProgress
      });

    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCourse = () => {
    setIsGenerationModalOpen(true);
  };

  const handleCourseGenerated = () => {
    fetchCourses();
    setIsGenerationModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.course_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || course.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
    <>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Course Management</h1>
            <p className="text-muted-foreground">Monitor and manage learning progress</p>
          </div>
          <Button onClick={handleGenerateCourse} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Generate Course
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <span className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</span>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.averageProgress.toFixed(1)}%</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search courses or employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Assignments</CardTitle>
            <CardDescription>
              {filteredCourses.length} of {courses.length} courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="space-y-1">
                      <h4 className="font-medium">{course.course_title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Assigned to: {course.employee_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(course.status)}>
                        {course.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(course.priority)}>
                        {course.priority}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress_percentage}%</span>
                    </div>
                    <Progress value={course.progress_percentage} className="w-full" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {course.modules_completed} of {course.total_modules} modules completed
                      </span>
                      <span>
                        Assigned: {new Date(course.assigned_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCourses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No courses found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Course Modules</h2>
          {modules && modules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module, index) => (
                <Card key={index} className="p-4">
                  <h3 className="font-medium text-sm mb-2">
                    {typeof module === 'object' && module && 'module_name' in module ? module.module_name : `Module ${index + 1}`}
                  </h3>
                  <p className="text-xs text-gray-600">
                    Click to view module details
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No modules available</p>
          )}
        </div>
      </div>

      <CourseGenerationModal
        isOpen={isGenerationModalOpen}
        onClose={() => setIsGenerationModalOpen(false)}
        onComplete={handleCourseGenerated}
      />
    </>
  );
};

export default CoursesPage;
