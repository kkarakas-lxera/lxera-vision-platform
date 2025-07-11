import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, Mail, Calendar, Building2, Users, Check, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { demoCaptureService } from '@/services/demoCaptureService';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Common personal/consumer email domains to block
const BLOCKED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'me.com', 'protonmail.com', 'tutanota.com', 'yandex.com',
  'mail.com', 'gmx.com', 'zoho.com', 'fastmail.com', 'hushmail.com',
  'guerrillamail.com', 'mailinator.com', '10minutemail.com', 'tempmail.org',
  'throwaway.email', 'maildrop.cc', 'sharklasers.com', 'grr.la'
];

const isCompanyEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return !BLOCKED_DOMAINS.includes(domain);
};

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
  const [isExpanded, setIsExpanded] = useState(false); // Controls UI expansion state
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
    // Restore from localStorage but keep collapsed initially
    const saved = localStorage.getItem('demo_progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(parsed);
      // Keep step at 1 since we collect everything in one form now
      if (parsed.email) {
        setCurrentStep(1);
      }
    }
  }, []);

  useEffect(() => {
    // Auto-focus the first empty input when expanded
    if (isExpanded && currentStep === 1) {
      if (!formData.email && emailRef.current) {
        emailRef.current.focus();
      } else if (formData.email && !formData.name && nameRef.current) {
        nameRef.current.focus();
      }
    }
  }, [currentStep, isExpanded, formData.email, formData.name]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid work email',
        variant: 'destructive'
      });
      return;
    }

    // Validate company email domain
    if (!isCompanyEmail(formData.email)) {
      toast({
        title: 'Work Email Required',
        description: 'Please use your company email address instead of a personal email',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.name || formData.name.trim().length < 2) {
      toast({
        title: 'Name Required',
        description: 'Please enter your full name',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.companySize) {
      toast({
        title: 'Company Size Required',
        description: 'Please select your company size',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Auto-detect company from email domain if not provided
      const domain = formData.email.split('@')[1];
      const companyName = domain.split('.')[0];
      const company = formData.company || companyName.charAt(0).toUpperCase() + companyName.slice(1);
      
      // Split name into first and last for email
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];

      // Save complete demo capture
      await demoCaptureService.captureDemo({
        email: formData.email,
        name: formData.name.trim(),
        company,
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
          company,
          companySize: formData.companySize
        }
      });

      if (emailResult.error) {
        console.error('Failed to send demo email:', emailResult.error);
        // Continue anyway - the request was saved
      }
      
      // Clear localStorage
      localStorage.removeItem('demo_progress');
      
      // Show success and collapse after delay
      setCurrentStep(3);
      setIsExpanded(false);
      
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
      
      // Show success and collapse after delay
      setCurrentStep(3);
      setIsExpanded(false);
      
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
    const target = e.target as Element;
    if (isExpanded && 
        !target.closest('.progressive-demo-capture') && 
        !target.closest('[role="option"]') && // Don't close on Select options
        !target.closest('[role="listbox"]') && // Don't close on Select listbox
        !target.closest('[data-radix-popper-content-wrapper]') && // Don't close on Radix popper
        !target.closest('[data-state="open"]') && // Don't close on open select
        !target.closest('[data-radix-collection-item]') && // Don't close on select items
        !target.closest('.select-content') && // Don't close on select content
        !target.closest('[data-radix-select-content]')) { // Don't close on radix select content
      // Collapse but keep progress
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isExpanded]);

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
      <div className={`progressive-demo-capture inline-block relative isolate ${className}`}> 
      <Dialog>
        <DialogTrigger asChild>
          <button
            onMouseEnter={()=>setIsHovered(true)}
            onMouseLeave={()=>setIsHovered(false)}
            className={cn(
              "bg-white text-business-black hover:bg-gray-50 font-medium shadow-lg hover:shadow-xl border-2 border-business-black/20 hover:border-business-black/40",
              "h-11 px-8 rounded-full",
              "transition-all duration-300 transform relative overflow-hidden",
              isHovered && 'scale-105'
            )}
          >
            {formData.email ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  <span>Continue Demo Request</span>
                </span>
                {formData.name && (
                  <span className="text-xs text-gray-500">({formData.name.split(' ')[0]})</span>
                )}
              </>
            ) : (
              buttonText
            )}
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-sm w-[90vw] rounded-2xl p-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="mb-3">
            <h3 className="font-semibold text-sm text-business-black">Complete Your Demo Request</h3>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full ${formData.email ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${formData.name ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${formData.companySize ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <span className="text-xs text-gray-500">Step 1 of 1</span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <Input
              ref={emailRef}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Work email"
              className="w-full h-12 text-base border-gray-300 focus:border-future-green focus:ring-future-green focus:ring-opacity-50"
              inputMode="email"
              autoComplete="email"
            />
            <Input
              ref={nameRef}
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
              className="w-full h-12 text-base border-gray-300 focus:border-future-green focus:ring-future-green focus:ring-opacity-50"
              autoComplete="name"
            />
            <Select 
              value={formData.companySize} 
              onValueChange={(v) => {
                setFormData(prev => ({ ...prev, companySize: v }));
              }}
            >
              <SelectTrigger className="w-full h-12 text-base bg-white/95 border-gray-300 px-3 focus:border-future-green focus:ring-future-green focus:ring-opacity-50 hover:border-gray-400">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Select number of employees" />
                </div>
              </SelectTrigger>
              <SelectContent className="select-content bg-white border-gray-300 shadow-lg">
                {companySizeOptions.map(opt => (
                  <SelectItem 
                    key={opt.value} 
                    value={opt.value}
                    className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                  >
                    {opt.label} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              type="submit" 
              disabled={loading || !formData.email || !formData.name || !formData.companySize}
              className="w-full h-12 bg-future-green text-business-black hover:bg-future-green/90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Demo'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    );
  }

  // Default and mobile variants - elegant and compact
  return (
    <div className={`progressive-demo-capture inline-block relative isolate ${className}`}>
      <Dialog open={isExpanded} onOpenChange={(open)=>{
        if (!open) {
          // Only close if not interacting with select
          const activeElement = document.activeElement;
          if (!activeElement?.closest('[data-radix-select-content]') && 
              !activeElement?.closest('.select-content') &&
              !activeElement?.closest('[role="listbox"]')) {
            setIsExpanded(false);
          }
        } else {
          setIsExpanded(true);
          if(currentStep===0){setCurrentStep(1);}
        }
      }}>
        <DialogTrigger asChild>
          <Button
            onMouseEnter={()=>setIsHovered(true)}
            onMouseLeave={()=>setIsHovered(false)}
            className={cn(
              "bg-white text-business-black hover:bg-gray-50 font-medium shadow-lg hover:shadow-xl border-2 border-business-black/20 hover:border-business-black/40",
              variant==='mobile'?'h-12 text-base w-full rounded-full':'h-11 px-8 rounded-full',
              "transition-all duration-300 transform relative overflow-hidden",
              isHovered && 'scale-105',
              className // Apply custom className last to allow overrides
            )}
          >
            {formData.email ? (
              <>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  <span>Continue Demo Request</span>
                </span>
                {formData.name && (
                  <span className="text-xs text-gray-500">({formData.name.split(' ')[0]})</span>
                )}
              </>
            ) : (
              buttonText
            )}
          </Button>
        </DialogTrigger>

        <DialogContent className="w-[90vw] max-w-md rounded-2xl p-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
          {/* Same form as minimal variant */}
          <div className="mb-3">
            <h3 className="font-semibold text-sm text-business-black">Complete Your Demo Request</h3>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <Input
              ref={emailRef}
              type="email"
              value={formData.email}
              onChange={(e)=>setFormData(prev=>({...prev,email:e.target.value}))}
              placeholder="Work email"
              className="w-full h-12 text-base border-gray-300 focus:border-future-green focus:ring-future-green focus:ring-opacity-50"
              autoComplete="email" 
              inputMode="email"
            />
            <Input
              ref={nameRef}
              value={formData.name}
              onChange={(e)=>setFormData(prev=>({...prev,name:e.target.value}))}
              placeholder="Your full name"
              className="w-full h-12 text-base border-gray-300 focus:border-future-green focus:ring-future-green focus:ring-opacity-50"
              autoComplete="name"
            />
            <Select 
              value={formData.companySize} 
              onValueChange={(v)=>{
                setFormData(prev=>({...prev,companySize:v}));
              }}
            >
              <SelectTrigger className="w-full h-12 text-base bg-white/95 border-gray-300 px-3 focus:border-future-green focus:ring-future-green focus:ring-opacity-50 hover:border-gray-400">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <SelectValue placeholder="Select number of employees" />
                </div>
              </SelectTrigger>
              <SelectContent className="select-content bg-white border-gray-300 shadow-lg">
                {companySizeOptions.map(opt=>(
                  <SelectItem 
                    key={opt.value} 
                    value={opt.value}
                    className="hover:bg-gray-50 focus:bg-gray-50 cursor-pointer"
                  >
                    {opt.label} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading||!formData.email||!formData.name||!formData.companySize} className="w-full h-12 bg-future-green text-business-black hover:bg-future-green/90">
              {loading?<Loader2 className="w-4 h-4 animate-spin"/>:'Get Demo'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProgressiveDemoCapture;