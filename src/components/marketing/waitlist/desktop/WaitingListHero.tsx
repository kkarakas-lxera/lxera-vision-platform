import React, { useEffect, useRef, useState, memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../ui/button';
import { AnimatedShinyText } from '../../../ui/AnimatedShinyText';
import { Input } from '../../../ui/input';
import { useToast } from '../../../ui/use-toast';
import * as Dialog from '@radix-ui/react-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../ui/select';
import { Checkbox } from '../../../ui/checkbox';
import ClassicLoader from '../../../ui/ClassicLoader';
import { WavyBackground } from '../../../ui/wavy-background';
import { AnimatedTooltip } from '../../../ui/animated-tooltip';
import { HERO_CONTENT } from '../shared/content';
import { validateWaitlistForm } from '../../../../utils/waitlistValidation';

// Memoized colors array for WavyBackground
const wavyColors = ["#7AE5C6", "#5EDBBA", "#4ECAA8", "#3EB896", "#2EA784"];

export const WaitingListHero: React.FC = memo(() => {
  const { toast } = useToast();
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
    heardAbout: '',
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

    // Step 3 → 4: at least one use case selected
    if (onboardingStep === 3 && form.useCases.length > 0) {
      setOnboardingStep(4);
      return;
    }

    // Step 4 → finish: heard about selected
    if (onboardingStep === 4 && form.heardAbout && !finishedRef.current) {
      finishedRef.current = true;
      setShowOnboarding(false);
      setIsDialogOpen(false);
      toast({ title: 'Thanks!', description: 'Your preferences are saved (preview).' });
    }
  }, [showOnboarding, onboardingStep, form.role, form.roleOther, form.teamSize, form.useCases.length, form.heardAbout]);

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
  ], []);
  const HEARD_ABOUT_OPTIONS = useMemo(() => ['LinkedIn', 'Google Search', 'Colleague or Friend', 'Conference or Event', 'Blog or Article', 'Social Media', 'Other'], []);

  // Memoized static data to prevent recreation on every render
  const people = useMemo(() => [
    {
      id: 1,
      name: "Sarah Chen",
      designation: "Learning Director",
      image: "/avatars/avatar1.svg",
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      designation: "HR Manager",
      image: "/avatars/avatar2.svg",
    },
    {
      id: 3,
      name: "Emily Johnson",
      designation: "Innovation Lead",
      image: "/avatars/avatar3.svg",
    },
    {
      id: 4,
      name: "David Park",
      designation: "VP Operations",
      image: "/avatars/avatar1.svg",
    },
    {
      id: 5,
      name: "Lisa Thompson",
      designation: "CHRO",
      image: "/avatars/avatar2.svg",
    },
  ], []);

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
    const { nameValidation, emailValidation, isFormValid } = validateWaitlistForm(name, email);
    
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
          source: 'hero-waitlist'
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
    <>
    <WavyBackground
      containerClassName="min-h-screen bg-white overflow-hidden font-inter"
      colors={wavyColors}
      waveWidth={30}
      backgroundFill="white"
      blur={15}
      speed="slow"
      waveOpacity={0.3}
    >
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 z-20 h-full flex flex-col justify-center">
          {/* Real Lxera Logo (top-left) */}
          <div className="absolute top-6 left-4 sm:left-8 z-20">
            <img
              src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png"
              alt="LXERA logo"
              className="h-10 sm:h-12 lg:h-14 object-contain"
              draggable={false}
              width={160}
              height={48}
              loading="eager"
              decoding="sync"
            />
          </div>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
          {/* Spacer to account for fixed logo height on small screens (increased) */}
          <div className="h-10 sm:h-16 lg:h-20" />
          
          {/* Main Headline */}
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-black leading-tight font-inter">
              The First Platform for Learning Experience & Innovation
            </h1>
          </div>
          
          {/* Subheadline */}
          <p className="mx-auto max-w-3xl text-base text-gray-700 mb-4 font-inter">
            Build role-based training, power innovation, and prove ROI — all in one platform.
          </p>
          
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 border border-orange-200 px-4 py-2 shadow-sm">
              <span role="img" aria-label="alarm clock" className="text-orange-500">⏰</span>
              <AnimatedShinyText className="text-sm font-inter m-0 max-w-none whitespace-nowrap text-business-black">
                Full access FREE for 30 days. No credit card. Limited spots available.
              </AnimatedShinyText>
            </div>
          </div>
          
          {/* Inline Form */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg mb-8">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={HERO_CONTENT.formPlaceholders.name}
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
                  placeholder="Enter your work email"
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
                ) : 'Get Early Access'}
              </Button>
            </div>
          </form>
          
          {/* Social Proof with Animated Tooltips */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <AnimatedTooltip items={people} />
            <span className="text-sm text-gray-600 font-inter ml-2">
              Join 100+ people who have already signed up.
            </span>
          </div>
          
          {/* Mouse scroll indicator at bottom */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
            <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
              <rect x="1.5" y="1.5" width="21" height="33" rx="10.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="9" r="2" fill="currentColor" className="animate-bounce"/>
            </svg>
          </div>
        </motion.div>
        </div>
    </WavyBackground>

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
                      className="w-full mt-2 p-2.5 flex-1 text-black bg-[#7AE5C6] hover:bg-[#6BD4B5] rounded-md outline-none ring-offset-2 ring-[#7AE5C6] focus:ring-2"
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
                        style={{ width: `${(onboardingStep / 4) * 100}%` }}
                      />
                    </div>
                  </div>

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
                      <Button
                        className="w-full bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black"
                        disabled={!form.role || (form.role === 'Other' && !form.roleOther)}
                        onClick={() => setOnboardingStep(2)}
                      >
                        Continue
                      </Button>
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
                      {/* Auto-advance handled by useEffect */}
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
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
});

WaitingListHero.displayName = 'WaitingListHero';
