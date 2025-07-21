import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WhatsNewSectionProps {
  formData: {
    recentCertifications: string[];
    languages: string[];
    recentSkills: string[];
  };
  onChange: (data: any) => void;
}

const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
  'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean', 'Arabic',
  'Hindi', 'Bengali', 'Urdu', 'Turkish', 'Polish', 'Dutch', 'Swedish',
  'Norwegian', 'Danish', 'Finnish', 'Greek', 'Czech', 'Hungarian', 'Romanian',
  'Vietnamese', 'Thai', 'Indonesian', 'Malay', 'Filipino', 'Hebrew', 'Swahili'
].sort();

// Skills organized by categories
const SKILL_CATEGORIES = {
  'Programming Languages': [
    'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 
    'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Objective-C', 'Dart', 'Elixir'
  ],
  'Web Technologies': [
    'React', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express.js', 'Django', 'Flask',
    'Spring Boot', 'ASP.NET', 'Ruby on Rails', 'Laravel', 'HTML5', 'CSS3', 'Sass', 'Tailwind CSS'
  ],
  'Cloud & DevOps': [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitLab CI',
    'GitHub Actions', 'Ansible', 'Chef', 'Puppet', 'CircleCI', 'ArgoCD', 'Prometheus', 'Grafana'
  ],
  'Data & AI': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas',
    'NumPy', 'Data Analysis', 'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Elasticsearch',
    'Apache Spark', 'Hadoop', 'Tableau', 'Power BI', 'Data Visualization'
  ],
  'Soft Skills': [
    'Leadership', 'Team Management', 'Communication', 'Problem Solving', 'Critical Thinking',
    'Project Management', 'Agile', 'Scrum', 'Time Management', 'Mentoring', 'Public Speaking',
    'Negotiation', 'Conflict Resolution', 'Strategic Planning'
  ]
};

export default function WhatsNewSection({ formData, onChange }: WhatsNewSectionProps) {
  const [newCertification, setNewCertification] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Programming Languages']);

  const addCertification = () => {
    if (newCertification.trim()) {
      onChange({
        ...formData,
        recentCertifications: [...formData.recentCertifications, newCertification.trim()]
      });
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    onChange({
      ...formData,
      recentCertifications: formData.recentCertifications.filter((_, i) => i !== index)
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      onChange({
        ...formData,
        recentSkills: [...formData.recentSkills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    onChange({
      ...formData,
      recentSkills: formData.recentSkills.filter((_, i) => i !== index)
    });
  };

  const addLanguage = (language: string) => {
    if (language && !formData.languages.includes(language)) {
      onChange({
        ...formData,
        languages: [...formData.languages, language]
      });
    }
  };

  const removeLanguage = (language: string) => {
    onChange({
      ...formData,
      languages: formData.languages.filter(l => l !== language)
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Filter skills based on search
  const filteredSkillCategories = useMemo(() => {
    if (!skillSearch.trim()) return SKILL_CATEGORIES;
    
    const searchLower = skillSearch.toLowerCase();
    const filtered: Record<string, string[]> = {};
    
    Object.entries(SKILL_CATEGORIES).forEach(([category, skills]) => {
      const matchingSkills = skills.filter(skill => 
        skill.toLowerCase().includes(searchLower) &&
        !formData.recentSkills.includes(skill)
      );
      if (matchingSkills.length > 0) {
        filtered[category] = matchingSkills;
      }
    });
    
    return filtered;
  }, [skillSearch, formData.recentSkills]);

  const addSkillFromSuggestion = (skill: string) => {
    if (!formData.recentSkills.includes(skill)) {
      onChange({
        ...formData,
        recentSkills: [...formData.recentSkills, skill]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Certifications */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          🎓 Any new certifications?
        </Label>
        
        <div className="flex gap-2">
          <Input
            placeholder="e.g. AWS Certified, PMP, Scrum..."
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCertification}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
        
        {formData.recentCertifications.map((cert, index) => (
          <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
            <span className="flex-1 text-sm">{cert}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeCertification(index)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          💬 Languages you speak?
        </Label>
        
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {formData.languages.map((lang) => (
            <div
              key={lang}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
            >
              {lang}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLanguage(lang)}
                className="h-4 w-4 p-0 hover:bg-blue-100"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          <Select onValueChange={addLanguage}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Add language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.filter(lang => !formData.languages.includes(lang)).map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recent Skills */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          🛠️ New skills or tools?
        </Label>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search skills (e.g., Python, Leadership)"
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Selected Skills as Chips */}
        {formData.recentSkills.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Selected Skills ({formData.recentSkills.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.recentSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1"
                >
                  {skill}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Skill Categories */}
        <div className="space-y-2">
          {Object.entries(filteredSkillCategories).map(([category, skills]) => {
            const isExpanded = expandedCategories.includes(category);
            const visibleSkills = isExpanded ? skills : skills.slice(0, 6);
            const hasMore = skills.length > 6;
            
            return (
              <div key={category} className="border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-sm">{category}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-3 grid grid-cols-2 gap-2">
                    {visibleSkills.map((skill) => {
                      const isSelected = formData.recentSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => !isSelected && addSkillFromSuggestion(skill)}
                          disabled={isSelected}
                          className={`px-3 py-2 text-sm rounded-md text-left transition-colors ${
                            isSelected
                              ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                              : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {isSelected && '✓ '}{skill}
                        </button>
                      );
                    })}
                    {!isExpanded && hasMore && (
                      <button
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className="text-sm text-blue-600 hover:text-blue-700 col-span-2 text-left"
                      >
                        Show {skills.length - 6} more...
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Custom Skill Input */}
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600 mb-2">Can't find your skill? Add custom:</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter custom skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addSkill}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}