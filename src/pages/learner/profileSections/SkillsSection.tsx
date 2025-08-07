import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, X } from 'lucide-react';
import { SkillBadge } from '@/components/dashboard/shared/SkillBadge';
import { UnifiedSkillsService } from '@/services/UnifiedSkillsService';

interface Skill {
  name: string;
  level: number; // 0-3 scale (0=None, 1=Learning, 2=Using, 3=Expert)
  yearsExperience?: number;
}

interface SkillsSectionProps {
  data: Skill[] | any;
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

const SKILL_LEVELS = [
  { value: 1, label: 'Learning' },
  { value: 2, label: 'Using' },
  { value: 3, label: 'Expert' }
];

const SUGGESTED_SKILLS = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 
  'Docker', 'Kubernetes', 'Git', 'Agile', 'Machine Learning', 
  'Data Analysis', 'Project Management', 'Communication', 'Leadership'
];

export default function SkillsSection({ data, onSave, saving }: SkillsSectionProps) {
  const [skills, setSkills] = useState<Skill[]>(
    Array.isArray(data) ? data : []
  );
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentLevel, setCurrentLevel] = useState<Skill['level']>(2); // Default to 'Using'
  const [currentYears, setCurrentYears] = useState<number | ''>('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddSkill = () => {
    if (currentSkill && !skills.some(s => s.name.toLowerCase() === currentSkill.toLowerCase())) {
      setSkills([...skills, {
        name: currentSkill,
        level: currentLevel,
        yearsExperience: currentYears ? Number(currentYears) : undefined
      }]);
      setCurrentSkill('');
      setCurrentLevel(2); // Reset to 'Using'
      setCurrentYears('');
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter(s => s.name !== skillName));
  };

  const handleAddSuggestedSkill = (skillName: string) => {
    if (!skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      setCurrentSkill(skillName);
      setShowSuggestions(false);
    }
  };

  const handleSave = () => {
    const isComplete = skills.length >= 3; // At least 3 skills
    // Skills are already in 0-3 format, just save them
    onSave(skills, isComplete);
  };

  const getLevelColor = (level: number) => {
    // This is now handled by SkillBadge component
    switch (level) {
      case 1: return 'bg-yellow-100 text-yellow-800'; // Learning
      case 2: return 'bg-green-100 text-green-800';   // Using
      case 3: return 'bg-blue-100 text-blue-800';     // Expert
      default: return 'bg-gray-100 text-gray-800';    // None (0)
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Add your technical and soft skills. This helps us recommend relevant courses.
        </p>

        {/* Skills input form */}
        <div className="space-y-4 mb-6">
          <div>
            <Label htmlFor="skill">Skill Name *</Label>
            <div className="relative">
              <Input
                id="skill"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g., JavaScript, Project Management"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
              />
              {showSuggestions && currentSkill.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {SUGGESTED_SKILLS.map(skill => (
                    <button
                      key={skill}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => handleAddSuggestedSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="level">Proficiency Level *</Label>
              <Select
                value={currentLevel.toString()}
                onValueChange={(value) => setCurrentLevel(Number(value) as Skill['level'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="years">Years of Experience</Label>
              <Input
                id="years"
                type="number"
                min="0"
                max="50"
                value={currentYears}
                onChange={(e) => setCurrentYears(e.target.value ? Number(e.target.value) : '')}
                placeholder="Optional"
              />
            </div>
          </div>

          <Button 
            onClick={handleAddSkill}
            disabled={!currentSkill}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {/* Skills list */}
        {skills.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Your Skills ({skills.length})</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div key={skill.name} className="flex items-center gap-2">
                  <SkillBadge 
                    skill={{
                      skill_name: skill.name,
                      proficiency_level: skill.level
                    }}
                    showProficiency={true}
                    size="md"
                  />
                  {skill.yearsExperience && (
                    <span className="text-xs text-gray-500">
                      {skill.yearsExperience}y exp
                    </span>
                  )}
                  <button
                    onClick={() => handleRemoveSkill(skill.name)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills.length < 3 && (
          <p className="text-sm text-amber-600 mt-4">
            Add at least 3 skills to complete this section
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Continue
        </Button>
      </div>
    </div>
  );
}