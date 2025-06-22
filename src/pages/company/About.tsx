
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, ArrowRight, Quote } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  const [activeValue, setActiveValue] = useState(0);

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
      
      {/* Hero Section - Clean and Simple */}
      <section className="pt-32 pb-24 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-8 leading-tight">
            We're building the future of learning
          </h1>
          <p className="text-xl text-business-black/70 max-w-2xl mx-auto leading-relaxed">
            LXERA is on a mission to make learning personal, engaging, and transformative. 
            We're passionate builders creating AI-powered solutions that help people unlock their potential.
          </p>
        </div>
      </section>

      {/* Story Section - Personal and Human */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
              Our Story
            </h2>
            <div className="w-16 h-1 bg-future-green mx-auto mb-12"></div>
          </div>
          
          <div className="prose lg:prose-lg mx-auto text-business-black/80 leading-relaxed">
            <p className="text-lg mb-6">
              We started LXERA because we believe learning should be personal, engaging, and transformative. 
              Too often, people struggle with one-size-fits-all training that doesn't fit their needs or learning style.
            </p>
            <p className="text-lg mb-6">
              We're changing that with AI that adapts to each learner, creating experiences that feel less like 
              traditional training and more like having a thoughtful mentor who truly understands you.
            </p>
            <p className="text-lg">
              We're in the early stages of building something transformative. Every day, we're learning, 
              iterating, and getting closer to our vision of making learning truly personal for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section - Clean Cards */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
              What Drives Us
            </h2>
            <div className="w-16 h-1 bg-future-green mx-auto"></div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-future-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-future-green" />
                  </div>
                  <h3 className="text-xl font-semibold text-business-black mb-4">
                    {value.title}
                  </h3>
                  <p className="text-business-black/70 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section - Human Focus */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8">
              Meet the Founders
            </h2>
            <div className="w-16 h-1 bg-future-green mx-auto mb-4"></div>
            <p className="text-lg text-business-black/70">
              Passionate leaders with big dreams and the experience to make them reality.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-6 shadow-lg"
                />
                <h3 className="text-2xl font-semibold text-business-black mb-2">{member.name}</h3>
                <p className="text-future-green font-medium mb-3">{member.role}</p>
                <p className="text-sm text-business-black/60 mb-6">{member.background}</p>
                
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Quote className="w-8 h-8 text-future-green/30 mx-auto mb-4" />
                  <blockquote className="text-business-black/80 italic leading-relaxed">
                    "{member.quote}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
            Join Us on This Journey
          </h2>
          <p className="text-lg text-business-black/70 mb-10 leading-relaxed">
            We're just getting started, and we'd love to show you what we're building. 
            Let's have a conversation about the future of learning.
          </p>
          <Button 
            size="lg"
            className="bg-future-green hover:bg-emerald text-business-black hover:text-white font-semibold px-12 py-6 text-lg rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:ring-4 focus:ring-future-green/30 focus:ring-offset-4 border-0"
          >
            Get in Touch
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
