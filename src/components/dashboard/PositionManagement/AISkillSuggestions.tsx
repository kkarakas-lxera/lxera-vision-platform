import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Sparkles, 
  Database, 
  Plus, 
  CheckCircle, 
  Info, 
  RefreshCw, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  PlusCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SkillSuggestion {
  skill_name: string;
  category: 'essential' | 'important' | 'nice-to-have';
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  reason?: string;
  skill_group?: 'technical' | 'soft' | 'leadership' | 'tools' | 'industry';
  market_demand?: 'high' | 'medium' | 'low';
}

interface AISkillSuggestionsProps {
  positionTitle: string;
  positionDescription: string;
  positionLevel?: string;
  department?: string;
  onAddSkill: (skill: any) => void;
  existingSkills: Array<{ skill_id: string; skill_name: string }>;
  onSuggestionsLoaded?: (suggestions: SkillSuggestion[]) => void;
}

export function AISkillSuggestions({
  positionTitle,
  positionDescription,
  positionLevel,
  department,
  onAddSkill,
  existingSkills,
  onSuggestionsLoaded
}: AISkillSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'market' | 'ai' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<any>(null);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  const fetchSuggestions = async () => {
    if (!positionTitle) {
      toast.error('Please enter a position title first');
      return;
    }

    setLoading(true);
    setLoadingStage('market');
    setError(null);

    try {
      // Start with market data stage
      setTimeout(() => {
        if (loading) setLoadingStage('ai');
      }, 3000); // Switch to AI stage after 3 seconds

      const { data, error: fetchError } = await supabase.functions.invoke('suggest-position-skills-enhanced', {
        body: {
          position_title: positionTitle,
          position_description: positionDescription,
          position_level: positionLevel,
          department: department
        }
      });

      if (fetchError) throw fetchError;

      if (data.error) {
        throw new Error(data.error);
      }

      setSuggestions(data.skills || []);
      setSummary(data.summary);
      
      // Pass suggestions back to parent component
      if (onSuggestionsLoaded && data.skills) {
        onSuggestionsLoaded(data.skills);
      }
      
      const message = data.summary?.market_data_available 
        ? `Found ${data.skills?.length || 0} skills with market insights`
        : `Found ${data.skills?.length || 0} skills`;
      toast.success(message);
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      setError(err.message || 'Failed to get AI suggestions');
      toast.error('Failed to get AI suggestions');
    } finally {
      setLoading(false);
      setLoadingStage(null);
    }
  };

  const handleAddSkill = (skill: SkillSuggestion) => {
    const skillData = {
      skill_id: `ai_${Date.now()}_${Math.random()}`,
      skill_name: skill.skill_name,
      proficiency_level: skill.proficiency_level === 'basic' ? 1 :
                        skill.proficiency_level === 'intermediate' ? 2 :
                        skill.proficiency_level === 'advanced' ? 3 : 4,
      description: skill.description
    };

    onAddSkill(skillData);
    setAddedSkills(prev => new Set(prev).add(skill.skill_name));
    toast.success(`Added ${skill.skill_name} to required skills`);
  };

  const handleAddSelectedSkills = () => {
    const skillsToAdd = suggestions.filter(skill => 
      selectedSkills.has(skill.skill_name) && !isSkillAdded(skill.skill_name)
    );

    skillsToAdd.forEach(skill => {
      const skillData = {
        skill_id: `ai_${Date.now()}_${Math.random()}`,
        skill_name: skill.skill_name,
        proficiency_level: skill.proficiency_level === 'basic' ? 1 :
                          skill.proficiency_level === 'intermediate' ? 2 :
                          skill.proficiency_level === 'advanced' ? 3 : 4,
        description: skill.description
      };
      onAddSkill(skillData);
      setAddedSkills(prev => new Set(prev).add(skill.skill_name));
    });

    setSelectedSkills(new Set());
    toast.success(`Added ${skillsToAdd.length} skills to required skills`);
  };

  const handleAddAllEssential = () => {
    const essentialSkills = suggestions.filter(skill => 
      skill.category === 'essential' && !isSkillAdded(skill.skill_name)
    );

    // Select all essential skills (don't add them yet)
    const skillNamesToSelect = essentialSkills.map(skill => skill.skill_name);
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      skillNamesToSelect.forEach(skillName => newSet.add(skillName));
      return newSet;
    });

    toast.success(`Selected ${essentialSkills.length} essential skills`);
  };

  const toggleSkillSelection = (skillName: string) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillName)) {
        newSet.delete(skillName);
      } else {
        newSet.add(skillName);
      }
      return newSet;
    });
  };


  const toggleSkillExpand = (skillName: string) => {
    setExpandedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skillName)) {
        newSet.delete(skillName);
      } else {
        newSet.add(skillName);
      }
      return newSet;
    });
  };

  const isSkillAdded = (skillName: string) => {
    return addedSkills.has(skillName) || 
           existingSkills.some(s => s.skill_name === skillName);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'important':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'nice-to-have':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getProficiencyIcon = (level: string) => {
    switch (level) {
      case 'basic':
        return '●○○○';
      case 'intermediate':
        return '●●○○';
      case 'advanced':
        return '●●●○';
      case 'expert':
        return '●●●●';
      default:
        return '●○○○';
    }
  };

  // Auto-fetch when position details change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (positionTitle && (positionLevel || department || positionDescription?.length > 20)) {
        fetchSuggestions();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [positionTitle, positionLevel, department]);

  // No filtering needed anymore
  const filteredSuggestions = suggestions;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Skills Suggestions
            </CardTitle>
            <CardDescription>
              Smart skill recommendations powered by AI
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSuggestions}
            disabled={loading || !positionTitle}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!positionTitle && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter a position title to get AI-powered suggestions
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <div className="relative">
                  <div className="h-12 w-12 mx-auto rounded-full border-4 border-muted animate-pulse">
                    <div className="h-full w-full rounded-full border-t-4 border-blue-600 animate-spin"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {loadingStage === 'market' ? 'Searching job market data...' : 'Analyzing with AI...'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {loadingStage === 'market' 
                      ? 'Finding real job requirements' 
                      : 'Generating tailored skills suggestions'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && suggestions.length > 0 && (
          <div className="space-y-4">
              {summary && (
                <div className="p-2 bg-muted/50 rounded-md text-sm border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">Skills Analysis</span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>Total: {summary.total_suggestions}</span>
                      <span>Essential: {summary.essential_count}</span>
                      {summary.market_data_available && (
                        <span className="text-green-600">✓ Market data</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bulk action buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddAllEssential}
                  disabled={suggestions.filter(s => s.category === 'essential' && !isSkillAdded(s.skill_name)).length === 0}
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add All Essential Skills
                </Button>
                {selectedSkills.size > 0 && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleAddSelectedSkills}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Selected ({selectedSkills.size})
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredSuggestions.map((skill, index) => {
                    const isAdded = isSkillAdded(skill.skill_name);
                    const isExpanded = expandedSkills.has(skill.skill_name);
                    
                    return (
                      <div
                        key={`${skill.skill_id || index}`}
                        className={`border rounded-lg transition-all ${
                          isAdded ? 'opacity-60 bg-gray-50' : 'hover:shadow-md bg-white'
                        }`}
                      >
                        <div className="p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              {!isAdded && (
                                <Checkbox
                                  checked={selectedSkills.has(skill.skill_name)}
                                  onCheckedChange={() => toggleSkillSelection(skill.skill_name)}
                                  className="mt-1"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{skill.skill_name}</h4>
                                {skill.market_demand === 'high' && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    High demand
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={`text-xs ${getCategoryColor(skill.category)}`}>
                                  {skill.category}
                                </Badge>
                                <span className="text-xs text-gray-600">
                                  {skill.proficiency_level}
                                </span>
                                {skill.skill_group && (
                                  <span className="text-xs text-muted-foreground">
                                    • {skill.skill_group}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {skill.description}
                              </p>
                              
                              {skill.reason && (
                                <button
                                  onClick={() => toggleSkillExpand(skill.skill_name)}
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-1"
                                >
                                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  Why this skill?
                                </button>
                              )}
                              
                              {isExpanded && skill.reason && (
                                <p className="text-xs text-muted-foreground italic mt-2 p-2 bg-blue-50 rounded">
                                  {skill.reason}
                                </p>
                              )}
                              </div>
                            </div>
                            
                            <Button
                              size="sm"
                              variant={isAdded ? "secondary" : "default"}
                              disabled={isAdded}
                              onClick={() => handleAddSkill(skill)}
                              className="flex items-center gap-1 shrink-0"
                            >
                              {isAdded ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3" />
                                  Add
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
          </div>
        )}

        {!loading && suggestions.length === 0 && positionTitle && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Click "Refresh" to get AI-powered suggestions
            </p>
            <Button onClick={fetchSuggestions} className="flex items-center gap-2 mx-auto">
              <Sparkles className="h-4 w-4" />
              Get AI Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}