import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, Mail, Calendar, Building2, Users, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { demoCaptureService } from '@/services/demoCaptureService';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressiveDemoCaptureProps {
  source: string;
  variant?: 'default' | 'mobile' | 'minimal';
  buttonText?: string;
  onSuccess?: (email: string) => void;
  className?: string;
}

const ProgressiveDemoCapture: React.FC<ProgressiveDemoCaptureProps> = ({
  source,
  variant = 'default',
  buttonText = 'Get a Demo',
  onSuccess,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState(0); // 0: button, 1: email, 2: details, 3: success
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    companySize: ''
  });
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const companySizeOptions = [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-500', label: '201-500' },
    { value: '501+', label: '501+' }
  ];

  useEffect(() => {
    // Auto-save to localStorage
    if (formData.email) {
      localStorage.setItem('demo_progress', JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    // Restore from localStorage
    const saved = localStorage.getItem('demo_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(parsed);
      if (parsed.email && !parsed.name) {
        setCurrentStep(2);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-focus inputs
    if (currentStep === 1 && emailRef.current) {
      emailRef.current.focus();
    } else if (currentStep === 2 && nameRef.current) {
      nameRef.current.focus();
    }
  }, [currentStep]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid work email',
        variant: 'destructive'
      });
      return;
    }

    // Auto-detect company from email domain
    const domain = formData.email.split('@')[1];
    const companyName = domain.split('.')[0];
    setFormData(prev => ({ 
      ...prev, 
      company: prev.company || companyName.charAt(0).toUpperCase() + companyName.slice(1)
    }));

    // Save demo capture with email only (step 1)
    try {
      await demoCaptureService.captureDemo({
        email: formData.email,
        source,
        stepCompleted: 1,
        utmSource: new URLSearchParams(window.location.search).get('utm_source'),
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign')
      });

      // Move to next step
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Error capturing email:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company || !formData.companySize) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Split name into first and last for email
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      // Update demo capture with full details (step 2)
      await demoCaptureService.captureDemo({
        email: formData.email,
        name: formData.name,
        company: formData.company,
        companySize: formData.companySize,
        source,
        stepCompleted: 2,
        utmSource: new URLSearchParams(window.location.search).get('utm_source'),
        utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
        utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign')
      });

      // Send demo scheduling email
      const emailResult = await supabase.functions.invoke('send-demo-email', {
        body: {
          email: formData.email,
          firstName,
          lastName,
          company: formData.company,
          companySize: formData.companySize
        }
      });

      if (emailResult.error) {
        console.error('Failed to send demo email:', emailResult.error);
        // Continue anyway - the request was saved
      }
      
      // Clear localStorage
      localStorage.removeItem('demo_progress');
      
      // Show success
      setCurrentStep(3);
      
      toast({
        title: 'Check Your Email!',
        description: 'We sent you a link to schedule your demo.',
      });

      onSuccess?.(formData.email);
    } catch (error: any) {
      console.error('Demo request submission failed:', error);
      toast({
        title: 'Submission Failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (currentStep > 0 && !(e.target as Element).closest('.progressive-demo-capture')) {
      // Don't close if we have data
      if (!formData.email) {
        setCurrentStep(0);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [currentStep, formData.email]);

  if (currentStep === 3) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200"
      >
        <Check className="w-5 h-5" />
        <span className="font-medium">Check your email for scheduling!</span>
      </motion.div>
    );
  }

  // Minimal variant - ultra compact
  if (variant === 'minimal') {
    return (
      <div className={`progressive-demo-capture inline-block ${className}`}>
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.button
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCurrentStep(1)}
              className="text-business-black hover:text-business-black/70 underline underline-offset-4 font-medium transition-colors decoration-2 decoration-business-black/20 hover:decoration-business-black/40 min-h-[48px] px-3 py-2 touch-target"
            >
              {buttonText}
            </motion.button>
          )}
          
          {currentStep === 1 && (
            <motion.form
              key="email"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              onSubmit={handleEmailSubmit}
              className="flex flex-col sm:flex-row gap-3 sm:gap-2"
            >
              <Input
                ref={emailRef}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Work email"
                className="w-full sm:w-48 h-12 sm:h-10 text-base sm:text-sm"
                inputMode="email"
                autoComplete="email"
              />
              <Button type="submit" size="sm" className="w-full sm:w-auto h-12 sm:h-10">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.form>
          )}
          
          {currentStep === 2 && (
            <motion.form
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleDetailsSubmit}
              className="flex flex-col sm:flex-row gap-3 sm:gap-2"
            >
              <Input
                ref={nameRef}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Full name"
                className="w-full sm:w-32 h-12 sm:h-10 text-base sm:text-sm"
              />
              <Input
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company"
                className="w-full sm:w-32 h-12 sm:h-10 text-base sm:text-sm"
              />
              <Select value={formData.companySize} onValueChange={(v) => setFormData(prev => ({ ...prev, companySize: v }))}>
                <SelectTrigger className="w-full sm:w-24 h-12 sm:h-10 text-base sm:text-sm">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" size="sm" disabled={loading} className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Demo'}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default and mobile variants - elegant and compact
  return (
    <div className={`progressive-demo-capture relative ${className}`}>
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Button
              onClick={() => setCurrentStep(1)}
              className={cn(
                "bg-white text-business-black hover:bg-gray-50 font-medium shadow-lg hover:shadow-xl border-2 border-business-black/20 hover:border-business-black/40",
                variant === 'mobile' ? 'h-12 text-base w-full rounded-full' : 'h-11 px-8 rounded-full',
                "transition-all duration-300 transform relative overflow-hidden",
                isHovered && "scale-105"
              )}
            >
              {isHovered && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  exit={{ width: 0 }}
                  className="absolute inset-0 bg-future-green/10"
                  transition={{ duration: 0.3 }}
                />
              )}
              <AnimatePresence mode="wait">
                {isHovered ? (
                  <motion.div
                    key="hover"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 relative z-10"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{buttonText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.span
                    key="normal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative z-10"
                  >
                    {buttonText}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        )}
        
        {currentStep === 1 && (
          <motion.form
            key="email"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onSubmit={handleEmailSubmit}
            className={cn(
              "bg-white rounded-2xl shadow-xl border border-gray-200 p-4",
              variant === 'mobile' ? 'w-full' : 'w-80'
            )}
          >
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="font-semibold text-lg text-business-black">Let's get started</h3>
                <p className="text-sm text-gray-600 mt-1">Enter your work email to continue</p>
              </div>
              
              <div className="space-y-3">
                <Input
                  ref={emailRef}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your@company.com"
                  className={cn(
                    "w-full border-gray-300",
                    variant === 'mobile' ? 'h-12 text-base' : 'h-11'
                  )}
                  inputMode="email"
                  autoComplete="email"
                />
                
                <Button 
                  type="submit" 
                  className={cn(
                    "w-full bg-future-green text-business-black hover:bg-future-green/90 font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300",
                    variant === 'mobile' ? 'h-12 text-base' : 'h-11'
                  )}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-xs text-center text-gray-500">
                No spam, ever. Just a quick demo.
              </p>
            </div>
          </motion.form>
        )}
        
        {currentStep === 2 && (
          <motion.form
            key="details"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onSubmit={handleDetailsSubmit}
            className={cn(
              "bg-white rounded-2xl shadow-xl border border-gray-200 p-4",
              variant === 'mobile' ? 'w-full' : 'w-96'
            )}
          >
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="font-semibold text-lg text-business-black">Almost there!</h3>
                <p className="text-sm text-gray-600 mt-1">Just 3 quick details</p>
                <div className="flex justify-center gap-1 mt-2">
                  <div className="w-8 h-1 bg-future-green rounded-full" />
                  <div className="w-8 h-1 bg-future-green rounded-full" />
                  <div className="w-8 h-1 bg-gray-300 rounded-full" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    ref={nameRef}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                    className={cn(
                      "w-full border-gray-300 pl-10",
                      variant === 'mobile' ? 'h-12 text-base' : 'h-11'
                    )}
                    autoComplete="name"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <div className="relative">
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Company name"
                    className={cn(
                      "w-full border-gray-300 pl-10",
                      variant === 'mobile' ? 'h-12 text-base' : 'h-11'
                    )}
                    autoComplete="organization"
                  />
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <div className="relative">
                  <Select value={formData.companySize} onValueChange={(v) => setFormData(prev => ({ ...prev, companySize: v }))}>
                    <SelectTrigger className={cn(
                      "w-full border-gray-300 pl-10",
                      variant === 'mobile' ? 'h-12 text-base' : 'h-11'
                    )}>
                      <SelectValue placeholder="Team size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label} employees
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className={cn(
                    "w-full bg-future-green text-business-black hover:bg-future-green/90 font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
                    variant === 'mobile' ? 'h-12 text-base' : 'h-11'
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      Schedule Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-center text-gray-500">
                You'll receive a calendar link via email
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressiveDemoCapture;