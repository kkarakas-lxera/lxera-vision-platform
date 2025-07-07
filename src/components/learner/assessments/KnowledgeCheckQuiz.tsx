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
  RotateCcw 
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

export default function KnowledgeCheckQuiz({ moduleId, employeeId, onComplete, currentProgress }: KnowledgeCheckQuizProps) {
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-primary">{score}%</div>
            <Badge variant={score >= 80 ? 'default' : score >= 60 ? 'secondary' : 'destructive'}>
              {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'}
            </Badge>
            <Progress value={score} className="h-3" />
          </div>

          <div className="space-y-4">
            {quizQuestions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              const confidence = confidenceLevels[question.id] || 50;
              
              return (
                <Card key={question.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">Question {index + 1}</p>
                          <p className="text-sm">{question.question}</p>
                        </div>
                      </div>
                      
                      <div className="ml-8 space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Your answer:</span> {userAnswer}) {question.options.find(o => o.id === userAnswer)?.text}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600">
                            <span className="font-medium">Correct answer:</span> {question.correctAnswer}) {question.options.find(o => o.id === question.correctAnswer)?.text}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Your confidence:</span> {confidence}%
                          {Math.abs(confidence - (isCorrect ? 100 : 0)) < 30 && (
                            <Badge variant="outline" className="ml-2">Good calibration</Badge>
                          )}
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Explanation:</p>
                              <p className="text-sm text-blue-600 dark:text-blue-400">{question.explanation}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={resetQuiz} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            <Button onClick={onComplete}>
              Continue to Next Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Knowledge Check Quiz
          </CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Question {currentQuestion + 1} of {quizQuestions.length}</span>
          </div>
        </div>
        <Progress value={(currentQuestion + 1) / quizQuestions.length * 100} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          <div className="space-y-3">
            {question.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  answers[question.id] === option.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-accent'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.id}
                  checked={answers[question.id] === option.id}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="text-primary"
                />
                <span className="font-medium">{option.id})</span>
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Confidence Level */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            Confidence Level: {confidenceLevels[question.id] || 50}%
          </label>
          <Slider
            value={[confidenceLevels[question.id] || 50]}
            onValueChange={(value) => handleConfidenceChange(question.id, value[0])}
            max={100}
            step={10}
            className="w-full"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (Optional)</label>
          <Textarea
            placeholder="Add your thoughts or reasoning..."
            value={notes[question.id] || ''}
            onChange={(e) => handleNoteChange(question.id, e.target.value)}
            rows={3}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion === quizQuestions.length - 1 ? (
              <Button
                onClick={submitQuiz}
                disabled={!allQuestionsAnswered() || loading}
                className="min-w-[120px]"
              >
                {loading ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                disabled={currentQuestion === quizQuestions.length - 1}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}