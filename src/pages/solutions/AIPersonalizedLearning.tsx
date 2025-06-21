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
      description: "AI algorithms adjust content difficulty and format based on individual learning patterns"
    },
    {
      icon: BarChart3,
      title: "Learning Path Optimization",
      description: "Dynamic pathways that evolve with learner progress and preferences"
    },
    {
      icon: Users,
      title: "Real-time Difficulty Adjustment",
      description: "Instant calibration of content complexity to maintain optimal challenge"
    }
  ];

  const benefits = [
    "40% faster skill acquisition",
    "85% learner engagement rate",
    "Personalized for every individual",
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
                AI-Powered Solution
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-6 leading-tight">
                Learning That
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent block"> Adapts to You</span>
              </h1>
              <p className="text-xl text-business-black/70 mb-8 leading-relaxed max-w-2xl">
                Revolutionary AI technology that creates personalized learning experiences, adapting content, pace, and methodology to each individual's unique learning style.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl group"
                >
                  Experience AI Learning
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-lg rounded-xl"
                >
                  Watch Demo
                </Button>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">40%</div>
                  <div className="text-sm text-business-black/70">Faster Learning</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">85%</div>
                  <div className="text-sm text-business-black/70">Engagement Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">10M+</div>
                  <div className="text-sm text-business-black/70">Learners</div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5 animate-fade-in-scale">
              <div className="relative">
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <Brain className="w-20 h-20 text-pink-600 mx-auto mb-6" />
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-business-black mb-4">Smart Learning Engine</h3>
                    <p className="text-business-black/70">AI that understands how you learn best</p>
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
            <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6">
              How AI Transforms Learning
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Discover the intelligent features that make every learning experience unique and effective
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
                    <CardTitle className="text-xl font-bold text-business-black group-hover:text-pink-600 transition-colors mb-4">
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
              <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8">
                Proven Results
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
                    <div className="text-5xl font-bold text-pink-600">40%</div>
                  </div>
                  <div className="text-xl font-semibold text-business-black mb-4">Faster Learning</div>
                  <div className="text-business-black/70 leading-relaxed">
                    Organizations using our AI-powered personalization see dramatic improvements in learning speed and retention rates
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 bg-rose-600 text-white p-4 rounded-2xl shadow-lg">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-sm">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-pink-600 to-rose-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Revolutionize Learning?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations already transforming their learning experience with AI-powered personalization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-pink-600 hover:border-white px-8 py-4 text-lg rounded-xl bg-white/10"
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

export default AIPersonalizedLearning;
