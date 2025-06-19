
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Users2, CheckCircle, MessageSquare, Clock, Headphones } from "lucide-react";

const ScalableLearningSupport = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "AI-Powered Support",
      description: "Instant answers to learner questions with intelligent chatbot assistance"
    },
    {
      icon: Users2,
      title: "Peer Learning Networks",
      description: "Connect learners with mentors and peers for collaborative learning experiences"
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Round-the-clock learning support that scales with your global workforce"
    }
  ];

  const benefits = [
    "90% faster response times",
    "24/7 support availability",
    "Peer-to-peer learning networks",
    "AI-powered assistance",
    "Scalable mentorship programs",
    "Global learning communities"
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <SEO 
        title="Scalable Learning Support & Mentorship - LXERA"
        description="Scale your learning support with AI-powered assistance and peer mentorship networks. Provide 24/7 learning support that grows with your organization."
        keywords="learning support, mentorship, peer learning, AI assistance, scalable support, learning community"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-purple-100 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium">
                Support & Mentorship
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6 leading-tight">
                Scalable Learning
                <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"> Support</span>
              </h1>
              <p className="text-xl text-business-black/70 mb-8 leading-relaxed">
                Scale your learning support with AI-powered assistance and peer mentorship networks. Provide 24/7 learning support that grows with your organization.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold"
                >
                  Try Support Bot
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
              <div className="bg-gradient-to-br from-purple-100 to-violet-100 rounded-3xl p-8 shadow-2xl">
                <Headphones className="w-24 h-24 text-purple-600 mx-auto mb-6" />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-business-black mb-4">Always Available</h3>
                  <p className="text-business-black/70">Support that never sleeps</p>
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
              Comprehensive support systems that scale with your learning programs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-purple-600" />
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
                Support That Scales
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-business-black/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-8 text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-business-black font-semibold mb-4">Always Available</div>
              <div className="text-business-black/70">
                AI-powered support provides instant assistance around the clock
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
              Scale Your Learning Support
            </h2>
            <p className="text-lg text-business-black/70 mb-8 max-w-2xl mx-auto">
              Provide exceptional support that grows with your organization. AI-powered assistance meets human mentorship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold"
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

export default ScalableLearningSupport;
