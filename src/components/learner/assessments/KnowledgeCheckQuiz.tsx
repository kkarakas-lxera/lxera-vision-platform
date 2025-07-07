import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Brain, 
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface QuizQuestion {
  id: number;
  question: string;
  options: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

interface KnowledgeCheckQuizProps {
  moduleId: string;
  employeeId: string;
  onComplete: () => void;
  currentProgress?: any;
  onBack?: () => void;
}

// Sample quiz data - in production this would come from database
const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the primary purpose of a business performance report?",
    options: [
      { id: 'A', text: "To inform stakeholders about the company's financial status" },
      { id: 'B', text: "To provide data on employee productivity" },
      { id: 'C', text: "To document company policies and procedures" },
      { id: 'D', text: "To advertise products to potential customers" }
    ],
    correctAnswer: 'A',
    explanation: "The primary purpose of a business performance report is to inform stakeholders about the company's financial status. This includes details on revenue, expenses, profits, and other key financial metrics that are crucial for decision-making."
  },
  {
    id: 2,
    question: "Which metric would be most important for analyzing the profitability of a new product?",
    options: [
      { id: 'A', text: "Employee attendance rates" },
      { id: 'B', text: "Market share" },
      { id: 'C', text: "Gross margin" },
      { id: 'D', text: "Number of customer complaints" }
    ],
    correctAnswer: 'C',
    explanation: "Gross margin is a critical metric for analyzing profitability as it directly reflects the difference between sales and the cost of goods sold, showing how much the company earns taking into consideration the costs directly associated with the production of the products."
  },
  {
    id: 3,
    question: "What does a trend analysis in business performance reporting help identify?",
    options: [
      { id: 'A', text: "The location of the company's assets" },
      { id: 'B', text: "Fluctuations in performance over a specific period" },
      { id: 'C', text: "The educational background of the company's employees" },
      { id: 'D', text: "Current stock prices" }
    ],
    correctAnswer: 'B',
    explanation: "Trend analysis is used to identify fluctuations in business performance over a specific period. This helps in understanding patterns and predicting future performance based on historical data."
  },
  {
    id: 4,
    question: "In the context of business analytics, what does the term 'data granularity' refer to?",
    options: [
      { id: 'A', text: "The size of the data storage" },
      { id: 'B', text: "The consistency of the data" },
      { id: 'C', text: "The level of detail in the data" },
      { id: 'D', text: "The speed of data processing" }
    ],
    correctAnswer: 'C',
    explanation: "Data granularity refers to the level of detail contained in a set of data. Higher granularity means more detailed data, which is crucial for deeper analysis and more precise business performance reporting."
  },
  {
    id: 5,
    question: "Which tool is typically used to create dynamic business performance reports that allow for interactive data exploration?",
    options: [
      { id: 'A', text: "Word processor" },
      { id: 'B', text: "Spreadsheet software" },
      { id: 'C', text: "Presentation software" },
      { id: 'D', text: "Business intelligence software" }
    ],
    correctAnswer: 'D',
    explanation: "Business intelligence software is typically used for creating dynamic business performance reports. These tools allow for interactive data exploration, enabling users to drill down into metrics and analyze data at multiple levels."
  }
];

