import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ComparisonCategory {
  name: string;
  features: {
    name: string;
    description?: string;
    core: boolean | string;
    enterprise: boolean | string;
  }[];
}

const MobilePlanComparison = () => {
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const categories: ComparisonCategory[] = [
    {
      name: 'AI & Analytics',
      features: [
        {
          name: 'Skills gap analysis',
          description: 'AI-powered analysis to identify skill gaps',
          core: true,
          enterprise: true
        },
        {
          name: 'Learning pathway generation',
          description: 'Personalized learning paths for each employee',
          core: true,
          enterprise: true
        },
        {
          name: 'Custom AI agents',
          description: 'Build your own AI agents for specialized tasks',
          core: false,
          enterprise: true
        },
        {
          name: 'Advanced analytics',
          description: 'Deep insights with predictive analytics',
          core: 'Basic',
          enterprise: 'Advanced'
        }
      ]
    },
    {
      name: 'Content & Learning',
      features: [
        {
          name: 'Course library access',
          core: '100+ courses',
          enterprise: 'Unlimited'
        },
        {
          name: 'Custom course creation',
          core: true,
          enterprise: true
        },
        {
          name: 'External content integration',
          core: false,
          enterprise: true
        },
        {
          name: 'Learning gamification',
          description: 'Points, badges, and leaderboards',
          core: true,
          enterprise: true
        }
      ]
    },
    {
      name: 'Team Management',
      features: [
        {
          name: 'Team members',
          core: 'Up to 500',
          enterprise: 'Unlimited'
        },
        {
          name: 'Role-based access',
          core: 'Standard roles',
          enterprise: 'Custom roles'
        },
        {
          name: 'Department structuring',
          core: true,
          enterprise: true
        },
        {
          name: 'Multi-tenant support',
          core: false,
          enterprise: true
        }
      ]
    },
    {
      name: 'Integrations',
      features: [
        {
          name: 'HRIS integrations',
          core: 'Standard',
          enterprise: 'Custom + API'
        },
        {
          name: 'SSO/SAML',
          core: false,
          enterprise: true
        },
        {
          name: 'Slack/Teams integration',
          core: true,
          enterprise: true
        },
        {
          name: 'Custom webhooks',
          core: false,
          enterprise: true
        }
      ]
    },
    {
      name: 'Support & Success',
      features: [
        {
          name: 'Support channels',
          core: 'Email & chat',
          enterprise: '24/7 priority'
        },
        {
          name: 'Dedicated success manager',
          core: false,
          enterprise: true
        },
        {
          name: 'Onboarding assistance',
          core: 'Self-service',
          enterprise: 'White-glove'
        },
        {
          name: 'SLA guarantee',
          core: false,
          enterprise: '99.9% uptime'
        }
      ]
    }
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-4 h-4 text-future-green" />
      ) : (
        <X className="w-4 h-4 text-gray-300" />
      );
    }
    return <span className="text-xs font-medium">{value}</span>;
  };

  return (
    <div className="w-full animate-fade-in-up" style={{ animationDelay: '600ms' }}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-semibold text-business-black mb-4 text-center">
          Detailed Feature Comparison
        </h3>
        
        <Accordion type="single" collapsible className="space-y-2">
          {categories.map((category, categoryIndex) => (
            <AccordionItem
              key={category.name}
              value={category.name}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-business-black">{category.name}</span>
                  <span className="text-xs text-gray-500 mr-2">
                    {category.features.length} features
                  </span>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-4 pt-2">
                <div className="space-y-3">
                  {category.features.map((feature, featureIndex) => (
                    <div
                      key={feature.name}
                      className="bg-gray-50 rounded-lg p-3"
                    >
                      {/* Feature Name with Info */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-business-black">
                              {feature.name}
                            </span>
                            {feature.description && (
                              <button
                                onClick={() => setExpandedInfo(
                                  expandedInfo === `${category.name}-${feature.name}` 
                                    ? null 
                                    : `${category.name}-${feature.name}`
                                )}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          
                          {/* Description */}
                          {feature.description && expandedInfo === `${category.name}-${feature.name}` && (
                            <p className="text-xs text-gray-600 mt-1 animate-fade-in-up">
                              {feature.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Plan Comparison */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between bg-white rounded-md px-3 py-2">
                          <span className="text-xs text-gray-600">Core</span>
                          {renderFeatureValue(feature.core)}
                        </div>
                        <div className="flex items-center justify-between bg-white rounded-md px-3 py-2">
                          <span className="text-xs text-gray-600">Enterprise</span>
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
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Need help choosing the right plan?
          </p>
          <button
            onClick={() => window.location.href = '/company/contact'}
            className="text-future-green font-medium text-sm hover:text-future-green/80 transition-colors"
          >
            Talk to our team →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobilePlanComparison;