
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Clock, Brain, ArrowRight, Zap, Heart, CheckCircle, Shield, Target } from "lucide-react";
import { Link } from "react-router-dom";

const MentorshipSupport = () => {
  const supportFeatures = [
    {
      title: "Executive Advisory & AI Guidance",
      description: "Strategic support system combining AI intelligence with executive coaching for organizational transformation",
      icon: Brain,
      benefits: ["C-suite strategic guidance", "Transformation coaching", "Leadership development pathways", "Executive decision support"]
    },
    {
      title: "Strategic Mentorship Matching",
      description: "Intelligent connection of leaders with industry experts and transformation specialists based on strategic objectives",
      icon: Users,
      benefits: ["Industry expert networks", "Transformation specialist access", "Strategic objective alignment", "Leadership peer connections"]
    },
    {
      title: "24/7 Strategic Communication",
      description: "Always-available strategic support through multiple channels for critical decision-making and transformation guidance",
      icon: MessageCircle,
      benefits: ["Executive hotline access", "Strategic video sessions", "Transformation war rooms", "Crisis support channels"]
    },
    {
      title: "Global Strategic Support",
      description: "Round-the-clock support ensuring organizational transformation initiatives never stall due to time zones or availability",
      icon: Clock,
      benefits: ["Global transformation support", "Multi-timezone coverage", "Strategic escalation protocols", "Emergency transformation guidance"]
    }
  ];

  const scalabilityFeatures = [
    {
      title: "Intelligent Strategic Triage",
      description: "AI-powered routing of strategic challenges to the most appropriate transformation experts and resources",
      impact: "95% faster strategic response"
    },
    {
      title: "Strategic Knowledge Intelligence",
      description: "AI-enhanced access to transformation methodologies, best practices, and organizational change resources",
      impact: "80% self-service strategic guidance"
    },
    {
      title: "Leadership Network Orchestration",
      description: "Facilitated connections between transformation leaders for peer learning and strategic collaboration",
      impact: "4x increase in strategic partnerships"
    },
    {
      title: "Expert Resource Optimization",
      description: "Strategic allocation of transformation experts and industry specialists across multiple organizational initiatives",
      impact: "6x improvement in expert utilization"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-6 py-3 rounded-3xl text-business-black font-medium text-sm mb-6">
            <Shield className="w-4 h-4 mr-2" />
            Strategic Transformation Support
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Executive Mentorship &
            <span className="text-business-black"> Strategic Support</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            Comprehensive support ecosystem designed for HR, L&D, Innovation and Digital Transformation Leaders. 
            From strategic guidance to transformation expertise - success support is always available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Access Strategic Support
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Strategic Support Overview
            </Button>
          </div>
        </div>
      </section>

      {/* Support Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Strategic Transformation Support Ecosystem
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Multi-layered support system ensuring organizational transformation leaders get strategic guidance when critical decisions are needed
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {supportFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-business-black" />
                      </div>
                      <Zap className="w-5 h-5 text-business-black/60" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-sm text-business-black/70">
                          <CheckCircle className="w-4 h-4 text-future-green mr-3 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Strategic Scalability Focus */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Built for Strategic Scale and Personalization
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Advanced systems that maintain executive-level strategic guidance while supporting enterprise-scale transformation initiatives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {scalabilityFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-business-black">
                      {feature.title}
                    </CardTitle>
                    <div className="bg-future-green/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-business-black">
                        {feature.impact}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-business-black/60">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Support Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-business-black to-business-black/90 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                Strategic Support That Drives Success
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Committed to transformation leader success across all time zones and strategic initiatives
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">&lt; 2min</div>
                <div className="text-sm text-white/70">Strategic Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">98%</div>
                <div className="text-sm text-white/70">Strategic Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">24/7</div>
                <div className="text-sm text-white/70">Global Strategic Coverage</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Executive Benefits */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Strategic Support Benefits for Leaders
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Specifically designed support benefits that accelerate transformation success for organizational leaders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Strategic Acceleration",
                description: "Fast-track transformation initiatives with expert guidance and proven methodologies"
              },
              {
                icon: Users,
                title: "Leadership Network Access", 
                description: "Connect with industry transformation leaders and executive peer networks"
              },
              {
                icon: Brain,
                title: "AI-Enhanced Decision Support",
                description: "Strategic intelligence that augments executive decision-making and transformation planning"
              }
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-lg text-business-black mb-2">
                      {benefit.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Never Face Transformation Alone
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            Discover how comprehensive strategic support transforms organizational transformation success and leadership effectiveness
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Access Strategic Support
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/platform/security-privacy">
                Security & Compliance <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MentorshipSupport;
