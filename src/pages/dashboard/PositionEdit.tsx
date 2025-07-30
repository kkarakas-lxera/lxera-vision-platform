import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Target, CheckCircle, Database, Sparkles, Plus, X, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SkillSearch } from '@/components/admin/SkillsManagement/SkillSearch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { SkillSearchResult } from '@/types/skills';
import { parseSkillsArray } from '@/utils/typeGuards';
import type { SkillData } from '@/types/common';

interface SkillRequirement {
  skill_id: string;
  skill_name: string;
  skill_type: string;
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  is_mandatory: boolean;
  description?: string;
  reason?: string;
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

interface CompanyPosition {
  id: string;
  position_code: string;
  position_title: string;
  position_level?: string;
  department?: string;
  description?: string;
  required_skills: SkillData[];
  nice_to_have_skills: SkillData[];
  ai_suggestions?: SkillData[];
  is_template: boolean;
  created_at: string;
}

export default function PositionEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [position, setPosition] = useState<CompanyPosition | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SkillSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
  const [expandedSkills, setExpandedSkills] = useState<{[key: string]: boolean}>({});
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({});
  const [expandedRequiredSkills, setExpandedRequiredSkills] = useState<{[key: string]: boolean}>({});
  
  // Form state
  const [positionCode, setPositionCode] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [positionLevel, setPositionLevel] = useState('');
  const [department, setDepartment] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<SkillRequirement[]>([]);

  useEffect(() => {
    if (id) {
      fetchPosition();
    }
  }, [id]);

