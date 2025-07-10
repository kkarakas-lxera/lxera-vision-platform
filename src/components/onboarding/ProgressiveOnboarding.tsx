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
  otherRole?: string;
  teamSize: string;
  useCase: string;
  otherUseCase?: string;
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
    title: "What's the name of your company?", 
    field: 'company', 
    placeholder: 'Your company name',
    subtitle: "Tell us about the organization you're helping to transform."
  },
  { 
    id: 3, 
    title: "What best describes your role?", 
    field: 'role', 
    placeholder: 'Your role',
    subtitle: "Help us understand your position so we can personalize your experience."
  },
  { 
    id: 4, 
    title: "How big is your team?", 
    field: 'teamSize', 
    placeholder: 'Select team size',
    subtitle: "This helps us recommend the right solution for your organization."
  },
  { 
    id: 5, 
    title: "What are you hoping to achieve with LXERA?", 
    field: 'useCase', 
    placeholder: 'Your main focus area',
    subtitle: "Select all that apply to your learning and development goals."
  },
  { 
    id: 6, 
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
    value: 'digital_transformation_director', 
    label: 'Digital Transformation Director', 
    description: 'Leading digital transformation initiatives'
  },
  { 
    value: 'innovation_director', 
    label: 'Innovation Director', 
    description: 'Driving innovation and change'
  },
  { 
    value: 'other', 
    label: 'Other Role', 
    description: 'Something else entirely'
  },
];

const TEAM_SIZE_OPTIONS = [
  { 
    value: '1-10', 
    label: '1-10 employees', 
    description: 'Small team or startup'
  },
  { 
    value: '11-50', 
    label: '11-50 employees', 
    description: 'Growing team'
  },
  { 
    value: '51-200', 
    label: '51-200 employees', 
    description: 'Mid-size organization'
  },
  { 
    value: '201-500', 
    label: '201-500 employees', 
    description: 'Large organization'
  },
  { 
    value: '501-1000', 
    label: '501-1000 employees', 
    description: 'Enterprise scale'
  },
  { 
    value: '1000+', 
    label: '1000+ employees', 
    description: 'Global enterprise'
  },
];

