
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
  Building2,
  Brain,
  FileText,
  CheckCircle
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
  const [analyzedEmployeesCount, setAnalyzedEmployeesCount] = useState(0);

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchSkillsOverview();
    }
  }, [userProfile?.company_id]);

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

      {/* Main Content with Conditional Blur */}
      <div className="relative">
        <div className={cn(
          "space-y-6 transition-all duration-500",
          emptyStateConfig.shouldBlur && "blur-md pointer-events-none select-none"
        )}>
          {/* Organization Skills Health - Consolidated Metrics */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Organization Skills Health</CardTitle>
                  <CardDescription>Comprehensive view of your workforce readiness</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{overallStats.avgSkillsMatch}%</div>
                  <div className="text-sm text-gray-500">Overall Readiness</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Coverage */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Coverage</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {overallStats.analyzedEmployees}/{overallStats.totalEmployees}
                    </div>
                    <div className="text-xs text-gray-500">employees analyzed</div>
                    <Progress 
                      value={overallStats.totalEmployees > 0 ? (overallStats.analyzedEmployees / overallStats.totalEmployees) * 100 : 0} 
                      className="h-1"
                    />
                  </div>
                </div>

                {/* Skills Gaps */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-600">Skills Gaps</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {overallStats.totalCriticalGaps + overallStats.totalModerateGaps}
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-red-600 font-medium">{overallStats.totalCriticalGaps} critical</span>
                      <span className="text-orange-600">{overallStats.totalModerateGaps} moderate</span>
                    </div>
                    {overallStats.totalCriticalGaps > 0 && (
                      <div className="text-xs text-gray-500">Blocking productivity</div>
                    )}
                  </div>
                </div>

                {/* Departments */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">Departments</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">{overallStats.departmentsCount}</div>
                    <div className="text-xs text-gray-500">active teams</div>
                    {overallStats.departmentsCount > 0 && (
                      <div className="text-xs text-green-600">
                        {Math.round((departmentSummaries.filter(d => d.avg_skills_match !== null && d.avg_skills_match >= 70).length / overallStats.departmentsCount) * 100)}% meeting targets
                      </div>
                    )}
                  </div>
                </div>

                {/* Estimated Impact */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Impact</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600">
                      ${Math.round(overallStats.totalCriticalGaps * 2.5)}K
                    </div>
                    <div className="text-xs text-gray-500">potential savings</div>
                    <div className="text-xs text-gray-500">via training vs hiring</div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Organization Readiness Score</span>
                  <span className="text-sm font-medium text-gray-900">{overallStats.avgSkillsMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(overallStats.avgSkillsMatch)}`}
                    style={{ width: `${overallStats.avgSkillsMatch}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Need improvement</span>
                  <span className="text-xs text-gray-500">Target: 80%</span>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{dept.department}</h4>
                    <div className="flex items-center gap-2">
                      {dept.analyzed_employees === dept.total_employees ? (
                        <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                          Full coverage
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {Math.round((dept.analyzed_employees / dept.total_employees) * 100)}% analyzed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{dept.total_employees} people</span>
                      </div>
                      {dept.critical_gaps > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          {dept.critical_gaps} critical gaps
                        </Badge>
                      )}
                      {dept.moderate_gaps > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-orange-100 text-orange-700">
                          {dept.moderate_gaps} moderate
                        </Badge>
                      )}
                    </div>
                  </div>
                  {dept.avg_skills_match !== null && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(dept.avg_skills_match)}`}
                          style={{ width: `${Math.min(dept.avg_skills_match, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
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
            {criticalGaps.slice(0, 6).map((gap, index) => {
              const sourceInfo = getSkillSourceInfo(gap.skill_name);
              const SourceIcon = sourceInfo.icon;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{gap.skill_name}</h4>
                        <div className="flex items-center gap-1">
                          <SourceIcon className={`h-3 w-3 ${sourceInfo.className}`} />
                          <span className={`text-xs ${sourceInfo.className}`}>
                            {sourceInfo.label}
                            {sourceInfo.confidence < 100 && ` • ${sourceInfo.confidence}%`}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getSeverityColor(gap.gap_severity)}`}>
                        {gap.gap_severity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span>{gap.department}</span>
                        <span className="font-medium">{gap.employees_with_gap} employees affected</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {gap.employees_with_gap > 10 ? (
                          <span className="text-orange-600 font-medium">Consider group training</span>
                        ) : (
                          <span>Individual development</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
