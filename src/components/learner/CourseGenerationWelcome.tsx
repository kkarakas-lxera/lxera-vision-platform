import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award,
  Clock,
  Target,
  CheckCircle,
  Check,
  ChevronRight,
  Loader2,
  MessageSquare,
  Brain,
  X
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

      console.log('Edge function response:', JSON.stringify(data, null, 2));

      if (data?.success && data.course_outline) {
        try {
          // Map the API response to match CourseOutlineData interface
          const courseData = data.course_outline;
          
          // Handle both array and object module structures
          const modules = Array.isArray(courseData.modules) ? courseData.modules : [];
          
          const mappedOutline = {
            title: courseData.course_title || courseData.title || 'Your Personalized Course',
            description: courseData.description || 'A personalized learning pathway designed for you',
            totalDuration: courseData.total_duration_hours ? `${courseData.total_duration_hours} hours` : '20 hours',
            estimatedWeeks: courseData.total_duration_weeks || courseData.estimatedWeeks || 4,
            difficultyLevel: courseData.difficultyLevel || 'Intermediate' as const,
            certificateAvailable: courseData.certificateAvailable !== false,
            learningObjectives: courseData.learning_outcomes || courseData.learningObjectives || [],
            skillsToGain: modules.flatMap(m => m.key_topics || []).filter(Boolean),
            modules: modules.map((m, idx) => ({
              id: m.module_id ? `M${String(m.module_id).padStart(2, '0')}` : `M${String(idx + 1).padStart(2, '0')}`,
              name: m.module_name || m.name || `Module ${idx + 1}`,
              description: Array.isArray(m.learning_objectives) 
                ? m.learning_objectives.join(' ') 
                : (m.description || ''),
              duration: m.duration_hours ? `${m.duration_hours} hours` : '3 hours',
              topics: m.key_topics || m.topics || [],
              difficulty: m.difficulty_level || m.difficulty || 'intermediate'
            }))
          };
          
          // Validate we have at least some content
          if (!mappedOutline.modules || mappedOutline.modules.length === 0) {
            console.error('No modules found in course outline');
            console.error('Course data modules:', courseData.modules);
            throw new Error('Course outline is missing required modules');
          }
          
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Congratulations, {employeeName.split(' ')[0]}!
                  </CardTitle>
                  <CardDescription>
                    You've completed your professional profile
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-900">
                  I'll now create a personalized learning pathway based on:
                </div>
                
                <div className="space-y-2">
                  {[
                    'Your professional challenges',
                    'Your growth priorities', 
                    'Skills gaps for your role',
                    'Your career advancement goals'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Brain className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-900">AI-Powered</div>
                  <div className="text-xs text-gray-600">Personalization</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Clock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-900">4 Weeks</div>
                  <div className="text-xs text-gray-600">Duration</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Target className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                  <div className="text-sm font-medium text-gray-900">Practical</div>
                  <div className="text-xs text-gray-600">Application</div>
                </div>
              </div>

              <Button
                onClick={startGeneration}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Generate My Personalized Course
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="text-xs text-center text-gray-500">
                This usually takes 30-60 seconds
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (stage === 'generating') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Creating Your Personalized Course
                    </h2>
                    <p className="text-sm text-gray-600">
                      This usually takes 30-60 seconds...
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-900">{currentStep}</span>
                      <span className="text-sm text-blue-700">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Course Generated Successfully!</CardTitle>
                  <CardDescription className="text-sm">
                    Your personalized learning pathway is ready
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900">{courseOutline.title}</h3>
                <p className="text-sm text-gray-600">{courseOutline.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium">{courseOutline.totalDuration}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500">Modules:</span>
                    <span className="ml-2 font-medium">{courseOutline.modules.length}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">Would you like to take this course?</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleIntention('accepted')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Yes, start now
                  </Button>
                  <Button
                    onClick={() => handleIntention('maybe_later')}
                    variant="outline"
                    className="border-gray-300"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Save for later
                  </Button>
                  <Button
                    onClick={() => handleIntention('rejected')}
                    variant="ghost"
                    className="text-gray-600"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Different course
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Course Generation Failed
                    </h2>
                    <p className="text-sm text-gray-600">
                      {error || "We couldn't generate your course outline at this time."}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={startGeneration}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={onClose}
                    variant="outline"
                    className="border-gray-300"
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