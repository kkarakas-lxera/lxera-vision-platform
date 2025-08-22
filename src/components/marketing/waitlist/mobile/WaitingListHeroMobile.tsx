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
import { WavyBackgroundMobile } from './WavyBackgroundMobile';
import { AnimatedTooltip } from '../../../ui/animated-tooltip';
import { HERO_CONTENT, SOCIAL_PROOF_PEOPLE } from '../shared/content';

export const WaitingListHeroMobile: React.FC = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCaptured({ name, email });
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, toast]);

  return (
    <>
      <WavyBackgroundMobile
        containerClassName="min-h-screen bg-white overflow-hidden font-inter"
        colors={["#7AE5C6", "#5EDBBA", "#4ECAA8", "#3EB896", "#2EA784"]}
        waveWidth={50}
        backgroundFill="white"
        blur={10}
        speed="slow"
        waveOpacity={0.3}
      >
        <div className="relative z-10 px-4 py-6 flex flex-col min-h-screen">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/lovable-uploads/ed8138a6-1489-4140-8b44-0003698e8154.png"
              alt="LXERA logo"
              className="h-8 object-contain"
              draggable={false}
              loading="eager"
              decoding="sync"
            />
          </div>

          {/* Main content centered */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            {/* Headline */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-3xl font-medium text-black leading-tight mb-4 px-2">
                {HERO_CONTENT.title}
              </h1>
              <p className="text-base text-gray-700 mb-6 px-4 leading-relaxed">
                {HERO_CONTENT.subtitle}
              </p>
              
              {/* CTA Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 border border-orange-200 px-4 py-2 shadow-sm">
                  <span role="img" aria-label="alarm clock" className="text-orange-500">⏰</span>
                  <AnimatedShinyText className="text-sm font-inter m-0 max-w-none whitespace-nowrap">
                    {HERO_CONTENT.ctaBadge}
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
              <Input
                type="text"
                placeholder={HERO_CONTENT.formPlaceholders.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-md text-base font-inter bg-white"
              />
              <Input
                type="email"
                placeholder={HERO_CONTENT.formPlaceholders.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-md text-base font-inter bg-white"
              />
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md font-inter shadow-none border-none"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <ClassicLoader />
                    Getting access…
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
              <AnimatedTooltip items={SOCIAL_PROOF_PEOPLE} className="justify-center" />
              <span className="text-sm text-gray-600 font-inter text-center">
                {HERO_CONTENT.socialProof}
              </span>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <div className="flex justify-center pb-6">
            <svg width="20" height="32" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
              <rect x="1.5" y="1.5" width="21" height="33" rx="10.5" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="12" cy="9" r="2" fill="currentColor" className="animate-bounce"/>
            </svg>
          </div>
        </div>
      </WavyBackgroundMobile>

      {/* Mobile-optimized onboarding dialog */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 w-full h-full bg-black/50 z-50" />
          <Dialog.Content className="fixed top-4 left-4 right-4 bottom-4 z-50 max-h-[calc(100vh-2rem)] overflow-auto">
            <div className="bg-white rounded-xl shadow-xl p-6 h-full flex flex-col">
              {!showOnboarding ? (
                <>
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-[#7AE5C6]/20 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#029c55]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Dialog.Title className="text-xl font-semibold text-black text-center mb-2">
                    Thanks for your interest in LXERA!
                  </Dialog.Title>
                  <Dialog.Description className="text-sm leading-relaxed text-center text-gray-700 mb-6 flex-1">
                    Want faster onboarding? Answer a few questions and we'll set things up for you.
                  </Dialog.Description>

                  <div className="space-y-3">
                    <button
                      className="w-full p-3 text-black bg-[#7AE5C6] hover:bg-[#6BD4B5] rounded-md font-medium"
                      onClick={() => setShowOnboarding(true)}
                    >
                      Answer a few questions
                    </button>
                    <Dialog.Close asChild>
                      <button className="w-full p-3 text-black rounded-md border border-gray-300 font-medium">
                        Maybe later
                      </button>
                    </Dialog.Close>
                  </div>
                </>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-lg font-semibold text-black">Tell us more</Dialog.Title>
                    <button
                      className="text-sm text-gray-600 hover:text-black p-2"
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

                  {/* Mobile-optimized onboarding steps */}
                  <div className="flex-1 overflow-auto">
                    {onboardingStep === 1 && (
                      <div className="space-y-4">
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
                      </div>
                    )}
                    
                    {/* Add other onboarding steps here */}
                  </div>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};