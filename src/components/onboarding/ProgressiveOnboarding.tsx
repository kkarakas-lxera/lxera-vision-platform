import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Check, Building2, Briefcase, Target } from 'lucide-react';
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
  { id: 1, title: 'Your Name', field: 'name', icon: null },
  { id: 2, title: 'Company', field: 'company', icon: Building2 },
  { id: 3, title: 'Your Role', field: 'role', icon: Briefcase },
  { id: 4, title: 'Use Case', field: 'useCase', icon: Target },
  { id: 5, title: 'How did you hear about us?', field: 'heardAbout', icon: null },
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

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`onboarding_${email}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed.formData);
      setCurrentStep(parsed.currentStep || 1);
    }
  }, [email]);

  // Save progress to localStorage
  useEffect(() => {
    if (Object.values(formData).some(val => val)) {
      localStorage.setItem(`onboarding_${email}`, JSON.stringify({
        formData,
        currentStep,
        timestamp: new Date().toISOString(),
      }));
    }
  }, [formData, currentStep, email]);

  const handleNext = async () => {
    const currentField = STEPS[currentStep - 1].field as keyof FormData;
    
    if (!formData[currentField]) {
      toast({
        title: 'Please fill in this field',
        variant: 'destructive',
      });
      return;
    }

    // Save progress to database after each step
    try {
      const { error } = await supabase.functions.invoke('update-profile-progressive', {
        body: {
          leadId,
          field: currentField,
          value: formData[currentField],
        },
      });
      
      if (error) {
        console.error('Error saving progress:', error);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // The last field update will complete the profile
      const { error } = await supabase.functions.invoke('update-profile-progressive', {
        body: {
          leadId,
          field: 'heardAbout',
          value: formData.heardAbout,
          allData: formData, // Send all data for final update
        },
      });

      if (error) throw error;

      // Clear localStorage
      localStorage.removeItem(`onboarding_${email}`);

      toast({
        title: 'Profile completed!',
        description: 'Welcome to LXERA early access.',
      });

      // Small delay to ensure the UI feels smooth
      setTimeout(() => {
        onComplete();
      }, 500);
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

  const progress = (currentStep / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep - 1];
  const Icon = currentStepData.icon;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-0">
        {/* Progress Bar */}
        <div className="relative h-1 bg-gray-200">
          <motion.div
            className="absolute top-0 left-0 h-full bg-future-green"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        <div className="p-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex items-center',
                  index < STEPS.length - 1 && 'flex-1'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                    step.id < currentStep
                      ? 'bg-future-green text-white'
                      : step.id === currentStep
                      ? 'bg-future-green/20 text-future-green border-2 border-future-green'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {step.id < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-3',
                      step.id < currentStep ? 'bg-future-green' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[300px] flex flex-col"
            >
              <div className="flex-1">
                <div className="text-center mb-8">
                  {Icon && <Icon className="w-12 h-12 mx-auto mb-4 text-future-green" />}
                  <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
                  <p className="text-gray-600">
                    {currentStep === 1 && "What should we call you?"}
                    {currentStep === 2 && "Where do you work?"}
                    {currentStep === 3 && "What's your role?"}
                    {currentStep === 4 && "How can LXERA help you?"}
                    {currentStep === 5 && "We'd love to know how you found us"}
                  </p>
                </div>

                {/* Input Fields */}
                {currentStep === 1 && (
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="text-lg py-6 text-center"
                    autoFocus
                  />
                )}

                {currentStep === 2 && (
                  <Input
                    type="text"
                    placeholder="Enter your company name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="text-lg py-6 text-center"
                    autoFocus
                  />
                )}

                {currentStep === 3 && (
                  <div className="grid grid-cols-1 gap-3">
                    {ROLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, role: option.value })}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          formData.role === option.value
                            ? 'border-future-green bg-future-green/10'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {formData.role === option.value && (
                            <Check className="w-5 h-5 text-future-green" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="grid grid-cols-1 gap-3">
                    {USE_CASE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, useCase: option.value })}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          formData.useCase === option.value
                            ? 'border-future-green bg-future-green/10'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {formData.useCase === option.value && (
                            <Check className="w-5 h-5 text-future-green" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="grid grid-cols-1 gap-3">
                    {HEARD_ABOUT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, heardAbout: option.value })}
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all text-left',
                          formData.heardAbout === option.value
                            ? 'border-future-green bg-future-green/10'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {formData.heardAbout === option.value && (
                            <Check className="w-5 h-5 text-future-green" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="min-w-[120px]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="min-w-[120px] bg-future-green hover:bg-future-green/90"
                >
                  {currentStep === STEPS.length ? (
                    isSubmitting ? 'Completing...' : 'Complete'
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}