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

interface SkillsSelectorProps {
  extractedSkills?: any[];
  existingSkills?: any[];
  onComplete: (skills: Skill[]) => void;
  onSkip?: () => void;
}

export default function SkillsSelector({
  extractedSkills = [],
  existingSkills = [],
  onComplete,
  onSkip
}: SkillsSelectorProps) {
  const [suggestedSkills, setSuggestedSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [manualSkillInput, setManualSkillInput] = useState('');

  useEffect(() => {
    // Initialize with extracted skills and existing skills
    const allSuggested: Skill[] = [];
    
    // Add CV extracted skills
    extractedSkills.forEach(skill => {
      allSuggested.push({
        skill_name: skill.skill_name || skill.name || skill,
        category: skill.category || 'technical',
        source: 'cv',
        proficiency_level: skill.proficiency_level
      });
    });

    // Add existing skills not already in suggested
    existingSkills.forEach(skill => {
      const skillName = skill.skill_name || skill.name || skill;
      if (!allSuggested.find(s => s.skill_name.toLowerCase() === skillName.toLowerCase())) {
        allSuggested.push({
          skill_name: skillName,
          category: skill.category || 'other',
          source: 'position',
          proficiency_level: skill.proficiency_level
        });
      }
    });

    setSuggestedSkills(allSuggested);
    
    // Pre-select some skills if they're from CV
    const preSelected = allSuggested.filter(s => s.source === 'cv').slice(0, 5);
    setSelectedSkills(preSelected);
  }, [extractedSkills, existingSkills]);

  useEffect(() => {
    // Auto-update parent when selection changes
    onComplete(selectedSkills);
  }, [selectedSkills, onComplete]);

  const addSkillToSelected = (skill: Skill) => {
    if (!selectedSkills.find(s => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase())) {
      // Set default proficiency level to 1 (Learning) if not specified
      const skillWithLevel = { ...skill, proficiency_level: skill.proficiency_level || 1 };
      setSelectedSkills([...selectedSkills, skillWithLevel]);
    }
    // Remove from suggested
    setSuggestedSkills(suggestedSkills.filter(s => s.skill_name !== skill.skill_name));
  };

  const removeSkillFromSelected = (skill: Skill) => {
    setSelectedSkills(selectedSkills.filter(s => s.skill_name !== skill.skill_name));
    // Add back to suggested if it was from CV or position
    if (skill.source === 'cv' || skill.source === 'position') {
      setSuggestedSkills([...suggestedSkills, skill].sort((a, b) => 
        a.skill_name.localeCompare(b.skill_name)
      ));
    }
  };

  const updateSkillProficiency = (skillName: string, level: number) => {
    setSelectedSkills(selectedSkills.map(skill => 
      skill.skill_name === skillName 
        ? { ...skill, proficiency_level: level }
        : skill
    ));
  };

  const getProficiencyIcon = (level: number) => {
    switch(level) {
      case 0: return '❌';
      case 1: return '🟡';
      case 2: return '🟢';
      case 3: return '⭐';
      default: return '🟡';
    }
  };

  const getProficiencyLabel = (level: number) => {
    switch(level) {
      case 0: return 'None';
      case 1: return 'Learning';
      case 2: return 'Using';
      case 3: return 'Expert';
      default: return 'Learning';
    }
  };

  const handleManualAdd = () => {
    if (manualSkillInput.trim()) {
      const newSkill: Skill = {
        skill_name: manualSkillInput.trim(),
        category: 'other',
        source: 'manual',
        proficiency_level: 1 // Default to Learning
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
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(skill);
    });
    return grouped;
  };

  const suggestedGrouped = groupSkillsByCategory(suggestedSkills);
  const selectedGrouped = groupSkillsByCategory(selectedSkills);

  if (suggestedSkills.length === 0 && selectedSkills.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-3">No skills selected yet</p>
            <p className="text-xs text-gray-400 mb-4">Add from suggestions or enter manually</p>
            <div className="flex gap-2 justify-center">
              <Input
                placeholder="Enter a skill..."
                value={manualSkillInput}
                onChange={(e) => setManualSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualAdd()}
                className="max-w-xs"
              />
              <Button onClick={handleManualAdd} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column - Suggested Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Suggested Skills</CardTitle>
          <p className="text-xs text-muted-foreground">
            Click to add to your profile
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(suggestedGrouped).map(([category, skills]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                {category}
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
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => addSkillToSelected(skill)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {skill.skill_name}
                      {skill.source === 'cv' && (
                        <span className="ml-1 text-xs opacity-60">(From CV)</span>
                      )}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
          
          {suggestedSkills.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              All suggested skills have been added
            </p>
          )}
        </CardContent>
      </Card>

      {/* Right Column - Selected Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selected Skills</CardTitle>
          <p className="text-xs text-muted-foreground">
            Your skills profile ({selectedSkills.length} skills)
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <span>🟡</span> Learning
            </span>
            <span className="flex items-center gap-1">
              <span>🟢</span> Using
            </span>
            <span className="flex items-center gap-1">
              <span>⭐</span> Expert
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(selectedGrouped).map(([category, skills]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                {category}
              </h4>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {skills.map((skill) => (
                    <motion.div
                      key={skill.skill_name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="w-full"
                    >
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getProficiencyIcon(skill.proficiency_level || 1)}</span>
                          <span className="text-sm font-medium">{skill.skill_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1 mr-2">
                            {[1, 2, 3].map((level) => (
                              <button
                                key={level}
                                onClick={() => updateSkillProficiency(skill.skill_name, level)}
                                className={cn(
                                  "w-6 h-6 text-xs rounded transition-colors",
                                  skill.proficiency_level === level 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-gray-200 hover:bg-gray-300"
                                )}
                                title={getProficiencyLabel(level)}
                              >
                                {level}
                              </button>
                            ))}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => removeSkillFromSelected(skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
          
          {/* Manual Add */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Add skills manually</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter a skill..."
                value={manualSkillInput}
                onChange={(e) => setManualSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualAdd()}
                className="text-sm"
              />
              <Button onClick={handleManualAdd} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}