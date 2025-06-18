
import { Check, X } from "lucide-react";

const PlanComparisonSection = () => {
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
    <div className="py-16 bg-white font-inter">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medium text-black mb-4 font-inter">
            Compare plans and features
          </h2>
          <p className="text-lg text-black max-w-2xl mx-auto font-inter font-normal">
            Choose the plan that best fits your organization's learning and innovation needs
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-0 bg-gray-50 border-b border-gray-200">
            <div className="px-6 py-4">
              <span className="text-lg font-medium text-black font-inter">Features</span>
            </div>
            <div className="px-6 py-4 text-center bg-white border-l border-gray-200">
              <div className="text-lg font-medium text-black font-inter">CORE</div>
              <div className="text-sm text-black mt-1 font-inter font-normal">$199/month</div>
            </div>
            <div className="px-6 py-4 text-center bg-business-black/10 border-l border-gray-200">
              <div className="text-lg font-medium text-black font-inter">ENTERPRISE</div>
              <div className="text-sm text-black mt-1 font-inter font-normal">Custom pricing</div>
            </div>
          </div>

          {/* Table Content */}
          {comparisonFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {/* Category Header */}
              <div className="grid grid-cols-3 gap-0 border-t border-gray-200 bg-gray-50">
                <div className="px-6 py-5 col-span-3">
                  <h4 className="text-lg font-medium text-black font-inter">
                    {category.category}
                  </h4>
                </div>
              </div>
              
              {/* Category Features */}
              {category.features.map((feature, featureIndex) => (
                <div 
                  key={featureIndex}
                  className="grid grid-cols-3 gap-0 border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="px-6 py-4 flex items-center border-r border-gray-200">
                    <span className="text-sm text-black font-inter font-normal">
                      {feature.name}
                    </span>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-center bg-white border-r border-gray-200">
                    {feature.core ? (
                      <Check className="h-5 w-5 text-business-black" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div className="px-6 py-4 flex items-center justify-center bg-business-black/10">
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

        {/* Call-to-Action */}
        <div className="text-center mt-10">
          <p className="text-base text-black mb-6 font-inter font-normal">
            Need help choosing the right plan? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-future-green hover:bg-future-green/90 text-black px-8 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105 hover:shadow-lg font-inter">
              Start Free Trial
            </button>
            <button className="bg-business-black hover:bg-business-black/90 text-white px-8 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105 hover:shadow-lg font-inter">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComparisonSection;
