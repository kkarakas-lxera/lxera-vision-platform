
import { Button } from "@/components/ui/button";
import { Check, Info, ChevronDown, Star, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

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
      price: "$199",
      period: "per month",
      description: "Perfect for growing businesses",
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
      popular: false
    },
    {
      name: "Enterprise",
      subtitle: "Everything in Core, plus:",
      price: "Custom",
      period: "contact us",
      description: "Tailored for large organizations",
      features: [
        "Organization-Specific AI Mentor",
        "Enterprise-Grade Security & Compliance",
        "Low-Code / No-Code Innovation Sandbox",
        "SSO/HRIS Integrations"
      ],
      popular: true
    }
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-smart-beige">
        {/* Header Section */}
        <div className="bg-white py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
              Choose the perfect plan for your team. No hidden fees, no surprises.
            </p>
            
            {/* Trust badges */}
            <div className="flex justify-center items-center gap-6 text-sm text-business-black/60">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-future-green" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-future-green" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="py-16 lg:py-24">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group ${
                    plan.popular ? 'border-4 border-business-black scale-105 bg-gradient-to-br from-business-black/5 to-business-black/10' : 'border border-gray-200 hover:border-future-green/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-business-black text-white px-6 py-2 rounded-full text-sm font-semibold">
                        Enterprise Ready
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-8">
                    <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                      plan.popular ? 'text-business-black group-hover:text-business-black' : 'text-business-black group-hover:text-future-green'
                    }`}>
                      {plan.name}
                    </h3>
                    <p className="text-business-black/60 mb-6">
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <span className="text-5xl font-bold text-business-black group-hover:scale-110 transition-transform duration-300 inline-block">
                        {plan.price}
                      </span>
                      <span className="text-business-black/60 ml-2">
                        {plan.period}
                      </span>
                    </div>
                    {plan.subtitle && (
                      <p className="text-sm text-business-black/60 font-medium">
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
                              plan.popular ? 'text-business-black' : 'text-future-green'
                            }`} />
                            <span className="text-business-black/80 flex-1 group-hover/feature:text-business-black transition-colors duration-200">{feature}</span>
                            {hasExplanation && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="ml-2 p-1 hover:bg-future-green/10 rounded-full transition-all duration-200 hover:scale-110 group">
                                    <Info className="h-4 w-4 text-future-green/70 group-hover:text-future-green transition-colors duration-200" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="left" 
                                  className="max-w-xs bg-white border border-future-green/20 shadow-lg p-3 text-sm text-business-black/80"
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
                    className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      plan.popular
                        ? 'bg-business-black hover:bg-business-black/90 text-white hover:shadow-business-black/25'
                        : 'bg-future-green hover:bg-future-green/90 text-white hover:shadow-future-green/25'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="py-16 lg:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black text-center mb-12">
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
                  <h3 className="text-xl font-semibold text-business-black mb-3 group-hover:text-future-green transition-colors duration-300">
                    {faq.question}
                  </h3>
                  <p className="text-business-black/70 leading-relaxed">
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