export default function KnowledgeCheckQuiz({ moduleId, employeeId, onComplete, currentProgress, onBack }: KnowledgeCheckQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [confidenceLevels, setConfidenceLevels] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [timeStarted, setTimeStarted] = useState<Date>(new Date());
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing progress if available
    if (currentProgress?.completed) {
      setShowResults(true);
      setIsSubmitted(true);
      setScore(currentProgress.score || 0);
    }
  }, [currentProgress]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleConfidenceChange = (questionId: number, confidence: number) => {
    setConfidenceLevels(prev => ({ ...prev, [questionId]: confidence }));
  };

  const handleNoteChange = (questionId: number, note: string) => {
    setNotes(prev => ({ ...prev, [questionId]: note }));
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach(question => {
      if (answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quizQuestions.length) * 100);
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      const finalScore = calculateScore();
      setScore(finalScore);

      // Save to course_section_progress
      const { error } = await supabase
        .from('course_section_progress')
        .upsert({
          assignment_id: moduleId,
          section_name: 'assessments',
          assessment_type: 'knowledge_quiz',
          assessment_data: {
            answers,
            confidenceLevels,
            notes,
            questions: quizQuestions,
            timeSpent: Math.floor((new Date().getTime() - timeStarted.getTime()) / 1000)
          },
          score: finalScore,
          max_score: 100,
          completed: true,
          completed_at: new Date().toISOString(),
          submitted_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error submitting quiz:', error);
        toast.error('Failed to submit quiz');
        return;
      }

      setIsSubmitted(true);
      setShowResults(true);
      toast.success(`Quiz completed! Score: ${finalScore}%`);
      onComplete();
    } catch (error) {
      console.error('Error in submitQuiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setConfidenceLevels({});
    setNotes({});
    setIsSubmitted(false);
    setShowResults(false);
    setTimeStarted(new Date());
    setScore(0);
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const allQuestionsAnswered = () => {
    return quizQuestions.every(q => answers[q.id]);
  };

  if (showResults) {
    return (
      <div className="space-y-4">
        {/* Compact Results Header */}
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">Quiz Complete</h3>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{score}%</div>
          </div>
          <Progress value={score} className="h-2" />
          <div className="text-sm text-green-600 dark:text-green-400 mt-2">
            {Math.round(score/20)} of 5 questions correct
          </div>
        </div>

        {/* Progressive Disclosure of Results */}
        <div className="space-y-2">
          {quizQuestions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            const [expanded, setExpanded] = useState(false);
            
            return (
              <div key={question.id} className="border rounded-lg">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Question {index + 1}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                
                {expanded && (
                  <div className="px-3 pb-3 space-y-3 border-t">
                    <p className="text-sm text-muted-foreground">{question.question}</p>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Your answer:</span> {userAnswer}) {question.options.find(o => o.id === userAnswer)?.text}</p>
                      {!isCorrect && (
                        <p className="text-green-600"><span className="font-medium">Correct:</span> {question.correctAnswer}) {question.options.find(o => o.id === question.correctAnswer)?.text}</p>
                      )}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/50 p-2 rounded text-sm">
                      <p className="text-blue-700 dark:text-blue-300">{question.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={resetQuiz} variant="outline" size="sm">
            Retake
          </Button>
          <Button onClick={onBack} variant="outline" size="sm">
            Back
          </Button>
          <Button onClick={onComplete} size="sm" className="flex-1">
            Continue
          </Button>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Knowledge Quiz</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{currentQuestion + 1}/{quizQuestions.length}</span>
        </div>
      </div>
      
      <Progress value={(currentQuestion + 1) / quizQuestions.length * 100} className="h-2" />

      {/* Question */}
      <div className="space-y-3">
        <p className="text-sm font-medium">{question.question}</p>
        
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors text-sm ${
                answers[question.id] === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={answers[question.id] === option.id}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="mt-0.5"
              />
              <span className="font-medium text-xs">{option.id})</span>
              <span className="flex-1">{option.text}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Progressive Disclosure for Advanced Features */}
      {answers[question.id] && (
        <div className="space-y-3 pt-2 border-t">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Confidence: {confidenceLevels[question.id] || 50}%
            </label>
            <Slider
              value={[confidenceLevels[question.id] || 50]}
              onValueChange={(value) => handleConfidenceChange(question.id, value[0])}
              max={100}
              step={10}
              className="w-full"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Notes (optional)</label>
            <Textarea
              placeholder="Quick thoughts..."
              value={notes[question.id] || ''}
              onChange={(e) => handleNoteChange(question.id, e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>
        </div>
      )}

      {/* Compact Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={previousQuestion}
          disabled={currentQuestion === 0}
        >
          ← Prev
        </Button>

        <div className="flex gap-1">
          {quizQuestions.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentQuestion
                  ? 'bg-blue-500'
                  : answers[quizQuestions[index].id]
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentQuestion === quizQuestions.length - 1 ? (
          <Button
            size="sm"
            onClick={submitQuiz}
            disabled={!allQuestionsAnswered() || loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={nextQuestion}
            disabled={!answers[question.id]}
          >
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}