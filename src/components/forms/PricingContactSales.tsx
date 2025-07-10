import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight, Mail, User, Building2, Users, MessageSquare, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface PricingContactSalesProps {
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

const PricingContactSales: React.FC<PricingContactSalesProps> = ({
  source = 'pricing_contact_sales',
  onSuccess,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    teamSize: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const teamSizeOptions = [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-500', label: '201-500' },
    { value: '500+', label: '500+' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
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

    // Validate required fields
    if (!formData.name || formData.name.trim().length < 2) {
      toast({
        title: 'Name Required',
        description: 'Please enter your full name',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.company || formData.company.trim().length < 2) {
      toast({
        title: 'Company Required',
        description: 'Please enter your company name',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.teamSize) {
      toast({
        title: 'Team Size Required',
        description: 'Please select your team size',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Submit to capture-contact-sales edge function
      const response = await supabase.functions.invoke('capture-contact-sales', {
        body: {
          email: formData.email,
          name: formData.name.trim(),
          company: formData.company.trim(),
          teamSize: formData.teamSize,
          message: formData.message.trim() || null,
          source,
          utmSource: new URLSearchParams(window.location.search).get('utm_source'),
          utmMedium: new URLSearchParams(window.location.search).get('utm_medium'),
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign')
        }
      });

      if (response.error) throw response.error;

      const data = response.data as any;

      if (data.success) {
        setSubmitted(true);
        
        toast({
          title: 'Message Sent!',
          description: 'Our sales team will contact you within 24 hours.',
        });

        onSuccess?.(formData.email, formData.name.trim());
      }
    } catch (error: any) {
      console.error('Error submitting contact sales:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
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
          <span className="font-semibold text-green-700">We'll be in touch soon!</span>
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
              Contact Sales
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
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg text-business-black">Contact Sales</h3>
              <p className="text-sm text-gray-600 mt-1">Let's discuss how LXERA can work for your team</p>
            </div>

            <div className="relative">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your work email"
                className="w-full h-12 text-base pl-10 border-2 border-gray-300 focus:border-business-black transition-all duration-200"
                disabled={loading}
                inputMode="email"
                autoComplete="email"
                autoFocus
              />
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            
            <div className="relative">
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
                className="w-full h-12 text-base pl-10 border-2 border-gray-300 focus:border-business-black transition-all duration-200"
                disabled={loading}
                autoComplete="name"
              />
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            
            <div className="relative">
              <Input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company name"
                className="w-full h-12 text-base pl-10 border-2 border-gray-300 focus:border-business-black transition-all duration-200"
                disabled={loading}
                autoComplete="organization"
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            
            <div className="relative">
              <Select 
                value={formData.teamSize} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, teamSize: value }))}
                disabled={loading}
              >
                <SelectTrigger className="w-full h-12 text-base pl-10 border-2 border-gray-300 focus:border-business-black transition-all duration-200">
                  <SelectValue placeholder="Team size" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            </div>
            
            <div className="relative">
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell us about your needs (optional)"
                className="w-full min-h-[80px] text-base pl-10 pt-3 border-2 border-gray-300 focus:border-business-black transition-all duration-200 resize-none"
                disabled={loading}
                rows={3}
              />
              <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-base bg-business-black hover:bg-business-black/90 text-white transition-all duration-300 hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span>Sending...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span>Send Message</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Work email required • We'll respond within 24 hours
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

export default PricingContactSales;