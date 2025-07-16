import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, Globe } from 'lucide-react';

interface Language {
  name: string;
  proficiency: 'basic' | 'conversational' | 'professional' | 'native';
}

interface LanguagesSectionProps {
  data: Language[] | any;
  onSave: (data: any, isComplete: boolean) => void;
  saving: boolean;
}

const PROFICIENCY_LEVELS = [
  { value: 'basic', label: 'Basic', description: 'Can understand and use basic phrases' },
  { value: 'conversational', label: 'Conversational', description: 'Can hold everyday conversations' },
  { value: 'professional', label: 'Professional', description: 'Can work in this language' },
  { value: 'native', label: 'Native/Bilingual', description: 'Native speaker level' }
];

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Chinese (Mandarin)', 
  'Japanese', 'Korean', 'Arabic', 'Portuguese', 'Russian', 
  'Hindi', 'Italian', 'Dutch', 'Polish', 'Turkish'
];

export default function LanguagesSection({ data, onSave, saving }: LanguagesSectionProps) {
  const [languages, setLanguages] = useState<Language[]>(
    Array.isArray(data) ? data : []
  );
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [currentProficiency, setCurrentProficiency] = useState<Language['proficiency']>('conversational');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAddLanguage = () => {
    if (currentLanguage && !languages.some(l => l.name.toLowerCase() === currentLanguage.toLowerCase())) {
      setLanguages([...languages, {
        name: currentLanguage,
        proficiency: currentProficiency
      }]);
      setCurrentLanguage('');
      setCurrentProficiency('conversational');
    }
  };

  const handleRemoveLanguage = (languageName: string) => {
    setLanguages(languages.filter(l => l.name !== languageName));
  };

  const handleSelectSuggestion = (language: string) => {
    setCurrentLanguage(language);
    setShowSuggestions(false);
  };

  const handleSave = () => {
    onSave(languages, true); // Always complete if they save
  };

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'basic': return 'bg-gray-100 text-gray-800';
      case 'conversational': return 'bg-blue-100 text-blue-800';
      case 'professional': return 'bg-purple-100 text-purple-800';
      case 'native': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLanguages = COMMON_LANGUAGES.filter(lang => 
    lang.toLowerCase().includes(currentLanguage.toLowerCase()) &&
    !languages.some(l => l.name.toLowerCase() === lang.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Add languages you speak. This helps with global team assignments and communication.
      </p>

      {/* Language input form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="language">Language *</Label>
          <div className="relative">
            <Input
              id="language"
              value={currentLanguage}
              onChange={(e) => {
                setCurrentLanguage(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="e.g., English, Spanish"
              onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
            />
            {showSuggestions && currentLanguage && filteredLanguages.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredLanguages.map(lang => (
                  <button
                    key={lang}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    onMouseDown={() => handleSelectSuggestion(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="proficiency">Proficiency Level *</Label>
          <Select
            value={currentProficiency}
            onValueChange={(value) => setCurrentProficiency(value as Language['proficiency'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROFICIENCY_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-xs text-gray-500">{level.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleAddLanguage}
          disabled={!currentLanguage}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>

      {/* Languages list */}
      {languages.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Your Languages ({languages.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((language) => (
              <div key={language.name} className="flex items-center gap-2">
                <Badge className={`${getProficiencyColor(language.proficiency)} px-3 py-1`}>
                  {language.name}
                  <span className="ml-2 text-xs opacity-75">
                    {PROFICIENCY_LEVELS.find(l => l.value === language.proficiency)?.label}
                  </span>
                </Badge>
                <button
                  onClick={() => handleRemoveLanguage(language.name)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {languages.length === 0 && (
          <Button 
            variant="outline" 
            onClick={() => onSave([], true)}
          >
            Skip This Section
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save & Continue
        </Button>
      </div>
    </div>
  );
}