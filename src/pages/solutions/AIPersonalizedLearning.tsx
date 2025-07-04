import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ContactSalesModal from "@/components/ContactSalesModal";
import WaitlistModal from "@/components/WaitlistModal";
import { ArrowRight, Brain, CheckCircle, Users, Target, BarChart3, Zap, Star, Search, BookOpen, Lightbulb } from "lucide-react";
import { useState } from "react";

const AIPersonalizedLearning = () => {
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  const handleContactSales = () => {
    setIsContactSalesModalOpen(true);
  };

  const handleGetEarlyAccess = () => {
    setIsWaitlistModalOpen(true);
  };

  const features = [
    {
      icon: Brain,
      title: "Behavior-Based Personalization",
      description: "LXERA adapts content based on how users interact, reflect, and respond."
    },
    {
      icon: Search,
      title: "Goal-Driven Learning Journeys",
      description: "Every learner's experience is shaped by their goals, skill gaps, and intent."
    },
    {
      icon: BookOpen,
      title: "Content Tailoring in Real Time",
      description: "Our AI engine adjusts content difficulty, format, and sequence on the fly."
    },
    {
      icon: Target,
      title: "Adaptive Learning Styles",
      description: "Matches delivery style to user preferences — visual, auditory, action-based, or mixed."
    },
    {
      icon: Lightbulb,
      title: "Microlearning & Modular Paths",
      description: "Breaks content into personalized, digestible modules that suit learners' schedules."
    },
    {
      icon: Zap,
      title: "Motivational Response Tracking",
      description: "Detects emotional signals and adapts the learning pace to sustain focus and flow."
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-smart-beige to-white">
        <SEO 
          title="AI-Personalized Learning - LXERA"
          description="Deliver uniquely tailored content and learning journeys that adapt to each individual's goals, pace, and motivation — all powered by AI."
          keywords="AI learning, personalized education, adaptive learning, machine learning education"
        />
        <Navigation />
        
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-50/20 to-rose-50/20"></div>
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center animate-fade-in-up">
              <Badge className="mb-6 bg-pink-600/20 text-business-black border-pink-600/30 px-4 py-2 text-sm font-medium rounded-full font-inter">
                <Brain className="w-4 h-4 mr-2" />
                AI-Personalized Learning
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight font-inter">
                AI-Personalized Learning
              </h1>
              <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed font-inter">
                Deliver uniquely tailored content and learning journeys that adapt to each individual's goals, pace, and motivation — all powered by AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleContactSales}
                  className="bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-rose-600 hover:to-pink-600 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-pink-500/50 focus:ring-offset-2 border-0 group font-inter"
                >
                  Request a Demo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGetEarlyAccess}
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
              One-size-fits-all learning doesn't work anymore.
            </h2>
            <p className="text-lg text-business-black/70 leading-relaxed font-inter">
              Learners are diverse. Their goals, knowledge levels, motivation, and learning styles vary widely. Static courses and fixed paths fail to keep them engaged or progressing. To truly unlock human potential, learning needs to be personal — dynamic, responsive, and intelligent.
            </p>
          </div>
        </section>

        {/* How LXERA Helps Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 font-inter">
                AI that learns the learner.
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card 
                    key={index} 
                    className="group border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up hover:-translate-y-2 rounded-3xl p-6 relative"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-600/20 to-rose-600/30 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-business-black" />
                      </div>
                      <CardTitle className="text-xl font-medium text-business-black group-hover:text-pink-600 transition-colors mb-4 font-inter">
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
        <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-pink-600/20 to-rose-600/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 font-inter">
              Smarter learning. Better outcomes.
            </h2>
            <p className="text-lg text-business-black/70 leading-relaxed font-inter">
              AI-personalized learning empowers individuals to learn faster, retain more, and stay engaged longer. Organizations benefit from increased learner satisfaction, reduced time-to-skill, and a more adaptive, data-rich L&D ecosystem.
            </p>
          </div>
        </section>

        {/* Real Impact Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl p-12 text-center shadow-xl">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </div>
              <blockquote className="text-xl lg:text-2xl text-business-black italic mb-6 leading-relaxed font-inter">
                "It was the first time a platform adapted to me — not the other way around. LXERA understood how I learn and kept me going."
              </blockquote>
              <cite className="text-business-black/70 font-medium font-inter">
                — Early User, Personalization Pilot
              </cite>
            </div>
          </div>
        </section>

        {/* Closing CTA Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-12 shadow-2xl border border-pink-200/50">
              <h2 className="text-3xl lg:text-4xl font-medium text-white mb-8 font-inter">
                Make every learning experience personal and powerful.
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={handleContactSales}
                  className="bg-white text-pink-600 hover:bg-pink-50 hover:text-pink-700 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 border-0 font-inter"
                >
                  Request a Demo
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleGetEarlyAccess}
                  className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-pink-600 hover:border-white font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 font-inter"
                >
                  Get Early Access
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <ContactSalesModal 
        isOpen={isContactSalesModalOpen} 
        onClose={() => setIsContactSalesModalOpen(false)}
      />
      <WaitlistModal 
        isOpen={isWaitlistModalOpen} 
        onClose={() => setIsWaitlistModalOpen(false)}
      />
    </>
  );
};

export default AIPersonalizedLearning;
