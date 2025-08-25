import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/button';
import { AnimatedShinyText } from '../../../ui/AnimatedShinyText';
import { Input } from '../../../ui/input';
import { useToast } from '../../../ui/use-toast';
import * as Dialog from '@radix-ui/react-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../ui/select';
import { Checkbox } from '../../../ui/checkbox';
import ClassicLoader from '../../../ui/ClassicLoader';
import { AnimatedTooltip } from '../../../ui/animated-tooltip';
import { WaitlistVariant } from '../shared/contentSelector';
import { validateWaitlistForm } from '../../../../utils/waitlistValidation';

interface WaitingListHeroMobileProps {
  content: any;
  variant: WaitlistVariant;
}

export const WaitingListHeroMobile: React.FC<WaitingListHeroMobileProps> = ({ content, variant }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInlineOnboarding, setShowInlineOnboarding] = useState(false);
  const [showFinalSuccess, setShowFinalSuccess] = useState(false);
  const [captured, setCaptured] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [form, setForm] = useState({
    role: '',
    roleOther: '',
    teamSize: '',
    useCases: [] as string[],
    useCasesOther: '',
    heardAbout: '',
  });
  
  // B2C Questionnaire state
  const [b2cForm, setB2cForm] = useState({
    career_stage: '',
    industry: '',
    industry_other: '',
    current_company: '',
    location_country: '',
    skills_interested: [] as string[],
    skills_other: '',
    motivation: '',
    motivation_other: '',
  });

  // Clear validation errors when user types
  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) setNameError('');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setNameError('');
    setEmailError('');
    
    // Validate form
    const { nameValidation, emailValidation, isFormValid } = validateWaitlistForm(name, email, variant);
    
    if (!nameValidation.isValid) {
      setNameError(nameValidation.error || '');
    }
    
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || '');
    }
    
    if (!isFormValid) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await fetch('https://xwfweumeryrgbguwrocr.supabase.co/functions/v1/waitlist-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw',
        },
        body: JSON.stringify({
          fullName: name,
          email: email,
          source: variant === 'personal' ? 'hero-waitlist-personal-mobile' : 'hero-waitlist-enterprise-mobile'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCaptured({ name, email });
        setShowSuccess(true);
      } else {
        throw new Error(data.error || 'Failed to join waitlist');
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, toast]);

  const handleStartOnboarding = () => {
    setShowInlineOnboarding(true);
  };

  const handleSkipOnboarding = () => {
    setShowSuccess(false);
    // Could redirect or show different content
  };

  const handleOnboardingSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Prepare data based on variant
      const requestData = variant === 'personal' ? {
        fullName: captured.name,
        email: captured.email,
        variant: 'personal',
        questionnaireData: b2cForm,
        source: 'hero-waitlist-personal-mobile-onboarding'
      } : {
        fullName: captured.name,
        email: captured.email,
        role: form.role,
        roleOther: form.roleOther,
        teamSize: form.teamSize,
        useCases: form.useCases,
        useCasesOther: form.useCasesOther,
        heardAbout: form.heardAbout,
        onboardingCompleted: true,
        variant: 'enterprise',
        source: 'hero-waitlist-enterprise-mobile-onboarding'
      };
      
      const response = await fetch('https://xwfweumeryrgbguwrocr.supabase.co/functions/v1/waitlist-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw',
        },
        body: JSON.stringify(requestData),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowInlineOnboarding(false);
        setShowSuccess(false);
        setShowFinalSuccess(true);
      } else {
        throw new Error(data.error || 'Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-screen overflow-hidden font-inter" style={{ backgroundColor: 'rgb(255 255 255)' }}>
        <div className="relative z-10 px-4 py-6 flex flex-col min-h-screen">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <button
              onClick={() => {
                const targetPath = `/waiting-list/${variant}`;
                if (window.location.pathname === targetPath) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  window.location.href = targetPath;
                }
              }}
              className="transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[#7AE5C6] focus:ring-offset-2 rounded-lg"
              aria-label={`Go to ${variant} homepage`}
            >
              <img
                src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png"
                alt="LXERA logo"
                className="h-8 object-contain"
                draggable={false}
                loading="eager"
                decoding="sync"
              />
            </button>
          </div>

          {/* Main content centered */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            {!showSuccess && !showInlineOnboarding && !showFinalSuccess ? (
              <>
                {/* Initial Form State */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <h1 className="text-3xl font-medium text-black leading-tight mb-4 px-2">
                    {content.HERO_CONTENT.title}
                  </h1>
                  <p className="text-base text-gray-700 mb-6 px-4 leading-relaxed">
                    {content.HERO_CONTENT.subtitle}
                  </p>
                  
                  {/* CTA Badge - Mobile optimized with soft orange */}
                  <div className="flex justify-center mb-8 px-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-3 py-2 shadow-sm max-w-full">
                      <span role="img" aria-label="alarm clock" className="text-orange-400 flex-shrink-0">⏰</span>
                      <AnimatedShinyText className="text-xs font-inter m-0 text-center leading-tight text-orange-600">
                        FREE for 30 days. No credit card.
                      </AnimatedShinyText>
                    </div>
                  </div>
                </motion.div>

                {/* Mobile-optimized form */}
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-4 px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                >
                  <div>
                    <Input
                      type="text"
                      placeholder={content.HERO_CONTENT.formPlaceholders.name}
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className={`w-full h-12 px-4 border rounded-md text-base font-inter bg-white text-black ${nameError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {nameError && (
                      <p className="text-red-500 text-xs mt-1 font-inter px-1">{nameError}</p>
                    )}
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder={content.HERO_CONTENT.formPlaceholders.email}
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      className={`w-full h-12 px-4 border rounded-md text-base font-inter bg-white text-black ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1 font-inter px-1">{emailError}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md font-inter shadow-none border-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <ClassicLoader />
                        Getting access...
                      </span>
                    ) : 'Get Early Access'}
                  </Button>
                </motion.form>

                {/* Social proof */}
                <motion.div 
                  className="flex flex-col items-center space-y-3 px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <AnimatedTooltip items={content.SOCIAL_PROOF_PEOPLE} className="justify-center" />
                  <span className="text-sm text-gray-600 font-inter text-center">
                    {content.HERO_CONTENT.socialProof}
                  </span>
                </motion.div>
              </>
            ) : showSuccess && !showInlineOnboarding && !showFinalSuccess ? (
              /* Success State - Inline CTA */
              <motion.div 
                className="text-center px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-[#7AE5C6]/20 rounded-full mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#029c55]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-black mb-3">
                  Thanks for your interest in LXERA!
                </h2>
                <p className="text-base text-gray-700 mb-8 leading-relaxed">
                  Want faster onboarding? Answer a few questions and we'll set things up for you.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleStartOnboarding}
                    className="w-full h-12 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md font-inter shadow-none border-none"
                  >
                    Answer a few questions
                  </Button>
                  <Button
                    onClick={handleSkipOnboarding}
                    variant="outline"
                    className="w-full h-12 text-black border-gray-300 font-medium rounded-md font-inter"
                  >
                    Maybe later
                  </Button>
                </div>
              </motion.div>
            ) : showFinalSuccess ? (
              /* Final Success State */
              <motion.div 
                className="text-center px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center justify-center w-20 h-20 mx-auto bg-green-100 rounded-full mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-black mb-4">
                  Welcome to LXERA!
                </h2>
                <p className="text-gray-700 mb-8 text-base leading-relaxed">
                  You're all set. We'll be in touch soon with your early access details.
                </p>
                <Button
                  onClick={() => window.location.href = variant === 'personal' ? '/waiting-list/personal' : '/waiting-list'}
                  className="w-full h-12 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md font-inter shadow-none border-none"
                >
                  Explore More
                </Button>
              </motion.div>
            ) : (
              /* Inline Onboarding State */
              <motion.div 
                className="px-4 space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-black">Tell us more</h2>
                  <button
                    className="text-sm text-gray-600 hover:text-black p-2"
                    onClick={() => {
                      if (onboardingStep === 1) {
                        setShowInlineOnboarding(false);
                      } else {
                        setOnboardingStep(onboardingStep - 1);
                      }
                    }}
                  >
                    {onboardingStep === 1 ? 'Back' : 'Previous'}
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#7AE5C6] h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${(onboardingStep / (variant === 'personal' ? 6 : 4)) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Step {onboardingStep} of {variant === 'personal' ? 6 : 4}
                  </div>
                </div>

                <div className="space-y-4">
                  {/* B2C Questions for Personal Variant */}
                  {variant === 'personal' && (
                    <>
                      {onboardingStep === 1 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">What's your current career stage?</div>
                          <Select value={b2cForm.career_stage} onValueChange={(v) => setB2cForm({ ...b2cForm, career_stage: v })}>
                            <SelectTrigger className="w-full h-12">
                              <SelectValue placeholder="Select your career stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Junior professional (0-2 years experience)', 'Mid-level professional (3-7 years)', 'Senior professional (8+ years)', 'Career changer/transitioning', 'Looking to re-enter workforce'].map((stage) => (
                                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      {onboardingStep === 2 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">Which industry do you work in?</div>
                          <Select value={b2cForm.industry} onValueChange={(v) => setB2cForm({ ...b2cForm, industry: v })}>
                            <SelectTrigger className="w-full h-12">
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Technology & Software', 'Healthcare & Life Sciences', 'Financial Services & Banking', 'Marketing & Advertising', 'Education & Training', 'Manufacturing & Engineering', 'Retail & E-commerce', 'Consulting & Professional Services', 'Government & Non-profit', 'Other'].map((industry) => (
                                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {b2cForm.industry === 'Other' && (
                            <Input
                              type="text"
                              placeholder="Please specify your industry"
                              value={b2cForm.industry_other}
                              onChange={(e) => setB2cForm({ ...b2cForm, industry_other: e.target.value })}
                              className="h-12"
                            />
                          )}
                        </>
                      )}

                      {onboardingStep === 3 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">What company do you work for?</div>
                          <Input
                            type="text"
                            placeholder="Enter your company name"
                            value={b2cForm.current_company}
                            onChange={(e) => setB2cForm({ ...b2cForm, current_company: e.target.value })}
                            className="h-12"
                          />
                        </>
                      )}

                      {onboardingStep === 4 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">Where are you located?</div>
                          <Select value={b2cForm.location_country} onValueChange={(v) => setB2cForm({ ...b2cForm, location_country: v })}>
                            <SelectTrigger className="w-full h-12">
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {['Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'Hungary', 'India', 'Indonesia', 'Iran', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kenya', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam', 'Other'].map((country) => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      {onboardingStep === 5 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">Which skills are you most interested in developing? (Select up to 3)</div>
                          <div className="space-y-3">
                            {['Technical skills (coding, data analysis, etc.)', 'Leadership and management', 'Communication and presentation', 'Creative skills (design, writing, etc.)', 'Digital marketing and social media', 'Financial literacy and business skills', 'Other'].map((skill) => (
                              <div key={skill} className="flex items-center space-x-2">
                                <Checkbox
                                  id={skill}
                                  checked={b2cForm.skills_interested.includes(skill)}
                                  onCheckedChange={(checked) => {
                                    if (checked && b2cForm.skills_interested.length < 3) {
                                      setB2cForm({ ...b2cForm, skills_interested: [...b2cForm.skills_interested, skill] });
                                    } else if (!checked) {
                                      setB2cForm({ ...b2cForm, skills_interested: b2cForm.skills_interested.filter(s => s !== skill) });
                                    }
                                  }}
                                  disabled={!b2cForm.skills_interested.includes(skill) && b2cForm.skills_interested.length >= 3}
                                />
                                <label htmlFor={skill} className="text-sm text-gray-700">{skill}</label>
                              </div>
                            ))}
                          </div>
                          {b2cForm.skills_interested.includes('Other') && (
                            <Input
                              type="text"
                              placeholder="Please specify other skills"
                              value={b2cForm.skills_other}
                              onChange={(e) => setB2cForm({ ...b2cForm, skills_other: e.target.value })}
                              className="h-12"
                            />
                          )}
                        </>
                      )}

                      {onboardingStep === 6 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">What's driving your interest in skill development right now?</div>
                          <Select value={b2cForm.motivation} onValueChange={(v) => setB2cForm({ ...b2cForm, motivation: v })}>
                            <SelectTrigger className="w-full h-12">
                              <SelectValue placeholder="Select your primary motivation" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Want to advance in my current role', 'Looking to change careers completely', 'Preparing for job interviews', 'Want to start a side business/freelancing', 'Personal growth and curiosity', 'Other'].map((motivation) => (
                                <SelectItem key={motivation} value={motivation}>{motivation}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {b2cForm.motivation === 'Other' && (
                            <Input
                              type="text"
                              placeholder="Please specify your motivation"
                              value={b2cForm.motivation_other}
                              onChange={(e) => setB2cForm({ ...b2cForm, motivation_other: e.target.value })}
                              className="h-12"
                            />
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* B2B Questions for Enterprise Variant */}
                  {variant === 'enterprise' && (
                    <>
                      {onboardingStep === 1 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">What's your current role?</div>
                          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                            <SelectTrigger className="w-full h-12">
                              <SelectValue placeholder="Select your current role" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Learning & Development Specialist', 'Human Resources Specialist', 'Innovation Manager', 'Content Developer', 'CHRO', 'CEO', 'Founder', 'Other'].map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {form.role === 'Other' && (
                            <Input
                              type="text"
                              placeholder="Please specify your role"
                              value={form.roleOther}
                              onChange={(e) => setForm({ ...form, roleOther: e.target.value })}
                              className="h-12"
                            />
                          )}
                        </>
                      )}

                      {onboardingStep === 2 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">How large is your team?</div>
                          <Select value={form.teamSize} onValueChange={(v) => setForm({ ...form, teamSize: v })}>
                            <SelectTrigger className="w-full h-12">
                              <SelectValue placeholder="Select team size" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Just me', '2-10 employees', '11-50 employees', '51-200 employees', '200+ employees'].map((size) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}

                      {onboardingStep === 3 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">What will you primarily use LXERA for?</div>
                          <div className="space-y-3">
                            {['Skills gap analysis', 'Employee training', 'Course creation', 'Team development', 'Performance tracking', 'Other'].map((useCase) => (
                              <div key={useCase} className="flex items-center space-x-2">
                                <Checkbox
                                  id={useCase}
                                  checked={form.useCases.includes(useCase)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setForm({ ...form, useCases: [...form.useCases, useCase] });
                                    } else {
                                      setForm({ ...form, useCases: form.useCases.filter(u => u !== useCase) });
                                    }
                                  }}
                                />
                                <label htmlFor={useCase} className="text-sm text-gray-700">{useCase}</label>
                              </div>
                            ))}
                          </div>
                          {form.useCases.includes('Other') && (
                            <Input
                              type="text"
                              placeholder="Please specify"
                              value={form.useCasesOther}
                              onChange={(e) => setForm({ ...form, useCasesOther: e.target.value })}
                              className="h-12"
                            />
                          )}
                        </>
                      )}

                      {onboardingStep === 4 && (
                        <>
                          <div className="text-sm text-gray-700 font-medium">How did you hear about LXERA?</div>
                          <Select value={form.heardAbout} onValueChange={(v) => setForm({ ...form, heardAbout: v })}>
                            <SelectTrigger className="w-full h-12">
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              {['Google search', 'Social media', 'Friend/colleague referral', 'Industry publication', 'Conference/event', 'Other'].map((source) => (
                                <SelectItem key={source} value={source}>{source}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  {/* B2C Navigation */}
                  {variant === 'personal' && onboardingStep < 6 && (
                    <Button
                      onClick={() => setOnboardingStep(onboardingStep + 1)}
                      className="w-full h-12 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md font-inter shadow-none border-none"
                      disabled={
                        (onboardingStep === 1 && !b2cForm.career_stage) ||
                        (onboardingStep === 2 && !b2cForm.industry) ||
                        (onboardingStep === 3 && !b2cForm.current_company) ||
                        (onboardingStep === 4 && !b2cForm.location_country) ||
                        (onboardingStep === 5 && b2cForm.skills_interested.length === 0)
                      }
                    >
                      Continue
                    </Button>
                  )}

                  {variant === 'personal' && onboardingStep === 6 && (
                    <Button
                      onClick={handleOnboardingSubmit}
                      disabled={!b2cForm.motivation || isSubmitting}
                      className="w-full h-12 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md font-inter shadow-none border-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <ClassicLoader />
                          Finishing up...
                        </span>
                      ) : 'Complete Setup'}
                    </Button>
                  )}

                  {/* B2B Navigation */}
                  {variant === 'enterprise' && onboardingStep < 4 && (
                    <Button
                      onClick={() => setOnboardingStep(onboardingStep + 1)}
                      className="w-full h-12 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md font-inter shadow-none border-none"
                      disabled={
                        (onboardingStep === 1 && !form.role) ||
                        (onboardingStep === 2 && !form.teamSize) ||
                        (onboardingStep === 3 && form.useCases.length === 0)
                      }
                    >
                      Continue
                    </Button>
                  )}

                  {variant === 'enterprise' && onboardingStep === 4 && (
                    <Button
                      onClick={handleOnboardingSubmit}
                      disabled={!form.heardAbout || isSubmitting}
                      className="w-full h-12 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md font-inter shadow-none border-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <ClassicLoader />
                          Finishing up...
                        </span>
                      ) : 'Complete Setup'}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
