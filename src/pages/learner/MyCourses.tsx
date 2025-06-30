import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface CourseAssignment {
  id: string;
  course_id: string;
  progress_percentage: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  cm_module_content: {
    module_name: string;
    introduction: string;
    content_id: string;
  } | null;
}

export default function MyCourses() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);

  useEffect(() => {
    if (userProfile) {
      fetchCourses();
    }
  }, [userProfile]);

  const fetchCourses = async () => {
    try {
      // Get employee record
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile?.id);
      
      const employee = employees?.[0];
      if (!employee) {
        toast.error('Employee profile not found');
        setLoading(false);
        return;
      }

      // Fetch course assignments
      const { data: courseAssignments, error } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          progress_percentage,
          status,
          started_at,
          completed_at
        `)
        .eq('employee_id', employee.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Fetch course content for each assignment
      let finalAssignments: CourseAssignment[] = [];
      
      if (courseAssignments && courseAssignments.length > 0) {
        const assignmentsWithContent = await Promise.all(
          courseAssignments.map(async (assignment) => {
            const { data: content } = await supabase
              .from('cm_module_content')
              .select('module_name, introduction, content_id')
              .eq('content_id', assignment.course_id)
              .single();
            
            return {
              ...assignment,
              cm_module_content: content
            };
          })
        );
        
        finalAssignments = assignmentsWithContent;
      }
      
      setAssignments(finalAssignments);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleContinueCourse = (courseId: string) => {
    navigate(`/learner/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress and access your assigned courses
        </p>
      </div>

      {/* Courses Grid */}
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses assigned yet</h3>
            <p className="text-muted-foreground">
              Your learning journey will begin once courses are assigned to you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {assignment.cm_module_content?.module_name || 'Course'}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {assignment.cm_module_content?.introduction?.split('\n')[0] || 
                       'Begin your learning journey with this comprehensive course.'}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusColor(assignment.status)} className="ml-4">
                    <span className="flex items-center gap-1">
                      {getStatusIcon(assignment.status)}
                      {assignment.status.replace('_', ' ')}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(assignment.progress_percentage)}%</span>
                  </div>
                  <Progress value={assignment.progress_percentage} className="h-2" />
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {assignment.started_at && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Started {new Date(assignment.started_at).toLocaleDateString()}
                    </div>
                  )}
                  {assignment.completed_at && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Completed {new Date(assignment.completed_at).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {/* Action */}
                <Button 
                  onClick={() => handleContinueCourse(assignment.course_id)}
                  className="w-full"
                  variant={assignment.status === 'completed' ? 'outline' : 'default'}
                >
                  {assignment.status === 'completed' ? 'Review Course' : 
                   assignment.status === 'in_progress' ? 'Continue Learning' : 
                   'Start Course'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}