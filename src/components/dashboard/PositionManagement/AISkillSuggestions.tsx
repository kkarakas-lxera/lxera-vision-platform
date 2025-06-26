import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Sparkles, 
  Database, 
  Plus, 
  CheckCircle, 
  Info, 
  RefreshCw, 
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SkillSuggestion {
  skill_id?: string;
  skill_name: string;
  category: 'essential' | 'important' | 'nice-to-have';
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  source: 'database' | 'ai';
  relevance_score?: number;
  reason?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<any>(null);
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());

  const fetchSuggestions = async () => {
    if (!positionTitle) {
      toast.error('Please enter a position title first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
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
      
      toast.success(`Found ${data.skills?.length || 0} skills`);
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
      setError(err.message || 'Failed to get AI suggestions');
      toast.error('Failed to get AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (skill: SkillSuggestion) => {
    const skillData = {
      skill_id: skill.skill_id || `ai_${Date.now()}_${Math.random()}`,
      skill_name: skill.skill_name,
      proficiency_level: skill.proficiency_level === 'basic' ? 1 :
                        skill.proficiency_level === 'intermediate' ? 2 :
                        skill.proficiency_level === 'advanced' ? 3 : 4,
      description: skill.description,
      source: skill.source
    };

    onAddSkill(skillData);
    setAddedSkills(prev => new Set(prev).add(skill.skill_name));
    toast.success(`Added ${skill.skill_name} to required skills`);
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
        return 'bg-red-500 text-white';
      case 'important':
        return 'bg-orange-500 text-white';
      case 'nice-to-have':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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

  // Show all suggestions
  const filteredSuggestions = suggestions;

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Skills Suggestions
            </CardTitle>
            <CardDescription>
              Smart skill recommendations powered by OpenAI & your database
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
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
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
                <div className="p-3 bg-purple-50 rounded-lg text-sm border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-purple-900">AI Analysis Summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-purple-800">
                    <div>Database matches: <span className="font-medium">{summary.from_database}</span></div>
                    <div>AI suggestions: <span className="font-medium">{summary.from_ai}</span></div>
                    <div>Essential skills: <span className="font-medium">{summary.essential_count}</span></div>
                    <div>Important skills: <span className="font-medium">{summary.important_count}</span></div>
                  </div>
                </div>
              )}

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
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{skill.skill_name}</h4>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      {skill.source === 'database' ? (
                                        <Database className="h-4 w-4 text-blue-600" />
                                      ) : (
                                        <Sparkles className="h-4 w-4 text-purple-600" />
                                      )}
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {skill.source === 'database' ? 'From your skills database' : 'AI generated'}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`text-xs ${getCategoryColor(skill.category)}`}>
                                  {skill.category}
                                </Badge>
                                <span className="text-xs text-gray-600">
                                  {getProficiencyIcon(skill.proficiency_level)} {skill.proficiency_level}
                                </span>
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