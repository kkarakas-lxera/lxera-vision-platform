import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronRight, Eye, EyeOff, HelpCircle, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SkillsGapOnboardingProps {
  email: string;
  name: string;
  leadId: string;
  onComplete: (data: { password: string; company: string; role: string; teamSize: string; useCase: string; heardAbout: string }) => void;
}

interface FormData {
  password: string;
  confirmPassword: string;
  name: string;
  company: string;
  role: string;
  teamSize: string;
  useCase: string;
  heardAbout: string;
}

const STEPS = [
  { 
    id: 1, 
    title: "Set your password", 
    field: 'password', 
    placeholder: 'Choose a secure password',
    subtitle: "Create a secure password to protect your account."
  },
  { 
    id: 2, 
    title: "What should we call you?", 
    field: 'name', 
    placeholder: 'Your full name',
    subtitle: "Let's start with the basics — we'd love to know your name."
  },
  { 
    id: 3, 
    title: "What's the name of your company?", 
    field: 'company', 
    placeholder: 'Your company name',
    subtitle: "Tell us about the organization you're helping to transform."
  },
  { 
    id: 4, 
    title: "What best describes your role?", 
    field: 'role', 
    placeholder: 'Your role',
    subtitle: "Help us understand your position so we can personalize your experience."
  },
  { 
    id: 5, 
    title: "How big is your team?", 
    field: 'teamSize', 
    placeholder: 'Select team size',
    subtitle: "This helps us recommend the right solution for your organization."
  },
  { 
    id: 6, 
    title: "What are you hoping to achieve with LXERA?", 
    field: 'useCase', 
    placeholder: 'Your main focus area',
    subtitle: "Select what best describes your learning and development goals."
  },
  { 
    id: 7, 
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

export default function SkillsGapOnboarding({ email, name, leadId, onComplete }: SkillsGapOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
    name: name || '',
    company: '',
    role: '',
    teamSize: '',
    useCase: '',
    heardAbout: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordStrong = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  const getPasswordStrengthColor = () => {
    if (formData.password.length === 0) return 'bg-indigo-100';
    if (formData.password.length < 8) return 'bg-red-400';
    if (isPasswordStrong(formData.password)) return 'bg-indigo-500';
    return 'bg-indigo-300';
  };

  const getPasswordStrengthText = () => {
    if (formData.password.length === 0) return '';
    if (formData.password.length < 8) return 'Too short';
    if (isPasswordStrong(formData.password)) return 'Strong';
    return 'Medium';
  };

  const isStepValid = () => {
    const step = STEPS[currentStep - 1];
    const field = step.field as keyof FormData;
    
    if (field === 'password') {
      return formData.password.length >= 8 && formData.password === formData.confirmPassword;
    }
    
    return formData[field] && formData[field] !== '';
  };

  const handleNext = () => {
    if (!isStepValid()) return;
    
    setCompletedSteps(prev => [...prev, currentStep]);
    
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    const { confirmPassword, name, ...onboardingData } = formData;
    console.log('Form data before submission:', formData);
    console.log('Onboarding data being sent:', {
      password: onboardingData.password,
      company: onboardingData.company,
      role: onboardingData.role,
      teamSize: onboardingData.teamSize,
      useCase: onboardingData.useCase,
      heardAbout: onboardingData.heardAbout,
    });
    onComplete({
      password: onboardingData.password,
      company: onboardingData.company,
      role: onboardingData.role,
      teamSize: onboardingData.teamSize,
      useCase: onboardingData.useCase,
      heardAbout: onboardingData.heardAbout,
    });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep - 1];
    const field = step.field as keyof FormData;

    if (field === 'password') {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                placeholder="Enter your password"
                className="pr-10 bg-white"
                style={{ backgroundColor: 'white' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-indigo-400" />
                ) : (
                  <Eye className="h-4 w-4 text-indigo-400" />
                )}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-indigo-100 rounded-full">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{
                        width: `${Math.min((formData.password.length / 8) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-xs text-indigo-600">
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <p className="text-xs text-indigo-500 mt-1">
                  Use 8+ characters with uppercase, lowercase, and numbers
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative mt-1">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                className="pr-10 bg-white"
                style={{ backgroundColor: 'white' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-indigo-400" />
                ) : (
                  <Eye className="h-4 w-4 text-indigo-400" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
          </div>
        </div>
      );
    }

    if (field === 'name' || field === 'company') {
      return (
        <div>
          <Input
            value={formData[field]}
            onChange={(e) => updateFormData(field, e.target.value)}
            placeholder={step.placeholder}
            className="text-lg p-4 border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-200 bg-white"
            style={{ backgroundColor: 'white' }}
          />
        </div>
      );
    }

    if (field === 'role') {
      return (
        <div className="space-y-3">
          {ROLE_OPTIONS.map((option) => (
            <Card
              key={option.value}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                formData.role === option.value
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md"
                  : "bg-white/60 backdrop-blur-sm border-indigo-100 hover:border-indigo-200"
              )}
              onClick={() => updateFormData('role', option.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                {formData.role === option.value && (
                  <Check className="h-5 w-5 text-indigo-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (field === 'teamSize') {
      return (
        <div className="space-y-3">
          {TEAM_SIZE_OPTIONS.map((option) => (
            <Card
              key={option.value}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                formData.teamSize === option.value
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md"
                  : "bg-white/60 backdrop-blur-sm border-indigo-100 hover:border-indigo-200"
              )}
              onClick={() => updateFormData('teamSize', option.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                {formData.teamSize === option.value && (
                  <Check className="h-5 w-5 text-indigo-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (field === 'useCase') {
      return (
        <div className="space-y-3">
          {USE_CASE_OPTIONS.map((option) => (
            <Card
              key={option.value}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                formData.useCase === option.value
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md"
                  : "bg-white/60 backdrop-blur-sm border-indigo-100 hover:border-indigo-200"
              )}
              onClick={() => updateFormData('useCase', option.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                {formData.useCase === option.value && (
                  <Check className="h-5 w-5 text-indigo-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (field === 'heardAbout') {
      return (
        <div className="space-y-3">
          {HEARD_ABOUT_OPTIONS.map((option) => (
            <Card
              key={option.value}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                formData.heardAbout === option.value
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-md"
                  : "bg-white/60 backdrop-blur-sm border-indigo-100 hover:border-indigo-200"
              )}
              onClick={() => updateFormData('heardAbout', option.value)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                {formData.heardAbout === option.value && (
                  <Check className="h-5 w-5 text-indigo-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return null;
  };

  const currentStepData = STEPS[currentStep - 1];
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Bar and Help Section - Side by Side */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Progress Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between text-sm text-indigo-600 mb-2">
                <span>Step {currentStep} of {STEPS.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="w-full bg-indigo-100 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {/* Help Section */}
            <div className="lg:col-span-1">
              <Card className="bg-indigo-50 border-indigo-200 p-3">
                <div className="flex items-start space-x-2">
                  <HelpCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-indigo-900 mb-1">Need Help Getting Started?</h4>
                    <p className="text-xs text-indigo-700 mb-2">Our team is here to help you set up your account and get the most out of LXERA.</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-3 text-xs border-indigo-300 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-400"
                      onClick={() => window.open('mailto:support@lxera.ai', '_blank')}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="bg-white backdrop-blur-sm border-indigo-100 shadow-lg max-w-2xl mx-auto">
          <div className="p-8">
            <div className="text-center mb-8">
              <img 
                src="https://www.lxera.ai/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png" 
                alt="LXERA" 
                className="h-12 mx-auto mb-4"
              />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-gray-600 text-lg">
                {currentStepData.subtitle}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                Back
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800 text-white px-8 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                {isSubmitting ? (
                  'Setting up...'
                ) : currentStep === STEPS.length ? (
                  'Complete Setup'
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}