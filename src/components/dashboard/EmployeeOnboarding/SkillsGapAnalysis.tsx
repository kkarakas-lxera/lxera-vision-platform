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

interface EmployeeStatus {
  id: string;
  name: string;
  email: string;
  position: string;
  cv_status: 'missing' | 'uploaded' | 'analyzed' | 'failed';
  skills_analysis: 'pending' | 'completed' | 'failed';
  course_generation: 'pending' | 'in_progress' | 'completed' | 'failed';
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
    if (userProfile?.company_id) {
      fetchRealAnalysis();
    }
  }, [employees, userProfile?.company_id]);

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
          current_position_id,
          skills_gap_analysis
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

      // Process data into position analyses
      const analyses: PositionAnalysis[] = (positions || []).map(position => {
        // Find employees for this position using current_position_id
        const positionEmployees = employees.filter(emp => {
          return employeePositionMap.get(emp.id) === position.id;
        });
        
        // Calculate skill gaps based on required skills and employee profiles
        const skillGapMap = new Map<string, SkillGap>();
        const requiredSkills = position.required_skills || [];
        
        // For each required skill, check how many employees have it
        requiredSkills.forEach((reqSkill: any) => {
          let employeesWithSkill = 0;
          let employeesMissingSkill = 0;
          let totalEmployeesWithProfiles = 0;
          
          positionEmployees.forEach(emp => {
            const profile = profileMap.get(emp.id);
            if (profile && profile.extracted_skills && Array.isArray(profile.extracted_skills)) {
              totalEmployeesWithProfiles++;
              
              const hasSkill = profile.extracted_skills.some((skill: any) => {
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
                const skillLevel = matchingSkill?.proficiency_level || 0;
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
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analysis Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Skills Gap Analysis
              </CardTitle>
              <CardDescription>
                Real-time analysis of skill gaps between employee capabilities and position requirements
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger className="w-48">
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

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Employees Analyzed</p>
                <p className="text-2xl font-bold text-foreground">
                  {employees.filter(e => e.skills_analysis === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Avg Skills Match</p>
                <p className="text-2xl font-bold text-green-600">
                  {positionAnalyses.length > 0 
                    ? Math.round(positionAnalyses.reduce((sum, a) => sum + a.avg_gap_score, 0) / positionAnalyses.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Critical Gaps</p>
                <p className="text-2xl font-bold text-red-600">
                  {positionAnalyses.reduce((sum, a) => sum + a.critical_gaps, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Ready for Courses</p>
                <p className="text-2xl font-bold text-purple-600">
                  {employees.filter(e => e.skills_analysis === 'completed' && e.course_generation === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Position-by-Position Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Position Analysis</CardTitle>
          <CardDescription>
            Real skills gap breakdown by job position
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAnalyses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No position analysis available. Import employees and analyze their CVs first.
              </div>
            ) : (
              filteredAnalyses.map((analysis) => (
                <div key={analysis.position_code} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground">{analysis.position_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {analysis.total_employees} employees • Avg match: {analysis.avg_gap_score}%
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{analysis.position_code}</Badge>
                      {analysis.critical_gaps > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          {analysis.critical_gaps} critical gaps
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Progress value={analysis.avg_gap_score} className="mb-4" />

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Top Skill Gaps:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {analysis.top_gaps.slice(0, 6).map((gap, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-foreground">{gap.skill_name}</div>
                            <div className="text-xs text-muted-foreground">
                              Required: {gap.required_level}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getGapSeverityColor(gap.gap_severity)}>
                              {gap.gap_severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {gap.employees_affected} affected
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

      {/* Top Skill Gaps Across All Positions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Organization-Wide Top Skill Gaps</CardTitle>
          <CardDescription>
            Most common skill gaps affecting multiple employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topSkillGaps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No skill gap data available yet.
              </div>
            ) : (
              topSkillGaps.map((gap, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                    <div>
                      <div className="font-medium text-foreground">{gap.skill_name}</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {gap.skill_type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Employees Affected</div>
                      <div className="font-bold text-foreground">{gap.employees_affected}</div>
                    </div>
                    <Badge className={getGapSeverityColor(gap.gap_severity)}>
                      {gap.gap_severity}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}