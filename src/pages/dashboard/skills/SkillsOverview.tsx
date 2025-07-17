
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target,
  TrendingUp,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Building2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { parseGapSeverity, parseSkillsArray } from '@/utils/typeGuards';
import type { CriticalSkillsGap } from '@/types/common';
import EmptyStateOverlay from '@/components/dashboard/EmptyStateOverlay';
import { cn } from '@/lib/utils';

interface DepartmentSummary {
  department: string;
  total_employees: number;
  analyzed_employees: number;
  avg_skills_match: number | null;
  critical_gaps: number;
  moderate_gaps: number;
  exceeding_targets: number;
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
  const [companyName, setCompanyName] = useState<string>('');
  const [analyzedEmployeesCount, setAnalyzedEmployeesCount] = useState(0);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchSkillsOverview();
    }
    if (userProfile?.email && !userProfile?.companies?.name) {
      fetchCompanyName();
    }
  }, [userProfile?.company_id, userProfile?.email]);

  const fetchCompanyName = async () => {
    if (!userProfile?.email) return;
    
    try {
      const { data, error } = await supabase
        .from('skills_gap_leads')
        .select('company')
        .eq('email', userProfile.email)
        .eq('status', 'converted')
        .single();

      if (data && !error) {
        setCompanyName(data.company);
      }
    } catch (error) {
      console.error('Error fetching company name:', error);
    }
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

      // Fetch employees count
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('id, skills_last_analyzed')
        .eq('company_id', userProfile.company_id);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        setEmployeesCount(0);
        setAnalyzedEmployeesCount(0);
      } else {
        const empCount = employeesData?.length || 0;
        const analyzedCount = employeesData?.filter(emp => emp.skills_last_analyzed).length || 0;
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

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      {/* User Info Bar */}
      <div className="bg-white border-b px-6 py-3 -mx-6 -mt-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-700">
                  {userProfile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userProfile?.full_name || 'User'}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {userProfile?.companies?.name || companyName || 'Company'}
                </p>
              </div>
            </div>
          </div>
          <Badge className="bg-amber-50 text-amber-700 border-amber-200">
            Free Trial
          </Badge>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Skills Overview</h1>
        <p className="text-gray-600 mt-1">Monitor your organization's skill development and identify gaps</p>
      </div>

      {/* Main Content with Conditional Blur */}
      <div className="relative">
        <div className={cn(
          "space-y-6 transition-all duration-500",
          emptyStateConfig.shouldBlur && "blur-md pointer-events-none select-none"
        )}>
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalEmployees}</p>
                <p className="text-xs text-gray-500">{overallStats.analyzedEmployees} analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Skills Match</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.avgSkillsMatch}%</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(overallStats.avgSkillsMatch)}`}
                    style={{ width: `${overallStats.avgSkillsMatch}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Skills Gaps</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalCriticalGaps + overallStats.totalModerateGaps}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span className="text-red-600">{overallStats.totalCriticalGaps} Critical</span>
                  <span className="text-orange-600">{overallStats.totalModerateGaps} Moderate</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.departmentsCount}</p>
                <p className="text-xs text-gray-500">Active departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Analysis & Critical Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">Department Analysis</CardTitle>
              <CardDescription>Skills performance by department</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/skills/employees')}
              className="text-xs"
            >
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {departmentSummaries.slice(0, 5).map((dept, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/dashboard/skills/department/${encodeURIComponent(dept.department)}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{dept.department}</h4>
                    <span className="text-xs text-gray-500">{dept.analyzed_employees}/{dept.total_employees}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {dept.avg_skills_match !== null ? (
                      <span>Match: {Math.round(dept.avg_skills_match)}%</span>
                    ) : (
                      <span className="text-gray-400">No data</span>
                    )}
                    <span className="text-red-600">Critical: {dept.critical_gaps}</span>
                    <span className="text-orange-600">Moderate: {dept.moderate_gaps}</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      {dept.avg_skills_match !== null && (
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(dept.avg_skills_match)}`}
                          style={{ width: `${Math.min(dept.avg_skills_match, 100)}%` }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Critical Skills Gaps */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-medium">Critical Skills Gaps</CardTitle>
              <CardDescription>Skills requiring immediate attention</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard/skills/positions')}
              className="text-xs"
            >
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {criticalGaps.slice(0, 6).map((gap, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{gap.skill_name}</h4>
                    <Badge variant="outline" className={`text-xs ${getSeverityColor(gap.gap_severity)}`}>
                      {gap.gap_severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{gap.department}</span>
                    <span>{gap.employees_with_gap} employees affected</span>
                    <span>Avg: {gap.avg_proficiency.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            ))}
            {criticalGaps.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No critical skills gaps identified</p>
              </div>
            )}
          </CardContent>
        </Card>
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
    </div>
  );
}
