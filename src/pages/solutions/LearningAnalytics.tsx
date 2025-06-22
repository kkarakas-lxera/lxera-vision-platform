import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { BarChart3, Brain, TrendingUp, Eye, Activity, Compass, RefreshCw, Zap } from "lucide-react";

const LearningAnalytics = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-smart-beige to-emerald-50">
      <SEO 
        title="Learning Analytics & Insights - LXERA"
        description="Understand engagement and performance in real time to improve outcomes with intelligent learning data."
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
            Understand engagement and performance in real time to improve outcomes with intelligent learning data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
            >
              Request a Demo
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300"
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
            Knowing who clicked isn't enough.
          </h2>
          <p className="text-lg text-business-black/70 max-w-4xl mx-auto leading-relaxed">
            Traditional learning platforms tell you who completed a course. LXERA helps you understand how they engaged, what they felt, and when they needed help. Data should do more than measure—it should guide decisions.
          </p>
        </div>
      </section>

      {/* How LXERA Helps */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Turn data into action, instantly.
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
            Clear visibility. Smarter decisions.
          </h2>
          <p className="text-lg text-business-black/70 max-w-4xl mx-auto leading-relaxed">
            LXERA equips L&D teams and managers with insights that go far beyond completion rates. You'll know who's engaged, who's thriving, and where to focus your attention—before issues arise.
          </p>
        </div>
      </section>

      {/* Real Impact */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-green-200/50">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <blockquote className="text-xl text-business-black/80 font-medium mb-6 italic leading-relaxed">
              "We didn't just track progress. LXERA helped us predict challenges and respond faster to support our people."
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
              Unlock deeper learning with smarter insights.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Get a Demo
              </Button>
              <Button
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-green-600 hover:border-white transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
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
