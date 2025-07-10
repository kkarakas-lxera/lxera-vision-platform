import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Mail, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartEmailCaptureProps {
  source: string;
  variant?: 'default' | 'mobile' | 'minimal';
  buttonText?: string;
  placeholder?: string;
  onSuccess?: (email: string) => void;
  className?: string;
  initialEmail?: string;
  autoSubmit?: boolean;
}

const SmartEmailCapture: React.FC<SmartEmailCaptureProps> = ({
  source,
  variant = 'default',
  buttonText = 'Get Early Access',
  placeholder = 'Enter your work email',
  onSuccess,
  className = '',
  initialEmail = '',
  autoSubmit = false
}) => {
  const [isExpanded, setIsExpanded] = useState(autoSubmit && !!initialEmail);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    if (autoSubmit && initialEmail && !submitted && !loading) {
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoSubmit, initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await supabase.functions.invoke('capture-email', {
        body: {
          email,
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

        onSuccess?.(email);
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
  };

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
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className="w-64"
                disabled={loading}
                inputMode="email"
                autoComplete="email"
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
            className={`flex ${variant === 'mobile' ? 'flex-col' : 'flex-row'} gap-2`}
          >
            <Input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className={`
                ${variant === 'mobile' ? 'h-12 text-base' : 'h-11'}
                ${variant === 'mobile' ? 'w-full' : 'w-64'}
                transition-all duration-300
              `}
              disabled={loading}
              inputMode="email"
              autoComplete="email"
              onBlur={() => {
                if (!email) {
                  setTimeout(() => setIsExpanded(false), 200);
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={loading}
              className={`
                bg-future-green text-business-black hover:bg-future-green/90 font-medium
                ${variant === 'mobile' ? 'h-12 text-base w-full' : 'h-11 px-6'}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Get Access
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartEmailCapture;