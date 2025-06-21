import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Users, BarChart3, Target, Zap, Shield, Sparkles, ArrowRight, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const AIEngine = () => {
  const aiCapabilities = [
    {
      title: "Organizational Intelligence Analysis",
      description: "Deep insights into enterprise capabilities, strategic gaps, and transformation readiness across all business units",
      icon: Users,
      features: [
        "Enterprise capability mapping",
        "Strategic development pathways", 
        "Innovation readiness assessment",
        "Organizational transformation indicators"
      ]
    },
    {
      title: "Strategic Impact Forecasting",
      description: "AI-powered prediction of transformation ROI, business outcomes, and competitive advantage opportunities",
      icon: TrendingUp,
      features: [
        "Transformation success modeling",
        "Business ROI forecasting",
        "Strategic risk assessment",
        "Competitive advantage analysis"
      ]
    },
    {
      title: "Innovation Acceleration Engine",
      description: "Intelligent systems that identify strategic opportunities while accelerating organizational capability development",
      icon: Zap,
      features: [
        "Strategic opportunity identification",
        "Enterprise transformation acceleration",
        "Competitive readiness optimization",
        "Strategic capability advancement"
      ]
    },
    {
      title: "Executive Decision Intelligence",
      description: "Strategic insights and recommendations tailored for C-suite and executive leadership decision-making",
      icon: Brain,
      features: [
        "Executive strategic insights",
        "Business planning support",
        "Competitive positioning analysis",
        "Organizational transformation guidance"
      ]
    }
  ];

  const solutions = [
    {
      title: "Strategic Enterprise Planning",
      description: "AI-driven insights for future capability requirements and competitive positioning gaps",
      impact: "90% more accurate strategic planning"
    },
    {
      title: "Innovation Pipeline Acceleration", 
      description: "Intelligent identification and development of innovation capabilities across the enterprise",
      impact: "3x faster innovation delivery"
    },
    {
      title: "Transformation Risk Management",
      description: "Predictive analytics to identify and address strategic transformation challenges proactively",
      impact: "75% reduction in transformation risks"
    },
    {
      title: "Executive Performance Enhancement",
      description: "AI-powered recommendations for strategic capability building and competitive advantage",
      impact: "60% improvement in strategic effectiveness"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-6 py-3 rounded-3xl text-business-black font-medium text-sm mb-6">
            <Brain className="w-4 h-4 mr-2" />
            Enterprise Intelligence Platform
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            AI Engine for
            <span className="text-business-black"> Enterprise Transformation</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            The strategic intelligence core that powers enterprise transformation for organizational leaders. 
            Drive measurable competitive advantage through AI-powered insights and predictive analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Schedule Executive Demo
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Download Strategic Brief
            </Button>
          </div>
        </div>
      </section>

      {/* AI Capabilities Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Four Pillars of Enterprise Intelligence
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Advanced AI capabilities designed for organizational leaders driving strategic transformation and competitive advantage
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {aiCapabilities.map((capability, index) => {
              const IconComponent = capability.icon;
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
                      {capability.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {capability.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {capability.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-business-black/70">
                          <CheckCircle className="w-4 h-4 text-future-green mr-3 flex-shrink-0" />
                          {feature}
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

      {/* Solutions Powered Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Strategic Solutions Powered by AI
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              See how our AI engine drives measurable organizational transformation and strategic outcomes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-business-black">
                      {solution.title}
                    </CardTitle>
                    <div className="bg-future-green/20 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-business-black">
                        {solution.impact}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="text-business-black/60">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Specifications */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-business-black to-business-black/90 text-white overflow-hidden">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                Enterprise-Grade AI Architecture
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                Built for scale, security, and strategic transformation
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">99.9%</div>
                <div className="text-sm text-white/70">Enterprise Uptime SLA</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">SOC2</div>
                <div className="text-sm text-white/70">Compliance Ready</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-future-green mb-2">24/7</div>
                <div className="text-sm text-white/70">Strategic Intelligence</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Transform Your Organization with Strategic AI
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            Join industry leaders using our AI engine to drive measurable transformation and competitive advantage
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Request Strategic Demo
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/platform/engagement-insights">
                Explore Strategic Insights <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIEngine;
