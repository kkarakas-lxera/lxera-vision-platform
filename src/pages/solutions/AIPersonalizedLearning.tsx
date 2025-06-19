
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Brain, CheckCircle, Users, Target, BarChart3 } from "lucide-react";

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
    <div className="min-h-screen bg-smart-beige">
      <SEO 
        title="AI-Personalized Learning - LXERA"
        description="Transform learning with AI-powered personalization. Adaptive content delivery and optimized learning paths for every individual."
        keywords="AI learning, personalized education, adaptive learning, machine learning education"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-pink-100 text-pink-700 border-pink-200 px-4 py-2 text-sm font-medium">
                AI-Powered Solution
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6 leading-tight">
                AI-Personalized
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent"> Learning</span>
              </h1>
              <p className="text-xl text-business-black/70 mb-8 leading-relaxed">
                Personalized content and pathways — powered by AI. Transform how your organization learns with adaptive intelligence that adjusts to every individual's unique needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold"
                >
                  Schedule Demo
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
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl p-8 shadow-2xl">
                <Brain className="w-24 h-24 text-pink-600 mx-auto mb-6" />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-business-black mb-4">Smart Learning Engine</h3>
                  <p className="text-business-black/70">AI that understands how you learn best</p>
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
              Discover how our AI-powered learning platform adapts to every learner's unique journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-pink-600" />
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
                Proven Results
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CheckCircle className="w-5 h-5 text-pink-600 flex-shrink-0" />
                    <span className="text-business-black/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-8 text-center">
              <div className="text-4xl font-bold text-pink-600 mb-2">40%</div>
              <div className="text-business-black font-semibold mb-4">Faster Learning</div>
              <div className="text-business-black/70">
                Organizations see significant improvement in learning speed with our AI-powered personalization
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
              Ready to Personalize Learning?
            </h2>
            <p className="text-lg text-business-black/70 mb-8 max-w-2xl mx-auto">
              Transform your organization's learning experience with AI-powered personalization that adapts to every individual.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold"
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

export default AIPersonalizedLearning;
