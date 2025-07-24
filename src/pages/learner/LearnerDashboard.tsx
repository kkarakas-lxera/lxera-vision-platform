import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, BookOpen, Clock, Award, TrendingUp, Target, PlayCircle, Settings, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import WelcomeOnboarding from '@/components/learner/WelcomeOnboarding';
import MobileLearningProgress from '@/components/mobile/learner/MobileLearningProgress';
import MobileCourseCards from '@/components/mobile/learner/MobileCourseCards';
import MobileLearnerStatsCarousel from '@/components/mobile/learner/MobileLearnerStatsCarousel';
import MobileRecentActivity from '@/components/mobile/learner/MobileRecentActivity';
import MobileQuickActions from '@/components/mobile/learner/MobileQuickActions';
import PullToRefreshIndicator from '@/components/mobile/shared/PullToRefreshIndicator';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { 
  injectTouchOptimizationStyles,
  createTouchOptimizedClass,
  triggerHapticFeedback
} from '@/utils/touchOptimization';
import { cn } from '@/lib/utils';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import ChatProfileBuilder from '@/components/learner/ChatProfileBuilder';
import CourseGenerationWelcome from '@/components/learner/CourseGenerationWelcome';

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

interface ActivityItem {
  id: string;
  type: 'course_started' | 'module_completed' | 'achievement_earned' | 'progress_milestone';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    course_name?: string;
    module_name?: string;
    achievement_type?: string;
    progress_percentage?: number;
  };
}

