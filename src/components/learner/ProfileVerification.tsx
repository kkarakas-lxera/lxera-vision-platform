import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { VerificationService, SkillToVerify } from '@/services/verificationService';
import SkillAssessmentModal from './SkillAssessmentModal';

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
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState<SkillToVerify | null>(null);

  useEffect(() => {
    loadSkillsToVerify();
  }, [employeeId, positionId]);

  const loadSkillsToVerify = async () => {
    try {
      setLoading(true);
      const skills = await VerificationService.getSkillsToVerify(employeeId, positionId);
      setSkillsToVerify(skills);
      
      // Check which skills are already verified
      const { data: verifiedData } = await supabase
        .from('employee_skills_validation')
        .select('skill_name')
        .eq('employee_id', employeeId)
        .not('assessment_type', 'is', null);
      
      if (verifiedData) {
        setVerifiedSkills(verifiedData.map(s => s.skill_name));
      }
    } catch (error) {
      console.error('Error loading skills to verify:', error);
      toast.error('Failed to load skills for verification');
    } finally {
      setLoading(false);
    }
  };

  const startVerification = () => {
    if (skillsToVerify.length === 0) {
      toast.error('No skills to verify');
      return;
    }

    // Find first unverified skill
    const firstUnverifiedIndex = skillsToVerify.findIndex(
      skill => !verifiedSkills.includes(skill.skill_name)
    );

    if (firstUnverifiedIndex === -1) {
      // All skills already verified
      onComplete();
      return;
    }

    setCurrentSkillIndex(firstUnverifiedIndex);
    setCurrentSkill(skillsToVerify[firstUnverifiedIndex]);
    setAssessmentModalOpen(true);
  };

  // Prevent completion if skills are unverified
  const handleComplete = () => {
    if (unverifiedCount > 0) {
      toast.error(`Please verify all ${unverifiedCount} remaining skills before completing your profile`);
      return;
    }
    onComplete();
  };

  const handleAssessmentComplete = async (skillName: string, verified: boolean) => {
    if (verified) {
      setVerifiedSkills([...verifiedSkills, skillName]);
    }

    // Move to next unverified skill
    let nextIndex = currentSkillIndex + 1;
    while (nextIndex < skillsToVerify.length && verifiedSkills.includes(skillsToVerify[nextIndex].skill_name)) {
      nextIndex++;
    }

    if (nextIndex < skillsToVerify.length) {
      setCurrentSkillIndex(nextIndex);
      setCurrentSkill(skillsToVerify[nextIndex]);
      // Keep modal open for next skill
    } else {
      // All skills processed
      setAssessmentModalOpen(false);
      toast.success('Profile verification completed!');
      onComplete();
    }
  };

  const progress = skillsToVerify.length > 0 
    ? (verifiedSkills.length / skillsToVerify.length) * 100 
    : 0;

  const unverifiedCount = skillsToVerify.filter(
    skill => !verifiedSkills.includes(skill.skill_name)
  ).length;

  const getSkillBadgeColor = (skill: SkillToVerify) => {
    if (verifiedSkills.includes(skill.skill_name)) {
      return 'bg-green-100 text-green-700';
    }
    if (skill.source === 'position_required') {
      return 'bg-red-100 text-red-700';
    }
    if (skill.source === 'position_nice') {
      return 'bg-orange-100 text-orange-700';
    }
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Clock className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Profile Verification</CardTitle>
              <CardDescription>
                Verify your skills through AI-powered assessments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Verification Progress</span>
              <span className="font-medium">{verifiedSkills.length} of {skillsToVerify.length} skills</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Position Context */}
          {positionTitle && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-medium">Verifying for position:</span> {positionTitle}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Skills will be assessed based on position requirements
              </p>
            </div>
          )}

          {/* Skills List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Skills to Verify</h3>
            <div className="space-y-2">
              {skillsToVerify.map((skill, index) => (
                <motion.div
                  key={skill.skill_name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    verifiedSkills.includes(skill.skill_name) 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {verifiedSkills.includes(skill.skill_name) ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                    <span className="text-sm font-medium">{skill.skill_name}</span>
                    <Badge variant="secondary" className={cn("text-xs", getSkillBadgeColor(skill))}>
                      {skill.source === 'position_required' ? 'Required' :
                       skill.source === 'position_nice' ? 'Nice to Have' :
                       skill.source === 'cv' ? 'From CV' : 'Manual'}
                    </Badge>
                  </div>
                  {skill.required_level && (
                    <span className="text-xs text-muted-foreground">
                      Level {skill.required_level} required
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {unverifiedCount > 0 ? (
              <Button onClick={startVerification} className="w-full">
                Start Verification
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="w-full" variant="default">
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Profile
              </Button>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> All skills must be verified to complete your profile. This ensures accurate skill assessment
              and personalized learning recommendations tailored to your actual proficiency levels.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Modal */}
      {currentSkill && (
        <SkillAssessmentModal
          open={assessmentModalOpen}
          onOpenChange={setAssessmentModalOpen}
          skill={currentSkill}
          employeeId={employeeId}
          positionContext={{
            id: positionId,
            title: positionTitle || 'Not specified',
            level: employeeContext.education_level
          }}
          employeeContext={employeeContext}
          onComplete={handleAssessmentComplete}
        />
      )}
    </>
  );
}