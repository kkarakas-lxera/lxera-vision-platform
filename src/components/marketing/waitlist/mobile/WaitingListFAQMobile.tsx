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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    <section className="py-16 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white leading-tight">
            {FAQ_CONTENT.title}
          </h2>
          <p className="text-white text-base leading-relaxed">
            {FAQ_CONTENT.subtitle}
          </p>
        </div>

        {/* Mobile-optimized FAQ Items */}
        <div className="space-y-4 mb-12">
          {FAQ_CONTENT.faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-start justify-between hover:bg-gray-700/30 transition-colors duration-200"
              >
                <h3 className="text-base font-semibold text-white pr-4 leading-tight">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0 mt-1">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-[#7AE5C6]" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5">
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

        {/* Mobile CTA section */}
        <div className="text-center">
          <p className="text-gray-300 mb-8 text-base leading-relaxed px-2">
            {FAQ_CONTENT.ctaText}
          </p>
          
          {/* Mobile-optimized form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-12 px-4 border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 rounded-md text-base"
            />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 rounded-md text-base"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-medium rounded-md shadow-none border-none"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <ClassicLoader />
                  Getting access…
                </span>
              ) : 'Get Early Access'}
            </Button>
          </form>

          {/* Mobile trust indicators */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Free 30 days
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                No credit card
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                Limited spots
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};