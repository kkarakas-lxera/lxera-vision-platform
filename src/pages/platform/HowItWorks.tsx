
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Users, Brain, BarChart3, MessageCircle, Lightbulb, ArrowRight, CheckCircle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import ContactSalesModal from "@/components/ContactSalesModal";

const HowItWorks = () => {
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);
  const journeySteps = [
    {
      step: "1",
      title: "Onboarding & Profiling",
      description: "AI creates personalized learner profiles based on skills, goals, and learning preferences",
      icon: Users,
      features: ["Skill assessment", "Learning style analysis", "Goal setting", "Team integration"]
    },
    {
      step: "2", 
      title: "Personalized Content",
      description: "Dynamic content curation based on individual needs and organizational objectives",
      icon: Brain,
      features: ["Adaptive pathways", "Content recommendations", "Skill gap detection", "Progress tracking"]
    },
    {
      step: "3",
      title: "Active Learning",
      description: "Engaging experiences with real-time support and collaboration tools",
      icon: Zap,
      features: ["Interactive modules", "Peer collaboration", "AI mentorship", "Innovation projects"]
    },
    {
      step: "4",
      title: "Insights & Growth",
      description: "Continuous feedback loop with analytics driving improvement and innovation",
      icon: BarChart3,
      features: ["Performance analytics", "Engagement insights", "Impact measurement", "Future planning"]
    }
  ];

  const touchpoints = [
    {
      title: "AI-Powered Guidance",
      description: "24/7 intelligent support that adapts to learning patterns",
      icon: Brain
    },
    {
      title: "Peer Collaboration",
      description: "Connect with colleagues for shared learning experiences",
      icon: Users
    },
    {
      title: "Expert Mentorship", 
      description: "Access to subject matter experts and industry leaders",
      icon: MessageCircle
    },
    {
      title: "Innovation Labs",
      description: "Hands-on spaces for experimentation and creative problem-solving",
      icon: Lightbulb
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <Target className="w-4 h-4 mr-2" />
            Platform Overview
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-8 leading-tight font-inter">
            How LXERA
            <span className="text-business-black block mt-2"> Works</span>
          </h1>
          <p className="text-lg sm:text-xl text-business-black/70 max-w-4xl mx-auto mb-12 leading-relaxed font-normal font-inter">
            Discover the intelligent ecosystem that transforms learning into innovation. 
            From personalized onboarding to measurable business impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ProgressiveDemoCapture
              source="how_it_works_platform_page"
              buttonText="Request a Demo"
              onSuccess={() => {}}
            />
            <Button variant="outline" size="lg" className="rounded-xl px-8 py-4 text-base transition-all duration-300 hover:scale-105 font-inter font-normal">
              Watch How It Works
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Journey Flow Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              The Complete Learning Journey
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Follow the intelligent path from initial engagement to transformative innovation
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
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Support Throughout Your Journey
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Multiple touchpoints ensure learners are never alone in their growth journey
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
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-lg sm:text-xl text-business-black/70 mb-8 leading-relaxed font-normal font-inter">
            Discover how LXERA can revolutionize learning and innovation in your organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ProgressiveDemoCapture
              source="how_it_works_platform_page"
              buttonText="Request a Demo"
              onSuccess={() => {}}
            />
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-xl px-8 py-4 text-base transition-all duration-300 hover:scale-105 font-inter font-normal"
              onClick={() => setIsContactSalesModalOpen(true)}
            >
              Talk to Our Experts
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Modals */}
      <ContactSalesModal 
        isOpen={isContactSalesModalOpen} 
        onClose={() => setIsContactSalesModalOpen(false)}
      />
    </div>
  );
};

export default HowItWorks;
