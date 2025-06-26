import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Database, Plus, CheckCircle, Info, RefreshCw } from 'lucide-react';
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
  onAddSkill: (skill: any, category: 'required' | 'nice-to-have') => void;
  existingSkills: Array<{ skill_id: string; skill_name: string }>;
}

export function AISkillSuggestions({
  positionTitle,
  positionDescription,
  positionLevel,
  department,
  onAddSkill,
  existingSkills
}: AISkillSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [summary, setSummary] = useState<any>(null);

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
      toast.success(`Found ${data.skills?.length || 0} skill suggestions`);
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

    const category = skill.category === 'essential' || skill.category === 'important' 
      ? 'required' 
      : 'nice-to-have';

    onAddSkill(skillData, category);
    setAddedSkills(prev => new Set(prev).add(skill.skill_name));
    toast.success(`Added ${skill.skill_name} to ${category} skills`);
  };

  const isSkillAdded = (skillName: string) => {
    return addedSkills.has(skillName) || 
           existingSkills.some(s => s.skill_name === skillName);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'important':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'nice-to-have':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Auto-fetch when description changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (positionTitle && positionDescription && positionDescription.length > 50) {
        fetchSuggestions();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [positionDescription]);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Skill Suggestions
            </CardTitle>
            <CardDescription>
              Powered by OpenAI and your skills database
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
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Enter a position title to get AI-powered skill suggestions
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {summary && !loading && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Total suggestions:</span>
                <span className="font-medium ml-1">{summary.total_suggestions}</span>
              </div>
              <div>
                <span className="text-muted-foreground">From database:</span>
                <span className="font-medium ml-1">{summary.from_database}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Essential:</span>
                <span className="font-medium ml-1">{summary.essential_count}</span>
              </div>
              <div>
                <span className="text-muted-foreground">AI generated:</span>
                <span className="font-medium ml-1">{summary.from_ai}</span>
              </div>
            </div>
          </div>
        )}

        {suggestions.length > 0 && !loading && (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {suggestions.map((skill, index) => {
                const isAdded = isSkillAdded(skill.skill_name);
                
                return (
                  <div
                    key={`${skill.skill_id || index}`}
                    className={`p-3 border rounded-lg transition-all ${
                      isAdded ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{skill.skill_name}</h4>
                          {skill.source === 'database' ? (
                            <Database className="h-4 w-4 text-blue-600" title="From your database" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-purple-600" title="AI suggested" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{skill.description}</p>
                        
                        {skill.reason && (
                          <p className="text-xs text-muted-foreground italic">
                            <span className="font-medium">Why: </span>{skill.reason}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getCategoryColor(skill.category)}>
                            {skill.category}
                          </Badge>
                          <Badge variant="secondary" className={getProficiencyColor(skill.proficiency_level)}>
                            {skill.proficiency_level}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={isAdded ? "secondary" : "default"}
                        disabled={isAdded}
                        onClick={() => handleAddSkill(skill)}
                        className="flex items-center gap-1"
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {suggestions.length === 0 && !loading && positionTitle && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Click "Refresh" to get AI-powered skill suggestions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}