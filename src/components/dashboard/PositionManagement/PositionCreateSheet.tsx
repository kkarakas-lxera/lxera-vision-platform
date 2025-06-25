import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillSearch } from '@/components/admin/SkillsManagement/SkillSearch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SkillSearchResult } from '@/types/skills';

interface PositionCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface SkillRequirement {
  skill_id: string;
  skill_name: string;
  skill_type: string;
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  is_mandatory: boolean;
}

export function PositionCreateSheet({ open, onOpenChange, onSuccess }: PositionCreateSheetProps) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [positionCode, setPositionCode] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [positionLevel, setPositionLevel] = useState('');
  const [department, setDepartment] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<SkillRequirement[]>([]);
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<SkillRequirement[]>([]);

  const resetForm = () => {
    setPositionCode('');
    setPositionTitle('');
    setPositionLevel('');
    setDepartment('');
    setRequiredSkills([]);
    setNiceToHaveSkills([]);
  };

  const handleSkillSelect = (skill: SkillSearchResult, isRequired: boolean, proficiencyLevel: string = 'intermediate') => {
    const skillRequirement: SkillRequirement = {
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      skill_type: skill.skill_type,
      proficiency_level: proficiencyLevel as any,
      is_mandatory: isRequired
    };

    if (isRequired) {
      // Check if skill already exists in required skills
      if (!requiredSkills.find(s => s.skill_id === skill.skill_id)) {
        setRequiredSkills([...requiredSkills, skillRequirement]);
      }
    } else {
      // Check if skill already exists in nice-to-have skills
      if (!niceToHaveSkills.find(s => s.skill_id === skill.skill_id)) {
        setNiceToHaveSkills([...niceToHaveSkills, skillRequirement]);
      }
    }
  };

  const removeSkill = (skillId: string, isRequired: boolean) => {
    if (isRequired) {
      setRequiredSkills(requiredSkills.filter(s => s.skill_id !== skillId));
    } else {
      setNiceToHaveSkills(niceToHaveSkills.filter(s => s.skill_id !== skillId));
    }
  };

  const updateSkillProficiency = (skillId: string, isRequired: boolean, proficiencyLevel: string) => {
    if (isRequired) {
      setRequiredSkills(requiredSkills.map(s => 
        s.skill_id === skillId ? { ...s, proficiency_level: proficiencyLevel as any } : s
      ));
    } else {
      setNiceToHaveSkills(niceToHaveSkills.map(s => 
        s.skill_id === skillId ? { ...s, proficiency_level: proficiencyLevel as any } : s
      ));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.company_id) {
      toast.error('Company information not found');
      return;
    }

    if (!positionCode.trim() || !positionTitle.trim()) {
      toast.error('Position code and title are required');
      return;
    }

    setLoading(true);

    try {
      const positionData = {
        company_id: userProfile.company_id,
        position_code: positionCode.trim(),
        position_title: positionTitle.trim(),
        position_level: positionLevel || null,
        department: department || null,
        required_skills: requiredSkills as any[],
        nice_to_have_skills: niceToHaveSkills as any[],
        is_template: true,
        created_by: userProfile.id
      };

      const { error } = await supabase
        .from('st_company_positions')
        .insert(positionData);

      if (error) throw error;

      toast.success('Position created successfully');
      resetForm();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating position:', error);
      if (error.message?.includes('duplicate key')) {
        toast.error('A position with this code already exists');
      } else {
        toast.error('Failed to create position');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:w-[800px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground">Create New Position</SheetTitle>
          <SheetDescription>
            Define a new job position with skill requirements for your organization.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="positionCode" className="text-foreground">Position Code *</Label>
                <Input
                  id="positionCode"
                  value={positionCode}
                  onChange={(e) => setPositionCode(e.target.value)}
                  placeholder="e.g., DEV-001, PM-002"
                  className="text-foreground"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="positionLevel" className="text-foreground">Level</Label>
                <Select value={positionLevel} onValueChange={setPositionLevel}>
                  <SelectTrigger className="text-foreground">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior</SelectItem>
                    <SelectItem value="mid">Mid-Level</SelectItem>
                    <SelectItem value="senior">Senior</SelectItem>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="principal">Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="positionTitle" className="text-foreground">Position Title *</Label>
              <Input
                id="positionTitle"
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Developer"
                className="text-foreground"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-foreground">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Engineering, Marketing"
                className="text-foreground"
              />
            </div>
          </div>

          {/* Required Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Required Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkillSearch
                onSkillSelect={(skill) => handleSkillSelect(skill, true)}
                placeholder="Search and add required skills..."
              />
              
              {requiredSkills.length > 0 && (
                <div className="space-y-2">
                  {requiredSkills.map((skill) => (
                    <div key={skill.skill_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-red-50 text-red-700">
                          {skill.skill_name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {skill.skill_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={skill.proficiency_level}
                          onValueChange={(value) => updateSkillProficiency(skill.skill_id, true, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSkill(skill.skill_id, true)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nice to Have Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Nice to Have Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkillSearch
                onSkillSelect={(skill) => handleSkillSelect(skill, false)}
                placeholder="Search and add nice-to-have skills..."
              />
              
              {niceToHaveSkills.length > 0 && (
                <div className="space-y-2">
                  {niceToHaveSkills.map((skill) => (
                    <div key={skill.skill_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {skill.skill_name}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {skill.skill_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={skill.proficiency_level}
                          onValueChange={(value) => updateSkillProficiency(skill.skill_id, false, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="expert">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSkill(skill.skill_id, false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Position'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}