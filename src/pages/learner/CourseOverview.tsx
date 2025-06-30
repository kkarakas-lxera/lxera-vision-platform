import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  PlayCircle, 
  CheckCircle, 
  Calendar,
  User,
  Target,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CourseAssignment {
  id: string;
  course_id: string;
  total_modules: number;
  modules_completed: number;
  progress_percentage: number;
  status: string;
  course_plans: {
    course_title: string;
    course_description: string;
    course_duration_weeks: number;
    total_modules: number;
  } | null;
}

const CourseOverview = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<CourseAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && courseId) {
      fetchCourseAssignment();
    }
  }, [user, courseId]);

  const fetchCourseAssignment = async () => {
    if (!user || !courseId) return;

    try {
      setLoading(true);

      // Get employee ID first
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (employeeError) throw employeeError;

      // Get course assignment with plan details
      const { data, error } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          total_modules,
          modules_completed,
          progress_percentage,
          status,
          plan_id
        `)
        .eq('employee_id', employeeData.id)
        .eq('course_id', courseId)
        .single();

      if (error) throw error;

      // Get course plan details if plan_id exists
      let coursePlans = null;
      if (data.plan_id) {
        const { data: planData, error: planError } = await supabase
          .from('cm_course_plans')
          .select('course_title, course_duration_weeks, total_modules')
          .eq('plan_id', data.plan_id)
          .single();

        if (!planError && planData) {
          coursePlans = {
            course_title: planData.course_title || 'Personalized Learning Course',
            course_description: 'A personalized course designed for your learning needs',
            course_duration_weeks: planData.course_duration_weeks || 4,
            total_modules: planData.total_modules || data.total_modules
          };
        }
      }

      // Set assignment with proper course_plans structure
      const assignmentData: CourseAssignment = {
        id: data.id,
        course_id: data.course_id,
        total_modules: data.total_modules,
        modules_completed: data.modules_completed,
        progress_percentage: data.progress_percentage,
        status: data.status,
        course_plans: coursePlans
      };

      setAssignment(assignmentData);
    } catch (error: any) {
      console.error('Error fetching course assignment:', error);
      setError(error.message);
      toast.error('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCourse = () => {
    if (assignment) {
      navigate(`/learner/course/${assignment.course_id}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-2">
              <BookOpen className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || "The course you're looking for doesn't exist or you don't have access to it."}
            </p>
            <Button onClick={() => navigate('/learner/courses')}>
              Back to My Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const courseTitle = assignment.course_plans?.course_title || 'Personalized Learning Course';
  const courseDescription = assignment.course_plans?.course_description || 'A personalized course designed for your learning needs';
  const duration = assignment.course_plans?.course_duration_weeks || 4;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{courseTitle}</h1>
          <p className="text-muted-foreground mt-2">{courseDescription}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/learner/courses')} variant="outline">
            Back to Courses
          </Button>
          <Button onClick={handleStartCourse} className="min-w-[120px]">
            <PlayCircle className="h-4 w-4 mr-2" />
            {assignment.progress_percentage > 0 ? 'Continue' : 'Start Course'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-medium">{Math.round(assignment.progress_percentage)}%</span>
                </div>
                <Progress value={assignment.progress_percentage} className="w-full" />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{assignment.modules_completed}</div>
                    <div className="text-sm text-blue-600">Completed</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">{assignment.total_modules - assignment.modules_completed}</div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                About This Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {courseDescription}
              </p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {duration} weeks
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {assignment.total_modules} modules
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Personalized Learning
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Course Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>
                  {assignment.status === 'completed' ? 'Completed' : 
                   assignment.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Progress</span>
                <span className="text-sm font-medium">{Math.round(assignment.progress_percentage)}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Modules</span>
                <span className="text-sm font-medium">{assignment.modules_completed}/{assignment.total_modules}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleStartCourse} className="w-full">
                <PlayCircle className="h-4 w-4 mr-2" />
                {assignment.progress_percentage > 0 ? 'Continue Learning' : 'Start Course'}
              </Button>
              
              {assignment.progress_percentage > 0 && (
                <Button variant="outline" className="w-full">
                  <Trophy className="h-4 w-4 mr-2" />
                  View Achievements
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
