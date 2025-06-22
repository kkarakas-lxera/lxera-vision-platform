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
      title: "Enterprise Dashboards",
      description: "Comprehensive learning insights tailored for organizational decision-makers and strategic planning"
    },
    {
      icon: Target,
      title: "Strategic Performance Analytics", 
      description: "Identify skills gaps and optimize workforce development programs with enterprise-grade insights"
    },
    {
      icon: Eye,
      title: "Predictive Workforce Intelligence",
      description: "Forecast learning outcomes and predict organizational capability development trajectories"
    }
  ];

  const keyBenefits = [
    "Executive-level progress reporting",
    "Automated compliance documentation", 
    "Strategic ROI measurement",
    "Predictive workforce modeling",
    "C-suite dashboard creation",
    "Organizational capability analysis"
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
            Measure Learning Impact
          </Badge>
          <h1 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 leading-tight">
            Strategic Learning
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent block"> Intelligence Platform</span>
          </h1>
          
          <p className="text-xl text-business-black/70 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform learning data into strategic insights for enterprise organizations. Get comprehensive analytics that demonstrate ROI and drive organizational transformation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              variant="ghost"
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-emerald-600 hover:to-green-600 text-white hover:text-white font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-green-500/30 focus:ring-offset-4 border-0"
            >
              Schedule Enterprise Demo
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="border-3 border-business-black/30 bg-white/90 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-business-black/30 focus:ring-offset-4"
            >
              View Executive Brief
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Enterprise-Grade Analytics for Strategic Leaders
            </h2>
            <p className="text-lg text-business-black/70 max-w-2xl mx-auto">
              Comprehensive insights designed for HR Directors, L&D Directors, and Digital Transformation leaders
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
                Built for Enterprise Scale & Strategic Impact
              </h2>
              <p className="text-lg text-business-black/70 mb-8">
                Comprehensive analytics platform designed for mid-size to large organizations seeking measurable learning transformation and strategic workforce development.
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
                <h3 className="text-xl font-semibold text-business-black mb-2">Enterprise Implementation</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-business-black">Deployment Timeline</span>
                    <span className="text-xl font-semibold text-green-600">2-4 Weeks</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-business-black">Strategic ROI Visibility</span>
                    <span className="text-xl font-semibold text-blue-600">Month 1</span>
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
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-12 shadow-2xl border border-green-200/50">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
              Ready to Transform Your Learning Strategy?
            </h2>
            <p className="text-xl text-white/90 mb-4 max-w-2xl mx-auto">
              Join industry leaders using our analytics to drive strategic workforce transformation.
            </p>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Designed for HR Directors, L&D Directors, and Digital Transformation leaders ready to make data-driven strategic decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="ghost"
                size="lg"
                className="bg-white hover:bg-green-50 text-green-600 hover:text-green-700 font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-white/30 focus:ring-offset-4 border-0"
                onClick={() => console.log("Primary CTA clicked - should be white bg with green text")}
              >
                Schedule Strategic Demo
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="border-3 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-green-600 hover:border-white font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-white/30 focus:ring-offset-4"
                onClick={() => console.log("Secondary CTA clicked - should be white outline with white text")}
              >
                Request Strategic Assessment
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
