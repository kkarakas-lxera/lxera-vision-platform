import { Check, X } from "lucide-react";
import PricingContactSales from "./forms/PricingContactSales";
import PricingEarlyAccess from "./forms/PricingEarlyAccess";

interface PlanComparisonSectionProps {
  openContactSalesModal?: (source: string) => void;
  openEarlyAccessModal?: (source: string) => void;
}

const PlanComparisonSection = ({ openContactSalesModal, openEarlyAccessModal }: PlanComparisonSectionProps) => {

  const comparisonFeatures = [
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

  return (
    <>
      <div className="py-16 bg-white font-inter">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-medium text-black mb-4 font-inter">
              Compare plans and features
            </h2>
            <p className="text-lg text-black max-w-2xl mx-auto font-inter font-normal">
              Choose the plan that best fits your organization's learning and innovation needs
            </p>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="px-6 py-4 bg-gray-50">
                <span className="text-lg font-medium text-black font-inter">Features</span>
              </div>
              <div className="px-6 py-4 text-center bg-white border-l border-r border-gray-200">
                <div className="text-lg font-medium text-black font-inter">Core</div>
              </div>
              <div className="px-6 py-4 text-center bg-gray-100 border-l border-r border-gray-200">
                <div className="text-lg font-medium text-black font-inter">Enterprise</div>
              </div>
            </div>

            {comparisonFeatures.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="grid grid-cols-3 gap-0 border-t border-gray-200">
                  <div className="px-6 py-6 bg-gray-50">
                    <h4 className="text-lg font-medium text-black font-inter">
                      {category.category}
                    </h4>
                  </div>
                  <div className="px-6 py-6 bg-white border-l border-r border-gray-200"></div>
                  <div className="px-6 py-6 bg-gray-100 border-l border-r border-gray-200"></div>
                </div>
                
                {category.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="grid grid-cols-3 gap-0">
                    <div className="px-6 py-4 flex items-center bg-gray-50 border-t border-gray-100">
                      <span className="text-sm text-black font-inter font-normal">
                        {feature.name}
                      </span>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-center bg-white border-l border-r border-gray-200 border-t border-gray-100">
                      {feature.core ? (
                        <Check className="h-5 w-5 text-business-black" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="px-6 py-4 flex items-center justify-center bg-gray-100 border-l border-r border-gray-200 border-t border-gray-100">
                      {feature.enterprise ? (
                        <Check className="h-5 w-5 text-business-black" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-base text-black mb-6 font-inter font-normal">
              Need help choosing the right plan? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <PricingEarlyAccess
                source="plan_comparison_free_trial"
                openEarlyAccessModal={openEarlyAccessModal}
              />
              <PricingContactSales 
                source="plan_comparison_section"
                className="flex-1"
                openContactSalesModal={openContactSalesModal}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanComparisonSection;
