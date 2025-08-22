import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { useToast } from '../../../ui/use-toast';
import ClassicLoader from '../../../ui/ClassicLoader';
import { FAQ_CONTENT } from '../shared/content';
import { validateWaitlistForm } from '../../../../utils/waitlistValidation';

export const WaitingListFAQMobile: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Clear validation errors when user types
  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) setNameError('');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  // Exact same form handler from desktop version
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
          source: 'faq-footer-mobile'
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Thanks for your interest in LXERA!",
          description: "You've been added to our early access list.",
        });
        setName('');
        setEmail('');
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
    <section className="py-24 text-white" style={{ background: 'linear-gradient(to bottom, rgb(0 0 0), rgb(17 24 39))' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-white">
            {FAQ_CONTENT.title}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-base">
            {FAQ_CONTENT.subtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {FAQ_CONTENT.faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-700 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-[#7AE5C6]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA at bottom with exact same form from desktop */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-8 text-base">
            {FAQ_CONTENT.ctaText}
          </p>
          
          {/* Exact same form from desktop version - Mobile responsive */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg mb-8">
            <div className="flex flex-col gap-3 mb-2">
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className={`w-full h-12 px-4 border bg-gray-800 text-white placeholder-gray-400 rounded-md text-sm font-inter ${nameError ? 'border-red-500' : 'border-gray-600'}`}
                />
                {nameError && (
                  <p className="text-red-400 text-xs mt-1 font-inter">{nameError}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                  className={`w-full h-12 px-4 border bg-gray-800 text-white placeholder-gray-400 rounded-md text-sm font-inter ${emailError ? 'border-red-500' : 'border-gray-600'}`}
                />
                {emailError && (
                  <p className="text-red-400 text-xs mt-1 font-inter">{emailError}</p>
                )}
              </div>
            </div>
            <div className="flex justify-center mt-4">
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
        </div>
      </div>
    </section>
  );
};