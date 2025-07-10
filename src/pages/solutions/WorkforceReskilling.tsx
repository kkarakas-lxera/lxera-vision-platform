import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import PricingContactSales from "@/components/forms/PricingContactSales";
import { ArrowRight, Users, TrendingUp, Target, Award, BarChart3, Puzzle, Brain, RefreshCw, Globe, Star, Map, Quote } from "lucide-react";
import { useState } from "react";

const WorkforceReskilling = () => {

  const features = [
    {
      icon: Map,
      title: "Real Skills Mapping",
      description: "LXERA uses your team's actual skill data to understand where people are today and what they need to grow."
    },
    {
      icon: Target,
      title: "Personalized Learning Paths",
      description: "Every team member gets a tailored journey based on their role, goals, and experience level."
    },
    {
      icon: BarChart3,
      title: "Live Skill Gap Analysis",
      description: "Learning progress is measured against targeted capabilities so gaps can be closed with focus."
    },
    {
      icon: Puzzle,
      title: "Flexible, Modular Content",
      description: "Short, relevant learning moments that fit into daily work — not on top of it."
    },
    {
      icon: Globe,
      title: "Scalable Across Teams",
      description: "Support individuals, departments, or entire organizations with learning that adapts at every level."
    },
    {
      icon: TrendingUp,
      title: "Clear Progress Insights for Leaders",
      description: "Track readiness, identify growth areas, and make informed decisions with real-time data."
    }
  ];

  const communityStats = [
    { number: "Skills-based", label: "Development", icon: Map },
    { number: "Personalized", label: "Learning Paths", icon: Target },
    { number: "Real-time", label: "Progress", icon: TrendingUp },
    { number: "Scalable", label: "Solutions", icon: Globe }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-smart-beige to-indigo-50">
        <SEO 
          title="Workforce Reskilling & Upskilling - LXERA"
          description="Empower your people to grow with personalized learning paths, real skill visibility, and measurable progress across teams."
          keywords="workforce development, reskilling, upskilling, skills mapping, personalized learning"
        />
        <Navigation />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-indigo-50/20"></div>
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center animate-fade-in-up">
              <Badge className="mb-6 bg-blue-600/20 text-business-black border-blue-600/30 px-4 py-2 text-sm font-medium rounded-full font-inter">
                <Users className="w-4 h-4 mr-2" />
                Skills-Based Development
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight font-inter">
                Workforce Reskilling & Upskilling
              </h1>
              <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed font-inter">
                Empower your people to grow with personalized learning paths, real skill visibility, and measurable progress across teams.
              </p>

              {/* Stats Dashboard */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {communityStats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${index * 100}ms` }}>
                      <CardContent className="pt-6">
                        <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <div className="text-2xl font-semibold text-blue-600 mb-2">{stat.number}</div>
                        <div className="text-sm text-business-black/70">{stat.label}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PricingContactSales source="workforce_reskilling_page" className="max-w-xs" />
              </div>
            </div>
          </div>
        </section>

        {/* The Challenge Section */}
        <section className="py-20 px-6 lg:px-12 bg-white/50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 font-inter">
              The pace of change outpaces traditional training.
            </h2>
            <p className="text-lg text-business-black/70 leading-relaxed font-inter">
              As roles evolve, most teams are left behind by outdated programs and generic content. Without a clear view of existing capabilities, or the flexibility to adapt learning to each person's journey, it's hard to build a workforce ready for what's next.
            </p>
          </div>
        </section>

        {/* How LXERA Helps Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 font-inter">
                Smarter learning journeys, built on real skills.
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card 
                    key={index} 
                    className="group border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up hover:-translate-y-2 rounded-3xl p-6 relative"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-indigo-600/30 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-business-black" />
                      </div>
                      <CardTitle className="text-xl font-medium text-business-black group-hover:text-blue-600 transition-colors mb-4 font-inter">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-business-black/70 text-center leading-relaxed font-inter">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* What You Gain Section */}
        <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-blue-600/20 to-indigo-600/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 font-inter">
              Help your teams grow with confidence and purpose.
            </h2>
            <p className="text-lg text-business-black/70 leading-relaxed font-inter">
              LXERA gives you the tools to reskill and upskill in a way that's focused, personal, and scalable. People stay motivated. Managers stay informed. And your business stays ready for whatever comes next.
            </p>
          </div>
        </section>

        {/* Real Impact Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 text-center shadow-xl">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Quote className="w-8 h-8 text-white" />
                </div>
              </div>
              <blockquote className="text-xl lg:text-2xl text-business-black italic mb-6 leading-relaxed font-inter">
                "LXERA helped me see exactly where I needed to grow and gave me a clear path to get there."
              </blockquote>
              <cite className="text-business-black/70 font-medium font-inter">
                — Team Lead, Workforce Development Pilot
              </cite>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl p-12 shadow-2xl border border-blue-200/50">
              <h2 className="text-3xl lg:text-4xl font-medium text-white mb-8 font-inter">
                Build a workforce ready for tomorrow.
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <PricingContactSales source="workforce_reskilling_page" className="max-w-xs" />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

    </>
  );
};

export default WorkforceReskilling;
