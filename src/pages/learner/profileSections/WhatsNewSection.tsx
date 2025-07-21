import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

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

export default function WhatsNewSection({ formData, onChange }: WhatsNewSectionProps) {
  const [newCertification, setNewCertification] = useState('');
  const [newSkill, setNewSkill] = useState('');

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
        
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Kubernetes, TypeScript..."
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
        
        {formData.recentSkills.map((skill, index) => (
          <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-md">
            <span className="flex-1 text-sm">{skill}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSkill(index)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}