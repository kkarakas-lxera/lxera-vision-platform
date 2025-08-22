import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { useToast } from '../../ui/use-toast';
import ClassicLoader from '../../ui/ClassicLoader';
import { AnimatedTooltip } from '../../ui/animated-tooltip';

const faqs = [
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

const people = [
  {
    id: 1,
    name: "Sarah Chen",
    designation: "Learning Director",
    image: "/avatars/avatar1.svg",
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    designation: "HR Manager",
    image: "/avatars/avatar2.svg",
  },
  {
    id: 3,
    name: "Emily Johnson",
    designation: "Innovation Lead",
    image: "/avatars/avatar3.svg",
  },
  {
    id: 4,
    name: "David Park",
    designation: "VP Operations",
    image: "/avatars/avatar1.svg",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    designation: "CHRO",
    image: "/avatars/avatar2.svg",
  },
];

export const WaitingListFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Exact same form handler from hero section
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
    <section className="py-24 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 lg:text-5xl text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-white max-w-2xl mx-auto text-lg">
            Dashboards show measurable progress you can act on.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-700/30 transition-colors duration-200"
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
                  <div className="pt-4 border-t border-gray-700/50">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA at bottom with exact same form from hero */}
        <div className="text-center mt-16">
          <p className="text-gray-300 mb-8 text-lg">
            Join the waitlist and be among the first to experience the future of learning and development.
          </p>
          
          {/* Exact same form from hero section */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg mb-8">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Input
                type="text"
                placeholder="Name Surname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="flex-1 h-12 px-4 border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 rounded-md text-sm font-inter"
              />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 px-4 border border-gray-600 bg-gray-800/50 text-white placeholder-gray-400 rounded-md text-sm font-inter"
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
          
          {/* Social Proof with avatars (no tooltips) */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <AnimatedTooltip items={people} />
            <span className="text-sm text-gray-300 font-inter ml-2">
              Join 100+ people who have already signed up.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
