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
  { id: 1, title: 'Your Name', field: 'name', placeholder: 'John Doe' },
  { id: 2, title: 'Company', field: 'company', placeholder: 'Acme Corp' },
  { id: 3, title: 'Your Role', field: 'role', placeholder: 'Select your role' },
  { id: 4, title: 'Use Case', field: 'useCase', placeholder: 'How can we help?' },
  { id: 5, title: 'Discovery', field: 'heardAbout', placeholder: 'How did you find us?' },
];

const ROLE_OPTIONS = [
  { value: 'l_and_d_manager', label: 'L&D Manager' },
  { value: 'hr_director', label: 'HR Director' },
  { value: 'training_specialist', label: 'Training Specialist' },
  { value: 'people_operations', label: 'People Operations' },
  { value: 'other', label: 'Other' },
];

const USE_CASE_OPTIONS = [
  { value: 'skills_gap_analysis', label: 'Skills Gap Analysis' },
  { value: 'employee_training', label: 'Employee Training' },
  { value: 'course_creation', label: 'Course Creation' },
  { value: 'performance_tracking', label: 'Performance Tracking' },
  { value: 'other', label: 'Other' },
];

const HEARD_ABOUT_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'google_search', label: 'Google Search' },
  { value: 'colleague', label: 'Colleague/Friend' },
  { value: 'conference', label: 'Conference/Event' },
  { value: 'blog_article', label: 'Blog/Article' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'other', label: 'Other' },
];

export default function ProgressiveOnboarding({ email, leadId, onComplete }: ProgressiveOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    role: '',
    useCase: '',
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
      
      // Find the first incomplete step
      const firstIncomplete = STEPS.find(step => {
        const field = step.field as keyof FormData;
        return !formData[field];
      });
      setCurrentStep(firstIncomplete?.id || 1);
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
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-future-green to-future-green/80"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        
        {/* Auto-save indicator */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <Save className="w-3 h-3 animate-pulse" />
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="w-3 h-3 text-green-600" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </>
            ) : null}
          </div>
          <span>{completedSteps.length} of {STEPS.length} completed</span>
        </div>
      </div>

      {/* Steps Overview */}
      <div className="mb-8">
        <div className="space-y-2">
          {STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const field = step.field as keyof FormData;
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'flex items-center gap-3 text-sm transition-all cursor-pointer',
                  isCompleted && 'opacity-50',
                  isCurrent && 'opacity-100 scale-105'
                )}
                onClick={() => !isCompleted && setCurrentStep(step.id)}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                  isCompleted ? 'bg-future-green border-future-green' : 
                  isCurrent ? 'border-future-green' : 'border-gray-300'
                )}>
                  {isCompleted && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={cn(
                  'transition-all',
                  isCompleted && 'line-through text-gray-400'
                )}>
                  {step.title}
                  {formData[field] && (
                    <span className="ml-2 text-gray-500">• {
                      typeof formData[field] === 'string' && formData[field].includes('_') 
                        ? formData[field].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                        : formData[field]
                    }</span>
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current Step Form */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">{currentStepData.title}</h2>

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
                  className="text-lg py-6 px-4 border-2 focus:border-future-green transition-colors"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={!formData[currentStepData.field as keyof FormData]}
                  className="mt-4 bg-future-green hover:bg-future-green/90 transition-all"
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleFieldComplete('role', option.value)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all hover:border-future-green hover:shadow-md',
                      formData.role === option.value
                        ? 'border-future-green bg-future-green/5'
                        : 'border-gray-200'
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleFieldComplete('useCase', option.value)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all hover:border-future-green hover:shadow-md',
                      formData.useCase === option.value
                        ? 'border-future-green bg-future-green/5'
                        : 'border-gray-200'
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
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
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleFieldComplete('heardAbout', option.value)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all hover:border-future-green hover:shadow-md',
                      formData.heardAbout === option.value
                        ? 'border-future-green bg-future-green/5'
                        : 'border-gray-200'
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Skip for now */}
      {!completedSteps.includes(currentStep) && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => {
            if (currentStep < STEPS.length) {
              setCurrentStep(currentStep + 1);
            }
          }}
          className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors block mx-auto"
        >
          Skip for now
        </motion.button>
      )}
    </div>
  );
}