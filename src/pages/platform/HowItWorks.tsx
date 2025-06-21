
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Users, Brain, BarChart3, MessageCircle, Lightbulb, ArrowRight, CheckCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorks = () => {
  const journeySteps = [
    {
      step: "1",
      title: "Strategic Assessment & Onboarding",
      description: "AI-powered organizational profiling that aligns learning strategy with business objectives and workforce transformation goals",
      icon: Users,
      features: ["Enterprise skill gap analysis", "Strategic alignment mapping", "Leadership dashboard setup", "Organizational integration planning"]
    },
    {
      step: "2", 
      title: "Intelligent Content Strategy",
      description: "Dynamic learning ecosystems that scale across departments while maintaining alignment with innovation and transformation initiatives",
      icon: Brain,
      features: ["Role-based learning pathways", "Innovation skill development", "Cross-functional collaboration tools", "Leadership development tracks"]
    },
    {
      step: "3",
      title: "Transformation Acceleration",
      description: "Active learning experiences that drive measurable business outcomes through innovation projects and strategic skill development",
      icon: Zap,
      features: ["Innovation lab integration", "Digital transformation projects", "Cross-departmental collaboration", "Executive mentorship programs"]
    },
    {
      step: "4",
      title: "Strategic Impact Measurement",
      description: "Executive-level analytics that demonstrate ROI and organizational transformation progress with predictive insights",
      icon: BarChart3,
      features: ["C-suite dashboard reporting", "ROI measurement tools", "Transformation impact metrics", "Strategic planning insights"]
    }
  ];

  const touchpoints = [
    {
      title: "Executive Coaching & AI Guidance",
      description: "Strategic support for leadership development and organizational change management",
      icon: Brain
    },
    {
      title: "Cross-Functional Innovation Teams",
      description: "Structured collaboration environments for driving transformation initiatives",
      icon: Users
    },
    {
      title: "Expert Advisory Network", 
      description: "Access to industry thought leaders and transformation specialists",
      icon: MessageCircle
    },
    {
      title: "Innovation Centers of Excellence",
      description: "Dedicated spaces for experimentation and strategic capability development",
      icon: Lightbulb
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-6 py-3 rounded-3xl text-business-black font-medium text-sm mb-6">
            <Target className="w-4 h-4 mr-2" />
            Strategic Transformation Platform
          </div>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            How LXERA Drives
            <span className="text-business-black"> Organizational Transformation</span>
          </h1>
          <p className="text-lg text-business-black/70 max-w-3xl mx-auto mb-8">
            A comprehensive platform designed for HR, L&D, Innovation and Digital Transformation Leaders. 
            From strategic alignment to measurable business impact - see how we accelerate organizational change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Schedule Executive Demo
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Download Strategic Overview
            </Button>
          </div>
        </div>
      </section>

      {/* Journey Flow Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Strategic Transformation Journey
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              A proven methodology for driving organizational change through strategic learning and innovation enablement
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {journeySteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-future-green/10 rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-business-black" />
                      </div>
                      <div className="w-8 h-8 bg-future-green rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {step.step}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-business-black/70">
                          <CheckCircle className="w-4 h-4 text-future-green mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  {index < journeySteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-future-green" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Support Touchpoints */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Strategic Support Throughout Transformation
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Comprehensive support system designed specifically for organizational leaders driving change
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {touchpoints.map((touchpoint, index) => {
              const IconComponent = touchpoint.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-lg text-business-black">
                      {touchpoint.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {touchpoint.description}
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
            Ready to Drive Strategic Transformation?
          </h2>
          <p className="text-lg text-business-black/70 mb-8">
            Join forward-thinking leaders who are using LXERA to accelerate organizational innovation and workforce transformation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Schedule Strategic Consultation
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/platform/ai-engine">
                Explore AI Capabilities <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
