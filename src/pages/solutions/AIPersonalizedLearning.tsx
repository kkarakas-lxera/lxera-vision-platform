
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Brain, CheckCircle, Users, Target, BarChart3, Zap, Star } from "lucide-react";

const AIPersonalizedLearning = () => {
  const features = [
    {
      icon: Target,
      title: "Adaptive Content Delivery",
      description: "AI algorithms adjust content difficulty and format based on individual learning patterns and organizational needs"
    },
    {
      icon: BarChart3,
      title: "Learning Path Optimization",
      description: "Dynamic pathways that evolve with learner progress and align with strategic business objectives"
    },
    {
      icon: Users,
      title: "Real-time Difficulty Adjustment",
      description: "Instant calibration of content complexity to maintain optimal challenge across your workforce"
    }
  ];

  const benefits = [
    "40% faster skill acquisition",
    "85% workforce engagement rate",
    "Personalized for every team member",
    "Real-time progress tracking",
    "Adaptive assessment system",
    "Multi-modal learning support"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige to-white">
      <SEO 
        title="AI-Personalized Learning - LXERA"
        description="Transform learning with AI-powered personalization. Adaptive content delivery and optimized learning paths for every individual."
        keywords="AI learning, personalized education, adaptive learning, machine learning education"
      />
      <Navigation />
      
      {/* Hero Section - Split Layout */}
      <section className="pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-50/20 to-rose-50/20"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 animate-fade-in-up">
              <Badge className="mb-6 bg-pink-100 text-pink-700 border-pink-200 px-4 py-2 text-sm font-medium">
                <Brain className="w-4 h-4 mr-2" />
                AI-Powered Enterprise Solution
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-medium text-business-black mb-6 leading-tight">
                Strategic Learning That
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent block"> Adapts to Your Workforce</span>
              </h1>
              <p className="text-xl text-business-black/70 mb-8 leading-relaxed max-w-2xl">
                Advanced AI technology that creates personalized learning experiences for enterprise teams. Adapting content, pace, and methodology to drive strategic workforce development across your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-rose-600 hover:to-pink-600 font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 border-0 group"
                >
                  Schedule Enterprise Demo
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
                >
                  View Executive Brief
                </Button>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-semibold text-pink-600">40%</div>
                  <div className="text-sm text-business-black/70">Faster Learning</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-semibold text-pink-600">85%</div>
                  <div className="text-sm text-business-black/70">Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-semibold text-pink-600">50K+</div>
                  <div className="text-sm text-business-black/70">Enterprise Users</div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5 animate-fade-in-scale">
              <div className="relative">
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Brain className="w-20 h-20 text-pink-600 mx-auto mb-6" />
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-business-black mb-4">Smart Learning Engine</h3>
                    <p className="text-business-black/70">AI that understands how your workforce learns best</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-yellow-400 rounded-full p-3 animate-pulse">
                  <Star className="w-6 h-6 text-yellow-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Section - Fixed Layout */}
      <section className="py-20 px-6 lg:px-12 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-6">
              How AI Transforms Enterprise Learning
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Discover the intelligent features designed for HR Directors, L&D Directors, and Digital Transformation leaders
            </p>
          </div>
          
          {/* Fixed Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up hover:-translate-y-2 rounded-3xl p-6 relative min-h-[300px] flex flex-col" 
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="text-center pb-4 flex-shrink-0">
                    <div className="relative w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-10 h-10 text-pink-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-business-black group-hover:text-pink-600 transition-colors mb-4">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-center justify-center">
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

      {/* Benefits Showcase */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-8">
                Proven Results with Enterprise Partners
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 animate-fade-in group" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-business-black/80 group-hover:text-business-black transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-12 text-center shadow-xl">
                  <div className="flex items-center justify-center mb-6">
                    <Zap className="w-8 h-8 text-pink-600 mr-3" />
                    <div className="text-5xl font-semibold text-pink-600">40%</div>
                  </div>
                  <div className="text-xl font-semibold text-business-black mb-4">Faster Learning</div>
                  <div className="text-business-black/70 leading-relaxed">
                    Enterprise organizations using our AI-powered personalization see dramatic improvements in learning speed and strategic capability development
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-rose-600 text-white p-4 rounded-2xl shadow-lg">
                  <div className="text-2xl font-semibold">95%</div>
                  <div className="text-sm">Director Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-12 shadow-2xl border border-pink-200/50">
            <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-6">
              Ready to Transform Your Learning Strategy?
            </h2>
            <p className="text-xl text-business-black/70 mb-4 max-w-2xl mx-auto">
              Join strategic leaders already transforming their workforce development with AI-powered personalization.
            </p>
            <p className="text-lg text-business-black/60 mb-8 max-w-2xl mx-auto">
              Designed for HR Directors, L&D Directors, and Digital Transformation leaders ready to make data-driven strategic decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50 hover:text-pink-700 font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 border-0"
              >
                Schedule Enterprise Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-pink-600/30 bg-white/10 backdrop-blur-sm text-business-black hover:bg-white hover:text-pink-600 hover:border-pink-600 font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2"
              >
                Request Strategic Brief
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AIPersonalizedLearning;
