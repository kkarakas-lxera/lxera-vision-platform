
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
      quote: "I believe every person has untapped potential. My mission is to unlock that through technology that actually serves humanity.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b812b3c4?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder", 
      background: "AI Research Scientist, MIT graduate",
      quote: "The best AI doesn't replace human judgment—it amplifies human wisdom and creativity.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Dr. Aisha Patel",
      role: "Head of Learning Science",
      background: "PhD in Educational Psychology, Stanford",
      quote: "Learning is deeply personal. Our role is to create experiences that honor each person's unique journey.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "James Liu",
      role: "Head of Product",
      background: "Former Product Lead at leading EdTech companies",
      quote: "Great products feel like magic, but they're built with deep empathy for real human needs.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Flowing gradient background - spans entire page like Writer's design */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-smart-beige via-white to-smart-beige"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-future-green/20 via-transparent via-transparent to-purple-400/20"></div>
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-future-green/10 via-purple-500/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-2/3 bg-gradient-to-tr from-emerald/10 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10">
        <Navigation />
        
        {/* Hero Section - More human, conversational */}
        <section className="relative pt-32 pb-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6">
                We're humans building
                <span className="block bg-gradient-to-r from-future-green via-emerald to-purple-400 bg-clip-text text-transparent">
                  the future of learning
                </span>
              </h1>
              <p className="text-lg text-business-black/70 max-w-3xl mx-auto leading-relaxed">
                LXERA started with a simple belief: every person deserves the chance to grow, learn, and unlock their potential. 
                We're a team of dreamers, builders, and lifelong learners who happen to be really good with AI.
              </p>
            </div>
            
            {/* Stats with softer, more human styling */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 rounded-3xl bg-white/40 backdrop-blur-sm border border-white/30 hover:bg-white/60 transition-all duration-300 hover:scale-105">
                  <div className="text-3xl lg:text-4xl font-bold text-business-black mb-2">
                    {stat.number}
                  </div>
                  <div className="text-business-black/70 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section - More personal storytelling */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-business-black mb-6">
                  Why We Wake Up Every Day
                </h2>
                <p className="text-lg text-business-black/70 mb-8 leading-relaxed">
                  We've all been there—sitting in training that doesn't click, struggling with skills that seem out of reach, 
                  or watching brilliant ideas get lost in bureaucracy. We started LXERA because we believe learning should 
                  be personal, engaging, and transformative.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-future-green rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-business-black/80">Every learner gets a personalized journey that actually fits their life</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-future-green rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-business-black/80">AI that feels helpful, not intimidating—like having a patient mentor</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-future-green rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-business-black/80">Innovation that spreads naturally when people feel empowered</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-future-green/20 to-transparent rounded-bl-3xl"></div>
                  <Globe className="w-16 h-16 text-future-green mb-6 relative z-10" />
                  <h3 className="text-xl font-bold text-business-black mb-4 relative z-10">
                    A Global Community
                  </h3>
                  <p className="text-business-black/70 leading-relaxed relative z-10">
                    From a startup founder in São Paulo learning to code, to a factory manager in Detroit mastering lean processes, 
                    to a marketing team in Tokyo exploring AI tools—we're honored to be part of everyone's growth story.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section - Softer, more organic */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-business-black mb-6">
                What Drives Us
              </h2>
              <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
                These aren't just words on a wall—they're the principles that guide every conversation, every line of code, and every decision we make.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8">
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

        {/* Team Section - More personal with quotes */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-business-black mb-6">
                Meet the Humans Behind LXERA
              </h2>
              <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
                We're educators, technologists, designers, and dreamers from all over the world, united by our passion for human potential.
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

        {/* CTA Section - Warmer, more inviting */}
        <section className="py-20 px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/30 backdrop-blur-sm rounded-3xl p-12 border border-white/30">
              <h2 className="text-3xl font-bold text-business-black mb-6">
                Ready to unlock your team's potential?
              </h2>
              <p className="text-lg text-business-black/70 mb-8 max-w-2xl mx-auto">
                We'd love to show you how LXERA can help your people grow, learn, and innovate. 
                No sales pitch—just a genuine conversation about your goals.
              </p>
              <Button className="bg-gradient-to-r from-future-green to-emerald hover:from-emerald hover:to-future-green text-business-black font-semibold px-8 py-3 rounded-2xl text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-lg border-0">
                Let's Chat
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
