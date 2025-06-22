
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, BarChart3, CheckCircle, TrendingUp, Target, Eye, Activity, Users, Brain, Zap } from "lucide-react";

const LearningAnalytics = () => {
  const coreFeatures = [
    {
      icon: BarChart3,
      title: "Real-Time Engagement Tracking",
      description: "Understand how learners interact, how often they engage, and where drop-off risks occur."
    },
    {
      icon: Brain,
      title: "Emotional & Motivational Analytics", 
      description: "LXERA's AI evaluates emotional cues and behavioral signals to predict burnout, confusion, or disengagement."
    },
    {
      icon: TrendingUp,
      title: "Skill Mastery & Progress Mapping",
      description: "Visual dashboards track individual and team progress, highlighting strengths and knowledge gaps."
    },
    {
      icon: Zap,
      title: "AI-Powered Feedback Loops",
      description: "Learner activity triggers personalized nudges, support, or content adjustments — instantly."
    },
    {
      icon: Eye,
      title: "Predictive Learning Insights",
      description: "Anticipate who may need help before they know it, and intervene with tailored guidance."
    }
  ];

  console.log("Learning Analytics page loaded - checking CTA button styling");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-smart-beige to-emerald-50">
      <SEO 
        title="Learning Analytics & Insights - LXERA"
        description="Transform learning data into strategic insights. Advanced analytics to measure, track, and optimize learning outcomes across your enterprise organization."
        keywords="learning analytics, data insights, learning metrics, performance tracking, educational data, enterprise learning"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-future-green/20 text-business-black border-future-green/30 px-4 py-2 text-sm font-medium rounded-full">
            <BarChart3 className="w-4 h-4 mr-2" />
            Data-Driven Learning
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 leading-tight">
            Learning Analytics &
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block"> Insights</span>
          </h1>
          
          <p className="text-xl text-business-black/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Turn engagement, behavior, and performance data into real-time, actionable intelligence — powered by AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              variant="ghost"
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 text-white hover:text-white font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-green-500/30 focus:ring-offset-4 border-0"
            >
              Request a Demo
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="border-3 border-business-black/30 bg-white/90 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-business-black/30 focus:ring-offset-4"
            >
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
            If you can't measure it, you can't improve it.
          </h2>
          <p className="text-lg text-business-black/70 max-w-4xl mx-auto leading-relaxed">
            Traditional learning platforms track clicks and completions — but that's not enough. To truly elevate performance, you need to understand how people learn, when they struggle, and what motivates them. You need analytics that do more than report — they respond.
          </p>
        </div>
      </section>

      {/* How LXERA Helps */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              AI-powered visibility. Smarter decisions.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-business-black group-hover:text-green-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-business-black/70 leading-relaxed text-center">
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
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
            From data to decisions — instantly.
          </h2>
          <p className="text-lg text-business-black/70 max-w-4xl mx-auto leading-relaxed">
            LXERA translates complex learning behaviors into simple, actionable insights for L&D teams, managers, and mentors. Empower your organization with data that drives strategy, not just reporting.
          </p>
        </div>
      </section>

      {/* Real-World Impact */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-green-200/50">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <blockquote className="text-xl text-business-black/80 font-medium mb-6 italic leading-relaxed">
              "LXERA gave us insight into our team's learning health at a glance. We didn't just track progress — we anticipated problems and responded faster."
            </blockquote>
            <cite className="text-business-black/60 font-medium">
              — Head of L&D, Pilot Organization
            </cite>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-12 shadow-2xl border border-green-200/50">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
              Unlock smarter learning with real-time intelligence.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="ghost"
                size="lg"
                className="bg-white hover:bg-green-50 text-green-600 hover:text-green-700 font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-white/30 focus:ring-offset-4 border-0"
                onClick={() => console.log("Primary CTA clicked - should be white bg with green text")}
              >
                Get a Demo
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="border-3 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-green-600 hover:border-white font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-white/30 focus:ring-offset-4"
                onClick={() => console.log("Secondary CTA clicked - should be white outline with white text")}
              >
                Explore Platform
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
