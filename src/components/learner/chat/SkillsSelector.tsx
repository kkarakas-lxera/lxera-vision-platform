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
    // Initialize with skills from various sources
    let allSuggested: Skill[] = [];
    const selectedByDefault: Skill[] = [];
    
    // Add position required skills first (highest priority)
    positionRequiredSkills.forEach(skill => {
      if (!skill.skill_name) return; // Skip if no skill name
      const skillObj: Skill = {
        skill_name: skill.skill_name,
        skill_id: skill.skill_id,
        category: 'position_required',
        source: 'position',
        proficiency_level: mapProficiencyLevel(skill.proficiency_level)
      };
      allSuggested.push(skillObj);
    });

    // Add nice-to-have position skills
    positionNiceToHaveSkills.forEach(skill => {
      if (!skill.skill_name) return; // Skip if no skill name
      const skillObj: Skill = {
        skill_name: skill.skill_name,
        skill_id: skill.skill_id,
        category: 'position_nice',
        source: 'position',
        proficiency_level: mapProficiencyLevel(skill.proficiency_level)
      };
      allSuggested.push(skillObj);
    });
    
    // Add CV extracted skills
    extractedSkills.forEach(skill => {
      const skillName = skill.skill_name || skill.name || skill;
      // Ensure skillName is a string
      if (!skillName || typeof skillName !== 'string') return;
      
      // Check if skill already exists from position
      const existing = allSuggested.find(s => s.skill_name && skillName && s.skill_name.toLowerCase() === skillName.toLowerCase());
      
      if (!existing) {
        // CV skill that's not in position requirements - add directly to selected
        const cvSkill = {
          skill_name: skillName,
          category: 'cv_extracted',
          source: 'cv',
          proficiency_level: skill.proficiency_level
        };
        // Don't add to suggested, only to selected
        selectedByDefault.push(cvSkill);
      } else if (existing.source === 'position') {
        // If position skill is also in CV, pre-select it and remove from suggested
        selectedByDefault.push(existing);
        // Remove from allSuggested since it's pre-selected
        allSuggested = allSuggested.filter(s => s.skill_name !== existing.skill_name);
      }
    });

    // Add existing skills not already in suggested
    existingSkills.forEach(skill => {
      const skillName = skill.skill_name || skill.name || skill;
      // Ensure skillName is a string
      if (!skillName || typeof skillName !== 'string') return;
      
      if (!allSuggested.find(s => s.skill_name && skillName && s.skill_name.toLowerCase() === skillName.toLowerCase())) {
        allSuggested.push({
          skill_name: skillName,
          category: 'other',
          source: 'manual',
          proficiency_level: skill.proficiency_level
        });
      }
    });

    // Filter out any skills from suggested that are already in selected
    const finalSuggested = allSuggested.filter(
      suggested => !selectedByDefault.find(
        selected => selected.skill_name.toLowerCase() === suggested.skill_name.toLowerCase()
      )
    );
    
    setSuggestedSkills(finalSuggested);
    setSelectedSkills(selectedByDefault);
  }, [extractedSkills, existingSkills, positionRequiredSkills, positionNiceToHaveSkills]);

  useEffect(() => {
    // Auto-update parent when selection changes
    onComplete(selectedSkills);
  }, [selectedSkills, onComplete]);

  const addSkillToSelected = (skill: Skill) => {
    if (!selectedSkills.find(s => s.skill_name.toLowerCase() === skill.skill_name.toLowerCase())) {
      // Just add the skill without setting proficiency (will be verified later)
      setSelectedSkills([...selectedSkills, skill]);
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

  // Removed proficiency update functions - will be handled in verification step

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

  // Helper function to get category display name
  const getCategoryDisplayName = (category: string) => {
    const displayNames: Record<string, string> = {
      'position_required': 'Required for Position',
      'position_nice': 'Nice to Have',
      'cv_extracted': 'From Your CV',
      'other': 'Other Skills'
    };
    return displayNames[category] || category;
  };

  // Helper function to get category color
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

  // Calculate skill counts by source
  const skillCounts = {
    cvSkills: selectedSkills.filter(s => s.source === 'cv').length,
    positionRequired: positionRequiredSkills.length,
    positionRequiredSelected: selectedSkills.filter(s => s.category === 'position_required').length,
    positionNice: positionNiceToHaveSkills.length,
    positionNiceSelected: selectedSkills.filter(s => s.category === 'position_nice').length,
    manual: selectedSkills.filter(s => s.source === 'manual').length
  };

  return (
    <div className="space-y-4">
      {/* Skills Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-700">{skillCounts.cvSkills}</p>
              <p className="text-xs text-gray-600">From Your CV</p>
              <p className="text-xs text-green-600 mt-1">✓ Auto-included</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-700">
                {skillCounts.positionRequiredSelected}/{skillCounts.positionRequired}
              </p>
              <p className="text-xs text-gray-600">Position Required</p>
              <p className="text-xs text-gray-500 mt-1">Click to add</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">{selectedSkills.length}</p>
              <p className="text-xs text-gray-600">Total Selected</p>
              <p className="text-xs text-gray-500 mt-1">Ready to verify</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
      {/* Left Column - Suggested Skills */}
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
                {category === 'position_required' && (
                  <span className="ml-1 text-xs text-red-600">(Required)</span>
                )}
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

      {/* Right Column - Selected Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Selected Skills</CardTitle>
          <p className="text-xs text-muted-foreground">
            Total: {selectedSkills.length} skills
          </p>
          
          {/* Info Box */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs">
            <div className="space-y-1">
              <p className="flex items-center gap-1">
                <Check className="h-3 w-3 text-blue-600" />
                <span>Skills from your CV have been automatically included</span>
              </p>
              <p className="flex items-center gap-1">
                <Plus className="h-3 w-3 text-blue-600" />
                <span>Add any position-required skills you possess</span>
              </p>
              <p className="flex items-center gap-1">
                <Brain className="h-3 w-3 text-blue-600" />
                <span>Proficiency levels will be AI-verified in the next step</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(selectedGrouped).map(([category, skills]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                {getCategoryDisplayName(category)}
                {category === 'position_required' && (
                  <span className="ml-1 text-xs text-red-600">(Required)</span>
                )}
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
                              Required
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-transparent"
                          onClick={() => removeSkillFromSelected(skill)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
          
          {selectedSkills.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">
                No skills selected yet
              </p>
              <p className="text-xs text-muted-foreground">
                Select skills from the left panel
              </p>
            </div>
          )}
          
          {/* Manual Add */}
          <div className="pt-4 border-t">
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
        </CardContent>
      </Card>
    </div>
    </div>
  );
}