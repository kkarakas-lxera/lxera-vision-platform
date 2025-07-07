import React, { useState, useEffect } from 'react';
import { BarChart3, Target, TrendingUp, AlertTriangle, CheckCircle, User, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RequiredSkill {
  skill_name: string;
  skill_id?: string;
  required_level?: number;
}

interface ExtractedSkill {
  skill_name: string;
  proficiency_level?: number;
}

interface EmployeeStatus {
  id: string;
  name: string;
  email: string;
  position: string;
  cv_status: 'missing' | 'uploaded' | 'analyzed' | 'failed';
  skills_analysis: 'pending' | 'completed' | 'failed';
  gap_score?: number;
}

interface SkillGap {
  skill_name: string;
  skill_type: string;
  required_level: string;
  current_level: string | null;
  gap_severity: 'critical' | 'important' | 'minor';
  employees_affected: number;
}

interface PositionAnalysis {
  position_title: string;
  position_code: string;
  total_employees: number;
  avg_gap_score: number;
  critical_gaps: number;
  top_gaps: SkillGap[];
}

interface SkillsGapAnalysisProps {
  employees: EmployeeStatus[];
}

export function SkillsGapAnalysis({ employees }: SkillsGapAnalysisProps) {
  const { userProfile } = useAuth();
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [positionAnalyses, setPositionAnalyses] = useState<PositionAnalysis[]>([]);
  const [topSkillGaps, setTopSkillGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.company_id && employees.length > 0) {
      fetchRealAnalysis();
    }
  }, [employees.length, userProfile?.company_id]);

  const fetchRealAnalysis = async () => {
    if (!userProfile?.company_id) return;

    setLoading(true);
    try {
      // Get company positions with requirements
      const { data: positions, error: positionsError } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('company_id', userProfile.company_id);

      if (positionsError) throw positionsError;

      // Get employee skills profiles with extracted skills
      const { data: skillProfiles, error: profilesError } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          employee_id,
          skills_match_score,
          extracted_skills,
          current_position_id
        `)
        .in('employee_id', employees.map(e => e.id));

      if (profilesError) throw profilesError;

      // Create a map of employee profiles for quick lookup
      const profileMap = new Map(
        skillProfiles?.map(p => [p.employee_id, p]) || []
      );

      // Get actual employee data with position mapping
      const { data: allEmployees } = await supabase
        .from('employees')
        .select('id, current_position_id, position')
        .eq('company_id', userProfile.company_id);

      // Create employee position map
      const employeePositionMap = new Map();
      allEmployees?.forEach(emp => {
        employeePositionMap.set(emp.id, emp.current_position_id);
      });

      // Also create a position code to ID mapping for fallback
      const positionCodeToIdMap = new Map();
      positions?.forEach(pos => {
        positionCodeToIdMap.set(pos.position_code, pos.id);
      });


      // Process data into position analyses
      const analyses: PositionAnalysis[] = (positions || []).map(position => {
        // Find employees for this position using current_position_id OR position code
        const positionEmployees = employees.filter(emp => {
          const empPositionId = employeePositionMap.get(emp.id);
          const empPositionCode = emp.position;
          
          // Match by position ID first, then fallback to position code
          return empPositionId === position.id || 
                 empPositionCode === position.position_code ||
                 positionCodeToIdMap.get(empPositionCode) === position.id;
        });
        
        
        // Calculate skill gaps based on required skills and employee profiles
        const skillGapMap = new Map<string, SkillGap>();
        const requiredSkills = position.required_skills || [];
        
        // For each required skill, check how many employees have it
        requiredSkills.forEach((reqSkill: RequiredSkill) => {
          let employeesWithSkill = 0;
          let employeesMissingSkill = 0;
          let totalEmployeesWithProfiles = 0;
          
          
          positionEmployees.forEach(emp => {
            const profile = profileMap.get(emp.id);
            if (profile && profile.extracted_skills && Array.isArray(profile.extracted_skills)) {
              totalEmployeesWithProfiles++;
              
              const hasSkill = profile.extracted_skills.some((skill: ExtractedSkill) => {
                const skillName = skill.skill_name?.toLowerCase() || '';
                const reqSkillName = reqSkill.skill_name?.toLowerCase() || '';
                
                // More precise matching
                return skillName === reqSkillName || 
                       skillName.includes(reqSkillName) ||
                       reqSkillName.includes(skillName) ||
                       // Handle variations like "React" vs "React.js"
                       (skillName.includes('react') && reqSkillName.includes('react')) ||
                       (skillName.includes('javascript') && reqSkillName.includes('javascript')) ||
                       (skillName.includes('python') && reqSkillName.includes('python')) ||
                       (skillName.includes('node') && reqSkillName.includes('node'));
              });
              
              if (hasSkill) {
                const matchingSkill = profile.extracted_skills.find((skill: any) => {
                  const skillName = skill.skill_name?.toLowerCase() || '';
                  const reqSkillName = reqSkill.skill_name?.toLowerCase() || '';
                  return skillName === reqSkillName || 
                         skillName.includes(reqSkillName) ||
                         reqSkillName.includes(skillName);
                });
                
                // Check if skill level meets requirement
                const skillLevel = (matchingSkill as any)?.proficiency_level || 0;
                const requiredLevel = reqSkill.proficiency_level || 3;
                
                if (skillLevel >= requiredLevel) {
                  employeesWithSkill++;
                } else {
                  employeesMissingSkill++;
                }
              } else {
                employeesMissingSkill++;
              }
            }
          });
          
          if (employeesMissingSkill > 0 && totalEmployeesWithProfiles > 0) {
            const severity = employeesMissingSkill > totalEmployeesWithProfiles / 2 ? 'critical' : 
                           employeesMissingSkill > totalEmployeesWithProfiles / 3 ? 'important' : 'minor';
            
            skillGapMap.set(reqSkill.skill_name, {
              skill_name: reqSkill.skill_name,
              skill_type: reqSkill.skill_type || 'technical',
              required_level: `Level ${reqSkill.proficiency_level || 3}`,
              current_level: null,
              gap_severity: severity,
              employees_affected: employeesMissingSkill
            });
          }
        });
        
        const skillGaps = Array.from(skillGapMap.values())
          .sort((a, b) => b.employees_affected - a.employees_affected);

        // Calculate average match score from actual employee data
        const employeeScores = positionEmployees
          .filter(emp => emp.skills_analysis === 'completed')
          .map(emp => {
            const profile = profileMap.get(emp.id);
            return profile?.skills_match_score || 0;
          });
        
        const avgMatchScore = employeeScores.length > 0
          ? Math.round(employeeScores.reduce((sum, score) => sum + Number(score), 0) / employeeScores.length)
          : 0;

        return {
          position_title: position.position_title,
          position_code: position.position_code,
          total_employees: positionEmployees.length,
          avg_gap_score: Math.round(avgMatchScore),
          critical_gaps: skillGaps.filter(g => g.gap_severity === 'critical').length,
          top_gaps: skillGaps.sort((a, b) => b.employees_affected - a.employees_affected).slice(0, 5)
        };
      });

      // Calculate organization-wide top skill gaps
      const allGaps = analyses.flatMap(a => a.top_gaps);
      const gapsBySkill = allGaps.reduce((acc, gap) => {
        const key = gap.skill_name;
        if (!acc[key]) {
          acc[key] = { ...gap, employees_affected: 0 };
        }
        acc[key].employees_affected += gap.employees_affected;
        return acc;
      }, {} as Record<string, SkillGap>);

      const topGaps = Object.values(gapsBySkill)
        .sort((a, b) => b.employees_affected - a.employees_affected)
        .slice(0, 10);

      setPositionAnalyses(analyses);
      setTopSkillGaps(topGaps);
    } catch (error) {
      console.error('Error fetching real analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProficiencyLevel = (level: string): number => {
    const levels: Record<string, number> = {
      'basic': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };
    return levels[level.toLowerCase()] || 0;
  };

  const determineGapSeverity = (requiredLevel: string, affected: number, total: number): 'critical' | 'important' | 'minor' => {
    const percentageAffected = (affected / total) * 100;
    const requiredProficiency = getProficiencyLevel(requiredLevel);
    
    if (requiredProficiency >= 3 && percentageAffected > 50) return 'critical';
    if (requiredProficiency >= 2 && percentageAffected > 30) return 'important';
    return 'minor';
  };

  const getGapSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredAnalyses = selectedPosition === 'all' 
    ? positionAnalyses 
    : positionAnalyses.filter(a => a.position_code === selectedPosition);
    

  const exportToCSV = () => {
    try {
      // Prepare CSV data
      const headers = ['Position', 'Employee Count', 'Avg Match %', 'Critical Gaps', 'Top Skills Gaps'];
      const rows = filteredAnalyses.map(analysis => [
        analysis.position_title,
        analysis.total_employees,
        analysis.avg_gap_score,
        analysis.critical_gaps,
        analysis.top_gaps.slice(0, 3).map(g => `${g.skill_name} (${g.employees_affected} affected)`).join('; ')
      ]);

      // Add overall skills gaps
      rows.push(['']);
      rows.push(['Organization-Wide Top Skill Gaps']);
      rows.push(['Skill Name', 'Type', 'Employees Affected', 'Severity']);
      topSkillGaps.forEach(gap => {
        rows.push([
          gap.skill_name,
          gap.skill_type.replace('_', ' '),
          gap.employees_affected,
          gap.gap_severity
        ]);
      });

      // Convert to CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skills-gap-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Skills gap report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="grid gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Overview - Compact Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Skills Gap Analysis
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time analysis of skill gaps between employee capabilities and position requirements
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center gap-1 px-2 py-1 text-xs"
              >
                <Download className="h-3 w-3" />
                Export
              </Button>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positionAnalyses.map(analysis => (
                    <SelectItem key={analysis.position_code} value={analysis.position_code}>
                      {analysis.position_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Statistics - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Analyzed</p>
                <p className="text-lg font-semibold text-foreground">
                  {employees.filter(e => e.skills_analysis === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Avg Match</p>
                <p className="text-lg font-semibold text-green-600">
                  {positionAnalyses.length > 0 
                    ? Math.round(positionAnalyses.reduce((sum, a) => sum + a.avg_gap_score, 0) / positionAnalyses.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-lg font-semibold text-red-600">
                  {positionAnalyses.reduce((sum, a) => sum + a.critical_gaps, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Positions</p>
                <p className="text-lg font-semibold text-purple-600">
                  {positionAnalyses.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position-by-Position Analysis - Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Position Analysis</CardTitle>
          <CardDescription className="text-xs">
            Skills gap breakdown by position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No position analysis available. Import employees and analyze their CVs first.
              </div>
            ) : (
              filteredAnalyses.map((analysis) => (
                <div key={analysis.position_code} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{analysis.position_title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {analysis.total_employees} employees • {analysis.avg_gap_score}% match
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs px-1 py-0">{analysis.position_code}</Badge>
                      {analysis.critical_gaps > 0 && (
                        <Badge className="bg-red-100 text-red-800 text-xs px-1 py-0">
                          {analysis.critical_gaps} critical
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Progress value={analysis.avg_gap_score} className="mb-2 h-1" />

                  <div>
                    <h4 className="text-xs font-medium text-foreground mb-1">Top Skill Gaps:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      {analysis.top_gaps.slice(0, 4).map((gap, index) => (
                        <div key={index} className="flex items-center justify-between p-1.5 border rounded text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{gap.skill_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {gap.required_level}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Badge className={`text-xs px-1 py-0 ${getGapSeverityColor(gap.gap_severity)}`}>
                              {gap.gap_severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {gap.employees_affected}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Skill Gaps Across All Positions - Compact */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Organization-Wide Top Skill Gaps</CardTitle>
          <CardDescription className="text-xs">
            Most common gaps affecting multiple employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {topSkillGaps.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No skill gap data available yet.
              </div>
            ) : (
              <div className="grid gap-2">
                {topSkillGaps.slice(0, 8).map((gap, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="text-sm font-semibold text-muted-foreground w-6">#{index + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{gap.skill_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {gap.skill_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Affected</div>
                        <div className="text-sm font-semibold text-foreground">{gap.employees_affected}</div>
                      </div>
                      <Badge className={`text-xs px-1 py-0 ${getGapSeverityColor(gap.gap_severity)}`}>
                        {gap.gap_severity}
                      </Badge>
                    </div>
                  </div>
                ))}
                {topSkillGaps.length > 8 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-muted-foreground">
                      +{topSkillGaps.length - 8} more gaps (view in export)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}