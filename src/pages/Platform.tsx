import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Sparkles, BarChart3, Lightbulb, MessageCircle, Shield, Plug, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";

const Platform = () => {

  const platformFeatures = [
    {
      title: "How LXERA Works",
      description: "Discover the core methodology behind LXERA's transformative learning platform",
      icon: Target,
      href: "/platform/how-it-works",
      color: "bg-gradient-to-br from-blue-100 to-cyan-100",
      iconColor: "text-blue-600"
    },
    {
      title: "AI Engine",
      description: "Advanced AI that powers personalized learning experiences at scale",
      icon: Sparkles,
      href: "/platform/ai-engine",
      color: "bg-gradient-to-br from-purple-100 to-indigo-100",
      iconColor: "text-purple-600"
    },
    {
      title: "Engagement & Insights",
      description: "Real-time analytics and engagement tracking for data-driven decisions",
      icon: BarChart3,
      href: "/platform/engagement-insights",
      color: "bg-gradient-to-br from-emerald-100 to-teal-100",
      iconColor: "text-emerald-600"
    },
    {
      title: "Innovation Hub",
      description: "Collaborative space for innovation, ideation, and knowledge sharing",
      icon: Lightbulb,
      href: "/platform/innovation-hub",
      color: "bg-gradient-to-br from-yellow-100 to-amber-100",
      iconColor: "text-amber-600"
    },
    {
      title: "Mentorship & Support",
      description: "AI-powered mentorship and support systems for continuous growth",
      icon: MessageCircle,
      href: "/platform/mentorship-support",
      color: "bg-gradient-to-br from-rose-100 to-pink-100",
      iconColor: "text-rose-600"
    },
    {
      title: "Security & Privacy",
      description: "Enterprise-grade security and privacy protection for your data",
      icon: Shield,
      href: "/platform/security-privacy",
      color: "bg-gradient-to-br from-gray-100 to-slate-100",
      iconColor: "text-gray-600"
    },
    {
      title: "Integrations",
      description: "Seamless integration with your existing tools and workflows",
      icon: Plug,
      href: "/platform/integrations",
      color: "bg-gradient-to-br from-green-100 to-emerald-100",
      iconColor: "text-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-business-black mb-6">
            The LXERA Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A comprehensive learning ecosystem that combines AI-powered personalization, 
            real-time analytics, and collaborative tools to transform how your organization learns and grows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setIsDemoModalOpen(true)}
              className="bg-business-black text-white hover:bg-business-black/90 px-8 py-6 text-lg rounded-xl"
            >
              Request a Demo
            </Button>
            <Link to="/platform/how-it-works">
              <Button
                variant="outline"
                className="border-business-black text-business-black hover:bg-business-black hover:text-white px-8 py-6 text-lg rounded-xl"
              >
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-4">
              Explore Platform Capabilities
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover how each component of the LXERA platform works together to create 
              transformative learning experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Link key={index} to={feature.href}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-gray-200">
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-4`}>
                        <IconComponent className={`w-8 h-8 ${feature.iconColor}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                      <div className="mt-4 flex items-center text-business-black font-medium">
                        Learn more <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 lg:px-12 bg-business-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join leading organizations that are already using LXERA to empower their teams 
            and drive innovation through personalized learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ProgressiveDemoCapture
              source="platform_page_cta"
              buttonText="Get Started Today"
              onSuccess={() => {}}
            />
            <Link to="/pricing">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-business-black px-8 py-6 text-lg rounded-xl"
              >
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      
    </div>
  );
};

export default Platform;