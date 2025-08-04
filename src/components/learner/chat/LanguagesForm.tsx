import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Language {
  language: string;
  proficiency: string;
}

interface LanguagesFormProps {
  initialData?: Language[] | any[];
  onComplete: (data: Language[]) => void;
}

const proficiencyLevels = [
  'Native',
  'Fluent',
  'Advanced',
  'Intermediate',
  'Basic',
  'A1', 'A2', 'B1', 'B2', 'C1', 'C2'
];

export default function LanguagesForm({ initialData = [], onComplete }: LanguagesFormProps) {
  // Normalize data from different formats
  const normalizeData = (data: any[]): Language[] => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => {
      // If it's already in the correct format
      if (typeof item === 'object' && 'language' in item) {
        return {
          language: item.language || item.Language || '',
          proficiency: item.proficiency || item.Proficiency || ''
        };
      }
      
      // If it's a string, try to parse it
      if (typeof item === 'string') {
        return { language: item, proficiency: '' };
      }
      
      // Handle other object formats from CV extraction
      if (typeof item === 'object') {
        return {
          language: item.Language || item.language || '',
          proficiency: item.Proficiency || item.proficiency || ''
        };
      }
      
      return { language: '', proficiency: '' };
    });
  };

  const [languages, setLanguages] = useState<Language[]>(() => 
    normalizeData(initialData)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (languages.length > 0 && languages.some(lang => lang.language)) {
        onComplete(languages);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [languages, onComplete]);

  const addLanguage = () => {
    setLanguages([...languages, { language: '', proficiency: '' }]);
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5" />
          Languages
          {initialData.length > 0 && (
            <span className="text-sm font-normal text-blue-600 ml-2">
              AI-filled from CV
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {languages.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500 mb-3">No languages added yet</p>
            <Button
              size="sm"
              variant="outline"
              onClick={addLanguage}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Language
            </Button>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {languages.map((lang, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-3 border rounded-md bg-white space-y-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Language</label>
                        <Input
                          placeholder="e.g., English, Spanish, Mandarin"
                          value={lang.language}
                          onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Proficiency Level</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md text-sm"
                          value={lang.proficiency}
                          onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                        >
                          <option value="">Select Proficiency</option>
                          {proficiencyLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        {lang.proficiency && !proficiencyLevels.includes(lang.proficiency) && (
                          <p className="text-xs text-amber-600 mt-1">Original: {lang.proficiency}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeLanguage(index)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {languages.length < 10 && (
              <Button
                size="sm"
                variant="outline"
                className="w-full h-9 text-xs"
                onClick={addLanguage}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Another Language
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}