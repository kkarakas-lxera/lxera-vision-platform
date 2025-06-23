import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Users2, CheckCircle, MessageSquare, Clock, Headphones, Globe, Shield, Target, TrendingUp, Zap, Bot, RefreshCw, BarChart3, Quote, Puzzle } from "lucide-react";

const ScalableLearningSupport = () => {
  const supportFeatures = [
    {
      icon: Bot,
      title: "AI Learning Assistant",
      description: "Answers questions and offers support instantly, within the flow of learning"
    },
    {
      icon: RefreshCw,
      title: "Behavior-Based Nudges",
      description: "Detects hesitation or inactivity and delivers the right prompts at the right time"
    },
    {
      icon: MessageSquare,
      title: "Mentor Matching",
      description: "Connects learners with mentors or peers based on goals, challenges, and progress"
    },
    {
      icon: Globe,
      title: "Available Anytime",
      description: "Support is accessible 24/7, whether through AI or human guidance"
    },
    {
      icon: BarChart3,
      title: "Engagement Tracking",
      description: "Monitors learner activity to surface early signs of disengagement"
    },
    {
      icon: Puzzle,
      title: "Personalized Learning Support Paths",
      description: "Adapts learning support based on each learner's style, history, and preferences"
    }
  ];

  const communityStats = [
    { number: "24/7", label: "Support Available", icon: Clock },
    { number: "AI", label: "Powered Help", icon: Zap },
    { number: "Real-time", label: "Guidance", icon: Users2 },
    { number: "Smart", label: "Support at Scale", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-smart-beige to-purple-50">
      <SEO 
        title="Scalable Learning Support & Mentorship - LXERA"
        description="Real-time guidance that keeps learners engaged, motivated, and on track with personalized support."
        keywords="learning support, mentorship, AI guidance, real-time support, learning engagement"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50/20 to-purple-50/20"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center animate-fade-in-up">
            <Badge className="mb-6 bg-violet-600/20 text-business-black border-violet-600/30 px-4 py-2 text-sm font-medium rounded-full font-inter">
              <Headphones className="w-4 h-4 mr-2" />
              Learning Support
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight font-inter">
              Scalable Learning Support & Mentorship
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed font-inter">
              Real-time guidance that keeps learners engaged, motivated, and on track with personalized support.
            </p>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {communityStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardContent className="pt-6">
                      <IconComponent className="w-8 h-8 text-violet-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-2xl font-semibold text-violet-600 mb-2">{stat.number}</div>
                      <div className="text-sm text-business-black/70">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-purple-600 hover:to-violet-600 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 border-0 group font-inter"
              >
                Request a Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter"
              >
                Get Early Access
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 font-inter">
            Most learning platforms stop at content. We go further.
          </h2>
          <p className="text-lg text-business-black/70 leading-relaxed font-inter">
            LXERA is built for learners who need more than information. Without timely guidance, people lose momentum or drop off entirely. Supporting every learner shouldn't depend on the size of your team. It should scale effortlessly.
          </p>
        </div>
      </section>

      {/* How LXERA Helps Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 font-inter">
              Smart support that meets learners where they are.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {supportFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up hover:-translate-y-2 rounded-3xl p-6 relative"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600/20 to-purple-600/30 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-xl font-medium text-business-black group-hover:text-violet-600 transition-colors mb-4 font-inter">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-business-black/70 text-center leading-relaxed font-inter">
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
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-violet-600/20 to-purple-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 font-inter">
            Support that grows with your organization.
          </h2>
          <p className="text-lg text-business-black/70 leading-relaxed font-inter">
            LXERA helps you offer meaningful support to every learner, without scaling your team. Whether you're guiding ten users or ten thousand, our system adapts in real time to provide personalized guidance and insight.
          </p>
        </div>
      </section>

      {/* Real Impact Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-12 text-center shadow-xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>
            <blockquote className="text-xl lg:text-2xl text-business-black italic mb-6 leading-relaxed font-inter">
              "LXERA's AI knew when I was stuck and nudged me to keep going. Then it connected me with a mentor who had faced the same challenge."
            </blockquote>
            <cite className="text-business-black/70 font-medium font-inter">
              — Early User, Pilot Program
            </cite>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-violet-500 to-purple-500 rounded-3xl p-12 shadow-2xl border border-violet-200/50">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-8 font-inter">
              Give every learner the support they need to succeed.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-violet-600 hover:bg-violet-50 hover:text-violet-700 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 border-0 font-inter"
              >
                Request a Demo
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-violet-600 hover:border-white font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 font-inter"
              >
                Get Early Access
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
