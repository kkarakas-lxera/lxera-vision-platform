import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  GraduationCap, 
  Target, 
  TrendingUp,
  Upload,
  Building2,
  BarChart3,
  Activity,
  CheckCircle2,
  AlertTriangle,
  BrainCircuit,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { getCompanyPermissions, type CompanyPermissions } from '@/utils/permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import MobileMetricsCarousel from '@/components/mobile/company/MobileMetricsCarousel';
import MobileSkillsHealthCard from '@/components/mobile/company/MobileSkillsHealthCard';
import EmptyStateOverlay from '@/components/dashboard/EmptyStateOverlay';
import { cn } from '@/lib/utils';
import SkillsGapOnboardingFlow from '@/components/dashboard/SkillsGapOnboardingFlow';

interface DashboardMetrics {
  totalEmployees: number;
  activeLearningPaths: number;
  skillsCoverage: number;
  avgReadinessScore: number;
  employeesWithCVs: number;
  analyzedCVs: number;
  positionsWithGaps: number;
  criticalGaps: number;
}

interface SkillsHealthData {
  overallScore: number;
  grade: string;
  trend: number;
  criticalGaps: number;
  analyzedCount: number;
  totalCount: number;
}

interface RecentActivity {
  id: string;
  type: 'onboarding' | 'completion' | 'analysis' | 'gap_found';
  message: string;
  timestamp: string;
  icon: React.ReactNode;
}

interface SkillGapOverview {
  position: string;
  position_code: string;
  requiredSkills: number;
  coverage: number;
  employeesInPosition: number;
  avgMatchScore: number;
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeLearningPaths: 0,
    skillsCoverage: 0,
    avgReadinessScore: 0,
    employeesWithCVs: 0,
    analyzedCVs: 0,
    positionsWithGaps: 0,
    criticalGaps: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [skillsGapData, setSkillsGapData] = useState<SkillGapOverview[]>([]);
  const [skillsHealth, setSkillsHealth] = useState<SkillsHealthData | null>(null);
  const [positionsCount, setPositionsCount] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  
  // Mobile pull-to-refresh state
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  
  // Mobile carousel state for skills gap section
  const [skillsGapActiveIndex, setSkillsGapActiveIndex] = useState(0);
  const skillsGapCarouselRef = useRef<HTMLDivElement>(null);
  
  // Permissions and welcome modal state
  const [permissions, setPermissions] = useState<CompanyPermissions | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (userProfile?.company_id) {
      checkOnboardingStatus();
      fetchDashboardData();
      checkPermissions();

      // Set up real-time subscriptions
      const employeesSubscription = supabase
        .channel('dashboard-employees')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'employees',
            filter: `company_id=eq.${userProfile.company_id}`
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      const profilesSubscription = supabase
        .channel('dashboard-profiles')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'st_employee_skills_profile'
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      const assignmentsSubscription = supabase
        .channel('dashboard-assignments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'course_assignments'
          },
          () => {
            fetchDashboardData();
          }
        )
        .subscribe();

