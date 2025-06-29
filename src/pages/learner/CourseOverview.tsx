import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lock, CheckCircle, PlayCircle, Clock, BookOpen, Target, Users, Award } from 'lucide-react';
import { toast } from 'sonner';

interface CourseModule {
  id: string;
  module_number: number;
  module_title: string;
  content_id: string;
  is_unlocked: boolean;
  is_completed: boolean;
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  cm_module_content: {
    total_word_count: number;
    introduction: string | null;
  };
}

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
  };
}

export default function CourseOverview() {
  const { courseId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<CourseAssignment | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile && courseId) {
      fetchCourseData();
    }
  }, [userProfile, courseId]);

  const fetchCourseData = async () => {
    try {
      // Get employee record
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile?.id)
        .single();

      if (!employee) {
        toast.error('Employee profile not found');
        navigate('/learner');
        return;
      }

      setEmployeeId(employee.id);

      // Fetch course assignment with plan details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          total_modules,
          modules_completed,
          progress_percentage,
          status,
          course_plans:plan_id (
            course_title,
            course_description,
            course_duration_weeks,
            total_modules
          )
        `)
        .eq('employee_id', employee.id)
        .eq('course_id', courseId)
        .single();

      if (assignmentError) throw assignmentError;
      setAssignment(assignmentData);

      // Fetch course modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select(`
          *,
          cm_module_content!inner(
            total_word_count,
            introduction
          )
        `)
        .eq('assignment_id', assignmentData.id)
        .order('module_number');

      if (modulesError) throw modulesError;
      
      // Ensure first module is always unlocked
      if (modulesData && modulesData.length > 0) {
        modulesData[0].is_unlocked = true;
        
        // Progressive unlocking: unlock next module if previous is completed
        for (let i = 1; i < modulesData.length; i++) {
          if (modulesData[i - 1].is_completed) {
            modulesData[i].is_unlocked = true;
          }
        }
      }
      
      setModules(modulesData || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course overview');
      navigate('/learner');
    } finally {
      setLoading(false);
    }
  };

  const startModule = async (module: CourseModule) => {
    if (!module.is_unlocked) {
      toast.error('Complete previous modules to unlock this one');
      return;
    }

    // Mark module as started if not already
    if (!module.started_at) {
      await supabase
        .from('course_modules')
        .update({ 
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);
    }

    // Navigate to module viewer
    navigate(`/learner/course/${courseId}/module/${module.content_id}`);
  };

  const getModuleIcon = (moduleNumber: number) => {
    const icons = [BookOpen, Target, Users, Award];
    return icons[(moduleNumber - 1) % icons.length];
  };

  const getEstimatedTime = (wordCount: number) => {
    // Estimate reading time: 200 words per minute + exercises
    const readingMinutes = Math.ceil(wordCount / 200);
    const totalMinutes = readingMinutes + 15; // Add time for exercises
    return totalMinutes < 60 ? `${totalMinutes} min` : `${Math.ceil(totalMinutes / 60)}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assignment || !modules.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <Button onClick={() => navigate('/learner')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/learner')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {assignment.course_plans?.course_title || 'Course'}
            </h1>
            <p className="text-muted-foreground">
              {assignment.course_plans?.course_description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Badge variant="secondary" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {assignment.total_modules} Modules
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {assignment.course_plans?.course_duration_weeks} Weeks
              </Badge>
              <Badge variant={assignment.status === 'completed' ? 'default' : 'outline'}>
                {assignment.status === 'completed' ? 'Completed' : 
                 assignment.status === 'in_progress' ? 'In Progress' : 'Not Started'}
              </Badge>
            </div>
          </div>
          
          {/* Overall Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{assignment.progress_percentage}%</span>
            </div>
            <Progress value={assignment.progress_percentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {assignment.modules_completed} of {assignment.total_modules} modules completed
            </p>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = getModuleIcon(module.module_number);
            const isLocked = !module.is_unlocked;
            
            return (
              <Card 
                key={module.id} 
                className={`relative transition-all ${
                  isLocked ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'
                }`}
                onClick={() => !isLocked && startModule(module)}
              >
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg z-10">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        module.is_completed ? 'bg-green-100' : 'bg-primary/10'
                      }`}>
                        {module.is_completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Icon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Module {module.module_number}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {module.is_completed ? 'Completed' : 
                           module.started_at ? 'In Progress' : 'Not Started'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <h3 className="font-semibold line-clamp-2">
                    {module.module_title}
                  </h3>
                  
                  {module.cm_module_content.introduction && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {module.cm_module_content.introduction.substring(0, 150)}...
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getEstimatedTime(module.cm_module_content.total_word_count || 3000)}
                    </span>
                    
                    {module.progress_percentage > 0 && (
                      <span className="font-medium">
                        {module.progress_percentage}% complete
                      </span>
                    )}
                  </div>
                  
                  {module.progress_percentage > 0 && (
                    <Progress value={module.progress_percentage} className="h-1" />
                  )}
                  
                  <Button 
                    className="w-full" 
                    variant={module.is_completed ? "outline" : "default"}
                    disabled={isLocked}
                  >
                    {module.is_completed ? 'Review Module' : 
                     module.started_at ? 'Continue Learning' : 'Start Module'}
                    {!module.is_completed && <PlayCircle className="h-4 w-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Completion Certificate Card */}
        {assignment.status === 'completed' && (
          <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Congratulations!</h3>
                  <p className="text-muted-foreground">
                    You've completed all modules in this course
                  </p>
                </div>
              </div>
              <Button>
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}