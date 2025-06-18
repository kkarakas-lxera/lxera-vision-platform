
import { Button } from "@/components/ui/button";
import { Check, Info, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

const Pricing = () => {
  const [openFeatures, setOpenFeatures] = useState<{[key: string]: boolean}>({});

  const toggleFeature = (featureId: string) => {
    setOpenFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  const featureExplanations: {[key: string]: string} = {
    "AI Hyper-Personalized Learning Engine": "Adapts learning based on role, behavior, and goals using LLMs and RAG.",
    "Taxonomist Skill Gap Engine": "Identifies specific skill gaps and creates targeted learning paths for each individual.",
    "AI Avatar-Powered Content Creation": "Creates personalized content using AI avatars that match your company's tone and style.",
    "Real-Time Adaptive Gamification": "Dynamically adjusts challenges and rewards based on user engagement and progress.",
    "Smart Nudging & Behavioral Triggers": "Uses behavioral science to send timely prompts that encourage learning habits.",
    "Human-in-the-Loop Intelligence": "Combines AI efficiency with human expertise for quality assurance and personalization.",
    "Executive-Ready Analytics Dashboard": "Provides comprehensive insights and metrics designed for leadership decision-making.",
    "Knowledge Base Transformation": "Converts existing company documents into interactive, searchable learning materials.",
    "Enterprise-Grade Security & Compliance": "Advanced security features including SOC 2, GDPR compliance, and data encryption.",
    "Low-Code / No-Code Innovation Sandbox": "Allows teams to create custom learning experiences without technical expertise.",
    "SSO/HRIS integrations": "Seamless integration with your existing identity management and HR systems.",
    "Org-specific AI mentor": "Custom AI assistant trained on your organization's specific processes and culture.",
    "Compliance & security features": "Advanced compliance tools for regulated industries with audit trails and reporting."
  };

  const plans = [
    {
      name: "Core",
      price: "$199",
      period: "per month",
      description: "Perfect for growing businesses",
      features: [
        "AI Hyper-Personalized Learning Engine",
        "Taxonomist Skill Gap Engine",
        "AI Avatar-Powered Content Creation",
        "Real-Time Adaptive Gamification",
        "Smart Nudging & Behavioral Triggers",
        "Human-in-the-Loop Intelligence",
        "Executive-Ready Analytics Dashboard",
        "Knowledge Base Transformation"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      subtitle: "Everything in Core, plus:",
      price: "Custom",
      period: "contact us",
      description: "Tailored for large organizations",
      features: [
        "Enterprise-Grade Security & Compliance",
        "Low-Code / No-Code Innovation Sandbox",
        "SSO/HRIS integrations",
        "Org-specific AI mentor",
        "Compliance & security features"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      {/* Header Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
            Choose the perfect plan for your team. No hidden fees, no surprises.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-3xl p-8 shadow-xl transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'border-4 border-future-green' : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-future-green text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-business-black mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-business-black/60 mb-6">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-business-black">
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
                    const featureId = `${plan.name}-${featureIndex}`;
                    const hasExplanation = featureExplanations[feature];
                    
                    return (
                      <li key={featureIndex} className="space-y-2">
                        <div className="flex items-center">
                          <Check className="h-5 w-5 text-future-green mr-3 flex-shrink-0" />
                          <span className="text-business-black/80 flex-1">{feature}</span>
                          {hasExplanation && (
                            <Collapsible>
                              <CollapsibleTrigger
                                onClick={() => toggleFeature(featureId)}
                                className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <Info className="h-4 w-4 text-business-black/60 hover:text-business-black" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="mt-2 ml-8">
                                <div className="bg-smart-beige/50 rounded-lg p-3 text-sm text-business-black/70">
                                  {featureExplanations[feature]}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <Button
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-future-green hover:bg-future-green/90 text-white'
                      : 'bg-business-black hover:bg-business-black/90 text-white'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-business-black text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            <div className="bg-smart-beige/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-business-black mb-3">
                Can I change my plan anytime?
              </h3>
              <p className="text-business-black/70">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div className="bg-smart-beige/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-business-black mb-3">
                Is there a free trial?
              </h3>
              <p className="text-business-black/70">
                We offer a 14-day free trial for all plans. No credit card required.
              </p>
            </div>
            
            <div className="bg-smart-beige/50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-business-black mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-business-black/70">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
