import React from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
}

const MobilePricingFAQ = () => {
  const faqs: FAQItem[] = [
    {
      question: "Can I change my plan anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
    },
    {
      question: "Is there a free trial?",
      answer: "We offer a 14-day free trial for all plans. No credit card required. You'll have full access to all features during your trial period."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans. All payments are processed securely."
    },
    {
      question: "Do you offer custom pricing for large teams?",
      answer: "Yes! For teams over 100 users, we offer custom pricing and additional enterprise features. Contact our sales team for a personalized quote."
    }
  ];

  return (
    <div className="w-full animate-fade-in-up" style={{ animationDelay: '800ms' }}>
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-business-black mb-6 text-center">
          Frequently Asked Questions
        </h3>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`faq-${index}`}
              className="border border-gray-200 rounded-lg px-4 overflow-hidden bg-white"
            >
              <AccordionTrigger className="text-left py-4 hover:no-underline">
                <span className="text-sm font-medium text-business-black pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-0">
                <p className="text-sm text-business-black/80 leading-relaxed">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact CTA */}
        <div className="mt-8 text-center bg-smart-beige/50 rounded-lg p-4">
          <p className="text-sm text-business-black/80 mb-3">
            Still have questions about pricing?
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/company/contact'}
            className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white transition-all duration-300"
          >
            Talk to Sales
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobilePricingFAQ;