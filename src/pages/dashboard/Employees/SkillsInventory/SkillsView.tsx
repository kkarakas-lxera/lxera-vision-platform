import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SkillSummary {
  skill_name: string;
  skill_type: string;
  employee_count: number;
  expert_count: number;
  advanced_count: number;
  intermediate_count: number;
  basic_count: number;
  avg_proficiency: number;
  employees: Array<{
    name: string;
    proficiency: number;
  }>;
}

interface SkillsViewProps {
  companyId: string;
  searchTerm: string;
}

export function SkillsView({ companyId, searchTerm }: SkillsViewProps) {
  const [skills, setSkills] = useState<SkillSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchSkillsData();
    }
  }, [companyId]);

  const fetchSkillsData = async () => {
    try {
      setLoading(true);

      const { data: employeesWithSkills } = await supabase
        .from('employees')
        .select(`
          *,
          users!inner(full_name),
          st_employee_skills_profile!left(
            extracted_skills
          )
        `)
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (!employeesWithSkills) return;

      // Aggregate skills across all employees
      const skillMap = new Map<string, SkillSummary>();

      employeesWithSkills.forEach(emp => {
        if (emp.st_employee_skills_profile?.[0]?.extracted_skills) {
          const skills = emp.st_employee_skills_profile[0].extracted_skills;
          
          skills.forEach((skill: any) => {
            if (!skill.skill_name) return;

            if (!skillMap.has(skill.skill_name)) {
              skillMap.set(skill.skill_name, {
                skill_name: skill.skill_name,
                skill_type: skill.skill_type || 'general',
                employee_count: 0,
                expert_count: 0,
                advanced_count: 0,
                intermediate_count: 0,
                basic_count: 0,
                avg_proficiency: 0,
                employees: []
              });
            }

            const skillData = skillMap.get(skill.skill_name)!;
            skillData.employee_count++;
            
            const proficiency = skill.proficiency_level || 2;
            
            if (proficiency >= 4) skillData.expert_count++;
            else if (proficiency >= 3) skillData.advanced_count++;
            else if (proficiency >= 2) skillData.intermediate_count++;
            else skillData.basic_count++;

            skillData.employees.push({
              name: emp.users.full_name,
              proficiency
            });
          });
        }
      });

      // Calculate average proficiency
      skillMap.forEach(skill => {
        const totalProficiency = skill.employees.reduce((sum, emp) => sum + emp.proficiency, 0);
        skill.avg_proficiency = skill.employee_count > 0 
          ? totalProficiency / skill.employee_count 
          : 0;
        
        // Sort employees by proficiency
        skill.employees.sort((a, b) => b.proficiency - a.proficiency);
      });

      const skillsArray = Array.from(skillMap.values())
        .sort((a, b) => b.employee_count - a.employee_count);

      setSkills(skillsArray);
    } catch (error) {
      console.error('Error fetching skills data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter(skill =>
    skill.skill_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'leadership': return 'bg-purple-100 text-purple-800';
      case 'soft': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-20 animate-pulse bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedSkill && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">
                {selectedSkill} - Skill Distribution
              </h3>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedSkill(null)}
              >
                Close
              </Button>
            </div>
            
            {(() => {
              const skill = skills.find(s => s.skill_name === selectedSkill);
              if (!skill) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{skill.expert_count}</div>
                      <div className="text-sm text-muted-foreground">Expert</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{skill.advanced_count}</div>
                      <div className="text-sm text-muted-foreground">Advanced</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{skill.intermediate_count}</div>
                      <div className="text-sm text-muted-foreground">Intermediate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{skill.basic_count}</div>
                      <div className="text-sm text-muted-foreground">Basic</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">People with this skill:</h4>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {skill.employees.map((emp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                          <span className="text-sm">{emp.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {emp.proficiency >= 4 ? 'Expert' :
                             emp.proficiency >= 3 ? 'Advanced' :
                             emp.proficiency >= 2 ? 'Intermediate' : 'Basic'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No skills found matching your search
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <Card 
              key={skill.skill_name}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedSkill(skill.skill_name)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{skill.skill_name}</h3>
                    <Badge className={`text-xs mt-1 ${getCategoryColor(skill.skill_type)}`}>
                      {skill.skill_type}
                    </Badge>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Employees</span>
                    <span className="font-medium flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {skill.employee_count}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Avg Proficiency</span>
                      <span className="font-medium">{skill.avg_proficiency.toFixed(1)}/5</span>
                    </div>
                    <Progress 
                      value={(skill.avg_proficiency / 5) * 100} 
                      className="h-2"
                    />
                  </div>

                  <div className="flex gap-1 text-xs">
                    {skill.expert_count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {skill.expert_count} Expert
                      </Badge>
                    )}
                    {skill.advanced_count > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {skill.advanced_count} Adv
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}