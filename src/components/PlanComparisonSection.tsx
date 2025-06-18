
import { Check, X, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
          core: "✓ Adaptive based on role & goals", 
          enterprise: "✓ Advanced with RAG + behavior modeling",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "AI Avatar-Powered Content Creation", 
          core: "✓ 20 min/user/month", 
          enterprise: "✓ 40+ min/user/month + pooled capacity",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Skill Gap Engine", 
          core: "✓ Standard taxonomy", 
          enterprise: "✓ Custom org taxonomy mapping",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Smart Nudging", 
          core: "✓ Slack/email reminders", 
          enterprise: "✓ Event-driven workflows",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Human-in-the-Loop Intelligence", 
          core: "✓ Peer-based review", 
          enterprise: "✓ SME workflows + traceable edits",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Organization-Specific AI Mentor", 
          core: "", 
          enterprise: "✓ AI trained on client content",
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
          core: "✓ Individual progress mechanics", 
          enterprise: "✓ Team-based challenges + deeper logic",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "SOP to Microlearning Converter", 
          core: "✓ Convert docs to bite-sized modules", 
          enterprise: "✓ Plus tagging, versioning, and permissions",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Learning Journey Templates", 
          core: "✓ Predefined templates", 
          enterprise: "✓ Fully customizable per team/role",
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
          core: "✓ Progress & activity data", 
          enterprise: "✓ Org-wide dashboards, KPIs, CSV exports",
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
          core: "✓ Global content search", 
          enterprise: "✓ Private org-level KB with search indexing",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Low-Code Innovation Sandbox", 
          core: "", 
          enterprise: "✓ Build internal tools using drag-and-drop logic",
          coreAvailable: false,
          enterpriseAvailable: true
        },
        { 
          name: "Innovation Hub Access", 
          core: "", 
          enterprise: "✓ Run idea campaigns, collect and evaluate ideas",
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
          core: "✓ Open community forums", 
          enterprise: "✓ Moderated team channels & mentoring",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Live AI Avatar Streaming", 
          core: "", 
          enterprise: "✓ Included or discounted",
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
          enterprise: "✓ Enterprise-ready identity control",
          coreAvailable: false,
          enterpriseAvailable: true
        },
        { 
          name: "Compliance & Security", 
          core: "✓ Standard encrypted platform", 
          enterprise: "✓ SOC2, GDPR, audit logs, RBAC",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "White-label Branding", 
          core: "", 
          enterprise: "✓ Custom logo, URL, brand tone",
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
          core: "✓ Checklist, templates", 
          enterprise: "✓ Dedicated onboarding manager",
          coreAvailable: true,
          enterpriseAvailable: true
        },
        { 
          name: "Standard Support", 
          core: "✓ Email support", 
          enterprise: "✓ Priority support + Success Manager",
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
          enterprise: "✓ Content review by expert",
          coreAvailable: false,
          enterpriseAvailable: true
        },
        { 
          name: "Dedicated Learning Experience Designer (LXD)", 
          core: "", 
          enterprise: "✓ Learning design partner for course creation",
          coreAvailable: false,
          enterpriseAvailable: true
        }
      ]
    }
  ];

  return (
    <TooltipProvider>
      <div className="py-16 lg:py-24 bg-smart-beige/30">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-business-black mb-6">
              Compare Plans & Features
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              See exactly what's included in each plan to make the best choice for your organization
            </p>
          </div>

          {/* Comparison Table */}
          <Card className="overflow-hidden shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2 border-smart-beige bg-gradient-to-r from-smart-beige/50 to-smart-beige/30">
                    <TableHead className="text-left py-6 px-6 text-lg font-bold text-business-black">
                      Features
                    </TableHead>
                    <TableHead className="text-center py-6 px-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-business-black mb-2">Core</div>
                        <div className="text-sm text-business-black/60">$199/month</div>
                      </div>
                    </TableHead>
                    <TableHead className="text-center py-6 px-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-business-black mb-2">Enterprise</div>
                        <div className="text-sm text-business-black/60">Custom pricing</div>
                        <div className="inline-block bg-business-black text-white text-xs px-3 py-1 rounded-full mt-1">
                          Enterprise Ready
                        </div>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonFeatures.map((category, categoryIndex) => (
                    <>
                      {/* Category Header */}
                      <TableRow key={`category-${categoryIndex}`} className="bg-smart-beige/20 border-0">
                        <TableCell colSpan={3} className="py-4 px-6">
                          <h3 className="text-lg font-semibold text-business-black">
                            {category.category}
                          </h3>
                        </TableCell>
                      </TableRow>
                      
                      {/* Category Features */}
                      {category.features.map((feature, featureIndex) => (
                        <TableRow 
                          key={`${categoryIndex}-${featureIndex}`}
                          className="border-b border-smart-beige/30 hover:bg-smart-beige/10 transition-colors duration-200"
                        >
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center">
                              <span className="font-medium text-business-black/90 flex-1">
                                {feature.name}
                              </span>
                              {featureExplanations[feature.name] && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button className="ml-2 p-1 hover:bg-future-green/10 rounded-full transition-all duration-200 hover:scale-110 group">
                                      <Info className="h-4 w-4 text-future-green/70 group-hover:text-future-green transition-colors duration-200" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent 
                                    side="right" 
                                    className="max-w-xs bg-white border border-future-green/20 shadow-lg p-3 text-sm text-business-black/80"
                                    sideOffset={8}
                                  >
                                    {featureExplanations[feature.name]}
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            {feature.coreAvailable ? (
                              <div className="text-sm text-business-black/80">
                                {feature.core}
                              </div>
                            ) : (
                              <X className="h-6 w-6 text-gray-300 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            {feature.enterpriseAvailable ? (
                              <div className="text-sm text-business-black/80">
                                {feature.enterprise}
                              </div>
                            ) : (
                              <X className="h-6 w-6 text-gray-300 mx-auto" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Call-to-Action */}
          <div className="text-center mt-12">
            <p className="text-lg text-business-black/70 mb-8">
              Need help choosing the right plan? Our team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-future-green hover:bg-future-green/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-future-green/25">
                Start Free Trial
              </button>
              <button className="bg-business-black hover:bg-business-black/90 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-business-black/25">
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
