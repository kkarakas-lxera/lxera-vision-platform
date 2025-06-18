
import { Check, X } from "lucide-react";

const PlanComparisonSection = () => {
  const comparisonFeatures = [
    {
      category: "Learning Intelligence",
      features: [
        { 
          name: "AI Hyper-Personalized Learning Engine", 
          core: true, 
          enterprise: true,
          highlight: true
        },
        { 
          name: "AI Avatar-Powered Content Creation", 
          core: true, 
          enterprise: true,
          highlight: true
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
          enterprise: true,
          enterpriseOnly: true
        }
      ]
    },
    {
      category: "Learning Tools & Analytics",
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
        },
        { 
          name: "Advanced Learner Dashboard", 
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
          enterprise: true,
          enterpriseOnly: true
        },
        { 
          name: "Innovation Hub Access", 
          core: false, 
          enterprise: true,
          enterpriseOnly: true
        },
        { 
          name: "Social Learning Communities", 
          core: true, 
          enterprise: true
        }
      ]
    },
    {
      category: "Enterprise Features",
      features: [
        { 
          name: "Live AI Avatar Streaming", 
          core: false, 
          enterprise: true,
          enterpriseOnly: true
        },
        { 
          name: "HRIS/SSO Integrations", 
          core: false, 
          enterprise: true,
          enterpriseOnly: true
        },
        { 
          name: "Enterprise Security & Compliance", 
          core: true, 
          enterprise: true
        },
        { 
          name: "White-label Branding", 
          core: false, 
          enterprise: true,
          enterpriseOnly: true
        },
        { 
          name: "Priority Support & Success Manager", 
          core: false, 
          enterprise: true,
          enterpriseOnly: true
        },
        { 
          name: "Dedicated SME Support", 
          core: false, 
          enterprise: true,
          enterpriseOnly: true
        }
      ]
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-b from-white to-smart-beige/30">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6">
            Compare Plans & Features
          </h2>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your organization's learning transformation journey
          </p>
        </div>

        {/* Enhanced Comparison Table */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-2xl">
          {/* Improved Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-gradient-to-r from-smart-beige/50 to-smart-beige/30 border-b border-gray-200">
            <div className="px-8 py-6 md:border-r border-gray-200">
              <span className="text-xl font-bold text-business-black">Features</span>
            </div>
            <div className="px-8 py-6 text-center bg-gradient-to-br from-future-green/30 to-future-green/10 md:border-r border-gray-200">
              <div className="text-xl font-bold text-business-black mb-1">CORE</div>
              <div className="text-lg font-semibold text-business-black">$199/month</div>
              <div className="text-sm text-business-black/70 mt-1">Perfect for growing teams</div>
            </div>
            <div className="px-8 py-6 text-center bg-gradient-to-br from-business-black/15 to-business-black/5">
              <div className="text-xl font-bold text-business-black mb-1">ENTERPRISE</div>
              <div className="text-lg font-semibold text-business-black">Custom pricing</div>
              <div className="text-sm text-business-black/70 mt-1">Tailored for large organizations</div>
            </div>
          </div>

          {/* Enhanced Table Content */}
          {comparisonFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {/* Enhanced Category Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-2 border-gray-200 bg-gradient-to-r from-smart-beige/20 to-smart-beige/10">
                <div className="px-8 py-6 md:col-span-3">
                  <h4 className="text-xl font-bold text-business-black flex items-center">
                    <span className="w-2 h-2 bg-future-green rounded-full mr-3"></span>
                    {category.category}
                  </h4>
                </div>
              </div>
              
              {/* Enhanced Category Features */}
              {category.features.map((feature, featureIndex) => (
                <div 
                  key={featureIndex}
                  className={`grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-gray-100 hover:bg-smart-beige/20 transition-all duration-300 group ${
                    feature.highlight ? 'bg-smart-beige/10' : ''
                  }`}
                >
                  <div className="px-8 py-5 flex items-center md:border-r border-gray-200">
                    <span className={`text-base text-business-black group-hover:text-business-black font-medium ${
                      feature.enterpriseOnly ? 'text-business-black/80' : ''
                    }`}>
                      {feature.name}
                      {feature.highlight && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-future-green/20 text-business-black">
                          Popular
                        </span>
                      )}
                      {feature.enterpriseOnly && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-business-black/10 text-business-black">
                          Enterprise
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="px-8 py-5 flex items-center justify-center bg-gradient-to-br from-future-green/20 to-future-green/5 md:border-r border-gray-200">
                    {feature.core ? (
                      <div className="flex items-center">
                        <Check className="h-6 w-6 text-emerald font-bold" />
                        <span className="ml-2 text-sm font-medium text-business-black md:hidden">Included</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <X className="h-6 w-6 text-red-500" />
                        <span className="ml-2 text-sm font-medium text-red-500 md:hidden">Not included</span>
                      </div>
                    )}
                  </div>
                  <div className="px-8 py-5 flex items-center justify-center bg-gradient-to-br from-business-black/10 to-business-black/5">
                    {feature.enterprise ? (
                      <div className="flex items-center">
                        <Check className="h-6 w-6 text-business-black font-bold" />
                        <span className="ml-2 text-sm font-medium text-business-black md:hidden">Included</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <X className="h-6 w-6 text-red-500" />
                        <span className="ml-2 text-sm font-medium text-red-500 md:hidden">Not included</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Enhanced Call-to-Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-3xl p-8 shadow-xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-business-black mb-4">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-lg text-business-black/70 mb-8 max-w-2xl mx-auto">
              Join forward-thinking organizations already using LXERA to revolutionize their learning and development.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="bg-future-green hover:bg-emerald text-business-black hover:text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-future-green/30 min-w-[200px]">
                Start Free Trial
              </button>
              <button className="bg-business-black hover:bg-business-black/90 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-business-black/30 min-w-[200px]">
                Contact Sales
              </button>
            </div>
            <div className="flex justify-center items-center mt-6 space-x-8 text-sm text-business-black/60">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-future-green mr-2" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-future-green mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-future-green mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComparisonSection;
