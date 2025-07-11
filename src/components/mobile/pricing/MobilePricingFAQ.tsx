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
      question: "How does the pricing work?",
      answer: "Our pricing is per learner, per month. You only pay for active users who access the platform. The Core plan starts at £10 per learner monthly (or £8 with annual billing). Enterprise pricing is customized based on your organization's needs."
    },
    {
      question: "What's included in the free trial?",
      answer: "You get 14 days of full access to all Core features with up to 10 team members. No credit card required. This includes AI-powered skills analysis, course creation tools, and all integrations."
    },
    {
      question: "Can I switch plans anytime?",
      answer: "Yes! You can upgrade from Core to Enterprise at any time. Downgrades take effect at the end of your billing cycle. Our team will help ensure a smooth transition between plans."
    },
    {
      question: "Do you offer discounts for non-profits?",
      answer: "We offer special pricing for registered non-profits and educational institutions. Contact our sales team with your organization details to learn about available discounts."
    },
    {
      question: "What integrations are available?",
      answer: "Core includes standard integrations with popular HRIS systems like Workday, BambooHR, and ADP, plus Slack and Teams. Enterprise customers get unlimited custom integrations and API access."
    },
    {
      question: "How secure is my data?",
      answer: "We use enterprise-grade security with SOC 2 Type II compliance, 256-bit encryption, and regular security audits. Enterprise plans include SSO/SAML support and custom security configurations."
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