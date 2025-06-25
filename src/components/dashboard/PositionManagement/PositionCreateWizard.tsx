import React, { useState } from 'react';
import { Wand2, CheckCircle2, ChevronRight, Loader2, Bot, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { suggestPositionSkills, SuggestedSkill } from '@/services/positionSkillsSuggestion';
import { cn } from '@/lib/utils';

interface PositionCreateWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type WizardStep = 'info' | 'skills' | 'review';

export function PositionCreateWizard({ open, onOpenChange, onSuccess }: PositionCreateWizardProps) {
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('info');
  const [loading, setLoading] = useState(false);
  const [generatingSkills, setGeneratingSkills] = useState(false);
  
  // Form state
  const [positionTitle, setPositionTitle] = useState('');
  const [positionCode, setPositionCode] = useState('');
  const [department, setDepartment] = useState('');
  const [positionLevel, setPositionLevel] = useState('');
  
  // Skills state
  const [suggestedSkills, setSuggestedSkills] = useState<SuggestedSkill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [skillProficiencies, setSkillProficiencies] = useState<Record<string, string>>({});
  const [skillCategories, setSkillCategories] = useState<Record<string, 'required' | 'nice-to-have'>>({});

  const generatePositionCode = () => {
    if (positionTitle) {
      const words = positionTitle.split(' ');
      const code = words
        .map(w => w.charAt(0).toUpperCase())
        .join('') + '-' + Math.floor(Math.random() * 1000);
      setPositionCode(code);
    }
  };

  const handleGenerateSkills = async () => {
    if (!positionTitle) {
      toast.error('Please enter a position title first');
      return;
    }

    setGeneratingSkills(true);
    try {
      const result = await suggestPositionSkills(positionTitle);
      setSuggestedSkills(result.combined_skills);
      
      // Auto-select essential skills
      const essentialSkills = result.combined_skills
        .filter(s => s.category === 'essential')
        .map(s => s.skill_name);
      
      setSelectedSkills(new Set(essentialSkills));
      
      // Set default proficiencies and categories
      const proficiencies: Record<string, string> = {};
      const categories: Record<string, 'required' | 'nice-to-have'> = {};
      
      result.combined_skills.forEach(skill => {
        proficiencies[skill.skill_name] = skill.proficiency_level;
        categories[skill.skill_name] = skill.category === 'nice-to-have' ? 'nice-to-have' : 'required';
      });
      
      setSkillProficiencies(proficiencies);
      setSkillCategories(categories);
      
      toast.success(`Found ${result.total_suggestions} skill suggestions!`);
      setCurrentStep('skills');
    } catch (error) {
      console.error('Error generating skills:', error);
      toast.error('Failed to generate skill suggestions');
    } finally {
      setGeneratingSkills(false);
    }
  };

  const toggleSkillSelection = (skillName: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skillName)) {
      newSelected.delete(skillName);
    } else {
      newSelected.add(skillName);
    }
    setSelectedSkills(newSelected);
  };

  const toggleAllSkills = (select: boolean) => {
    if (select) {
      setSelectedSkills(new Set(suggestedSkills.map(s => s.skill_name)));
    } else {
      setSelectedSkills(new Set());
    }
  };

  const handleSubmit = async () => {
    if (!userProfile?.company_id) {
      toast.error('Company information not found');
      return;
    }

    setLoading(true);
    try {
      // Prepare skills data
      const requiredSkills = suggestedSkills
        .filter(skill => 
          selectedSkills.has(skill.skill_name) && 
          skillCategories[skill.skill_name] === 'required'
        )
        .map(skill => ({
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
          skill_type: skill.skill_type,
          proficiency_level: skillProficiencies[skill.skill_name] || skill.proficiency_level,
          is_mandatory: true
        }));

      const niceToHaveSkills = suggestedSkills
        .filter(skill => 
          selectedSkills.has(skill.skill_name) && 
          skillCategories[skill.skill_name] === 'nice-to-have'
        )
        .map(skill => ({
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
          skill_type: skill.skill_type,
          proficiency_level: skillProficiencies[skill.skill_name] || skill.proficiency_level,
          is_mandatory: false
        }));

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
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating position:', error);
      toast.error(error.message || 'Failed to create position');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('info');
    setPositionTitle('');
    setPositionCode('');
    setDepartment('');
    setPositionLevel('');
    setSuggestedSkills([]);
    setSelectedSkills(new Set());
    setSkillProficiencies({});
    setSkillCategories({});
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'info', label: 'Basic Info' },
      { id: 'skills', label: 'Skills' },
      { id: 'review', label: 'Review' }
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : steps.indexOf(steps.find(s => s.id === currentStep)!) > index
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              )}
            >
              {steps.indexOf(steps.find(s => s.id === currentStep)!) > index ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className="ml-2 text-sm font-medium hidden sm:inline">
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSkillBadge = (skill: SuggestedSkill) => {
    const isSelected = selectedSkills.has(skill.skill_name);
    const category = skillCategories[skill.skill_name] || 
      (skill.category === 'nice-to-have' ? 'nice-to-have' : 'required');

    return (
      <div
        key={skill.skill_name}
        className={cn(
          "p-3 border rounded-lg cursor-pointer transition-all",
          isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"
        )}
        onClick={() => toggleSkillSelection(skill.skill_name)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleSkillSelection(skill.skill_name)}
                className="h-4 w-4"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="font-medium">{skill.skill_name}</span>
              {skill.source === 'nesta' ? (
                <Badge variant="outline" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  NESTA
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <Bot className="h-3 w-3 mr-1" />
                  AI
                </Badge>
              )}
            </div>
            {skill.description && (
              <p className="text-xs text-muted-foreground ml-6">{skill.description}</p>
            )}
          </div>
          
          {isSelected && (
            <div className="flex items-center gap-2 ml-2">
              <Select
                value={skillProficiencies[skill.skill_name] || skill.proficiency_level}
                onValueChange={(value) => {
                  setSkillProficiencies({
                    ...skillProficiencies,
                    [skill.skill_name]: value
                  });
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={category}
                onValueChange={(value: 'required' | 'nice-to-have') => {
                  setSkillCategories({
                    ...skillCategories,
                    [skill.skill_name]: value
                  });
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="nice-to-have">Nice to Have</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New Position</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          {renderStepIndicator()}
          <Separator className="mb-6" />

          {currentStep === 'info' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Position Title*</Label>
                <Input
                  id="title"
                  value={positionTitle}
                  onChange={(e) => setPositionTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  AI will suggest relevant skills based on this title
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Position Code*</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="code"
                      value={positionCode}
                      onChange={(e) => setPositionCode(e.target.value)}
                      placeholder="e.g., SFD-001"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generatePositionCode}
                      disabled={!positionTitle}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={positionLevel} onValueChange={setPositionLevel}>
                    <SelectTrigger id="level" className="mt-1">
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

              <div>
                <Label htmlFor="dept">Department</Label>
                <Input
                  id="dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Engineering, Marketing"
                  className="mt-1"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleGenerateSkills}
                  disabled={!positionTitle || generatingSkills}
                  className="w-full"
                >
                  {generatingSkills ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Skills...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate AI-Powered Skills
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'skills' && (
            <div className="space-y-4">
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  AI has suggested {suggestedSkills.length} skills based on "{positionTitle}".
                  Skills marked with <Database className="h-3 w-3 inline" /> are from NESTA taxonomy.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {selectedSkills.size} of {suggestedSkills.length} skills selected
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllSkills(true)}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAllSkills(false)}
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {['essential', 'important', 'nice-to-have'].map(category => {
                  const categorySkills = suggestedSkills.filter(s => s.category === category);
                  if (categorySkills.length === 0) return null;

                  return (
                    <div key={category}>
                      <h4 className="text-sm font-medium mb-2 capitalize">
                        {category.replace('-', ' ')} Skills
                      </h4>
                      <div className="space-y-2">
                        {categorySkills.map(skill => renderSkillBadge(skill))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep('info')}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep('review')}
                  disabled={selectedSkills.size === 0}
                >
                  Review & Create
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Position Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Title:</span>
                    <span className="font-medium">{positionTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-medium">{positionCode}</span>
                  </div>
                  {positionLevel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Level:</span>
                      <span className="font-medium capitalize">{positionLevel}</span>
                    </div>
                  )}
                  {department && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Department:</span>
                      <span className="font-medium">{department}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-4">Selected Skills</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Required Skills
                    </h4>
                    <div className="space-y-1">
                      {suggestedSkills
                        .filter(s => selectedSkills.has(s.skill_name) && skillCategories[s.skill_name] === 'required')
                        .map(skill => (
                          <div key={skill.skill_name} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {skill.skill_name}
                              {skill.source === 'nesta' && (
                                <Database className="h-3 w-3 text-muted-foreground" />
                              )}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {skillProficiencies[skill.skill_name] || skill.proficiency_level}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Nice to Have Skills
                    </h4>
                    <div className="space-y-1">
                      {suggestedSkills
                        .filter(s => selectedSkills.has(s.skill_name) && skillCategories[s.skill_name] === 'nice-to-have')
                        .map(skill => (
                          <div key={skill.skill_name} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {skill.skill_name}
                              {skill.source === 'nesta' && (
                                <Database className="h-3 w-3 text-muted-foreground" />
                              )}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {skillProficiencies[skill.skill_name] || skill.proficiency_level}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep('skills')}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Position'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}