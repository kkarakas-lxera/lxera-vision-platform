
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
    <section className="w-full py-16 px-6 bg-gradient-to-b from-smart-beige/70 via-future-green/5 to-smart-beige/60 relative overflow-hidden font-inter">
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/4 via-smart-beige/70 to-future-green/10"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-smart-beige/30 via-transparent to-future-green/8"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Enhanced Section Header - matching home page style */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
            Compare Plans & Features
          </h2>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
            Choose the perfect plan for your organization's learning transformation journey
          </p>
          
          {/* Enhanced decorative line - matching home page */}
          <div className="mt-8 flex justify-center animate-fade-in-scale">
            <div className="relative">
              <div className="w-40 h-1.5 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow shadow-lg rounded-full"></div>
              <div className="absolute inset-0 w-40 h-1.5 bg-gradient-to-r from-transparent via-emerald/50 to-transparent animate-shimmer rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Comparison Table - matching home page card style */}
        <div className="bg-gradient-to-br from-smart-beige/80 via-future-green/10 to-smart-beige/60 rounded-3xl border-2 border-future-green/30 overflow-hidden shadow-2xl lxera-shadow">
          {/* Improved Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-gradient-to-r from-smart-beige/60 to-future-green/20 border-b-2 border-future-green/20">
            <div className="px-8 py-6 md:border-r-2 border-future-green/20">
              <span className="text-xl font-bold text-business-black font-inter">Features</span>
            </div>
            <div className="px-8 py-6 text-center bg-gradient-to-br from-future-green/30 to-future-green/10 md:border-r-2 border-future-green/20">
              <div className="text-xl font-bold text-business-black mb-1 font-inter">CORE</div>
              <div className="text-lg font-semibold text-business-black font-inter">$199/month</div>
              <div className="text-sm text-business-black/70 mt-1 font-normal font-inter">Perfect for growing teams</div>
            </div>
            <div className="px-8 py-6 text-center bg-gradient-to-br from-business-black/15 to-business-black/5">
              <div className="text-xl font-bold text-business-black mb-1 font-inter">ENTERPRISE</div>
              <div className="text-lg font-semibold text-business-black font-inter">Custom pricing</div>
              <div className="text-sm text-business-black/70 mt-1 font-normal font-inter">Tailored for large organizations</div>
            </div>
          </div>

          {/* Enhanced Table Content */}
          {comparisonFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {/* Enhanced Category Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t-2 border-future-green/20 bg-gradient-to-r from-smart-beige/40 to-future-green/15">
                <div className="px-8 py-6 md:col-span-3">
                  <h4 className="text-xl font-bold text-business-black flex items-center font-inter">
                    <span className="w-2 h-2 bg-future-green rounded-full mr-3"></span>
                    {category.category}
                  </h4>
                </div>
              </div>
              
              {/* Enhanced Category Features */}
              {category.features.map((feature, featureIndex) => (
                <div 
                  key={featureIndex}
                  className={`grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-future-green/10 hover:bg-smart-beige/40 transition-all duration-300 group ${
                    feature.highlight ? 'bg-smart-beige/20' : ''
                  }`}
                >
                  <div className="px-8 py-5 flex items-center md:border-r border-future-green/20">
                    <span className={`text-base text-business-black group-hover:text-business-black font-medium font-inter ${
                      feature.enterpriseOnly ? 'text-business-black/80' : ''
                    }`}>
                      {feature.name}
                      {feature.highlight && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-future-green/20 text-business-black font-inter">
                          Popular
                        </span>
                      )}
                      {feature.enterpriseOnly && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-business-black/10 text-business-black font-inter">
                          Enterprise
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="px-8 py-5 flex items-center justify-center bg-gradient-to-br from-future-green/20 to-future-green/5 md:border-r border-future-green/20">
                    {feature.core ? (
                      <div className="flex items-center">
                        <Check className="h-6 w-6 text-emerald font-bold" />
                        <span className="ml-2 text-sm font-medium text-business-black md:hidden font-inter">Included</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <X className="h-6 w-6 text-red-500" />
                        <span className="ml-2 text-sm font-medium text-red-500 md:hidden font-inter">Not included</span>
                      </div>
                    )}
                  </div>
                  <div className="px-8 py-5 flex items-center justify-center bg-gradient-to-br from-business-black/10 to-business-black/5">
                    {feature.enterprise ? (
                      <div className="flex items-center">
                        <Check className="h-6 w-6 text-business-black font-bold" />
                        <span className="ml-2 text-sm font-medium text-business-black md:hidden font-inter">Included</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <X className="h-6 w-6 text-red-500" />
                        <span className="ml-2 text-sm font-medium text-red-500 md:hidden font-inter">Not included</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Enhanced Call-to-Action - matching home page style */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-br from-smart-beige/80 via-future-green/10 to-smart-beige/60 rounded-3xl p-8 shadow-xl max-w-4xl mx-auto border-2 border-future-green/30 lxera-shadow">
            <h3 className="text-2xl font-bold text-business-black mb-4 font-inter">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-lg text-business-black/70 mb-8 max-w-2xl mx-auto font-normal font-inter">
              Join forward-thinking organizations already using LXERA to revolutionize their learning and development.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="bg-future-green hover:bg-emerald text-business-black hover:text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-future-green/30 min-w-[200px] font-inter">
                Start Free Trial
              </button>
              <button className="bg-business-black hover:bg-business-black/90 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-business-black/30 min-w-[200px] font-inter">
                Contact Sales
              </button>
            </div>
            <div className="flex justify-center items-center mt-6 space-x-8 text-sm text-business-black/60">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-future-green mr-2" />
                <span className="font-inter">14-day free trial</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-future-green mr-2" />
                <span className="font-inter">No credit card required</span>
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-future-green mr-2" />
                <span className="font-inter">Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanComparisonSection;