  const fetchPosition = async () => {
    try {
      const { data, error } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const typedPosition: CompanyPosition = {
          id: data.id,
          position_code: data.position_code,
          position_title: data.position_title,
          position_level: data.position_level || undefined,
          department: data.department || undefined,
          description: data.description || undefined,
          required_skills: parseSkillsArray(data.required_skills),
          nice_to_have_skills: parseSkillsArray(data.nice_to_have_skills),
          ai_suggestions: parseSkillsArray(data.ai_suggestions),
          is_template: data.is_template || false,
          created_at: data.created_at || new Date().toISOString()
        };

        setPosition(typedPosition);
        setPositionCode(typedPosition.position_code);
        setPositionTitle(typedPosition.position_title);
        setPositionLevel(typedPosition.position_level || '');
        setDepartment(typedPosition.department || '');
        setDescription(typedPosition.description || '');
        setRequiredSkills(typedPosition.required_skills || []);
        
        // Load AI suggestions if available
        if (typedPosition.ai_suggestions && typedPosition.ai_suggestions.length > 0) {
          setAiSuggestions(typedPosition.ai_suggestions);
          setSuggestionsLoaded(true);
        }
      }
    } catch (error) {
      console.error('Error fetching position:', error);
      toast.error('Failed to load position');
      navigate('/dashboard/positions');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSkillSelect = (skill: SkillSearchResult, isRequired: boolean, proficiencyLevel: string = 'intermediate') => {
    const skillRequirement: SkillRequirement = {
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      skill_type: skill.skill_type,
      proficiency_level: proficiencyLevel as any,
      is_mandatory: isRequired,
      description: skill.description
    };

    if (isRequired) {
      if (!requiredSkills.find(s => s.skill_id === skill.skill_id)) {
        setRequiredSkills([...requiredSkills, skillRequirement]);
      }
    }
  };

  const removeSkill = (skillId: string) => {
    setRequiredSkills(requiredSkills.filter(s => s.skill_id !== skillId));
  };

  const toggleRequiredSkillExpanded = (skillId: string) => {
    setExpandedRequiredSkills(prev => ({
      ...prev,
      [skillId]: !prev[skillId]
    }));
  };

  const handleAddAiSuggestion = (suggestion: SkillSuggestion) => {
    const skillRequirement: SkillRequirement = {
      skill_id: suggestion.skill_id || `ai_${Date.now()}_${Math.random()}`,
      skill_name: suggestion.skill_name,
      skill_type: 'AI Suggested',
      proficiency_level: suggestion.proficiency_level,
      is_mandatory: suggestion.category === 'essential',
      description: suggestion.description,
      reason: suggestion.reason
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

  const handleSave = async () => {
    if (!position) return;

    if (!positionCode.trim() || !positionTitle.trim()) {
      toast.error('Position code and title are required');
      return;
    }

    setSaving(true);

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
      navigate('/dashboard/positions');
    } catch (error: any) {
      console.error('Error updating position:', error);
      if (error.message?.includes('duplicate key')) {
        toast.error('A position with this code already exists');
      } else {
        toast.error('Failed to update position');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="p-6">
        <p>Position not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/positions')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Positions
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Position</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {position.position_title} • {position.position_code}
          </p>
        </div>
      </div>

      {/* Position Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Position Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
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
              <Label htmlFor="positionCode">Position Code *</Label>
              <Input
                id="positionCode"
                value={positionCode}
                onChange={(e) => setPositionCode(e.target.value)}
                placeholder="e.g., DEV-001, PM-002"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
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

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., Engineering, Marketing"
              />
            </div>
          </div>

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
              rows={6}
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

      {/* Required Skills Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Required Skills ({requiredSkills.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Skills Grid */}
          {requiredSkills.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {requiredSkills.map((skill) => {
                const isExpanded = expandedRequiredSkills[skill.skill_id];
                
                return (
                  <div key={skill.skill_id} className="bg-white border rounded-lg shadow-sm">
                    <div 
                      className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleRequiredSkillExpanded(skill.skill_id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{skill.skill_name}</span>
                            {skill.is_mandatory && (
                              <Badge variant="destructive" className="text-xs">Essential</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{skill.skill_type}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronDown 
                            className={`h-4 w-4 text-gray-400 transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`} 
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSkill(skill.skill_id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (skill.description || skill.reason) && (
                      <div className="px-3 pb-3 border-t border-gray-100">
                        <div className="pt-2 space-y-2">
                          {skill.description && (
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {skill.description}
                            </p>
                          )}
                          {skill.reason && (
                            <div className="text-xs">
                              <span className="font-medium text-gray-700">Why needed: </span>
                              <span className="text-gray-600">{skill.reason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {requiredSkills.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No skills added yet</p>
              <p className="text-xs">Use the options below to add skills</p>
            </div>
          )}

          <Separator />

          {/* AI Skill Suggestions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <Label className="text-sm font-medium">AI Skill Suggestions</Label>
              </div>
              {!suggestionsLoaded ? (
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
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSuggestionsLoaded(false);
                    setAiSuggestions([]);
                    fetchAiSuggestions();
                  }}
                >
                  Regenerate
                </Button>
              )}
            </div>
            
            {isLoadingSuggestions && (
              <div className="text-center py-4 text-muted-foreground border rounded-lg">
                <div className="animate-spin h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-sm">AI is analyzing position requirements...</p>
              </div>
            )}
            
            {suggestionsLoaded && getAvailableSuggestions().length > 0 && (
              <div className="border rounded-lg p-3 space-y-2 max-h-64 overflow-y-auto">
                {getAvailableSuggestions().map((suggestion, index) => {
                  const suggestionKey = `${suggestion.skill_id || index}`;
                  const isExpanded = expandedSkills[suggestionKey];
                  
                  return (
                    <div key={suggestionKey} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div 
                        className="p-2 cursor-pointer"
                        onClick={() => setExpandedSkills(prev => ({...prev, [suggestionKey]: !prev[suggestionKey]}))}
                      >
                        <div className="flex items-start justify-between">
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
                            {!isExpanded && suggestion.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{suggestion.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <ChevronDown 
                              className={`h-3 w-3 text-gray-400 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`} 
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddAiSuggestion(suggestion);
                              }}
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {isExpanded && (suggestion.description || suggestion.reason) && (
                        <div className="px-2 pb-2 border-t border-gray-100">
                          <div className="pt-2 space-y-2">
                            {suggestion.description && (
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {suggestion.description}
                              </p>
                            )}
                            {suggestion.reason && (
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">Why needed: </span>
                                <span className="text-gray-600">{suggestion.reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {suggestionsLoaded && getAvailableSuggestions().length === 0 && (
              <div className="text-center py-4 text-muted-foreground border rounded-lg">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">All AI suggestions have been added!</p>
                <p className="text-xs">Use manual search below for additional skills</p>
              </div>
            )}

            {!suggestionsLoaded && !isLoadingSuggestions && (
              <div className="text-center py-4 text-muted-foreground border rounded-lg">
                <p className="text-sm">Click to analyze position and get skill recommendations</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Manual Skill Search */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Search and add more skills</Label>
            </div>
            <SkillSearch
              onSkillSelect={(skill) => handleSkillSelect(skill, true)}
              placeholder="Search skills database..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/positions')}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !positionCode.trim() || !positionTitle.trim()}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}