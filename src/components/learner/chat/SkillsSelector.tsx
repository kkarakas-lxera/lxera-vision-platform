import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X, Loader2, Brain, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Skill {
  skill_name: string;
  skill_id?: string | null;
  category?: string;
  source?: 'cv' | 'position' | 'manual';
  proficiency_level?: number;
}

interface PositionSkill {
  skill_id?: string;
  skill_name: string;
  skill_type?: string;
  proficiency_level: string;
  is_mandatory: boolean;
}

interface SkillsSelectorProps {
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
    'basic': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 3
  };
  return mapping[level.toLowerCase()] || 1;
};

export default function SkillsSelector({
  extractedSkills = [],
  existingSkills = [],
  positionRequiredSkills = [],
  positionNiceToHaveSkills = [],
  positionTitle,
  onComplete,
  onSkip
}: SkillsSelectorProps) {
  const [suggestedSkills, setSuggestedSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [manualSkillInput, setManualSkillInput] = useState('');

  useEffect(() => {
    // 1) Pin required skills (non-removable)
    const required: Skill[] = (positionRequiredSkills || [])
      .filter(s => !!s.skill_name)
      .map(s => ({
        skill_name: s.skill_name,
        skill_id: s.skill_id,
        category: 'position_required',
        source: 'position',
        proficiency_level: mapProficiencyLevel(s.proficiency_level)
      }));

    // 2) Preselect CV-extracted skills (unique, excluding required)
    const cvSelected: Skill[] = [];
    (extractedSkills || []).forEach((skill) => {
      const skillName = (skill?.skill_name || skill?.name || skill) as string;
      if (!skillName || typeof skillName !== 'string') return;
      const lower = skillName.toLowerCase();
      const isRequired = required.find(r => r.skill_name.toLowerCase() === lower);
      const alreadyIn = cvSelected.find(r => r.skill_name.toLowerCase() === lower);
      if (!isRequired && !alreadyIn) {
        cvSelected.push({
          skill_name: skillName,
          category: 'cv_extracted',
          source: 'cv',
          proficiency_level: (skill?.proficiency_level as number | undefined)
        });
      }
    });

    // 3) Suggestions from nice-to-have (excluding required and already selected)
    const suggestions: Skill[] = [];
    (positionNiceToHaveSkills || []).forEach((s) => {
      if (!s.skill_name) return;
      const lower = s.skill_name.toLowerCase();
      const existsInRequired = required.find(r => r.skill_name.toLowerCase() === lower);
      const existsInSelected = cvSelected.find(r => r.skill_name.toLowerCase() === lower);
      if (!existsInRequired && !existsInSelected) {
        suggestions.push({
          skill_name: s.skill_name,
          skill_id: s.skill_id,
          category: 'position_nice',
          source: 'position',
          proficiency_level: mapProficiencyLevel(s.proficiency_level)
        });
      }
    });

    // Optionally include previously existing user skills (manual) if not present
    (existingSkills || []).forEach((skill) => {
      const skillName = (skill?.skill_name || skill?.name || skill) as string;
      if (!skillName || typeof skillName !== 'string') return;
      const lower = skillName.toLowerCase();
      const alreadySelected = cvSelected.find(s => s.skill_name.toLowerCase() === lower) || required.find(s => s.skill_name.toLowerCase() === lower);
      const alreadySuggested = suggestions.find(s => s.skill_name.toLowerCase() === lower);
      if (!alreadySelected && !alreadySuggested) {
        suggestions.push({
          skill_name: skillName,
          category: 'other',
          source: 'manual',
          proficiency_level: (skill?.proficiency_level as number | undefined)
        });
      }
    });

    // Commit state: required are pinned by being included in selected list
    const initialSelected = [...required, ...cvSelected];
    setSelectedSkills(initialSelected);
    setSuggestedSkills(suggestions);
  }, [extractedSkills, existingSkills, positionRequiredSkills, positionNiceToHaveSkills]);

  useEffect(() => {
    onComplete(selectedSkills);
  }, [selectedSkills, onComplete]);

  const addSkillToSelected = (skill: Skill) => {
    if (!selectedSkills.find(s => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase())) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSuggestedSkills(suggestedSkills.filter(s => s.skill_name.toLowerCase() !== skill.skill_name.toLowerCase()));
  };

  const removeSkillFromSelected = (skill: Skill) => {
    // Prevent removing required skills
    if (skill.category === 'position_required') {
      toast.info('Required skills are pinned for your position');
      return;
    }
    setSelectedSkills(selectedSkills.filter(s => s.skill_name.toLowerCase() !== skill.skill_name.toLowerCase()));
    if (skill.source === 'cv' || skill.source === 'position') {
      setSuggestedSkills([...suggestedSkills, skill].sort((a, b) => a.skill_name.localeCompare(b.skill_name)));
    }
  };

  const handleManualAdd = () => {
    if (manualSkillInput.trim()) {
      const newSkill: Skill = {
        skill_name: manualSkillInput.trim(),
        category: 'other',
        source: 'manual',
        proficiency_level: 1
      };
      if (!selectedSkills.find(s => s.skill_name.toLowerCase() === newSkill.skill_name.toLowerCase())) {
        setSelectedSkills([...selectedSkills, newSkill]);
      }
      setManualSkillInput('');
    }
  };

  const groupSkillsByCategory = (skills: Skill[]) => {
    const grouped: Record<string, Skill[]> = {};
    skills.forEach(skill => {
      const category = skill.category || 'other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(skill);
    });
    return grouped;
  };

  const getCategoryDisplayName = (category: string) => {
    const displayNames: Record<string, string> = {
      'position_required': 'Required for Position',
      'position_nice': 'Nice to Have',
      'cv_extracted': 'From Your CV',
      'other': 'Other Skills'
    };
    return displayNames[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'position_required': 'text-red-700 bg-red-50 border-red-200',
      'position_nice': 'text-orange-700 bg-orange-50 border-orange-200',
      'cv_extracted': 'text-blue-700 bg-blue-50 border-blue-200',
      'other': 'text-gray-700 bg-gray-50 border-gray-200'
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
        {/* Left Column - Suggestions (no required here) */}
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
                      <Badge
                        variant="outline"
                        className={cn(
                          "cursor-pointer transition-all",
                          getCategoryColor(skill.category || 'other'),
                          "hover:scale-105"
                        )}
                        onClick={() => addSkillToSelected(skill)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {skill.skill_name}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
            {suggestedSkills.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No additional skills to add
              </p>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Selected (includes pinned required and CV) */}
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
                        <div className={cn(
                          "flex items-center justify-between p-3 rounded-md border",
                          getCategoryColor(skill.category || 'other')
                        )}>
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