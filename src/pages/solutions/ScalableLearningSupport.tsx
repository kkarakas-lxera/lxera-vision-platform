import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Users2, CheckCircle, MessageSquare, Clock, Headphones, Star, Globe, Shield } from "lucide-react";

const ScalableLearningSupport = () => {
  const supportFeatures = [
    {
      icon: MessageSquare,
      title: "AI-Powered Support Intelligence",
      description: "Instant answers to learner questions with intelligent, context-aware responses designed for enterprise teams",
      availability: "24/7 Available"
    },
    {
      icon: Users2,
      title: "Strategic Mentorship Network",
      description: "Connect teams with expert mentors and peers for collaborative learning experiences that drive business results",
      availability: "Global Community"
    },
    {
      icon: Globe,
      title: "Multi-Language Enterprise Support",
      description: "Learning assistance in 50+ languages with cultural context awareness for global organizations",
      availability: "Worldwide"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "L&D Director, TechCorp",
      image: "👩‍💼",
      quote: "The AI support has transformed our enterprise learning experience. Strategic help, anytime, anywhere.",
      rating: 5
    },
    {
      name: "Michael Rodriguez", 
      role: "HR Director, GlobalInc",
      image: "👨‍💼",
      quote: "Our teams love the strategic mentorship feature. It's created a real learning community across our organization.",
      rating: 5
    },
    {
      name: "Lisa Thompson",
      role: "Digital Transformation Director",
      image: "👩‍🏫",
      quote: "24/7 support means our global teams never have to wait for strategic guidance. Absolutely transformational!",
      rating: 5
    }
  ];

  const communityStats = [
    { number: "50K+", label: "Enterprise Learners", icon: Users2 },
    { number: "5K+", label: "Strategic Mentors", icon: Star },
    { number: "99.9%", label: "Uptime Guarantee", icon: Shield },
    { number: "<1min", label: "Average Response", icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-smart-beige to-violet-50">
      <SEO 
        title="Scalable Learning Support & Mentorship - LXERA"
        description="Scale your learning support with AI-powered assistance and peer mentorship networks. Provide 24/7 learning support that grows with your organization."
        keywords="learning support, mentorship, peer learning, AI assistance, scalable support, learning community"
      />
      <Navigation />
      
      {/* Hero Section - Community Focused */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-purple-100 text-purple-700 border-purple-200 px-4 py-2 text-sm font-medium">
              <Headphones className="w-4 h-4 mr-2" />
              Enterprise Support & Mentorship Platform
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-medium text-business-black mb-6 leading-tight">
              Strategic Learning Support That
              <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent block"> Never Sleeps</span>
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed">
              Combine the power of AI with human expertise to provide instant, intelligent support while building thriving learning communities. Designed for HR Directors, L&D Directors, and Digital Transformation leaders.
            </p>
          </div>

          {/* Community Stats Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {communityStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="pt-6">
                    <IconComponent className="w-8 h-8 text-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-3xl font-semibold text-purple-600 mb-2">{stat.number}</div>
                    <div className="text-sm text-business-black/70">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-violet-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
            >
              Schedule Enterprise Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-lg rounded-xl"
            >
              Request Strategic Brief
            </Button>
          </div>
        </div>
      </section>

      {/* Support Features */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-6">
              Comprehensive Enterprise Support Ecosystem
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              From AI-powered instant help to strategic human mentorship, we've got every enterprise learning need covered
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {supportFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up group" style={{ animationDelay: `${index * 150}ms` }}>
                  <CardHeader className="text-center pb-4">
                    <div className="relative w-20 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-10 h-10 text-purple-600" />
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        {feature.availability}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-business-black group-hover:text-purple-600 transition-colors">
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

      {/* Testimonials Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-6">
              What Our Community Says
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Real stories from organizations transforming their learning support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="text-4xl mr-4">{testimonial.image}</div>
                    <div>
                      <div className="font-semibold text-business-black">{testimonial.name}</div>
                      <div className="text-sm text-business-black/70">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-business-black/80 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits & Results */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-8">
                Enterprise Support That Scales
              </h2>
              <div className="space-y-4">
                {[
                  "90% faster response times",
                  "24/7 strategic support availability",
                  "Peer-to-peer learning networks",
                  "AI-powered assistance",
                  "Scalable mentorship programs",
                  "Global enterprise communities"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 animate-fade-in group" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg text-business-black/80 group-hover:text-business-black transition-colors">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-3xl p-12 text-center shadow-xl">
              <Clock className="w-16 h-16 text-purple-600 mx-auto mb-6" />
              <div className="text-5xl font-semibold text-purple-600 mb-2">24/7</div>
              <div className="text-xl font-semibold text-business-black mb-4">Always Available</div>
              <div className="text-business-black/70 leading-relaxed mb-6">
                AI-powered support provides instant strategic assistance around the clock, ensuring no enterprise learner is ever stuck
              </div>
              <div className="bg-white/60 rounded-2xl p-4">
                <div className="text-2xl font-semibold text-purple-600 mb-1">95%</div>
                <div className="text-sm text-business-black/70">Director Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-purple-600 to-violet-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-medium text-white mb-6">
              Build Your Strategic Learning Community
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Transform how your enterprise provides learning support. Combine AI efficiency with human strategic connection across your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-50 hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                Schedule Enterprise Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-purple-600 hover:border-white px-8 py-4 text-lg rounded-xl"
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

export default ScalableLearningSupport;
