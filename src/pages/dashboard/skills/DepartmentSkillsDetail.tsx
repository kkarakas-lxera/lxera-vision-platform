import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Users, 
  Target,
  TrendingUp,
  AlertTriangle,
  GraduationCap,
  UserPlus,
  Brain,
  FileText,
  CheckCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { parseJsonSkills } from '@/utils/typeGuards';
import { marketSkillsService } from '@/services/marketSkills/MarketSkillsService';
import MarketGapBars from '@/components/dashboard/skills/MarketGapBars';
import type { MarketSkillData, MarketInsights } from '@/types/marketSkills';
import { cn } from '@/lib/utils';

interface DepartmentEmployee {
  employee_id: string;
  employee_name: string;
  position_title: string;
  skills_match_score: number;
  analyzed_at: string;
  technical_skills: any[];
  soft_skills: any[];
}

interface DepartmentSkillBreakdown {
  skill_name: string;
  employees_count: number;
  avg_proficiency: number;
  below_target_count: number;
  skill_type: 'technical' | 'soft';
}

interface DepartmentHealth {
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  score: number;
  reason: string;
  color: string;
  bgColor: string;
  icon: any;
}

function calculateDepartmentHealth(stats: {
  criticalGaps: number;
  moderateGaps: number;
  analyzedEmployees: number;
  totalEmployees: number;
}): DepartmentHealth {
  const { criticalGaps, moderateGaps, analyzedEmployees, totalEmployees } = stats;
  
  // Coverage penalty - departments with low analysis coverage get penalized
  const coverageRatio = totalEmployees > 0 ? analyzedEmployees / totalEmployees : 0;
  const coveragePenalty = coverageRatio < 0.5 ? 20 : 0;
  
  // Calculate severity score (higher is worse)
  const severityScore = (criticalGaps * 10) + (moderateGaps * 2) + coveragePenalty;
  
  if (criticalGaps === 0 && moderateGaps < 5) {
    return {
      status: 'excellent',
      score: Math.max(90, 95 - moderateGaps * 2),
      reason: 'No critical skill gaps identified',
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      icon: CheckCircle2
    };
  } else if (criticalGaps <= 2 && moderateGaps <= 10) {
    return {
      status: 'good',
      score: Math.max(70, 80 - (criticalGaps * 10) - (moderateGaps * 2)),
      reason: `${criticalGaps} critical gap${criticalGaps !== 1 ? 's' : ''} need${criticalGaps === 1 ? 's' : ''} attention`,
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      icon: TrendingUp
    };
  } else if (criticalGaps <= 5 || moderateGaps <= 20) {
    return {
      status: 'needs-improvement',
      score: Math.max(30, 60 - (criticalGaps * 8) - (moderateGaps * 1)),
      reason: `${criticalGaps} critical and ${moderateGaps} moderate gaps impacting productivity`,
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      icon: AlertCircle
    };
  } else {
    return {
      status: 'critical',
      score: Math.max(10, 40 - (criticalGaps * 5)),
      reason: `${criticalGaps} critical gaps - immediate training required`,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      icon: AlertTriangle
    };
  }
}