      // Cleanup subscriptions on unmount
      return () => {
        supabase.removeChannel(employeesSubscription);
        supabase.removeChannel(profilesSubscription);
        supabase.removeChannel(assignmentsSubscription);
      };
    }
  }, [userProfile]);

  const checkOnboardingStatus = async () => {
    if (!userProfile?.company_id || userProfile?.companies?.plan_type !== 'free_skills_gap') {
      setOnboardingComplete(true);
      return;
    }

    try {
      // Check if skills gap analysis has been completed
      const { count: analyzedCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id)
        .not('cv_analysis', 'is', null);

      // Check if gap analysis results exist
      const { count: gapCount } = await supabase
        .from('employee_skills_profile')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id)
        .not('gap_analysis', 'is', null);

      setOnboardingComplete((analyzedCount && analyzedCount > 0) || (gapCount && gapCount > 0));
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingComplete(false);
    }
  };

  const checkPermissions = async () => {
    if (userProfile?.company_id) {
      const companyPermissions = await getCompanyPermissions(userProfile.company_id);
      setPermissions(companyPermissions);
      
      // Show welcome modal for skills gap users on first visit
      if (companyPermissions?.isSkillsGapUser) {
        const hasSeenWelcome = localStorage.getItem('skills-gap-welcome-seen');
        if (!hasSeenWelcome) {
          setShowWelcomeModal(true);
        }
      }
    }
  };

  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('skills-gap-welcome-seen', 'true');
  };

  const fetchDashboardData = async (isRefresh: boolean = false) => {
    if (!userProfile?.company_id) return;

    try {
      if (!isRefresh) {
        setLoading(true);
      }

      // Fetch positions first to check if any exist
      const { data: positionsData, count: posCount } = await supabase
        .from('st_company_positions')
        .select('id', { count: 'exact' })
        .eq('company_id', userProfile.company_id);
      
      setPositionsCount(posCount || 0);

      // Fetch employees first
      const { data: employees, count: employeeCount } = await supabase
        .from('employees')
        .select(`
          id,
          cv_file_path,
          skills_last_analyzed,
          current_position_id
        `, { count: 'exact' })
        .eq('company_id', userProfile.company_id);

      // Count employees with CVs
      const employeesWithCVs = employees?.filter(e => e.cv_file_path)?.length || 0;
      
      // Get employee IDs for skills profile query
      const employeeIds = employees?.map(e => e.id) || [];
      
      // Fetch skills profiles separately to bypass RLS
      const { data: skillsProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select('employee_id, skills_match_score, career_readiness_score, analyzed_at')
        .in('employee_id', employeeIds);

      // Count analyzed CVs (employees with skills profiles)
      const analyzedCVs = skillsProfiles?.length || 0;

      // Calculate averages from skills profiles
      const avgMatchScore = skillsProfiles?.length 
        ? skillsProfiles.reduce((acc, profile) => acc + (profile.skills_match_score || 0), 0) / skillsProfiles.length
        : 0;

      const avgReadiness = skillsProfiles?.length
        ? skillsProfiles.reduce((acc, profile) => acc + (profile.career_readiness_score || 0), 0) / skillsProfiles.length
        : 0;

      // Fetch active learning paths through employees join
      const { data: activeAssignments } = await supabase
        .from('course_assignments')
        .select('id, employee_id')
        .in('employee_id', employeeIds)
        .in('status', ['assigned', 'in_progress']);

      const activePaths = activeAssignments?.length || 0;

      // Calculate positions with gaps using the database function
      const { data: gapAnalysis, error: gapError } = await supabase
        .rpc('calculate_skills_gap', { p_company_id: userProfile.company_id });

      let positionsWithGaps = 0;
      let criticalGaps = 0;

      if (gapAnalysis && !gapError) {
        // Count positions with gaps (less than 80% average match)
        positionsWithGaps = gapAnalysis.filter(g => Number(g.avg_match_percentage) < 80).length;
        
        // Sum up critical gaps count across all positions
        criticalGaps = gapAnalysis.reduce((total, g) => total + Number(g.critical_gaps_count || 0), 0);
      } else if (gapError) {
        console.error('Error calculating skills gap:', gapError);
        // Fallback to manual calculation if database function fails
        const { data: positions } = await supabase
          .from('st_company_positions')
          .select('id, position_title')
          .eq('company_id', userProfile.company_id);

        if (positions && skillsProfiles) {
          // Create a map of employee positions to match scores
          const positionScores = new Map();
          
          for (const employee of employees || []) {
            if (employee.current_position_id) {
              const profile = skillsProfiles.find(p => p.employee_id === employee.id);
              if (profile) {
                const score = profile.skills_match_score || 0;
                if (!positionScores.has(employee.current_position_id)) {
                  positionScores.set(employee.current_position_id, []);
                }
                positionScores.get(employee.current_position_id).push(score);
              }
            }
          }

          // Calculate average scores per position
          for (const [positionId, scores] of positionScores) {
            const avgScore = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
            if (avgScore < 80) positionsWithGaps++;
            if (avgScore < 50) criticalGaps += scores.filter((s: number) => s < 50).length;
          }
        }
      }

      setMetrics({
        totalEmployees: employeeCount || 0,
        activeLearningPaths: activePaths || 0,
        skillsCoverage: Math.round(avgMatchScore),
        avgReadinessScore: Math.round(avgReadiness),
        employeesWithCVs,
        analyzedCVs,
        positionsWithGaps,
        criticalGaps
      });

      // Calculate Skills Health Score
      const calculateGrade = (score: number) => {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'B+';
        if (score >= 75) return 'B';
        if (score >= 70) return 'C+';
        if (score >= 65) return 'C';
        if (score >= 60) return 'D';
        return 'F';
      };

      // Calculate trend (would need historical data for real trend)
      const trend = 5; // Placeholder - positive trend

      setSkillsHealth({
        overallScore: Math.round(avgMatchScore),
        grade: calculateGrade(avgMatchScore),
        trend: trend,
        criticalGaps: criticalGaps,
        analyzedCount: analyzedCVs,
        totalCount: employeeCount || 0
      });

      // Fetch recent activities
      await fetchRecentActivities();
      
      // Fetch skills gap overview with real data
      await fetchSkillsGapOverview();

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      if (isRefresh) {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
      }
    }
  };

  const fetchRecentActivities = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Fetch recent import sessions
      const { data: imports } = await supabase
        .from('st_import_sessions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Get employee IDs for the company
      const { data: companyEmployees } = await supabase
        .from('employees')
        .select('id, user_id')
        .eq('company_id', userProfile.company_id);

      const employeeIds = companyEmployees?.map(e => e.id) || [];
      const userIds = companyEmployees?.map(e => e.user_id).filter(Boolean) || [];

      // Fetch user names separately
      const { data: users } = await supabase
        .from('users')
        .select('id, full_name')
        .in('id', userIds);

      const userMap = new Map();
      users?.forEach(user => userMap.set(user.id, user.full_name));

      // Fetch recent skills profiles for gap discoveries
      const { data: recentProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select('employee_id, skills_match_score, analyzed_at, extracted_skills')
        .in('employee_id', employeeIds)
        .order('analyzed_at', { ascending: false })
        .limit(5);

      // Map employee IDs to names
      const employeeNameMap = new Map();
      companyEmployees?.forEach(emp => {
        const userName = userMap.get(emp.user_id) || 'Unknown Employee';
        employeeNameMap.set(emp.id, userName);
      });

      // Combine and format activities
      const activities: RecentActivity[] = [];

      imports?.forEach(imp => {
        activities.push({
          id: imp.id,
          type: 'onboarding',
          message: `Imported ${imp.successful} employees successfully`,
          timestamp: imp.created_at,
          icon: <Upload className="h-4 w-4" />
        });
      });

      // Add analysis activities from recent profiles
      recentProfiles?.forEach(profile => {
        const employeeName = employeeNameMap.get(profile.employee_id) || 'Unknown Employee';
        const skillsCount = Array.isArray(profile.extracted_skills) ? profile.extracted_skills.length : 0;
        const matchScore = profile.skills_match_score || 0;
        
        activities.push({
          id: `analysis-${profile.employee_id}`,
          type: 'analysis',
          message: `Analyzed CV for ${employeeName} (${skillsCount} skills found)`,
          timestamp: profile.analyzed_at,
          icon: <CheckCircle2 className="h-4 w-4" />
        });

        // Add gap activity if score is low
        if (matchScore < 70) {
          activities.push({
            id: `gap-${profile.employee_id}`,
            type: 'gap_found',
            message: `Skills gap identified for ${employeeName} (${Math.round(matchScore)}% match)`,
            timestamp: profile.analyzed_at,
            icon: <AlertTriangle className="h-4 w-4 text-orange-500" />
          });
        }
      });

      // Sort by timestamp
      activities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchSkillsGapOverview = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Fetch positions first
      const { data: positions } = await supabase
        .from('st_company_positions')
        .select('id, position_title, position_code, required_skills')
        .eq('company_id', userProfile.company_id);

      // Fetch employees with their positions
      const { data: employees } = await supabase
        .from('employees')
        .select('id, current_position_id')
        .eq('company_id', userProfile.company_id)
        .not('current_position_id', 'is', null);

      // Get employee IDs
      const employeeIds = employees?.map(e => e.id) || [];

      // Fetch skills profiles
      const { data: skillsProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select('employee_id, skills_match_score')
        .in('employee_id', employeeIds);

      if (positions && employees) {
        // Create a map of skills profiles
        const profileMap = new Map();
        skillsProfiles?.forEach(profile => {
          profileMap.set(profile.employee_id, profile.skills_match_score || 0);
        });

        // Calculate coverage for each position
        const gapData: SkillGapOverview[] = [];
        
        for (const position of positions) {
          const employeesInPosition = employees.filter(e => e.current_position_id === position.id);
          
          if (employeesInPosition.length > 0) {
            const scores = employeesInPosition
              .map(e => profileMap.get(e.id) || 0)
              .filter(score => score > 0);
            
            const avgMatch = scores.length > 0
              ? scores.reduce((acc, score) => acc + score, 0) / scores.length
              : 0;

            gapData.push({
              position: position.position_title,
              position_code: position.position_code || position.position_title,
              requiredSkills: position.required_skills?.length || 0,
              coverage: Math.round(avgMatch),
              employeesInPosition: employeesInPosition.length,
              avgMatchScore: Math.round(avgMatch)
            });
          }
        }

        // Sort by coverage (lowest first) and take top 5
        gapData.sort((a, b) => a.coverage - b.coverage);
        setSkillsGapData(gapData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching skills gap data:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Mobile pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && touchStartY.current > 0) {
      touchEndY.current = e.touches[0].clientY;
      const distance = touchEndY.current - touchStartY.current;
      
      if (distance > 0 && distance < 120) {
        setIsPulling(true);
        setPullDistance(distance);
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (isPulling && pullDistance > 80 && !isRefreshing) {
      setIsRefreshing(true);
      fetchDashboardData(true);
    } else {
      setIsPulling(false);
      setPullDistance(0);
    }
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  // Mobile carousel handlers for skills gap section
  const handleSkillsGapNext = () => {
    if (skillsGapActiveIndex < skillsGapData.length - 1) {
      setSkillsGapActiveIndex(skillsGapActiveIndex + 1);
    }
  };

  const handleSkillsGapPrev = () => {
    if (skillsGapActiveIndex > 0) {
      setSkillsGapActiveIndex(skillsGapActiveIndex - 1);
    }
  };

  // Mobile metrics card click handler
  const handleMetricCardClick = (cardId: string) => {
    const routes: Record<string, string> = {
      employees: '/dashboard/employees',
      'cv-analysis': '/dashboard/onboarding',
      'skills-match': '/dashboard/skills',
      readiness: '/dashboard/skills',
      'positions-gaps': '/dashboard/employees',
      'critical-gaps': '/dashboard/employees',
      'active-learning': '/dashboard/courses'
    };
    
    if (routes[cardId]) {
      navigate(routes[cardId]);
    }
  };

  // Mobile skills health card handler
  const handleSkillsHealthClick = () => {
    navigate('/dashboard/skills');
  };

  if (loading || onboardingComplete === null) {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        {/* Mobile loading skeleton */}
        <div className="block md:hidden">
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-32 w-full" />
        </div>
        
        {/* Desktop loading skeleton */}
        <div className="hidden md:block space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding flow for trial users who haven't completed setup
  if (userProfile?.companies?.plan_type === 'free_skills_gap' && !onboardingComplete) {
    return <SkillsGapOnboardingFlow />;
  }

  return (
    <div 
      className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-7xl mx-auto min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(isRefreshing || isPulling) && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex justify-center py-3 bg-primary text-primary-foreground transition-transform duration-300"
          style={{ 
            transform: `translateY(${isPulling ? Math.max(0, pullDistance - 80) : 0}px)`,
            opacity: isPulling ? Math.min(1, pullDistance / 80) : 1
          }}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
          <span className="text-sm">
            {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
          </span>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {userProfile?.full_name}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Here's what's happening with your team's skills development
          </p>
        </div>
        <Badge variant="outline" className="gap-1 self-start sm:self-center">
          <Building2 className="h-3 w-3" />
          Company Admin
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Quick Actions</h2>
          <FeedbackButton 
            variant="outline" 
            size="sm" 
            className="h-9 hidden sm:flex"
            defaultType="general_feedback"
          >
            Share Feedback
          </FeedbackButton>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="h-10 sm:h-9 justify-start font-normal"
            onClick={() => navigate('/dashboard/positions')}
          >
            <Target className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="sm:hidden">Define Positions</span>
            <span className="hidden sm:inline">Define Position Requirements</span>
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="h-10 sm:h-9 justify-start font-normal"
            onClick={() => navigate('/dashboard/onboarding')}
          >
            <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="sm:hidden">Onboard Team</span>
            <span className="hidden sm:inline">Onboard Employees</span>
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="h-10 sm:h-9 justify-start font-normal"
            onClick={() => navigate('/dashboard/employees')}
          >
            <BarChart3 className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="sm:hidden">Skills Analysis</span>
            <span className="hidden sm:inline">View Skills Gap Analysis</span>
          </Button>

          <Button 
            variant="outline"
            size="sm"
            className="h-10 sm:h-9 justify-start font-normal"
            onClick={() => navigate('/dashboard/courses')}
          >
            <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="sm:hidden">Assign Courses</span>
            <span className="hidden sm:inline">Assign Courses</span>
          </Button>
        </div>
        
        {/* Mobile feedback button */}
        <div className="flex sm:hidden">
          <FeedbackButton 
            variant="outline" 
            size="sm" 
            className="h-9 w-full"
            defaultType="general_feedback"
          >
            Share Feedback
          </FeedbackButton>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Key Metrics</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard/analytics')}
            className="hidden sm:flex"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </div>
        
        {/* Metrics Section with Conditional Blur */}
        <div className="relative">
          <div className={cn(
            "transition-all duration-500",
            positionsCount === 0 && "blur-md pointer-events-none select-none"
          )}>
            {/* Mobile Carousel */}
            <div className="block md:hidden">
              <MobileMetricsCarousel metrics={metrics} onCardClick={handleMetricCardClick} />
            </div>
            
            {/* Desktop Grid */}
            <div className="hidden md:block space-y-4">
          {/* First Row - Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/employees')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Employees
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metrics.employeesWithCVs} with CVs uploaded
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/onboarding')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    CV Analysis
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.analyzedCVs}</div>
                <Progress 
                  value={metrics.totalEmployees > 0 ? (metrics.analyzedCVs / metrics.totalEmployees) * 100 : 0} 
                  className="mt-2" 
                />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/skills')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Skills Match
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.skillsCoverage}%</div>
                <Progress value={metrics.skillsCoverage} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/skills')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Career Readiness
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.avgReadinessScore}%</div>
                <Progress value={metrics.avgReadinessScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Second Row - Gap Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={cn(
              "hover:shadow-md transition-shadow cursor-pointer",
              metrics.positionsWithGaps > 0 && "border-orange-200"
            )} onClick={() => navigate('/dashboard/employees')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Positions with Gaps
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.positionsWithGaps}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Need skill development
                </p>
              </CardContent>
            </Card>

            <Card className={cn(
              "hover:shadow-md transition-shadow cursor-pointer",
              metrics.criticalGaps > 0 && "border-red-200"
            )} onClick={() => navigate('/dashboard/employees')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Critical Gaps
                  </CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{metrics.criticalGaps}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Below 50% match
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/dashboard/courses')}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Learning
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.activeLearningPaths}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Courses in progress
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
          </div>
          
          {/* Empty State Overlay for No Positions */}
          {positionsCount === 0 && (
            <EmptyStateOverlay
              icon={Target}
              title="Set Up Positions First"
              description="Define job positions to start tracking skills gaps and analyzing your team's capabilities"
              ctaText="Create First Position"
              ctaLink="/dashboard/positions"
            />
          )}
        </div>
      </div>

      {/* Skills Health Score Card */}
      {skillsHealth && (
        <div className="relative">
          <div className={cn(
            "transition-all duration-500",
            metrics.totalEmployees === 0 && "blur-md pointer-events-none select-none"
          )}>
            {/* Mobile Skills Health Card */}
            <div className="block md:hidden">
              <MobileSkillsHealthCard 
                skillsHealth={skillsHealth} 
                onViewDetails={handleSkillsHealthClick}
              />
            </div>
            
            {/* Desktop Skills Health Card */}
            <Card className="hidden md:block bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Skills Health Score</CardTitle>
                </div>
                <Badge variant="outline" className="text-lg font-semibold">
                  Grade: {skillsHealth.grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Match</p>
                  <p className="text-2xl font-bold">
                    {skillsHealth.overallScore}%
                    {skillsHealth.trend > 0 && (
                      <span className="text-sm text-green-600 ml-2">
                        ↑{skillsHealth.trend}%
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Gap Reduction</p>
                  <p className="text-2xl font-bold">+18%</p>
                  <p className="text-xs text-muted-foreground">(90 days)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Critical Skills</p>
                  <p className="text-2xl font-bold">
                    {skillsHealth.criticalGaps} urgent
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm text-muted-foreground mb-2">
                  Analysis Coverage: {skillsHealth.analyzedCount} of {skillsHealth.totalCount} employees
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm">
                    Top gaps: Review skills analysis for targeted training
                  </p>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => navigate('/dashboard/skills')}
                  >
                    View Detailed Analytics
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
          
          {/* Empty State Overlay for No Employees */}
          {metrics.totalEmployees === 0 && (
            <EmptyStateOverlay
              icon={Users}
              title="Import Your Team"
              description="Add employees to analyze their skills and see your organization's health score"
              ctaText="Import Employees"
              ctaLink="/dashboard/onboarding"
            />
          )}
        </div>
      )}

      {/* Bottom Section - Mobile Optimized */}
      <div className="space-y-4 md:space-y-6">
        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-4">
          {/* Recent Activity - Mobile */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/dashboard/analytics')}
                  className="text-xs"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.slice(0, 3).map((activity) => (
                    <Card key={activity.id} className="p-3 bg-muted/30 border-0">
                      <div className="flex items-start gap-3">
                        <div className="bg-background p-2 rounded-full shadow-sm">
                          {activity.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-snug">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No recent activity. Start by adding team members!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skills Gap Overview - Mobile */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Position Skills Coverage</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/dashboard/employees')}
                  className="text-xs"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {skillsGapData.length > 0 ? (
                <div className="space-y-4">
                  {/* Mobile carousel for skills gap */}
                  <div className="relative">
                    <div 
                      ref={skillsGapCarouselRef}
                      className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      <div className="flex gap-3 pb-2">
                        {skillsGapData.slice(0, 3).map((item, index) => (
                          <Card key={index} className="flex-shrink-0 w-64 snap-center p-4 bg-muted/30 border-0">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm truncate mr-2">{item.position}</span>
                                <span className={cn(
                                  "font-bold text-lg",
                                  item.coverage >= 80 ? 'text-green-600' : 
                                  item.coverage >= 60 ? 'text-orange-600' : 
                                  'text-red-600'
                                )}>
                                  {item.coverage}%
                                </span>
                              </div>
                              <Progress 
                                value={item.coverage} 
                                className={cn(
                                  "h-2",
                                  item.coverage < 60 && "[&>div]:bg-red-500",
                                  item.coverage >= 60 && item.coverage < 80 && "[&>div]:bg-orange-500"
                                )}
                              />
                              <p className="text-xs text-muted-foreground">
                                {item.employeesInPosition} employees • {item.requiredSkills} skills required
                              </p>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                    
                    {/* Navigation buttons for mobile carousel */}
                    {skillsGapData.length > 3 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSkillsGapPrev}
                          disabled={skillsGapActiveIndex === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleSkillsGapNext}
                          disabled={skillsGapActiveIndex >= skillsGapData.length - 3}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Alert className="bg-white">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    No skills data available yet. Upload CVs and analyze skills to see coverage.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {/* Recent Activity - Desktop */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="bg-muted p-2 rounded-full">
                        {activity.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity. Start by adding team members!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Skills Gap Overview - Desktop */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Position Skills Coverage</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/dashboard/employees')}
                >
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {skillsGapData.length > 0 ? (
                <div className="space-y-4">
                  {skillsGapData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">{item.position}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({item.employeesInPosition} employees)
                          </span>
                        </div>
                        <span className={cn(
                          "font-medium",
                          item.coverage >= 80 ? 'text-green-600' : 
                          item.coverage >= 60 ? 'text-orange-600' : 
                          'text-red-600'
                        )}>
                          {item.coverage}%
                        </span>
                      </div>
                      <Progress 
                        value={item.coverage} 
                        className={cn(
                          "h-2",
                          item.coverage < 60 && "[&>div]:bg-red-500",
                          item.coverage >= 60 && item.coverage < 80 && "[&>div]:bg-orange-500"
                        )}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Alert className="bg-white">
                  <AlertDescription>
                    No skills data available yet. Upload CVs and analyze skills to see coverage.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Skills Gap Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={handleWelcomeModalClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Welcome to Skills Gap Analysis
            </DialogTitle>
            <DialogDescription>
              Get started with your free skills gap analysis in 4 simple steps
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <div>
                  <h4 className="font-medium">Create Positions</h4>
                  <p className="text-sm text-gray-600">Define the roles in your organization</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <div>
                  <h4 className="font-medium">Import Employees</h4>
                  <p className="text-sm text-gray-600">Add up to 10 team members</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <h4 className="font-medium">Analyze Skills</h4>
                  <p className="text-sm text-gray-600">AI-powered CV analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                <div>
                  <h4 className="font-medium">View Results</h4>
                  <p className="text-sm text-gray-600">Get detailed skills gap reports</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Free Skills Gap Analysis</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Up to 10 employees</li>
                <li>✓ AI-powered skills extraction</li>
                <li>✓ Detailed gap visualization</li>
                <li>✓ Export reports</li>
              </ul>
            </div>
            <Button onClick={handleWelcomeModalClose} className="w-full">
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}