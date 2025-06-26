import React, { useState, useEffect } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
  // Form state
  const [positionCode, setPositionCode] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [positionLevel, setPositionLevel] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<SkillRequirement[]>([]);

  const resetForm = () => {
    setPositionCode('');
    setPositionTitle('');
    setPositionLevel('');
    setDepartment('');
    setDescription('');
    setRequiredSkills([]);
  };

  const generateDescription = async () => {
    if (!positionTitle || isGeneratingDescription) return;

    setIsGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-position-description', {
        body: {
          position_title: positionTitle,
          position_level: positionLevel,
          department: department
        }
      });

      if (error) throw error;

      if (data.description) {
        setDescription(data.description);
        toast.success('Description generated successfully! You can edit it as needed.');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Auto-generate description when title, level, and department are filled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (positionTitle && 
          (positionLevel || department) && 
          !description && 
          !isGeneratingDescription) {
        generateDescription();
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [positionTitle, positionLevel, department]);

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
    }
  };

  const removeSkill = (skillId: string) => {
    setRequiredSkills(requiredSkills.filter(s => s.skill_id !== skillId));
  };

  const updateSkillProficiency = (skillId: string, isRequired: boolean, proficiencyLevel: string) => {
    if (isRequired) {
      setRequiredSkills(requiredSkills.map(s => 
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
        description: description || null,
        required_skills: requiredSkills as any[],
        nice_to_have_skills: [],
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

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description" className="text-foreground">Position Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateDescription}
                  disabled={!positionTitle || isGeneratingDescription}
                  className="flex items-center gap-2"
                >
                  <Sparkles className={`h-4 w-4 ${isGeneratingDescription ? 'animate-spin' : ''}`} />
                  {isGeneratingDescription ? 'Generating...' : 'Generate with AI'}
                </Button>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isGeneratingDescription ? "AI is generating description..." : "Describe the role, responsibilities, and key objectives..."}
                rows={4}
                disabled={isGeneratingDescription}
                className="text-foreground"
              />
              {isGeneratingDescription && (
                <p className="text-sm text-blue-600 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  AI is analyzing your position details...
                </p>
              )}
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
                          onClick={() => removeSkill(skill.skill_id)}
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