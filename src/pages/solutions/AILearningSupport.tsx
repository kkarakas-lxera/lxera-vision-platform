
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, MessageCircle, Bot, Brain, Users, Clock, Zap, Target, Quote, Globe, Shield, Eye } from "lucide-react";

const AILearningSupport = () => {
  const supportFeatures = [
    {
      icon: MessageCircle,
      title: "Live Streaming Chatbot Mentor",
      description: "Each learner is paired with a smart, always-on mentor that provides real-time guidance through a conversational interface."
    },
    {
      icon: Brain,
      title: "Trained on Your Organization's Knowledge",
      description: "The chatbot reflects your tone, policies, and learning culture by drawing from your internal knowledge base."
    },
    {
      icon: Target,
      title: "Adaptive to Learner Behavior",
      description: "The system detects when a learner is stuck or disengaged and offers personalized support at the right moment."
    },
    {
      icon: Clock,
      title: "Contextual, Real-Time Conversations",
      description: "The mentor knows what the learner is working on and provides relevant suggestions or encouragement in the moment."
    },
    {
      icon: Zap,
      title: "Continuous Personalization",
      description: "It evolves with every interaction — fine-tuning itself based on learning history, goals, and feedback."
    },
    {
      icon: Eye,
      title: "Insight for Human Mentors & Managers",
      description: "Your team gets visibility into learner needs and momentum, so they can step in with coaching when it matters most."
    }
  ];

  const communityStats = [
    { number: "24/7", label: "Support Available", icon: Clock },
    { number: "AI", label: "Powered Mentor", icon: Bot },
    { number: "Real-time", label: "Conversations", icon: MessageCircle },
    { number: "Smart", label: "Mentorship", icon: Brain }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-smart-beige to-cyan-50">
      <SEO 
        title="AI Learning Support & Mentorship - LXERA"
        description="Give every learner their own intelligent mentor — always available, always supportive, and tuned to their personal growth."
        keywords="AI mentorship, learning support, intelligent mentor, real-time guidance, personalized learning"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50/20 to-cyan-50/20"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center animate-fade-in-up">
            <Badge className="mb-6 bg-teal-600/20 text-business-black border-teal-600/30 px-4 py-2 text-sm font-medium rounded-full font-inter">
              <MessageCircle className="w-4 h-4 mr-2" />
              AI Mentorship
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight font-inter">
              Learning Support & Mentorship
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed font-inter">
              Give every learner their own intelligent mentor — always available, always supportive, and tuned to their personal growth.
            </p>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {communityStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardContent className="pt-6">
                      <IconComponent className="w-8 h-8 text-teal-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-2xl font-semibold text-teal-600 mb-2">{stat.number}</div>
                      <div className="text-sm text-business-black/70">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-cyan-600 hover:to-teal-600 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 border-0 group font-inter"
              >
                Request a Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2 font-inter"
              >
                Explore the Platform
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 font-inter">
            Learning often breaks when support goes missing.
          </h2>
          <p className="text-lg text-business-black/70 leading-relaxed font-inter">
            Even motivated learners get stuck. Without someone to guide, encourage, or answer questions in real time, progress stalls and engagement fades. Scaling that level of support across teams and time zones is nearly impossible — unless you rethink how mentorship works.
          </p>
        </div>
      </section>

      {/* How LXERA Helps Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 font-inter">
              Real-time support, driven by intelligence and empathy.
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
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-600/20 to-cyan-600/30 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-xl font-medium text-business-black group-hover:text-teal-600 transition-colors mb-4 font-inter">
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
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-teal-600/20 to-cyan-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 font-inter">
            A mentorship layer that scales with your people.
          </h2>
          <p className="text-lg text-business-black/70 leading-relaxed font-inter">
            LXERA brings the warmth and responsiveness of human guidance together with the consistency and scale of intelligent systems. Learners feel supported. Leaders gain insight. And your organization builds a culture of growth — one person at a time.
          </p>
        </div>
      </section>

      {/* Real Impact Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-12 text-center shadow-xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>
            <blockquote className="text-xl lg:text-2xl text-business-black italic mb-6 leading-relaxed font-inter">
              "The live mentor felt like a real coach — always ready, always relevant. It wasn't just tech. It was encouragement that moved me forward."
            </blockquote>
            <cite className="text-business-black/70 font-medium font-inter">
              — User, Internal Beta
            </cite>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl p-12 shadow-2xl border border-teal-200/50">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-8 font-inter">
              Reimagine mentorship — personal, intelligent, and always there.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-teal-50 hover:text-teal-700 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 border-0 font-inter"
              >
                Talk to an Expert
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-teal-600 hover:border-white font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 font-inter"
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

export default AILearningSupport;
