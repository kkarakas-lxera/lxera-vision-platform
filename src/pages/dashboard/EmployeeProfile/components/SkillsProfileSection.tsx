import React, { useState } from 'react';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Target,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Download,
  BookOpen,
  TrendingUp,
  FileText,
  Brain,
  Clock,
  Award,
  HelpCircle,
  Eye
} from 'lucide-react';

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
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  console.log('=== SKILLS SECTION DEBUG ===');
  console.log('Employee Skills Profile:', employee.skills_profile);
  console.log('Employee Verified Skills Raw:', employee.verifiedSkillsRaw);
  console.log('Employee Verified Skills Stats:', employee.verifiedSkills);
  
  // Debug verification data
  if (employee.verifiedSkillsRaw) {
    console.log('Verification Data Analysis:');
    employee.verifiedSkillsRaw.forEach((skill: any, index: number) => {
      console.log(`Skill ${index + 1}:`, {
        name: skill.skill_name,
        is_from_cv: skill.is_from_cv,
        is_from_position: skill.is_from_position,
        verification_score: skill.verification_score,
        responses: skill.responses?.length || 0,
        questions: skill.questions_asked?.length || 0,
        time_taken: skill.responses?.[0]?.time_taken || 'N/A',
        determined_source: skill.is_from_cv ? 'cv' : (skill.is_from_position ? 'position' : 'assessment')
      });
    });
  }

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

  // Merge skills data with verification data
  const mergedSkills = React.useMemo(() => {
    const skillsMap = new Map<string, any>();
    
    // Add skills from profile
    employee.skills_profile?.extracted_skills?.forEach(skill => {
      skillsMap.set(skill.skill_name, {
        ...skill,
        source: 'cv'
      });
    });

    // Add verification data
    employee.verifiedSkillsRaw?.forEach(verified => {
      const existing = skillsMap.get(verified.skill_name);
      if (existing) {
        // Update source based on verification data
        existing.source = verified.is_from_cv ? 'cv' : (verified.is_from_position ? 'position' : 'assessment');
        existing.verification = {
          score: Math.round(verified.verification_score * 100),
          questionsAnswered: verified.responses?.filter((r: any) => r.correct).length || 0,
          totalQuestions: verified.questions_asked?.length || 0,
          lastVerified: verified.verified_at || verified.created_at,
          responses: verified.responses || [],
          questions: verified.questions_asked || []
        };
      } else {
        skillsMap.set(verified.skill_name, {
          skill_name: verified.skill_name,
          source: verified.is_from_cv ? 'cv' : (verified.is_from_position ? 'position' : 'assessment'),
          verification: {
            score: Math.round(verified.verification_score * 100),
            questionsAnswered: verified.responses?.filter((r: any) => r.correct).length || 0,
            totalQuestions: verified.questions_asked?.length || 0,
            lastVerified: verified.verified_at || verified.created_at,
            responses: verified.responses || [],
            questions: verified.questions_asked || []
          }
        });
      }
    });

    return Array.from(skillsMap.values());
  }, [employee.skills_profile, employee.verifiedSkillsRaw]);

  // Get position requirements
  const positionRequirements = employee.current_position_requirements?.required_skills || [];
  const niceToHaveSkills = employee.current_position_requirements?.nice_to_have_skills || [];
  
  const cvSkills = mergedSkills.filter(s => s.source === 'cv');
  const positionSkills = mergedSkills.filter(s => s.source === 'position');
  const assessmentSkills = mergedSkills.filter(s => s.source === 'assessment');
  const verifiedCount = mergedSkills.filter(s => s.verification).length;

  // Debug skill categorization
  console.log('=== SKILLS CATEGORIZATION DEBUG ===');
  console.log('Total merged skills:', mergedSkills.length);
  console.log('CV Skills:', cvSkills.length, cvSkills.map(s => s.skill_name));
  console.log('Position Skills:', positionSkills.length, positionSkills.map(s => s.skill_name));
  console.log('Assessment Skills:', assessmentSkills.length, assessmentSkills.map(s => s.skill_name));
  console.log('All skills with sources:', mergedSkills.map(s => ({ name: s.skill_name, source: s.source })));

  const cvVerifiedCount = mergedSkills.filter(s => s.source === 'cv' && s.verification).length;
  const positionVerifiedCount = mergedSkills.filter(s => s.source === 'position' && s.verification).length;
  
  const summary = `From CV: ${cvSkills.length} skills extracted | Position Requirements: ${positionRequirements.length} skills needed | Verified: ${verifiedCount} total (${cvVerifiedCount} CV, ${positionVerifiedCount} Position)`;

  const getVerificationIcon = (score?: number) => {
    if (!score) return null;
    if (score >= 70) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (score >= 40) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getSourceBadge = (source: string) => {
    const variant = source === 'cv' ? 'default' : 'secondary';
    return <Badge variant={variant} className="text-xs">{source.toUpperCase()}</Badge>;
  };

  return (
    <CollapsibleCard
      title="Skills Overview"
      icon={<Target className="h-5 w-5" />}
      summary={summary}
    >
      <div className="space-y-6">
        {/* Skills Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{cvSkills.length}</div>
                  <div className="text-sm text-muted-foreground">From CV</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{positionRequirements.length}</div>
                  <div className="text-sm text-muted-foreground">Position Required</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{assessmentSkills.length}</div>
                  <div className="text-sm text-muted-foreground">AI Assessed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{verifiedCount}</div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Position Requirements Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Position Requirements: {employee.current_position_title || 'Financial Consultant'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {positionRequirements.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {positionRequirements.map((requirement, index) => {
                    // Check if employee has this skill and if it's verified
                    const employeeSkill = mergedSkills.find(s => s.skill_name === requirement.skill_name);
                    const isVerified = employeeSkill?.verification;
                    const hasSkill = employeeSkill !== undefined;
                    
                    return (
                      <div key={requirement.skill_id || index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {hasSkill ? (
                              isVerified ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-600" />
                              )
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <Target className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{requirement.skill_name}</span>
                          {requirement.is_mandatory && <Badge variant="destructive" className="text-xs">Mandatory</Badge>}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            Required: Level {requirement.proficiency_level}
                          </div>
                          {employeeSkill && (
                            <div className="text-sm">
                              {isVerified ? (
                                <span className="text-green-600 font-medium">
                                  Verified: {employeeSkill.verification.score}%
                                </span>
                              ) : (
                                <span className="text-muted-foreground">
                                  Current: Level {employeeSkill.proficiency_level || 'N/A'}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Summary Stats */}
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {positionRequirements.filter(r => mergedSkills.some(s => s.skill_name === r.skill_name && s.verification)).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Verified</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {positionRequirements.filter(r => mergedSkills.some(s => s.skill_name === r.skill_name && !s.verification)).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Unverified</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {positionRequirements.filter(r => !mergedSkills.some(s => s.skill_name === r.skill_name)).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Missing</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No specific skill requirements defined for this position.</p>
                <p className="text-sm mt-2">Position: {employee.current_position_title || 'Not specified'}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Skills Tabs */}
        <Tabs defaultValue="cv" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cv" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CV Skills ({cvSkills.length})
            </TabsTrigger>
            <TabsTrigger value="position" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Position ({positionRequirements.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Verified ({verifiedCount})
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Details
            </TabsTrigger>
          </TabsList>
          
          {/* CV Skills Tab */}
          <TabsContent value="cv" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Skills Extracted from CV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {cvSkills.map(skill => (
                      <div key={skill.skill_name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{skill.skill_name}</span>
                          <Badge variant="secondary">CV</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {skill.proficiency_level && (
                            <div className="flex items-center gap-2">
                              <Progress value={skill.proficiency_level * 25} className="w-16" />
                              <span className="text-sm text-muted-foreground">
                                {skill.proficiency_level}/4
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Position Requirements Tab */}
          <TabsContent value="position" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Position Requirements vs Employee Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {positionRequirements.map((requirement, index) => {
                      const employeeSkill = mergedSkills.find(s => s.skill_name === requirement.skill_name);
                      const verificationData = employee.verifiedSkillsRaw?.find(v => v.skill_name === requirement.skill_name);
                      const isVerified = employeeSkill?.verification;
                      const hasSkill = employeeSkill !== undefined;
                      
                      return (
                        <Card key={requirement.skill_id || index} className={hasSkill ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'}>
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {hasSkill ? (
                                    isVerified ? (
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    )
                                  ) : (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  )}
                                  <div>
                                    <h4 className="font-semibold">{requirement.skill_name}</h4>
                                    <Badge variant={requirement.is_mandatory ? "destructive" : "secondary"} className="mt-1">
                                      {requirement.is_mandatory ? 'Mandatory' : 'Nice to Have'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">
                                    Required: Level {requirement.proficiency_level}
                                  </div>
                                  {hasSkill && (
                                    <div className="text-sm font-medium mt-1">
                                      {isVerified ? (
                                        <span className="text-green-600">
                                          Verified: {employeeSkill.verification.score}%
                                        </span>
                                      ) : (
                                        <span className="text-yellow-600">
                                          Has Skill (Unverified)
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {!hasSkill && (
                                    <div className="text-sm font-medium mt-1 text-red-600">
                                      Missing Skill
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Show verification details if available */}
                              {isVerified && verificationData && (
                                <div className="border-t pt-3">
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <HelpCircle className="h-4 w-4" />
                                      {verificationData.questions_asked?.length || 0} questions
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {verificationData.responses?.reduce((sum: number, r: any) => sum + (r.time_taken || 0), 0) || 0}s total
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Award className="h-4 w-4" />
                                      {Math.round((verificationData.verification_score || 0) * 100)}% score
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {/* Nice to Have Skills Section */}
                    {niceToHaveSkills.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <h4 className="text-sm font-semibold text-muted-foreground">Nice to Have Skills</h4>
                        {niceToHaveSkills.map((skill, index) => {
                          const employeeSkill = mergedSkills.find(s => s.skill_name === skill.skill_name);
                          const hasSkill = employeeSkill !== undefined;
                          
                          return (
                            <div key={skill.skill_id || index} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                {hasSkill ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                                )}
                                <span className="text-sm">{skill.skill_name}</span>
                                <Badge variant="outline" className="text-xs">Optional</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Level {skill.proficiency_level}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Assessment Details Tab (renamed from Assessment Skills Tab) */}
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Detailed Verification Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {employee.verifiedSkillsRaw?.map((verificationData, index) => {
                      const skill = mergedSkills.find(s => s.skill_name === verificationData.skill_name);
                      const skillSource = verificationData.is_from_cv ? 'CV' : (verificationData.is_from_position ? 'Position' : 'Assessment');
                      
                      return (
                      <Card key={verificationData.skill_name} className={`border-l-4 ${
                        skillSource === 'CV' ? 'border-l-green-500' : 
                        skillSource === 'Position' ? 'border-l-blue-500' : 
                        'border-l-purple-500'
                      }`}>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {/* Skill Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Brain className="h-5 w-5 text-purple-600" />
                                <div>
                                  <h4 className="font-semibold">{verificationData.skill_name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={skillSource === 'CV' ? 'default' : skillSource === 'Position' ? 'secondary' : 'outline'}>
                                      From {skillSource}
                                    </Badge>
                                    {verificationData.assessment_type && (
                                      <Badge variant="outline" className="text-xs">
                                        {verificationData.assessment_type}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600">
                                  {Math.round((verificationData.verification_score || 0) * 100)}%
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {verificationData.responses?.filter((r: any) => r.correct).length || 0}/{verificationData.questions_asked?.length || 0} correct
                                </div>
                              </div>
                            </div>
                            
                            {/* Assessment Details */}
                            {verificationData && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {Math.round(verificationData.responses?.reduce((sum: number, r: any) => sum + (r.time_taken || 0), 0) / (verificationData.responses?.length || 1))}s avg
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Award className="h-4 w-4" />
                                    Verified: {new Date(verificationData.verified_at || verificationData.created_at || '').toLocaleDateString()}
                                  </div>
                                </div>
                                
                                {/* Questions and Answers */}
                                <div className="space-y-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedSkill(
                                      expandedSkill === verificationData.skill_name ? null : verificationData.skill_name
                                    )}
                                    className="w-full justify-between"
                                  >
                                    <span className="flex items-center gap-2">
                                      <HelpCircle className="h-4 w-4" />
                                      View Assessment Questions
                                    </span>
                                    <ChevronRight className={`h-4 w-4 transition-transform ${
                                      expandedSkill === verificationData.skill_name ? 'rotate-90' : ''
                                    }`} />
                                  </Button>
                                  
                                  {expandedSkill === verificationData.skill_name && (
                                    <div className="mt-4 space-y-4 border-t pt-4">
                                      {verificationData.questions_asked?.map((question: any, qIndex: number) => {
                                        const response = verificationData.responses?.[qIndex];
                                        const isCorrect = response?.correct;
                                        
                                        return (
                                          <div key={qIndex} className="p-4 border rounded-lg bg-muted/30">
                                            <div className="space-y-3">
                                              <div className="flex items-start gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                  isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                  {qIndex + 1}
                                                </div>
                                                <div className="flex-1">
                                                  <p className="font-medium text-sm">{question.question}</p>
                                                  <div className="mt-2 text-xs text-muted-foreground">
                                                    Difficulty: {question.difficulty}/5 • Time: {response?.time_taken || 0}s
                                                  </div>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                                  isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                                </div>
                                              </div>
                                              
                                              {/* Answer Options */}
                                              <div className="ml-9 space-y-1">
                                                {question.options?.map((option: string, oIndex: number) => {
                                                  const isSelected = response?.selected_answer === oIndex.toString();
                                                  const isCorrectAnswer = question.correct_answer === oIndex;
                                                  
                                                  return (
                                                    <div key={oIndex} className={`p-2 rounded text-xs border ${
                                                      isSelected && isCorrectAnswer 
                                                        ? 'bg-green-50 border-green-200 text-green-700'
                                                        : isSelected && !isCorrectAnswer
                                                        ? 'bg-red-50 border-red-200 text-red-700'
                                                        : isCorrectAnswer
                                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                        : 'bg-gray-50 border-gray-200'
                                                    }`}>
                                                      <div className="flex items-center gap-2">
                                                        <span className="font-mono">{String.fromCharCode(65 + oIndex)}.</span>
                                                        <span>{option}</span>
                                                        {isSelected && <span className="ml-auto">← Selected</span>}
                                                        {isCorrectAnswer && !isSelected && <span className="ml-auto text-blue-600">← Correct</span>}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                              
                                              {/* Explanation */}
                                              {question.explanation && (
                                                <div className="ml-9 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                                                  <div className="flex items-start gap-2">
                                                    <Eye className="h-4 w-4 text-blue-600 mt-0.5" />
                                                    <div>
                                                      <div className="font-medium text-blue-800 mb-1">Explanation:</div>
                                                      <div className="text-blue-700">{question.explanation}</div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Verified Skills Tab */}
          <TabsContent value="verified" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Skills Verification Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {mergedSkills.filter(s => s.verification).map(skill => (
                      <div key={skill.skill_name} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          {getVerificationIcon(skill.verification?.score)}
                          <span className="font-medium">{skill.skill_name}</span>
                          <Badge variant={skill.source === 'cv' ? 'default' : skill.source === 'position' ? 'secondary' : 'outline'} className="text-xs">
                            From {skill.source?.toUpperCase() || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">{skill.verification?.score}%</div>
                            <div className="text-xs text-muted-foreground">
                              {skill.verification?.questionsAnswered}/{skill.verification?.totalQuestions} correct
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(skill.verification.responses?.reduce((sum: number, r: any) => sum + (r.time_taken || 0), 0) / (skill.verification.responses?.length || 1))}s
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Skills Report
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Re-analyze Skills
          </Button>
        </div>
      </div>
    </CollapsibleCard>
  );
}