import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

export const WaitingListFAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

        {/* CTA at bottom */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            Still have questions? We'd love to help.
          </p>
          <button className="bg-[#7AE5C6] hover:bg-[#6BD4B5] text-black font-semibold px-8 py-3 rounded-lg transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};
