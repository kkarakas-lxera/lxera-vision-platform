import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Skill {
  skill_name: string;
  skill_id: string | null;
  proficiency_level?: number;
  is_from_position: boolean;
  is_from_cv: boolean;
  order: number;
}

interface ChatSkillsReviewProps {
  employeeId: string;
  onComplete: () => void;
}

// Reuse emoji mapping from old component
const getSkillEmoji = (skillName: string): string => {
  const name = skillName.toLowerCase();
  
  // Programming languages
  if (name.includes('python')) return '🐍';
  if (name.includes('javascript') || name.includes('js')) return '📜';
  if (name.includes('java') && !name.includes('script')) return '☕';
  if (name.includes('react')) return '⚛️';
  if (name.includes('node')) return '🟢';
  if (name.includes('docker')) return '🐳';
  if (name.includes('kubernetes') || name.includes('k8s')) return '☸️';
  if (name.includes('aws') || name.includes('azure') || name.includes('cloud')) return '☁️';
  if (name.includes('database') || name.includes('sql') || name.includes('postgres') || name.includes('mongo')) return '🗄️';
  if (name.includes('git')) return '🔀';
  
  // Soft skills
  if (name.includes('leadership') || name.includes('lead')) return '👥';
  if (name.includes('communication')) return '💬';
  if (name.includes('project') || name.includes('management')) return '📊';
  if (name.includes('agile') || name.includes('scrum')) return '🔄';
  
  // Default
  return '🛠️';
};

const getProficiencyStars = (level: number): string => {
  const filled = '●';
  const empty = '○';
  return filled.repeat(Math.max(0, level)) + empty.repeat(Math.max(0, 3 - level));
};

const getProficiencyLabel = (level: number): string => {
  switch (level) {
    case 0: return 'None';
    case 1: return 'Basic';
    case 2: return 'Intermediate';
    case 3: return 'Advanced';
    default: return 'Unknown';
  }
};

export default function ChatSkillsReview({ employeeId, onComplete }: ChatSkillsReviewProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [removedSkills, setRemovedSkills] = useState<Set<string>>(new Set());
  const [addingSkill, setAddingSkill] = useState(false);
  
  useEffect(() => {
    loadSkills();
  }, [employeeId]);
  
  async function loadSkills() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('prepare-employee-skills', {
        body: { employee_id: employeeId }
      });
      
      if (error) throw error;
      
      if (data?.skills) {
        // Add proficiency levels from CV extraction if available
        const enrichedSkills = data.skills.map((skill: any) => ({
          ...skill,
          proficiency_level: skill.proficiency_level ?? 2 // Default to intermediate
        }));
        setSkills(enrichedSkills);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      toast.error('Failed to load skills');
      onComplete();
    } finally {
      setLoading(false);
    }
  }
  
  async function handleAcceptAll() {
    setSaving(true);
    try {
      // Filter out removed skills
      const validSkills = skills.filter(s => !removedSkills.has(s.skill_name));
      
      // Prepare validation entries
      const entries = validSkills.map((skill, index) => ({
        employee_id: employeeId,
        skill_name: skill.skill_name,
        skill_id: skill.skill_id,
        proficiency_level: Math.min(Math.max(skill.proficiency_level || 2, 0), 3), // Ensure 0-3 range
        validation_order: index,
        is_from_position: skill.is_from_position || false,
        is_from_cv: skill.is_from_cv || false
      }));
      
      console.log('Saving skills validation entries:', entries);
      
      // Save to database
      const { data, error } = await supabase
        .from('employee_skills_validation')
        .upsert(entries, { 
          onConflict: 'employee_id,skill_name',
          ignoreDuplicates: false 
        })
        .select();
        
      if (error) {
        console.error('Skills validation upsert error:', error);
        console.error('Failed entries:', entries);
        throw error;
      }
      
      console.log('Skills validation success:', data);
      
      toast.success('Skills confirmed!');
      setTimeout(onComplete, 500);
      
    } catch (error) {
      console.error('Error saving skills:', error);
      toast.error('Failed to save skills');
    } finally {
      setSaving(false);
    }
  }
  
  function handleRemoveSkill(skillName: string) {
    setRemovedSkills(prev => new Set(prev).add(skillName));
  }
  
  function handleUndoRemove(skillName: string) {
    setRemovedSkills(prev => {
      const newSet = new Set(prev);
      newSet.delete(skillName);
      return newSet;
    });
  }
  
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-600">Loading your skills...</span>
      </div>
    );
  }
  
  const activeSkills = skills.filter(s => !removedSkills.has(s.skill_name));
  const topSkills = activeSkills.slice(0, 5);
  const remainingSkills = activeSkills.slice(5);
  const hasRemovedSkills = removedSkills.size > 0;
  
  return (
    <div className="space-y-4 max-w-2xl">
      {/* Main message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-lg p-4"
      >
        <p className="text-sm font-medium text-blue-900 mb-3">
          I found {skills.length} skills in your profile! Here are your main ones:
        </p>
        
        {/* Top skills list */}
        <div className="space-y-2 mb-3">
          {topSkills.map((skill) => (
            <motion.div
              key={skill.skill_name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between bg-white rounded-md px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getSkillEmoji(skill.skill_name)}</span>
                <span className="font-medium text-sm">{skill.skill_name}</span>
                <span className="text-xs text-gray-500">
                  ({getProficiencyLabel(skill.proficiency_level || 2)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{getProficiencyStars(skill.proficiency_level || 2)}</span>
                <button
                  onClick={() => handleRemoveSkill(skill.skill_name)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${skill.skill_name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Show more button */}
        {remainingSkills.length > 0 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            Show {remainingSkills.length} more <ChevronDown className="h-3 w-3" />
          </button>
        )}
        
        {/* Remaining skills */}
        <AnimatePresence>
          {showAll && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t mt-3">
                <div className="flex flex-wrap gap-2">
                  {remainingSkills.map((skill) => (
                    <motion.div
                      key={skill.skill_name}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                        "bg-gray-100 hover:bg-gray-200 transition-colors"
                      )}
                    >
                      <span>{getSkillEmoji(skill.skill_name)}</span>
                      <span>{skill.skill_name}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill.skill_name)}
                        className="ml-1 text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAll(false)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-3"
                >
                  Show less <ChevronUp className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Removed skills */}
        {hasRemovedSkills && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-600 mb-2">Removed skills (click to undo):</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(removedSkills).map((skillName) => (
                <button
                  key={skillName}
                  onClick={() => handleUndoRemove(skillName)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                >
                  <span className="line-through">{skillName}</span>
                  <span className="font-medium">↺</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Quick actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleAcceptAll}
          disabled={saving || activeSkills.length === 0}
          className="flex-1"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Looks right!
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={() => setAddingSkill(true)}
          disabled={saving}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add missing
        </Button>
      </div>
      
      {/* Add skill form (simplified for now) */}
      {addingSkill && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-3"
        >
          <p className="text-sm text-gray-600">
            Adding custom skills coming soon! For now, please accept the extracted skills.
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAddingSkill(false)}
            className="mt-2"
          >
            Close
          </Button>
        </motion.div>
      )}
    </div>
  );
}