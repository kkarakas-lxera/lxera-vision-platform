import React, { useState } from 'react';
import { CollapsibleCard } from '@/components/ui/collapsible-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Target,
  CheckCircle2,
  XCircle,
  ChevronDown,
  AlertCircle,
  Download,
  BookOpen,
  TrendingUp
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

  const summary = `Top Skills: ${mergedSkills.slice(0, 5).map(s => s.skill_name).join(' • ')}
From CV: ${cvSkills.length} | Position: ${positionSkills.length} | Assessment: ${assessmentSkills.length} | Verified: ${verifiedCount}`;

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
        {/* Skills Table */}
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium">
            <div className="col-span-4">From CV ({cvSkills.length})</div>
            <div className="col-span-3">Position ({positionSkills.length})</div>
            <div className="col-span-2">Assessment ({assessmentSkills.length})</div>
            <div className="col-span-3">Verification Status</div>
          </div>
          
          <ScrollArea className="h-[400px]">
            <div className="divide-y">
              {/* Skills Display */}
              <div className="grid grid-cols-12 gap-4 p-4">
                {/* CV Skills */}
                <div className="col-span-4 space-y-2">
                  {cvSkills.slice(0, 5).map(skill => (
                    <div key={skill.skill_name} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{skill.skill_name}</span>
                    </div>
                  ))}
                  {cvSkills.length > 5 && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      +{cvSkills.length - 5} more
                    </Button>
                  )}
                </div>
                
                {/* Position Required Skills */}
                <div className="col-span-3 space-y-2">
                  {positionSkills.slice(0, 5).map(skill => (
                    <div key={skill.skill_name} className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{skill.skill_name}</span>
                    </div>
                  ))}
                  {positionSkills.length > 5 && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      +{positionSkills.length - 5} more
                    </Button>
                  )}
                </div>
                
                {/* Assessment Skills */}
                <div className="col-span-2 space-y-2">
                  {assessmentSkills.slice(0, 3).map(skill => (
                    <div key={skill.skill_name} className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm truncate">{skill.skill_name}</span>
                    </div>
                  ))}
                  {assessmentSkills.length > 3 && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      +{assessmentSkills.length - 3} more
                    </Button>
                  )}
                </div>
                
                {/* Verification Details */}
                <div className="col-span-3 space-y-2">
                  {mergedSkills.filter(s => s.verification).slice(0, 5).map(skill => (
                    <div key={skill.skill_name}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between h-auto py-2"
                        onClick={() => setExpandedSkill(
                          expandedSkill === skill.skill_name ? null : skill.skill_name
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {getVerificationIcon(skill.verification?.score)}
                          <span className="text-sm">{skill.skill_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {skill.verification?.score}% ({skill.verification?.questionsAnswered}/{skill.verification?.totalQuestions})
                          </span>
                          <ChevronDown className={`h-3 w-3 transition-transform ${
                            expandedSkill === skill.skill_name ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </Button>
                      
                      {expandedSkill === skill.skill_name && skill.verification && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-md space-y-2">
                          <div className="flex items-center gap-2 text-xs flex-wrap">
                            {skill.verification.responses?.map((response: any, index: number) => (
                              <span key={`Q${index + 1}`}>
                                Q{index + 1}: {response.correct ? '✓' : '✗'}
                              </span>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Time: {skill.verification.responses?.length > 0 
                              ? Math.round(skill.verification.responses.reduce((sum: number, r: any) => sum + (r.time_taken || 0), 0) / skill.verification.responses.length)
                              : 0}s • 
                            Verified: {skill.verification.lastVerified ? 
                              new Date(skill.verification.lastVerified).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Download Skills Report
          </Button>
        </div>
      </div>
    </CollapsibleCard>
  );
}