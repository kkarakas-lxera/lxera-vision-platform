import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, User, ChevronRight, Play } from 'lucide-react';
import { parseCourseStructure } from '@/utils/typeGuards';

interface CourseAssignment {
  id: string;
  course_id: string;
  plan_id: string;
  progress_percentage: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  course_plan: {
    course_structure: {
      title: string;
      modules: Array<{
        week: number;
        title: string;
        topics: string[];
        duration: string;
        priority: string;
      }>;
    };
  };
}

export default function MyCourses() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [courses, setCourses] = useState<CourseAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      fetchMyCourses();
    }
  }, [userProfile]);

  const fetchMyCourses = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Get employee ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile.id)
        .single();

      if (!employee) {
        throw new Error('Employee profile not found');
      }

      // Fetch course assignments with course plans - fix the relation name
      const { data: assignments, error: assignmentsError } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          plan_id,
          progress_percentage,
          status,
          started_at,
          completed_at,
          cm_course_plans!plan_id(course_structure)
        `)
        .eq('employee_id', employee.id)
        .order('started_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Process and format courses
      const formattedCourses: CourseAssignment[] = (assignments || [])
        .map(assignment => {
          const courseStructureData = assignment.cm_course_plans?.course_structure;
          if (!courseStructureData) return null;

          const courseStructure = parseCourseStructure(courseStructureData);
          
          return {
            id: assignment.id,
            course_id: assignment.course_id,
            plan_id: assignment.plan_id,
            progress_percentage: assignment.progress_percentage || 0,
            status: assignment.status,
            started_at: assignment.started_at,
            completed_at: assignment.completed_at,
            course_plan: {
              course_structure: courseStructure
            }
          };
        })
        .filter(Boolean) as CourseAssignment[];

      setCourses(formattedCourses);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      setError(error.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Courses</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchMyCourses}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Learning Path</h1>
        <p className="text-muted-foreground">Continue your personalized learning journey</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No courses assigned yet</h2>
          <p className="text-muted-foreground mb-4">
            Your learning journey will begin once courses are assigned to you
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {course.course_plan.course_structure.title}
                    </CardTitle>
                    <Badge className={`text-xs ${getStatusColor(course.status)}`}>
                      {course.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(course.progress_percentage)}%</span>
                  </div>
                  <Progress value={course.progress_percentage} className="h-2" />
                </div>

                {/* Course Info */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.course_plan.course_structure.modules.length} modules</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Started {formatDate(course.started_at)}</span>
                  </div>

                  {course.completed_at && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>Completed {formatDate(course.completed_at)}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full mt-4" 
                  onClick={() => navigate(`/learner/course/${course.id}`)}
                  variant={course.status === 'completed' ? 'outline' : 'default'}
                >
                  {course.status === 'completed' ? (
                    <>Review Course</>
                  ) : course.progress_percentage > 0 ? (
                    <>Continue Learning <ChevronRight className="h-4 w-4 ml-2" /></>
                  ) : (
                    <>Start Course <Play className="h-4 w-4 ml-2" /></>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
