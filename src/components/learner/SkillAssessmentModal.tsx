import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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

interface SkillAssessmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
}

export default function SkillAssessmentModal({
  open,
  onOpenChange,
  skill,
  employeeId,
  positionContext,
  employeeContext,
  onComplete
}: SkillAssessmentModalProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    level: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    if (open && skill) {
      loadAssessmentQuestions();
    }
  }, [open, skill]);

  const loadAssessmentQuestions = async () => {
    try {
      setLoading(true);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setResponses([]);
      setAssessmentComplete(false);
      setResults(null);

      // Determine required level
      const requiredLevel = skill.required_level 
        ? (skill.required_level === 1 ? 'basic' : skill.required_level === 2 ? 'intermediate' : 'advanced')
        : 'intermediate';

      // Call edge function to generate questions
      const { data, error } = await supabase.functions.invoke('assess-skill-proficiency', {
        body: {
          skill_name: skill.skill_name,
          required_level: requiredLevel,
          position_context: positionContext,
          employee_context: employeeContext
        }
      });

      if (error) throw error;

      if (data?.questions && Array.isArray(data.questions)) {
        setQuestions(data.questions);
        setQuestionStartTime(Date.now());
      } else {
        throw new Error('Invalid response from assessment service');
      }
    } catch (error) {
      console.error('Error loading assessment questions:', error);
      toast.error('Failed to load assessment questions');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const isCorrect = currentQuestion.correct_answer.toString() === selectedAnswer;

    const response: QuestionResponse = {
      question_id: currentQuestion.id,
      selected_answer: selectedAnswer,
      time_taken: timeTaken,
      correct: isCorrect
    };

    const newResponses = [...responses, response];
    setResponses(newResponses);
    setShowExplanation(true);

    // Auto-proceed after showing explanation
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer('');
        setShowExplanation(false);
        setQuestionStartTime(Date.now());
      } else {
        // Assessment complete
        completeAssessment(newResponses);
      }
    }, 3000);
  };

  const completeAssessment = async (allResponses: QuestionResponse[]) => {
    setAssessmentComplete(true);

    // Calculate results with enhanced algorithm
    const { level, score, confidence, details } = VerificationService.calculateProficiency(allResponses, questions);
    const passed = level >= (skill.required_level || 1);

    setResults({ score, level, passed });
    
    // Log details for transparency
    if (details) {
      console.log('Assessment scoring details:', {
        skill: skill.skill_name,
        correctness: `${details.correctnessScore}%`,
        weighted: `${details.difficultyWeightedScore}%`,
        timeConsistency: details.timeConsistencyScore,
        confidence: `${details.questionCountConfidence * 100}%`
      });
    }

    // Save assessment result
    try {
      await VerificationService.saveAssessmentResult(
        employeeId,
        skill.skill_name,
        {
          skill_name: skill.skill_name,
          questions,
          responses: allResponses,
          calculated_level: level,
          time_taken: allResponses.reduce((sum, r) => sum + r.time_taken, 0),
          score,
          verification_score: confidence
        },
        positionContext.id
      );

      // Update employee record to mark gap analysis completion
      const { error: profileError } = await supabase
        .from('employees')
        .update({
          skills_validation_completed: true,
          skills_last_analyzed: new Date().toISOString()
        })
        .eq('id', employeeId);

      if (profileError) {
        console.error('Error updating employee record:', profileError);
      }

      toast.success(`Assessment completed for ${skill.skill_name}`);
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment results');
    }

    // Auto-close after showing results
    setTimeout(() => {
      onComplete(skill.skill_name, passed);
    }, 3000);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const getProficiencyLabel = (level: number) => {
    switch (level) {
      case 0: return 'None';
      case 1: return 'Learning';
      case 2: return 'Using';
      case 3: return 'Expert';
      default: return 'Unknown';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Skill Assessment: {skill.skill_name}
          </DialogTitle>
          <DialogDescription>
            {positionContext.title && `For position: ${positionContext.title}`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : assessmentComplete && results ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-6"
          >
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
              {results.passed ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <XCircle className="h-10 w-10 text-orange-600" />
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-2">Assessment Complete!</h3>
              <p className="text-muted-foreground">
                Your proficiency level: <strong>{getProficiencyLabel(results.level)}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Score: {results.score}%
              </p>
            </div>

            {results.passed ? (
              <p className="text-green-600">
                ✓ You meet the requirements for this skill
              </p>
            ) : (
              <p className="text-orange-600">
                This skill needs improvement for your current position
              </p>
            )}
          </motion.div>
        ) : currentQuestion ? (
          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {currentQuestion.time_limit}s
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium flex-1">{currentQuestion.question}</h3>
                  {currentQuestion.skill_area && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {currentQuestion.skill_area}
                    </Badge>
                  )}
                </div>
                
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect}>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Label
                            htmlFor={`option-${index}`}
                            className={cn(
                              "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors",
                              selectedAnswer === index.toString() 
                                ? "border-primary bg-primary/5" 
                                : "border-gray-200 hover:bg-gray-50",
                              showExplanation && (
                                index.toString() === currentQuestion.correct_answer.toString()
                                  ? "border-green-500 bg-green-50"
                                  : selectedAnswer === index.toString()
                                  ? "border-red-500 bg-red-50"
                                  : ""
                              )
                            )}
                          >
                            <RadioGroupItem 
                              value={index.toString()} 
                              id={`option-${index}`}
                              disabled={showExplanation}
                            />
                            <span className="flex-1">{option}</span>
                            {showExplanation && index.toString() === currentQuestion.correct_answer.toString() && (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            )}
                          </Label>
                        </motion.div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* Explanation */}
                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Action Button */}
            {!showExplanation && (
              <Button 
                onClick={submitAnswer} 
                className="w-full"
                disabled={!selectedAnswer}
              >
                Submit Answer
              </Button>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}