
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
      description: "We believe technology should amplify human potential, not replace it. Every feature we build starts with understanding real human needs."
    },
    {
      icon: Users,
      title: "Inclusive Learning",
      description: "Learning opportunities should be accessible to everyone, regardless of background, role, or experience level."
    },
    {
      icon: Target,
      title: "Purpose-Driven Impact",
      description: "We measure success by the positive transformation we create in organizations and the lives of learners."
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
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section - Ultra Clean */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-2 bg-future-green/10 rounded-full">
              <span className="text-sm font-medium text-business-black">About LXERA</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-light text-business-black leading-tight">
              Building the future of
              <span className="block font-medium" style={{ color: '#7AE5C6' }}>learning</span>
            </h1>
            <p className="text-xl text-business-black/60 max-w-3xl mx-auto leading-relaxed font-light">
              We're passionate builders creating AI-powered solutions that help people unlock their potential through personalized, engaging, and transformative learning experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - Minimal */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-8 leading-tight">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-business-black/70 leading-relaxed font-light">
                <p>
                  We started LXERA because we believe learning should be personal, engaging, and transformative. Too often, people struggle with one-size-fits-all training that doesn't fit their needs.
                </p>
                <p>
                  We're changing that with AI that adapts to each learner, creating experiences that feel less like traditional training and more like having a thoughtful mentor who truly understands you.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-future-green/20 to-smart-beige/50 rounded-3xl flex items-center justify-center">
                <div className="w-32 h-32 bg-future-green/30 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-future-green rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Cards Redesign */}
      <section className="py-20 px-6 lg:px-12 bg-smart-beige/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-4">
              What Drives Us
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-business-black rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
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

      {/* Team Section - Simplified */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-4">
              Meet the Founders
            </h2>
            <p className="text-lg text-business-black/60 font-light">
              Passionate leaders with big dreams and the experience to make them reality
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {team.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-40 h-40 rounded-full object-cover mx-auto shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-2xl font-medium text-business-black mb-2">{member.name}</h3>
                <p className="text-future-green font-medium mb-2">{member.role}</p>
                <p className="text-sm text-business-black/50 mb-6">{member.background}</p>
                
                <div className="bg-smart-beige/50 rounded-xl p-6">
                  <Quote className="w-6 h-6 text-future-green/40 mx-auto mb-4" />
                  <blockquote className="text-business-black/70 italic leading-relaxed">
                    "{member.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="py-20 px-6 lg:px-12 bg-business-black">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-light text-white mb-6 leading-tight">
            Join Us on This Journey
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed font-light">
            We're just getting started. Let's have a conversation about the future of learning.
          </p>
          <Button 
            size="lg"
            className="bg-future-green hover:bg-future-green/90 text-business-black font-medium px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-300 hover:scale-105"
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
