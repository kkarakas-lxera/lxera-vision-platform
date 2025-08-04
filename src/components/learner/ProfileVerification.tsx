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
      
      // Check which skills are already verified
      const { data: verifiedData } = await supabase
        .from('employee_skills_validation')
        .select('skill_name')
        .eq('employee_id', employeeId)
        .not('assessment_type', 'is', null);
      
      if (verifiedData) {
        setVerifiedSkills(verifiedData.map(s => s.skill_name));
        
        // If some skills are already verified, start from the first unverified skill
        const firstUnverifiedIndex = skills.findIndex(
          skill => !verifiedData.some(v => v.skill_name === skill.skill_name)
        );
        if (firstUnverifiedIndex !== -1) {
          setCurrentSkillIndex(firstUnverifiedIndex);
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
    if (verified) {
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
    onComplete();
  };

  const progress = skillsToVerify.length > 0 
    ? (verifiedSkills.length / skillsToVerify.length) * 100 
    : 0;

  const currentSkill = skillsToVerify[currentSkillIndex];
  const isCurrentSkillVerified = currentSkill && verifiedSkills.includes(currentSkill.skill_name);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
          {skillsToVerify.map((skill, index) => (
            <button
              key={skill.skill_name}
              onClick={() => setCurrentSkillIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentSkillIndex 
                  ? "w-6 bg-primary" 
                  : verifiedSkills.includes(skill.skill_name)
                  ? "bg-green-500"
                  : "bg-gray-300"
              )}
              aria-label={`Go to skill ${index + 1}: ${skill.skill_name}`}
            />
          ))}
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
              <Button
                onClick={handleNextSkill}
                disabled={currentSkillIndex === skillsToVerify.length - 1}
                variant={isCurrentSkillVerified ? "default" : "outline"}
                className="w-full"
              >
                {isCurrentSkillVerified ? 'Continue to Next Skill' : 'Skip This Skill'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              {verifiedSkills.length === skillsToVerify.length - 1 && (
                <Button
                  onClick={handleComplete}
                  variant="ghost"
                  className="w-full text-sm"
                >
                  Complete with {skillsToVerify.length - 1} verified skills
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            <strong>Tip:</strong> Each skill assessment takes 2-3 minutes. Answer honestly to get personalized learning recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}