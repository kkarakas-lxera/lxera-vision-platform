
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import AnalyticsDashboardPreview from "@/components/AnalyticsDashboardPreview";
import FeatureComparisonTable from "@/components/FeatureComparisonTable";
import IndustryUseCases from "@/components/IndustryUseCases";
import HeroSection from "@/components/analytics/HeroSection";
import MetricsSection from "@/components/analytics/MetricsSection";
import CoreFeaturesGrid from "@/components/analytics/CoreFeaturesGrid";
import CTASection from "@/components/analytics/CTASection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Brain, TrendingUp, RefreshCw, Zap, Compass, ArrowRight, Quote, Star } from "lucide-react";
import { useState } from "react";

const LearningAnalytics = () => {
  const [isLoading, setIsLoading] = useState(false);

  const coreFeatures = [
    {
      icon: BarChart3,
      title: "Live Engagement Tracking",
      description: "See how learners interact with content and identify drop-off points quickly."
    },
    {
      icon: Brain,
      title: "Motivation & Emotional Analysis", 
      description: "Detects patterns of confusion, fatigue, or momentum based on behavior."
    },
    {
      icon: TrendingUp,
      title: "Progress Dashboards",
      description: "Tracks individual and team progress, showing where support or recognition is needed."
    },
    {
      icon: RefreshCw,
      title: "Responsive Feedback Loops",
      description: "Adjusts learning content and nudges based on real-time activity."
    },
    {
      icon: Zap,
      title: "Predictive Learning Insights",
      description: "Flags who might fall behind so you can intervene before performance drops."
    },
    {
      icon: Compass,
      title: "Skill Gap Intelligence",
      description: "Maps current skills to learning progress and highlights opportunities for development."
    }
  ];

  const communityStats = [
    { number: "Real-time", label: "Data Insights", icon: BarChart3 },
    { number: "Predictive", label: "Analytics", icon: Brain },
    { number: "Live", label: "Tracking", icon: TrendingUp },
    { number: "Smart", label: "Dashboards", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-smart-beige to-cyan-50">
      <SEO 
        title="Learning Analytics & Insights - LXERA"
        description="Understand engagement and performance in real time to improve outcomes with intelligent learning data."
        keywords="learning analytics, data insights, learning metrics, performance tracking, educational data, enterprise learning"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/20 to-cyan-50/20"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center animate-fade-in-up">
            <Badge className="mb-6 bg-teal-600/20 text-business-black border-teal-600/30 px-4 py-2 text-sm font-medium rounded-full font-inter">
              <BarChart3 className="w-4 h-4 mr-2" />
              Learning Analytics
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight font-inter">
              Learning Analytics & Insights
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed font-inter">
              Understand engagement and performance in real time to improve outcomes with intelligent learning data.
            </p>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {communityStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardContent className="pt-6">
                      <IconComponent className="w-8 h-8 text-teal-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-2xl font-semibold text-teal-600 mb-2">{stat.number}</div>
                      <div className="text-sm text-business-black/70">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-cyan-600 hover:to-teal-600 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 border-0 group font-inter"
              >
                Request a Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter"
              >
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 leading-tight font-inter">
            Knowing who clicked isn't enough.
          </h2>
          <p className="text-lg text-business-black/70 leading-relaxed font-inter">
            Traditional learning platforms tell you who completed a course. LXERA helps you understand how they engaged, what they felt, and when they needed help. Data should do more than measure—it should guide decisions.
          </p>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-teal-50/60 to-cyan-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 leading-tight font-inter">
              See your data in action
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto font-inter">
              Get instant insights into learner engagement, performance, and areas needing attention.
            </p>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
                <Skeleton className="h-24 rounded-3xl" />
              </div>
            </div>
          ) : (
            <AnalyticsDashboardPreview />
          )}
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 leading-tight font-inter">
              Turn data into action, instantly.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up hover:-translate-y-2 rounded-3xl p-6 relative"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-600/20 to-cyan-600/30 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-xl font-medium text-business-black group-hover:text-teal-600 transition-colors mb-4 font-inter">
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

      {/* Feature Comparison Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-teal-50/30 to-cyan-50/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 leading-tight font-inter">
              Beyond traditional analytics
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto font-inter">
              See how LXERA's intelligent analytics compare to standard LMS reporting.
            </p>
          </div>
          <FeatureComparisonTable />
        </div>
      </section>

      {/* Industry Use Cases */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 leading-tight font-inter">
              Real-world impact across industries
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto font-inter">
              See how organizations are using LXERA analytics to transform their learning outcomes.
            </p>
          </div>
          <IndustryUseCases />
        </div>
      </section>

      {/* What You Gain Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-teal-600/20 to-cyan-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 leading-tight font-inter">
            Clear visibility. Smarter decisions.
          </h2>
          <p className="text-lg text-business-black/70 leading-relaxed font-inter">
            LXERA equips L&D teams and managers with insights that go far beyond completion rates. You'll know who's engaged, who's thriving, and where to focus your attention—before issues arise.
          </p>
        </div>
      </section>

      {/* Real Impact Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-12 text-center shadow-xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>
            <blockquote className="text-xl lg:text-2xl text-business-black italic mb-6 leading-relaxed font-inter">
              "LXERA's analytics showed us exactly where learners were struggling, allowing us to intervene before they dropped out."
            </blockquote>
            <cite className="text-business-black/70 font-medium font-inter">
              — L&D Director, Analytics Pilot Program
            </cite>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl p-12 shadow-2xl border border-teal-200/50">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-8 font-inter">
              Transform your learning data into actionable insights.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-teal-50 hover:text-teal-700 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 border-0 font-inter"
              >
                Talk to an Expert
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-teal-600 hover:border-white font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 font-inter"
              >
                Get Early Access
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearningAnalytics;
