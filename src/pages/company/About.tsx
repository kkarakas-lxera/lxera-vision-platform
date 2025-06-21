
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Target, Lightbulb, Award, Globe } from "lucide-react";
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
    },
    {
      icon: Lightbulb,
      title: "Continuous Innovation",
      description: "We're always learning, experimenting, and pushing boundaries to create the future of workplace learning.",
      color: "from-future-green to-purple-400"
    }
  ];

  const stats = [
    { number: "500K+", label: "Learners Empowered" },
    { number: "1000+", label: "Organizations Transformed" },
    { number: "95%", label: "Engagement Rate" },
    { number: "50+", label: "Countries Served" }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      background: "Former Chief Learning Officer at Fortune 500 companies",
      image: "/placeholder.svg"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder", 
      background: "AI Research Scientist, MIT graduate",
      image: "/placeholder.svg"
    },
    {
      name: "Dr. Aisha Patel",
      role: "Head of Learning Science",
      background: "PhD in Educational Psychology, Stanford",
      image: "/placeholder.svg"
    },
    {
      name: "James Liu",
      role: "Head of Product",
      background: "Former Product Lead at leading EdTech companies",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation />
      
      {/* Hero Section - Dark with gradient accent */}
      <section className="relative pt-32 pb-20 px-6 lg:px-12 overflow-hidden bg-business-black">
        <div className="absolute inset-0">
          {/* Gradient overlay on the right */}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-future-green/20 via-purple-500/10 to-transparent"></div>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(122,229,198,0.3),transparent_50%)]"></div>
        </div>
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              We're building the
              <span className="block bg-gradient-to-r from-future-green via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                future of learning
              </span>
            </h1>
            <p className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed">
              LXERA was born from a simple belief: every person has untapped potential waiting to be unlocked. 
              We're here to make that happen through AI-powered, human-centered learning experiences.
            </p>
          </div>
          
          {/* Stats with dark card styling */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl lg:text-4xl font-bold text-future-green mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section - Light background */}
      <section className="py-20 px-6 lg:px-12 bg-smart-beige">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-business-black mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-business-black/70 mb-8 leading-relaxed">
                To democratize innovation by creating learning experiences that unlock human potential at scale. 
                We believe that when people are empowered to learn, grow, and innovate, organizations transform, 
                and society advances.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-future-green rounded-full"></div>
                  <span className="text-business-black/80">Personalized learning for every individual</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-future-green rounded-full"></div>
                  <span className="text-business-black/80">AI-powered insights that drive real outcomes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-future-green rounded-full"></div>
                  <span className="text-business-black/80">Innovation ecosystems that scale globally</span>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-gradient-to-br from-business-black to-gray-800 rounded-3xl p-8 shadow-xl relative overflow-hidden">
                {/* Gradient accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-future-green/30 to-transparent rounded-bl-3xl"></div>
                <Globe className="w-16 h-16 text-future-green mb-6 relative z-10" />
                <h3 className="text-xl font-bold text-white mb-4 relative z-10">
                  Global Impact
                </h3>
                <p className="text-white/80 leading-relaxed relative z-10">
                  From startups in Silicon Valley to enterprises in Tokyo, LXERA is transforming 
                  how organizations approach learning and innovation across 50+ countries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Dark background */}
      <section className="py-20 px-6 lg:px-12 bg-business-black relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/5 to-purple-500/10"></div>
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-6">
              Our Values
            </h2>
            <p className="text-lg text-white/70 max-w-3xl mx-auto">
              These principles guide every decision we make and every feature we build.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-future-green/30"
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
                    <p className="text-white/70 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section - Light background with dark cards */}
      <section className="py-20 px-6 lg:px-12 bg-smart-beige">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-business-black mb-6">
              Meet Our Leadership
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Passionate innovators from diverse backgrounds united by a common vision.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-business-black relative overflow-hidden">
                {/* Gradient accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-future-green/30 to-transparent"></div>
                <CardContent className="p-6 text-center relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-future-green to-purple-400 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/5 rounded-full backdrop-blur-sm"></div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-future-green font-medium mb-3">{member.role}</p>
                  <p className="text-sm text-white/60 leading-relaxed">{member.background}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Gradient background */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-business-black via-gray-800 to-business-black relative overflow-hidden">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-future-green/20 via-purple-500/20 to-future-green/20 opacity-30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(122,229,198,0.1),transparent_70%)]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to transform learning in your organization?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join the companies already using LXERA to unlock their team's potential.
          </p>
          <Button className="bg-gradient-to-r from-future-green to-emerald text-business-black font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-lg border-0">
            Get Started Today
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
