
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, BarChart3, CheckCircle, TrendingUp, Target, Eye } from "lucide-react";

const LearningAnalytics = () => {
  const features = [
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Monitor learning progress and engagement across your organization in real-time"
    },
    {
      icon: Target,
      title: "Performance Insights",
      description: "Identify learning gaps and optimize training programs based on data-driven insights"
    },
    {
      icon: Eye,
      title: "Predictive Analytics",
      description: "Forecast learning outcomes and predict skill development trajectories"
    }
  ];

  const benefits = [
    "85% improvement in learning outcomes",
    "Real-time progress tracking",
    "Data-driven decision making",
    "Personalized learning paths",
    "ROI measurement capabilities",
    "Comprehensive reporting"
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <SEO 
        title="Learning Analytics & Insights - LXERA"
        description="Transform learning data into actionable insights. Advanced analytics to measure, track, and optimize learning outcomes across your organization."
        keywords="learning analytics, data insights, learning metrics, performance tracking, educational data"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium">
                Analytics & Insights
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6 leading-tight">
                Learning
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> Analytics</span>
              </h1>
              <p className="text-xl text-business-black/70 mb-8 leading-relaxed">
                Transform learning data into actionable insights. Advanced analytics to measure, track, and optimize learning outcomes across your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold"
                >
                  View Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in-scale">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 shadow-2xl">
                <BarChart3 className="w-24 h-24 text-green-600 mx-auto mb-6" />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-business-black mb-4">Data-Driven Learning</h3>
                  <p className="text-business-black/70">Unlock the power of learning analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
              Key Features
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Comprehensive analytics tools to measure and optimize learning effectiveness
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-business-black">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-business-black/70 text-center leading-relaxed">
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
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-8">
                Measurable Impact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-business-black/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">85%</div>
              <div className="text-business-black font-semibold mb-4">Better Outcomes</div>
              <div className="text-business-black/70">
                Organizations using our analytics see significant improvement in learning effectiveness
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
              Start Making Data-Driven Decisions
            </h2>
            <p className="text-lg text-business-black/70 mb-8 max-w-2xl mx-auto">
              Transform your learning programs with powerful analytics. Get insights that drive real results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-lg"
              >
                Contact Sales
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
