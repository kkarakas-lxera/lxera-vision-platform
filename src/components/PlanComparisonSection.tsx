
import { Check, X, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PlanComparisonSection = () => {
  const featureExplanations: {[key: string]: string} = {
    "AI Hyper-Personalized Learning Engine": "Adapts learning based on role, behavior, and goals using LLMs and RAG.",
    "AI Avatar-Powered Content Creation": "Generate dynamic video lessons with lifelike avatars.",
    "Real-Time Adaptive Gamification": "Game mechanics adjust to each learner's behavior and progress.",
    "Smart Nudging & Behavioral Triggers": "Nudges and reminders based on user behavior via Slack/email.",
    "Human-in-the-Loop Intelligence": "Combine scalable AI with human review for high-trust learning.",
    "Executive-Ready Analytics Dashboard": "Visualize outcomes and innovation metrics across departments.",
    "Knowledge Base Transformation": "Turn SOPs and reports into microlearning modules.",
    "Taxonomist Skill Gap Engine": "Automatically detects role-based skill gaps and maps them to personalized learning paths.",
    "Organization-Specific AI Mentor": "Private AI chatbot trained on your company's content to support contextual, role-specific learning.",
    "Enterprise-Grade Security & Compliance": "SOC2 & GDPR aligned, encryption, role-based access.",
    "Low-Code / No-Code Innovation Sandbox": "Enable bottom-up innovation through app building and automation.",
    "SSO/HRIS Integrations": "Sync with HR systems to personalize content by job role."
  };

  const comparisonFeatures = [
    {
      category: "Core Learning Features",
      features: [
        { name: "AI Hyper-Personalized Learning Engine", core: true, enterprise: true },
        { name: "AI Avatar-Powered Content Creation", core: true, enterprise: true },
        { name: "Real-Time Adaptive Gamification", core: true, enterprise: true },
        { name: "Smart Nudging & Behavioral Triggers", core: true, enterprise: true },
      ]
    },
    {
      category: "Intelligence & Analytics",
      features: [
        { name: "Human-in-the-Loop Intelligence", core: true, enterprise: true },
        { name: "Executive-Ready Analytics Dashboard", core: true, enterprise: true },
        { name: "Knowledge Base Transformation", core: true, enterprise: true },
        { name: "Taxonomist Skill Gap Engine", core: true, enterprise: true },
      ]
    },
    {
      category: "Enterprise Features",
      features: [
        { name: "Organization-Specific AI Mentor", core: false, enterprise: true },
        { name: "Enterprise-Grade Security & Compliance", core: false, enterprise: true },
        { name: "Low-Code / No-Code Innovation Sandbox", core: false, enterprise: true },
        { name: "SSO/HRIS Integrations", core: false, enterprise: true },
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
                          <TableCell className="py-4 px-6 text-center">
                            {feature.core ? (
                              <Check className="h-6 w-6 text-future-green mx-auto" />
                            ) : (
                              <X className="h-6 w-6 text-gray-300 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="py-4 px-6 text-center">
                            {feature.enterprise ? (
                              <Check className="h-6 w-6 text-business-black mx-auto" />
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
