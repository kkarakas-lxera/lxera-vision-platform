import React, { useEffect, useRef, useState, memo, useCallback, useMemo } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion, useInView } from 'framer-motion';
import { Clock } from 'lucide-react';
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


interface WaitingListHeroProps {
  content: any;
  variant: WaitlistVariant;
}

export const WaitingListHero: React.FC<WaitingListHeroProps> = memo(({ content, variant }) => {
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "100px" });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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
  const finishedRef = useRef(false);

  // Auto-advance logic without extra clicks
  useEffect(() => {
    if (!showOnboarding) return;

    // Step 1 → 2: role selected (and Other specified if chosen)
    if (
      onboardingStep === 1 &&
      form.role &&
      (form.role !== 'Other' || (form.role === 'Other' && form.roleOther.trim().length > 0))
    ) {
      setOnboardingStep(2);
      return;
    }

    // Step 2 → 3: team size selected
    if (onboardingStep === 2 && form.teamSize) {
      setOnboardingStep(3);
      return;
    }

    // Step 3 → 4: removed auto-advance to allow multiple selections

    // B2B: Step 4 → finish: heard about selected
    if (variant === 'enterprise' && onboardingStep === 4 && form.heardAbout && !finishedRef.current) {
      finishedRef.current = true;
      
      // Submit detailed B2B onboarding data
      const submitOnboardingData = async () => {
        try {
          const response = await fetch('https://xwfweumeryrgbguwrocr.supabase.co/functions/v1/waitlist-subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw',
            },
            body: JSON.stringify({
              email: captured.email,
              fullName: captured.name,
              role: form.role,
              roleOther: form.roleOther,
              teamSize: form.teamSize,
              useCases: form.useCases,
              useCasesOther: form.useCasesOther,
              heardAbout: form.heardAbout,
              onboardingCompleted: true,
              variant: 'enterprise',
              source: 'hero-waitlist-enterprise-onboarding'
            }),
          });
          
          const data = await response.json();
          if (data.success) {
            console.log('B2B onboarding data saved successfully');
          } else {
            console.error('Failed to save B2B onboarding data:', data.error);
          }
        } catch (error) {
          console.error('Error saving B2B onboarding data:', error);
        }
      };
      
      submitOnboardingData();
      setShowOnboarding(false);
      setIsDialogOpen(false);
      toast({ title: 'Thanks!', description: 'Your preferences have been saved successfully!' });
    }
    
    // B2C: Step 6 → finish: motivation selected
    if (variant === 'personal' && onboardingStep === 6 && b2cForm.motivation && !finishedRef.current) {
      finishedRef.current = true;
      
      // Submit detailed B2C questionnaire data
      const submitQuestionnaireData = async () => {
        try {
          const response = await fetch('https://xwfweumeryrgbguwrocr.supabase.co/functions/v1/waitlist-subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZndldW1lcnlyZ2JndXdyb2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NjM0NDAsImV4cCI6MjA2NjMzOTQ0MH0.aDpFDImHTr13UhRHqQZHZ92e8I-tvcuUcDCtfRvfbzw',
            },
            body: JSON.stringify({
              email: captured.email,
              fullName: captured.name,
              variant: 'personal',
              questionnaireData: b2cForm,
              source: 'hero-waitlist-personal-onboarding'
            }),
          });
          
          const data = await response.json();
          if (data.success) {
            console.log('B2C questionnaire data saved successfully');
          } else {
            console.error('Failed to save B2C questionnaire data:', data.error);
          }
        } catch (error) {
          console.error('Error saving B2C questionnaire data:', error);
        }
      };
      
      submitQuestionnaireData();
      setShowOnboarding(false);
      setIsDialogOpen(false);
      toast({ title: 'Thanks!', description: 'Your preferences have been saved successfully!' });
    }
  }, [showOnboarding, onboardingStep, form.role, form.roleOther, form.teamSize, form.useCases.length, form.heardAbout, b2cForm.motivation, variant]);

  // Memoized constants to prevent array recreation
  const ROLE_OPTIONS = useMemo(() => [
    'Learning & Development Specialist',
    'Human Resources Specialist',
    'Innovation Manager',
    'Content Developer',
    'CHRO',
    'CEO',
    'Founder',
    'Other',
  ], []);

  const TEAM_SIZE_OPTIONS = useMemo(() => ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], []);
  const USE_CASE_OPTIONS = useMemo(() => [
    'Skills Gap Analysis',
    'Employee Training',
    'Personalized Learning Paths',
    'Innovation Enablement',
    'Compliance Training',
    'Other',
  ], []);
  const HEARD_ABOUT_OPTIONS = useMemo(() => ['LinkedIn', 'Google Search', 'Colleague or Friend', 'Conference or Event', 'Blog or Article', 'Social Media', 'Other'], []);
  
  // B2C Options
  const B2C_CAREER_STAGES = useMemo(() => [
    'Junior professional (0-2 years experience)',
    'Mid-level professional (3-7 years)',
    'Senior professional (8+ years)',
    'Career changer/transitioning',
    'Looking to re-enter workforce'
  ], []);
  
  const B2C_INDUSTRIES = useMemo(() => [
    'Technology & Software',
    'Healthcare & Life Sciences',
    'Financial Services & Banking',
    'Marketing & Advertising',
    'Education & Training',
    'Manufacturing & Engineering',
    'Retail & E-commerce',
    'Consulting & Professional Services',
    'Government & Non-profit',
    'Other'
  ], []);
  
  const B2C_COUNTRIES = useMemo(() => [
    'Afghanistan',
    'Albania',
    'Algeria',
    'Argentina',
    'Australia',
    'Austria',
    'Bangladesh',
    'Belgium',
    'Brazil',
    'Bulgaria',
    'Canada',
    'Chile',
    'China',
    'Colombia',
    'Croatia',
    'Czech Republic',
    'Denmark',
    'Egypt',
    'Finland',
    'France',
    'Germany',
    'Ghana',
    'Greece',
    'Hungary',
    'India',
    'Indonesia',
    'Iran',
    'Ireland',
    'Israel',
    'Italy',
    'Japan',
    'Jordan',
    'Kenya',
    'Malaysia',
    'Mexico',
    'Morocco',
    'Netherlands',
    'New Zealand',
    'Nigeria',
    'Norway',
    'Pakistan',
    'Philippines',
    'Poland',
    'Portugal',
    'Romania',
    'Russia',
    'Saudi Arabia',
    'Singapore',
    'South Africa',
    'South Korea',
    'Spain',
    'Sweden',
    'Switzerland',
    'Thailand',
    'Turkey',
    'Ukraine',
    'United Arab Emirates',
    'United Kingdom',
    'United States',
    'Vietnam',
    'Other'
  ], []);
  
  const B2C_SKILLS = useMemo(() => [
    'Technical skills (coding, data analysis, etc.)',
    'Leadership and management',
    'Communication and presentation',
    'Creative skills (design, writing, etc.)',
    'Digital marketing and social media',
    'Financial literacy and business skills',
    'Other'
  ], []);
  
  const B2C_MOTIVATIONS = useMemo(() => [
    'Want to advance in my current role',
    'Looking to change careers completely',
    'Preparing for job interviews',
    'Want to start a side business/freelancing',
    'Personal growth and curiosity',
    'Other'
  ], []);

  // Memoized social proof people from content
  const people = useMemo(() => content.SOCIAL_PROOF_PEOPLE, [content.SOCIAL_PROOF_PEOPLE]);

  // Memoized input handlers to prevent unnecessary re-renders
  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (nameError) setNameError('');
  }, [nameError]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  }, [emailError]);

  // Memoize form submission handler to prevent unnecessary re-renders
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
          source: variant === 'personal' ? 'hero-waitlist-personal' : 'hero-waitlist-enterprise'
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Open onboarding helper dialog
        setCaptured({ name, email });
        setIsDialogOpen(true);
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

  return (
    <LazyMotion features={domAnimation}>
      <div 
        className="min-h-screen bg-white overflow-hidden font-inter bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(https://finwsjdjo4tof45q.public.blob.vercel-storage.com/bg2.png)'
        }}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 z-20 h-full flex flex-col justify-center">
          {/* Real Lxera Logo (top-left) */}
          <div className="absolute top-6 left-4 sm:left-8 z-20">
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
                src="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/logo.svg"
                alt="LXERA logo"
                className="h-10 sm:h-12 lg:h-14 object-contain"
                draggable={false}
                width={160}
                height={48}
                loading="eager"
                decoding="sync"
              />
            </button>
          </div>
          
          {/* Login Button (top-right) */}
          <div className="absolute top-6 right-4 sm:right-8 z-20">
            <Button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-inter text-sm font-medium rounded-md transition-all duration-200 shadow-sm border-none"
            >
              Login
            </Button>
          </div>

          {/* Two-column layout for enterprise variant */}
          {variant === 'enterprise' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[70vh] mt-16 lg:mt-20">
              {/* Left Column - Content */}
              <m.div 
                ref={ref}
                className="text-left"
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? undefined : (isInView ? { opacity: 1, y: 0 } : {})}
                transition={shouldReduceMotion ? undefined : { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Main Headline */}
                <div className="mb-6">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight font-inter">
                    {content.HERO_CONTENT.title}
                  </h1>
                </div>
                
                {/* Subheadline */}
                <p className="max-w-2xl text-base text-white/80 mb-4 font-inter">
                  {content.HERO_CONTENT.subtitle}
                </p>
                
                <div className="flex justify-start mb-12">
                  <div className="inline-flex items-center gap-2 rounded-full bg-gray-200/90 border border-gray-300/50 px-4 py-2 shadow-sm">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <AnimatedShinyText 
                      className="text-sm font-inter m-0 max-w-none whitespace-nowrap !text-gray-800"
                      style={{ color: '#374151' }}
                    >
                      Full access free for 30 days. No credit card. Limited spots available.
                    </AnimatedShinyText>
                  </div>
                </div>
                
                {/* Inline Form */}
                <form onSubmit={handleSubmit} className="max-w-lg mb-8">
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder={content.HERO_CONTENT.formPlaceholders.name}
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                        className={`h-12 px-4 border rounded-md text-sm font-inter bg-white ${nameError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {nameError && (
                        <p className="text-red-500 text-xs mt-1 font-inter">{nameError}</p>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="email"
                        placeholder={content.HERO_CONTENT.formPlaceholders.email}
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        required
                        className={`h-12 px-4 border rounded-md text-sm font-inter bg-white ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {emailError && (
                        <p className="text-red-500 text-xs mt-1 font-inter">{emailError}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 px-6 bg-[#EBF9A6] hover:bg-[#DDF093] text-black font-medium rounded-md whitespace-nowrap font-inter shadow-none border-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <ClassicLoader />
                          Getting access…
                        </span>
                      ) : content.HERO_CONTENT.ctaButtonText}
                    </Button>
                  </div>
                </form>
                
                {/* Social Proof with Animated Tooltips */}
                <div className="flex items-center gap-3 mb-12">
                  <AnimatedTooltip items={people} />
                  <span className="text-sm text-white/70 font-inter ml-2">
                    {content.HERO_CONTENT.socialProof}
                  </span>
                </div>
              </m.div>

              {/* Right Column - Visual */}
              <m.div 
                className="hidden lg:block"
                initial={shouldReduceMotion ? undefined : { opacity: 0, x: 20 }}
                animate={shouldReduceMotion ? undefined : (isInView ? { opacity: 1, x: 0 } : {})}
                transition={shouldReduceMotion ? undefined : { duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
              >
                <div className="relative flex items-center justify-center">
                  <img
                    src="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/Group%20197.png"
                    alt="LXERA Platform Dashboard"
                    className="w-full h-auto object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </m.div>
            </div>
          ) : (
            // Original centered layout for personal variant
            <m.div 
              ref={ref}
              className="text-center"
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? undefined : (isInView ? { opacity: 1, y: 0 } : {})}
              transition={shouldReduceMotion ? undefined : { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Spacer to account for fixed logo height on small screens (increased) */}
              <div className="h-10 sm:h-16 lg:h-20" />
              
              {/* Main Headline */}
              <div className="mb-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white leading-tight font-inter">
                  {content.HERO_CONTENT.title}
                </h1>
              </div>
              
              {/* Subheadline */}
              <p className="mx-auto max-w-3xl text-base text-white/80 mb-4 font-inter">
                {content.HERO_CONTENT.subtitle}
              </p>
              
              <div className="flex justify-center mb-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-gray-200/90 border border-gray-300/50 px-4 py-2 shadow-sm">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <AnimatedShinyText 
                    className="text-sm font-inter m-0 max-w-none whitespace-nowrap !text-gray-800"
                    style={{ color: '#374151' }}
                  >
                    Full access free for 30 days. No credit card. Limited spots available.
                  </AnimatedShinyText>
                </div>
              </div>
              
              {/* Inline Form */}
              <form onSubmit={handleSubmit} className="mx-auto max-w-lg mb-8">
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder={content.HERO_CONTENT.formPlaceholders.name}
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className={`h-12 px-4 border rounded-md text-sm font-inter bg-white ${nameError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {nameError && (
                      <p className="text-red-500 text-xs mt-1 font-inter">{nameError}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder={content.HERO_CONTENT.formPlaceholders.email}
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      required
                      className={`h-12 px-4 border rounded-md text-sm font-inter bg-white ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {emailError && (
                      <p className="text-red-500 text-xs mt-1 font-inter">{emailError}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 px-6 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md whitespace-nowrap font-inter shadow-none border-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <ClassicLoader />
                        Getting access…
                      </span>
                    ) : content.HERO_CONTENT.ctaButtonText}
                  </Button>
                  </div>
              </form>
              
              {/* Social Proof with Animated Tooltips */}
              <div className="flex items-center justify-center gap-3 mb-12">
                <AnimatedTooltip items={people} />
                <span className="text-sm text-white/70 font-inter ml-2">
                  {content.HERO_CONTENT.socialProof}
                </span>
              </div>
            </m.div>
          )}
          
          {/* Mouse scroll indicator at bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/60">
              <rect x="1.5" y="1.5" width="21" height="33" rx="10.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="9" r="2" fill="currentColor" className="animate-bounce"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Onboarding helper dialog using Radix (brand-styled) */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 w-full h-full bg-black/50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-auto px-4 z-50">
            <div className="bg-white rounded-xl shadow-xl px-8 py-8">
              {!showOnboarding ? (
                <>
                  <div className="flex items-center justify-center w-14 h-14 mx-auto bg-[#7AE5C6]/20 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#029c55]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Dialog.Title className="text-xl font-semibold text-business-black text-center mt-4">
                    Thanks for your interest in LXERA!
                  </Dialog.Title>
                  <Dialog.Description className="mt-2 text-sm leading-relaxed text-center text-business-black/70">
                    Want faster onboarding? Answer a few questions and we’ll set things up for you.
                  </Dialog.Description>

                  <div className="items-center gap-3 mt-6 text-sm sm:flex">
                    <button
                      type="button"
                      className="w-full mt-2 p-2.5 flex-1 text-black bg-[#EBF9A6] hover:bg-[#DDF093] rounded-md outline-none ring-offset-2 ring-[#EBF9A6] focus:ring-2"
                      onClick={() => setShowOnboarding(true)}
                    >
                      Answer a few questions
                    </button>
                    <Dialog.Close asChild>
                      <button
                        className="w-full mt-2 p-2.5 flex-1 text-business-black rounded-md outline-none border border-gray-300 ring-offset-2 ring-[#7AE5C6] focus:ring-2"
                        aria-label="Close"
                      >
                        Maybe later
                      </button>
                    </Dialog.Close>
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Dialog.Title className="text-lg font-semibold text-business-black">Tell us more about yourself</Dialog.Title>
                    <button
                      className="text-sm text-gray-600 hover:text-black"
                      onClick={() => {
                        if (onboardingStep === 1) {
                          setShowOnboarding(false);
                        } else {
                          setOnboardingStep(onboardingStep - 1);
                        }
                      }}
                    >
                      {onboardingStep === 1 ? 'Close' : 'Back'}
                    </button>
                  </div>
                  <div className="mb-4">
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

                  {/* B2C Questions for Personal Variant */}
                  {variant === 'personal' && (
                    <>
                      {onboardingStep === 1 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">What's your current career stage?</div>
                          <Select value={b2cForm.career_stage} onValueChange={(v) => setB2cForm({ ...b2cForm, career_stage: v })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select your career stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {B2C_CAREER_STAGES.map((stage) => (
                                <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {onboardingStep === 2 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">Which industry do you work in?</div>
                          <Select value={b2cForm.industry} onValueChange={(v) => setB2cForm({ ...b2cForm, industry: v })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {B2C_INDUSTRIES.map((industry) => (
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
                              className="h-10"
                            />
                          )}
                        </div>
                      )}

                      {onboardingStep === 3 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">What company do you work for?</div>
                          <Input
                            type="text"
                            placeholder="Enter your company name"
                            value={b2cForm.current_company}
                            onChange={(e) => setB2cForm({ ...b2cForm, current_company: e.target.value })}
                            className="h-10"
                          />
                        </div>
                      )}

                      {onboardingStep === 4 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">Where are you located?</div>
                          <Select value={b2cForm.location_country} onValueChange={(v) => setB2cForm({ ...b2cForm, location_country: v })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select your country" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                              {B2C_COUNTRIES.map((country) => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {onboardingStep === 5 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">Which skills are you most interested in developing? <span className="text-gray-500">(Select up to 3)</span></div>
                          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                            {B2C_SKILLS.map((skill) => {
                              const checked = b2cForm.skills_interested.includes(skill);
                              const disabled = !checked && b2cForm.skills_interested.length >= 3;
                              return (
                                <label key={skill} className="flex items-center gap-2 py-1">
                                  <Checkbox
                                    checked={checked}
                                    disabled={disabled}
                                    onCheckedChange={(v) => {
                                      const isChecked = Boolean(v);
                                      setB2cForm((prev) => ({
                                        ...prev,
                                        skills_interested: isChecked
                                          ? [...prev.skills_interested, skill]
                                          : prev.skills_interested.filter((x) => x !== skill),
                                      }));
                                    }}
                                  />
                                  <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-800'}`}>{skill}</span>
                                </label>
                              );
                            })}
                          </div>
                          {b2cForm.skills_interested.includes('Other') && (
                            <Input
                              type="text"
                              placeholder="Please specify other skills"
                              value={b2cForm.skills_other}
                              onChange={(e) => setB2cForm({ ...b2cForm, skills_other: e.target.value })}
                              className="h-10"
                            />
                          )}
                        </div>
                      )}

                      {onboardingStep === 6 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">What's driving your interest in skill development right now?</div>
                          <Select value={b2cForm.motivation} onValueChange={(v) => setB2cForm({ ...b2cForm, motivation: v })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select your primary motivation" />
                            </SelectTrigger>
                            <SelectContent>
                              {B2C_MOTIVATIONS.map((motivation) => (
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
                              className="h-10"
                            />
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* B2B Questions for Enterprise Variant */}
                  {variant === 'enterprise' && (
                    <>
                      {onboardingStep === 1 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">What's your current role?</div>
                          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select your current role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((r) => (
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
                              className="h-10"
                            />
                          )}
                        </div>
                      )}

                      {onboardingStep === 2 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">How big is your team?</div>
                          <Select value={form.teamSize} onValueChange={(v) => setForm({ ...form, teamSize: v })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select team size" />
                            </SelectTrigger>
                            <SelectContent>
                              {TEAM_SIZE_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {/* Auto-advance handled by useEffect */}
                        </div>
                      )}

                      {onboardingStep === 3 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">What are you hoping to achieve with LXERA? <span className="text-gray-500">(Select all that apply)</span></div>
                      <div className="grid grid-cols-1 gap-2">
                        {USE_CASE_OPTIONS.map((option) => {
                          const checked = form.useCases.includes(option);
                          return (
                            <label key={option} className="flex items-center gap-2 py-1">
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  const isChecked = Boolean(v);
                                  setForm((prev) => ({
                                    ...prev,
                                    useCases: isChecked
                                      ? [...prev.useCases, option]
                                      : prev.useCases.filter((x) => x !== option),
                                  }));
                                }}
                              />
                              <span className="text-sm text-gray-800">{option}</span>
                            </label>
                          );
                        })}
                      </div>
                      {form.useCases.includes('Other') && (
                        <div className="mt-3">
                          <Input
                            placeholder="Please specify..."
                            value={form.useCasesOther}
                            onChange={(e) => setForm(prev => ({ ...prev, useCasesOther: e.target.value }))}
                            className="text-sm"
                          />
                        </div>
                      )}
                          {form.useCases.length > 0 && (
                            <div className="flex justify-end mt-4">
                              <Button 
                                onClick={() => setOnboardingStep(4)}
                                className="bg-business-black text-white hover:bg-business-black/90 px-6 py-2"
                              >
                                Continue
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {onboardingStep === 4 && (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-700 font-medium">How did you discover us?</div>
                          <Select value={form.heardAbout} onValueChange={(v) => setForm({ ...form, heardAbout: v })}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                        <SelectContent>
                          {HEARD_ABOUT_OPTIONS.map((h) => (
                            <SelectItem key={h} value={h}>{h}</SelectItem>
                          ))}
                            </SelectContent>
                          </Select>
                          {/* Auto-finish handled by useEffect */}
                        </div>
                      )}
                    </>
                  )}

                  {/* Manual Navigation for B2C */}
                  {variant === 'personal' && (
                    <div className="flex justify-between mt-6">
                      {onboardingStep > 1 && (
                        <Button
                          variant="outline"
                          onClick={() => setOnboardingStep(onboardingStep - 1)}
                          className="px-6"
                        >
                          Back
                        </Button>
                      )}
                      
                      <div className="flex-1" />
                      
                      {onboardingStep < 6 ? (
                        <Button
                          onClick={() => setOnboardingStep(onboardingStep + 1)}
                          className="bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black px-6"
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
                      ) : (
                        <Button
                          onClick={() => {
                            finishedRef.current = false;
                            setOnboardingStep(6);
                          }}
                          className="bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black px-6"
                          disabled={!b2cForm.motivation}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </LazyMotion>
  );
});

WaitingListHero.displayName = 'WaitingListHero';