// Component for individual skill cards
const SkillCard = ({ 
  skill, 
  employees, 
  variant 
}: { 
  skill: DepartmentSkillBreakdown; 
  employees: DepartmentEmployee[]; 
  variant: 'critical' | 'developing' | 'strong';
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return {
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-700 border-red-200'
        };
      case 'developing':
        return {
          bgColor: 'bg-orange-50 border-orange-200',
          textColor: 'text-orange-700',
          badgeColor: 'bg-orange-100 text-orange-700 border-orange-200'
        };
      default:
        return {
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-100 text-green-700 border-green-200'
        };
    }
  };
  
  const styles = getVariantStyles();
  const coveragePercentage = employees.length > 0 
    ? Math.round((skill.employees_count / employees.length) * 100)
    : 0;
  
  return (
    <div className={`p-3 rounded-lg border ${styles.bgColor}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-medium text-sm text-gray-900">{skill.skill_name}</h4>
          <p className="text-xs text-gray-600 mt-0.5">
            {skill.employees_count}/{employees.length} employees ({coveragePercentage}%)
          </p>
        </div>
        {skill.below_target_count > 0 && (
          <Badge className={`text-xs px-2 py-0.5 ${styles.badgeColor} border`}>
            {skill.below_target_count} gap
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600">Avg. proficiency:</span>
          <span className={`font-semibold ${styles.textColor}`}>
            {skill.avg_proficiency.toFixed(1)}/5
          </span>
        </div>
        {skill.below_target_count > 5 && variant === 'critical' && (
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            Group training
          </Badge>
        )}
      </div>
      
      <div className="mt-2">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              variant === 'critical' ? 'bg-red-500' : 
              variant === 'developing' ? 'bg-orange-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${(skill.avg_proficiency / 5) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default function DepartmentSkillsDetail() {
  const { department } = useParams<{ department: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<DepartmentEmployee[]>([]);
  const [skillBreakdown, setSkillBreakdown] = useState<DepartmentSkillBreakdown[]>([]);
  const [departmentStats, setDepartmentStats] = useState({
    totalEmployees: 0,
    analyzedEmployees: 0,
    avgScore: 0,
    criticalGaps: 0,
    moderateGaps: 0
  });
  const [marketGapSkills, setMarketGapSkills] = useState<MarketSkillData[]>([]);
  const [marketGapInsights, setMarketGapInsights] = useState<MarketInsights | undefined>();
  const [marketGapLastUpdated, setMarketGapLastUpdated] = useState<Date | undefined>();
  const [loadingMarketGaps, setLoadingMarketGaps] = useState(false);

  useEffect(() => {
    if (userProfile?.company_id && department) {
      fetchDepartmentData();
      fetchMarketGaps();
    }
  }, [userProfile, department]);

  const fetchDepartmentData = async () => {
    if (!userProfile?.company_id || !department) return;

    try {
      setLoading(true);

      // First fetch employees in the department
      const { data: employeesInDept, error: empError } = await supabase
        .from('employees')
        .select(`
          id,
          department,
          current_position_id,
          user_id,
          users!employees_user_id_fkey(full_name)
        `)
        .eq('company_id', userProfile.company_id)
        .eq('department', decodeURIComponent(department));

      if (empError) {
        console.error('Error fetching employees:', empError);
        throw empError;
      }

      if (!employeesInDept?.length) {
        setEmployees([]);
        setDepartmentStats({
          totalEmployees: 0,
          analyzedEmployees: 0,
          avgScore: 0,
          criticalGaps: 0,
          moderateGaps: 0
        });
        setLoading(false);
        return;
      }

      const employeeIds = employeesInDept.map(emp => emp.id);

      // Fetch skills profiles for these employees
      const { data: skillsData, error: skillsError } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          employee_id,
          skills_match_score,
          analyzed_at,
          extracted_skills
        `)
        .in('employee_id', employeeIds)
        .not('analyzed_at', 'is', null);

      if (skillsError) {
        console.error('Error fetching skills profiles:', skillsError);
        throw skillsError;
      }

      // Fetch positions for these employees
      const positionIds = employeesInDept
        .map(emp => emp.current_position_id)
        .filter(Boolean);

      const positionsMap = new Map();
      if (positionIds.length > 0) {
        const { data: positionsData } = await supabase
          .from('st_company_positions')
          .select('id, position_title')
          .in('id', positionIds);

        if (positionsData) {
          positionsData.forEach(pos => {
            positionsMap.set(pos.id, pos.position_title);
          });
        }
      }

      // Combine the data
      const employeesData = employeesInDept
        .map(emp => {
          const skillsProfile = skillsData?.find(sp => sp.employee_id === emp.id);
          if (!skillsProfile) return null;

          // Extract all skills using safe parsing
          const allSkills = parseJsonSkills(skillsProfile.extracted_skills);
          
          // For now, don't filter by category since it may not be set
          // We'll display all skills together
          const technicalSkills = allSkills;
          const softSkills = [];

          return {
            employee_id: emp.id,
            skills_match_score: skillsProfile.skills_match_score || 0,
            analyzed_at: skillsProfile.analyzed_at,
            technical_skills: technicalSkills,
            soft_skills: softSkills,
            employees: {
              id: emp.id,
              department: emp.department,
              current_position_id: emp.current_position_id,
              users: emp.users,
              position_title: positionsMap.get(emp.current_position_id) || 'Not Assigned'
            }
          };
        })
        .filter(Boolean);

      const formattedEmployees = employeesData.map(profile => ({
        employee_id: profile.employee_id,
        employee_name: profile.employees.users?.full_name || 'Unknown',
        position_title: profile.employees.position_title || 'Not Assigned',
        skills_match_score: profile.skills_match_score,
        analyzed_at: profile.analyzed_at,
        technical_skills: profile.technical_skills,
        soft_skills: profile.soft_skills
      }));

      setEmployees(formattedEmployees);

      // Calculate department stats
      const totalAnalyzed = formattedEmployees.length;
      const totalInDept = employeesInDept.length;
      const avgScore = totalAnalyzed > 0 
        ? formattedEmployees.reduce((sum, emp) => sum + emp.skills_match_score, 0) / totalAnalyzed 
        : 0;
      const criticalCount = formattedEmployees.filter(emp => emp.skills_match_score < 50).length;
      const moderateCount = formattedEmployees.filter(emp => emp.skills_match_score >= 50 && emp.skills_match_score < 70).length;

      setDepartmentStats({
        totalEmployees: totalInDept,
        analyzedEmployees: totalAnalyzed,
        avgScore: Math.round(avgScore),
        criticalGaps: criticalCount,
        moderateGaps: moderateCount
      });

      // Generate skill breakdown
      const skillMap = new Map<string, { total: number; proficiencies: number[]; type: 'technical' | 'soft' }>();

      formattedEmployees.forEach(employee => {
        // Process technical skills
        if (Array.isArray(employee.technical_skills)) {
          employee.technical_skills.forEach(skill => {
            const skillName = skill.skill_name;
            const proficiency = skill.proficiency_level || 3;
            
            if (skillName) {
              if (!skillMap.has(skillName)) {
                skillMap.set(skillName, { total: 0, proficiencies: [], type: 'technical' });
              }
              const existing = skillMap.get(skillName)!;
              existing.total++;
              existing.proficiencies.push(proficiency);
            }
          });
        }

        // Note: soft_skills array is empty now, all skills are in technical_skills
      });

      // Convert to breakdown format
      const breakdown: DepartmentSkillBreakdown[] = Array.from(skillMap.entries())
        .map(([skillName, data]) => ({
          skill_name: skillName,
          employees_count: data.total,
          avg_proficiency: data.proficiencies.reduce((sum, p) => sum + p, 0) / data.proficiencies.length,
          below_target_count: data.proficiencies.filter(p => p < 4).length,
          skill_type: data.type
        }))
        .filter(skill => skill.employees_count >= 1) // Show all skills
        .sort((a, b) => b.below_target_count - a.below_target_count);

      setSkillBreakdown(breakdown);

    } catch (error) {
      console.error('Error fetching department data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load department data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const fetchMarketGaps = async (forceRefresh = false) => {
    if (!userProfile?.company_id || !department) return;

    setLoadingMarketGaps(true);
    try {
      // Get company industry
      const { data: companyData } = await supabase
        .from('companies')
        .select('industry')
        .eq('id', userProfile.company_id)
        .single();

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
        .eq('employees.department', decodeURIComponent(department))
        .not('extracted_skills', 'is', null);

      // Aggregate all skills
      const allSkills = employeeSkills?.flatMap(profile => 
        parseJsonSkills(profile.extracted_skills)
      ) || [];

      // Get market gaps - modify service to support force refresh
      // Prepare company context for insights
      const companyContext = {
        employees_count: departmentStats.totalEmployees,
        analyzed_count: departmentStats.analyzedEmployees,
        critical_gaps: departmentStats.criticalGaps,
        moderate_gaps: departmentStats.moderateGaps
      };

      if (forceRefresh) {
        // Force a refresh by calling the edge function directly
        const { data, error } = await supabase.functions.invoke('generate-market-benchmarks', {
          body: { 
            role: decodeURIComponent(department), 
            industry: companyData?.industry, 
            department: decodeURIComponent(department), 
            force_refresh: true,
            include_insights: true,
            company_context: companyContext
          }
        });

        if (!error && data) {
          // Compare with internal skills
          const comparedSkills = marketSkillsService.compareWithInternal(
            data.skills || [], 
            allSkills
          );
          setMarketGapSkills(comparedSkills);
          setMarketGapInsights(data.insights);
          setMarketGapLastUpdated(data.generated_at ? new Date(data.generated_at) : new Date());
        }
      } else {
        // Get market gaps normally (with caching)
        const marketGap = await marketSkillsService.getDepartmentMarketGaps(
          decodeURIComponent(department),
          companyData?.industry,
          allSkills,
          companyContext
        );

        setMarketGapSkills(marketGap.skills);
        setMarketGapInsights(marketGap.insights);
        setMarketGapLastUpdated(marketGap.last_updated);
      }
    } catch (error) {
      console.error('Error fetching market gaps:', error);
      toast({
        title: 'Error',
        description: forceRefresh ? 'Failed to refresh market data' : 'Failed to load market data',
        variant: 'destructive'
      });
    } finally {
      setLoadingMarketGaps(false);
    }
  };

  const getDepartmentIcon = (deptName: string) => {
    switch (deptName?.toLowerCase()) {
      case 'finance': return '💼';
      case 'engineering': return '🔧';
      case 'marketing': return '📢';
      case 'operations': return '⚙️';
      default: return '🏢';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Department not specified</p>
        <Button onClick={() => navigate('/dashboard/skills')} className="mt-4">
          Back to Skills Overview
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Clean Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/dashboard/skills')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
        
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{getDepartmentIcon(department)}</span>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {decodeURIComponent(department)}
            </h1>
            <p className="text-muted-foreground">Department Skills Analysis</p>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{departmentStats.totalEmployees}</div>
            <div className="text-xs text-muted-foreground mt-1">Team Size</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold">
              {departmentStats.analyzedEmployees}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Analyzed</div>
            <Progress 
              value={(departmentStats.analyzedEmployees / departmentStats.totalEmployees) * 100} 
              className="h-1 mt-2"
            />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{departmentStats.criticalGaps}</div>
            <div className="text-xs text-muted-foreground mt-1">Critical Gaps</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{departmentStats.moderateGaps}</div>
            <div className="text-xs text-muted-foreground mt-1">Moderate Gaps</div>
          </div>
        </Card>
      </div>

      {/* Department Health Status Card */}
      {
        (() => {
          const health = calculateDepartmentHealth(departmentStats);
          const HealthIcon = health.icon;
          return (
            <div className={`${health.bgColor} border border-${health.color.replace('text-', '').replace('-700', '-200')} rounded-lg p-4`}>
              <div className="flex items-start gap-3">
                <HealthIcon className={`h-5 w-5 ${health.color} mt-0.5`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{health.reason}</p>
                  {health.status === 'needs-improvement' && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-orange-700">
                      <AlertCircle className="h-3 w-3" />
                      <span>Consider group training for critical skills</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      }

      {/* Market Skills Gap Section */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Market Skills Comparison</h2>
          <Badge variant="outline" className="text-xs">
            <Brain className="h-3 w-3 mr-1" />
            2025 Market Data
          </Badge>
        </div>
        {loadingMarketGaps && marketGapSkills.length === 0 ? (
          <div className="space-y-4 py-8">
            <div className="flex justify-center">
              <div className="animate-pulse flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-500" />
                <span className="text-sm text-muted-foreground">Analyzing market trends...</span>
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ) : marketGapSkills.length > 0 ? (
          <MarketGapBars
            skills={marketGapSkills}
            insights={marketGapInsights}
            role={decodeURIComponent(department)}
            showSource={false}
            className="text-sm"
            lastUpdated={marketGapLastUpdated}
            onRefresh={() => fetchMarketGaps(true)}
            isRefreshing={loadingMarketGaps}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No market benchmark data available</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-3"
              onClick={() => fetchMarketGaps(true)}
              disabled={loadingMarketGaps}
            >
              Generate Market Analysis
            </Button>
          </div>
        )}
      </div>

      {/* Main Content - Single Column Layout */}
      <div className="space-y-4">
        {/* Skills Analysis Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Skills Analysis</CardTitle>
                <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                  {skillBreakdown.length} skills
                </Badge>
              </div>
              <Button size="sm" variant="ghost" className="text-xs">
                <FileText className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* Critical Skills Section */}
              {skillBreakdown.filter(s => s.avg_proficiency < 2).length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <h4 className="text-sm font-medium text-gray-900">Critical Skills ({skillBreakdown.filter(s => s.avg_proficiency < 2).length})</h4>
                  </div>
                  <div className="space-y-2">
                    {skillBreakdown.filter(s => s.avg_proficiency < 2).map((skill) => (
                      <SkillCard key={skill.skill_name} skill={skill} employees={employees} variant="critical" />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Developing Skills Section */}
              {skillBreakdown.filter(s => s.avg_proficiency >= 2 && s.avg_proficiency < 3.5).length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <h4 className="text-sm font-medium text-gray-900">Developing Skills ({skillBreakdown.filter(s => s.avg_proficiency >= 2 && s.avg_proficiency < 3.5).length})</h4>
                  </div>
                  <div className="space-y-2">
                    {skillBreakdown.filter(s => s.avg_proficiency >= 2 && s.avg_proficiency < 3.5).slice(0, 5).map((skill) => (
                      <SkillCard key={skill.skill_name} skill={skill} employees={employees} variant="developing" />
                    ))}
                    {skillBreakdown.filter(s => s.avg_proficiency >= 2 && s.avg_proficiency < 3.5).length > 5 && (
                      <p className="text-xs text-gray-500 pl-4">
                        +{skillBreakdown.filter(s => s.avg_proficiency >= 2 && s.avg_proficiency < 3.5).length - 5} more skills
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Strong Skills Section */}
              {skillBreakdown.filter(s => s.avg_proficiency >= 3.5).length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <h4 className="text-sm font-medium text-gray-900">Strong Skills ({skillBreakdown.filter(s => s.avg_proficiency >= 3.5).length})</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {skillBreakdown.filter(s => s.avg_proficiency >= 3.5).slice(0, 6).map((skill) => (
                      <div key={skill.skill_name} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-gray-700 truncate">{skill.skill_name}</span>
                      </div>
                    ))}
                  </div>
                  {skillBreakdown.filter(s => s.avg_proficiency >= 3.5).length > 6 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{skillBreakdown.filter(s => s.avg_proficiency >= 3.5).length - 6} more strong skills
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Team Members</CardTitle>
                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                  {employees.length} analyzed
                </Badge>
              </div>
              {departmentStats.totalEmployees > employees.length && (
                <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
                  {departmentStats.totalEmployees - employees.length} pending analysis
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {employees.map((employee) => {
                const readinessLevel = employee.skills_match_score >= 80 ? 'ready' : 
                                     employee.skills_match_score >= 60 ? 'developing' : 'needs-support';
                const skillsCount = employee.technical_skills?.length || 0;
                
                // Find critical skills for this employee
                const criticalSkills = skillBreakdown
                  .filter(skill => skill.avg_proficiency < 2)
                  .filter(skill => {
                    const hasSkill = employee.technical_skills?.some(
                      empSkill => empSkill.skill_name === skill.skill_name
                    );
                    return !hasSkill || (hasSkill && employee.technical_skills?.find(
                      empSkill => empSkill.skill_name === skill.skill_name
                    )?.proficiency_level < 2);
                  })
                  .slice(0, 2);
                
                return (
                  <div 
                    key={employee.employee_id} 
                    className={cn(
                      "p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer",
                      readinessLevel === 'ready' ? "bg-green-50/50 border-green-200 hover:border-green-300" :
                      readinessLevel === 'developing' ? "bg-orange-50/50 border-orange-200 hover:border-orange-300" :
                      "bg-red-50/50 border-red-200 hover:border-red-300"
                    )}
                    onClick={() => navigate(`/dashboard/employees/${employee.employee_id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {employee.employee_name}
                        </h4>
                        <p className="text-xs text-gray-600 truncate">{employee.position_title}</p>
                      </div>
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold",
                        readinessLevel === 'ready' ? "bg-green-100 text-green-700" :
                        readinessLevel === 'developing' ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {employee.skills_match_score}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{skillsCount} skills</span>
                        <span className="text-gray-500">
                          Analyzed {formatTimeAgo(employee.analyzed_at)}
                        </span>
                      </div>
                      
                      {criticalSkills.length > 0 && (
                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">Needs training:</p>
                          <div className="flex flex-wrap gap-1">
                            {criticalSkills.map((skill, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-xs px-1.5 py-0 bg-white"
                              >
                                {skill.skill_name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {readinessLevel === 'ready' && (
                        <div className="flex items-center gap-1 text-xs text-green-700">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Ready for advanced projects</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {departmentStats.totalEmployees > employees.length && (
                <div 
                  className="p-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center min-h-[140px] cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => navigate('/dashboard/employees')}
                >
                  <UserPlus className="h-6 w-6 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    {departmentStats.totalEmployees - employees.length} more
                  </p>
                  <p className="text-xs text-gray-500">Pending analysis</p>
                </div>
              )}
            </div>
            
            {employees.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No analyzed employees yet</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => navigate('/dashboard/employees')}
                >
                  Analyze Employees
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
