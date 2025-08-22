import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
 
import { cn } from '@/lib/utils';
import SkillsGapOnboardingFlow from '@/components/dashboard/SkillsGapOnboardingFlow';
import HeroSetupBanner from '@/components/dashboard/company/HeroSetupBanner';
import PrimaryKPIs from '@/components/dashboard/company/PrimaryKPIs';
import SkillsHealthSnapshot from '@/components/dashboard/company/SkillsHealthSnapshot';
import MarketStrip from '@/components/dashboard/company/MarketStrip';
import TopRisks from '@/components/dashboard/company/TopRisks';
import NextBestActions from '@/components/dashboard/company/NextBestActions';
import SkillsTrendsView from '@/components/dashboard/skills/SkillsTrendsView';
import { mockHistoricalData, mockSkillsMomentum } from '@/data/mockSkillsData';
// Removed: import { marketSkillsService } from '@/services/marketSkills/MarketSkillsService';

interface DashboardMetrics {
  totalEmployees: number;
  activeLearningPaths: number;
  skillsCoverage: number;
  avgReadinessScore: number;
  employeesWithCVs: number;
  analyzedCVs: number;
  positionsWithGaps: number;
  criticalGaps: number;
  profilesComplete: number;
  profilesInProgress: number;
}

interface SkillsHealthData {
  overallScore: number;
  grade: string;
  trend: number;
  criticalGaps: number;
  analyzedCount: number;
  totalCount: number;
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
    criticalGaps: 0,
    profilesComplete: 0,
    profilesInProgress: 0
  });
  const [skillsGapData, setSkillsGapData] = useState<SkillGapOverview[]>([]);
  const [skillsHealth, setSkillsHealth] = useState<SkillsHealthData | null>(null);
  const [positionsCount, setPositionsCount] = useState(0);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [assignmentsSummary, setAssignmentsSummary] = useState<{
    total: number;
    active: number;
    completed: number;
    completionRate: number;
  }>({ total: 0, active: 0, completed: 0, completionRate: 0 });
  interface MarketOrgCurrent {
    company_id: string;
    market_coverage_rate: number;
    industry_alignment_index: number;
    top_missing_skills?: Array<{ skill_name: string; severity: 'critical' | 'moderate' | 'minor' }>;
  }
  const [marketOrg, setMarketOrg] = useState<MarketOrgCurrent | null>(null);
  const [latestReport, setLatestReport] = useState<{ id: string; generated_at: string; pdf_url?: string } | null>(null);
  
  // Mobile pull-to-refresh state
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  
  // Permissions removed from snapshot view

  useEffect(() => {
    if (userProfile?.company_id) {
      checkOnboardingStatus();
      fetchDashboardData();
      // permissions not needed for snapshot

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
            table: 'employee_skills'
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
      // For free trial users, check if they have at least:
      // 1. Some positions created
      // 2. Some employees added
      // 3. Some skills analysis done
      
      const { count: positionCount } = await supabase
        .from('st_company_positions')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id);

      // Store positions count for later use
      setPositionsCount(positionCount || 0);

      // For trial users, show onboarding flow even if no positions exist
      // This allows them to complete the setup process
      if (!positionCount || positionCount === 0) {
        setOnboardingComplete(false);
        return;
      }

      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id);

      // Check if any invitations have been sent
      let hasInvitations = false;
      if (employeeCount && employeeCount > 0) {
        const { data: employees } = await supabase
          .from('employees')
          .select('id')
          .eq('company_id', userProfile.company_id);
        
        const employeeIds = employees?.map(e => e.id) || [];
        
        const { count: invitationCount } = await supabase
          .from('profile_invitations')
          .select('*', { count: 'exact', head: true })
          .in('employee_id', employeeIds);
        
        hasInvitations = invitationCount && invitationCount > 0;
      }

      // Check if gap analysis results exist by checking employees with skills
      const { count: gapCount } = await supabase
        .from('employee_skills')
        .select(`
          *,
          employees!inner(company_id)
        `, { count: 'exact', head: true })
        .eq('employees.company_id', userProfile.company_id);

      // For skills gap trial users, onboarding is only complete when they have:
      // 1. Positions created
      // 2. Employees added
      // 3. Invitations sent
      // 4. At least one skills analysis done (gap analysis exists)
      const hasPositions = positionCount && positionCount > 0;
      const hasEmployees = employeeCount && employeeCount > 0;
      const hasAnalysis = gapCount && gapCount > 0;
      
      // Only show dashboard if they have completed the full flow including analysis
      setOnboardingComplete(hasPositions && hasEmployees && hasInvitations && hasAnalysis);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to showing dashboard on error to avoid blocking users
      setOnboardingComplete(true);
    }
  };

  // permissions check removed

  // welcome modal removed

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
      
      // Fetch employee skills data from unified structure
      const { data: employeesWithData } = await supabase
        .from('employees')
        .select('id, cv_analysis_data, skills_last_analyzed')
        .in('id', employeeIds);

      // Transform to match expected format
      const skillsProfiles = employeesWithData?.map(emp => ({
        employee_id: emp.id,
        skills_match_score: emp.cv_analysis_data?.skills_match_score || 0,
        career_readiness_score: emp.cv_analysis_data?.career_readiness_score || 0,
        analyzed_at: emp.skills_last_analyzed
      })) || [];

      // Count analyzed CVs (employees with skills profiles)
      const analyzedCVs = skillsProfiles?.length || 0;

      // Calculate averages from skills profiles
      const avgMatchScore = skillsProfiles?.length 
        ? skillsProfiles.reduce((acc, profile) => acc + (profile.skills_match_score || 0), 0) / skillsProfiles.length
        : 0;

      const avgReadiness = skillsProfiles?.length
        ? skillsProfiles.reduce((acc, profile) => acc + (profile.career_readiness_score || 0), 0) / skillsProfiles.length
        : 0;
      
      // Count profile completion status
      const profilesComplete = employees?.filter((e: any) => e.profile_complete).length || 0;
      const profilesInProgress = employees?.filter((e: any) => 
        !e.profile_complete && e.completed_sections && e.completed_sections > 0
      ).length || 0;

      // Fetch course assignments for completion metrics
      const { data: assignments } = await supabase
        .from('course_assignments')
        .select('id, employee_id, status, progress_percentage')
        .in('employee_id', employeeIds);

      const totalAssignments = assignments?.length || 0;
      const activeLearners = assignments?.filter(a => a.status === 'in_progress').length || 0;
      const completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
      const completionRate = totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0;
      setAssignmentsSummary({ total: totalAssignments, active: activeLearners, completed: completedAssignments, completionRate: Math.round(completionRate) });

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
        activeLearningPaths: activeLearners || 0,
        skillsCoverage: Math.round(avgMatchScore),
        avgReadinessScore: Math.round(avgReadiness),
        employeesWithCVs,
        analyzedCVs,
        positionsWithGaps,
        criticalGaps,
        profilesComplete,
        profilesInProgress
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

      setSkillsHealth({
        overallScore: Math.round(avgMatchScore),
        grade: calculateGrade(avgMatchScore),
        trend: 0,
        criticalGaps: criticalGaps,
        analyzedCount: analyzedCVs,
        totalCount: employeeCount || 0
      });
      
      // Fetch skills gap overview with real data
      await fetchSkillsGapOverview();

      // Fetch market current metrics and latest executive report
      try {
        // Removed: Legacy market benchmark system
        const [orgCurrent, reports] = await Promise.all([
          Promise.resolve(null), // Disabled: marketSkillsService.getOrganizationMarketMatchCurrent
          Promise.resolve([])    // Disabled: marketSkillsService.listExecutiveReports
        ]);
        if (orgCurrent) setMarketOrg(orgCurrent as MarketOrgCurrent);
        if (Array.isArray(reports) && reports.length > 0) {
          const r = reports[0] as { id: string; generated_at: string; pdf_path?: string; version: number };
          setLatestReport({ id: r.id, generated_at: r.generated_at, pdf_url: undefined });
        } else {
          setLatestReport(null);
        }
      } catch (e) {
        console.error('Market data fetch failed:', e);
      }

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

  // recent activities removed from snapshot

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

      // Fetch skills data from employees
      const { data: employeesData } = await supabase
        .from('employees')
        .select('id, cv_analysis_data')
        .in('id', employeeIds);

      // Transform to match expected format
      const skillsProfiles = employeesData?.map(emp => ({
        employee_id: emp.id,
        skills_match_score: emp.cv_analysis_data?.skills_match_score || 0
      })) || [];

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

  // time formatting no longer needed

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

  // removed mobile carousel and metric click handlers

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

  // Note: Removed the positions empty state from here - it should only show in onboarding page

  // Show onboarding flow for trial users who have positions but haven't completed setup
  if (userProfile?.companies?.plan_type === 'free_skills_gap' && !onboardingComplete) {
    return <SkillsGapOnboardingFlow />;
  }

  // Check if user is on free trial
  const isFreeTrialUser = userProfile?.companies?.plan_type === 'free_skills_gap';

  return (
    <div 
      className={cn(
        "font-inter space-y-4 md:space-y-6 p-4 md:p-6 max-w-7xl mx-auto min-h-screen"
      )}
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
      <div className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      )}>
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-semibold font-inter text-foreground">
            Welcome back, {userProfile?.full_name}
          </h1>
          <p className="text-sm md:text-base font-normal font-inter text-muted-foreground">
            Here's what's happening with your team's skills development
          </p>
        </div>
        <Badge variant="outline" className="gap-1 self-start sm:self-center">
          <Building2 className="h-3 w-3" />
          Company Admin
        </Badge>
      </div>

      {/* Quick Actions */}
      {/* Snapshot Header */}
      <div className="space-y-4">
        <HeroSetupBanner
          positionsCount={positionsCount}
          totalEmployees={metrics.totalEmployees}
          analyzedCVs={metrics.analyzedCVs}
          onNavigate={(p) => navigate(p)}
        />

        <PrimaryKPIs
          totalEmployees={metrics.totalEmployees}
          analysisCoveragePct={metrics.totalEmployees > 0 ? Math.round((metrics.analyzedCVs / metrics.totalEmployees) * 100) : 0}
          skillsReadinessPct={Math.round(metrics.avgReadinessScore)}
          positionsWithGaps={metrics.positionsWithGaps}
          criticalGaps={metrics.criticalGaps}
          activeLearners={assignmentsSummary.active}
          courseCompletionPct={assignmentsSummary.completionRate}
          onNavigate={(p) => navigate(p)}
          isTrial={isFreeTrialUser}
        />

        {skillsHealth && (
          <SkillsHealthSnapshot
            grade={skillsHealth.grade}
            overallScore={skillsHealth.overallScore}
            trend={skillsHealth.trend}
            analyzedCount={skillsHealth.analyzedCount}
            totalCount={skillsHealth.totalCount}
            onViewDetails={() => navigate('/dashboard/skills')}
            isTrial={isFreeTrialUser}
          />
        )}

        {marketOrg && (
          <MarketStrip
            marketCoveragePct={marketOrg.market_coverage_rate}
            industryAlignmentIndex={marketOrg.industry_alignment_index}
            topMissingSkills={marketOrg.top_missing_skills || []}
            latestReport={latestReport}
            onViewReport={() => navigate('/dashboard/skills')}
          />
        )}

        <TopRisks
          positions={skillsGapData.map(s => ({ position: s.position, coverage: s.coverage, employeesInPosition: s.employeesInPosition }))}
          maxItems={3}
          onViewAll={() => navigate('/dashboard/employees')}
          isTrial={isFreeTrialUser}
        />

        <NextBestActions
          criticalGaps={metrics.criticalGaps}
          analysisCoveragePct={metrics.totalEmployees > 0 ? Math.round((metrics.analyzedCVs / metrics.totalEmployees) * 100) : 0}
          industryAlignmentIndex={marketOrg?.industry_alignment_index}
          onAssignLearning={() => navigate('/dashboard/courses')}
          onViewSkills={() => navigate('/dashboard/skills')}
          onImportCVs={() => navigate('/dashboard/employees?tab=import')}
        />

        {/* Skills Trends Section */}
        <SkillsTrendsView
          historicalData={mockHistoricalData}
          skillsMomentum={mockSkillsMomentum}
          isLoading={loading}
        />
                    </div>
                    
      {/* Legacy detailed skills health and overlays removed in favor of concise snapshot */}

      {/* Activity link (deprioritized) */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/analytics')}>
          View activity
                </Button>
      </div>
      
      {/* Welcome modal removed */}
    </div>
  );
}