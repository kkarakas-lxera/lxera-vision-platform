
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Users, 
  Target,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Building2,
  Brain,
  FileText,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { parseGapSeverity, parseSkillsArray } from '@/utils/typeGuards';
import type { CriticalSkillsGap } from '@/types/common';
import type { DepartmentMarketGap } from '@/types/marketSkills';
import EmptyStateOverlay from '@/components/dashboard/EmptyStateOverlay';
import MarketGapBars from '@/components/dashboard/skills/MarketGapBars';
import { MarketBenchmarkVerticalLoader } from '@/components/dashboard/skills/MarketBenchmarkVerticalLoader';
import { cn } from '@/lib/utils';
import { marketSkillsService } from '@/services/marketSkills/MarketSkillsService';
import OrgSkillsHealth from '@/components/dashboard/skills/OrgSkillsHealth';
import DepartmentAnalysisPanel from '@/components/dashboard/skills/DepartmentAnalysisPanel';
import CriticalSkillsPanel from '@/components/dashboard/skills/CriticalSkillsPanel';

interface DepartmentSummary {
  department: string;
  total_employees: number;
  analyzed_employees: number;
  avg_skills_match: number | null;
  critical_gaps: number;
  moderate_gaps: number;
  exceeding_targets: number;
}

function getDepartmentHealthStatus(dept: DepartmentSummary) {
  const { critical_gaps, moderate_gaps, analyzed_employees, total_employees } = dept;
  
  // Coverage penalty
  const coverageRatio = total_employees > 0 ? analyzed_employees / total_employees : 0;
  const hasLowCoverage = coverageRatio < 0.5;
  
  if (critical_gaps === 0 && moderate_gaps < 5) {
    return {
      status: 'excellent',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle2,
      label: 'Excellent'
    };
  } else if (critical_gaps <= 2 && moderate_gaps <= 10) {
    return {
      status: 'good',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: TrendingUp,
      label: 'Good'
    };
  } else if (critical_gaps <= 5 || moderate_gaps <= 20) {
    return {
      status: 'needs-improvement',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: AlertCircle,
      label: 'Needs Work'
    };
  } else {
    return {
      status: 'critical',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      label: 'Critical'
    };
  }
}

