import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SkillSearchResult } from '@/types/skills';
import { useDebounce } from '@/hooks/use-debounce';

interface SkillSearchProps {
  onSkillSelect?: (skill: SkillSearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function SkillSearch({ 
  onSkillSelect, 
  placeholder = "Search skills...",
  className 
}: SkillSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SkillSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const searchSkills = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_skills', {
        search_term: term,
        limit_count: 10
      });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error searching skills:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchSkills(debouncedSearchTerm);
  }, [debouncedSearchTerm, searchSkills]);

  const handleSelect = (skill: SkillSearchResult) => {
    onSkillSelect?.(skill);
    setSearchTerm('');
    setShowResults(false);
    setResults([]);
  };

  const getSkillTypeColor = (type: string) => {
    switch (type) {
      case 'category':
        return 'bg-purple-100 text-purple-800';
      case 'skill_group':
        return 'bg-blue-100 text-blue-800';
      case 'skill_cluster':
        return 'bg-green-100 text-green-800';
      case 'skill':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {showResults && searchTerm.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 max-h-96 overflow-y-auto shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching skills...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No skills found matching "{searchTerm}"
            </div>
          ) : (
            <div className="p-2">
              {results.map((skill) => (
                <button
                  key={skill.skill_id}
                  onClick={() => handleSelect(skill)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{skill.skill_name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getSkillTypeColor(skill.skill_type)}`}
                        >
                          {skill.skill_type.replace('_', ' ')}
                        </Badge>
                        {skill.full_path && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            {skill.full_path.split(' > ').map((part, idx, arr) => (
                              <React.Fragment key={idx}>
                                {part}
                                {idx < arr.length - 1 && (
                                  <ChevronRight className="h-3 w-3 mx-1" />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}