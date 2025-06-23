
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Users, Target, ArrowRight, Quote } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Human-Centered Innovation",
      description: "We believe technology should amplify human potential, not replace it. Every feature we build starts with understanding real human needs.",
      color: "from-pink-500 to-rose-400"
    },
    {
      icon: Users,
      title: "Inclusive Learning",
      description: "Learning opportunities should be accessible to everyone, regardless of background, role, or experience level.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: Target,
      title: "Purpose-Driven Impact",
      description: "We measure success by the positive transformation we create in organizations and the lives of learners.",
      color: "from-purple-500 to-indigo-400"
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      background: "Former Chief Learning Officer at Fortune 500 companies",
      quote: "I believe every person has untapped potential. My mission is to unlock that through technology that actually serves humanity.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b812b3c4?w=400&h=400&fit=crop&crop=face",
      accent: "bg-gradient-to-br from-emerald-400 to-teal-500"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder", 
      background: "AI Research Scientist, MIT graduate",
      quote: "The best AI doesn't replace human judgment—it amplifies human wisdom and creativity.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      accent: "bg-gradient-to-br from-violet-400 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section - Colorful gradient */}
      <section className="pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-future-green/10 via-smart-beige/50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-future-green/20 to-blue-100 rounded-full border border-future-green/30">
              <span className="text-sm font-medium bg-gradient-to-r from-business-black to-emerald-700 bg-clip-text text-transparent">About LXERA</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-light text-business-black leading-tight">
              Building the future of
              <span className="block font-medium bg-gradient-to-r from-future-green via-emerald-500 to-teal-500 bg-clip-text text-transparent">learning</span>
            </h1>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-light">
              We're passionate builders creating AI-powered solutions that help people unlock their potential through 
              <span className="text-purple-600 font-medium"> personalized</span>, 
              <span className="text-blue-600 font-medium"> engaging</span>, and 
              <span className="text-emerald-600 font-medium"> transformative</span> learning experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - Subtle color accents */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-8 leading-tight">
                Our <span className="bg-gradient-to-r from-future-green to-emerald-500 bg-clip-text text-transparent">Story</span>
              </h2>
              <div className="space-y-6 text-lg text-business-black/70 leading-relaxed font-light">
                <p>
                  We started LXERA because we believe learning should be <span className="text-blue-600 font-medium">personal</span>, <span className="text-purple-600 font-medium">engaging</span>, and <span className="text-emerald-600 font-medium">transformative</span>. Too often, people struggle with one-size-fits-all training that doesn't fit their needs.
                </p>
                <p>
                  We're changing that with AI that adapts to each learner, creating experiences that feel less like traditional training and more like having a thoughtful mentor who truly understands you.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-future-green/20 via-blue-100/50 to-purple-100/50 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <div className="w-32 h-32 bg-gradient-to-br from-future-green/40 to-emerald-400/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-future-green to-emerald-500 rounded-full shadow-lg"></div>
                </div>
                {/* Floating elements */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60"></div>
                <div className="absolute bottom-6 left-6 w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-70"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Colorful cards */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-blue-50/30 via-smart-beige/30 to-purple-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-4">
              What <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Drives</span> Us
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 hover:shadow-xl transition-all duration-500 border border-white/50 hover:scale-105 group">
                  <div className="flex items-start space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-business-black mb-3 leading-tight">
                        {value.title}
                      </h3>
                      <p className="text-business-black/60 leading-relaxed text-sm">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section - Colorful accents */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-4">
              Meet the <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Founders</span>
            </h2>
            <p className="text-lg text-business-black/60 font-light">
              Passionate leaders with <span className="text-purple-600 font-medium">big dreams</span> and the experience to make them reality
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className={`absolute inset-0 ${member.accent} rounded-full blur-lg opacity-30 scale-110 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-40 h-40 rounded-full object-cover mx-auto shadow-xl group-hover:scale-105 transition-transform duration-300 relative z-10 border-4 border-white"
                  />
                </div>
                <h3 className="text-2xl font-medium text-business-black mb-2">{member.name}</h3>
                <p className="bg-gradient-to-r from-future-green to-emerald-600 bg-clip-text text-transparent font-medium mb-2">{member.role}</p>
                <p className="text-sm text-business-black/50 mb-6">{member.background}</p>
                
                <div className="bg-gradient-to-br from-smart-beige/50 via-white/50 to-blue-50/50 rounded-2xl p-6 backdrop-blur-sm border border-white/50">
                  <Quote className="w-6 h-6 text-future-green/60 mx-auto mb-4" />
                  <blockquote className="text-business-black/70 italic leading-relaxed">
                    "{member.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Gradient background */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black via-gray-900 to-purple-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-light text-white mb-6 leading-tight">
            Join Us on This <span className="bg-gradient-to-r from-future-green to-emerald-400 bg-clip-text text-transparent">Journey</span>
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed font-light">
            We're just getting started. Let's have a conversation about the future of learning.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-future-green to-emerald-500 hover:from-emerald-500 hover:to-future-green text-business-black font-medium px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Get in Touch
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
