import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { useToast } from '../../../ui/use-toast';
import ClassicLoader from '../../../ui/ClassicLoader';
import { FAQ_CONTENT } from '../shared/content';

export const WaitingListFAQMobile: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Exact same form handler from desktop version
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Integrate with Supabase edge function
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Open onboarding helper dialog
      toast({
        title: "Thanks for your interest in LXERA!",
        description: "You've been added to our early access list.",
      });
      setName('');
      setEmail('');
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
    <section className="py-24 bg-white text-black">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-black">
            {FAQ_CONTENT.title}
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-base">
            {FAQ_CONTENT.subtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {FAQ_CONTENT.faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-black pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-[#7AE5C6]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
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
          <p className="text-gray-700 mb-8 text-base">
            {FAQ_CONTENT.ctaText}
          </p>
          
          {/* Exact same form from desktop version - Mobile responsive */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg mb-8">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 h-12 px-4 border border-gray-300 bg-white text-black placeholder-gray-500 rounded-md text-sm font-inter"
              />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 px-4 border border-gray-300 bg-white text-black placeholder-gray-500 rounded-md text-sm font-inter"
              />
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