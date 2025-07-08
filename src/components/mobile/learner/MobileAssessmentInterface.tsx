import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  RotateCcw,
  Send,
  Star,
  Target,
  Brain,
  FileText,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'text' | 'rating';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
}

interface MobileAssessmentInterfaceProps {
  title: string;
  questions: Question[];
  timeLimit?: number; // in minutes
  onComplete: (answers: Record<string, any>, score: number) => void;
  onExit: () => void;
  className?: string;
}

export default function MobileAssessmentInterface({
  title,
  questions,
  timeLimit,
  onComplete,
  onExit,
  className
}: MobileAssessmentInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ? timeLimit * 60 : null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  const answeredCount = Object.keys(answers).length;

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const finalScore = calculateScore();
    setScore(finalScore);
    
    // Show results first
    setShowResults(true);
    setIsSubmitting(false);
    
    // Call completion callback after a brief delay
    setTimeout(() => {
      onComplete(answers, finalScore);
    }, 2000);
  };

  const renderQuestion = (question: Question) => {
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option)}
                className={cn(
                  "w-full p-4 text-left rounded-lg border-2 transition-all duration-200",
                  userAnswer === option
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    userAnswer === option
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}>
                    {userAnswer === option && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="grid grid-cols-2 gap-3">
            {['True', 'False'].map((option) => (
              <button
                key={option}
                onClick={() => handleAnswer(question.id, option.toLowerCase())}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-200",
                  userAnswer === option.toLowerCase()
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <div className="text-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 mx-auto mb-2 flex items-center justify-center",
                    userAnswer === option.toLowerCase()
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}>
                    {userAnswer === option.toLowerCase() && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleAnswer(question.id, rating)}
                    className="p-2"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        userAnswer >= rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tap to rate from 1 to 5 stars
              </p>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-3">
            <textarea
              value={userAnswer || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userAnswer?.length || 0} characters
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (showResults) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="p-6 text-center space-y-6">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Assessment Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You have successfully completed the assessment.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Score
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {score}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Questions Answered
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {answeredCount} / {questions.length}
              </span>
            </div>
            <Progress value={score} className="h-2" />
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => onComplete(answers, score)}
              className="w-full"
            >
              Continue to Next Section
            </Button>
            <Button
              variant="outline"
              onClick={onExit}
              className="w-full"
            >
              Back to Course
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            {timeRemaining !== null && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {currentQuestionIndex + 1}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {currentQuestion.question}
                </h3>
                {renderQuestion(currentQuestion)}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Navigation Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || answeredCount === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit ({answeredCount}/{questions.length})
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goToNextQuestion}
              className="flex-1"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question indicators */}
        <div className="flex justify-center gap-1 mt-3">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                index === currentQuestionIndex
                  ? "bg-blue-500"
                  : answers[questions[index].id]
                  ? "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              )}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}