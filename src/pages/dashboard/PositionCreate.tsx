import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Search, ArrowRight, ArrowLeft, CheckCircle, Lightbulb, Sparkles, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AISkillSuggestions } from '@/components/dashboard/PositionManagement/AISkillSuggestions';
import { parseSkillsArray } from '@/utils/typeGuards';

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
  ai_suggestions?: any[];
  admin_approved?: boolean;
  description_fully_read?: boolean;
}

export default function PositionCreate() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const descriptionEndRef = useRef<HTMLDivElement>(null);
  const [hasScrolledDescription, setHasScrolledDescription] = useState(false);

  const [positionData, setPositionData] = useState<PositionData>({
    position_title: '',
    position_code: '',
    position_level: '',
    department: '',
    description: '',
    required_skills: [],
    ai_suggestions: [],
    admin_approved: false,
    description_fully_read: false
  });

  const steps = [
    { number: 1, title: 'Basic Information', description: 'Position details' },
    { number: 2, title: 'Add Required Skills', description: 'Define skill requirements' },
    { number: 3, title: 'Confirmation', description: 'Review and confirm' }
  ];

  useEffect(() => {
    fetchSkills();
  }, []);

  // Generate position code from title
  const generatePositionCode = (title: string) => {
    return title
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
  };

  // Generate AI description
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
      if (positionData.position_title && 
          (positionData.position_level || positionData.department) && 
          !positionData.description && 
          !isGeneratingDescription) {
        generateDescription();
      }
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [positionData.position_title, positionData.position_level, positionData.department]);

  useEffect(() => {
    // When description changes, reset the fully read status
    setPositionData(prev => ({ ...prev, description_fully_read: false }));
    setHasScrolledDescription(false);
  }, [positionData.description]);

  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const { data, error } = await supabase
        .from('esco_skills')
        .select('skill_id, skill_name, description')
        .order('skill_name');

      if (error) throw error;
      setAvailableSkills(data || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills database');
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleDescriptionScroll = () => {
    if (descriptionRef.current && !hasScrolledDescription) {
      const { scrollTop, scrollHeight, clientHeight } = descriptionRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      
      if (isAtBottom) {
        setHasScrolledDescription(true);
        setPositionData(prev => ({ ...prev, description_fully_read: true }));
      }
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateBasicInfo()) {
      return;
    }
    if (currentStep === 2 && positionData.required_skills.length === 0) {
      toast.error('Please add at least one required skill');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateBasicInfo = () => {
    if (!positionData.position_title) {
      toast.error('Please enter a position title');
      return false;
    }
    if (!positionData.position_code) {
      toast.error('Please enter a position code');
      return false;
    }
    if (!positionData.position_level) {
      toast.error('Please select a position level');
      return false;
    }
    if (!positionData.department) {
      toast.error('Please select a department');
      return false;
    }
    if (!positionData.description) {
      toast.error('Please enter a position description');
      return false;
    }
    if (!positionData.description_fully_read && positionData.description.length > 100) {
      toast.error('Please read through the entire position description');
      descriptionRef.current?.focus();
      return false;
    }
    return true;
  };

  const addSkill = (skill: any) => {
    if (positionData.required_skills.find(s => s.skill_id === skill.skill_id)) {
      toast.error('Skill already added');
      return;
    }

    const newSkill: SkillSelection = {
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      proficiency_level: 3,
      description: skill.description
    };

    setPositionData({
      ...positionData,
      required_skills: [...positionData.required_skills, newSkill]
    });
    setSkillSearchTerm('');
  };

  const removeSkill = (skillId: string) => {
    setPositionData({
      ...positionData,
      required_skills: positionData.required_skills.filter(s => s.skill_id !== skillId)
    });
  };

  const updateSkillProficiency = (skillId: string, level: number) => {
    setPositionData({
      ...positionData,
      required_skills: positionData.required_skills.map(s => 
        s.skill_id === skillId ? { ...s, proficiency_level: level } : s
      )
    });
  };

  const handleSave = async () => {
    if (!userProfile?.company_id) {
      toast.error('Company ID not found');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare the skills data for insertion
      const skillsData = positionData.required_skills.map(skill => ({
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        proficiency_level: skill.proficiency_level,
        is_mandatory: true
      }));

      const aiSuggestionsData = positionData.ai_suggestions?.map(skill => ({
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        proficiency_level: skill.proficiency_level || 3,
        is_mandatory: false
      })) || [];

      const { error } = await supabase
        .from('st_company_positions')
        .insert({
          company_id: userProfile.company_id,
          position_code: positionData.position_code,
          position_title: positionData.position_title,
          position_level: positionData.position_level,
          department: positionData.department,
          description: positionData.description,
          required_skills: skillsData,
          nice_to_have_skills: [],
          ai_suggestions: aiSuggestionsData,
          is_template: false
        });

      if (error) throw error;

      toast.success('Position created successfully!');
      
      // Navigate back to positions page
      navigate('/dashboard/positions');
    } catch (error) {
      console.error('Error creating position:', error);
      toast.error('Failed to create position');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.skill_name.toLowerCase().includes(skillSearchTerm.toLowerCase())
  ).slice(0, 10);

  const handleAISuggestions = (suggestions: any[]) => {
    setPositionData({
      ...positionData,
      ai_suggestions: suggestions
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/positions')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Positions
        </Button>
        
        <h1 className="text-2xl font-bold text-foreground">Create New Position</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Define the requirements for a new position in your organization
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep > step.number
                      ? 'bg-primary border-primary text-primary-foreground'
                      : currentStep === step.number
                      ? 'border-primary text-primary'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-20 transition-colors ${
                    currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="position_title">Position Title*</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="position_code">Position Code*</Label>
                  <Input
                    id="position_code"
                    value={positionData.position_code}
                    onChange={(e) => setPositionData({ ...positionData, position_code: e.target.value })}
                    placeholder="e.g., ENG-SR-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="position_level">Position Level*</Label>
                  <Select
                    value={positionData.position_level}
                    onValueChange={(value) => setPositionData({ ...positionData, position_level: value })}
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
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department*</Label>
                  <Select
                    value={positionData.department}
                    onValueChange={(value) => setPositionData({ ...positionData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Position Description*</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={generateDescription}
                    disabled={!positionData.position_title || isGeneratingDescription}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {isGeneratingDescription ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
                <Textarea
                  ref={descriptionRef}
                  id="description"
                  value={positionData.description}
                  onChange={(e) => setPositionData({ ...positionData, description: e.target.value })}
                  onScroll={handleDescriptionScroll}
                  placeholder="Describe the role, responsibilities, and key objectives..."
                  rows={6}
                  className="resize-none"
                />
                {positionData.description.length > 100 && !positionData.description_fully_read && (
                  <p className="text-xs text-orange-600 mt-1">
                    Please scroll to read the entire description
                  </p>
                )}
                <div ref={descriptionEndRef} />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* AI Suggestions Toggle */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">AI-Powered Skill Suggestions</h4>
                    <p className="text-sm text-muted-foreground">
                      Get intelligent skill recommendations based on the position details
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAISuggestions(true)}
                  disabled={loadingSuggestions}
                >
                  {loadingSuggestions ? 'Loading...' : 'Get Suggestions'}
                </Button>
              </div>

              {showAISuggestions && (
                <AISkillSuggestions
                  positionData={{
                    position_title: positionData.position_title,
                    position_level: positionData.position_level,
                    department: positionData.department,
                    description: positionData.description
                  }}
                  onAcceptSuggestions={handleAISuggestions}
                  onClose={() => setShowAISuggestions(false)}
                />
              )}

              {/* Required Skills */}
              <div>
                <h3 className="font-medium mb-4">Required Skills</h3>
                
                {/* Skill Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search skills..."
                      value={skillSearchTerm}
                      onChange={(e) => setSkillSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {skillSearchTerm && (
                    <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                      {loadingSkills ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading skills...</div>
                      ) : filteredSkills.length > 0 ? (
                        filteredSkills.map(skill => (
                          <div
                            key={skill.skill_id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => addSkill(skill)}
                          >
                            <div className="font-medium text-sm">{skill.skill_name}</div>
                            {skill.description && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {skill.description}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No skills found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Skills */}
                <div className="space-y-2">
                  {positionData.required_skills.length === 0 ? (
                    <Alert className="bg-white">
                      <AlertDescription>
                        No skills added yet. Search and add required skills for this position.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    positionData.required_skills.map(skill => (
                      <div key={skill.skill_id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{skill.skill_name}</h4>
                            {skill.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {skill.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <Label className="text-sm">Required Proficiency:</Label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(level => (
                                  <button
                                    key={level}
                                    onClick={() => updateSkillProficiency(skill.skill_id, level)}
                                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                                      level <= skill.proficiency_level
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {level}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSkill(skill.skill_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Review Position Details</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Position Title</p>
                      <p className="font-medium">{positionData.position_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Position Code</p>
                      <p className="font-medium">{positionData.position_code}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Level</p>
                      <p className="font-medium capitalize">{positionData.position_level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium capitalize">{positionData.department}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm whitespace-pre-wrap">{positionData.description}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Required Skills ({positionData.required_skills.length})
                    </p>
                    <div className="space-y-2">
                      {positionData.required_skills.map(skill => (
                        <div key={skill.skill_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{skill.skill_name}</span>
                          <Badge variant="secondary">
                            Level {skill.proficiency_level}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {positionData.ai_suggestions && positionData.ai_suggestions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          AI Suggested Skills ({positionData.ai_suggestions.length})
                        </p>
                        <div className="space-y-2">
                          {positionData.ai_suggestions.map((skill, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <span className="text-sm font-medium">{skill.skill_name}</span>
                              <Badge variant="outline">Suggested</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Alert className="mt-6 bg-white">
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>By creating this position, you confirm that:</p>
                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="admin_approved"
                          checked={positionData.admin_approved}
                          onCheckedChange={(checked) => 
                            setPositionData({ ...positionData, admin_approved: checked as boolean })
                          }
                        />
                        <Label htmlFor="admin_approved" className="text-sm cursor-pointer">
                          The position details and skill requirements have been reviewed and approved
                        </Label>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={isLoading || !positionData.admin_approved}
              >
                {isLoading ? 'Creating...' : 'Create Position'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}