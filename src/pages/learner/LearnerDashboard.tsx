import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, BookOpen, Clock, Award, TrendingUp, Target, PlayCircle, Settings, RefreshCw, CheckCircle, ChevronRight } from 'lucide-react';
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
import FormProfileBuilder from '@/components/learner/FormProfileBuilder';
import CourseGenerationWelcome from '@/components/learner/CourseGenerationWelcome';
import CourseOutlineReward from '@/components/learner/CourseOutlineReward';

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

interface CourseOutline {
  course_title: string;
  description: string;
  total_duration_weeks: number;
  total_duration_hours: number;
  modules: any[];
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
  const [courseOutline, setCourseOutline] = useState<CourseOutline | null>(null);
  const [showCourseOutline, setShowCourseOutline] = useState(false);
  
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

      // Check for existing course outline
      const { data: courseIntention } = await supabase
        .from('employee_course_intentions')
        .select('course_outline')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let hasExistingCourseOutline = false;
      if (courseIntention?.course_outline) {
        setCourseOutline(courseIntention.course_outline);
        hasExistingCourseOutline = true;
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

      // Fetch course assignments with course plan data
      const { data: courseAssignments, error } = await supabase
        .from('course_assignments')
        .select(`
          id,
          plan_id,
          progress_percentage,
          status,
          started_at,
          cm_course_plans!inner (
            plan_id,
            course_title,
            employee_name,
            total_modules
          )
        `)
        .eq('employee_id', employee.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      let finalAssignments: CourseAssignment[] = [];
      
      // Transform assignments to match expected structure
      if (courseAssignments && courseAssignments.length > 0) {
        finalAssignments = courseAssignments.map((assignment: any) => ({
          id: assignment.id,
          course_id: assignment.plan_id, // Use plan_id as course_id
          progress_percentage: assignment.progress_percentage || 0,
          status: assignment.status,
          started_at: assignment.started_at,
          cm_module_content: {
            module_name: assignment.cm_course_plans?.course_title || 'Course',
            introduction: `Continue your learning journey with ${assignment.cm_course_plans?.course_title}`,
            content_id: assignment.plan_id
          }
        }));
        setAssignments(finalAssignments);
      } else {
        setAssignments([]);
      }
      
      const hasStartedAnyCourse = finalAssignments.some(a => a.started_at !== null);
      setIsFirstTime(!hasStartedAnyCourse);
      // Only show welcome if no course outline exists
      setShowWelcome(!hasStartedAnyCourse && !hasExistingCourseOutline);
      
      // Show course outline if they haven't started any courses yet
      if (!hasStartedAnyCourse && hasExistingCourseOutline) {
        setShowCourseOutline(true);
      }

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
      <FormProfileBuilder
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

  // Show course outline preview if available and user hasn't started any courses
  if (showCourseOutline && courseOutline && profileCompletion.employeeId) {
    return (
      <CourseOutlineReward
        courseOutline={{
          title: courseOutline.course_title,
          description: courseOutline.description,
          totalDuration: `${courseOutline.total_duration_hours} hours`,
          estimatedWeeks: courseOutline.total_duration_weeks,
          difficultyLevel: 'Intermediate' as const,
          certificateAvailable: true,
          learningObjectives: [],
          skillsToGain: [],
          modules: courseOutline.modules.map((m: any, idx: number) => ({
            id: m.module_id ? `M${String(m.module_id).padStart(2, '0')}` : `M${String(idx + 1).padStart(2, '0')}`,
            name: m.module_name || m.name || `Module ${idx + 1}`,
            description: Array.isArray(m.learning_objectives) 
              ? m.learning_objectives.join(' ') 
              : (m.description || ''),
            duration: m.duration_hours ? `${m.duration_hours} hours` : '3 hours',
            topics: m.key_topics || m.topics || [],
            difficulty: m.difficulty_level || m.difficulty || 'intermediate'
          }))
        }}
        employeeName={userProfile?.full_name || 'Learner'}
        onStartLearning={async () => {
          // Save the intention as accepted
          try {
            await supabase
              .from('employee_course_intentions')
              .update({ intention: 'accepted' })
              .eq('employee_id', profileCompletion.employeeId)
              .order('created_at', { ascending: false })
              .limit(1);
            
            toast.success("Great! We've noted your interest in this course. You'll be notified when it's ready to start.");
            setShowCourseOutline(false);
          } catch (error) {
            console.error('Failed to save intention:', error);
            toast.error('Failed to save your preference');
          }
        }}
        onViewFullCourse={() => {
          // Could open a feedback modal here
          toast.info("Thank you for wanting to improve the course! We'll add a feedback feature soon.");
          setShowCourseOutline(false);
        }}
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

  // Desktop view - Elegant, Minimalistic and Compact
  return (
    <div className="max-w-6xl mx-auto px-6 py-4 space-y-4">
      
      {/* Compact Header with Greeting and Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {getGreeting()}, {userProfile?.full_name?.split(' ')[0]}!
            </h1>
            {streak.current_streak > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">{streak.current_streak} day streak</span>
              </div>
            )}
          </div>
          
          {/* Inline Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{total} courses</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getTotalEstimatedHours()}h</span>
            </div>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Current Course - Compact Card */}
      {currentCourse && (
        <Card 
          className="p-3 hover:shadow-sm transition-shadow cursor-pointer border-gray-200 dark:border-gray-800" 
          onClick={() => continueLearning(currentCourse)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <h3 className="text-sm font-medium">{currentCourse.cm_module_content.module_name}</h3>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <Progress value={currentCourse.progress_percentage || 0} className="h-1.5 flex-1 max-w-[200px]" />
                <span className="text-xs text-muted-foreground">{currentCourse.progress_percentage || 0}%</span>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
              Continue <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* All Courses - Compact Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-muted-foreground">Your Courses</h2>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => navigate('/learner/courses')}>
            View All →
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {assignments.map((assignment) => (
            <Card 
              key={assignment.id} 
              className="p-2.5 hover:shadow-sm transition-shadow cursor-pointer border-gray-200 dark:border-gray-800"
              onClick={() => continueLearning(assignment)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <div className="text-sm">
                    {assignment.status === 'completed' ? '✅' : 
                     assignment.status === 'in_progress' ? '📖' : '📋'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium line-clamp-1">
                      {assignment.cm_module_content.module_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {assignment.status === 'completed' ? 'Completed' : 
                       assignment.status === 'in_progress' ? `${assignment.progress_percentage || 0}% complete` : 
                       'Ready to start'}
                    </p>
                  </div>
                </div>
                {assignment.status !== 'completed' && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress Overview - Visual Path (Optional, can be removed for even more minimalism) */}
      {assignments.length > 0 && (
        <Card className="p-3 border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Learning Progress</span>
            <span className="text-xs text-muted-foreground">{completed} of {total} completed</span>
          </div>
          <div className="flex items-center gap-1">
            {assignments.map((assignment, index) => (
              <div 
                key={assignment.id} 
                className={cn(
                  "flex-1 h-1.5 rounded-full",
                  assignment.status === 'completed' ? 'bg-green-500' :
                  assignment.status === 'in_progress' ? 'bg-blue-500' :
                  'bg-gray-200 dark:bg-gray-800'
                )}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}