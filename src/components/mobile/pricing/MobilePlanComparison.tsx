import React from 'react';
import { Check, X, BrainCircuit, Zap, BarChart3, Lightbulb, Users, Shield, HeadphonesIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ComparisonCategory {
  category: string;
  features: {
    name: string;
    core: boolean;
    enterprise: boolean;
  }[];
}

const MobilePlanComparison = () => {
  const categoryIcons = {
    'Learning Intelligence': <BrainCircuit className="w-4 h-4" />,
    'Learning Tools': <Zap className="w-4 h-4" />,
    'Analytics & Insights': <BarChart3 className="w-4 h-4" />,
    'Knowledge & Innovation': <Lightbulb className="w-4 h-4" />,
    'Live & Social': <Users className="w-4 h-4" />,
    'Integrations & Security': <Shield className="w-4 h-4" />,
    'Support & Services': <HeadphonesIcon className="w-4 h-4" />
  };

  const comparisonFeatures: ComparisonCategory[] = [
    {
      category: "Learning Intelligence",
      features: [
        { 
          name: "AI Hyper-Personalized Learning Engine", 
          core: true, 
          enterprise: true
        },
        { 
          name: "AI Avatar-Powered Content Creation", 
          core: true, 
          enterprise: true
        },
        { 
          name: "Skill Gap Engine", 
          core: true, 
          enterprise: true
        },
        { 
          name: "Smart Nudging", 
          core: true, 
          enterprise: true
        },
        { 
          name: "Human-in-the-Loop Intelligence", 
          core: true, 
          enterprise: true
        },
        { 
          name: "Organization-Specific AI Mentor", 
          core: false, 
          enterprise: true
        }
      ]
    },
    {
      category: "Learning Tools",
      features: [
        { 
          name: "Real-Time Adaptive Gamification", 
          core: true, 
          enterprise: true
        },
        { 
          name: "SOP to Microlearning Converter", 
          core: true, 
          enterprise: true
        },
        { 
          name: "Learning Journey Templates", 
          core: true, 
          enterprise: true
        }
      ]
    },
    {
      category: "Analytics & Insights",
      features: [
        { 
          name: "Learner Dashboard", 
          core: true, 
          enterprise: true
        }
      ]
    },
    {
      category: "Knowledge & Innovation",
      features: [
        { 
          name: "Shared Knowledge Base Access", 
          core: true, 
          enterprise: true
        },
        { 
          name: "Low-Code Innovation Sandbox", 
          core: false, 
          enterprise: true
        },
        { 
          name: "Innovation Hub Access", 
          core: false, 
          enterprise: true
        }
      ]
    },
    {
      category: "Live & Social",
      features: [
        { 
          name: "Social Learning Communities", 
          core: true, 
          enterprise: true
        },
        { 
          name: "Live AI Avatar Streaming", 
          core: false, 
          enterprise: true
        }
      ]
    },
    {
      category: "Integrations & Security",
      features: [
        { 
          name: "HRIS/SSO Integrations", 
          core: false, 
          enterprise: true
        },
        { 
          name: "Compliance & Security", 
          core: true, 
          enterprise: true
        },
        { 
          name: "White-label Branding", 
          core: false, 
          enterprise: true
        }
      ]
    },
    {
      category: "Support & Services",
      features: [
        { 
          name: "Guided Self-Onboarding", 
          core: true, 
          enterprise: true
        },
        { 
          name: "Priority Support & Success Manager", 
          core: false, 
          enterprise: true
        },
        { 
          name: "Dedicated SME Support", 
          core: false, 
          enterprise: true
        },
        { 
          name: "Dedicated Learning Experience Designer", 
          core: false, 
          enterprise: true
        }
      ]
    }
  ];

  const renderFeatureValue = (value: boolean) => {
    return value ? (
      <Check className="w-3 h-3 text-future-green" />
    ) : (
      <X className="w-3 h-3 text-red-500" />
    );
  };

  return (
    <div className="w-full animate-fade-in-up" style={{ animationDelay: '600ms' }}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-business-black mb-4 text-center">
          Compare plans and features
        </h3>
        
        <Accordion type="single" collapsible className="space-y-2">
          {comparisonFeatures.map((category, categoryIndex) => (
            <AccordionItem
              key={category.category}
              value={category.category}
              className="border border-gray-200 rounded-lg overflow-hidden bg-white"
            >
              <AccordionTrigger className="px-3 py-2.5 hover:bg-gray-50 transition-colors text-sm">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    {categoryIcons[category.category as keyof typeof categoryIcons]}
                    <span className="font-medium text-business-black text-sm">{category.category}</span>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-3 pb-3 pt-1">
                <div className="space-y-3">
                  {category.features.map((feature, featureIndex) => (
                    <div
                      key={feature.name}
                      className="bg-gray-50 rounded-md p-2"
                    >
                      {/* Feature Name */}
                      <div className="mb-2">
                        <span className="text-xs font-medium text-business-black">
                          {feature.name}
                        </span>
                      </div>

                      {/* Plan Comparison */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between bg-white rounded px-2 py-1.5 border border-gray-200">
                          <span className="text-[11px] font-medium text-gray-600">Core</span>
                          {renderFeatureValue(feature.core)}
                        </div>
                        <div className="flex items-center justify-between bg-white rounded px-2 py-1.5 border border-gray-200">
                          <span className="text-[11px] font-medium text-gray-600">Enterprise</span>
                          {renderFeatureValue(feature.enterprise)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Bottom CTA */}
        <div className="mt-6 text-center bg-future-green/10 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-3 font-medium">
            Need help choosing the right plan?
          </p>
          <button
            onClick={() => window.location.href = '/company/contact'}
            className="text-future-green font-semibold text-base hover:text-future-green/80 transition-colors underline underline-offset-2"
          >
            Talk to our team →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePlanComparison;