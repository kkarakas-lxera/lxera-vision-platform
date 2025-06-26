import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Search, ArrowRight, ArrowLeft, CheckCircle, Lightbulb, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AISkillSuggestions } from './AISkillSuggestions';

// Define the interface to match what's used in the parent component
interface ImportSession {
  id: string;
  import_type: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface SkillSelection {
  skill_id: string;
  skill_name: string;
  proficiency_level: number;
  description?: string;
}

interface PositionData {
  position_title: string;
  position_code: string;
  position_level: string;
  department: string;
  description: string;
  required_skills: SkillSelection[];
}

interface PositionCreateWizardProps {
  onComplete: (position: any) => void;
  onCancel: () => void;
}

export function PositionCreateWizard({ onComplete, onCancel }: PositionCreateWizardProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [positionData, setPositionData] = useState<PositionData>({
    position_title: '',
    position_code: '',
    position_level: '',
    department: '',
    description: '',
    required_skills: []
  });


  const generatePositionCode = (title: string) => {
    return title
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
  };

  const generateDescription = async () => {
    if (!positionData.position_title || isGeneratingDescription) return;

    setIsGeneratingDescription(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-position-description', {
        body: {
          position_title: positionData.position_title,
          position_level: positionData.position_level,
          department: positionData.department
        }
      });

      if (error) throw error;

      if (data.description) {
        setPositionData(prev => ({
          ...prev,
          description: data.description
        }));
        toast({
          title: 'Description Generated',
          description: 'AI has generated a position description. You can edit it as needed.',
        });
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate description. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const addSkill = (skill: any) => {
    const skillSelection: SkillSelection = {
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      proficiency_level: skill.proficiency_level || 3,
      description: skill.description
    };

    setPositionData(prev => ({
      ...prev,
      required_skills: [...prev.required_skills, skillSelection]
    }));
  };

  const removeSkill = (skillId: string) => {
    setPositionData(prev => ({
      ...prev,
      required_skills: prev.required_skills.filter(s => s.skill_id !== skillId)
    }));
  };

  const createPosition = async () => {
    if (!userProfile?.company_id) {
      toast({
        title: 'Error',
        description: 'Company information not found',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: position, error } = await supabase
        .from('st_company_positions')
        .insert({
          company_id: userProfile.company_id,
          position_title: positionData.position_title,
          position_code: positionData.position_code,
          position_level: positionData.position_level,
          department: positionData.department,
          required_skills: positionData.required_skills.map(skill => ({
            skill_id: skill.skill_id,
            skill_name: skill.skill_name,
            proficiency_level: skill.proficiency_level,
            description: skill.description
          })),
          nice_to_have_skills: [],
          created_by: userProfile.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Position created successfully',
      });

      onComplete(position);
    } catch (error) {
      console.error('Error creating position:', error);
      toast({
        title: 'Error',
        description: 'Failed to create position',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Position details and overview' },
    { number: 2, title: 'Required Skills', description: 'Essential skills for this role' },
    { number: 3, title: 'Review & Create', description: 'Final review and creation' }
  ];

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2:
        return positionData.position_title && positionData.position_code;
      case 3:
        return positionData.required_skills.length > 0;
      default:
        return true;
    }
  };

  // Auto-generate description when title, level, and department are filled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (positionData.position_title && 
          (positionData.position_level || positionData.department) && 
          !positionData.description && 
          !isGeneratingDescription) {
        generateDescription();
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [positionData.position_title, positionData.position_level, positionData.department]);

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep === step.number
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : currentStep > step.number
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className={`h-0.5 ${currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
          <div className="text-center">
            <h3 className="font-medium">{steps[currentStep - 1].title}</h3>
            <p className="text-sm text-muted-foreground">{steps[currentStep - 1].description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position_title">Position Title *</Label>
                  <Input
                    id="position_title"
                    value={positionData.position_title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setPositionData(prev => ({
                        ...prev,
                        position_title: title,
                        position_code: generatePositionCode(title)
                      }));
                    }}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="position_code">Position Code *</Label>
                  <Input
                    id="position_code"
                    value={positionData.position_code}
                    onChange={(e) => setPositionData(prev => ({ ...prev, position_code: e.target.value }))}
                    placeholder="e.g., SR_SW_ENG"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position_level">Position Level</Label>
                  <Select 
                    value={positionData.position_level} 
                    onValueChange={(value) => setPositionData(prev => ({ ...prev, position_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={positionData.department}
                    onChange={(e) => setPositionData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">Position Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateDescription}
                    disabled={!positionData.position_title || isGeneratingDescription}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className={`h-4 w-4 ${isGeneratingDescription ? 'animate-spin' : ''}`} />
                    {isGeneratingDescription ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={positionData.description}
                  onChange={(e) => setPositionData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={isGeneratingDescription ? "AI is generating description..." : "Describe the role, responsibilities, and key objectives..."}
                  rows={4}
                  disabled={isGeneratingDescription}
                />
                {isGeneratingDescription && (
                  <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    AI is analyzing your position details...
                  </p>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium">Required Skills</h3>
                <p className="text-sm text-muted-foreground">
                  AI will suggest essential skills based on your position details
                </p>
              </div>

              {/* Selected Skills Display */}
              {positionData.required_skills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Selected Required Skills ({positionData.required_skills.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {positionData.required_skills.map((skill) => (
                      <div key={skill.skill_id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{skill.skill_name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs bg-red-100 text-red-800">Required</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(skill.skill_id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions Panel */}
              <AISkillSuggestions
                positionTitle={positionData.position_title}
                positionDescription={positionData.description}
                positionLevel={positionData.position_level}
                department={positionData.department}
                onAddSkill={addSkill}
                existingSkills={positionData.required_skills}
                currentStep="required"
                onUpdateDescription={(desc) => setPositionData(prev => ({ ...prev, description: desc }))}
              />

              {positionData.required_skills.length === 0 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Add at least one required skill from the AI suggestions above.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">Review & Confirm</h3>
              <p className="text-sm text-muted-foreground">
                Please review the details below before creating the position
              </p>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Basic Information</h4>
                <p><strong>Position Title:</strong> {positionData.position_title}</p>
                <p><strong>Position Code:</strong> {positionData.position_code}</p>
                <p><strong>Position Level:</strong> {positionData.position_level || 'Not specified'}</p>
                <p><strong>Department:</strong> {positionData.department || 'Not specified'}</p>
                <p><strong>Description:</strong> {positionData.description || 'No description provided'}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-semibold">Required Skills</h4>
                {positionData.required_skills.length > 0 ? (
                  positionData.required_skills.map((skill) => (
                    <Badge key={skill.skill_id} variant="secondary" className="mr-2">
                      {skill.skill_name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">No required skills added</p>
                )}
              </div>

            </div>
          )}

        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onCancel : () => setCurrentStep(currentStep - 1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </Button>

        <Button
          onClick={currentStep === 3 ? createPosition : () => setCurrentStep(currentStep + 1)}
          disabled={!canProceedToStep(currentStep + 1) || isLoading}
          className="flex items-center gap-2"
        >
          {currentStep === 3 ? (
            isLoading ? 'Creating...' : 'Create Position'
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
