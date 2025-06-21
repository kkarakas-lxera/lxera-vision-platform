
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Users, Zap, Target, ArrowRight, Sparkles, Network, TrendingUp, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

const InnovationHub = () => {
  const hubFeatures = [
    {
      title: "Strategic Innovation Labs",
      description: "Executive-sponsored innovation environments for driving digital transformation and competitive advantage",
      icon: Lightbulb,
      capabilities: ["Digital transformation projects", "Strategic capability development", "Innovation pipeline management", "Executive innovation sponsorship"]
    },
    {
      title: "Cross-Functional Innovation Teams",
      description: "Structured collaboration environments designed for organizational transformation and strategic innovation",
      icon: Users,
      capabilities: ["Change management collaboration", "Strategic project workspaces", "Leadership innovation networks", "Transformation team coordination"]
    },
    {
      title: "AI-Augmented Innovation Intelligence",
      description: "Strategic innovation insights powered by AI to accelerate organizational transformation and competitive positioning",
      icon: Zap,
      capabilities: ["Strategic opportunity identification", "Innovation ROI optimization", "Competitive intelligence integration", "Transformation feasibility analysis"]
    },
    {
      title: "Innovation Centers of Excellence",
      description: "Organizational capability centers for scaling innovation culture and digital transformation expertise",
      icon: Target,
      capabilities: ["Innovation culture development", "Strategic capability scaling", "Transformation methodology", "Executive innovation coaching"]
    }
  ];

  const innovationProcess = [
    {
      step: "Strategic Discovery",
      description: "Identify transformation opportunities and competitive advantage gaps",
      tools: ["Market intelligence", "Strategic opportunity mapping", "Competitive analysis"]
    },
    {
      step: "Innovation Strategy",
      description: "Develop strategic innovation initiatives aligned with business objectives",
      tools: ["Strategic planning tools", "Innovation portfolio management", "Executive alignment workshops"]
    },
    {
      step: "Transformation Execution",
      description: "Implement strategic innovations with organizational change management",
      tools: ["Change management frameworks", "Strategic project management", "Executive success tracking"]
    },
    {
      step: "Competitive Advantage",
      description: "Scale successful innovations for sustainable competitive differentiation",
      tools: ["Capability scaling frameworks", "Strategic impact measurement", "Organizational knowledge transfer"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-6 py-3 rounded-3xl text-business-black font-medium text-sm mb-6">
            <Rocket className="w-4 h-4 mr-2" />
            Strategic Innovation Platform
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Innovation Hub for
            <span className="text-business-black"> Organizational Transformation</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            Empower HR, L&D, Innovation and Digital Transformation Leaders with comprehensive innovation platforms 
            that drive strategic transformation, competitive advantage, and organizational capability development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Explore Strategic Innovation Tools
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Download Innovation Framework
            </Button>
          </div>
        </div>
      </section>

      {/* Hub Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Strategic Innovation Ecosystem
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Comprehensive innovation platform designed for organizational leaders driving transformation and competitive advantage
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {hubFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-business-black" />
                      </div>
                      <Sparkles className="w-5 h-5 text-business-black/60" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.capabilities.map((capability, capIndex) => (
                        <div key={capIndex} className="text-sm text-business-black/70 bg-future-green/10 rounded-lg px-3 py-2">
                          {capability}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Innovation Process */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Strategic Innovation Methodology
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Proven framework for driving organizational transformation through strategic innovation and competitive advantage development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {innovationProcess.map((phase, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-future-green to-future-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <CardTitle className="text-lg text-business-black mb-2">
                    {phase.step}
                  </CardTitle>
                  <CardDescription className="text-business-black/60 mb-4">
                    {phase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.tools.map((tool, toolIndex) => (
                      <li key={toolIndex} className="text-sm text-business-black/70 bg-white/50 rounded px-3 py-1">
                        {tool}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                {index < innovationProcess.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-future-green" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Impact Metrics */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-business-black to-business-black/90 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                Strategic Innovation Impact
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Measurable outcomes that drive competitive advantage
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">5x</div>
                <div className="text-sm text-white/70">Innovation Project Success</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">80%</div>
                <div className="text-sm text-white/70">Faster Time-to-Market</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">450%</div>
                <div className="text-sm text-white/70">Innovation ROI</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Drive Strategic Transformation Through Innovation
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            Empower organizational leaders with the innovation platform that transforms ideas into competitive advantage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Schedule Strategic Innovation Demo
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/platform/mentorship-support">
                Executive Support <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InnovationHub;
