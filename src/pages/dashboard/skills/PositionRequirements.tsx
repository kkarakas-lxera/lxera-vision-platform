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
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface PositionRequirement {
  position_id: string;
  position_title: string;
  position_code: string;
  total_employees: number;
  analyzed_employees: number;
  required_skills: Array<{
    skill_id?: string;
    skill_name: string;
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

      // Get analyzed employees with their skills
      const { data: skillsProfiles } = await supabase
        .from('st_employee_skills_profile')
        .select(`
          employee_id,
          extracted_skills,
          employees!inner(
            id,
            current_position_id,
            company_id
          )
        `)
        .eq('employees.company_id', userProfile.company_id)
        .not('analyzed_at', 'is', null);

      // Process each position
      const positionRequirements = positionsData.map(position => {
        // Get employees in this position
        const positionEmployees = employees?.filter(e => e.current_position_id === position.id) || [];
        const analyzedInPosition = skillsProfiles?.filter(
          sp => sp.employees.current_position_id === position.id
        ) || [];

        // Extract required skills
        const requiredSkills = position.required_skills || [];
        
        // Calculate skill coverage
        const skillCoverage = requiredSkills.map(reqSkill => {
          const skillName = reqSkill.skill_name;
          
          // Count how many analyzed employees have this skill
          const employeesWithSkill = analyzedInPosition.filter(profile => {
            const skills = profile.extracted_skills || [];
            return skills.some(skill => {
              if (typeof skill === 'string') {
                return skill.toLowerCase() === skillName.toLowerCase();
              }
              return skill?.skill_name?.toLowerCase() === skillName.toLowerCase();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/skills')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Position Requirements</h1>
          <p className="text-muted-foreground mt-1">
            Skills required by each position in your organization
          </p>
        </div>
      </div>

      {/* Positions List */}
      <div className="space-y-4">
        {positions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No positions defined yet
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate('/dashboard/positions')}
              >
                Define Positions
              </Button>
            </CardContent>
          </Card>
        ) : (
          positions.map((position) => {
            const isExpanded = expandedPositions.has(position.position_id);
            const analyzedPercentage = position.total_employees > 0
              ? Math.round((position.analyzed_employees / position.total_employees) * 100)
              : 0;

            return (
              <Card key={position.position_id}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => togglePosition(position.position_id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {position.position_title}
                        <Badge variant="outline" className="ml-2">
                          {position.total_employees} employees
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {position.analyzed_employees} of {position.total_employees} analyzed
                        {analyzedPercentage > 0 && ` (${analyzedPercentage}%)`}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    {position.analyzed_employees === 0 ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No employees in this position have been analyzed yet. 
                          Skills coverage data will be available after CV analysis.
                        </AlertDescription>
                      </Alert>
                    ) : position.required_skills.length === 0 ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No required skills defined for this position.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-muted-foreground">
                          Required Skills Coverage ({position.analyzed_employees} employees analyzed):
                        </div>
                        <div className="space-y-3">
                          {position.skill_coverage.map((skill, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{skill.skill_name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    {skill.employees_with_skill} of {position.analyzed_employees} have this
                                  </span>
                                  <Badge variant={getSkillCoverageBadgeVariant(skill.coverage_percentage)}>
                                    {skill.coverage_percentage}%
                                  </Badge>
                                </div>
                              </div>
                              <Progress value={skill.coverage_percentage} className="h-2" />
                            </div>
                          ))}
                        </div>

                        {position.analyzed_employees < position.total_employees && (
                          <Alert className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {position.total_employees - position.analyzed_employees} employees 
                              not analyzed - data may not be representative
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/skills')}
        >
          Back to Overview
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/positions')}
          >
            <Target className="h-4 w-4 mr-2" />
            Edit Requirements
          </Button>
          <Button
            onClick={() => navigate('/dashboard/skills/report')}
          >
            Export Report
          </Button>
        </div>
      </div>
    </div>
  );
}