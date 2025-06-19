
import { Button } from "@/components/ui/button";
import { Check, Info, ChevronDown, Star, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import PlanComparisonSection from "@/components/PlanComparisonSection";
import Navigation from "@/components/Navigation";

const Pricing = () => {
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
      price: "$49",
      period: "per month/per user",
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
      hasFreeTrial: false
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
      hasFreeTrial: false
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-smart-beige font-inter">
        <Navigation />
        
        {/* Header Section */}
        <div className="bg-white py-4 lg:py-6 mt-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6 font-inter leading-tight tracking-tight">
              Plans & Pricing
            </h1>
            <p className="text-xl text-business-black/85 max-w-3xl mx-auto mb-8 font-inter font-normal leading-relaxed">
              Empower your organization to transform learning with adaptive AI.
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="py-8 lg:py-12">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group ${
                    plan.popular ? 'border-4 border-business-black scale-105 bg-gradient-to-br from-business-black/5 to-business-black/10' : 'border border-gray-200 hover:border-gray-300'
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
                      <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 font-inter ${
                        plan.popular ? 'text-business-black group-hover:text-business-black' : 'text-business-black group-hover:text-business-black'
                      }`}>
                        {plan.name}
                      </h3>
                    )}
                    <p className="text-business-black/70 mb-6 font-inter font-normal">
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-business-black group-hover:scale-110 transition-transform duration-300 inline-block font-inter">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-business-black/60 ml-2 font-inter font-normal text-sm">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    {plan.subtitle && (
                      <p className="text-sm text-business-black/60 font-normal font-inter">
                        {plan.subtitle}
                      </p>
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

                  <Button
                    className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-lg font-inter ${
                      plan.name === 'Enterprise'
                        ? 'bg-business-black hover:bg-business-black/90 text-white hover:shadow-business-black/25'
                        : 'bg-white hover:bg-gray-50 text-business-black border-2 border-business-black hover:bg-business-black hover:text-white'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Comparison Section */}
        <PlanComparisonSection />

        {/* Enhanced FAQ Section */}
        <div className="py-16 lg:py-24 bg-white">
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
      </div>
    </TooltipProvider>
  );
};

export default Pricing;
