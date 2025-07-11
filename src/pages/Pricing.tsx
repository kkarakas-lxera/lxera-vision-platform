import { Button } from "@/components/ui/button";
import { Check, Info, ChevronDown, Star, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import PlanComparisonSection from "@/components/PlanComparisonSection";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PricingEarlyAccess from "@/components/forms/PricingEarlyAccess";
import PricingContactSales from "@/components/forms/PricingContactSales";
import MobilePricingCards from "@/components/mobile/pricing/MobilePricingCards";
import MobilePlanComparison from "@/components/mobile/pricing/MobilePlanComparison";
import MobilePricingFAQ from "@/components/mobile/pricing/MobilePricingFAQ";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');


  const featureExplanations: {[key: string]: string} = {
    "AI Hyper-Personalized Learning Engine": "Adapts learning based on role, behavior, and goals using LLMs and RAG.",
    "AI Avatar-Powered Content Creation": "Generate dynamic video lessons with lifelike avatars.",
    "Real-Time Adaptive Gamification": "Game mechanics adjust to each learner's behavior and progress.",
    "Smart Nudging & Behavioral Triggers": "Nudges and reminders based on user behavior via Slack/email.",
    "Human-in-the-Loop Intelligence": "Combine scalable AI with human review for high-trust learning.",
    "Executive-Ready Analytics Dashboard": "Visualize outcomes and innovation metrics across departments.",
    "Knowledge Base Transformation": "Turn SOPs and reports into microlearning modules.",
    "Taxonomist Skill Gap Engine": "Automatically detects role-based skill gaps and maps them to personalized learning paths.",
    "Organization-Specific AI Mentor": "Private AI chatbot trained on your company's content to support contextual, role-specific learning.",
    "Enterprise-Grade Security & Compliance": "SOC2 & GDPR aligned, encryption, role-based access.",
    "Low-Code / No-Code Innovation Sandbox": "Enable bottom-up innovation through app building and automation.",
    "SSO/HRIS Integrations": "Sync with HR systems to personalize content by job role."
  };

  const plans = [
    {
      name: "Core",
      price: billingCycle === 'annually' ? "$39" : "$49",
      period: billingCycle === 'annually' ? "per month/per user" : "per month/per user",
      billingNote: billingCycle === 'annually' ? "Billed annually" : "Billed monthly",
      description: "Everything you need to get started",
      features: [
        "AI Hyper-Personalized Learning Engine",
        "AI Avatar-Powered Content Creation",
        "Real-Time Adaptive Gamification",
        "Smart Nudging & Behavioral Triggers",
        "Human-in-the-Loop Intelligence",
        "Executive-Ready Analytics Dashboard",
        "Knowledge Base Transformation",
        "Taxonomist Skill Gap Engine"
      ],
      popular: false,
      hasFreeTrial: false,
      showBillingToggle: true
    },
    {
      name: "Enterprise",
      subtitle: "Everything in Core, plus:",
      price: "Custom pricing",
      period: "",
      description: "Advanced features for growing teams",
      features: [
        "Organization-Specific AI Mentor",
        "Enterprise-Grade Security & Compliance",
        "Low-Code / No-Code Innovation Sandbox",
        "SSO/HRIS Integrations"
      ],
      popular: false,
      hasFreeTrial: false,
      showBillingToggle: false
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-smart-beige font-inter">
        <Navigation />
        
        {/* Mobile Pricing Section */}
        <section className="md:hidden w-full pt-20 pb-24 px-4 bg-gradient-to-br from-white via-smart-beige/20 to-white relative overflow-hidden font-inter">
          {/* Background gradient with better contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 via-transparent to-smart-beige/10"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="animate-fade-in-up mb-6" style={{ animationDelay: '0ms' }}>
              <h1 className="text-2xl font-medium text-business-black leading-tight tracking-tight text-center">
                Simple, transparent pricing
              </h1>
              <p className="text-base text-business-black/85 font-normal leading-relaxed text-center mt-2">
                Scale your L&D with the right plan
              </p>
            </div>

            {/* Mobile Pricing Cards */}
            <MobilePricingCards />

            {/* Plan Comparison */}
            <div className="mt-8">
              <MobilePlanComparison />
            </div>

            {/* FAQ Section */}
            <div className="mt-8">
              <MobilePricingFAQ />
            </div>
          </div>
          
          {/* Sticky CTA for mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg md:hidden z-30">
            <div className="flex gap-3">
              <Button 
                onClick={() => document.querySelector('.smart-email-capture')?.querySelector('button')?.click()}
                className="flex-1 bg-future-green text-business-black hover:bg-future-green/90 font-semibold h-12"
              >
                Get Started
              </Button>
              <Button 
                onClick={() => window.location.href = '/company/contact'}
                variant="outline"
                className="flex-1 border-business-black/30 text-business-black hover:bg-business-black hover:text-white h-12"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* Desktop Header Section */}
        <div className="hidden md:block bg-white py-4 lg:py-6 mt-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 font-inter leading-tight tracking-tight">
              Plans & Pricing
            </h1>
            <p className="text-xl text-business-black/85 max-w-3xl mx-auto mb-8 font-inter font-normal leading-relaxed">
              Empower your organization to transform learning with adaptive AI.
            </p>
          </div>
        </div>

        {/* Desktop Pricing Cards */}
        <div className="hidden md:block py-8 lg:py-12">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group ${
                    plan.name === 'Enterprise' 
                      ? 'bg-gray-100 border-2 border-gray-300' 
                      : plan.name === 'Core'
                        ? 'bg-white border-2 border-gray-200'
                        : plan.popular 
                          ? 'border-4 border-business-black scale-105 bg-gradient-to-br from-business-black/5 to-business-black/10 bg-white' 
                          : 'border border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-business-black text-white px-4 py-2 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    {plan.name && (
                      <h3 className={`text-2xl font-medium mb-2 transition-colors duration-300 font-inter ${
                        plan.popular ? 'text-business-black group-hover:text-business-black' : 'text-business-black group-hover:text-business-black'
                      }`}>
                        {plan.name}
                      </h3>
                    )}
                    <p className="text-business-black/70 mb-6 font-inter font-normal">
                      {plan.description}
                    </p>

                    {/* Curved Billing Toggle for Core Plan */}
                    {plan.showBillingToggle && (
                      <div className="flex justify-center mb-6">
                        <div className="inline-flex bg-gray-100 p-1 rounded-full">
                          <button
                            onClick={() => setBillingCycle('annually')}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                              billingCycle === 'annually'
                                ? 'bg-white text-business-black shadow-sm'
                                : 'text-business-black/60 hover:text-business-black'
                            }`}
                          >
                            Annual
                          </button>
                          <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                              billingCycle === 'monthly'
                                ? 'bg-white text-business-black shadow-sm'
                                : 'text-business-black/60 hover:text-business-black'
                            }`}
                          >
                            Monthly
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <span className="text-4xl font-medium text-business-black group-hover:scale-110 transition-transform duration-300 inline-block font-inter">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-business-black/60 ml-2 font-inter font-normal text-sm">
                          {plan.period}
                        </span>
                      )}
                    </div>

                    {/* Simple Billing Note for Core Plan */}
                    {plan.billingNote && (
                      <div className="mb-4">
                        <p className="text-sm text-business-black/60 font-inter">
                          {plan.billingNote}
                        </p>
                      </div>
                    )}

                    {plan.subtitle && (
                      <div className="bg-business-black/10 rounded-xl px-4 py-2 mb-4 border border-business-black/20">
                        <p className="text-sm font-medium text-business-black font-inter">
                          {plan.subtitle}
                        </p>
                      </div>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => {
                      const hasExplanation = featureExplanations[feature];
                      
                      return (
                        <li key={featureIndex}>
                          <div className="flex items-center group/feature">
                            <Check className={`h-5 w-5 mr-3 flex-shrink-0 group-hover/feature:scale-110 transition-transform duration-200 ${
                              plan.popular ? 'text-business-black' : 'text-business-black'
                            }`} />
                            <span className="text-business-black/80 flex-1 group-hover/feature:text-business-black transition-colors duration-200 font-inter font-normal">{feature}</span>
                            {hasExplanation && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="ml-2 p-1 hover:bg-business-black/10 rounded-full transition-all duration-200 hover:scale-110 group">
                                    <Info className="h-4 w-4 text-business-black/70 group-hover:text-business-black transition-colors duration-200" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="left" 
                                  className="max-w-xs bg-white border border-business-black/20 shadow-lg p-3 text-sm text-business-black/80 font-inter"
                                  sideOffset={8}
                                >
                                  {featureExplanations[feature]}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {plan.name === 'Enterprise' ? (
                    <PricingContactSales
                      source="pricing_page_enterprise"
                      onSuccess={(email, name) => {
                        console.log('Contact sales submission:', { email, name });
                      }}
                    />
                  ) : (
                    <PricingEarlyAccess
                      source="pricing_page_core"
                      onSuccess={(email, name) => {
                        console.log('Early access signup:', { email, name });
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Plan Comparison Section */}
        <div className="hidden md:block">
          <PlanComparisonSection />
        </div>

        {/* Desktop Enhanced FAQ Section */}
        <div className="hidden md:block py-16 lg:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black text-center mb-12 font-inter">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              {[
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
              ].map((faq, index) => (
                <div key={index} className="bg-smart-beige/30 rounded-2xl p-6 hover:bg-smart-beige/50 transition-all duration-300 hover:shadow-md group">
                  <h3 className="text-xl font-medium text-business-black mb-3 group-hover:text-future-green transition-colors duration-300 font-inter">
                    {faq.question}
                  </h3>
                  <p className="text-business-black/70 leading-relaxed font-inter font-normal">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default Pricing;
