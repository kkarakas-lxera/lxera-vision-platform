
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SkillBadge } from '@/components/dashboard/shared/SkillBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
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

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchSkillsOverview();
    }
  }, [userProfile?.company_id]);

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

  // Proactively load trends data for demo purposes
  useEffect(() => {
    if (userProfile?.company_id && historicalSnapshots.length === 0) {
      fetchHistoricalSnapshots();
    }
  }, [userProfile?.company_id]);

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

      // If no department summaries exist, provide mock data for demo
      const finalDeptSummaries = effectiveDeptSummaries.length > 0 ? effectiveDeptSummaries : [
        {
          department: 'Product',
          total_employees: 3,
          analyzed_employees: 3,
          avg_skills_match: 82,
          critical_gaps: 12,
          moderate_gaps: 8,
          exceeding_targets: 0
        },
        {
          department: 'Engineering',
          total_employees: 15,
          analyzed_employees: 13,
          avg_skills_match: 74,
          critical_gaps: 8,
          moderate_gaps: 15,
          exceeding_targets: 2
        },
        {
          department: 'Marketing',
          total_employees: 8,
          analyzed_employees: 7,
          avg_skills_match: 91,
          critical_gaps: 3,
          moderate_gaps: 5,
          exceeding_targets: 1
        },
        {
          department: 'Sales',
          total_employees: 12,
          analyzed_employees: 11,
          avg_skills_match: 86,
          critical_gaps: 2,
          moderate_gaps: 7,
          exceeding_targets: 3
        },
        {
          department: 'Operations',
          total_employees: 6,
          analyzed_employees: 5,
          avg_skills_match: 68,
          critical_gaps: 14,
          moderate_gaps: 12,
          exceeding_targets: 0
        }
      ];

      setDepartmentSummaries(finalDeptSummaries);

      // Fetch critical skills gaps
      const { data: gapsData } = await supabase
        .from('v_critical_skills_gaps' as any)
        .select('*')
        .eq('company_id', userProfile.company_id)
        .limit(10);

      // If no gaps data exists or is insufficient, provide mock data for demo
      let finalGaps: CriticalSkillsGap[] = [];
      if (gapsData && gapsData.length > 0) {
        finalGaps = gapsData.map((gap: any) => ({
          skill_name: gap.skill_name || 'Unknown Skill',
          gap_severity: parseGapSeverity(gap.gap_severity || 'moderate'),
          department: gap.department || 'Unknown',
          company_id: gap.company_id || userProfile.company_id,
          employees_with_gap: Number(gap.employees_with_gap) || 0,
          avg_proficiency: Number(gap.avg_proficiency) || 0,
          critical_count: Number(gap.critical_count) || 0,
          moderate_count: Number(gap.moderate_count) || 0
        }));
      } else {
        // Mock critical skills gaps for demo
        finalGaps = [
          {
            skill_name: 'Testing and Quality Assurance Automation',
            gap_severity: 'critical',
            department: 'Product',
            company_id: userProfile.company_id,
            employees_with_gap: 1,
            avg_proficiency: 1.2,
            critical_count: 1,
            moderate_count: 0
          },
          {
            skill_name: 'Advanced React Performance Optimization',
            gap_severity: 'critical',
            department: 'Engineering',
            company_id: userProfile.company_id,
            employees_with_gap: 5,
            avg_proficiency: 1.8,
            critical_count: 3,
            moderate_count: 2
          },
          {
            skill_name: 'Data Analytics and Visualization',
            gap_severity: 'moderate',
            department: 'Marketing',
            company_id: userProfile.company_id,
            employees_with_gap: 3,
            avg_proficiency: 2.1,
            critical_count: 0,
            moderate_count: 3
          },
          {
            skill_name: 'Cloud Infrastructure Management (AWS)',
            gap_severity: 'critical',
            department: 'Operations',
            company_id: userProfile.company_id,
            employees_with_gap: 4,
            avg_proficiency: 1.5,
            critical_count: 2,
            moderate_count: 2
          },
          {
            skill_name: 'Machine Learning Pipeline Development',
            gap_severity: 'moderate',
            department: 'Engineering',
            company_id: userProfile.company_id,
            employees_with_gap: 7,
            avg_proficiency: 2.3,
            critical_count: 1,
            moderate_count: 6
          },
          {
            skill_name: 'Advanced Sales CRM Integration',
            gap_severity: 'moderate',
            department: 'Sales',
            company_id: userProfile.company_id,
            employees_with_gap: 2,
            avg_proficiency: 2.4,
            critical_count: 0,
            moderate_count: 2
          }
        ];
      }
      
      setCriticalGaps(finalGaps);

      // Calculate overall stats using finalDeptSummaries
      const totalEmployees = finalDeptSummaries.reduce((sum, dept) => sum + (Number(dept.total_employees) || 0), 0) || 0;
      const analyzedEmployees = finalDeptSummaries.reduce((sum, dept) => sum + (Number(dept.analyzed_employees) || 0), 0) || 0;
      
      // Calculate weighted average, only including departments with analyzed employees
      let totalWeightedMatch = 0;
      let totalAnalyzedForAverage = 0;
      
      finalDeptSummaries.forEach(dept => {
        if (dept.avg_skills_match !== null && dept.analyzed_employees > 0) {
          totalWeightedMatch += Number(dept.avg_skills_match) * Number(dept.analyzed_employees);
          totalAnalyzedForAverage += Number(dept.analyzed_employees);
        }
      });
      
      const avgMatch = totalAnalyzedForAverage > 0 
        ? totalWeightedMatch / totalAnalyzedForAverage
        : 0;
      
      // Sum up all skill gaps from department data
      const totalCriticalGaps = finalDeptSummaries.reduce((sum, dept) => sum + (Number(dept.critical_gaps) || 0), 0) || 0;
      const totalModerateGaps = finalDeptSummaries.reduce((sum, dept) => sum + (Number(dept.moderate_gaps) || 0), 0) || 0;

      setOverallStats({
        totalEmployees,
        analyzedEmployees,
        avgSkillsMatch: Math.round(avgMatch || 0),
        totalCriticalGaps,
        totalModerateGaps,
        departmentsCount: finalDeptSummaries.length || 0
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

      // If no historical data exists, generate mock data for demo
      const finalSnapshots = formattedSnapshots.length > 0 ? formattedSnapshots : (() => {
        const mockSnapshots = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - (i * 7)); // Weekly snapshots for last 12 weeks
          
          const baseScore = 75 + Math.sin((11 - i) / 3) * 8 + (Math.random() - 0.5) * 6;
          mockSnapshots.push({
            date: date.toISOString().split('T')[0],
            organization: Math.round(Math.max(0, Math.min(100, baseScore))),
            departments: {
              'Engineering': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 15))),
              'Product': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 12))),
              'Marketing': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 10))),
              'Sales': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 8))),
              'Operations': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 12)))
            },
            positions: {
              'Software Engineer': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 18))),
              'Product Manager': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 14))),
              'Data Analyst': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 16))),
              'UX Designer': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 12))),
              'Marketing Specialist': Math.round(Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 10)))
            },
            critical_gaps: Math.max(0, Math.round(20 - (11 - i) * 1.5 + (Math.random() - 0.5) * 8)),
            moderate_gaps: Math.max(0, Math.round(35 - (11 - i) * 2 + (Math.random() - 0.5) * 10)),
            skills_proficiency: {
              'React': Math.max(0, Math.min(3, 2.2 + (11 - i) * 0.05 + (Math.random() - 0.5) * 0.3)),
              'Python': Math.max(0, Math.min(3, 2.8 + (11 - i) * 0.03 + (Math.random() - 0.5) * 0.2)),
              'TypeScript': Math.max(0, Math.min(3, 2.0 + (11 - i) * 0.07 + (Math.random() - 0.5) * 0.4)),
              'AWS': Math.max(0, Math.min(3, 2.4 - (11 - i) * 0.02 + (Math.random() - 0.5) * 0.3)),
              'Docker': Math.max(0, Math.min(3, 2.6 - (11 - i) * 0.03 + (Math.random() - 0.5) * 0.3)),
              'Machine Learning': Math.max(0, Math.min(3, 1.5 + (11 - i) * 0.08 + (Math.random() - 0.5) * 0.4))
            }
          });
        }
        return mockSnapshots;
      })();

      setHistoricalSnapshots(finalSnapshots);

      // Calculate momentum (compare last 2 snapshots)
      if (finalSnapshots.length >= 2) {
        const current = finalSnapshots[finalSnapshots.length - 1];
        const previous = finalSnapshots[finalSnapshots.length - 2];
        
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
        
        // If no skills proficiency data, use comprehensive fallback
        if (momentum.length === 0) {
          setSkillsMomentum([
            { skill: 'React', currentAvg: 2.8, previousAvg: 2.5, change: 0.3, changePercent: 12, direction: 'up', affectedEmployees: 8 },
            { skill: 'Python', currentAvg: 3.2, previousAvg: 3.0, change: 0.2, changePercent: 7, direction: 'up', affectedEmployees: 12 },
            { skill: 'TypeScript', currentAvg: 2.9, previousAvg: 2.6, change: 0.3, changePercent: 12, direction: 'up', affectedEmployees: 10 },
            { skill: 'Machine Learning', currentAvg: 2.1, previousAvg: 1.8, change: 0.3, changePercent: 17, direction: 'up', affectedEmployees: 6 },
            { skill: 'AWS', currentAvg: 2.1, previousAvg: 2.3, change: -0.2, changePercent: -9, direction: 'down', affectedEmployees: 5 },
            { skill: 'Docker', currentAvg: 2.4, previousAvg: 2.7, change: -0.3, changePercent: -11, direction: 'down', affectedEmployees: 7 },
            { skill: 'Data Analysis', currentAvg: 2.6, previousAvg: 2.4, change: 0.2, changePercent: 8, direction: 'up', affectedEmployees: 9 }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching historical snapshots:', error);
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
        ctaLink: "/dashboard/employees?tab=import",
        shouldBlur: true
      };
    }
    
    if (analyzedEmployeesCount === 0) {
      return {
        icon: TrendingUp,
        title: "No Skills Analyzed",
        description: "Upload CVs and run skills analysis to see your team's skill gaps.",
        ctaText: "Analyze Skills",
        ctaLink: "/dashboard/employees?tab=import",
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

      {/* Skills Content - No Tabs Needed */}
      <div className="w-full">

        <div className="space-y-6 mt-6">
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
        </div>
      </div>
    </div>
  );
}
