import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronRight, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ProgressiveOnboardingProps {
  email: string;
  leadId: string;
  initialData?: {
    name?: string;
    company?: string;
    role?: string;
    use_case?: string;
  };
  onComplete: () => void;
}

interface FormData {
  name: string;
  company: string;
  role: string;
  useCase: string;
  heardAbout: string;
}

const STEPS = [
  { 
    id: 1, 
    title: "What should we call you?", 
    field: 'name', 
    placeholder: 'Your full name',
    subtitle: "Let's start with the basics — we'd love to know your name."
  },
  { 
    id: 2, 
    title: "Where do you work?", 
    field: 'company', 
    placeholder: 'Your company name',
    subtitle: "Tell us about the organization you're helping to transform."
  },
  { 
    id: 3, 
    title: "What's your role?", 
    field: 'role', 
    placeholder: 'Your role',
    subtitle: "Help us understand your position so we can personalize your experience."
  },
  { 
    id: 4, 
    title: "How can LXERA help you?", 
    field: 'useCase', 
    placeholder: 'Your main focus area',
    subtitle: "What's the biggest challenge you're looking to solve?"
  },
  { 
    id: 5, 
    title: "How did you discover us?", 
    field: 'heardAbout', 
    placeholder: 'Discovery source',
    subtitle: "We're curious — what brought you to LXERA today?"
  },
];

const ROLE_OPTIONS = [
  { 
    value: 'l_and_d_manager', 
    label: 'L&D Manager', 
    description: 'Leading learning and development initiatives'
  },
  { 
    value: 'hr_director', 
    label: 'HR Director', 
    description: 'Overseeing human resources strategy'
  },
  { 
    value: 'training_specialist', 
    label: 'Training Specialist', 
    description: 'Designing and delivering training programs'
  },
  { 
    value: 'people_operations', 
    label: 'People Operations', 
    description: 'Managing employee experience and operations'
  },
  { 
    value: 'other', 
    label: 'Other Role', 
    description: 'Something else entirely'
  },
];

const USE_CASE_OPTIONS = [
  { 
    value: 'skills_gap_analysis', 
    label: 'Skills Gap Analysis', 
    description: 'Identify and bridge skill gaps in your organization'
  },
  { 
    value: 'employee_training', 
    label: 'Employee Training', 
    description: 'Create and deliver effective training programs'
  },
  { 
    value: 'course_creation', 
    label: 'Course Creation', 
    description: 'Build engaging learning experiences'
  },
  { 
    value: 'performance_tracking', 
    label: 'Performance Tracking', 
    description: 'Monitor and measure learning outcomes'
  },
  { 
    value: 'other', 
    label: 'Something Else', 
    description: 'Tell us what unique challenge you\'re facing'
  },
];

const HEARD_ABOUT_OPTIONS = [
  { 
    value: 'linkedin', 
    label: 'LinkedIn', 
    description: 'Through posts, ads, or connections'
  },
  { 
    value: 'google_search', 
    label: 'Google Search', 
    description: 'Found us while searching online'
  },
  { 
    value: 'colleague', 
    label: 'Colleague or Friend', 
    description: 'Someone recommended us to you'
  },
  { 
    value: 'conference', 
    label: 'Conference or Event', 
    description: 'Met us at an industry event'
  },
  { 
    value: 'blog_article', 
    label: 'Blog or Article', 
    description: 'Read about us in content'
  },
  { 
    value: 'social_media', 
    label: 'Social Media', 
    description: 'Discovered us on social platforms'
  },
  { 
    value: 'other', 
    label: 'Other Source', 
    description: 'Somewhere else entirely'
  },
];

