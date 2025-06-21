
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Target, Lightbulb, Award, Globe, ArrowRight, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  const [activeValue, setActiveValue] = useState(0);

  const values = [
    {
      icon: Heart,
      title: "Human-Centered Innovation",
      description: "We believe technology should amplify human potential, not replace it. Every feature we build starts with understanding real human needs.",
      color: "from-rose-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20"
    },
    {
      icon: Users,
      title: "Inclusive Learning",
      description: "Learning opportunities should be accessible to everyone, regardless of background, role, or experience level.",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
    },
    {
      icon: Target,
      title: "Purpose-Driven Impact",
      description: "We measure success by the positive transformation we create in organizations and the lives of learners.",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
    },
    {
      icon: Lightbulb,
      title: "Continuous Innovation",
      description: "We're always learning, experimenting, and pushing boundaries to create the future of workplace learning.",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
    }
  ];

  const stats = [
    { number: "500K+", label: "Learners Empowered", icon: Users },
    { number: "1000+", label: "Organizations Transformed", icon: Globe },
    { number: "95%", label: "Engagement Rate", icon: Target },
    { number: "50+", label: "Countries Served", icon: Award }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      background: "Former Chief Learning Officer at Fortune 500 companies",
      speciality: "Strategic Leadership",
      image: "/placeholder.svg"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder", 
      background: "AI Research Scientist, MIT graduate",
      speciality: "AI Architecture",
      image: "/placeholder.svg"
    },
    {
      name: "Dr. Aisha Patel",
      role: "Head of Learning Science",
      background: "PhD in Educational Psychology, Stanford",
      speciality: "Learning Analytics",
      image: "/placeholder.svg"
    },
    {
      name: "James Liu",
      role: "Head of Product",
      background: "Former Product Lead at leading EdTech companies",
      speciality: "Product Strategy",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section - Dark with mint accents */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-future-green/10 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-future-green/20 text-future-green border-future-green/30 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              About LXERA
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              We're building the
              <span className="block bg-gradient-to-r from-future-green via-emerald to-teal bg-clip-text text-transparent">
                future of learning
              </span>
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              LXERA was born from a simple belief: every person has untapped potential waiting to be unlocked. 
              We're here to make that happen through AI-powered, human-centered learning experiences.
            </p>
          </div>
          
          {/* Stats - Dark cards with mint accents */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300">
                  <IconComponent className="w-8 h-8 text-future-green mx-auto mb-3" />
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-300 font-medium text-sm">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section - Light with dark cards */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-gray-900 text-white px-4 py-2">
                Our Mission
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Democratizing innovation through intelligent learning
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                To democratize innovation by creating learning experiences that unlock human potential at scale. 
                We believe that when people are empowered to learn, grow, and innovate, organizations transform, 
                and society advances.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 group">
                  <div className="w-2 h-2 bg-future-green rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="text-gray-700">Personalized learning for every individual</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-2 h-2 bg-future-green rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="text-gray-700">AI-powered insights that drive real outcomes</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex items-center space-x-3 group">
                  <div className="w-2 h-2 bg-future-green rounded-full group-hover:scale-125 transition-transform duration-300"></div>
                  <span className="text-gray-700">Innovation ecosystems that scale globally</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-xl border border-gray-700">
                <Globe className="w-16 h-16 text-future-green mb-6" />
                <h3 className="text-xl font-bold text-white mb-4">
                  Global Impact
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  From startups in Silicon Valley to enterprises in Tokyo, LXERA is transforming 
                  how organizations approach learning and innovation across 50+ countries.
                </p>
                <Badge className="bg-future-green/20 text-future-green border-future-green/30">
                  Worldwide Reach
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Dark theme */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-future-green/20 text-future-green border-future-green/30 px-4 py-2">
              Core Values
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-6">
              Principles that guide everything we do
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              These values shape every decision we make and every feature we build.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-gray-700 bg-gray-800/50 backdrop-blur-sm hover:bg-gray-800/70"
                  onClick={() => setActiveValue(index)}
                >
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${value.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white group-hover:text-future-green transition-colors duration-300">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">
                      {value.description}
                    </p>
                    <div className="mt-4 flex items-center text-future-green text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section - Light with dark accents */}
      <section className="py-20 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gray-900 text-white px-4 py-2">
              Leadership Team
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Meet the innovators behind LXERA
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Passionate experts from diverse backgrounds united by a common vision to transform learning.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gray-50">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-900 to-gray-700 rounded-full mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <div className="w-16 h-16 bg-gradient-to-br from-future-green to-emerald rounded-full"></div>
                    </div>
                    <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-future-green text-gray-900 text-xs px-2 py-1">
                      {member.speciality}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-future-green font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{member.background}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Dark with mint accent */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-6 bg-future-green/20 text-future-green border-future-green/30 px-4 py-2">
            Get Started
          </Badge>
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to transform learning in your organization?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the companies already using LXERA to unlock their team's potential.
          </p>
          <Button className="bg-future-green text-gray-900 font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:bg-emerald group">
            Get Started Today
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
