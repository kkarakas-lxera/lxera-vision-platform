import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  AlertTriangle,
  Users,
  Target,
  ChevronDown,
  ChevronUp,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { parseRequiredSkills } from '@/utils/typeGuards';

interface PositionRequirement {
  position_id: string;
  position_title: string;
  position_code: string;
  position_description?: string;
  total_employees: number;
  analyzed_employees: number;
  required_skills: Array<{
    skill_id?: string;
    skill_name: string;
    skill_description?: string; // Future: companies can add skill-specific descriptions
    proficiency_level?: number;
  }>;
  skill_coverage: Array<{
    skill_name: string;
    employees_with_skill: number;
    coverage_percentage: number;
  }>;
}

export default function PositionRequirements() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState<PositionRequirement[]>([]);
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userProfile?.company_id) {
      fetchPositionRequirements();
    }
  }, [userProfile]);

  const fetchPositionRequirements = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Get all positions with their requirements
      const { data: positionsData } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('company_id', userProfile.company_id);

      if (!positionsData) {
        setLoading(false);
        return;
      }

      // Get all employees
      const { data: employees } = await supabase
        .from('employees')
        .select('id, current_position_id')
        .eq('company_id', userProfile.company_id);

      // Get analyzed employees with their skills from unified structure
      const { data: employeesWithSkills } = await supabase
        .from('employees')
        .select(`
          id,
          current_position_id,
          employee_skills(
            skill_name,
            proficiency,
            source
          )
        `)
        .eq('company_id', userProfile.company_id)
        .not('skills_last_analyzed', 'is', null);

      // Process each position
      const positionRequirements = positionsData.map(position => {
        // Get employees in this position
        const positionEmployees = employees?.filter(e => e.current_position_id === position.id) || [];
        const analyzedInPosition = employeesWithSkills?.filter(
          emp => emp.current_position_id === position.id
        ) || [];

        // Extract required skills using type guard
        const requiredSkills = parseRequiredSkills(position.required_skills);
        
        // Calculate skill coverage
        const skillCoverage = requiredSkills.map(reqSkill => {
          const skillName = reqSkill.skill_name;
          
          // Count how many analyzed employees have this skill with adequate proficiency
          const employeesWithSkill = analyzedInPosition.filter(employee => {
            const skills = employee.employee_skills || [];
            return skills.some((skill: any) => {
              // Check if skill name matches AND proficiency is at least 1 (not 0)
              return skill?.skill_name?.toLowerCase() === skillName.toLowerCase() && 
                     skill?.proficiency > 0;
            });
          }).length;

          const coveragePercentage = analyzedInPosition.length > 0
            ? Math.round((employeesWithSkill / analyzedInPosition.length) * 100)
            : 0;

          return {
            skill_name: skillName,
            employees_with_skill: employeesWithSkill,
            coverage_percentage: coveragePercentage
          };
        });

        return {
          position_id: position.id,
          position_title: position.position_title,
          position_code: position.position_code || position.position_title,
          position_description: position.description,
          total_employees: positionEmployees.length,
          analyzed_employees: analyzedInPosition.length,
          required_skills: requiredSkills,
          skill_coverage: skillCoverage
        };
      });

      // Sort by number of employees (descending)
      positionRequirements.sort((a, b) => b.total_employees - a.total_employees);

      setPositions(positionRequirements);
    } catch (error) {
      console.error('Error fetching position requirements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load position requirements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePosition = (positionId: string) => {
    const newExpanded = new Set(expandedPositions);
    if (newExpanded.has(positionId)) {
      newExpanded.delete(positionId);
    } else {
      newExpanded.add(positionId);
    }
    setExpandedPositions(newExpanded);
  };

  const getSkillCoverageBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 50) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Header with Summary */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard/skills')}
              className="h-7 w-7 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Position Requirements</h1>
              <p className="text-sm text-muted-foreground">Skills coverage by role</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Positions</div>
              <div className="text-lg font-semibold">{positions.length}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total People</div>
              <div className="text-lg font-semibold">{positions.reduce((sum, p) => sum + p.total_employees, 0)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Analyzed</div>
              <div className="text-lg font-semibold">{positions.reduce((sum, p) => sum + p.analyzed_employees, 0)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Positions Grid */}
      {positions.length === 0 ? (
        <div className="bg-card rounded-lg border p-8 text-center">
          <Target className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-3">No positions defined yet</p>
          <Button
            size="sm"
            onClick={() => navigate('/dashboard/positions')}
          >
            Define Positions
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {positions.map((position) => {
            const isExpanded = expandedPositions.has(position.position_id);
            const analyzedPercentage = position.total_employees > 0
              ? Math.round((position.analyzed_employees / position.total_employees) * 100)
              : 0;
            
            const avgCoverage = position.skill_coverage.length > 0
              ? Math.round(position.skill_coverage.reduce((sum, skill) => sum + skill.coverage_percentage, 0) / position.skill_coverage.length)
              : 0;
            
            const criticalSkills = position.skill_coverage.filter(skill => skill.coverage_percentage < 50).length;
            const goodSkills = position.skill_coverage.filter(skill => skill.coverage_percentage >= 80).length;

            return (
              <div key={position.position_id} className="bg-card rounded-lg border p-4">
                {/* Position Header */}
                <div 
                  className="cursor-pointer"
                  onClick={() => togglePosition(position.position_id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{position.position_title}</span>
                      <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                        {position.total_employees} people
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Inline Stats */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      {position.analyzed_employees > 0 ? (
                        <>
                          <div className="text-center">
                            <div className="text-sm font-bold">{analyzedPercentage}%</div>
                            <div className="text-xs text-muted-foreground">Analyzed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold">{position.required_skills.length}</div>
                            <div className="text-xs text-muted-foreground">Skills Required</div>
                          </div>
                          {criticalSkills > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {criticalSkills} gaps
                            </Badge>
                          )}
                          {goodSkills === position.required_skills.length && position.required_skills.length > 0 && (
                            <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Full coverage
                            </Badge>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm text-muted-foreground">No skills data yet</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Progress 
                        value={analyzedPercentage} 
                        className="w-20 h-2"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        {position.analyzed_employees}/{position.total_employees} people
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Skills Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/50">
                    {position.analyzed_employees === 0 ? (
                      <div className="text-center py-4">
                        <AlertTriangle className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No analyzed employees yet
                        </p>
                      </div>
                    ) : position.required_skills.length === 0 ? (
                      <div className="text-center py-4">
                        <AlertTriangle className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No required skills defined
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground mb-3">
                          Skills Coverage ({position.analyzed_employees} employees):
                        </div>
                        {position.skill_coverage.map((skill, index) => (
                          <div key={index} className="flex items-center justify-between border-b border-border/30 pb-2 last:border-b-0">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="font-medium">{skill.skill_name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {skill.employees_with_skill}/{position.analyzed_employees}
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    skill.coverage_percentage >= 80 ? 'bg-green-100 text-green-700' :
                                    skill.coverage_percentage >= 50 ? 'bg-orange-100 text-orange-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {skill.coverage_percentage}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 rounded-full ${
                                    skill.coverage_percentage >= 80 ? 'bg-green-500' :
                                    skill.coverage_percentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${skill.coverage_percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {position.analyzed_employees < position.total_employees && (
                          <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                            <AlertTriangle className="h-3 w-3 inline mr-1 text-orange-600" />
                            <span className="text-orange-700">
                              {position.total_employees - position.analyzed_employees} employees not analyzed
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Compact Actions */}
      <div className="flex justify-center gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard/positions')}
          className="h-8 px-3 text-xs"
        >
          <Target className="h-3 w-3 mr-1" />
          Edit Requirements
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dashboard/skills/report')}
          className="h-8 px-3 text-xs"
        >
          <FileText className="h-3 w-3 mr-1" />
          Export Report
        </Button>
      </div>
    </div>
  );
}
