import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { VerificationService, SkillToVerify } from '@/services/verificationService';
import InlineSkillAssessment from './InlineSkillAssessment';

interface ProfileVerificationProps {
  employeeId: string;
  positionId?: string;
  positionTitle?: string;
  employeeContext: {
    years_experience?: number;
    current_projects?: string[];
    daily_challenges?: string[];
    education_level?: string;
    work_experience?: any[];
  };
  onComplete: () => void;
}

export default function ProfileVerification({
  employeeId,
  positionId,
  positionTitle,
  employeeContext,
  onComplete
}: ProfileVerificationProps) {
  const [loading, setLoading] = useState(true);
  const [skillsToVerify, setSkillsToVerify] = useState<SkillToVerify[]>([]);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([]);
  const [preGenerationStatus, setPreGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [generationProgress, setGenerationProgress] = useState({ total: 0, completed: 0 });
  const [firstSkillReady, setFirstSkillReady] = useState(false);

  useEffect(() => {
    loadSkillsToVerify();
  }, [employeeId, positionId]);

  const loadSkillsToVerify = async () => {
    try {
      setLoading(true);
      console.log('[ProfileVerification] Loading skills for:', { employeeId, positionId });
      const skills = await VerificationService.getSkillsToVerify(employeeId, positionId);
      console.log('[ProfileVerification] Skills loaded:', skills);
      setSkillsToVerify(skills);
      
      // Check which skills are already verified from unified employee_skills
      const { data: verifiedData } = await supabase
        .from('employee_skills')
        .select('skill_name')
        .eq('employee_id', employeeId)
        .eq('source', 'verified'); // Only verified skills
      
      if (verifiedData) {
        // Only count verified skills that are in the current skills to verify list
        const relevantVerifiedSkills = verifiedData
          .map(s => s.skill_name)
          .filter(skillName => skills.some(s => s.skill_name === skillName));
        
        setVerifiedSkills(relevantVerifiedSkills);
        
        // If some skills are already verified, start from the first unverified skill
        const firstUnverifiedIndex = skills.findIndex(
          skill => !relevantVerifiedSkills.includes(skill.skill_name)
        );
        if (firstUnverifiedIndex !== -1) {
          setCurrentSkillIndex(firstUnverifiedIndex);
        } else {
          // All skills are verified, start at the last one
          setCurrentSkillIndex(Math.max(0, skills.length - 1));
        }
        
        // If the first skill is already verified, set firstSkillReady
        if (skills.length > 0 && relevantVerifiedSkills.includes(skills[0].skill_name)) {
          setFirstSkillReady(true);
        }
      }

      // Pre-generate questions for unverified skills
      const unverifiedSkills = skills.filter(
        skill => !verifiedData?.some(v => v.skill_name === skill.skill_name)
      );
      
      if (unverifiedSkills.length === 0) {
        // All skills are verified
        setFirstSkillReady(true);
      } else {
        // Check for existing questions first
        console.log('[ProfileVerification] Checking for existing questions for unverified skills');
        let existingCount = 0;
        
        // Check each unverified skill for existing questions
        for (const skill of unverifiedSkills) {
          const existing = await VerificationService.getStoredQuestions(employeeId, skill.skill_name);
          if (existing) {
            existingCount++;
            console.log(`[ProfileVerification] Found existing questions for ${skill.skill_name}`);
          }
        }
        
        console.log(`[ProfileVerification] Found ${existingCount} skills with existing questions out of ${unverifiedSkills.length} unverified skills`);
        
        setGenerationProgress({ total: unverifiedSkills.length, completed: existingCount });
        
        // If first skill has existing questions, mark as ready
        if (unverifiedSkills.length > 0) {
          const firstSkillHasQuestions = await VerificationService.getStoredQuestions(employeeId, unverifiedSkills[0].skill_name);
          if (firstSkillHasQuestions) {
            setFirstSkillReady(true);
          }
        }
        
        // Generate questions for skills that don't have them
        const skillsNeedingGeneration = [];
        for (const skill of unverifiedSkills) {
          const existing = await VerificationService.getStoredQuestions(employeeId, skill.skill_name);
          if (!existing) {
            skillsNeedingGeneration.push(skill);
          }
        }
        
        console.log(`[ProfileVerification] ${skillsNeedingGeneration.length} skills need question generation`);
        
        if (skillsNeedingGeneration.length === 0) {
          // All questions already exist
          setFirstSkillReady(true);
          setPreGenerationStatus('completed');
        } else {
          // Generate questions for skills that need them
          const firstSkillNeedsGeneration = !await VerificationService.getStoredQuestions(employeeId, unverifiedSkills[0].skill_name);
          
          if (firstSkillNeedsGeneration) {
            // First skill needs generation
            console.log('[ProfileVerification] Generating questions for first skill:', unverifiedSkills[0].skill_name);
            
            try {
              const firstResult = await VerificationService.preGenerateAllQuestions(
                employeeId,
                [unverifiedSkills[0]],
                {
                  id: positionId,
                  title: positionTitle || 'Not specified',
                  level: employeeContext.education_level
                },
                employeeContext
              );
              
              if (firstResult.success && firstResult.results.length > 0) {
                setFirstSkillReady(true);
                setGenerationProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
              }
            } catch (error) {
              console.error('[ProfileVerification] Failed to generate first skill questions:', error);
            }
          } else {
            // First skill already has questions
            setFirstSkillReady(true);
          }
          
          // Generate remaining skills that need questions in background
          const remainingSkillsToGenerate = firstSkillNeedsGeneration 
            ? skillsNeedingGeneration.slice(1) 
            : skillsNeedingGeneration;
          
          if (remainingSkillsToGenerate.length > 0) {
            setPreGenerationStatus('generating');
            console.log('[ProfileVerification] Pre-generating questions for', remainingSkillsToGenerate.length, 'remaining skills');
            
            // Generate remaining skills in background
            VerificationService.preGenerateAllQuestions(
              employeeId,
              remainingSkillsToGenerate,
              {
                id: positionId,
                title: positionTitle || 'Not specified',
                level: employeeContext.education_level
              },
              employeeContext
            ).then(result => {
              if (result.success) {
                console.log('[ProfileVerification] Background pre-generation completed:', result.summary);
                setPreGenerationStatus('completed');
                // Count both newly generated and already existing as completed
                const processedCount = result.results.filter(r => 
                  r.status === 'generated' || r.status === 'already_exists'
                ).length;
                setGenerationProgress(prev => ({ 
                  ...prev, 
                  completed: Math.min(prev.completed + processedCount, prev.total)
                }));
              } else {
                console.error('[ProfileVerification] Background pre-generation failed:', result.errors);
                setPreGenerationStatus('error');
              }
            });
          } else {
            // All skills have questions already
            setPreGenerationStatus('completed');
          }
        }
      }
    } catch (error) {
      console.error('Error loading skills to verify:', error);
      toast.error('Failed to load skills for verification');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillComplete = (skillName: string, verified: boolean) => {
    if (verified && !verifiedSkills.includes(skillName)) {
      setVerifiedSkills([...verifiedSkills, skillName]);
      
      // Auto-advance to next skill after a short delay
      setTimeout(() => {
        if (currentSkillIndex < skillsToVerify.length - 1) {
          handleNextSkill();
        }
      }, 1500);
    }
  };

  const handleNextSkill = () => {
    if (currentSkillIndex < skillsToVerify.length - 1) {
      setCurrentSkillIndex(currentSkillIndex + 1);
    }
  };

  const handlePreviousSkill = () => {
    if (currentSkillIndex > 0) {
      setCurrentSkillIndex(currentSkillIndex - 1);
    }
  };

  const handleComplete = () => {
    const unverifiedCount = skillsToVerify.filter(
      skill => !verifiedSkills.includes(skill.skill_name)
    ).length;
    
    if (unverifiedCount > 0) {
      toast.error(`Please verify all ${unverifiedCount} remaining skills before completing your profile`);
      return;
    }
    
    toast.success('All skills verified successfully!');
    onComplete();
  };

  const progress = skillsToVerify.length > 0 
    ? (verifiedSkills.length / skillsToVerify.length) * 100 
    : 0;

  const currentSkill = skillsToVerify[currentSkillIndex];
  const isCurrentSkillVerified = currentSkill && verifiedSkills.includes(currentSkill.skill_name);

  // Show loading only while we're loading skills list and first skill
  if (loading || (skillsToVerify.length > 0 && !firstSkillReady && !isCurrentSkillVerified)) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Skills Verification</CardTitle>
              <CardDescription>
                Preparing your personalized assessment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium text-gray-700">
                {loading ? 'Loading your skills...' : 'Generating your first assessment...'}
              </p>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Identifying skills that need verification' : 'Creating personalized questions based on your role'}
              </p>
            </div>
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">What to expect:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Questions are tailored to your experience and role</li>
              <li>• You cannot skip assessments - all skills must be verified</li>
              <li>• Your progress is saved automatically</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (skillsToVerify.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Profile Verification</CardTitle>
              <CardDescription>No skills to verify</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You have no skills that require verification.
          </p>
          <Button onClick={onComplete} className="w-full mt-4">
            Complete Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Skills Verification</CardTitle>
            <CardDescription>
              Verify your skills through quick assessments
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium">
              {verifiedSkills.length} of {skillsToVerify.length} skills verified
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Position Context */}
        {positionTitle && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm">
              <span className="font-medium">Position:</span> {positionTitle}
            </p>
          </div>
        )}

        {/* Current Skill Assessment */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">
              Skill {currentSkillIndex + 1} of {skillsToVerify.length}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousSkill}
                disabled={currentSkillIndex === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-gray-500 w-12 text-center">
                {currentSkillIndex + 1}/{skillsToVerify.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextSkill}
                disabled={currentSkillIndex === skillsToVerify.length - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {currentSkill && (
            <motion.div
              key={currentSkill.skill_name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <InlineSkillAssessment
                skill={currentSkill}
                employeeId={employeeId}
                positionContext={{
                  id: positionId,
                  title: positionTitle || 'Not specified',
                  level: employeeContext.education_level
                }}
                employeeContext={employeeContext}
                onComplete={handleSkillComplete}
                isVerified={isCurrentSkillVerified}
              />
            </motion.div>
          )}
        </div>

        {/* Navigation Indicators */}
        <div className="flex justify-center gap-1 py-2">
          {skillsToVerify.map((skill, index) => {
            const isVerified = verifiedSkills.includes(skill.skill_name);
            return (
              <button
                key={`${skill.skill_name}-${index}`}
                onClick={() => setCurrentSkillIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentSkillIndex 
                    ? "w-6 bg-primary" 
                    : isVerified
                    ? "bg-green-500"
                    : "bg-gray-300"
                )}
                aria-label={`Go to skill ${index + 1}: ${skill.skill_name}${isVerified ? ' (verified)' : ''}`}
                title={`${skill.skill_name}${isVerified ? ' ✓' : ''}`}
              />
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          {verifiedSkills.length === skillsToVerify.length ? (
            <Button onClick={handleComplete} className="w-full" size="lg">
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Profile
            </Button>
          ) : (
            <div className="space-y-2">
              {isCurrentSkillVerified && (
                <Button
                  onClick={handleNextSkill}
                  disabled={currentSkillIndex === skillsToVerify.length - 1}
                  className="w-full"
                >
                  Continue to Next Skill
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {!isCurrentSkillVerified && (
                <p className="text-sm text-center text-muted-foreground">
                  Please complete the assessment above to continue
                </p>
              )}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}