export default function LearnerDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const profileCompletion = useProfileCompletion();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [streak, setStreak] = useState<LearningStreak>({ current_streak: 0, last_learning_date: null });
  const [currentCourse, setCurrentCourse] = useState<CourseAssignment | null>(null);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showCourseGeneration, setShowCourseGeneration] = useState(false);
  
  // Pull-to-refresh functionality
  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      await fetchLearnerData(true);
    },
    threshold: 80,
    disabled: !isMobile || loading
  });

  useEffect(() => {
    if (userProfile) {
      fetchLearnerData();
      
      // Check if coming from profile completion
      const shouldShowCourseGen = localStorage.getItem('showCourseGeneration');
      const profileJustCompleted = localStorage.getItem('profileJustCompleted');
      
      if (shouldShowCourseGen === 'true' && profileJustCompleted === 'true') {
        setShowCourseGeneration(true);
        // Clear the flags
        localStorage.removeItem('showCourseGeneration');
        localStorage.removeItem('profileJustCompleted');
      }
    }
  }, [userProfile]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Inject touch optimization styles
    injectTouchOptimizationStyles();
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchLearnerData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }
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

      // Mock recent activity data (in real app, this would be fetched from API)
      const mockActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'course_started',
          title: 'Started new course',
          description: 'Began learning about advanced concepts',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          metadata: { course_name: 'Advanced Learning' }
        },
        {
          id: '2',
          type: 'module_completed',
          title: 'Module completed',
          description: 'Finished Introduction to Basics',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          metadata: { module_name: 'Introduction', progress_percentage: 25 }
        },
        {
          id: '3',
          type: 'achievement_earned',
          title: 'Achievement unlocked',
          description: 'Earned "Quick Learner" badge',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          metadata: { achievement_type: 'Quick Learner' }
        }
      ];
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching learner data:', error);
      toast.error('Failed to load your courses');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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

  const handleRefresh = async () => {
    await fetchLearnerData(true);
  };

  const handlePullToRefresh = async () => {
    await fetchLearnerData(true);
  };
  
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchLearnerData(true);
    setIsRefreshing(false);
  };

  const handleQuickAction = (actionId: string) => {
    // Add haptic feedback for better mobile UX
    if (isMobile) {
      triggerHapticFeedback('light');
    }
    
    switch (actionId) {
      case 'continue':
        if (currentCourse) {
          continueLearning(currentCourse);
        }
        break;
      case 'browse':
        navigate('/learner/courses');
        break;
      case 'search':
        navigate('/learner/courses?search=true');
        break;
      case 'settings':
        navigate('/learner/settings');
        break;
      default:
        console.log('Quick action:', actionId);
    }
  };

  // Handle profile completion redirect
  const handleProfileComplete = () => {
    window.location.reload(); // Reload to refresh profile completion status
  };

  if (loading || profileCompletion.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show profile completion flow if profile is not complete
  if (!profileCompletion.isComplete && profileCompletion.employeeId) {
    return (
      <ChatProfileBuilder
        employeeId={profileCompletion.employeeId}
        onComplete={handleProfileComplete}
      />
    );
  }

  // Show course generation welcome after profile completion
  if (showCourseGeneration && profileCompletion.employeeId) {
    return (
      <CourseGenerationWelcome
        employeeId={profileCompletion.employeeId}
        employeeName={userProfile?.full_name || 'Learner'}
        onClose={() => setShowCourseGeneration(false)}
      />
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

  // Mobile view
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Pull-to-refresh indicator */}
        <PullToRefreshIndicator
          isRefreshing={pullToRefresh.isRefreshing || isRefreshing}
          pullDistance={pullToRefresh.pullDistance}
          progress={pullToRefresh.getRefreshProgress()}
        />
        
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {getGreeting()}, {userProfile?.full_name?.split(' ')[0]}!
              </h1>
              <p className="text-sm text-muted-foreground">
                {pullToRefresh.shouldShowRefreshIndicator() 
                  ? "Pull down to refresh" 
                  : "Ready to continue learning?"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isMobile) triggerHapticFeedback('light');
                  handleManualRefresh();
                }}
                disabled={isRefreshing || pullToRefresh.isRefreshing}
                className={cn(
                  "h-8 w-8 p-0",
                  createTouchOptimizedClass('minimal', 'subtle')
                )}
              >
                <RefreshCw className={cn(
                  "h-4 w-4 transition-transform", 
                  (isRefreshing || pullToRefresh.isRefreshing) && "animate-spin"
                )} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 w-8 p-0",
                  createTouchOptimizedClass('minimal', 'subtle')
                )}
                onClick={() => {
                  if (isMobile) triggerHapticFeedback('light');
                  navigate('/learner/settings');
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main content with pull-to-refresh */}
        <div 
          className="overflow-y-auto touch-pan-y"
          ref={pullToRefresh.setScrollElement}
          style={{
            transform: pullToRefresh.pullDistance > 0 
              ? `translateY(${Math.min(pullToRefresh.pullDistance * 0.5, 40)}px)` 
              : 'translateY(0)',
            transition: pullToRefresh.pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
          }}
        >
          {/* Enhanced Streak Banner */}
          {streak.current_streak > 0 && (
            <div className="px-4 py-3">
              <Card className={cn(
                "p-3 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200",
                "active:scale-99 transition-transform cursor-pointer",
                createTouchOptimizedClass('comfortable', 'gentle')
              )}
              onClick={() => {
                if (isMobile) triggerHapticFeedback('medium');
                // Could navigate to streak details
              }}
              >
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-orange-900">
                    {streak.current_streak}-day streak! Keep it up!
                  </span>
                  <div className="ml-auto text-xs text-orange-600 flex items-center gap-1">
                    <span>Tap for details</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Stats Carousel */}
          <MobileLearnerStatsCarousel
            stats={{
              totalCourses: total,
              completedCourses: completed,
              progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
              estimatedHours: getTotalEstimatedHours(),
              currentStreak: streak.current_streak,
              nextGoal: completed === total ? '🎉' : `${completed + 1}${completed === 0 ? 'st' : completed === 1 ? 'nd' : completed === 2 ? 'rd' : 'th'}`
            }}
            onCardClick={handleQuickAction}
          />

          {/* Current Course Progress */}
          <MobileLearningProgress
            currentCourse={currentCourse}
            onContinueLearning={continueLearning}
          />

          {/* Quick Actions */}
          <MobileQuickActions
            currentCourseId={currentCourse?.course_id}
            onContinueCourse={() => currentCourse && continueLearning(currentCourse)}
            onBrowseCatalog={() => navigate('/learner/courses')}
            onSearch={() => navigate('/learner/courses?search=true')}
            onSettings={() => navigate('/learner/settings')}
          />

          {/* Course Cards */}
          <MobileCourseCards
            assignments={assignments}
            onContinueLearning={continueLearning}
            onViewAll={() => navigate('/learner/courses')}
            estimatedHours={getTotalEstimatedHours()}
          />

          {/* Recent Activity */}
          <MobileRecentActivity
            activities={recentActivity}
            onViewAll={() => navigate('/learner/activity')}
          />

          {/* Bottom spacing for mobile navigation */}
          <div className="pb-20" />
        </div>
        
        {/* Loading overlay for refresh */}
        {(pullToRefresh.isRefreshing || isRefreshing) && (
          <div className="fixed inset-0 bg-background/50 backdrop-blur-sm z-30 flex items-center justify-center">
            <div className="bg-background p-4 rounded-lg shadow-lg flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Refreshing your courses...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
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

// Global touch optimization is now handled by the touchOptimization utility
// This ensures consistent touch behavior across all mobile components