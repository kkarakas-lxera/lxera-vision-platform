import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Search, Target, CheckCircle, Database, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SkillSearch } from '@/components/admin/SkillsManagement/SkillSearch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SkillSearchResult } from '@/types/skills';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CompanyPosition {
  id: string;
  position_code: string;
  position_title: string;
  position_level?: string;
  department?: string;
  description?: string;
  required_skills: any[];
  nice_to_have_skills: any[];
  is_template: boolean;
}

interface PositionEditModalProps {
  position: CompanyPosition | null;
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

interface SkillSuggestion {
  skill_id?: string;
  skill_name: string;
  category: 'essential' | 'important';
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  source: 'database' | 'ai';
  relevance_score?: number;
  reason?: string;
}

export function PositionEditModal({ position, open, onOpenChange, onSuccess }: PositionEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SkillSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
  
  // Form state
  const [positionCode, setPositionCode] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [positionLevel, setPositionLevel] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<SkillRequirement[]>([]);

  // Load position data when position changes
  useEffect(() => {
    if (position) {
      setPositionCode(position.position_code);
      setPositionTitle(position.position_title);
      setPositionLevel(position.position_level || '');
      setDepartment(position.department || '');
      setDescription(position.description || '');
      setRequiredSkills(position.required_skills || []);
      setSuggestionsLoaded(false);
      setAiSuggestions([]);
    }
  }, [position]);

  // Fetch AI suggestions when modal opens
  useEffect(() => {
    if (position && open && !suggestionsLoaded && positionTitle) {
      fetchAiSuggestions();
    }
  }, [position, open, suggestionsLoaded, positionTitle]);

  const fetchAiSuggestions = async () => {
    if (!positionTitle || isLoadingSuggestions) return;

    setIsLoadingSuggestions(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-position-skills-enhanced', {
        body: {
          position_title: positionTitle,
          position_description: description,
          position_level: positionLevel,
          department: department
        }
      });

      if (error) throw error;

      if (data.skills) {
        setAiSuggestions(data.skills);
        setSuggestionsLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      toast.error('Failed to load AI skill suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
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
    }
  };

  const removeSkill = (skillId: string) => {
    setRequiredSkills(requiredSkills.filter(s => s.skill_id !== skillId));
  };

  const updateSkillProficiency = (skillId: string, proficiencyLevel: string) => {
    setRequiredSkills(requiredSkills.map(s => 
      s.skill_id === skillId ? { ...s, proficiency_level: proficiencyLevel as any } : s
    ));
  };

  const handleAddAiSuggestion = (suggestion: SkillSuggestion) => {
    const skillRequirement: SkillRequirement = {
      skill_id: suggestion.skill_id || `ai_${Date.now()}_${Math.random()}`,
      skill_name: suggestion.skill_name,
      skill_type: 'AI Suggested',
      proficiency_level: suggestion.proficiency_level,
      is_mandatory: suggestion.category === 'essential'
    };

    if (!requiredSkills.find(s => s.skill_name === suggestion.skill_name)) {
      setRequiredSkills([...requiredSkills, skillRequirement]);
      toast.success(`Added ${suggestion.skill_name} to required skills`);
    }
  };

  const getAvailableSuggestions = () => {
    return aiSuggestions.filter(suggestion => 
      !requiredSkills.some(skill => skill.skill_name === suggestion.skill_name)
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-red-500 text-white';
      case 'important':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
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
        toast.success('Description regenerated successfully');
      }
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Failed to regenerate description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!position) return;

    if (!positionCode.trim() || !positionTitle.trim()) {
      toast.error('Position code and title are required');
      return;
    }

    setLoading(true);

    try {
      const updates = {
        position_code: positionCode.trim(),
        position_title: positionTitle.trim(),
        position_level: positionLevel || null,
        department: department || null,
        description: description || null,
        required_skills: requiredSkills as any[],
        nice_to_have_skills: []
      };

      const { error } = await supabase
        .from('st_company_positions')
        .update(updates)
        .eq('id', position.id);

      if (error) throw error;

      toast.success('Position updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating position:', error);
      if (error.message?.includes('duplicate key')) {
        toast.error('A position with this code already exists');
      } else {
        toast.error('Failed to update position');
      }
    } finally {
      setLoading(false);
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-green-100 text-green-800';
      case 'advanced':
        return 'bg-orange-100 text-orange-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!position) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            Edit Position: {position.position_title}
          </DialogTitle>
          <DialogDescription>
            Update position details, description, and skill requirements
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden">
            {/* Left Column - Basic Information & Description */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Position Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="positionCode">Position Code *</Label>
                    <Input
                      id="positionCode"
                      value={positionCode}
                      onChange={(e) => setPositionCode(e.target.value)}
                      placeholder="e.g., DEV-001, PM-002"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="positionLevel">Level</Label>
                    <Select value={positionLevel} onValueChange={setPositionLevel}>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positionTitle">Position Title *</Label>
                  <Input
                    id="positionTitle"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g., Engineering, Marketing"
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Position Description</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateDescription}
                      disabled={!positionTitle || isGeneratingDescription}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className={`h-4 w-4 ${isGeneratingDescription ? 'animate-spin' : ''}`} />
                      {isGeneratingDescription ? 'Regenerating...' : 'Regenerate with AI'}
                    </Button>
                  </div>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isGeneratingDescription ? "AI is regenerating description..." : "Describe the role, responsibilities, and key objectives..."}
                    rows={8}
                    disabled={isGeneratingDescription}
                    className="resize-none"
                  />
                  {description && (
                    <p className="text-xs text-muted-foreground">
                      {description.length} characters
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Skills Management */}
            <div className="overflow-y-auto">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Required Skills ({requiredSkills.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                {/* Current Skills */}
                <ScrollArea className="h-48 border rounded-lg p-2">
                  <div className="space-y-2">
                    {requiredSkills.length > 0 ? (
                      requiredSkills.map((skill) => (
                        <div key={skill.skill_id} className="flex items-center justify-between p-2 bg-white border rounded-lg shadow-sm">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{skill.skill_name}</span>
                              <Badge className={`text-xs ${getProficiencyColor(skill.proficiency_level)}`}>
                                {skill.proficiency_level}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{skill.skill_type}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={skill.proficiency_level}
                              onValueChange={(value) => updateSkillProficiency(skill.skill_id, value)}
                            >
                              <SelectTrigger className="w-32 h-8">
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
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(skill.skill_id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No skills added yet</p>
                        <p className="text-xs">Use the search below to add skills</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <Separator />

                <Separator />

                {/* AI Skill Suggestions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <Label className="text-sm font-medium">AI Skill Suggestions</Label>
                    </div>
                    {!suggestionsLoaded && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchAiSuggestions}
                        disabled={isLoadingSuggestions || !positionTitle}
                        className="flex items-center gap-2"
                      >
                        <Sparkles className={`h-3 w-3 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
                        {isLoadingSuggestions ? 'Loading...' : 'Get Suggestions'}
                      </Button>
                    )}
                  </div>
                  
                  {isLoadingSuggestions && (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm">AI is analyzing position requirements...</p>
                    </div>
                  )}
                  
                  {suggestionsLoaded && (
                    <ScrollArea className="h-64 border rounded-lg p-2">
                      <div className="space-y-2">
                        {getAvailableSuggestions().length > 0 ? (
                          getAvailableSuggestions().map((suggestion, index) => (
                            <div key={`${suggestion.skill_id || index}`} className="flex items-start justify-between p-2 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{suggestion.skill_name}</span>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        {suggestion.source === 'database' ? (
                                          <Database className="h-3 w-3 text-blue-600" />
                                        ) : (
                                          <Sparkles className="h-3 w-3 text-purple-600" />
                                        )}
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        {suggestion.source === 'database' ? 'From your skills database' : 'AI generated'}
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  <Badge className={`text-xs ${getCategoryColor(suggestion.category)}`}>
                                    {suggestion.category}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{suggestion.description}</p>
                                {suggestion.reason && (
                                  <p className="text-xs text-blue-600 italic mt-1">{suggestion.reason}</p>
                                )}
                              </div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleAddAiSuggestion(suggestion)}
                                className="ml-2 flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                Add
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">All AI suggestions have been added!</p>
                            <p className="text-xs">Use manual search below for additional skills</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                <Separator />

                {/* Manual Skill Search */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Manual Search</Label>
                  </div>
                  <SkillSearch
                    onSkillSelect={(skill) => handleSkillSelect(skill, true)}
                    placeholder="Search skills database..."
                    excludeIds={requiredSkills.map(s => s.skill_id)}
                  />
                </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !positionCode.trim() || !positionTitle.trim()}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}