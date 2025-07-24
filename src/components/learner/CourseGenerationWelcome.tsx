import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award,
  BookOpen,
  Clock,
  GraduationCap,
  Target,
  CheckCircle,
  Star,
  Sparkles,
  TrendingUp,
  Users,
  ChevronRight,
  Loader2,
  MessageSquare,
  Brain,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CourseOutlineReward from './CourseOutlineReward';
import { cn } from '@/lib/utils';

interface CourseGenerationWelcomeProps {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}

export default function CourseGenerationWelcome({ 
  employeeId, 
  employeeName,
  onClose 
}: CourseGenerationWelcomeProps) {
  const [stage, setStage] = useState<'welcome' | 'generating' | 'completed' | 'error'>('welcome');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [courseOutline, setCourseOutline] = useState(null);
  const [rawCourseOutline, setRawCourseOutline] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Start progress animation when generating
    if (stage === 'generating') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [stage]);

  const startGeneration = async () => {
    setStage('generating');
    setCurrentStep('Analyzing your profile data...');
    
    // Update steps during generation
    setTimeout(() => setCurrentStep('Identifying skill gaps...'), 2000);
    setTimeout(() => setCurrentStep('Matching challenges to learning modules...'), 4000);
    setTimeout(() => setCurrentStep('Personalizing content for your role...'), 6000);
    setTimeout(() => setCurrentStep('Finalizing your course outline...'), 8000);

    try {
      const { data, error } = await supabase.functions.invoke('generate-course-outline', {
        body: { employee_id: employeeId }
      });

      if (error) throw error;

      console.log('Edge function response:', data);

      if (data?.success && data.course_outline) {
        try {
          // Map the API response to match CourseOutlineData interface
          const mappedOutline = {
            title: data.course_outline.course_title,
            description: data.course_outline.description,
            totalDuration: `${data.course_outline.total_duration_hours} hours`,
            estimatedWeeks: data.course_outline.total_duration_weeks || 4,
            difficultyLevel: 'Intermediate' as const,
            certificateAvailable: true,
            learningObjectives: data.course_outline.learning_outcomes || [],
            skillsToGain: data.course_outline.modules?.flatMap(m => m.key_topics || []) || [],
            modules: data.course_outline.modules?.map((m, idx) => ({
              id: `M${String(idx + 1).padStart(2, '0')}`,
              name: m.module_name,
              description: m.learning_objectives?.join(' ') || '',
              duration: `${m.duration_hours} hours`,
              topics: m.key_topics || [],
              difficulty: m.difficulty_level || 'Intermediate'
            })) || []
          };
          
          setCourseOutline(mappedOutline);
          setRawCourseOutline(data.course_outline); // Save raw data for database
          setProgress(100);
          setStage('completed');
        } catch (mappingError) {
          console.error('Error mapping course outline:', mappingError);
          console.error('Raw course outline data:', data.course_outline);
          throw new Error(`Failed to process course outline: ${mappingError.message}`);
        }
      } else {
        console.error('Invalid response structure:', data);
        throw new Error('Invalid response from course generation service');
      }
    } catch (err) {
      console.error('Course generation error:', err);
      setError(err.message || 'Failed to generate course outline');
      setStage('error');
    }
  };

  const handleIntention = async (intention: 'accepted' | 'maybe_later' | 'rejected') => {
    try {
      await supabase
        .from('employee_course_intentions')
        .upsert({
          employee_id: employeeId,
          course_outline: rawCourseOutline || courseOutline, // Use raw data for database
          intention: intention,
          intended_start_date: intention === 'accepted' ? new Date().toISOString() : null,
          created_at: new Date().toISOString()
        });

      if (intention === 'accepted') {
        toast.success('Great! Your course is ready to start.');
        setTimeout(() => {
          window.location.href = '/learner/courses';
        }, 1500);
      } else if (intention === 'maybe_later') {
        toast.info('No problem! Your course will be saved for later.');
        setTimeout(onClose, 1500);
      } else {
        toast.info('We\'ll help you find a better match.');
        setTimeout(onClose, 1500);
      }
    } catch (error) {
      console.error('Failed to save intention:', error);
      toast.error('Failed to save your preference');
    }
  };

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-purple-200 shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center">
                    <Award className="h-12 w-12 text-white" />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="h-8 w-8 text-yellow-500" />
                  </motion.div>
                </div>
              </div>
              
              <CardTitle className="text-3xl mb-4">
                🎉 Congratulations, {employeeName.split(' ')[0]}!
              </CardTitle>
              <CardDescription className="text-lg">
                You've completed your professional profile
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Your Personalized Course Awaits!</h3>
                <p className="text-gray-700 mb-4">
                  Based on your profile, I'll create a custom learning pathway that addresses:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Your professional challenges</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Your growth priorities</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Skills gaps for your role</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Your career advancement goals</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">AI-Powered</div>
                  <div className="text-sm text-gray-600">Personalization</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <Zap className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <div className="font-semibold">4 Weeks</div>
                  <div className="text-sm text-gray-600">To Complete</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold">Practical</div>
                  <div className="text-sm text-gray-600">Application</div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={startGeneration}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8"
                >
                  Generate My Personalized Course
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (stage === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="border-blue-200 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Creating Your Personalized Course
                  </h2>
                  <p className="text-gray-600">
                    {currentStep}
                  </p>
                </div>
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-500">{progress}% complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === 'completed' && courseOutline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <CourseOutlineReward
          courseOutline={courseOutline}
          employeeName={employeeName}
          loading={false}
          error={null}
          onStartCourse={() => handleIntention('accepted')}
          onViewFullCourse={() => handleIntention('maybe_later')}
        />
        
        <div className="max-w-4xl mx-auto px-6 pb-8">
          <Card className="border-green-200 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Would you like to take this course?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => handleIntention('accepted')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Yes, start now!
                </Button>
                <Button
                  onClick={() => handleIntention('maybe_later')}
                  variant="outline"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Save for later
                </Button>
                <Button
                  onClick={() => handleIntention('rejected')}
                  variant="ghost"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Request different course
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="border-red-200 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <Target className="h-10 w-10 text-red-600" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Course Generation Failed
                  </h2>
                  <p className="text-gray-600">
                    {error || "We couldn't generate your course outline at this time."}
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={startGeneration}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={onClose}
                    variant="outline"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}