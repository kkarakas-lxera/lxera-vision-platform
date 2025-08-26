import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X, Loader2, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Skill {
  skill_name: string;
  skill_id?: string | null;
  category?: string;
  source?: 'cv' | 'position' | 'manual';
  proficiency_level?: number;
  suggestion_reason?: string;
}

interface PositionSkill {
  skill_id?: string;
  skill_name: string;
  skill_type?: string;
  proficiency_level: string;
  is_mandatory: boolean;
}

interface SkillsSelectorProps {
  employeeId: string;
  extractedSkills?: any[];
  existingSkills?: any[];
  positionRequiredSkills?: PositionSkill[];
  positionNiceToHaveSkills?: PositionSkill[];
  positionTitle?: string;
  onComplete: (skills: Skill[]) => void;
  onSkip?: () => void;
}

// Helper function to map proficiency levels
const mapProficiencyLevel = (level: string | number | undefined): number => {
  if (typeof level === 'number') return level;
  if (!level || typeof level !== 'string') return 1;
  const mapping: Record<string, number> = {
    basic: 1,
    intermediate: 2,
    advanced: 3,
    expert: 3,
  };
  return mapping[level.toLowerCase()] || 1;
};

export default function SkillsSelector({
  employeeId,
  extractedSkills = [],
  existingSkills = [],
  positionRequiredSkills = [],
  positionNiceToHaveSkills = [],
  positionTitle,
  onComplete,
  onSkip,
}: SkillsSelectorProps) {
  const [suggestedSkills, setSuggestedSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [manualSkillInput, setManualSkillInput] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    // 1) Pin required skills (non-removable)
    const required: Skill[] = (positionRequiredSkills || [])
      .filter((s) => !!s.skill_name)
      .map((s) => ({
        skill_name: s.skill_name,
        skill_id: s.skill_id,
        category: 'position_required',
        source: 'position',
        proficiency_level: mapProficiencyLevel(s.proficiency_level),
      }));

    // 2) Preselect CV-extracted skills (unique, excluding required)
    const selectedFromCV: Skill[] = [];
    (extractedSkills || []).forEach((skill) => {
      const skillName = (skill?.skill_name || skill?.name || skill) as string;
      if (!skillName || typeof skillName !== 'string') return;
      const lower = skillName.toLowerCase();
      if (required.find((r) => r.skill_name.toLowerCase() === lower)) return;
      if (selectedFromCV.find((r) => r.skill_name.toLowerCase() === lower)) return;
      selectedFromCV.push({
        skill_name: skillName,
        category: 'cv_extracted',
        source: 'cv',
        proficiency_level: (skill?.proficiency_level as number | undefined),
      });
    });

    // 3) Include existing (saved) selected skills
    const selectedFromExisting: Skill[] = [];
    (existingSkills || []).forEach((skill: any) => {
      const skillName = (skill?.skill_name || skill?.name || skill) as string;
      if (!skillName || typeof skillName !== 'string') return;
      const lower = skillName.toLowerCase();
      const alreadySelected = required.find((r) => r.skill_name.toLowerCase() === lower) ||
        selectedFromCV.find((s) => s.skill_name.toLowerCase() === lower) ||
        selectedFromExisting.find((s) => s.skill_name.toLowerCase() === lower);
      if (!alreadySelected) {
        selectedFromExisting.push({
          skill_name: skillName,
          category: skill?.category || 'other',
          source: (skill?.source as 'cv' | 'position' | 'manual') || 'manual',
          proficiency_level: (skill?.proficiency_level as number | undefined) || 1,
        });
      }
    });

    // 4) Suggestions from nice-to-have (excluding everything selected)
    const selectedLower = new Set<string>([...required, ...selectedFromCV, ...selectedFromExisting].map(s => s.skill_name.toLowerCase()));
    const suggestions: Skill[] = [];
    (positionNiceToHaveSkills || []).forEach((s) => {
      if (!s.skill_name) return;
      const lower = s.skill_name.toLowerCase();
      if (!selectedLower.has(lower)) {
        suggestions.push({
          skill_name: s.skill_name,
          skill_id: s.skill_id,
          category: 'position_nice',
          source: 'position',
          proficiency_level: mapProficiencyLevel(s.proficiency_level),
        });
      }
    });

    const initialSelected = [...required, ...selectedFromCV, ...selectedFromExisting];
    setSelectedSkills(initialSelected);
    setSuggestedSkills(suggestions);
  }, [extractedSkills, existingSkills, positionRequiredSkills, positionNiceToHaveSkills]);

  // Fetch AI suggestions from Groq to supplement position-based suggestions
  useEffect(() => {
    const fetchAISuggestions = async () => {
      if (!employeeId) return;
      if (isSuggesting) return;
      
      // Always try to fetch AI suggestions if we don't have enough suggestions
      // or if we only have position-based suggestions
      const hasOnlyPositionSuggestions = suggestedSkills.every(s => s.source === 'position');
      const shouldFetchAI = suggestedSkills.length < 5 || hasOnlyPositionSuggestions;
      
      if (!shouldFetchAI) return;
      
      console.log('[SKILLS_AI] Fetching AI suggestions from Groq', { employeeId, currentSuggestions: suggestedSkills.length });
      
      try {
        setIsSuggesting(true);
        const { data, error } = await supabase.functions.invoke('suggest-skills', {
          body: { employee_id: employeeId },
        });
        if (error) {
          console.error('[SKILLS_AI] Error:', error);
          throw error;
        }
        
        console.log('[SKILLS_AI] Response:', data);
        
        const aiSuggestions = Array.isArray(data?.suggestions)
          ? (data.suggestions as Array<{ skill_name: string; category?: string; reason?: string; confidence?: number }>)
          : [];
          
        console.log('[SKILLS_AI] AI suggestions received:', aiSuggestions.length);
        
        // Map to Skill type
        const mapped: Skill[] = aiSuggestions
          .filter((s) => s.skill_name)
          .map((s) => ({
            skill_name: s.skill_name,
            category: s.category || 'adjacent',
            source: 'manual', // Mark as manual for UI purposes
            proficiency_level: 1,
            suggestion_reason: s.reason || undefined,
          }));
        
        // De-duplicate vs all selected skills
        const lowerSelected = new Set([
          ...selectedSkills.map((s) => s.skill_name.toLowerCase()),
          ...suggestedSkills.map((s) => s.skill_name.toLowerCase())
        ]);
        const filtered = mapped.filter((s) => !lowerSelected.has(s.skill_name.toLowerCase()));
        
        console.log('[SKILLS_AI] Filtered suggestions:', filtered.length);
        
        // Add to existing suggestions instead of replacing
        setSuggestedSkills(prev => [...prev, ...filtered]);
      } catch (e: any) {
        console.error('[SKILLS_AI] Failed to fetch suggestions:', e);
      } finally {
        setIsSuggesting(false);
      }
    };
    fetchAISuggestions();
  }, [employeeId, selectedSkills.length]); // Remove suggestedSkills.length dependency to prevent infinite loop

  useEffect(() => {
    onComplete(selectedSkills);
  }, [selectedSkills, onComplete]);

  const addSkillToSelected = (skill: Skill) => {
    setSelectedSkills((prev) => {
      if (prev.find((s) => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase())) return prev;
      return [...prev, skill];
    });
    setSuggestedSkills((prev) => prev.filter((s) => s.skill_name.toLowerCase() !== skill.skill_name.toLowerCase()));
  };

  const removeSkillFromSelected = async (skill: Skill) => {
    if (skill.category === 'position_required') {
      toast.info('Required skills are pinned for your position');
      return;
    }
    
    console.log('[SKILLS_REMOVE] Removing skill:', skill);
    
    // Remove from UI immediately
    setSelectedSkills((prev) => prev.filter((s) => s.skill_name.toLowerCase() !== skill.skill_name.toLowerCase()));
    
    // If it's a CV-extracted skill, remove from database
    if (skill.source === 'cv') {
      try {
        const { error } = await supabase
          .from('employee_skills')
          .delete()
          .eq('employee_id', employeeId)
          .eq('skill_name', skill.skill_name)
          .eq('source', 'cv');
          
        if (error) {
          console.error('[SKILLS_REMOVE] Database error:', error);
          toast.error('Failed to remove skill from database');
          // Revert UI change
          setSelectedSkills((prev) => [...prev, skill]);
          return;
        }
        
        console.log('[SKILLS_REMOVE] Successfully removed from database:', skill.skill_name);
        toast.success('Skill removed');
      } catch (e) {
        console.error('[SKILLS_REMOVE] Exception:', e);
        toast.error('Failed to remove skill');
        // Revert UI change
        setSelectedSkills((prev) => [...prev, skill]);
        return;
      }
    }
    
    // Move back to suggestions if it was from CV or position
    if (skill.source === 'cv' || skill.source === 'position') {
      setSuggestedSkills((prev) => {
        const exists = prev.find((s) => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase());
        return exists ? prev : [...prev, skill].sort((a, b) => a.skill_name.localeCompare(b.skill_name));
      });
    }
  };

  const handleManualAdd = () => {
    if (manualSkillInput.trim()) {
      const newSkill: Skill = {
        skill_name: manualSkillInput.trim(),
        category: 'other',
        source: 'manual',
        proficiency_level: 1,
      };
      if (!selectedSkills.find((s) => s.skill_name.toLowerCase() === newSkill.skill_name.toLowerCase())) {
        setSelectedSkills([...selectedSkills, newSkill]);
      }
      setManualSkillInput('');
    }
  };

  const groupSkillsByCategory = (skills: Skill[]) => {
    const grouped: Record<string, Skill[]> = {};
    skills.forEach((skill) => {
      const category = skill.category || 'other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(skill);
    });
    return grouped;
  };

  const getCategoryDisplayName = (category: string) => {
    const displayNames: Record<string, string> = {
      position_required: 'Required for Position',
      position_nice: 'Nice to Have',
      cv_extracted: 'From Your CV',
      other: 'Other Skills',
      adjacent: 'Suggested by AI',
    };
    return displayNames[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      position_required: 'text-red-700 bg-red-50 border-red-200',
      position_nice: 'text-orange-700 bg-orange-50 border-orange-200',
      cv_extracted: 'text-blue-700 bg-blue-50 border-blue-200',
      other: 'text-gray-700 bg-gray-50 border-gray-200',
      adjacent: 'text-purple-700 bg-purple-50 border-purple-200',
    };
    return colors[category] || 'text-gray-700 bg-gray-50 border-gray-200';
  };

  const suggestedGrouped = groupSkillsByCategory(suggestedSkills);
  const selectedGrouped = groupSkillsByCategory(selectedSkills);

  return (
    <div className="space-y-4">
      {/* Intro copy */}
      <Card className="border-blue-200">
        <CardContent className="pt-4 pb-3">
          <p className="text-sm text-muted-foreground">
            We pre-filled skills from your resume. Remove any that don’t fit or add missing ones. Required skills are pinned.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Left Column - Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Additional Skills to Add</CardTitle>
            <p className="text-xs text-muted-foreground">
              Click to add any skills you have that aren't already selected
            </p>
            {positionTitle && (
              <p className="text-xs text-muted-foreground mt-1">
                Position: <span className="font-medium">{positionTitle}</span>
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isSuggesting && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Finding additional skills tailored to your CV and role...
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-6 w-28 rounded-full bg-muted animate-pulse" />
                  ))}
                </div>
              </div>
            )}

            {!isSuggesting && Object.keys(suggestedGrouped).length > 0 && (
              <>
                {Object.entries(suggestedGrouped).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {getCategoryDisplayName(category)}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <motion.div
                          key={skill.skill_name}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="outline"
                                  className={cn('cursor-pointer transition-all', getCategoryColor(skill.category || 'other'), 'hover:scale-105')}
                                  onClick={() => addSkillToSelected(skill)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  {skill.skill_name}
                                </Badge>
                              </TooltipTrigger>
                              {skill.suggestion_reason && (
                                <TooltipContent>
                                  <p className="max-w-xs text-xs">{skill.suggestion_reason}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {!isSuggesting && suggestedSkills.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No additional skills to add</p>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Selected */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Skills</CardTitle>
            <p className="text-xs text-muted-foreground">Total: {selectedSkills.length}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(selectedGrouped).map(([category, skills]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {getCategoryDisplayName(category)}
                </h4>
                <div className="space-y-2">
                  <AnimatePresence>
                    {skills.map((skill) => (
                      <motion.div
                        key={skill.skill_name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                      >
                        <div className={cn('flex items-center justify-between p-3 rounded-md border', getCategoryColor(skill.category || 'other'))}>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">{skill.skill_name}</span>
                            {skill.category === 'position_required' && (
                              <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                Pinned
                              </Badge>
                            )}
                          </div>
                          {skill.category !== 'position_required' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-transparent"
                              onClick={() => removeSkillFromSelected(skill)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}

            {/* Manual Add */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-2">Add custom skills</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a skill name..."
                  value={manualSkillInput}
                  onChange={(e) => setManualSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualAdd()}
                  className="text-sm"
                />
                <Button onClick={handleManualAdd} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Inline Continue CTA */}
            <div className="pt-4 flex justify-end">
              <Button onClick={() => { onComplete(selectedSkills); onSkip?.(); }}>
                Looks good, continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}