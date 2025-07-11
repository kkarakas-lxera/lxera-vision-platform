import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowRight, Mail, User, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface PricingEarlyAccessProps {
  source?: string;
  onSuccess?: (email: string, name: string) => void;
  className?: string;
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

const PricingEarlyAccess: React.FC<PricingEarlyAccessProps> = ({
  source = 'pricing_page',
  onSuccess,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate email format
    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!isCompanyEmail(email)) {
      newErrors.email = 'Please use your company email address';
    }
    
    // Validate name
    if (!name || name.trim().length < 2) {
      newErrors.name = 'Please enter your full name';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
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
        
        toast({
          title: 'Welcome to Early Access!',
          description: 'Check your email for a magic link to complete your profile.',
        });

        onSuccess?.(email, name.trim());
      }
    } catch (error: any) {
      console.error('Error capturing email:', error);
      // Log more detailed error information
      console.error('Error details:', {
        message: error.message,
        error: error,
        response: error.response,
        data: error.data
      });
      
      // Show toast notification
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
      
      // Set server error for display
      setServerError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
      >
        <div className="w-full py-4 rounded-xl bg-green-50 border-2 border-green-200 flex items-center justify-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <span className="font-semibold text-green-700">Check your email for access!</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className="w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-lg font-inter bg-white hover:bg-gray-50 text-business-black border-2 border-business-black hover:bg-business-black hover:text-white"
            >
              Get Early Access
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="w-full space-y-3"
          >
            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{serverError}</p>
              </div>
            )}
            
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="Enter your work email"
                className={`w-full h-12 text-base pl-10 border-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-business-black transition-all duration-200`}
                disabled={loading}
                inputMode="email"
                autoComplete="email"
                autoFocus
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div className="relative">
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="Your full name"
                className={`w-full h-12 text-base pl-10 border-2 ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:border-business-black transition-all duration-200`}
                disabled={loading}
                autoComplete="name"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-base bg-business-black hover:bg-business-black/90 text-white transition-all duration-300 hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span>Get Access Now</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Work email required • No credit card needed
            </p>
            
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-xs text-gray-500 hover:text-gray-700 underline w-full text-center"
            >
              Cancel
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PricingEarlyAccess;