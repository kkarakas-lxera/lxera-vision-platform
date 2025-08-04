import React, { useState, useEffect } from 'react';
import { Brain, Check, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { VerificationService, QuestionResponse, SkillToVerify } from '@/services/verificationService';

interface Question {
  id: string;
  type: 'multiple_choice' | 'scenario' | 'code_review';
  question: string;
  options?: string[];
  correct_answer: string | number;
  explanation: string;
  difficulty: 1 | 2 | 3;
  time_limit: number;
  scoring_weight: number;
  skill_area?: string;
}

interface InlineSkillAssessmentProps {
  skill: SkillToVerify;
  employeeId: string;
  positionContext: {
    id?: string;
    title: string;
    level?: string;
    department?: string;
  };
  employeeContext: {
    years_experience?: number;
    current_projects?: string[];
    daily_challenges?: string[];
    education_level?: string;
    work_experience?: any[];
  };
  onComplete: (skillName: string, verified: boolean) => void;
  isVerified: boolean;
}

export default function InlineSkillAssessment({
  skill,
  employeeId,
  positionContext,
  employeeContext,
  onComplete,
  isVerified
}: InlineSkillAssessmentProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    level: number;
    passed: boolean;
  } | null>(null);
  const [storedQuestionId, setStoredQuestionId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [hasInvalidQuestions, setHasInvalidQuestions] = useState(false);

  useEffect(() => {
    if (questions.length === 0 && !isVerified && !showResults) {
      loadQuestions();
    }
  }, [skill.skill_name, employeeId]); // Add employeeId to ensure we reload if employee changes

  // Check for invalid questions whenever questions change
  useEffect(() => {
    if (questions.length > 0) {
      const hasProblems = questions.some(q => 
        !q.question || 
        !q.options || 
        !Array.isArray(q.options) || 
        q.options.length < 2 ||
        q.options.some(opt => !opt || opt.trim() === '')
      );
      setHasInvalidQuestions(hasProblems);
    }
  }, [questions]);

  const loadQuestions = async (forceRegenerate: boolean = false) => {
    try {
      setLoading(true);
      setLoadError(false);
      
      // First, check for stored questions (unless forcing regeneration)
      if (!forceRegenerate) {
        console.log('[InlineSkillAssessment] Checking for stored questions:', {
          skill: skill.skill_name,
          employeeId: employeeId
        });
        const storedQuestions = await VerificationService.getStoredQuestions(employeeId, skill.skill_name);
        
        if (storedQuestions && storedQuestions.questions) {
          // Filter out incomplete questions from stored questions too
          const completeStoredQuestions = storedQuestions.questions.filter((q: Question) => 
            q.options && Array.isArray(q.options) && q.options.length > 0
          );
          
          console.log('[InlineSkillAssessment] Found stored questions:', {
            questionId: storedQuestions.id,
            totalCount: storedQuestions.questions.length,
            validCount: completeStoredQuestions.length
          });
          
          // If stored questions are incomplete, regenerate
          if (completeStoredQuestions.length === 0) {
            console.log('[InlineSkillAssessment] Stored questions are incomplete, regenerating');
            // Continue to generation below
          } else {
            setQuestions(completeStoredQuestions);
            setStoredQuestionId(storedQuestions.id);
            
            // Don't mark as used - questions should be reusable
            
            // Initialize start times for all questions
            const startTimes: Record<string, number> = {};
            completeStoredQuestions.forEach((q: Question) => {
              startTimes[q.id] = Date.now();
            });
            setQuestionStartTimes(startTimes);
            
            // Warn if some questions were filtered out
            if (completeStoredQuestions.length < storedQuestions.questions.length) {
              console.warn(`[InlineSkillAssessment] Filtered out ${storedQuestions.questions.length - completeStoredQuestions.length} incomplete questions`);
            }
            
            return;
          }
        }
      }
      
      // If no stored questions or forcing regeneration, generate them
      console.log('[InlineSkillAssessment] Generating new questions', { forceRegenerate });
      
      // If forcing regeneration, delete existing questions first
      if (forceRegenerate) {
        const { error: deleteError } = await supabase
          .from('skill_assessment_questions')
          .delete()
          .eq('employee_id', employeeId)
          .eq('skill_name', skill.skill_name);
        
        if (deleteError) {
          console.error('Error deleting old questions:', deleteError);
        }
      }
      
      const requiredLevel = skill.required_level 
        ? (skill.required_level === 1 ? 'basic' : skill.required_level === 2 ? 'intermediate' : 'advanced')
        : 'intermediate';

      const { data, error } = await supabase.functions.invoke('assess-skill-proficiency', {
        body: {
          skill_name: skill.skill_name,
          required_level: requiredLevel,
          position_context: positionContext,
          employee_context: {
            ...employeeContext,
            total_years_in_field: employeeContext.years_experience || 0,
            team_size: 'Unknown',
            role_in_team: 'Unknown',
            recent_technologies: [],
            certifications: [],
            previous_positions: employeeContext.work_experience?.map((exp: any) => exp.position) || [],
            related_skills: []
          },
          employee_id: employeeId,
          position_id: positionContext.id,
          skill_id: skill.skill_id,
          check_existing: false // Force new generation when regenerating
        }
      });

      if (error) throw error;
      if (data?.questions) {
        // Filter out incomplete questions (those without options)
        const completeQuestions = data.questions.filter((q: Question) => 
          q.options && Array.isArray(q.options) && q.options.length > 0
        );
        
        console.log(`[InlineSkillAssessment] Received ${data.questions.length} questions, ${completeQuestions.length} are complete`);
        
        // If we don't have enough complete questions, throw an error to trigger regeneration
        if (completeQuestions.length === 0) {
          throw new Error('No valid questions generated. Please try again.');
        }
        
        setQuestions(completeQuestions);
        // Initialize start times for all questions
        const startTimes: Record<string, number> = {};
        completeQuestions.forEach((q: Question) => {
          startTimes[q.id] = Date.now();
        });
        setQuestionStartTimes(startTimes);
        
        // Reset answers when regenerating
        if (forceRegenerate) {
          setSelectedAnswers({});
          toast.success('New questions generated successfully');
        }
        
        // Warn if we got fewer questions than expected
        if (completeQuestions.length < data.questions.length) {
          toast.warning(`Generated ${completeQuestions.length} valid questions out of ${data.questions.length} attempted`);
        }
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load assessment questions');
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (selectedAnswers && Object.keys(selectedAnswers).length > 0) {
      if (!confirm('Regenerating questions will reset your current answers. Continue?')) {
        return;
      }
    }
    await loadQuestions(true);
  };

  const handleSubmitAssessment = async () => {
    // Calculate responses
    const assessmentResponses: QuestionResponse[] = questions.map((question) => {
      const selectedAnswer = selectedAnswers[question.id] || '';
      const timeTaken = Math.floor((Date.now() - questionStartTimes[question.id]) / 1000);
      const correct = selectedAnswer === question.correct_answer.toString();
      
      return {
        question_id: question.id,
        selected_answer: selectedAnswer,
        time_taken: timeTaken,
        correct
      };
    });

    // Calculate proficiency
    const { level, score, confidence } = VerificationService.calculateProficiency(assessmentResponses, questions);
    
    setResults({
      score,
      level,
      passed: level >= 1
    });
    setShowResults(true);

    // Save assessment result
    try {
      await VerificationService.saveAssessmentResult(
        employeeId,
        skill.skill_name,
        {
          skill_name: skill.skill_name,
          questions,
          responses: assessmentResponses,
          calculated_level: level,
          time_taken: assessmentResponses.reduce((sum, r) => sum + r.time_taken, 0),
          score,
          verification_score: confidence
        },
        positionContext.id
      );

      onComplete(skill.skill_name, true);
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment results');
    }
  };

  const allQuestionsAnswered = questions.length > 0 && 
    questions.every(q => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== '');

  const getSkillBadgeColor = () => {
    if (isVerified) return 'bg-green-100 text-green-700';
    if (skill.source === 'position_required') return 'bg-red-100 text-red-700';
    if (skill.source === 'position_nice') return 'bg-orange-100 text-orange-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className={cn(
      "rounded-lg border transition-all duration-200",
      isVerified ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
    )}>
      {/* Skill Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isVerified ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <Brain className="h-5 w-5 text-gray-400" />
          )}
          <span className="text-base font-medium">{skill.skill_name}</span>
          <span className={cn("text-xs px-2 py-1 rounded-full", getSkillBadgeColor())}>
            {skill.source === 'position_required' ? 'Required' :
             skill.source === 'position_nice' ? 'Nice to Have' :
             skill.source === 'cv' ? 'From CV' : 'Manual'}
          </span>
        </div>
        {skill.required_level && (
          <span className="text-xs text-muted-foreground">
            Level {skill.required_level} required
          </span>
        )}
      </div>

      {/* Assessment Content */}
      {!isVerified && (
        <div className="px-4 pb-4 border-t border-gray-100">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-gray-700">Preparing your assessment</p>
                    <p className="text-xs text-gray-500">Generating personalized questions for {skill.skill_name}...</p>
                  </div>
                </div>
              ) : showResults ? (
                // Results View
                <div className="mt-4 space-y-3">
                  <div className="text-center py-4">
                    <div className="mb-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {results?.score}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Proficiency Level: {results?.level === 3 ? 'Expert' : 
                                           results?.level === 2 ? 'Proficient' : 
                                           results?.level === 1 ? 'Learning' : 'Beginner'}
                      </div>
                    </div>
                    {results?.passed && (
                      <div className="inline-flex items-center gap-2 text-green-600 text-sm">
                        <Check className="h-4 w-4" />
                        Skill Verified
                      </div>
                    )}
                  </div>
                </div>
              ) : loadError ? (
                // Error View
                <div className="mt-4 space-y-3">
                  <div className="text-center py-4">
                    <div className="mb-2 text-red-600">
                      <div className="text-sm font-medium">
                        Failed to load assessment
                      </div>
                      <div className="text-xs text-gray-600">
                        There was an error loading the questions for {skill.skill_name}
                      </div>
                    </div>
                    <Button
                      onClick={() => loadQuestions(true)}
                      variant="outline"
                      size="sm"
                      className="mt-3"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : questions.length > 0 ? (
                // Questions View
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">
                      Answer all {questions.length} questions to verify this skill
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">
                        {Object.keys(selectedAnswers).length} / {questions.length} answered
                      </span>
                      {hasInvalidQuestions && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRegenerate}
                          className="h-7 px-2 text-xs text-orange-600 hover:text-orange-700"
                          title="Some questions are incomplete. Click to regenerate."
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Fix Questions
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <Progress 
                    value={(Object.keys(selectedAnswers).length / questions.length) * 100} 
                    className="h-1"
                  />
                  
                  {hasInvalidQuestions && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-800">
                      <strong>Note:</strong> Some questions appear to be incomplete. You can use the "Fix Questions" button above to regenerate them.
                    </div>
                  )}

                  {questions.map((question, index) => (
                    <div key={question.id} className="space-y-3 pb-4 border-b last:border-0">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium text-gray-500 mt-0.5">
                          Q{index + 1}.
                        </span>
                        <p className="text-sm text-gray-700 flex-1">{question.question}</p>
                      </div>
                      
                      <RadioGroup
                        value={selectedAnswers[question.id] || ''}
                        onValueChange={(value) => {
                          setSelectedAnswers(prev => ({
                            ...prev,
                            [question.id]: value
                          }));
                        }}
                        className="space-y-2 ml-6"
                      >
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-start space-x-2">
                            <RadioGroupItem
                              value={optionIndex.toString()}
                              id={`${question.id}-${optionIndex}`}
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor={`${question.id}-${optionIndex}`}
                              className="text-sm text-gray-600 font-normal cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}

                  <div className="pt-4">
                    <Button
                      onClick={handleSubmitAssessment}
                      disabled={!allQuestionsAnswered}
                      className="w-full"
                      size="sm"
                    >
                      Submit Assessment
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
      )}
    </div>
  );
}