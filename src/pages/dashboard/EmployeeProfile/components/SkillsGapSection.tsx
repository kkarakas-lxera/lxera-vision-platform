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
  X
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Skills Gap Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {hasTargetPosition ? 'Target Position' : 'Current Position Requirements'}
              </p>
              <p className="font-semibold text-lg">
                {hasTargetPosition ? employee.target_position_title : employee.current_position_title}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{totalRequired - gapCount}/{totalRequired}</p>
              <p className="text-xs text-muted-foreground">Skills Met</p>
            </div>
          </div>
          {positionDetails && (
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{requiredSkills.length} total skills</span>
              <span>•</span>
              <span>{requiredSkills.filter(s => s.is_mandatory).length} mandatory</span>
              {gapCount > 0 && (
                <>
                  <span>•</span>
                  <span className="text-orange-600 font-medium">{gapCount} gaps identified</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Skills Analysis by Status */}
        {requiredSkills.length > 0 ? (
          <div className="space-y-4">
            {/* Skills Needing Attention */}
            {(skillsByStatus.missing.length > 0 || skillsByStatus.below_required.length > 0) && (
              <div className="space-y-3">
                <h4 className="font-medium text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Skills Needing Attention ({gapCount})
                </h4>
                
                {/* Missing Skills */}
                {skillsByStatus.missing.length > 0 && (
                  <Collapsible 
                    open={expandedSections.missing} 
                    onOpenChange={() => toggleSection('missing')}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-700">Missing Skills ({skillsByStatus.missing.length})</span>
                      </div>
                      {expandedSections.missing ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {skillsByStatus.missing.map((analysis, idx) => (
                        <div key={idx} className="p-3 bg-white border border-red-200 rounded-lg ml-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{analysis.required.skill_name}</span>
                                <Badge variant={analysis.required.is_mandatory ? 'destructive' : 'secondary'} className="text-xs">
                                  {analysis.required.is_mandatory ? 'Mandatory' : 'Optional'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Required: Level {analysis.required.proficiency_level}/5 • {analysis.required.skill_type}
                              </p>
                            </div>
                            <Badge variant="destructive" className="ml-2">
                              Not Found
                            </Badge>
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
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-orange-500" />
                        <span className="font-medium text-orange-700">Below Required Level ({skillsByStatus.below_required.length})</span>
                      </div>
                      {expandedSections.below_required ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {skillsByStatus.below_required.map((analysis, idx) => (
                        <div key={idx} className="p-3 bg-white border border-orange-200 rounded-lg ml-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{analysis.required.skill_name}</span>
                                <Badge variant={analysis.required.is_mandatory ? 'destructive' : 'secondary'} className="text-xs">
                                  {analysis.required.is_mandatory ? 'Mandatory' : 'Optional'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Current: Level {analysis.current?.proficiency_level || 0}/5 → Required: Level {analysis.required.proficiency_level}/5
                              </p>
                              {analysis.current?.years_experience && (
                                <p className="text-xs text-muted-foreground">
                                  {analysis.current.years_experience} years experience
                                </p>
                              )}
                            </div>
                            <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                              Gap: {analysis.gap} levels
                            </Badge>
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
              <div className="space-y-3">
                <h4 className="font-medium text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Skills Meeting Requirements ({skillsByStatus.meets_required.length + skillsByStatus.exceeds_required.length})
                </h4>

                {/* Meets Required */}
                {skillsByStatus.meets_required.length > 0 && (
                  <Collapsible 
                    open={expandedSections.meets_required} 
                    onOpenChange={() => toggleSection('meets_required')}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-700">Meets Required Level ({skillsByStatus.meets_required.length})</span>
                      </div>
                      {expandedSections.meets_required ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 mt-2">
                      {skillsByStatus.meets_required.map((analysis, idx) => (
                        <div key={idx} className="p-3 bg-white border border-green-200 rounded-lg ml-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{analysis.required.skill_name}</span>
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                  {analysis.required.is_mandatory ? 'Mandatory' : 'Optional'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Level {analysis.current?.proficiency_level}/5 (matches requirement)
                              </p>
                              {analysis.current?.years_experience && (
                                <p className="text-xs text-muted-foreground">
                                  {analysis.current.years_experience} years experience
                                </p>
                              )}
                            </div>
                            <Badge className="ml-2 bg-green-500">
                              ✓ Met
                            </Badge>
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