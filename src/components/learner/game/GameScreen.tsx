import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Timer, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  skill_focus: string;
  source_content_snippet: string;
}

interface GameScreenProps {
  missionId: string;
  onComplete: (results: GameResults) => void;
  onExit: () => void;
}

interface GameResults {
  questionsAnswered: number;
  correctAnswers: number;
  pointsEarned: number;
  timeSpent: number;
  accuracy: number;
  skillImprovements: { [skill: string]: number };
}

export default function GameScreen({ missionId, onComplete, onExit }: GameScreenProps) {
  const { userProfile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mission, setMission] = useState<any>(null);

  useEffect(() => {
    if (missionId) {
      loadMissionData();
    }
  }, [missionId]);

  useEffect(() => {
    if (timeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
  }, [timeLeft, showFeedback]);

  const loadMissionData = async () => {
    try {
      setLoading(true);

      // Load mission details
      const { data: missionData, error: missionError } = await supabase
        .from('game_missions')
        .select('*')
        .eq('id', missionId)
        .single();

      if (missionError) throw missionError;
      setMission(missionData);

      // Load questions for this mission
      const { data: questionsData, error: questionsError } = await supabase
        .from('game_questions')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at');

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);
      setAnswers(new Array(questionsData?.length || 0).fill(null));

      // Set timer based on mission
      if (missionData?.estimated_minutes) {
        setTimeLeft(missionData.estimated_minutes * 60);
      }
    } catch (error) {
      console.error('Error loading mission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || showFeedback) return;

    const currentQuestion = questions[currentQuestionIndex];
    const correct = selectedAnswer === currentQuestion.correct_answer;
    
    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    setIsCorrect(correct);
    setShowFeedback(true);

    // Auto-advance after 3 seconds
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        completeGame();
      }
    }, 3000);
  };

  const handleTimeUp = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question if time runs out
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      completeGame();
    }
  };

  const completeGame = async () => {
    const timeSpent = Math.floor((Date.now() - gameStartTime) / 1000);
    const correctAnswers = answers.reduce((count, answer, index) => {
      if (answer !== null && answer === questions[index]?.correct_answer) {
        return count + 1;
      }
      return count;
    }, 0);

    const questionsAnswered = answers.filter(answer => answer !== null).length;
    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
    const pointsEarned = Math.floor((correctAnswers / questions.length) * (mission?.points_value || 20));

    // Calculate skill improvements
    const skillImprovements: { [skill: string]: number } = {};
    questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        skillImprovements[question.skill_focus] = (skillImprovements[question.skill_focus] || 0) + 1;
      }
    });

    try {
      // Get employee ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userProfile?.id)
        .single();

      if (employee) {
        // Create game session record
        await supabase
          .from('game_sessions')
          .insert({
            employee_id: employee.id,
            mission_id: missionId,
            content_section_id: mission?.content_section_id,
            questions_answered: questionsAnswered,
            correct_answers: correctAnswers,
            points_earned: pointsEarned,
            time_spent_seconds: timeSpent,
            accuracy_percentage: accuracy,
            skill_improvements: skillImprovements,
            session_status: 'completed',
            completed_at: new Date().toISOString()
          });

        // Update employee game progress
        const { data: currentProgress } = await supabase
          .from('employee_game_progress')
          .select('*')
          .eq('employee_id', employee.id)
          .single();

        const updatedProgress = {
          employee_id: employee.id,
          total_points: (currentProgress?.total_points || 0) + pointsEarned,
          total_missions_completed: (currentProgress?.total_missions_completed || 0) + 1,
          total_questions_answered: (currentProgress?.total_questions_answered || 0) + questionsAnswered,
          total_correct_answers: (currentProgress?.total_correct_answers || 0) + correctAnswers,
          current_streak: accuracy >= 75 ? (currentProgress?.current_streak || 0) + 1 : 0,
          longest_streak: Math.max(
            currentProgress?.longest_streak || 0,
            accuracy >= 75 ? (currentProgress?.current_streak || 0) + 1 : 0
          ),
          current_level: Math.floor(((currentProgress?.total_points || 0) + pointsEarned) / 100) + 1,
          last_played_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        };

        await supabase
          .from('employee_game_progress')
          .upsert(updatedProgress, { onConflict: 'employee_id' });
      }
    } catch (error) {
      console.error('Error saving game results:', error);
    }

    // Return results to parent
    onComplete({
      questionsAnswered,
      correctAnswers,
      pointsEarned,
      timeSpent,
      accuracy,
      skillImprovements
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = (timeLeft / (mission?.estimated_minutes * 60 || 180)) * 100;
    // Progressive blue color based on time remaining (light blue → dark blue)
    if (percentage > 75) return 'bg-blue-200'; // Light blue
    if (percentage > 50) return 'bg-blue-400'; // Medium blue
    if (percentage > 25) return 'bg-blue-600'; // Dark blue
    if (percentage > 10) return 'bg-blue-800'; // Very dark blue
    return 'bg-red-500'; // Critical time
  };

  const getTimerGradient = () => {
    const percentage = (timeLeft / (mission?.estimated_minutes * 60 || 180)) * 100;
    if (percentage > 75) return 'from-blue-100 to-blue-300';
    if (percentage > 50) return 'from-blue-300 to-blue-500';
    if (percentage > 25) return 'from-blue-500 to-blue-700';
    if (percentage > 10) return 'from-blue-700 to-blue-900';
    return 'from-red-400 to-red-600';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Timer className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your mission...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-12">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive">No questions found for this mission.</p>
          <Button onClick={onExit} className="mt-4">
            Return to Course
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header with timer and progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onExit}>
                <X className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {mission?.mission_title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(timeLeft)}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs">
              {currentQuestion.skill_focus}
            </Badge>
          </div>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  selectedAnswer === index
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    selectedAnswer === index 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : 'border-gray-300'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <Card className={`${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold mb-2 ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {isCorrect ? '🎉 Correct! Well done!' : '❌ Not quite right'}
                    </p>
                    <p className="text-sm text-gray-700 mb-3">
                      {currentQuestion.explanation}
                    </p>
                    {currentQuestion.source_content_snippet && (
                      <div className="text-xs text-gray-600 bg-white/50 p-2 rounded border-l-2 border-gray-300">
                        <strong>From the content:</strong> "{currentQuestion.source_content_snippet}"
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          {!showFeedback && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Submit Answer
            </Button>
          )}

          {/* Timer Progress */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Time Remaining</span>
              <span className="text-xs font-medium">{formatTime(timeLeft)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${getTimerGradient()}`}
                style={{ 
                  width: `${(timeLeft / (mission?.estimated_minutes * 60 || 180)) * 100}%` 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}