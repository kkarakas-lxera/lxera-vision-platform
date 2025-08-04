import { supabase } from '@/integrations/supabase/client';

interface StoredQuestions {
  id: string;
  questions: any[];
  assessment_context: any;
}

export interface QuestionResponse {
  question_id: string;
  selected_answer: number | string;
  time_taken: number; // seconds
  correct: boolean;
}

export interface AssessmentResult {
  skill_name: string;
  questions: any[];
  responses: QuestionResponse[];
  calculated_level: number; // 0-3
  time_taken: number;
  score: number; // percentage
  verification_score: number; // confidence 0-1
}

export interface SkillToVerify {
  skill_name: string;
  skill_id?: string;
  source: 'position_required' | 'position_nice' | 'cv' | 'manual';
  required_level?: number;
  is_mandatory?: boolean;
}

export interface VerificationReport {
  employee_id: string;
  position_readiness: number; // percentage
  verified_skills: number;
  total_skills: number;
  skills_breakdown: {
    skill_name: string;
    verified_level: number;
    required_level?: number;
    gap?: number;
    source: string;
  }[];
  recommendations: string[];
  strengths: string[];
  improvement_areas: string[];
}

export class VerificationService {
  /**
   * Save assessment result to database
   */
  static async saveAssessmentResult(
    employeeId: string,
    skillName: string,
    assessment: AssessmentResult,
    positionId?: string
  ): Promise<void> {
    try {
      // Save to skill_assessment_history
      const { error: historyError } = await supabase
        .from('skill_assessment_history')
        .insert({
          employee_id: employeeId,
          skill_name: skillName,
          position_id: positionId,
          questions: assessment.questions,
          responses: assessment.responses,
          calculated_level: assessment.calculated_level,
          time_taken: assessment.time_taken,
          assessment_version: '1.0',
          context: {
            score: assessment.score,
            verification_score: assessment.verification_score
          }
        });

      if (historyError) throw historyError;

      // Update or insert into employee_skills_validation
      const { data: existingSkill } = await supabase
        .from('employee_skills_validation')
        .select('id')
        .eq('employee_id', employeeId)
        .eq('skill_name', skillName)
        .single();

      if (existingSkill) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('employee_skills_validation')
          .update({
            proficiency_level: assessment.calculated_level,
            assessment_type: 'ai_verified',
            assessment_data: {
              score: assessment.score,
              questions_count: assessment.questions.length,
              time_taken: assessment.time_taken
            },
            verified_at: new Date().toISOString(),
            verification_score: assessment.verification_score,
            questions_asked: assessment.questions,
            responses: assessment.responses
          })
          .eq('id', existingSkill.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('employee_skills_validation')
          .insert({
            employee_id: employeeId,
            skill_name: skillName,
            proficiency_level: assessment.calculated_level,
            assessment_type: 'ai_verified',
            assessment_data: {
              score: assessment.score,
              questions_count: assessment.questions.length,
              time_taken: assessment.time_taken
            },
            verified_at: new Date().toISOString(),
            verification_score: assessment.verification_score,
            questions_asked: assessment.questions,
            responses: assessment.responses,
            is_from_position: assessment.skill_name.includes('position') // Simple heuristic
          });

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error saving assessment result:', error);
      throw error;
    }
  }

  /**
   * Calculate proficiency level from assessment responses with enhanced factors
   */
  static calculateProficiency(responses: QuestionResponse[], questions?: any[]): {
    level: number;
    score: number;
    confidence: number;
    details?: {
      correctnessScore: number;
      difficultyWeightedScore: number;
      timeConsistencyScore: number;
      questionCountConfidence: number;
    };
  } {
    if (!responses || responses.length === 0) {
      return { level: 0, score: 0, confidence: 0 };
    }

    // 1. Calculate correctness score (basic percentage)
    const correctAnswers = responses.filter(r => r.correct).length;
    const totalQuestions = responses.length;
    const correctnessScore = (correctAnswers / totalQuestions) * 100;

    // 2. Calculate difficulty-weighted score if questions provided
    let difficultyWeightedScore = correctnessScore;
    if (questions && questions.length === responses.length) {
      let weightedCorrect = 0;
      let totalWeight = 0;
      
      responses.forEach((response, index) => {
        const question = questions[index];
        const weight = question.scoring_weight || 1.0;
        const difficulty = question.difficulty || 1;
        const adjustedWeight = weight * (difficulty / 2); // Higher difficulty = more weight
        
        if (response.correct) {
          weightedCorrect += adjustedWeight;
        }
        totalWeight += adjustedWeight;
      });
      
      difficultyWeightedScore = totalWeight > 0 ? (weightedCorrect / totalWeight) * 100 : correctnessScore;
    }

    // 3. Calculate time consistency score
    const times = responses.map(r => r.time_taken);
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    const timeVariance = times.reduce((sum, t) => sum + Math.pow(t - avgTime, 2), 0) / times.length;
    const timeStdDev = Math.sqrt(timeVariance);
    
    // Consistent timing is good (not guessing randomly)
    let timeConsistencyScore = 1.0;
    if (avgTime < 10) {
      timeConsistencyScore = 0.7; // Too fast, likely guessing
    } else if (timeStdDev > avgTime * 0.8) {
      timeConsistencyScore = 0.85; // Very inconsistent timing
    } else if (avgTime > 120) {
      timeConsistencyScore = 0.9; // Taking too long might indicate struggling
    }

    // 4. Calculate question count confidence
    let questionCountConfidence = 1.0;
    if (totalQuestions < 3) {
      questionCountConfidence = 0.7; // Low confidence with few questions
    } else if (totalQuestions < 4) {
      questionCountConfidence = 0.85;
    } else if (totalQuestions >= 5) {
      questionCountConfidence = 1.0; // High confidence with 5+ questions
    }

    // 5. Calculate final weighted score
    const finalScore = (
      difficultyWeightedScore * 0.7 +  // Main weight on weighted score
      correctnessScore * 0.3           // Some weight on raw correctness
    ) * timeConsistencyScore;

    // 6. Calculate confidence
    const confidence = (
      (finalScore / 100) * 
      timeConsistencyScore * 
      questionCountConfidence
    );

    // 7. Determine proficiency level with new thresholds
    let level = 0;
    if (finalScore >= 90 && totalQuestions >= 4) {
      level = 3; // Expert - High score with good sample size
    } else if (finalScore >= 75) {
      level = 2; // Using - Solid understanding
    } else if (finalScore >= 55) {
      level = 1; // Learning - Basic understanding
    } else {
      level = 0; // None - Needs significant improvement
    }

    // 8. Apply conservative adjustments for edge cases
    if (totalQuestions <= 3 && finalScore >= 85) {
      level = Math.min(level, 2); // Cap at Using for small sample with high score
    }
    if (totalQuestions === 2 && correctAnswers === 1) {
      level = 1; // Always Learning for 50% on 2 questions
    }

    return {
      level,
      score: Math.round(finalScore),
      confidence: Math.round(confidence * 100) / 100,
      details: {
        correctnessScore: Math.round(correctnessScore),
        difficultyWeightedScore: Math.round(difficultyWeightedScore),
        timeConsistencyScore: Math.round(timeConsistencyScore * 100) / 100,
        questionCountConfidence: Math.round(questionCountConfidence * 100) / 100
      }
    };
  }

  /**
   * Get skills that need verification for an employee
   */
  static async getSkillsToVerify(
    employeeId: string,
    positionId?: string
  ): Promise<SkillToVerify[]> {
    try {
      console.log('[VerificationService] Getting skills to verify for:', { employeeId, positionId });
      const skillsToVerify: SkillToVerify[] = [];

      // Get position required skills if position ID provided
      if (positionId) {
        const { data: position } = await supabase
          .from('st_company_positions')
          .select('required_skills, nice_to_have_skills')
          .eq('id', positionId)
          .single();

        if (position) {
          // Add required skills
          if (position.required_skills) {
            position.required_skills.forEach((skill: any) => {
              skillsToVerify.push({
                skill_name: skill.skill_name,
                skill_id: skill.skill_id,
                source: 'position_required',
                required_level: this.mapProficiencyToNumber(skill.proficiency_level),
                is_mandatory: true
              });
            });
          }

          // Add nice-to-have skills
          if (position.nice_to_have_skills) {
            position.nice_to_have_skills.forEach((skill: any) => {
              skillsToVerify.push({
                skill_name: skill.skill_name,
                skill_id: skill.skill_id,
                source: 'position_nice',
                required_level: this.mapProficiencyToNumber(skill.proficiency_level),
                is_mandatory: false
              });
            });
          }
        }
      }

      // Get employee's claimed skills
      const { data: claimedSkills, error: claimedError } = await supabase
        .from('employee_skills_validation')
        .select('skill_name, skill_id, is_from_cv, assessment_type')
        .eq('employee_id', employeeId)
        .is('assessment_type', null); // Only unverified skills

      console.log('[VerificationService] Claimed skills query result:', { 
        claimedSkills, 
        claimedError,
        count: claimedSkills?.length || 0 
      });

      if (claimedSkills) {
        claimedSkills.forEach(skill => {
          // Check if skill already in list
          const existing = skillsToVerify.find(s => s.skill_name === skill.skill_name);
          if (!existing) {
            skillsToVerify.push({
              skill_name: skill.skill_name,
              skill_id: skill.skill_id,
              source: skill.is_from_cv ? 'cv' : 'manual'
            });
          }
        });
      }

      // Prioritize: required skills first, then nice-to-have, then others
      const sortedSkills = skillsToVerify.sort((a, b) => {
        if (a.is_mandatory && !b.is_mandatory) return -1;
        if (!a.is_mandatory && b.is_mandatory) return 1;
        if (a.source === 'position_required' && b.source !== 'position_required') return -1;
        if (a.source !== 'position_required' && b.source === 'position_required') return 1;
        return 0;
      });

      console.log('[VerificationService] Final skills to verify:', {
        totalCount: sortedSkills.length,
        skills: sortedSkills
      });

      return sortedSkills;
    } catch (error) {
      console.error('Error getting skills to verify:', error);
      return [];
    }
  }

  /**
   * Generate verification report for an employee
   */
  static async generateVerificationReport(employeeId: string): Promise<VerificationReport | null> {
    try {
      // Get verification status
      const { data: status } = await supabase
        .rpc('get_employee_verification_status', { p_employee_id: employeeId });

      if (!status || status.length === 0) {
        return null;
      }

      const verificationStatus = status[0];

      // Get skills breakdown
      const { data: skills } = await supabase
        .from('employee_skills_validation')
        .select(`
          skill_name,
          proficiency_level,
          assessment_type,
          is_from_position,
          is_from_cv
        `)
        .eq('employee_id', employeeId);

      // Get position requirements
      const { data: employee } = await supabase
        .from('employees')
        .select(`
          current_position:st_company_positions!current_position_id(
            required_skills
          )
        `)
        .eq('id', employeeId)
        .single();

      const skillsBreakdown = skills?.map(skill => {
        // Find required level from position
        const positionSkill = employee?.current_position?.required_skills?.find(
          (rs: any) => rs.skill_name === skill.skill_name
        );
        
        const requiredLevel = positionSkill 
          ? this.mapProficiencyToNumber(positionSkill.proficiency_level)
          : undefined;

        return {
          skill_name: skill.skill_name,
          verified_level: skill.proficiency_level || 0,
          required_level: requiredLevel,
          gap: requiredLevel ? requiredLevel - (skill.proficiency_level || 0) : undefined,
          source: skill.is_from_position ? 'position' : skill.is_from_cv ? 'cv' : 'manual'
        };
      }) || [];

      // Generate insights
      const strengths = skillsBreakdown
        .filter(s => s.gap !== undefined && s.gap <= 0)
        .map(s => s.skill_name);

      const improvementAreas = skillsBreakdown
        .filter(s => s.gap !== undefined && s.gap > 0)
        .sort((a, b) => (b.gap || 0) - (a.gap || 0))
        .slice(0, 3)
        .map(s => s.skill_name);

      const recommendations = this.generateRecommendations(skillsBreakdown);

      return {
        employee_id: employeeId,
        position_readiness: verificationStatus.position_readiness_score || 0,
        verified_skills: verificationStatus.verified_skills || 0,
        total_skills: verificationStatus.total_skills || 0,
        skills_breakdown: skillsBreakdown,
        recommendations,
        strengths,
        improvement_areas
      };
    } catch (error) {
      console.error('Error generating verification report:', error);
      return null;
    }
  }

  /**
   * Helper: Map proficiency text to number
   */
  private static mapProficiencyToNumber(proficiency: string | number): number {
    // If already a number, return it
    if (typeof proficiency === 'number') {
      return proficiency;
    }
    
    // Otherwise map string to number
    const mapping: Record<string, number> = {
      'basic': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 3
    };
    return mapping[proficiency.toLowerCase()] || 1;
  }

  /**
   * Helper: Generate recommendations based on gaps
   */
  private static generateRecommendations(skillsBreakdown: any[]): string[] {
    const recommendations: string[] = [];

    // Find critical gaps (required skills with gaps)
    const criticalGaps = skillsBreakdown
      .filter(s => s.source === 'position' && s.gap && s.gap > 0)
      .sort((a, b) => (b.gap || 0) - (a.gap || 0));

    if (criticalGaps.length > 0) {
      recommendations.push(
        `Focus on improving ${criticalGaps[0].skill_name} - this is critical for your role`
      );
    }

    // Check for quick wins (skills that are close to requirement)
    const quickWins = skillsBreakdown
      .filter(s => s.gap === 1)
      .slice(0, 2);

    if (quickWins.length > 0) {
      recommendations.push(
        `Quick win: Improve ${quickWins.map(s => s.skill_name).join(' and ')} to meet requirements`
      );
    }

    // Overall readiness
    const verifiedCount = skillsBreakdown.filter(s => s.verified_level > 0).length;
    const totalCount = skillsBreakdown.length;
    
    if (verifiedCount < totalCount * 0.5) {
      recommendations.push('Complete skill verification to get personalized learning recommendations');
    }

    return recommendations;
  }

  /**
   * Pre-generate questions for all skills that need verification
   */
  static async preGenerateAllQuestions(
    employeeId: string,
    skills: SkillToVerify[],
    positionContext: {
      id?: string;
      title: string;
      level?: string;
      department?: string;
    },
    employeeContext: any
  ): Promise<{
    success: boolean;
    results: any[];
    errors: any[];
  }> {
    try {
      console.log('[VerificationService] Pre-generating questions for all skills');
      
      const { data, error } = await supabase.functions.invoke('pregenerate-skill-questions', {
        body: {
          employee_id: employeeId,
          skills: skills.map(skill => ({
            skill_name: skill.skill_name,
            skill_id: skill.skill_id,
            required_level: skill.required_level,
            source: skill.source
          })),
          position_context: positionContext,
          employee_context: employeeContext
        }
      });

      if (error) {
        console.error('Error pre-generating questions:', error);
        return {
          success: false,
          results: [],
          errors: [{ message: error.message }]
        };
      }

      return data;
    } catch (error) {
      console.error('Error in preGenerateAllQuestions:', error);
      return {
        success: false,
        results: [],
        errors: [{ message: error.message }]
      };
    }
  }

  /**
   * Get stored questions for a specific skill
   */
  static async getStoredQuestions(
    employeeId: string,
    skillName: string
  ): Promise<StoredQuestions | null> {
    try {
      console.log('[VerificationService] Checking for stored questions:', { employeeId, skillName });
      
      const { data, error } = await supabase
        .from('skill_assessment_questions')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('skill_name', skillName)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('[VerificationService] Query result:', { 
        dataLength: data?.length, 
        error: error,
        firstItem: data?.[0]?.id 
      });

      if (error) {
        console.error('[VerificationService] Error fetching stored questions:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('[VerificationService] No stored questions found');
        return null;
      }

      console.log('[VerificationService] Found stored questions:', data[0].id);
      return data[0];
    } catch (error) {
      console.error('[VerificationService] Unexpected error getting stored questions:', error);
      return null;
    }
  }

  /**
   * Mark questions as used when assessment starts
   */
  static async markQuestionsAsUsed(questionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('skill_assessment_questions')
        .update({
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (error) {
        console.error('Error marking questions as used:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markQuestionsAsUsed:', error);
      return false;
    }
  }
}