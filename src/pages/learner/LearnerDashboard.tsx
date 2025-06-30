import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, BookOpen, Clock, Award, TrendingUp, Target, PlayCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import WelcomeOnboarding from '@/components/learner/WelcomeOnboarding';

interface CourseAssignment {
  id: string;
  course_id: string;
  progress_percentage: number;
  status: string;
  started_at: string | null;
  cm_module_content: {
    module_name: string;
    introduction: string;
    content_id: string;
  };
}

interface LearningStreak {
  current_streak: number;
  last_learning_date: string | null;
}

export default function LearnerDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [streak, setStreak] = useState<LearningStreak>({ current_streak: 0, last_learning_date: null });
  const [currentCourse, setCurrentCourse] = useState<CourseAssignment | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (userProfile) {
      fetchLearnerData();
    }
  }, [userProfile]);

  const fetchLearnerData = async () => {
    try {
      // Get employee record linked to this user
      const { data: employees } = await supabase
        .from('employees')
        .select('id, learning_streak, last_learning_date')
        .eq('user_id', userProfile?.id);
      
      const employee = employees?.[0];

      if (!employee) {
        toast.error('Employee profile not found');
        setLoading(false);
        return;
      }

      // Update streak if needed
      const today = new Date().toDateString();
      const lastLearning = employee.last_learning_date ? new Date(employee.last_learning_date).toDateString() : null;
      
      if (lastLearning !== today) {
        // Update last learning date
        await supabase
          .from('employees')
          .update({ last_learning_date: new Date().toISOString() })
          .eq('id', employee.id);
      }

      setStreak({
        current_streak: employee.learning_streak || 0,
        last_learning_date: employee.last_learning_date
      });

      // Fetch course assignments with course content
      const { data: courseAssignments, error } = await supabase
        .from('course_assignments')
        .select(`
          id,
          course_id,
          progress_percentage,
          status,
          started_at
        `)
        .eq('employee_id', employee.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      let finalAssignments: CourseAssignment[] = [];
      
      // For each assignment, fetch the course content
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
        
        finalAssignments = assignmentsWithContent.filter(a => a.cm_module_content) as CourseAssignment[];
        setAssignments(finalAssignments);
      } else {
        setAssignments([]);
      }
      
      const hasStartedAnyCourse = finalAssignments.some(a => a.started_at !== null);
      setIsFirstTime(!hasStartedAnyCourse);
      setShowWelcome(!hasStartedAnyCourse);

      // Set current course (most recently accessed in-progress course)
      const inProgressCourses = finalAssignments.filter(a => a.status === 'in_progress');
      if (inProgressCourses.length > 0) {
        setCurrentCourse(inProgressCourses[0]);
      }
    } catch (error) {
      console.error('Error fetching learner data:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const continueLearning = (assignment: CourseAssignment) => {
    navigate(`/learner/course/${assignment.course_id}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getProgressPath = () => {
    const completed = assignments.filter(a => a.status === 'completed').length;
    const total = assignments.length;
    return { completed, total };
  };

  const getTotalEstimatedHours = () => {
    // Estimate 8 hours per course as default
    return assignments.length * 8;
  };

  const handleStartLearning = () => {
    setShowWelcome(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show welcome screen for first-time users
  if (showWelcome) {
    return (
      <WelcomeOnboarding
        coursesCount={assignments.length}
        estimatedHours={getTotalEstimatedHours()}
        onStartLearning={handleStartLearning}
      />
    );
  }

  const { completed, total } = getProgressPath();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-foreground">
            {getGreeting()}, {userProfile?.full_name?.split(' ')[0]}! Ready to continue learning?
          </h1>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Streak Banner */}
        {streak.current_streak > 0 && (
          <Card className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-medium text-orange-900">
                {streak.current_streak}-day streak! Keep it up!
              </span>
            </div>
          </Card>
        )}

        {/* Learning Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">
                {total === completed ? 'All completed' : 'Ready to learn'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {total > 0 ? Math.round((completed / total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Overall completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalEstimatedHours()}h</div>
              <p className="text-xs text-muted-foreground">Estimated total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completed === total ? '🎉' : `${completed + 1}${completed === 0 ? 'st' : completed === 1 ? 'nd' : completed === 2 ? 'rd' : 'th'}`}
              </div>
              <p className="text-xs text-muted-foreground">
                {completed === total ? 'All done!' : 'Course completion'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Continue Where You Left Off */}
      {currentCourse && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-muted-foreground">Continue where you left off</h2>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => continueLearning(currentCourse)}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {currentCourse.cm_module_content.module_name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {currentCourse.cm_module_content.introduction}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Progress value={currentCourse.progress_percentage || 0} className="h-3" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{currentCourse.progress_percentage || 0}% complete</span>
                  <Button size="sm" className="gap-2">
                    Continue Learning
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Next up: Module overview • 15 min
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Learning Path */}
      <div className="space-y-3">
        <h2 className="text-lg font-medium text-muted-foreground">Your Learning Path</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <span className="font-medium">Progress Overview</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {completed} of {total} courses completed
              </span>
            </div>
            
            {/* Visual Progress Path */}
            <div className="relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2" />
              <div className="relative flex justify-between">
                {assignments.slice(0, 5).map((assignment, index) => (
                  <div key={assignment.id} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-background z-10 ${
                      assignment.status === 'completed' 
                        ? 'border-green-500 bg-green-50' 
                        : assignment.status === 'in_progress'
                        ? 'border-primary bg-primary/10'
                        : 'border-muted'
                    }`}>
                      {assignment.status === 'completed' ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : assignment.status === 'in_progress' ? (
                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                      ) : (
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-2 text-center max-w-[80px] line-clamp-2">
                      {assignment.cm_module_content.module_name.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* All Courses */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-muted-foreground">All Courses</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/learner/courses')}>
            View All →
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.slice(0, 4).map((assignment) => (
            <Card 
              key={assignment.id} 
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => continueLearning(assignment)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="text-lg">
                      {assignment.status === 'completed' ? '📚' : 
                       assignment.status === 'in_progress' ? '📖' : '📋'}
                    </div>
                    <h3 className="font-medium line-clamp-1">
                      {assignment.cm_module_content.module_name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    {assignment.status === 'completed' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        ✓ Completed
                      </Badge>
                    )}
                    {assignment.status === 'in_progress' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        In Progress
                      </Badge>
                    )}
                    {assignment.status === 'assigned' && (
                      <Badge variant="outline">
                        Ready to Start
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress value={assignment.progress_percentage || 0} className="h-2" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{assignment.progress_percentage || 0}% complete</span>
                    {assignment.status === 'completed' ? (
                      <span className="text-green-600 font-medium">Completed</span>
                    ) : assignment.status === 'in_progress' ? (
                      <span className="text-blue-600 font-medium">
                        {Math.round((100 - (assignment.progress_percentage || 0)) / 10)} modules left
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        {Math.round(getTotalEstimatedHours() / assignments.length)} hours estimated
                      </span>
                    )}
                  </div>
                  
                  {/* Course description preview */}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {assignment.cm_module_content.introduction || 'No description available'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}