import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { useToast } from '../../../ui/use-toast';
import ClassicLoader from '../../../ui/ClassicLoader';
import { HERO_CONTENT } from '../shared/content';
import { validateWaitlistForm } from '../../../../utils/waitlistValidation';

const faqs = [
  {
    question: 'Are you using ChatGPT?',
    answer: 'No. We have our own fine-tuned models trained specifically for this purpose. We are using Multi-Agent Orchestration.'
  },
  {
    question: 'What makes LXERA different from other learning platforms?',
    answer: 'LXERA is the only platform that combines AI-powered skill gap analysis, personalized training creation, and real-time market intelligence in one solution. Unlike generic learning platforms, we focus on your specific business needs and industry requirements.'
  },
  {
    question: 'How quickly can we get started with LXERA?',
    answer: 'You can sign up and start exploring LXERA in minutes. Our AI-powered onboarding helps you identify skill gaps and create your first training program within the first week.'
  },
  {
    question: 'Do you integrate with our existing HR and learning systems?',
    answer: 'Yes, LXERA integrates with popular HR systems, LMS platforms, and productivity tools. Our API-first approach ensures seamless integration with your existing workflow.'
  },
  {
    question: 'What kind of training content can LXERA create?',
    answer: 'LXERA can create various types of training content including interactive courses, assessments, video tutorials, and hands-on exercises. Our AI adapts content to different learning styles and skill levels.'
  },
  {
    question: 'How do you measure training effectiveness?',
    answer: 'We provide comprehensive analytics including skill improvement metrics, engagement rates, completion rates, and business impact measurements. Our dashboards show ROI and help you optimize your training programs.'
  },
  {
    question: 'Is LXERA suitable for small teams?',
    answer: 'Absolutely! LXERA scales from small teams to enterprise organizations. Our pricing and features are designed to provide value regardless of your team size.'
  },
  {
    question: 'How do you check content quality?',
    answer: 'We have a human verification layer where subject matter experts check content on top of our quality specialist agents.'
  }
];


export const WaitingListFAQ: React.FC = () => {
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

  // Exact same form handler from hero section
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
          source: 'faq-footer'
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
    <section className="py-16 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 lg:text-4xl text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-white max-w-2xl mx-auto text-base">
            Dashboards show measurable progress you can act on.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors duration-200"
              >
                <h3 className="text-base font-semibold text-white pr-4">
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
                <div className="px-6 pb-4">
                  <div className="pt-3 border-t border-gray-700/50">
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA at bottom with exact same form from hero */}
        <div className="text-center mt-12">
          <p className="text-gray-300 mb-6 text-base">
            Join the waitlist and be among the first to experience the future of learning and development.
          </p>
          
          {/* Exact same form from hero section */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg mb-8">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={HERO_CONTENT.formPlaceholders.name}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className={`h-12 px-4 border bg-gray-800/50 text-white placeholder-gray-400 rounded-md text-sm font-inter ${nameError ? 'border-red-500' : 'border-gray-600'}`}
                />
                {nameError && (
                  <p className="text-red-400 text-xs mt-1 font-inter">{nameError}</p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Business email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                  className={`h-12 px-4 border bg-gray-800/50 text-white placeholder-gray-400 rounded-md text-sm font-inter ${emailError ? 'border-red-500' : 'border-gray-600'}`}
                />
                {emailError && (
                  <p className="text-red-400 text-xs mt-1 font-inter">{emailError}</p>
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
        </div>
      </div>
    </section>
  );
};
