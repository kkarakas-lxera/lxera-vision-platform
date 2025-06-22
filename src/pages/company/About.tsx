
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, Lightbulb, ArrowRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  const [activeValue, setActiveValue] = useState(0);

  const values = [
    {
      icon: Heart,
      title: "Human-Centered Innovation",
      description: "We believe technology should amplify human potential, not replace it. Every feature we build starts with understanding real human needs.",
      color: "from-future-green to-emerald"
    },
    {
      icon: Users,
      title: "Inclusive Learning",
      description: "Learning opportunities should be accessible to everyone, regardless of background, role, or experience level.",
      color: "from-future-green to-cyan-400"
    },
    {
      icon: Target,
      title: "Purpose-Driven Impact",
      description: "We measure success by the positive transformation we create in organizations and the lives of learners.",
      color: "from-emerald to-teal-500"
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      background: "Former Chief Learning Officer at Fortune 500 companies",
      quote: "I believe every person has untapped potential. My mission is to unlock that through technology that actually serves humanity.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b812b3c4?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder", 
      background: "AI Research Scientist, MIT graduate",
      quote: "The best AI doesn't replace human judgment—it amplifies human wisdom and creativity.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Flowing gradient background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-smart-beige via-white to-smart-beige"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-future-green/20 via-transparent via-transparent to-purple-400/20"></div>
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-future-green/10 via-purple-500/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-2/3 bg-gradient-to-tr from-emerald/10 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight">
                We're building
                <span className="bg-gradient-to-r from-future-green via-emerald to-purple-400 bg-clip-text text-transparent block">
                  the future of learning
                </span>
              </h1>
              <p className="text-lg text-business-black/70 max-w-3xl mx-auto leading-relaxed">
                LXERA is on a mission to make learning personal, engaging, and transformative. 
                We're passionate builders creating AI-powered solutions that help people unlock their potential.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-business-black/70 mb-8 leading-relaxed">
                  We believe learning should be personal, engaging, and transformative. Too often, people struggle 
                  with one-size-fits-all training that doesn't fit their needs or learning style. We're changing that 
                  with AI that adapts to each learner.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-future-green rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-business-black/80">Personalized learning paths that adapt to you</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-future-green rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-business-black/80">AI mentorship that's always available when you need it</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-future-green rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-business-black/80">Technology that feels human, not intimidating</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-future-green/20 to-transparent rounded-bl-3xl"></div>
                  <Lightbulb className="w-16 h-16 text-future-green mb-6 relative z-10" />
                  <h3 className="text-xl font-bold text-business-black mb-4 relative z-10">
                    Early Stage, Big Vision
                  </h3>
                  <p className="text-business-black/70 leading-relaxed relative z-10">
                    We're in the early stages of building something transformative. Every day, we're learning, 
                    iterating, and getting closer to our vision of making learning truly personal for everyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
                What Drives Us
              </h2>
              <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
                These principles guide every decision we make as we build LXERA.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <Card 
                    key={index} 
                    className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/30 backdrop-blur-sm hover:bg-white/50 rounded-3xl"
                    onClick={() => setActiveValue(index)}
                  >
                    <CardHeader>
                      <div className={`w-16 h-16 rounded-3xl bg-gradient-to-r ${value.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-business-black group-hover:text-future-green transition-colors duration-300">
                        {value.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-business-black/70 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
                Meet the Founders
              </h2>
              <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
                Passionate leaders with big dreams and the experience to make them reality.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/40 backdrop-blur-sm hover:bg-white/60 rounded-3xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-business-black mb-1">{member.name}</h3>
                        <p className="text-future-green font-medium mb-3">{member.role}</p>
                        <p className="text-sm text-business-black/60 mb-4">{member.background}</p>
                        <blockquote className="text-sm text-business-black/80 italic leading-relaxed border-l-2 border-future-green/30 pl-4">
                          "{member.quote}"
                        </blockquote>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-12 border border-white/30">
              <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
                Join Us on This Journey
              </h2>
              <p className="text-lg text-business-black/70 mb-8 max-w-2xl mx-auto">
                We're just getting started, and we'd love to show you what we're building. 
                Let's have a conversation about the future of learning.
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-future-green to-emerald hover:from-emerald hover:to-future-green text-business-black hover:text-white font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-future-green/30 focus:ring-offset-4 border-0"
              >
                Get in Touch
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default About;
