
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Lightbulb, CheckCircle, Rocket, Zap, Trophy, Building2, Target, TrendingUp, Users, Brain, Sparkles } from "lucide-react";

const EnterpriseInnovation = () => {
  const innovationFramework = [
    {
      phase: "Discover",
      icon: Lightbulb,
      title: "Strategic Innovation Discovery",
      description: "Identify opportunities and challenges across your enterprise organization with strategic focus",
      deliverables: ["Innovation audit", "Strategic opportunity mapping", "Executive stakeholder analysis"]
    },
    {
      phase: "Design",
      icon: Target,
      title: "Strategic Framework Development", 
      description: "Create comprehensive innovation strategies aligned with enterprise business goals and objectives",
      deliverables: ["Innovation roadmap", "Strategic resource allocation", "Executive success metrics"]
    },
    {
      phase: "Deploy",
      icon: Rocket,
      title: "Enterprise Implementation",
      description: "Execute innovation initiatives with continuous monitoring and strategic optimization",
      deliverables: ["Strategic pilot programs", "Enterprise-wide deployment", "Strategic impact measurement"]
    }
  ];

  const innovationPotentials = [
    {
      scenario: "Manufacturing Innovation Revolution",
      industry: "Manufacturing",
      vision: "Transform 500+ frontline workers into innovation catalysts",
      outcome: "15 breakthrough process improvements within 6 months",
      impact: "30% reduction in operational inefficiencies",
      icon: Building2,
      gradient: "from-orange-500 to-red-500"
    },
    {
      scenario: "Financial Services Transformation",
      industry: "Financial Services", 
      vision: "Enable cross-functional innovation labs across global offices",
      outcome: "3x faster digital product development cycles",
      impact: "300% increase in customer-centric solutions",
      icon: TrendingUp,
      gradient: "from-orange-500 to-red-500"
    },
    {
      scenario: "Healthcare Innovation Network",
      industry: "Healthcare",
      vision: "Connect 1000+ healthcare professionals in collaborative innovation",
      outcome: "Revolutionary patient care solutions through rapid prototyping",
      impact: "50% improvement in patient outcome innovations",
      icon: Users,
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const roiMetrics = [
    { metric: "Strategic ROI Increase", value: "340%", description: "Average return on innovation investment" },
    { metric: "Time-to-Market", value: "3x", description: "Faster innovation cycles" },
    { metric: "Leadership Engagement", value: "85%", description: "Innovation participation rate" },
    { metric: "Success Rate", value: "92%", description: "Innovation project completion" }
  ];

  const implementationBenefits = [
    "3x faster innovation cycles",
    "Strategic cross-functional collaboration",
    "Idea-to-market acceleration", 
    "Innovation culture building",
    "Knowledge sharing platforms",
    "Rapid prototype development tools"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-smart-beige">
      <SEO 
        title="Enterprise Innovation Enablement - LXERA"
        description="Accelerate innovation across your enterprise. Build a culture of innovation with collaborative platforms and rapid deployment capabilities."
        keywords="enterprise innovation, innovation labs, rapid deployment, cross-functional teams, innovation culture"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-6 py-2 text-sm font-medium rounded-full shadow-lg">
              <Building2 className="w-4 h-4 mr-2" />
              Accelerate Innovation
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-8 leading-tight font-inter">
              Strategic Innovation at
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent block mt-2">
                Enterprise Scale
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed font-normal font-inter">
              Transform your organization into a strategic innovation powerhouse. Break down silos, accelerate ideation, and deliver breakthrough solutions that drive competitive advantage.
            </p>
          </div>

          {/* ROI Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {roiMetrics.map((item, index) => (
              <Card key={index} className="text-center border-0 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
                <CardContent className="pt-8 pb-6">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-3 font-inter">
                    {item.value}
                  </div>
                  <div className="text-sm font-medium text-business-black mb-2 font-inter">{item.metric}</div>
                  <div className="text-xs text-business-black/60 font-normal font-inter">{item.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl transition-all duration-300 px-8 py-4 text-base font-medium rounded-xl border-0 font-inter"
            >
              Schedule Strategic Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-business-black/20 bg-white/80 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-base rounded-xl font-inter font-normal"
            >
              View Executive Case Studies
            </Button>
          </div>
        </div>
      </section>

      {/* Innovation Framework */}
      <section className="py-24 px-6 lg:px-12 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Proven Strategic Innovation Methodology
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Our structured approach to enterprise innovation transformation for strategic leaders
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {innovationFramework.map((phase, index) => {
              const IconComponent = phase.icon;
              return (
                <Card key={index} className="border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                  {/* Phase number indicator */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-bl-3xl flex items-center justify-center">
                    <span className="text-white font-medium text-base font-inter">{index + 1}</span>
                  </div>
                  
                  <CardHeader className="text-center pb-4 pt-8">
                    <div className="relative mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        <IconComponent className="w-10 h-10 text-orange-600" />
                      </div>
                      <Badge className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg px-4 py-1 text-sm font-medium font-inter">
                        {phase.phase}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-medium text-business-black group-hover:text-orange-600 transition-colors mb-4 font-inter">
                      {phase.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-8">
                    <CardDescription className="text-business-black/70 leading-relaxed mb-8 text-center text-sm sm:text-base font-normal font-inter">
                      {phase.description}
                    </CardDescription>
                    
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-business-black mb-4 text-center font-inter">Key Deliverables</div>
                      <div className="space-y-3">
                        {phase.deliverables.map((deliverable, i) => (
                          <div key={i} className="flex items-start text-sm text-business-black/80 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg px-4 py-3">
                            <CheckCircle className="w-4 h-4 text-orange-600 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="font-normal font-inter">{deliverable}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Connecting arrow */}
                  {index < innovationFramework.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Innovation Potential */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 border-0 shadow-lg rounded-full text-sm font-medium font-inter">
              <Brain className="w-4 h-4 mr-2" />
              Innovation Potential
              <Sparkles className="w-4 h-4 ml-2" />
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Envision Your Innovation Future
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Picture the transformative possibilities when your organization embraces strategic innovation at scale
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {innovationPotentials.map((potential, index) => {
              const IconComponent = potential.icon;
              return (
                <Card key={index} className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
                  <div className={`h-2 bg-gradient-to-r ${potential.gradient}`}></div>
                  
                  <CardHeader>
                    <div className="flex items-center mb-6">
                      <div className={`w-14 h-14 bg-gradient-to-r ${potential.gradient} rounded-2xl flex items-center justify-center mr-4 shadow-lg`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-medium text-business-black mb-2 font-inter">{potential.scenario}</CardTitle>
                        <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50 text-xs font-normal font-inter">
                          {potential.industry}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-8">
                    <div className="space-y-6">
                      <div>
                        <div className="text-sm font-medium text-business-black mb-3 flex items-center font-inter">
                          <Lightbulb className="w-4 h-4 mr-2 text-orange-600" />
                          Vision:
                        </div>
                        <div className="text-sm text-business-black/70 italic leading-relaxed font-normal font-inter">{potential.vision}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-business-black mb-3 flex items-center font-inter">
                          <Target className="w-4 h-4 mr-2 text-orange-600" />
                          Potential Outcome:
                        </div>
                        <div className="text-sm text-business-black/70 leading-relaxed font-normal font-inter">{potential.outcome}</div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
                        <div className="text-sm font-medium text-business-black mb-2 flex items-center font-inter">
                          <Rocket className="w-4 h-4 mr-2 text-orange-600" />
                          Expected Impact:
                        </div>
                        <div className="text-sm font-medium text-orange-600 font-inter">{potential.impact}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Implementation Benefits */}
      <section className="py-24 px-6 lg:px-12 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-12 font-inter">
                Strategic Enterprise Innovation Impact
              </h2>
              <div className="space-y-6">
                {implementationBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-base sm:text-lg text-business-black/80 group-hover:text-business-black transition-colors font-normal font-inter">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-12 text-center shadow-xl border border-orange-100">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4 font-inter">
                340%
              </div>
              <div className="text-xl sm:text-2xl font-medium text-business-black mb-6 font-inter">Strategic Innovation ROI</div>
              <div className="text-business-black/70 leading-relaxed mb-8 text-base sm:text-lg font-normal font-inter">
                Enterprise organizations implementing our strategic innovation framework see exceptional returns on their innovation investments
              </div>
              <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2 font-inter">
                  92%
                </div>
                <div className="text-sm text-business-black/70 font-normal font-inter">Strategic Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-16 shadow-2xl border border-white/20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-white mb-8 font-inter">
              Ready to Lead Strategic Innovation?
            </h2>
            <p className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-normal font-inter">
              Join strategic leaders who are transforming their organizations through strategic innovation. The future belongs to those who innovate strategically today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 px-8 py-4 text-base font-medium rounded-xl border-0 font-inter"
              >
                Schedule Strategic Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 hover:border-white px-8 py-4 text-base rounded-xl font-normal font-inter"
              >
                Request Executive Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EnterpriseInnovation;
