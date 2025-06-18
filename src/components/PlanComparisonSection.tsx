
import { Check, X } from "lucide-react";

const PlanComparisonSection = () => {
  const comparisonFeatures = [
    {
      category: "Learning Intelligence",
      features: [
        { 
          name: "AI Hyper-Personalized Learning Engine", 
          core: "Adaptive based on role & goals", 
          enterprise: "Advanced with RAG + behavior modeling",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "AI Avatar-Powered Content Creation", 
          core: "20 min/user/month", 
          enterprise: "40+ min/user/month + pooled capacity",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Skill Gap Engine", 
          core: "Standard taxonomy", 
          enterprise: "Custom org taxonomy mapping",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Smart Nudging", 
          core: "Slack/email reminders", 
          enterprise: "Event-driven workflows",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Human-in-the-Loop Intelligence", 
          core: "Peer-based review", 
          enterprise: "SME workflows + traceable edits",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Organization-Specific AI Mentor", 
          core: "", 
          enterprise: "AI trained on client content",
          coreAvailable: false,
          enterpriseAvailable: true
        }
      ]
    },
    {
      category: "Learning Tools",
      features: [
        { 
          name: "Real-Time Adaptive Gamification", 
          core: "Individual progress mechanics", 
          enterprise: "Team-based challenges + deeper logic",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "SOP to Microlearning Converter", 
          core: "Convert docs to bite-sized modules", 
          enterprise: "Plus tagging, versioning, and permissions",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Learning Journey Templates", 
          core: "Predefined templates", 
          enterprise: "Fully customizable per team/role",
          coreAvailable: true,
          enterpriseAvailable: true
        }
      ]
    },
    {
      category: "Analytics & Insights",
      features: [
        { 
          name: "Learner Dashboard", 
          core: "Progress & activity data", 
          enterprise: "Org-wide dashboards, KPIs, CSV exports",
          coreAvailable: true,
          enterpriseAvailable: true
        }
      ]
    },
    {
      category: "Knowledge & Innovation",
      features: [
        { 
          name: "Shared Knowledge Base Access", 
          core: "Global content search", 
          enterprise: "Private org-level KB with search indexing",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Low-Code Innovation Sandbox", 
          core: "", 
          enterprise: "Build internal tools using drag-and-drop logic",
          coreAvailable: false,
          enterpriseAvailable: true
        },
        { 
          name: "Innovation Hub Access", 
          core: "", 
          enterprise: "Run idea campaigns, collect and evaluate ideas",
          coreAvailable: false,
          enterpriseAvailable: true
        }
      ]
    },
    {
      category: "Live & Social",
      features: [
        { 
          name: "Social Learning Communities", 
          core: "Open community forums", 
          enterprise: "Moderated team channels & mentoring",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Live AI Avatar Streaming", 
          core: "", 
          enterprise: "Included or discounted",
          coreAvailable: false,
          enterpriseAvailable: true
        }
      ]
    },
    {
      category: "Integrations & Security",
      features: [
        { 
          name: "HRIS/SSO Integrations", 
          core: "", 
          enterprise: "Enterprise-ready identity control",
          coreAvailable: false,
          enterpriseAvailable: true
        },
        { 
          name: "Compliance & Security", 
          core: "Standard encrypted platform", 
          enterprise: "SOC2, GDPR, audit logs, RBAC",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "White-label Branding", 
          core: "", 
          enterprise: "Custom logo, URL, brand tone",
          coreAvailable: false,
          enterpriseAvailable: true
        }
      ]
    },
    {
      category: "Onboarding & Support",
      features: [
        { 
          name: "Guided Self-Onboarding", 
          core: "Checklist, templates", 
          enterprise: "Dedicated onboarding manager",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Standard Support", 
          core: "Email support", 
          enterprise: "Priority support + Success Manager",
          coreAvailable: true,
          enterpriseAvailable: true
        }
      ]
    },
    {
      category: "Content Support",
      features: [
        { 
          name: "Dedicated SME Support", 
          core: "", 
          enterprise: "Content review by expert",
          coreAvailable: false,
          enterpriseAvailable: true
        },
        { 
          name: "Dedicated Learning Experience Designer (LXD)", 
          core: "", 
          enterprise: "Learning design partner for course creation",
          coreAvailable: false,
          enterpriseAvailable: true
        }
      ]
    }
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Compare plans and features
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Choose the plan that best fits your organization's learning and innovation needs
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-0">
              <div className="px-4 py-3">
                <span className="text-sm font-medium text-gray-500">Features</span>
              </div>
              <div className="px-4 py-3 text-center border-l border-gray-200 bg-gradient-to-br from-future-green/10 to-smart-beige/30">
                <div className="text-sm font-semibold text-gray-900">Core</div>
                <div className="text-xs text-gray-500 mt-0.5">$199/month</div>
              </div>
              <div className="px-4 py-3 text-center border-l border-gray-200 bg-gradient-to-br from-business-black/5 to-business-black/10">
                <div className="text-sm font-semibold text-gray-900">Enterprise</div>
                <div className="text-xs text-gray-500 mt-0.5">Custom pricing</div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          {comparisonFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              {/* Category Header */}
              <div className="bg-gray-50/50 border-b border-gray-100">
                <div className="px-4 py-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {category.category}
                  </h4>
                </div>
              </div>
              
              {/* Category Features */}
              {category.features.map((feature, featureIndex) => (
                <div 
                  key={featureIndex}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/30 transition-colors"
                >
                  <div className="grid grid-cols-3 gap-0 py-2">
                    <div className="px-4 flex items-center min-h-[40px]">
                      <span className="text-sm text-gray-900">
                        {feature.name}
                      </span>
                    </div>
                    <div className="px-4 flex items-center justify-center min-h-[40px] border-l border-gray-200 bg-gradient-to-br from-future-green/5 to-smart-beige/15">
                      {feature.coreAvailable ? (
                        feature.core ? (
                          <div className="text-xs text-gray-600 text-center leading-tight">
                            {feature.core}
                          </div>
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )
                      ) : (
                        <X className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                    <div className="px-4 flex items-center justify-center min-h-[40px] border-l border-gray-200 bg-gradient-to-br from-business-black/3 to-business-black/8">
                      {feature.enterpriseAvailable ? (
                        feature.enterprise ? (
                          <div className="text-xs text-gray-600 text-center leading-tight">
                            {feature.enterprise}
                          </div>
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )
                      ) : (
                        <X className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Call-to-Action */}
        <div className="text-center mt-8">
          <p className="text-base text-gray-600 mb-4">
            Need help choosing the right plan? Our team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors">
              Start Free Trial
            </button>
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanComparisonSection;
