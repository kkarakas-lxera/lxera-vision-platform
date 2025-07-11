import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Mail, Sparkles, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartEmailCaptureProps {
  source: string;
  variant?: 'default' | 'mobile' | 'minimal';
  buttonText?: string;
  placeholder?: string;
  onSuccess?: (email: string, name: string) => void;
  className?: string;
  initialEmail?: string;
  autoSubmit?: boolean;
  /**
   * Whether to enforce company-domain email validation (blocks gmail, yahoo, etc.).
   * Defaults to true.  For the /login early-access signup flow we disable this.
   */
  requireCompanyEmail?: boolean;
}

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

const SmartEmailCapture: React.FC<SmartEmailCaptureProps> = ({
  source,
  variant = 'default',
  buttonText = 'Get Early Access',
  placeholder = 'Enter your work email',
  onSuccess,
  className = '',
  initialEmail = '',
  autoSubmit = false,
  requireCompanyEmail = true
}) => {
  const [isExpanded, setIsExpanded] = useState(!!initialEmail);
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const hasAutoSubmitted = useRef(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    // Validate company email domain (optional)
    if (requireCompanyEmail && !isCompanyEmail(email)) {
      toast({
        title: 'Work Email Required',
        description: 'Please use your company email address instead of a personal email',
        variant: 'destructive'
      });
      return;
    }

    // Validate name
    if (!name || name.trim().length < 2) {
      toast({
        title: 'Name Required',
        description: 'Please enter your full name',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await supabase.functions.invoke('capture-email', {
        body: {
          email,
          name: name.trim(),
          source,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
        }
      });

      if (response.error) throw response.error;

      const data = response.data as any;

      if (data.success) {
        setSubmitted(true);
        setIsExpanded(false);
        
        toast({
          title: 'Check Your Email!',
          description: 'We sent you a magic link to complete your profile.',
        });

        onSuccess?.(email, name.trim());
      }
    } catch (error: any) {
      console.error('Error capturing email:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [email, name, source, onSuccess, requireCompanyEmail]);

  useEffect(() => {
    if (isExpanded && emailRef.current) {
      emailRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (autoSubmit && initialEmail && !submitted && !loading && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSubmit, initialEmail, submitted, loading, handleSubmit]);

  const handleClickOutside = (e: MouseEvent) => {
    if (isExpanded && !(e.target as Element).closest('.smart-email-capture')) {
      setIsExpanded(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isExpanded]);

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">Check your email!</span>
      </motion.div>
    );
  }

  // Minimal variant - just an underlined text that expands
  if (variant === 'minimal') {
    return (
      <div className={`inline-block ${className}`}>
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.button
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(true)}
              className="text-future-green hover:text-future-green/80 underline underline-offset-4 font-medium transition-colors"
            >
              {buttonText}
            </motion.button>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-2"
            >
              <Input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="w-64"
                disabled={loading}
                inputMode="email"
                autoComplete="email"
              />
              <Input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-64"
                disabled={loading}
                autoComplete="name"
              />
              <Button type="submit" disabled={loading} size="sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Default and mobile variants - button that transforms
  return (
    <div className={`smart-email-capture relative ${className}`}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className={`
                bg-future-green text-business-black hover:bg-future-green/90 font-medium 
                ${variant === 'mobile' ? 'h-12 text-base w-full' : 'h-11 px-8'}
                transition-all duration-300 transform
                ${isHovered ? 'scale-105 shadow-lg' : ''}
              `}
            >
              <AnimatePresence mode="wait">
                {isHovered ? (
                  <motion.div
                    key="hover"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{buttonText}</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="normal"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    {buttonText}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            {isHovered && !variant && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap"
              >
                Click to enter your email
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onSubmit={handleSubmit}
            className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-4 ${variant === 'mobile' ? 'w-full' : 'w-80'}`}
          >
            <div className="space-y-3">
              <div className="text-center">
                <h3 className="font-semibold text-lg text-business-black">Get Early Access</h3>
                <p className="text-sm text-gray-600 mt-1">Enter your work email and name to continue</p>
              </div>
              
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    className={`
                      w-full border-gray-300 pl-10
                      ${variant === 'mobile' ? 'h-12 text-base' : 'h-11'}
                      transition-all duration-300
                      bg-white/95
                    `}
                    disabled={loading}
                    inputMode="email"
                    autoComplete="email"
                    onBlur={() => {
                      if (!email && !name) {
                        setTimeout(() => setIsExpanded(false), 200);
                      }
                    }}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <div className="relative">
                  <Input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className={`
                      w-full border-gray-300 pl-10
                      ${variant === 'mobile' ? 'h-12 text-base' : 'h-11'}
                      transition-all duration-300
                      bg-white/95
                    `}
                    disabled={loading}
                    autoComplete="name"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className={`
                    w-full bg-future-green text-business-black hover:bg-future-green/90 font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300
                    ${variant === 'mobile' ? 'h-12 text-base' : 'h-11'}
                    flex items-center justify-center whitespace-nowrap
                  `}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin flex-shrink-0" />
                      <span>Sending...</span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span>Get Access</span>
                      <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                    </span>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-center text-gray-500">
                Work email required • No spam, ever
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartEmailCapture;