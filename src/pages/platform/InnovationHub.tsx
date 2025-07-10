
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Users, Target, Brain, BarChart3, MessageCircle, ArrowRight, CheckCircle, Zap } from "lucide-react";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import PricingContactSales from "@/components/forms/PricingContactSales";

const InnovationHub = () => {
  const hubFeatures = [
    {
      title: "AI-Powered Ideation",
      description: "Generate innovative ideas with AI-driven insights and suggestions",
      icon: Brain,
      features: ["AI brainstorming", "Trend analysis", "Idea scoring", "Feasibility assessment"]
    },
    {
      title: "Collaborative Project Spaces",
      description: "Dedicated spaces for teams to collaborate on innovation projects",
      icon: Users,
      features: ["Team collaboration", "Project management", "Resource sharing", "Progress tracking"]
    },
    {
      title: "Expert Mentorship",
      description: "Connect with mentors and experts to guide innovation projects",
      icon: MessageCircle,
      features: ["Expert guidance", "Mentorship matching", "Knowledge sharing", "Feedback loops"]
    },
    {
      title: "Performance Analytics",
      description: "Track the impact of innovation projects with detailed analytics",
      icon: BarChart3,
      features: ["Impact measurement", "Performance tracking", "ROI analysis", "Outcome prediction"]
    }
  ];

  const innovationTools = [
    {
      name: "AI Idea Generator",
      description: "Generate innovative ideas with AI-driven insights",
      icon: Brain
    },
    {
      name: "Project Management Tools",
      description: "Manage innovation projects with ease",
      icon: Target
    },
    {
      name: "Collaboration Platforms",
      description: "Collaborate with team members in real-time",
      icon: Users
    },
    {
      name: "Analytics Dashboards",
      description: "Track the impact of innovation projects",
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <Lightbulb className="w-4 h-4 mr-2" />
            Innovation Hub
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-8 leading-tight font-inter">
            Unleash Your Team's
            <span className="text-business-black block mt-2"> Innovation Potential</span>
          </h1>
          <p className="text-lg sm:text-xl text-business-black/70 max-w-4xl mx-auto mb-12 leading-relaxed font-normal font-inter">
            A collaborative space for teams to generate, develop, and launch innovative ideas 
            that drive measurable business impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ProgressiveDemoCapture
              source="innovation_hub_page"
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

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Key Features
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Explore the core features that make the Innovation Hub a powerful tool for driving innovation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {hubFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-future-green/10 rounded-xl flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6 text-business-black" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.features.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-sm text-business-black/70">
                          <CheckCircle className="w-4 h-4 text-future-green mr-2 flex-shrink-0" />
                          {item}
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

      {/* Tools Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Essential Innovation Tools
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Equip your teams with the tools they need to drive innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {innovationTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-lg text-business-black">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {tool.description}
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
            Start Innovating Today
          </h2>
          <p className="text-lg sm:text-xl text-business-black/70 mb-8 leading-relaxed font-normal font-inter">
            Discover how the Innovation Hub can transform your organization's approach to innovation
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ProgressiveDemoCapture
              source="innovation_hub_page"
              buttonText="Request a Demo"
              onSuccess={() => {}}
            />
            <PricingContactSales 
              source="innovation_hub_page"
              className="max-w-xs"
            />
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Modals */}
    </div>
  );
};

export default InnovationHub;