const USE_CASE_OPTIONS = [
  { 
    value: 'employee_training', 
    label: 'Employee Training', 
    description: 'Create and deliver effective training programs'
  },
  { 
    value: 'personalized_learning_paths', 
    label: 'Personalized Learning Paths', 
    description: 'Tailor learning journeys to individual needs'
  },
  { 
    value: 'skills_gap_analysis', 
    label: 'Skills Gap Analysis', 
    description: 'Identify and bridge skill gaps in your organization'
  },
  { 
    value: 'onboarding_upskilling', 
    label: 'Onboarding & Upskilling', 
    description: 'Streamline employee onboarding and skill development'
  },
  { 
    value: 'compliance_certification', 
    label: 'Compliance & Certification Training', 
    description: 'Ensure regulatory compliance and track certifications'
  },
  { 
    value: 'learning_culture', 
    label: 'Learning Culture Building', 
    description: 'Foster a culture of continuous learning'
  },
  { 
    value: 'performance_tracking', 
    label: 'Performance Tracking', 
    description: 'Monitor and measure learning outcomes'
  },
  { 
    value: 'innovation_enablement', 
    label: 'Innovation Enablement / Citizen Development', 
    description: 'Empower employees to drive innovation'
  },
  { 
    value: 'ai_content_generation', 
    label: 'AI-Powered Content Generation', 
    description: 'Create learning content with AI assistance'
  },
  { 
    value: 'learning_roi', 
    label: 'Measuring Learning ROI', 
    description: 'Track and demonstrate the value of L&D investments'
  },
  { 
    value: 'mentorship_coaching', 
    label: 'Mentorship & Coaching', 
    description: 'Connect learners with mentors and coaches'
  },
  { 
    value: 'course_creation', 
    label: 'Course Creation', 
    description: 'Build courses for internal knowledge transfer'
  },
  { 
    value: 'other', 
    label: 'Other Use Case', 
    description: 'Tell us a bit more so we can recommend the right solution'
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
  // Determine initial step based on pre-filled data
  const getInitialStep = () => {
    if (initialData?.name) {
      // If name is pre-filled, skip to company or next empty field
      if (!initialData.company) return 2;
      if (!initialData.role) return 3;
      return 4; // Start at team size if name, company, and role are filled
    }
    return 1; // Start at name if not pre-filled
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep());
  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || '',
    company: initialData?.company || '',
    role: initialData?.role || '',
    otherRole: '',
    teamSize: '',
    useCase: initialData?.use_case || '',
    otherUseCase: '',
    heardAbout: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    // Mark steps as completed if data is pre-filled
    const completed = [];
    if (initialData?.name) completed.push(1);
    if (initialData?.company) completed.push(2);
    if (initialData?.role) completed.push(3);
    return completed;
  });

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`onboarding_${email}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Merge saved data with initial data, giving preference to saved data
      const mergedFormData = {
        ...formData,
        ...parsed.formData
      };
      setFormData(mergedFormData);
      
      // Update completed steps based on merged data
      const newCompletedSteps = [];
      STEPS.forEach((step, index) => {
        const field = step.field as keyof FormData;
        if (mergedFormData[field] && mergedFormData[field] !== '') {
          newCompletedSteps.push(index + 1);
        }
      });
      setCompletedSteps(newCompletedSteps);
      setLastSaved(parsed.timestamp ? new Date(parsed.timestamp) : null);
      
      // Find the first incomplete step
      const firstIncomplete = STEPS.find(step => {
        const field = step.field as keyof FormData;
        return !mergedFormData[field] || mergedFormData[field] === '';
      });
      setCurrentStep(firstIncomplete?.id || STEPS.length + 1);
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
    
    // Handle special cases for "other" options
    if (field === 'role' && value === 'other') {
      // Don't advance, wait for otherRole input
      return;
    }
    if (field === 'useCase' && value === 'other') {
      // Don't advance, wait for otherUseCase input
      return;
    }
    
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
  
  // Auto-advance for confirmed fields (removed to prevent auto-skip of name confirmation)

  // Dynamic encouraging messages based on step
  const getEncouragingMessage = (step: number) => {
    switch (step) {
      case 1:
        return "Quick and easy – just 30 seconds!";
      case 2:
        return "Great start! Just 5 more quick questions...";
      case 3:
        return "Nice progress – keep going!";
      case 4:
        return "Halfway there – you're doing great!";
      case 5:
        return "Almost done – just 2 more questions!";
      case 6:
        return "Last one – thanks for sticking with us!";
      default:
        return "Keep going...";
    }
  };

  // Get time estimate for remaining steps
  const getTimeEstimate = (step: number) => {
    const remainingSteps = STEPS.length - step + 1;
    const secondsPerStep = 6;
    const totalSeconds = remainingSteps * secondsPerStep;
    return totalSeconds < 30 ? `${totalSeconds} seconds left` : "Less than 30 seconds left";
  };

  // Get progress message based on filled fields
  const getProgressMessage = () => {
    const filledCount = Object.values(formData).filter(val => val).length;
    if (filledCount === 0) return "";
    if (filledCount === STEPS.length) return "🎉 All done!";
    return `${filledCount} of ${STEPS.length} completed`;
  };

  return (
    <div className="w-full max-w-sm mx-auto px-4 sm:max-w-md">
      {/* Mobile Progress Indicator */}
      <div className="mb-4 text-center">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-medium text-indigo-600 mb-1"
        >
          {getEncouragingMessage(currentStep)}
        </motion.div>
        <motion.div
          key={`time-${currentStep}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-gray-600 font-semibold mb-2"
        >
          ⏱️ {getTimeEstimate(currentStep)}
        </motion.div>
        <div className="text-xs text-gray-500 mb-2">{getProgressMessage()}</div>
        <div className="w-full bg-slate-300 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full shadow-lg"
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
      <Card className="overflow-hidden border-0 shadow-none bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 sm:border sm:border-indigo-200 sm:shadow-2xl sm:bg-gradient-to-br sm:from-white sm:via-blue-50/40 sm:to-indigo-100/60">
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
              <h2 className="text-lg sm:text-xl font-bold mb-3 bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">
                {currentStep === 1 && initialData?.name ? "Welcome back!" : currentStepData.title}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                {currentStep === 1 && initialData?.name 
                  ? "Great to see you again! Let's continue setting up your profile."
                  : currentStepData.subtitle}
              </p>
              {currentStep === 1 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                  className="mt-3 space-y-2"
                >
                  <span className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md">
                    🚀 No credit card required
                  </span>
                  <div className="text-xs text-slate-500 font-medium">
                    Join 500+ companies already transforming their L&D
                  </div>
                </motion.div>
              )}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-xs text-slate-600 font-medium"
                >
                  🏢 We work with companies of all sizes
                </motion.div>
              )}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-xs text-slate-600 font-medium"
                >
                  👋 We'll tailor your experience to your role
                </motion.div>
              )}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-xs text-slate-600 font-medium"
                >
                  👥 This helps us recommend the right plan for you
                </motion.div>
              )}
              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-xs text-slate-600 font-medium"
                >
                  🎯 We'll show you features that matter most to you
                </motion.div>
              )}
              {currentStep === 6 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-2 text-xs text-slate-600 font-medium"
                >
                  💡 This helps us improve our outreach
                </motion.div>
              )}
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
                <div className="relative">
                  {/* Special handling for name field when it comes from Early Access */}
                  {currentStep === 1 && initialData?.name ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <Input
                          type="text"
                          value={formData.name}
                          className="text-base sm:text-lg py-4 px-4 border-2 border-green-300 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl w-full cursor-not-allowed opacity-90"
                          readOnly
                          disabled
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Confirmed</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 text-center">
                        We already have your name from sign-up. Click continue to proceed.
                      </p>
                    </div>
                  ) : (
                    <Input
                      type="text"
                      placeholder={currentStepData.placeholder}
                      value={formData[currentStepData.field as keyof FormData]}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        [currentStepData.field]: e.target.value 
                      })}
                      className={cn(
                        "text-base sm:text-lg py-4 px-4 border-2 border-slate-300 focus:border-indigo-500 transition-all duration-300 bg-gradient-to-r from-white to-blue-50 focus:bg-gradient-to-r focus:from-white focus:to-indigo-50 rounded-xl focus:ring-2 focus:ring-indigo-300 w-full focus:shadow-xl focus:border-indigo-600",
                        // Show different styling if pre-filled from initialData (for company field)
                        currentStep === 2 && initialData?.company && "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300"
                      )}
                      autoFocus
                      autoComplete="off"
                      autoCapitalize="words"
                    />
                  )}
                  {currentStep === 2 && initialData?.company && (
                    <div className="absolute -top-2 right-2">
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        Pre-filled
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!formData[currentStepData.field as keyof FormData]}
                  className="mt-4 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 active:from-indigo-800 active:via-purple-800 active:to-indigo-900 transition-all text-white text-base py-3.5 rounded-xl touch-manipulation shadow-xl hover:shadow-2xl font-semibold"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            )}

            {/* Role selection */}
            {currentStep === 3 && (
              <>
              {formData.role !== 'other' ? (
              <div className="space-y-3">
                {ROLE_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleFieldComplete('role', option.value)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all active:scale-95 touch-manipulation hover:shadow-lg',
                      formData.role === option.value
                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-100 shadow-xl ring-2 ring-indigo-200'
                        : 'border-slate-300 active:border-indigo-400 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50'
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-base text-slate-800">{option.label}</span>
                      <span className="text-xs text-slate-600 font-medium">{option.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (formData.otherRole) {
                    handleFieldComplete('otherRole', formData.otherRole);
                  }
                }}>
                  <Input
                    type="text"
                    placeholder="Please specify your role"
                    value={formData.otherRole || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      otherRole: e.target.value 
                    })}
                    className="text-base sm:text-lg py-4 px-4 border-2 border-slate-300 focus:border-indigo-500 transition-all duration-300 bg-gradient-to-r from-white to-blue-50 focus:bg-gradient-to-r focus:from-white focus:to-indigo-50 rounded-xl focus:ring-2 focus:ring-indigo-300 w-full focus:shadow-xl focus:border-indigo-600"
                    autoFocus
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    disabled={!formData.otherRole}
                    className="mt-4 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 active:from-indigo-800 active:via-purple-800 active:to-indigo-900 transition-all text-white text-base py-3.5 rounded-xl touch-manipulation shadow-xl hover:shadow-2xl font-semibold"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              )}
              </>
            )}

            {/* Team size selection */}
            {currentStep === 4 && (
              <div className="space-y-3">
                {TEAM_SIZE_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleFieldComplete('teamSize', option.value)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all active:scale-95 touch-manipulation hover:shadow-lg',
                      formData.teamSize === option.value
                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-100 shadow-xl ring-2 ring-indigo-200'
                        : 'border-slate-300 active:border-indigo-400 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50'
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-base text-slate-800">{option.label}</span>
                      <span className="text-xs text-slate-600 font-medium">{option.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Use case selection */}
            {currentStep === 5 && (
              <>
              {formData.useCase !== 'other' ? (
              <div className="space-y-3">
                {USE_CASE_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleFieldComplete('useCase', option.value)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all active:scale-95 touch-manipulation hover:shadow-lg',
                      formData.useCase === option.value
                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-100 shadow-xl ring-2 ring-indigo-200'
                        : 'border-slate-300 active:border-indigo-400 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50'
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-base text-slate-800">{option.label}</span>
                      <span className="text-xs text-slate-600 font-medium">{option.description}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (formData.otherUseCase) {
                    handleFieldComplete('otherUseCase', formData.otherUseCase);
                  }
                }}>
                  <Input
                    type="text"
                    placeholder="Tell us a bit more so we can recommend the right solution"
                    value={formData.otherUseCase || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      otherUseCase: e.target.value 
                    })}
                    className="text-base sm:text-lg py-4 px-4 border-2 border-slate-300 focus:border-indigo-500 transition-all duration-300 bg-gradient-to-r from-white to-blue-50 focus:bg-gradient-to-r focus:from-white focus:to-indigo-50 rounded-xl focus:ring-2 focus:ring-indigo-300 w-full focus:shadow-xl focus:border-indigo-600"
                    autoFocus
                    autoComplete="off"
                  />
                  <Button
                    type="submit"
                    disabled={!formData.otherUseCase}
                    className="mt-4 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 active:from-indigo-800 active:via-purple-800 active:to-indigo-900 transition-all text-white text-base py-3.5 rounded-xl touch-manipulation shadow-xl hover:shadow-2xl font-semibold"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              )}
              </>
            )}

            {/* How did you hear about us */}
            {currentStep === 6 && (
              <div className="space-y-3">
                {HEARD_ABOUT_OPTIONS.map((option, index) => (
                  <motion.button
                    key={option.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleFieldComplete('heardAbout', option.value)}
                    className={cn(
                      'w-full p-4 rounded-xl border-2 text-left transition-all active:scale-95 touch-manipulation hover:shadow-lg',
                      formData.heardAbout === option.value
                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-100 via-purple-50 to-indigo-100 shadow-xl ring-2 ring-indigo-200'
                        : 'border-slate-300 active:border-indigo-400 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50'
                    )}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-base text-slate-800">{option.label}</span>
                      <span className="text-xs text-slate-600 font-medium">{option.description}</span>
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