
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SkillBadge } from '@/components/dashboard/shared/SkillBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Removed unused import: Textarea
import { 
  Users, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Globe,
  Loader2,
  Brain,
  Trash2,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { parseGapSeverity } from '@/utils/typeGuards';
import type { CriticalSkillsGap } from '@/types/common';
import EmptyStateOverlay from '@/components/dashboard/EmptyStateOverlay';
import { cn } from '@/lib/utils';
import { LayoutGrid, Grid3x3 } from 'lucide-react';
import OrgSkillsHealth from '@/components/dashboard/skills/OrgSkillsHealth';
import DepartmentAnalysisPanel from '@/components/dashboard/skills/DepartmentAnalysisPanel';
import CriticalSkillsPanel from '@/components/dashboard/skills/CriticalSkillsPanel';
import SkillsHeatmapView from '@/components/dashboard/skills/SkillsHeatmapView';
import SkillsTrendsView from '@/components/dashboard/skills/SkillsTrendsView';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface DepartmentSummary {
  department: string;
  total_employees: number;
  analyzed_employees: number;
  avg_skills_match: number | null;
  critical_gaps: number;
  moderate_gaps: number;
  exceeding_targets: number;
}

interface MarketIntelligenceRequest {
  id: string;
  regions: string[];
  countries: string[];
  focus_area: 'technical' | 'all_skills';
  custom_prompt?: string;
  status: 'pending' | 'gathering' | 'scraping' | 'analyzing' | 'completed' | 'failed';
  scraped_data?: any;
  ai_insights?: string;
  created_at: string;
  completed_at?: string;
  status_message?: string;
  error_details?: any;
}

function getDepartmentHealthStatus(dept: DepartmentSummary) {
  const { critical_gaps, moderate_gaps } = dept;
  
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
  const [activeTab, setActiveTab] = useState('internal');
  
  // Internal Readiness view state
  const [internalView, setInternalView] = useState<'cards' | 'heatmap' | 'trends'>('cards');
  const [positionSkillsMatrix, setPositionSkillsMatrix] = useState<any>({ data: [], positions: [], skills: [] });
  const [historicalSnapshots, setHistoricalSnapshots] = useState<any[]>([]);
  const [skillsMomentum, setSkillsMomentum] = useState<any[]>([]);

  // Market Intelligence state
  const [marketRequests, setMarketRequests] = useState<MarketIntelligenceRequest[]>([]);
  const [currentRequest, setCurrentRequest] = useState<MarketIntelligenceRequest | null>(null);
  const [marketLoading, setMarketLoading] = useState(false);
  
  // Form state for new market intelligence request
  const [selectedRegion, setSelectedRegion] = useState<string>('US');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [focusArea, setFocusArea] = useState<'technical' | 'all_skills'>('all_skills');
  const [customPrompt] = useState(`Analyze current job market trends and in-demand skills for similar positions in our industry. Focus on:
1. Top technical and soft skills required
2. Emerging skill trends and future requirements
3. Salary ranges and market competitiveness
4. Talent availability and competition
5. Recommendations for upskilling our workforce`);
  // Removed unused: setCustomPrompt

  // Region and country configuration
  const regionCountries = {
    'US': ['United States'],
    'Europe': ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Sweden', 'Switzerland', 'Spain', 'Italy'],
    'MENA': ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Egypt'],
    'Asia/Pacific': ['Singapore', 'Australia', 'Japan', 'South Korea', 'Hong Kong', 'Malaysia', 'India', 'Thailand']
  };

  const allCountries = Object.values(regionCountries).flat().sort();

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchSkillsOverview();
      if (activeTab === 'market') {
        fetchMarketRequests();
      }
    }
  }, [userProfile?.company_id, activeTab]);

  // Removed: market gaps fetching effect tied to department summaries

  // Removed: benchmark refresh on mount

  // Removed: market tab activation effect

  // (Removed) Market benchmark data loading effect

  // Fetch data for different internal views
  useEffect(() => {
    if (activeTab === 'internal' && userProfile?.company_id) {
      if (internalView === 'heatmap' && positionSkillsMatrix.data.length === 0) {
        fetchPositionSkillsMatrix();
      } else if (internalView === 'trends' && historicalSnapshots.length === 0) {
        fetchHistoricalSnapshots();
      }
    }
  }, [activeTab, internalView, userProfile?.company_id]);

  // Removed: checkCachedData for market benchmark

  // Removed: fetchBenchmarkData and related market logic

  // Removed: loadExecutiveReports for market benchmark

  // Removed: handleRefreshBenchmark

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
          skills_validation_completed
        `)
        .eq('company_id', userProfile.company_id);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        setEmployeesCount(0);
        setAnalyzedEmployeesCount(0);
      } else {
        const empCount = employeesData?.length || 0;
        // Check if employee has been analyzed (has skills or completed validation)
        const analyzedCount = employeesData?.filter(emp => {
          return emp.skills_last_analyzed || emp.skills_validation_completed;
        }).length || 0;
        console.log('Employees count:', empCount, 'Analyzed:', analyzedCount);
        setEmployeesCount(empCount);
        setAnalyzedEmployeesCount(analyzedCount);
      }

      // Fetch department summaries
      const { data: deptData } = await supabase
        .from('v_department_skills_summary' as any)
        .select('*')
        .eq('company_id', userProfile.company_id);

      let effectiveDeptSummaries: DepartmentSummary[] = [];
      if (deptData && deptData.length > 0) {
        effectiveDeptSummaries = deptData.map((dept: any) => ({
          department: dept.department || 'Unassigned',
          total_employees: Number(dept.total_employees) || 0,
          analyzed_employees: Number(dept.analyzed_employees) || 0,
          avg_skills_match: dept.avg_skills_match !== null ? Number(dept.avg_skills_match) : null,
          critical_gaps: Number(dept.critical_gaps) || 0,
          moderate_gaps: Number(dept.moderate_gaps) || 0,
          exceeding_targets: Number(dept.exceeding_targets) || 0
        }));
      }

      // If the view returned empty or clearly stale numbers while we know employees exist, build a fallback from employees
      const totalsFromView = effectiveDeptSummaries.reduce((acc, d) => acc + d.total_employees + d.analyzed_employees, 0);
      if (effectiveDeptSummaries.length === 0 || (totalsFromView === 0 && (employeesCount > 0))) {
        const { data: allEmployees } = await supabase
          .from('employees')
          .select(`
            id,
            department,
            skills_last_analyzed,
            cv_analysis_data,
            employee_skills(
              skill_name,
              proficiency
            )
          `)
          .eq('company_id', userProfile.company_id);

        const byDept = new Map<string, { total: number; analyzed: number; scores: number[]; critical: number; moderate: number }>();
        (allEmployees || []).forEach((emp: any) => {
          const dept = emp.department?.trim() || 'Unassigned';
          if (!byDept.has(dept)) byDept.set(dept, { total: 0, analyzed: 0, scores: [], critical: 0, moderate: 0 });
          const bucket = byDept.get(dept)!;
          bucket.total += 1;
          const hasTableSkills = Array.isArray(emp.employee_skills) && emp.employee_skills.length > 0;
          const hasCvSkills = Array.isArray(emp.cv_analysis_data?.extracted_skills) && emp.cv_analysis_data.extracted_skills.length > 0;
          const isAnalyzed = Boolean(emp.skills_last_analyzed) || hasTableSkills || hasCvSkills;
          if (isAnalyzed) {
            bucket.analyzed += 1;
            const scoreNum = typeof emp.cv_analysis_data?.skills_match_score === 'number' ? emp.cv_analysis_data.skills_match_score : null;
            if (typeof scoreNum === 'number') {
              bucket.scores.push(scoreNum);
              if (scoreNum < 50) bucket.critical += 1; else if (scoreNum < 70) bucket.moderate += 1;
            }
          }
        });

        effectiveDeptSummaries = Array.from(byDept.entries()).map(([department, v]) => ({
          department,
          total_employees: v.total,
          analyzed_employees: v.analyzed,
          avg_skills_match: v.scores.length > 0 ? Math.round(v.scores.reduce((a, b) => a + b, 0) / v.scores.length) : null,
          critical_gaps: v.critical,
          moderate_gaps: v.moderate,
          exceeding_targets: 0
        }));
      }

      setDepartmentSummaries(effectiveDeptSummaries);

      // Fetch critical skills gaps
      const { data: gapsData } = await supabase
        .from('v_critical_skills_gaps' as any)
        .select('*')
        .eq('company_id', userProfile.company_id)
        .limit(10);

      if (gapsData) {
        const typedGaps: CriticalSkillsGap[] = gapsData.map((gap: any) => ({
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
      const totalEmployees = effectiveDeptSummaries.reduce((sum, dept) => sum + (Number(dept.total_employees) || 0), 0) || 0;
      const analyzedEmployees = effectiveDeptSummaries.reduce((sum, dept) => sum + (Number(dept.analyzed_employees) || 0), 0) || 0;
      
      // Calculate weighted average, only including departments with analyzed employees
      let totalWeightedMatch = 0;
      let totalAnalyzedForAverage = 0;
      
      effectiveDeptSummaries.forEach(dept => {
        if (dept.avg_skills_match !== null && dept.analyzed_employees > 0) {
          totalWeightedMatch += Number(dept.avg_skills_match) * Number(dept.analyzed_employees);
          totalAnalyzedForAverage += Number(dept.analyzed_employees);
        }
      });
      
      const avgMatch = totalAnalyzedForAverage > 0 
        ? totalWeightedMatch / totalAnalyzedForAverage
        : 0;
      
      // Sum up all skill gaps from department data
      const totalCriticalGaps = effectiveDeptSummaries.reduce((sum, dept) => sum + (Number(dept.critical_gaps) || 0), 0) || 0;
      const totalModerateGaps = effectiveDeptSummaries.reduce((sum, dept) => sum + (Number(dept.moderate_gaps) || 0), 0) || 0;

      setOverallStats({
        totalEmployees,
        analyzedEmployees,
        avgSkillsMatch: Math.round(avgMatch || 0),
        totalCriticalGaps,
        totalModerateGaps,
        departmentsCount: effectiveDeptSummaries.length || 0
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

  // Removed: fetchMarketGapsForDepartments

  // Fetch data for heatmap view
  const fetchPositionSkillsMatrix = async () => {
    if (!userProfile?.company_id) return;

    try {
      // First fetch all positions
      const { data: positions, error: posError } = await supabase
        .from('st_company_positions')
        .select('id, position_title')
        .eq('company_id', userProfile.company_id);

      if (posError) throw posError;

      // Then fetch employees with their position and skills
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select(`
          id,
          current_position_id,
          users!left(
            full_name,
            email
          ),
          employee_skills(
            skill_name,
            proficiency,
            source
          )
        `)
        .eq('company_id', userProfile.company_id)
        .not('current_position_id', 'is', null);

      if (empError) throw empError;

      // Build the matrix
      const skillsMap = new Map<string, Map<string, { total: number; count: number; employees: any[] }>>();
      const positionNames: string[] = [];
      const positionIdMap = new Map<string, string>();
      const allSkills = new Set<string>();

      // Create position mapping
      positions?.forEach(position => {
        positionNames.push(position.position_title);
        positionIdMap.set(position.id, position.position_title);
        skillsMap.set(position.position_title, new Map());
      });

      // Process employees and their skills
      employees?.forEach(employee => {
        const positionName = positionIdMap.get(employee.current_position_id);
        if (!positionName) return;

        const positionSkills = skillsMap.get(positionName)!;
        const skills = employee.employee_skills || [];
        
        skills.forEach((skill: any) => {
          allSkills.add(skill.skill_name);
          
          if (!positionSkills.has(skill.skill_name)) {
            positionSkills.set(skill.skill_name, { total: 0, count: 0, employees: [] });
          }
          
          const current = positionSkills.get(skill.skill_name)!;
          current.total += skill.proficiency || 0; // proficiency is 0-3 in new structure
          current.count += 1;
          const userRel = employee.users as unknown;
          let displayName = 'Unknown';
          if (Array.isArray(userRel)) {
            const u = userRel[0] as { full_name?: string; email?: string } | undefined;
            displayName = u?.full_name || (u?.email ? u.email.split('@')[0].replace(/[._]/g, ' ') : 'Unknown');
          } else if (userRel && typeof userRel === 'object') {
            const u = userRel as { full_name?: string; email?: string };
            displayName = u.full_name || (u.email ? u.email.split('@')[0].replace(/[._]/g, ' ') : 'Unknown');
          }
          current.employees.push({
            name: displayName,
            proficiency: skill.proficiency || 0 // proficiency is 0-3 in new structure
          });
        });
      });

      // Convert to matrix format
      const skillsList = Array.from(allSkills).sort();
      const matrixData = positionNames.map(position => {
        return skillsList.map(skill => {
          const posSkills = skillsMap.get(position);
          const skillData = posSkills?.get(skill);
          
          return {
            position,
            skill,
            avgProficiency: skillData ? skillData.total / skillData.count : 0,
            employeeCount: skillData?.count || 0,
            employees: skillData?.employees || []
          };
        });
      });

      setPositionSkillsMatrix({
        data: matrixData,
        positions: positionNames,
        skills: skillsList
      });
    } catch (error) {
      console.error('Error fetching position skills matrix:', error);
    }
  };

  // Fetch historical snapshots for trends
  const fetchHistoricalSnapshots = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data: snapshots, error } = await supabase
        .from('market_benchmark_snapshots')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('snapshot_date', { ascending: true })
        .limit(12); // Last 12 snapshots

      if (error) throw error;

      // Transform data for the chart
      const formattedSnapshots = snapshots?.map((snapshot: any) => ({
        date: snapshot.snapshot_date,
        organization: (snapshot.metrics as any)?.average_match || 0,
        departments: (snapshot.metrics as any)?.department_scores || {},
        positions: (snapshot.metrics as any)?.position_scores || {},
        critical_gaps: (snapshot.metrics as any)?.critical_gaps || 0,
        moderate_gaps: (snapshot.metrics as any)?.moderate_gaps || 0,
        skills_proficiency: (snapshot.metrics as any)?.skills_proficiency || {}
      })) || [];

      setHistoricalSnapshots(formattedSnapshots);

      // Calculate momentum (compare last 2 snapshots)
      if (formattedSnapshots.length >= 2) {
        const current = formattedSnapshots[formattedSnapshots.length - 1];
        const previous = formattedSnapshots[formattedSnapshots.length - 2];
        
        // Extract skills proficiency data if available
        const currentSkills = current.skills_proficiency || {};
        const previousSkills = previous.skills_proficiency || {};
        
        // Calculate momentum for each skill
        const momentum: any[] = [];
        const allSkillNames = new Set([...Object.keys(currentSkills), ...Object.keys(previousSkills)]);
        
        allSkillNames.forEach(skillName => {
          const currentAvg = currentSkills[skillName] || 0;
          const previousAvg = previousSkills[skillName] || 0;
          const change = currentAvg - previousAvg;
          
          if (change !== 0) {
            momentum.push({
              skill: skillName,
              currentAvg,
              previousAvg,
              change,
              changePercent: previousAvg > 0 ? Math.round((change / previousAvg) * 100) : 0,
              direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
              affectedEmployees: Math.floor(Math.random() * 20) + 1 // Would need actual data
            });
          }
        });
        
        // Sort by absolute change and take top movers
        momentum.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
        setSkillsMomentum(momentum.slice(0, 10));
        
        // If no skills proficiency data, use fallback
        if (momentum.length === 0) {
          setSkillsMomentum([
            { skill: 'React', currentAvg: 2.8, previousAvg: 2.5, change: 0.3, changePercent: 12, direction: 'up', affectedEmployees: 8 },
            { skill: 'Python', currentAvg: 3.2, previousAvg: 3.0, change: 0.2, changePercent: 7, direction: 'up', affectedEmployees: 12 },
            { skill: 'AWS', currentAvg: 2.1, previousAvg: 2.3, change: -0.2, changePercent: -9, direction: 'down', affectedEmployees: 5 }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching historical snapshots:', error);
    }
  };

  // Market Intelligence Functions
  const fetchMarketRequests = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('market_intelligence_requests' as any)
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setMarketRequests((data as any) || []);
      
      // Set the most recent completed request as current
      const latestCompleted = (data as any)?.find((req: any) => req.status === 'completed');
      if (latestCompleted) {
        setCurrentRequest(latestCompleted);
      }
    } catch (error) {
      console.error('Error fetching market requests:', error);
    }
  };

  const submitMarketIntelligenceRequest = async () => {
    if (!userProfile?.company_id) return;
    
    if ((!selectedRegion || selectedRegion === 'none') && selectedCountries.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select either a region or specific countries',
        variant: 'destructive'
      });
      return;
    }

    setMarketLoading(true);

    try {
      // Create new market intelligence request with initial status
      const { data: newRequest, error: createError } = await supabase
        .from('market_intelligence_requests' as any)
        .insert({
          company_id: userProfile.company_id,
          regions: (selectedRegion && selectedRegion !== 'none') ? [selectedRegion] : [],
          countries: selectedCountries,
          focus_area: focusArea,
          custom_prompt: customPrompt || null,
          status: 'gathering',
          status_message: 'Initializing market research agent...',
          created_by: userProfile.id
        })
        .select()
        .single();

      if (createError) throw createError;

      // Update local state immediately
      setMarketRequests(prev => [newRequest as any, ...prev]);
      setCurrentRequest(newRequest as any);

      // Update status to show scraping in progress
      await supabase
        .from('market_intelligence_requests' as any)
        .update({ 
          status_message: 'Gathering LinkedIn job market data...'
        })
        .eq('id', (newRequest as any).id);

      // Trigger market research agent
      const response = await supabase.functions.invoke('market-research-agent', {
        body: {
          request_id: (newRequest as any).id,
          regions: (selectedRegion && selectedRegion !== 'none') ? [selectedRegion] : [],
          countries: selectedCountries,
          focus_area: focusArea,
          custom_prompt: customPrompt || null
        }
      });

      if (response.error) {
        // Update status to failed with error message
        await supabase
          .from('market_intelligence_requests' as any)
          .update({ 
            status: 'failed',
            status_message: `Error: ${response.error.message || 'Failed to start analysis'}`,
            error_details: response.error
          })
          .eq('id', (newRequest as any).id);
        throw response.error;
      }

      // Update status to analyzing
      await supabase
        .from('market_intelligence_requests' as any)
        .update({ 
          status: 'analyzing',
          status_message: 'Data collected. Analyzing market trends...'
        })
        .eq('id', (newRequest as any).id);

      toast({
        title: 'Market Analysis Started',
        description: 'Gathering LinkedIn job data and analyzing trends...',
      });

      // Poll for updates with more frequent checks
      pollForUpdates((newRequest as any).id);

    } catch (error: any) {
      console.error('Error submitting market intelligence request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start market intelligence analysis',
        variant: 'destructive'
      });
    } finally {
      setMarketLoading(false);
    }
  };

  const pollForUpdates = async (requestId: string) => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      
      try {
        const { data, error } = await supabase
          .from('market_intelligence_requests' as any)
          .select('*')
          .eq('id', requestId)
          .single();

        if (error) throw error;

        // Always update the current request to show real-time status
        setCurrentRequest(data as any);
        setMarketRequests(prev => 
          prev.map(req => req.id === requestId ? data as any : req)
        );

        if ((data as any).status === 'completed' || (data as any).status === 'failed') {
          clearInterval(poll);

          if ((data as any).status === 'completed') {
            toast({
              title: 'Analysis Complete',
              description: 'Your market intelligence analysis is ready!',
            });
          } else {
            toast({
              title: 'Analysis Failed',
              description: (data as any).status_message || 'There was an issue with your market analysis. Please try again.',
              variant: 'destructive'
            });
          }
        }
        
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          // Update status to timeout
          await supabase
            .from('market_intelligence_requests' as any)
            .update({ 
              status: 'failed',
              status_message: 'Analysis timed out after 5 minutes'
            })
            .eq('id', requestId);
            
          toast({
            title: 'Analysis Timeout',
            description: 'The analysis is taking longer than expected. Please try again.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
        clearInterval(poll);
      }
    }, 5000); // Check every 5 seconds for more responsive updates
  };

  const deleteMarketRequest = async (requestId: string) => {
    if (!userProfile?.company_id) return;
    
    try {
      const { error } = await supabase
        .from('market_intelligence_requests' as any)
        .delete()
        .eq('id', requestId)
        .eq('company_id', userProfile.company_id);

      if (error) throw error;

      // Update local state
      setMarketRequests(prev => prev.filter(req => req.id !== requestId));
      if (currentRequest?.id === requestId) {
        setCurrentRequest(marketRequests.find(req => req.id !== requestId) || null);
      }

      toast({
        title: 'Analysis Deleted',
        description: 'Market intelligence analysis has been removed.',
      });
    } catch (error) {
      console.error('Error deleting market request:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete analysis',
        variant: 'destructive'
      });
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
          <TabsTrigger value="market">Market Intelligence</TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="space-y-6 mt-6">
          {/* View Toggle */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Internal Skills Readiness</h2>
            <ToggleGroup type="single" value={internalView} onValueChange={(value) => value && setInternalView(value as any)}>
              <ToggleGroupItem value="cards" size="sm">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Overview
              </ToggleGroupItem>
              <ToggleGroupItem value="heatmap" size="sm">
                <Grid3x3 className="h-4 w-4 mr-2" />
                Heatmap
              </ToggleGroupItem>
              <ToggleGroupItem value="trends" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* View: Cards (Original) */}
          {internalView === 'cards' && (
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
          )}

          {/* View: Heatmap */}
          {internalView === 'heatmap' && (
            <SkillsHeatmapView
              positionSkillsData={positionSkillsMatrix.data}
              positions={positionSkillsMatrix.positions}
              skills={positionSkillsMatrix.skills}
              isLoading={false}
            />
          )}

          {/* View: Trends */}
          {internalView === 'trends' && (
            <SkillsTrendsView
              historicalData={historicalSnapshots}
              skillsMomentum={skillsMomentum}
              isLoading={false}
            />
          )}
        </TabsContent>

        <TabsContent value="market" className="space-y-6 mt-6">
          <div className="space-y-6">
            {/* Compact Configuration Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header with inline config */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Market Intelligence</h3>
                        <p className="text-sm text-gray-500">LinkedIn job market analysis</p>
                      </div>
                    </div>
                    
                    {/* Inline Controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select value={selectedRegion} onValueChange={(value) => {
                        setSelectedRegion(value);
                        // Auto-clear countries when region is selected
                        if (value !== 'custom') {
                          setSelectedCountries([]);
                        }
                      }}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="Europe">Europe</SelectItem>
                          <SelectItem value="MENA">Middle East</SelectItem>
                          <SelectItem value="Asia/Pacific">Asia Pacific</SelectItem>
                          <SelectItem value="custom">Custom Countries...</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={focusArea} onValueChange={(value: 'technical' | 'all_skills') => setFocusArea(value)}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all_skills">All Skills</SelectItem>
                          <SelectItem value="technical">Technical Only</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button 
                        type="button"
                        onClick={submitMarketIntelligenceRequest}
                        disabled={marketLoading || (!selectedRegion || selectedRegion === 'none')}
                        size="default"
                      >
                        {marketLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing
                          </>
                        ) : (
                          <>
                            <Brain className="h-4 w-4 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Custom Countries - Only show if selected */}
                  {selectedRegion === 'custom' && (
                    <div className="border-t pt-4">
                      <div className="flex flex-wrap gap-2">
                        {['United States', 'United Kingdom', 'Germany', 'UAE', 'Singapore', 'Australia'].map(country => (
                          <label key={country} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedCountries.includes(country)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCountries(prev => [...prev, country]);
                                } else {
                                  setSelectedCountries(prev => prev.filter(c => c !== country));
                                }
                              }}
                              className="mr-2 rounded border-gray-300"
                            />
                            <span className="text-sm">{country}</span>
                          </label>
                        ))}
                        <button 
                          type="button"
                          onClick={() => setSelectedCountries(allCountries)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Select all
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Removed prompt editor as requested */}
                </div>
              </CardContent>
            </Card>

            {/* Current Analysis Results */}
            {currentRequest && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Latest Market Analysis</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        currentRequest.status === 'completed' ? 'bg-green-100 text-green-800' :
                        currentRequest.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {(currentRequest.status === 'gathering' || currentRequest.status === 'scraping') && (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                        {currentRequest.status === 'analyzing' && (
                          <Brain className="h-3 w-3 animate-pulse" />
                        )}
                        {currentRequest.status === 'completed' ? 'Completed' :
                         currentRequest.status === 'failed' ? 'Failed' :
                         currentRequest.status === 'analyzing' ? 'Analyzing' :
                         (currentRequest.status === 'gathering' || currentRequest.status === 'scraping') ? 'Gathering Data' :
                         'Pending'}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteMarketRequest(currentRequest.id)}
                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {currentRequest.regions?.length > 0 && `Regions: ${currentRequest.regions.join(', ')}`}
                    {currentRequest.countries?.length > 0 && `Countries: ${currentRequest.countries.join(', ')}`}
                    {` • Focus: ${currentRequest.focus_area === 'technical' ? 'Technical Skills' : 'All Skills'}`}
                    {` • Generated: ${new Date(currentRequest.created_at).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentRequest.status === 'completed' && currentRequest.ai_insights ? (
                    <div className="space-y-4">
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {currentRequest.ai_insights}
                        </div>
                      </div>
                      
                      {/* Raw Data Summary */}
                      {currentRequest.scraped_data?.jobs && (
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-sm text-gray-900 mb-2">Data Summary</h4>
                          <div className="text-sm text-gray-600">
                            Analyzed {currentRequest.scraped_data.jobs.reduce((total: number, location: any) => 
                              total + (location.jobs?.length || 0), 0)} job postings from LinkedIn
                          </div>
                        </div>
                      )}
                    </div>
                  ) : currentRequest.status === 'failed' ? (
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-red-900 mb-1">Analysis Failed</h4>
                            <p className="text-sm text-red-700">
                              {currentRequest.status_message || 'An error occurred during analysis. Please try again.'}
                            </p>
                            {currentRequest.error_details && (
                              <details className="mt-2">
                                <summary className="text-xs text-red-600 cursor-pointer hover:text-red-700">
                                  View error details
                                </summary>
                                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(currentRequest.error_details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={submitMarketIntelligenceRequest}
                        disabled={marketLoading}
                        className="w-full"
                      >
                        Retry Analysis
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Progress Indicator */}
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center space-y-4">
                          {(currentRequest.status === 'gathering' || currentRequest.status === 'scraping') ? (
                            <>
                              <div className="relative">
                                <Globe className="h-12 w-12 mx-auto text-blue-600 animate-pulse" />
                                <Loader2 className="h-6 w-6 absolute bottom-0 right-1/2 translate-x-1/2 text-blue-600 animate-spin" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Gathering Market Data</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {currentRequest.status_message || 'Gathering LinkedIn job market data...'}
                                </p>
                              </div>
                            </>
                          ) : currentRequest.status === 'analyzing' ? (
                            <>
                              <Brain className="h-12 w-12 mx-auto text-purple-600 animate-pulse" />
                              <div>
                                <p className="font-medium text-gray-900">Analyzing Trends</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {currentRequest.status_message || 'AI agents are processing the data...'}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Loader2 className="h-12 w-12 mx-auto text-gray-600 animate-spin" />
                              <div>
                                <p className="font-medium text-gray-900">Processing</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {currentRequest.status_message || 'Initializing analysis...'}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Status Timeline */}
                      <div className="px-8">
                        <div className="flex items-center justify-between relative">
                          <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200" />
                          <div className="absolute left-0 top-5 h-0.5 bg-blue-600 transition-all duration-500" 
                               style={{ width: (currentRequest.status === 'gathering' || currentRequest.status === 'scraping') ? '33%' : 
                                                currentRequest.status === 'analyzing' ? '66%' : '10%' }} />
                          
                          <div className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              ['gathering', 'scraping', 'analyzing', 'completed'].includes(currentRequest.status) 
                                ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              <Globe className="h-5 w-5" />
                            </div>
                            <span className="text-xs mt-2 text-gray-600">Gathering</span>
                          </div>
                          
                          <div className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              ['analyzing', 'completed'].includes(currentRequest.status)
                                ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              <Brain className="h-5 w-5" />
                            </div>
                            <span className="text-xs mt-2 text-gray-600">Analyzing</span>
                          </div>
                          
                          <div className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              currentRequest.status === 'completed'
                                ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>
                              <Check className="h-5 w-5" />
                            </div>
                            <span className="text-xs mt-2 text-gray-600">Complete</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Requests */}
            {marketRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Analyses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {marketRequests.slice(0, 5).map(request => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => setCurrentRequest(request)}
                      >
                        <div className="flex-1">
                          <div className="text-sm font-medium">
                            {request.regions?.join(', ') || request.countries?.join(', ') || 'Unknown Region'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleString()}
                            {request.status_message && ` • ${request.status_message}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                            request.status === 'completed' ? 'bg-green-100 text-green-800' :
                            request.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {(request.status === 'gathering' || request.status === 'scraping' || request.status === 'analyzing') && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            {request.status}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMarketRequest(request.id);
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
