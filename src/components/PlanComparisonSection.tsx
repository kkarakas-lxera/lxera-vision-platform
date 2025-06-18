
import { Check, X, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PlanComparisonSection = () => {
  const featureExplanations: {[key: string]: string} = {
    "AI Hyper-Personalized Learning Engine": "Adapts learning based on role, behavior, and goals using LLMs and RAG.",
    "AI Avatar-Powered Content Creation": "Generate dynamic video lessons with lifelike avatars.",
    "Skill Gap Engine": "Automatically detects role-based skill gaps and maps them to personalized learning paths.",
    "Smart Nudging": "Nudges and reminders based on user behavior via Slack/email.",
    "Human-in-the-Loop Intelligence": "Combine scalable AI with human review for high-trust learning.",
    "Organization-Specific AI Mentor": "Private AI chatbot trained on your company's content to support contextual, role-specific learning.",
    "Real-Time Adaptive Gamification": "Game mechanics adjust to each learner's behavior and progress.",
    "SOP to Microlearning Converter": "Turn SOPs and reports into microlearning modules.",
    "Learning Journey Templates": "Pre-built learning paths that can be customized for different roles and teams.",
    "Learner Dashboard": "Visualize outcomes and innovation metrics across departments.",
    "Shared Knowledge Base Access": "Access to global or organization-specific knowledge repositories.",
    "Low-Code Innovation Sandbox": "Enable bottom-up innovation through app building and automation.",
    "Innovation Hub Access": "Platform for collecting, evaluating, and implementing innovative ideas.",
    "Social Learning Communities": "Collaborative learning spaces for peer interaction and knowledge sharing.",
    "Live AI Avatar Streaming": "Real-time interactive sessions with AI avatars for live learning experiences.",
    "HRIS/SSO Integrations": "Sync with HR systems to personalize content by job role.",
    "Compliance & Security": "SOC2 & GDPR aligned, encryption, role-based access.",
    "White-label Branding": "Customize the platform with your organization's branding and identity.",
    "Guided Self-Onboarding": "Structured onboarding process with checklists and templates.",
    "Standard Support": "Customer support and assistance channels.",
    "Dedicated SME Support": "Subject Matter Expert support for content review and validation.",
    "Dedicated Learning Experience Designer (LXD)": "Professional learning design partner for course creation and optimization."
  };

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
    <TooltipProvider>
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Compare plans and features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that best fits your organization's learning and innovation needs
            </p>
          </div>

          {/* Plan Headers */}
          <div className="grid grid-cols-12 gap-6 mb-12">
            <div className="col-span-6"></div>
            <div className="col-span-3 text-center">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Core</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">$199</div>
                <div className="text-sm text-gray-500 mb-4">per user/month</div>
                <button className="w-full bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                  Get started
                </button>
              </div>
            </div>
            <div className="col-span-3 text-center">
              <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">Custom</div>
                <div className="text-sm text-gray-500 mb-4">pricing</div>
                <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Contact sales
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {comparisonFeatures.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                {/* Category Header */}
                <div className="bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 py-4 px-6">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {category.category}
                      </h4>
                    </div>
                  </div>
                </div>
                
                {/* Category Features */}
                {category.features.map((feature, featureIndex) => (
                  <div 
                    key={featureIndex}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-6 py-4 px-6">
                      <div className="col-span-6 flex items-center">
                        <span className="font-medium text-gray-900 mr-2">
                          {feature.name}
                        </span>
                        {featureExplanations[feature.name] && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                <Info className="h-4 w-4 text-gray-400" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent 
                              side="top" 
                              className="max-w-xs bg-gray-900 text-white p-3 text-sm rounded-lg"
                            >
                              {featureExplanations[feature.name]}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="col-span-3 flex items-center justify-center">
                        {feature.coreAvailable ? (
                          feature.core ? (
                            <div className="text-sm text-gray-600 text-center">
                              {feature.core}
                            </div>
                          ) : (
                            <Check className="h-5 w-5 text-green-500" />
                          )
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div className="col-span-3 flex items-center justify-center">
                        {feature.enterpriseAvailable ? (
                          feature.enterprise ? (
                            <div className="text-sm text-gray-600 text-center">
                              {feature.enterprise}
                            </div>
                          ) : (
                            <Check className="h-5 w-5 text-green-500" />
                          )
                        ) : (
                          <X className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Call-to-Action */}
          <div className="text-center mt-12">
            <p className="text-lg text-gray-600 mb-6">
              Need help choosing the right plan? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Start Free Trial
              </button>
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PlanComparisonSection;
