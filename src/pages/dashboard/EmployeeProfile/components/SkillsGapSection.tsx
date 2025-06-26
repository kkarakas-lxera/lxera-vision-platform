import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Target, 
  AlertTriangle, 
  Lightbulb,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  X,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SkillsGapSectionProps {
  employee: {
    current_position_title?: string;
    target_position_title?: string;
    current_position_id?: string;
    target_position_id?: string;
    skills_profile?: {
      extracted_skills: Array<{
        skill_name: string;
        proficiency_level: number;
      }>;
    };
  };
}

interface RequiredSkill {
  skill_id: string;
  skill_name: string;
  skill_type: string;
  is_mandatory: boolean;
  proficiency_level: number;
}

interface SkillAnalysis {
  required: RequiredSkill;
  current?: {
    skill_name: string;
    proficiency_level: number;
    years_experience?: number;
    evidence?: string;
  };
  status: 'missing' | 'below_required' | 'meets_required' | 'exceeds_required';
  gap: number;
}

export function SkillsGapSection({ employee }: SkillsGapSectionProps) {
  const [loading, setLoading] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState<RequiredSkill[]>([]);
  const [positionDetails, setPositionDetails] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (employee.current_position_id || employee.target_position_id) {
      fetchPositionSkills();
    }
  }, [employee.current_position_id, employee.target_position_id]);

  const fetchPositionSkills = async () => {
    setLoading(true);
    try {
      // Use target position if different, otherwise use current position
      const positionId = employee.target_position_id || employee.current_position_id;
      
      if (!positionId) return;

      const { data, error } = await supabase
        .from('st_company_positions')
        .select('*')
        .eq('id', positionId)
        .single();

      if (error) throw error;

      setPositionDetails(data);
      setRequiredSkills(data.required_skills || []);
    } catch (error) {
      console.error('Error fetching position skills:', error);
      toast.error('Failed to load position requirements');
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSkills = employee.skills_profile?.extracted_skills || [];
  const hasTargetPosition = employee.target_position_id && employee.target_position_id !== employee.current_position_id;
  
  // Enhanced skill matching function
  const findMatchingSkill = (requiredSkill: RequiredSkill) => {
    return currentSkills.find(current => {
      const currentName = current.skill_name?.toLowerCase() || '';
      const requiredName = requiredSkill.skill_name?.toLowerCase() || '';
      
      return currentName === requiredName ||
             currentName.includes(requiredName) ||
             requiredName.includes(currentName) ||
             // Handle specific skill variations
             (currentName.includes('react') && requiredName.includes('react')) ||
             (currentName.includes('javascript') && requiredName.includes('javascript')) ||
             (currentName.includes('python') && requiredName.includes('python')) ||
             (currentName.includes('langchain') && requiredName.includes('langchain')) ||
             (currentName.includes('openai') && requiredName.includes('openai')) ||
             (currentName.includes('anthropic') && requiredName.includes('anthropic'));
    });
  };

  // Comprehensive skill analysis
  const skillAnalyses: SkillAnalysis[] = requiredSkills.map(required => {
    const matchingSkill = findMatchingSkill(required);
    const currentLevel = matchingSkill?.proficiency_level || 0;
    const gap = required.proficiency_level - currentLevel;
    
    let status: SkillAnalysis['status'];
    if (!matchingSkill) {
      status = 'missing';
    } else if (currentLevel < required.proficiency_level) {
      status = 'below_required';
    } else if (currentLevel === required.proficiency_level) {
      status = 'meets_required';
    } else {
      status = 'exceeds_required';
    }

    return {
      required,
      current: matchingSkill,
      status,
      gap: Math.max(0, gap)
    };
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getStatusIcon = (status: SkillAnalysis['status']) => {
    switch (status) {
      case 'missing': return <X className="h-4 w-4 text-red-500" />;
      case 'below_required': return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'meets_required': return <Check className="h-4 w-4 text-green-500" />;
      case 'exceeds_required': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: SkillAnalysis['status']) => {
    switch (status) {
      case 'missing': return 'bg-red-50 border-red-200';
      case 'below_required': return 'bg-orange-50 border-orange-200';
      case 'meets_required': return 'bg-green-50 border-green-200';
      case 'exceeds_required': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: SkillAnalysis['status']) => {
    switch (status) {
      case 'missing': return 'Missing';
      case 'below_required': return 'Below Required';
      case 'meets_required': return 'Meets Required';
      case 'exceeds_required': return 'Exceeds Required';
      default: return 'Unknown';
    }
  };

  // Group skills by status for better organization
  const skillsByStatus = {
    missing: skillAnalyses.filter(s => s.status === 'missing'),
    below_required: skillAnalyses.filter(s => s.status === 'below_required'),
    meets_required: skillAnalyses.filter(s => s.status === 'meets_required'),
    exceeds_required: skillAnalyses.filter(s => s.status === 'exceeds_required')
  };

  const gapCount = skillsByStatus.missing.length + skillsByStatus.below_required.length;
  const totalRequired = requiredSkills.length;

  if (!positionDetails && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              No position requirements found. Please ensure positions have required skills configured.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50/50 to-white">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm">
            <Target className="h-5 w-5 text-white" />
          </div>
          Skills Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Position Summary */}
        <div className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-2xl border border-blue-100/50 shadow-sm">
          <div className="absolute inset-0 bg-white/40 rounded-2xl"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-blue-700/80">
                    {hasTargetPosition ? 'Target Position' : 'Current Position'}
                  </p>
                </div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {hasTargetPosition ? employee.target_position_title : employee.current_position_title}
                </h3>
              </div>
              <div className="text-right">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {totalRequired - gapCount}/{totalRequired}
                  </p>
                  <p className="text-xs font-medium text-slate-600">Skills Met</p>
                </div>
              </div>
            </div>
            {positionDetails && (
              <div className="flex items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="font-medium">{requiredSkills.length}</span>
                  <span>total skills</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  <span className="font-medium">{requiredSkills.filter(s => s.is_mandatory).length}</span>
                  <span>mandatory</span>
                </div>
                {gapCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="font-medium text-red-600">{gapCount}</span>
                    <span className="text-red-600">gaps identified</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Skills Analysis by Status */}
        {requiredSkills.length > 0 ? (
          <div className="space-y-6">
            {/* Skills Needing Attention */}
            {(skillsByStatus.missing.length > 0 || skillsByStatus.below_required.length > 0) && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Skills Needing Attention</h4>
                    <p className="text-sm text-slate-600">{gapCount} skill{gapCount !== 1 ? 's' : ''} require development</p>
                  </div>
                </div>
                
                {/* Missing Skills */}
                {skillsByStatus.missing.length > 0 && (
                  <Collapsible 
                    open={expandedSections.missing} 
                    onOpenChange={() => toggleSection('missing')}
                    className="group"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-100/50 rounded-2xl hover:shadow-md transition-all duration-200 group-data-[state=open]:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-xl">
                          <X className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-red-700">Missing Skills</span>
                          <p className="text-sm text-red-600/80">{skillsByStatus.missing.length} skill{skillsByStatus.missing.length !== 1 ? 's' : ''} not found</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {skillsByStatus.missing.length}
                        </Badge>
                        {expandedSections.missing ? 
                          <ChevronDown className="h-4 w-4 text-red-600" /> : 
                          <ChevronRight className="h-4 w-4 text-red-600" />
                        }
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-4 ml-4">
                      {skillsByStatus.missing.map((analysis, idx) => (
                        <div key={idx} className="group/item p-4 bg-white/80 backdrop-blur-sm border border-red-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-red-50 rounded-lg">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                </div>
                                <span className="font-medium text-slate-800">{analysis.required.skill_name}</span>
                                <Badge 
                                  variant={analysis.required.is_mandatory ? 'destructive' : 'outline'} 
                                  className="text-xs font-medium"
                                >
                                  {analysis.required.is_mandatory ? 'Critical' : 'Optional'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  <span>Level {analysis.required.proficiency_level}/5 required</span>
                                </div>
                                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                <span className="capitalize">{analysis.required.skill_type}</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <Badge variant="destructive" className="bg-red-500/10 text-red-700 border-red-200">
                                Not Found
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Below Required Skills */}
                {skillsByStatus.below_required.length > 0 && (
                  <Collapsible 
                    open={expandedSections.below_required} 
                    onOpenChange={() => toggleSection('below_required')}
                    className="group"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-orange-50/80 to-amber-50/80 border border-orange-100/50 rounded-2xl hover:shadow-md transition-all duration-200 group-data-[state=open]:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-xl">
                          <TrendingDown className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-orange-700">Below Required Level</span>
                          <p className="text-sm text-orange-600/80">{skillsByStatus.below_required.length} skill{skillsByStatus.below_required.length !== 1 ? 's' : ''} need improvement</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {skillsByStatus.below_required.length}
                        </Badge>
                        {expandedSections.below_required ? 
                          <ChevronDown className="h-4 w-4 text-orange-600" /> : 
                          <ChevronRight className="h-4 w-4 text-orange-600" />
                        }
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-4 ml-4">
                      {skillsByStatus.below_required.map((analysis, idx) => (
                        <div key={idx} className="group/item p-4 bg-white/80 backdrop-blur-sm border border-orange-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-1.5 bg-orange-50 rounded-lg">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                </div>
                                <span className="font-medium text-slate-800">{analysis.required.skill_name}</span>
                                <Badge 
                                  variant={analysis.required.is_mandatory ? 'destructive' : 'outline'} 
                                  className="text-xs font-medium"
                                >
                                  {analysis.required.is_mandatory ? 'Critical' : 'Optional'}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-200 rounded-full flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <span className="text-slate-600">Current: Level {analysis.current?.proficiency_level || 0}/5</span>
                                  </div>
                                  <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-200 rounded-full flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    </div>
                                    <span className="text-slate-600">Required: Level {analysis.required.proficiency_level}/5</span>
                                  </div>
                                </div>
                                {analysis.current?.years_experience && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{analysis.current.years_experience} years experience</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                Gap: {analysis.gap} level{analysis.gap !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}

            {/* Skills Meeting Requirements */}
            {(skillsByStatus.meets_required.length > 0 || skillsByStatus.exceeds_required.length > 0) && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-sm">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">Skills Meeting Requirements</h4>
                    <p className="text-sm text-slate-600">{skillsByStatus.meets_required.length + skillsByStatus.exceeds_required.length} skill{(skillsByStatus.meets_required.length + skillsByStatus.exceeds_required.length) !== 1 ? 's' : ''} on track</p>
                  </div>
                </div>

                {/* Meets Required */}
                {skillsByStatus.meets_required.length > 0 && (
                  <Collapsible 
                    open={expandedSections.meets_required} 
                    onOpenChange={() => toggleSection('meets_required')}
                    className="group"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-green-50/80 to-emerald-50/80 border border-green-100/50 rounded-2xl hover:shadow-md transition-all duration-200 group-data-[state=open]:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="text-left">
                          <span className="font-semibold text-green-700">Meets Requirements</span>
                          <p className="text-sm text-green-600/80">{skillsByStatus.meets_required.length} skill{skillsByStatus.meets_required.length !== 1 ? 's' : ''} at target level</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {skillsByStatus.meets_required.length}
                        </Badge>
                        {expandedSections.meets_required ? 
                          <ChevronDown className="h-4 w-4 text-green-600" /> : 
                          <ChevronRight className="h-4 w-4 text-green-600" />
                        }
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 mt-4 ml-4">
                      {skillsByStatus.meets_required.map((analysis, idx) => (
                        <div key={idx} className="group/item p-4 bg-white/80 backdrop-blur-sm border border-green-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-1.5 bg-green-50 rounded-lg">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <span className="font-medium text-slate-800">{analysis.required.skill_name}</span>
                                <Badge 
                                  variant="outline" 
                                  className="text-xs font-medium bg-green-50 text-green-700 border-green-200"
                                >
                                  {analysis.required.is_mandatory ? 'Required' : 'Optional'}
                                </Badge>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <div className="w-3 h-3 bg-green-200 rounded-full flex items-center justify-center">
                                    <Check className="h-2 w-2 text-green-600" />
                                  </div>
                                  <span>Level {analysis.current?.proficiency_level}/5 (matches requirement)</span>
                                </div>
                                {analysis.current?.years_experience && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{analysis.current.years_experience} years experience</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              <Badge className="bg-green-500/10 text-green-700 border-green-200">
                                ✓ Perfect Match
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Exceeds Required */}
                {skillsByStatus.exceeds_required.length > 0 && (
                  <Collapsible 
                    open={expandedSections.exceeds_required} 
                    onOpenChange={() => toggleSection('exceeds_required')}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-700">Exceeds Required Level ({skillsByStatus.exceeds_required.length})</span>
                      </div>
                      {expandedSections.exceeds_required ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {skillsByStatus.exceeds_required.map((analysis, idx) => (
                        <div key={idx} className="p-3 bg-white border border-blue-200 rounded-lg ml-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{analysis.required.skill_name}</span>
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                  {analysis.required.is_mandatory ? 'Mandatory' : 'Optional'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Level {analysis.current?.proficiency_level}/5 (required: {analysis.required.proficiency_level}/5)
                              </p>
                              {analysis.current?.years_experience && (
                                <p className="text-xs text-muted-foreground">
                                  {analysis.current.years_experience} years experience
                                </p>
                              )}
                            </div>
                            <Badge className="ml-2 bg-blue-500">
                              ★ Exceeds
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </div>
        ) : (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              No skill requirements defined for this position yet.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}