export default function SkillsOverview() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [departmentSummaries, setDepartmentSummaries] = useState<DepartmentSummary[]>([]);
  const [criticalGaps, setCriticalGaps] = useState<CriticalSkillsGap[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalEmployees: 0,
    analyzedEmployees: 0,
    avgSkillsMatch: 0,
    totalCriticalGaps: 0,
    totalModerateGaps: 0,
    departmentsCount: 0
  });
  const [positionsCount, setPositionsCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [analyzedEmployeesCount, setAnalyzedEmployeesCount] = useState(0);
  const [departmentMarketGaps, setDepartmentMarketGaps] = useState<Record<string, DepartmentMarketGap>>({});
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  
  // Market Benchmark data states
  const [organizationBenchmark, setOrganizationBenchmark] = useState<any>(null);
  const [departmentsBenchmark, setDepartmentsBenchmark] = useState<any[]>([]);
  const [employeesBenchmark, setEmployeesBenchmark] = useState<any[]>([]);
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkRefreshing, setBenchmarkRefreshing] = useState(false);
  const [lastBenchmarkUpdate, setLastBenchmarkUpdate] = useState<Date | null>(null);
  const [companyIndustry, setCompanyIndustry] = useState<string>('industry');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [activeTab, setActiveTab] = useState('internal');

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchSkillsOverview();
    }
  }, [userProfile?.company_id]);

  useEffect(() => {
    // Fetch market gaps for departments after department data is loaded
    if (departmentSummaries.length > 0) {
      fetchMarketGapsForDepartments();
    }
  }, [departmentSummaries]);

  // Refresh stale benchmarks on component mount
  useEffect(() => {
    const refreshBenchmarks = async () => {
      try {
        await marketSkillsService.refreshStaleBenchmarks();
      } catch (error) {
        console.error('Error refreshing benchmarks:', error);
      }
    };
    
    // Only refresh if user is admin
    if (userProfile?.role === 'company_admin' || userProfile?.role === 'super_admin') {
      refreshBenchmarks();
    }
  }, [userProfile?.role]);

  // Fetch benchmark data when Market Benchmark tab becomes active
  useEffect(() => {
    if (activeTab === 'market' && !organizationBenchmark) {
      // Check if we have cached data first
      checkCachedData();
    }
  }, [activeTab]);

  const checkCachedData = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      // Quick check for cached data
      const { data: cacheCheck } = await supabase
        .from('market_benchmark_cache')
        .select('generated_at')
        .eq('company_id', userProfile.company_id)
        .eq('cache_key', 'comprehensive')
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (cacheCheck) {
        // We have cached data, load it without showing loading state
        setIsFirstLoad(false);
        await fetchBenchmarkData(false);
      } else {
        // No cache, this is first load
        setIsFirstLoad(true);
        await fetchBenchmarkData(false);
      }
    } catch (error) {
      // No cache found, proceed with first load
      setIsFirstLoad(true);
      await fetchBenchmarkData(false);
    }
  };

  const fetchBenchmarkData = async (isRefresh = false) => {
    if (!userProfile?.company_id) return;
    
    if (isRefresh) {
      setBenchmarkRefreshing(true);
    } else {
      setBenchmarkLoading(true);
    }
    
    try {
      // Fetch company industry
      const { data: companyData } = await supabase
        .from('companies')
        .select('settings')
        .eq('id', userProfile.company_id)
        .single();
      
      const industry = companyData?.settings?.industry as string || 'industry';
      setCompanyIndustry(industry);
      
      // Pass forceRefresh parameter to service
      const comprehensiveData = await marketSkillsService.getComprehensiveBenchmark(isRefresh);
      setOrganizationBenchmark(comprehensiveData.organization);
      setDepartmentsBenchmark(comprehensiveData.departments);
      setEmployeesBenchmark(comprehensiveData.employees);
      setLastBenchmarkUpdate(comprehensiveData.generated_at);
      
      // Set first load to false after first successful load
      if (!isRefresh && isFirstLoad) {
        setIsFirstLoad(false);
      }
      
      if (isRefresh) {
        toast({
          title: 'Success',
          description: 'Market benchmark data refreshed and cached successfully',
        });
      }
    } catch (error) {
      console.error('Error fetching benchmark data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load market benchmark data',
        variant: 'destructive'
      });
    } finally {
      setBenchmarkLoading(false);
      setBenchmarkRefreshing(false);
    }
  };

  const handleRefreshBenchmark = () => {
    fetchBenchmarkData(true);
  };

  const fetchSkillsOverview = async () => {
    if (!userProfile?.company_id) return;

    try {
      // First fetch positions to check if any exist
      const { data: positionsData, error: posError } = await supabase
        .from('st_company_positions')
        .select('id')
        .eq('company_id', userProfile.company_id);
      
      if (posError) {
        console.error('Error fetching positions:', posError);
        // Set to 0 to show blur effect if we can't fetch positions
        setPositionsCount(0);
      } else {
        const posCount = positionsData?.length || 0;
        console.log('Positions count:', posCount);
        setPositionsCount(posCount);
      }

      // Fetch employees count and check for skills profile
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          skills_last_analyzed,
          st_employee_skills_profile!left(
            id,
            analyzed_at,
            gap_analysis_completed_at
          )
        `)
        .eq('company_id', userProfile.company_id);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        setEmployeesCount(0);
        setAnalyzedEmployeesCount(0);
      } else {
        const empCount = employeesData?.length || 0;
        // Check if employee has skills profile (analyzed_at or gap_analysis_completed_at)
        const analyzedCount = employeesData?.filter(emp => {
          const hasSkillsProfile = emp.st_employee_skills_profile && 
            (emp.st_employee_skills_profile.analyzed_at || 
             emp.st_employee_skills_profile.gap_analysis_completed_at);
          return hasSkillsProfile || emp.skills_last_analyzed;
        }).length || 0;
        console.log('Employees count:', empCount, 'Analyzed:', analyzedCount);
        setEmployeesCount(empCount);
        setAnalyzedEmployeesCount(analyzedCount);
      }

      // Fetch department summaries
      const { data: deptData } = await supabase
        .from('v_department_skills_summary')
        .select('*')
        .eq('company_id', userProfile.company_id);

      if (deptData) {
        setDepartmentSummaries(deptData.map(dept => ({
          department: dept.department || 'Unassigned',
          total_employees: Number(dept.total_employees) || 0,
          analyzed_employees: Number(dept.analyzed_employees) || 0,
          avg_skills_match: dept.avg_skills_match !== null ? Number(dept.avg_skills_match) : null,
          critical_gaps: Number(dept.critical_gaps) || 0,
          moderate_gaps: Number(dept.moderate_gaps) || 0,
          exceeding_targets: Number(dept.exceeding_targets) || 0
        })));
      }

      // Fetch critical skills gaps
      const { data: gapsData } = await supabase
        .from('v_critical_skills_gaps')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .limit(10);

      if (gapsData) {
        const typedGaps: CriticalSkillsGap[] = gapsData.map(gap => ({
          skill_name: gap.skill_name || 'Unknown Skill',
          gap_severity: parseGapSeverity(gap.gap_severity || 'moderate'),
          department: gap.department || 'Unknown',
          company_id: gap.company_id || userProfile.company_id,
          employees_with_gap: Number(gap.employees_with_gap) || 0,
          avg_proficiency: Number(gap.avg_proficiency) || 0,
          critical_count: Number(gap.critical_count) || 0,
          moderate_count: Number(gap.moderate_count) || 0
        }));
        
        setCriticalGaps(typedGaps);
      }

      // Calculate overall stats
      const totalEmployees = deptData?.reduce((sum, dept) => sum + (Number(dept.total_employees) || 0), 0) || 0;
      const analyzedEmployees = deptData?.reduce((sum, dept) => sum + (Number(dept.analyzed_employees) || 0), 0) || 0;
      
      // Calculate weighted average, only including departments with analyzed employees
      let totalWeightedMatch = 0;
      let totalAnalyzedForAverage = 0;
      
      deptData?.forEach(dept => {
        if (dept.avg_skills_match !== null && dept.analyzed_employees > 0) {
          totalWeightedMatch += Number(dept.avg_skills_match) * Number(dept.analyzed_employees);
          totalAnalyzedForAverage += Number(dept.analyzed_employees);
        }
      });
      
      const avgMatch = totalAnalyzedForAverage > 0 
        ? totalWeightedMatch / totalAnalyzedForAverage
        : 0;
      
      // Sum up all skill gaps from department data
      const totalCriticalGaps = deptData?.reduce((sum, dept) => sum + (Number(dept.critical_gaps) || 0), 0) || 0;
      const totalModerateGaps = deptData?.reduce((sum, dept) => sum + (Number(dept.moderate_gaps) || 0), 0) || 0;
      const totalGaps = totalCriticalGaps + totalModerateGaps;

      setOverallStats({
        totalEmployees,
        analyzedEmployees,
        avgSkillsMatch: Math.round(avgMatch || 0),
        totalCriticalGaps,
        totalModerateGaps,
        departmentsCount: deptData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching skills overview:', error);
      toast({
        title: 'Error',
        description: 'Failed to load skills overview',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketGapsForDepartments = async () => {
    if (!userProfile?.company_id || departmentSummaries.length === 0) return;

    try {
      // Get company information for industry context
      const { data: companyData } = await supabase
        .from('companies')
        .select('settings')
        .eq('id', userProfile.company_id)
        .single();

      const companyIndustry = companyData?.settings?.industry as string | undefined;

      // Fetch market gaps for each department
      const gaps = await Promise.all(
        departmentSummaries.map(async (dept) => {
          // Get all employees' skills for this department
          const { data: employeeSkills } = await supabase
            .from('st_employee_skills_profile')
            .select(`
              extracted_skills,
              employees!inner(
                company_id,
                department
              )
            `)
            .eq('employees.company_id', userProfile.company_id)
            .eq('employees.department', dept.department)
            .not('extracted_skills', 'is', null);

          // Aggregate all skills from employees
          const allSkills = employeeSkills?.flatMap(profile => 
            parseSkillsArray(profile.extracted_skills)
          ) || [];

          // Get market gaps
          const marketGap = await marketSkillsService.getDepartmentMarketGaps(
            dept.department,
            companyIndustry,
            allSkills
          );

          return marketGap;
        })
      );

      // Convert to record format for easy lookup
      const gapsRecord = gaps.reduce((acc, gap) => {
        acc[gap.department] = gap;
        return acc;
      }, {} as Record<string, DepartmentMarketGap>);

      setDepartmentMarketGaps(gapsRecord);
    } catch (error) {
      console.error('Error fetching market gaps:', error);
      // Don't show error toast - this is a progressive enhancement
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };


  const getSkillSourceInfo = (skillName: string) => {
    // In a real implementation, this would check the actual data source
    // For now, we'll simulate based on common patterns
    const aiKeywords = ['python', 'react', 'javascript', 'cloud', 'data'];
    const verifiedKeywords = ['communication', 'leadership', 'project management'];
    
    const lowerSkill = skillName.toLowerCase();
    
    if (aiKeywords.some(keyword => lowerSkill.includes(keyword))) {
      return {
        icon: Brain,
        label: 'AI',
        confidence: 87,
        className: 'text-blue-600'
      };
    } else if (verifiedKeywords.some(keyword => lowerSkill.includes(keyword))) {
      return {
        icon: CheckCircle,
        label: '✓',
        confidence: 100,
        className: 'text-green-600'
      };
    } else {
      return {
        icon: FileText,
        label: 'CV',
        confidence: 75,
        className: 'text-gray-600'
      };
    }
  };

  const getEmptyStateConfig = () => {
    if (positionsCount === 0) {
      return {
        icon: Target,
        title: "No Positions Created",
        description: "Start by creating positions to define skill requirements for your organization.",
        ctaText: "Create Your First Position",
        ctaLink: "/dashboard/positions",
        shouldBlur: true
      };
    }
    
    if (employeesCount === 0) {
      return {
        icon: Users,
        title: "No Employees Imported",
        description: "Import employees to start analyzing their skills and identifying gaps.",
        ctaText: "Import Employees",
        ctaLink: "/dashboard/employees",
        shouldBlur: true
      };
    }
    
    if (analyzedEmployeesCount === 0) {
      return {
        icon: TrendingUp,
        title: "No Skills Analyzed",
        description: "Upload CVs and run skills analysis to see your team's skill gaps.",
        ctaText: "Analyze Skills",
        ctaLink: "/dashboard/employees",
        shouldBlur: true
      };
    }
    
    return {
      shouldBlur: false
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
          <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  const emptyStateConfig = getEmptyStateConfig();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Skills Overview</h1>
        <p className="text-gray-600 mt-1">Monitor your organization's skill development and identify gaps</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="internal" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="internal">Internal Readiness</TabsTrigger>
          <TabsTrigger value="market">Market Benchmark</TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="space-y-6 mt-6">

      {/* Main Content with Conditional Blur */}
      <div className="relative">
        <div className={cn(
          "space-y-6 transition-all duration-500",
          emptyStateConfig.shouldBlur && "blur-md pointer-events-none select-none"
        )}>
          {/* Organization Skills Health */}
          <OrgSkillsHealth
            overallStats={overallStats}
            departmentSummaries={departmentSummaries}
            getDepartmentHealthStatus={getDepartmentHealthStatus}
          />


          {/* Department Analysis & Critical Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Analysis */}
            <DepartmentAnalysisPanel
              departmentSummaries={departmentSummaries}
              getDepartmentHealthStatus={getDepartmentHealthStatus}
            />

            {/* Critical Skills Gaps */}
            <CriticalSkillsPanel criticalGaps={criticalGaps} />
          </div>
        </div>

        {/* Empty State Overlay */}
        {emptyStateConfig.shouldBlur && (
          <EmptyStateOverlay
            icon={emptyStateConfig.icon}
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            ctaText={emptyStateConfig.ctaText}
            ctaLink={emptyStateConfig.ctaLink}
          />
        )}
      </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6 mt-6">
          {/* Market Benchmark Tab Content */}
          <div className="relative">
            {/* Vertical Loading State or Status Bar */}
            <MarketBenchmarkVerticalLoader
              isLoading={benchmarkLoading || benchmarkRefreshing}
              refreshing={benchmarkRefreshing}
              lastUpdate={lastBenchmarkUpdate}
              isFirstLoad={isFirstLoad && !organizationBenchmark}
              onRefresh={handleRefreshBenchmark}
            />
            
            {/* Main Content */}
            {!benchmarkLoading && !benchmarkRefreshing && organizationBenchmark && (
            <div className="space-y-6">
              {/* Organization-Level Section */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-medium">Organization Benchmark</CardTitle>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <div className="space-y-2">
                                <p className="text-sm font-medium">What is Market Benchmark?</p>
                                <p className="text-xs text-gray-600">AI-powered analysis comparing your organization's skills against current market demands and industry standards. Updated weekly to reflect the latest trends.</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <CardDescription className="text-xs mt-0.5">
                        Compare skills against {companyIndustry} standards
                      </CardDescription>
                    </div>
                    <Brain className="h-4 w-4 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  {benchmarkLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-3">
                          <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                          <div className="h-2 bg-gray-200 animate-pulse rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Market Coverage Rate */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-gray-600">Market Coverage</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">Percentage of in-demand market skills your employees currently possess. Higher coverage means your workforce is better equipped for industry requirements.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <Target className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">{organizationBenchmark?.market_coverage_rate || 0}%</span>
                            <span className="text-xs text-gray-500">of skills</span>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{width: `${organizationBenchmark?.market_coverage_rate || 0}%`}}></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{
                              organizationBenchmark?.market_coverage_rate > 65 ? 'Above avg' : 
                              organizationBenchmark?.market_coverage_rate > 40 ? 'Near avg' : 
                              'Below avg'
                            } (65%)</div>
                          </div>
                        </div>

                        {/* Industry Alignment Index */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-gray-600">Alignment Index</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">How well your team's skills match industry standards (0-10 scale). Based on average employee skill proficiency compared to market requirements.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">{(organizationBenchmark?.industry_alignment_index || 0).toFixed(1)}</span>
                            <span className="text-xs text-gray-500">/ 10</span>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= (organizationBenchmark?.industry_alignment_index || 0) ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{
                              organizationBenchmark?.industry_alignment_index >= 8 ? 'Strong' :
                              organizationBenchmark?.industry_alignment_index >= 6 ? 'Good' :
                              organizationBenchmark?.industry_alignment_index >= 4 ? 'Moderate' :
                              'Low'
                            } alignment</div>
                          </div>
                        </div>

                        {/* Top Missing Skills */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-gray-600">Critical Gaps</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-sm">High-priority skills that are in demand by the market but missing or underdeveloped in your organization. These should be addressed first for maximum impact.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">{organizationBenchmark?.top_missing_skills?.filter(s => s.severity === 'critical')?.length || 0}</span>
                            <span className="text-xs text-gray-500">skills</span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {(organizationBenchmark?.top_missing_skills || []).slice(0, 2).map((skill, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                <span className="text-xs text-gray-600 truncate">{skill.skill_name}</span>
                              </div>
                            ))}
                            {organizationBenchmark?.top_missing_skills?.length > 2 && (
                              <span className="text-xs text-gray-400">+{organizationBenchmark.top_missing_skills.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Executive Summary - Horizontal */}
                      {organizationBenchmark?.executive_summary && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">Executive Summary</h4>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {organizationBenchmark.executive_summary}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Department-Level Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Departments</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/dashboard/skills/employees')}
                      className="text-xs h-7 px-2"
                    >
                      View All <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {benchmarkLoading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {departmentsBenchmark.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No department benchmark data available
                        </div>
                      ) : (
                        // Department cards with expandable market gaps
                        departmentsBenchmark.slice(0, 5).map((dept, index) => {
                          const healthScore = dept.benchmark_health_score || 0;
                          const matchPercentage = dept.avg_market_match || 0;
                          const topGap = dept.top_gaps?.[0];
                          const isExpanded = expandedDepartments.has(dept.department);
                          const marketGap = departmentMarketGaps[dept.department];
                          
                          const getBadgeColor = (score: number) => {
                            if (score >= 80) return 'bg-green-50 text-green-700 border-green-200';
                            if (score >= 60) return 'bg-orange-50 text-orange-700 border-orange-200';
                            return 'bg-red-50 text-red-700 border-red-200';
                          };
                          
                          const getHealthColor = (score: number) => {
                            if (score >= 8) return { bg: 'bg-green-200', fill: 'bg-green-500', text: 'text-green-600' };
                            if (score >= 6) return { bg: 'bg-orange-200', fill: 'bg-orange-500', text: 'text-orange-600' };
                            return { bg: 'bg-red-200', fill: 'bg-red-500', text: 'text-red-600' };
                          };
                          
                          const healthColors = getHealthColor(healthScore);
                          const criticalGaps = dept.market_skill_breakdown?.critical || 0;
                          const moderateGaps = dept.market_skill_breakdown?.emerging || 0;
                          
                          return (
                            <Card key={index} className="border border-gray-200 hover:shadow-md transition-all">
                              <CardContent className="p-4">
                                {/* Department Header */}
                                <div 
                                  className="flex items-center justify-between mb-3 cursor-pointer"
                                  onClick={() => navigate(`/dashboard/skills/department/${encodeURIComponent(dept.department)}`)}
                                >
                                  <h4 className="font-medium text-sm">{dept.department}</h4>
                                  <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge className={`px-2 py-1 text-xs ${getBadgeColor(matchPercentage)}`}>
                                            {matchPercentage.toFixed(0)}% Match
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-sm">Market skill match: {matchPercentage.toFixed(0)}% ({dept.analyzed_count} of {dept.employee_count} employees analyzed)</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <ArrowRight className="h-4 w-4 text-gray-400" />
                                  </div>
                                </div>
                                
                                {/* Department Metrics */}
                                <div className="grid grid-cols-3 gap-4 mb-4 text-xs">
                                  <div className="text-center">
                                    <div className={`font-semibold ${
                                      criticalGaps > 5 ? 'text-red-600' : 
                                      criticalGaps > 0 || moderateGaps > 3 ? 'text-orange-600' : 
                                      'text-green-600'
                                    }`}>
                                      {criticalGaps > 0 ? `${criticalGaps} critical` : 
                                       moderateGaps > 0 ? `${moderateGaps} moderate` : 
                                       'No gaps'}
                                    </div>
                                    <div className="text-gray-500">Market Gaps</div>
                                  </div>
                                  <div className="text-center">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="cursor-help">
                                            <div className="flex items-center justify-center gap-1">
                                              <div className={`w-8 h-1.5 ${healthColors.bg} rounded-full`}>
                                                <div className={`h-1.5 ${healthColors.fill} rounded-full`} style={{width: `${(healthScore / 10) * 100}%`}}></div>
                                              </div>
                                              <span className={`${healthColors.text} font-semibold`}>{healthScore.toFixed(1)}</span>
                                            </div>
                                            <div className="text-gray-500">Health Score</div>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-sm">Overall department readiness (0-10). Combines skills coverage, gap severity, and employee analysis rate.</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-semibold text-gray-900">{dept.analyzed_count}/{dept.employee_count}</div>
                                    <div className="text-gray-500">Analyzed</div>
                                  </div>
                                </div>
                                
                                {/* Market Gap Toggle */}
                                {marketGap && marketGap.skills.length > 0 && (
                                  <>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedDepartments(prev => {
                                          const newSet = new Set(prev);
                                          if (newSet.has(dept.department)) {
                                            newSet.delete(dept.department);
                                          } else {
                                            newSet.add(dept.department);
                                          }
                                          return newSet;
                                        });
                                      }}
                                      className="w-full flex items-center justify-between p-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                      <span className="flex items-center gap-1">
                                        <Brain className="h-3 w-3" />
                                        Market Skills Gap ({marketGap.skills.length} skills)
                                      </span>
                                      {isExpanded ? (
                                        <ChevronUp className="h-3 w-3" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3" />
                                      )}
                                    </button>
                                    
                                    {/* Expandable Market Gap Section */}
                                    {isExpanded && (
                                      <div className="mt-3 pt-3 border-t border-gray-100">
                                        <MarketGapBars
                                          skills={marketGap.skills}
                                          industry={marketGap.industry}
                                          className="text-xs"
                                        />
                                      </div>
                                    )}
                                  </>
                                )}
                                
                                {/* AI Insights */}
                                {dept.ai_explanation && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 text-xs text-blue-600 cursor-help mt-2 p-2 bg-blue-50 rounded-lg">
                                          <Info className="h-3 w-3" />
                                          <span>Impact Score: {dept.impact_score?.toFixed(1) || 'N/A'}/10</span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs">
                                        <p className="text-sm">{dept.ai_explanation}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Employee-Level Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Employee Readiness</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/dashboard/skills/employees')}
                      className="text-xs h-7 px-2"
                    >
                      View All <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-xs font-medium text-gray-600">Employee</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-600">Department</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-600">Market Match</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-600">Skill Sources</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-600">Priority Gap</th>
                          <th className="text-left py-2 text-xs font-medium text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {benchmarkLoading ? (
                          /* Loading Skeleton Rows */
                          [1, 2, 3, 4, 5].map(i => (
                            <tr key={i} className="border-b border-gray-100">
                              <td className="py-3"><div className="h-4 bg-gray-200 animate-pulse rounded w-24"></div></td>
                              <td className="py-3"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                              <td className="py-3"><div className="h-4 bg-gray-200 animate-pulse rounded w-20"></div></td>
                              <td className="py-3"><div className="h-4 bg-gray-200 animate-pulse rounded w-12"></div></td>
                              <td className="py-3"><div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div></td>
                              <td className="py-3"><div className="h-6 bg-gray-200 animate-pulse rounded w-16"></div></td>
                            </tr>
                          ))
                        ) : employeesBenchmark.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-gray-500">
                              No employee benchmark data available
                            </td>
                          </tr>
                        ) : (
                          employeesBenchmark.slice(0, 10).map((employee, i) => {
                            const matchPercentage = employee.market_match_percentage || 0;
                            const topGap = employee.top_missing_skills?.[0];
                            const primarySource = Object.entries(employee.skills_by_source)
                              .reduce((max, [key, value]) => value > max.value ? { key, value } : max, { key: 'ai', value: 0 });
                            
                            return (
                              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3">
                                  <div className="font-medium text-gray-900">{employee.name}</div>
                                </td>
                                <td className="py-3 text-gray-600">{employee.department}</td>
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 max-w-20">
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all duration-500 ${
                                            matchPercentage >= 75 ? 'bg-green-500' : 
                                            matchPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}
                                          style={{width: `${matchPercentage}%`}}
                                        ></div>
                                      </div>
                                    </div>
                                    <span className={`text-xs font-medium ${
                                      matchPercentage >= 75 ? 'text-green-600' : 
                                      matchPercentage >= 40 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                      {matchPercentage.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3">
                                  <div className="flex items-center gap-1">
                                    {primarySource.key === 'ai' && <Brain className="h-3 w-3 text-blue-600" />}
                                    {primarySource.key === 'cv' && <FileText className="h-3 w-3 text-gray-600" />}
                                    {primarySource.key === 'verified' && <CheckCircle className="h-3 w-3 text-green-600" />}
                                    <span className="text-xs text-gray-600 capitalize">{primarySource.key}</span>
                                    <span className="text-xs text-gray-400">({primarySource.value})</span>
                                  </div>
                                </td>
                                <td className="py-3">
                                  {topGap ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-900 text-xs truncate max-w-20">{topGap.skill_name}</span>
                                      <Badge 
                                        className={`text-xs px-1.5 py-0 ${
                                          topGap.category === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                                          topGap.category === 'emerging' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                          'bg-yellow-100 text-yellow-700 border-yellow-200'
                                        }`}
                                      >
                                        {topGap.category}
                                      </Badge>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">No gaps</span>
                                  )}
                                </td>
                                <td className="py-3">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-xs h-6 px-2"
                                    onClick={() => navigate(`/dashboard/employees/${employee.employee_id}`)}
                                  >
                                    View Profile
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
