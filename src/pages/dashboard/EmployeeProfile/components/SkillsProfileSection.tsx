import React, { useState, useMemo, useEffect } from 'react';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Target,
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Clock,
  Award,
  HelpCircle,
  Check,
  Brain,
  AlertCircle
} from 'lucide-react';
import { marketSkillsService } from '@/services/marketSkills/MarketSkillsService';
import { supabase } from '@/integrations/supabase/client';
import MarketGapBars from '@/components/dashboard/skills/MarketGapBars';
import type { MarketSkillData } from '@/types/marketSkills';

interface Skill {
  skill_id: string;
  skill_name: string;
  proficiency_level: number;
  skill_type?: string;
  category?: string;
  years_experience?: number;
  source?: 'cv' | 'position' | 'both';
  verification?: {
    score: number;
    questionsAnswered: number;
    totalQuestions: number;
    lastVerified?: string;
  };
}

interface SkillData {
  skill_name: string;
  required_level: number;
  is_mandatory: boolean;
  from_cv: boolean;
  from_position: boolean;
  verified_percentage: number;
  verification_data: any;
}

interface SkillsProfileSectionProps {
  employee: {
    id: string;
    cv_file_path?: string;
    current_position_title?: string;
    current_position_requirements?: {
      required_skills?: Array<{
        skill_id: string;
        skill_name: string;
        is_mandatory: boolean;
        proficiency_level: number;
      }>;
      nice_to_have_skills?: Array<{
        skill_id: string;
        skill_name: string;
        proficiency_level: number;
      }>;
      description?: string;
    };
    skills_profile?: {
      analyzed_at: string;
      extracted_skills: Skill[];
      experience_years?: number;
      education_level?: string;
      certifications?: any[];
      languages?: any[];
      cv_summary?: string;
    };
    verifiedSkillsRaw?: Array<{
      skill_name: string;
      verification_score: number;
      questions_asked?: any[];
      responses?: any[];
      verified_at?: string;
      is_from_cv?: boolean;
      is_from_position?: boolean;
      assessment_type?: string;
      proficiency_level?: number;
    }>;
  };
  onRefresh: () => void;
  refreshing: boolean;
}