export default function ProgressiveOnboarding({ email, leadId, initialData, onComplete }: ProgressiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    company: initialData?.company || '',
    role: initialData?.role || '',
    useCase: initialData?.use_case || '',
    heardAbout: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`onboarding_${email}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed.formData);
      setCompletedSteps(parsed.completedSteps || []);
      setLastSaved(parsed.timestamp ? new Date(parsed.timestamp) : null);
      
      // Find the first incomplete step after formData is updated
      setTimeout(() => {
        const currentFormData = { ...formData, ...parsed.formData };
        const firstIncomplete = STEPS.find(step => {
          const field = step.field as keyof FormData;
          return !currentFormData[field];
        });
        setCurrentStep(firstIncomplete?.id || 6); // If all filled, go to completion
      }, 0);
    }
  }, [email]);

  // Auto-save to localStorage
  useEffect(() => {
    if (Object.values(formData).some(val => val)) {
      const saveData = {
        formData,
        completedSteps,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`onboarding_${email}`, JSON.stringify(saveData));
      setLastSaved(new Date());
    }
  }, [formData, completedSteps, email]);

  const saveToDatabase = async (field: string, value: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.functions.invoke('update-profile-progressive', {
        body: {
          leadId,
          field,
          value,
          allData: currentStep === STEPS.length ? formData : undefined,
        },
      });
      
      if (error) throw error;
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldComplete = async (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    const stepIndex = STEPS.findIndex(s => s.field === field);
    if (stepIndex !== -1 && !completedSteps.includes(stepIndex + 1)) {
      setCompletedSteps([...completedSteps, stepIndex + 1]);
    }

    // Save to database
    await saveToDatabase(field, value);

    // Auto-advance to next step
    setTimeout(() => {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }, 600);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Clear localStorage
      localStorage.removeItem(`onboarding_${email}`);

      toast({
        title: 'Welcome to LXERA!',
        description: 'Your profile has been completed.',
      });

      // Small delay for smooth transition
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      console.error('Error completing profile:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (completedSteps.length / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep - 1];

  return (
    <div className="w-full max-w-sm mx-auto px-4 sm:max-w-md">
      {/* Mobile Progress Indicator */}
      <div className="mb-4 text-center">
        <div className="text-xs text-gray-500 mb-2">{currentStep} of {STEPS.length}</div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <motion.div
            className="bg-slate-700 h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        {isSaving && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-600">
            <Save className="w-3 h-3 animate-pulse" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      {/* Current Step Form */}
      <Card className="overflow-hidden border-0 shadow-none bg-gradient-to-br from-white to-slate-50/50 sm:border sm:border-slate-200 sm:shadow-xl sm:bg-gradient-to-br sm:from-white sm:to-slate-50/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="p-4 sm:p-6"
          >
            <div className="mb-6 text-center sm:text-left">
              <div className="mb-2">
                <span className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium border border-blue-200">
                  ⏱️ Takes less than 30 seconds
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 text-slate-800">{currentStepData.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{currentStepData.subtitle}</p>
            </div>

            {/* Text inputs */}
            {(currentStep === 1 || currentStep === 2) && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const field = currentStepData.field as keyof FormData;
                if (formData[field]) {
                  handleFieldComplete(field, formData[field]);
                }
              }}>
                <Input
                  type="text"
                  placeholder={currentStepData.placeholder}
                  value={formData[currentStepData.field as keyof FormData]}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    [currentStepData.field]: e.target.value 
                  })}
                  className="text-base sm:text-lg py-4 px-4 border-2 border-slate-200 focus:border-slate-700 transition-all duration-300 bg-slate-50 focus:bg-white rounded-lg focus:ring-2 focus:ring-slate-200 w-full"
                  autoFocus
                  autoComplete="off"
                  autoCapitalize="words"
                />
                <Button
                  type="submit"
                  disabled={!formData[currentStepData.field as keyof FormData]}
                  className="mt-4 w-full bg-slate-700 hover:bg-slate-800 active:bg-slate-900 transition-all text-white text-base py-3 rounded-lg touch-manipulation"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            )}

            {/* Role selection */}
            {currentStep === 3 && (
              <div className="space-y-3">
                {ROLE_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleFieldComplete('role', option.value)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all active:scale-95 touch-manipulation',
                      formData.role === option.value
                        ? 'border-slate-700 bg-slate-700/10 shadow-md'
                        : 'border-slate-200 active:border-slate-400'
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-base text-slate-800">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Use case selection */}
            {currentStep === 4 && (
              <div className="space-y-3">
                {USE_CASE_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleFieldComplete('useCase', option.value)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all active:scale-95 touch-manipulation',
                      formData.useCase === option.value
                        ? 'border-slate-700 bg-slate-700/10 shadow-md'
                        : 'border-slate-200 active:border-slate-400'
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-base text-slate-800">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* How did you hear about us */}
            {currentStep === 5 && (
              <div className="space-y-3">
                {HEARD_ABOUT_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleFieldComplete('heardAbout', option.value)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all active:scale-95 touch-manipulation',
                      formData.heardAbout === option.value
                        ? 'border-slate-700 bg-slate-700/10 shadow-md'
                        : 'border-slate-200 active:border-slate-400'
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-base text-slate-800">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

    </div>
  );
}