
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, BarChart3, CheckCircle, TrendingUp, Target, Eye, Activity, Users } from "lucide-react";

const LearningAnalytics = () => {
  const coreFeatures = [
    {
      icon: BarChart3,
      title: "Real-time Dashboards",
      description: "Monitor learning progress and engagement across your organization in real-time"
    },
    {
      icon: Target,
      title: "Performance Analytics", 
      description: "Identify learning gaps and optimize training programs based on data-driven insights"
    },
    {
      icon: Eye,
      title: "Predictive Insights",
      description: "Forecast learning outcomes and predict skill development trajectories"
    }
  ];

  const keyBenefits = [
    "Real-time progress tracking",
    "Automated report generation", 
    "ROI measurement tools",
    "Predictive modeling",
    "Custom dashboard creation",
    "Performance gap analysis"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-smart-beige to-emerald-50">
      <SEO 
        title="Learning Analytics & Insights - LXERA"
        description="Transform learning data into actionable insights. Advanced analytics to measure, track, and optimize learning outcomes across your organization."
        keywords="learning analytics, data insights, learning metrics, performance tracking, educational data"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Platform
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-medium text-business-black mb-6 leading-tight">
            Data-Driven
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block"> Learning Intelligence</span>
          </h1>
          <p className="text-xl text-business-black/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform learning data into actionable insights for your MVP. Get essential analytics that prove ROI and optimize learning outcomes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-emerald-600 hover:to-green-600 font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 border-0"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
            >
              View Live Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Essential Analytics for Your MVP
            </h2>
            <p className="text-lg text-business-black/70 max-w-2xl mx-auto">
              Start with the core analytics you need to prove value and make data-driven decisions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

      {/* Benefits Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
                Start Small, Scale Smart
              </h2>
              <p className="text-lg text-business-black/70 mb-8">
                Begin with essential analytics and expand as you grow. Perfect for teams just starting their data journey.
              </p>
              
              <div className="space-y-4">
                {keyBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 animate-fade-in group" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-6 h-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-business-black/80 group-hover:text-business-black transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-business-black mb-2">MVP Results</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-business-black">Quick Setup</span>
                    <span className="text-xl font-semibold text-green-600">< 1 Day</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-business-black">Value Generated</span>
                    <span className="text-xl font-semibold text-blue-600">Week 1</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-future-green/10 via-white/70 to-smart-beige/20 rounded-3xl p-12 shadow-2xl border border-future-green/20">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Ready to Start Your Analytics Journey?
            </h2>
            <p className="text-xl text-business-black/70 mb-4 max-w-2xl mx-auto">
              Join forward-thinking teams using our analytics to optimize their learning programs and prove ROI.
            </p>
            <p className="text-lg text-business-black/60 mb-8 max-w-2xl mx-auto">
              Perfect for MVPs and growing teams ready to make data-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-future-green to-emerald-600 text-business-black hover:from-emerald-600 hover:to-future-green font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-future-green/50 focus:ring-offset-2 border-0"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
              >
                Schedule Demo
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