export function SkillsProfileSection({ employee, onRefresh, refreshing }: SkillsProfileSectionProps) {
  const [expandedSkills, setExpandedSkills] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'verified' | 'level' | 'alphabetical'>('verified');
  const [filters, setFilters] = useState<Set<string>>(new Set());
  const [marketGaps, setMarketGaps] = useState<MarketSkillData[]>([]);
  const [loadingMarketData, setLoadingMarketData] = useState(false);

  const toggleExpanded = (skillName: string) => {
    const newExpanded = new Set(expandedSkills);
    if (newExpanded.has(skillName)) {
      newExpanded.delete(skillName);
    } else {
      newExpanded.add(skillName);
    }
    setExpandedSkills(newExpanded);
  };

  const toggleFilter = (filter: string) => {
    const newFilters = new Set(filters);
    if (newFilters.has(filter)) {
      newFilters.delete(filter);
    } else {
      newFilters.add(filter);
    }
    setFilters(newFilters);
  };

  // Fetch market gap data
  useEffect(() => {
    const fetchMarketGaps = async () => {
      if (!employee.current_position_title || !employee.id) return;
      
      setLoadingMarketData(true);
      try {
        // Get company info for industry context
        const { data: companyData } = await supabase
          .from('companies')
          .select('settings')
          .eq('id', (await supabase.auth.getUser()).data.user?.user_metadata?.company_id)
          .single();

        // Use the cached method that stores data in employee record
        const employeeSkills = employee.skills_profile?.extracted_skills || [];
        const marketGapData = await marketSkillsService.getEmployeeMarketGaps(
          employee.id,
          employee.current_position_title,
          companyData?.settings?.industry as string | undefined,
          employeeSkills.map(skill => ({
            skill_name: skill.skill_name,
            proficiency_level: skill.proficiency_level,
            source: 'cv' as const
          }))
        );

        setMarketGaps(marketGapData);
      } catch (error) {
        console.error('Error fetching market gaps:', error);
      } finally {
        setLoadingMarketData(false);
      }
    };

    fetchMarketGaps();
  }, [employee.id, employee.current_position_title, employee.skills_profile]);

  if (!employee.skills_profile && !employee.verifiedSkillsRaw) {
    return (
      <CollapsibleCard
        title="Skills Overview"
        icon={<Target className="h-5 w-5" />}
        summary="No skills data available"
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No skills analysis available. Upload and analyze a CV to generate skills profile.
          </p>
          <Button>
            <AlertCircle className="h-4 w-4 mr-2" />
            Upload CV
          </Button>
        </div>
      </CollapsibleCard>
    );
  }

  // Get position requirements
  const positionRequirements = employee.current_position_requirements?.required_skills || [];
  const niceToHaveSkills = employee.current_position_requirements?.nice_to_have_skills || [];
  
  // Get CV skills
  const cvSkills = employee.skills_profile?.extracted_skills || [];
  
  // Get verified skills data
  const verifiedSkillsData = employee.verifiedSkillsRaw || [];
  
  // Create comprehensive skills list
  const allSkills = useMemo(() => {
    const skillsMap = new Map<string, any>();
    
    // Add position requirements
    positionRequirements.forEach(req => {
      skillsMap.set(req.skill_name, {
        skill_name: req.skill_name,
        required_level: req.proficiency_level,
        is_mandatory: req.is_mandatory,
        from_cv: false,
        from_position: true,
        verified_percentage: 0,
        verification_data: null
      });
    });
    
    // Add nice-to-have skills
    niceToHaveSkills.forEach(skill => {
      if (!skillsMap.has(skill.skill_name)) {
        skillsMap.set(skill.skill_name, {
          skill_name: skill.skill_name,
          required_level: skill.proficiency_level,
          is_mandatory: false,
          from_cv: false,
          from_position: true,
          verified_percentage: 0,
          verification_data: null
        });
      }
    });
    
    // Add CV skills
    cvSkills.forEach(skill => {
      const existing = skillsMap.get(skill.skill_name);
      if (existing) {
        existing.from_cv = true;
      } else {
        skillsMap.set(skill.skill_name, {
          skill_name: skill.skill_name,
          required_level: skill.proficiency_level || 0,
          is_mandatory: false,
          from_cv: true,
          from_position: false,
          verified_percentage: 0,
          verification_data: null
        });
      }
    });
    
    // Add verification data
    verifiedSkillsData.forEach(verified => {
      const existing = skillsMap.get(verified.skill_name);
      if (existing) {
        existing.verified_percentage = Math.round(verified.verification_score * 100);
        existing.verification_data = verified;
      }
    });
    
    return Array.from(skillsMap.values());
  }, [positionRequirements, niceToHaveSkills, cvSkills, verifiedSkillsData]);

  // Apply filters
  const filteredSkills = useMemo(() => {
    let filtered = [...allSkills];
    
    if (filters.has('mandatory')) {
      filtered = filtered.filter(skill => skill.is_mandatory);
    }
    
    if (filters.has('low_verified')) {
      filtered = filtered.filter(skill => skill.verified_percentage < 50);
    }
    
    if (filters.has('from_cv')) {
      filtered = filtered.filter(skill => skill.from_cv);
    }
    
    return filtered;
  }, [allSkills, filters]);
  
  // Sort skills
  const sortedSkills = useMemo(() => {
    const sorted = [...filteredSkills];
    
    switch (sortBy) {
      case 'verified':
        return sorted.sort((a, b) => b.verified_percentage - a.verified_percentage);
      case 'level':
        return sorted.sort((a, b) => b.required_level - a.required_level);
      case 'alphabetical':
        return sorted.sort((a, b) => a.skill_name.localeCompare(b.skill_name));
      default:
        return sorted;
    }
  }, [filteredSkills, sortBy]);
  
  // Calculate metrics
  const extractedSkillsCount = cvSkills.length;
  const roleRequirementsCount = positionRequirements.length;
  const verifiedSkillsCount = allSkills.filter(s => s.verified_percentage > 0).length;
  
  const summary = `${extractedSkillsCount} extracted from CV | ${roleRequirementsCount} role requirements | ${verifiedSkillsCount} verified`;

  // Filter pill options
  const filterOptions = [
    { id: 'mandatory', label: 'Mandatory only', active: filters.has('mandatory') },
    { id: 'low_verified', label: 'Low Verified %', active: filters.has('low_verified') },
    { id: 'from_cv', label: 'From CV', active: filters.has('from_cv') }
  ];

  return (
    <CollapsibleCard
      title="Skills Overview"
      icon={<Target className="h-5 w-5" />}
      summary={summary}
    >
      <div className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Extracted Skills</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{extractedSkillsCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Number of skills parsed from CV</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Role Requirements</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{roleRequirementsCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Skills tagged as required for the position</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Target className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Skills</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{verifiedSkillsCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Skills with completed assessments</p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Award className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Skills Gap Analysis */}
        {marketGaps.length > 0 && (
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Market Skills Comparison</h3>
              </div>
              <p className="text-sm text-gray-600">
                How your skills compare to market expectations for {employee.current_position_title}
              </p>
            </CardHeader>
            <CardContent>
              {loadingMarketData ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-gray-600">Loading market data...</div>
                </div>
              ) : (
                <MarketGapBars 
                  skills={marketGaps}
                  role={employee.current_position_title}
                  showSource={true}
                  className="max-w-2xl"
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* Filters and Sort */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => toggleFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filter.active
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified %</SelectItem>
                  <SelectItem value="level">Required Level</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Skills List */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold text-gray-900">Position Requirements vs Employee Skills</h3>
            <p className="text-sm text-gray-600">{employee.current_position_title || 'Financial Consultant'}</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {sortedSkills.map((skill) => {
                  const isExpanded = expandedSkills.has(skill.skill_name);
                  
                  return (
                    <div key={skill.skill_name} className="border border-gray-200 rounded-lg">
                      {/* Skill Row */}
                      <div 
                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => skill.verification_data && toggleExpanded(skill.skill_name)}
                      >
                        <div className="flex items-center justify-between">
                          {/* Left side: Skill name and badges */}
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-semibold text-gray-900">{skill.skill_name}</span>
                            {skill.is_mandatory && (
                              <Badge variant="destructive" className="h-5 px-2 text-xs">
                                Mandatory
                              </Badge>
                            )}
                            {skill.from_cv && (
                              <Badge variant="secondary" className="h-5 px-2 text-xs bg-gray-100 text-gray-700">
                                From CV
                              </Badge>
                            )}
                          </div>
                          
                          {/* Right side: Required level and verified % */}
                          <div className="flex items-center gap-6">
                            <div className="text-sm text-gray-600">
                              Required: <span className="font-medium text-gray-900">Level {skill.required_level}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 min-w-[200px]">
                              <span className="text-sm text-gray-600">Verified:</span>
                              <div className="flex items-center gap-2 flex-1">
                                <Progress 
                                  value={skill.verified_percentage} 
                                  className="h-2 flex-1"
                                  style={{
                                    backgroundColor: '#E5E7EB',
                                  }}
                                />
                                <span className="text-sm font-medium text-gray-900 min-w-[3ch]">
                                  {skill.verified_percentage}%
                                </span>
                              </div>
                            </div>
                            
                            {skill.verification_data && (
                              <div className="flex items-center">
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Assessment Details */}
                      {isExpanded && skill.verification_data && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* Assessment metadata */}
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <HelpCircle className="h-4 w-4" />
                                <span>{skill.verification_data.questions_asked?.length || 0} questions</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {Math.round(
                                    skill.verification_data.responses?.reduce((sum: number, r: any) => sum + (r.time_taken || 0), 0) / 
                                    (skill.verification_data.responses?.length || 1)
                                  )}s avg
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                <span>
                                  {new Date(skill.verification_data.verified_at || skill.verification_data.created_at || '').toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            {/* Questions breakdown */}
                            <div className="space-y-3">
                              {skill.verification_data.questions_asked?.map((question: any, qIndex: number) => {
                                const response = skill.verification_data.responses?.[qIndex];
                                const isCorrect = response?.correct;
                                
                                return (
                                  <div key={qIndex} className="p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex items-start gap-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                        isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                      }`}>
                                        {qIndex + 1}
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{question.question}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                          Time taken: {response?.time_taken || 0}s
                                        </p>
                                        {question.explanation && (
                                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                                            <strong>Explanation:</strong> {question.explanation}
                                          </div>
                                        )}
                                      </div>
                                      <div className={`text-xs font-medium ${
                                        isCorrect ? 'text-green-700' : 'text-red-700'
                                      }`}>
                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="lg"
            className="px-6 py-2.5 text-sm font-medium border-gray-300 hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Skills Report
          </Button>
        </div>
      </div>
    </CollapsibleCard>
  );
}