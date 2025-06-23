
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Users, Target, ArrowRight, Quote, Coffee, Lightbulb, Smile, Brain, Zap } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
  const values = [
    {
      icon: Brain,
      title: "AI-Powered Human Learning",
      description: "We believe AI should amplify human potential, not replace it. Every algorithm we build starts with understanding how people actually learn, grow, and innovate. Technology should feel intuitive, not intimidating.",
      color: "from-future-green to-emerald-500"
    },
    {
      icon: Zap,
      title: "Innovation Through Learning",
      description: "Whether you're a CEO or an intern, a tech expert or someone new to digital tools—everyone deserves access to transformative learning experiences. The best innovations come from empowered teams.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: Target,
      title: "Enterprise Impact, Human Touch",
      description: "We're building enterprise-grade solutions with startup agility. Our mission is helping organizations unlock their people's potential through personalized, AI-driven learning that actually works.",
      color: "from-purple-500 to-indigo-400"
    }
  ];

  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-Founder",
      background: "Former Chief Learning Officer at Fortune 500 companies",
      quote: "I've seen brilliant people held back by one-size-fits-all training. My mission? Building AI that personalizes learning for every individual while scaling across entire organizations. Also, I make terrible coffee but amazing learning experiences.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b812b3c4?w=400&h=400&fit=crop&crop=face",
      accent: "bg-gradient-to-br from-emerald-400 to-teal-500",
      funFact: "🎸 Plays guitar (badly) to destress",
      hobby: "Weekend hiker & AI research enthusiast"
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-Founder", 
      background: "AI Research Scientist, MIT graduate",
      quote: "I believe AI should be like the best teacher you've ever had—patient, adaptive, and never makes you feel dumb for asking questions. When enterprise teams can use our AI intuitively and love the experience, I know we've built something special.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      accent: "bg-gradient-to-br from-violet-400 to-purple-500",
      funFact: "☕ 6-cup-a-day coffee addict",
      hobby: "Weekend rock climber & machine learning tinkerer"
    }
  ];

  const quirks = [
    {
      icon: Coffee,
      text: "Our best AI breakthroughs happen over coffee conversations"
    },
    {
      icon: Smile,
      text: "We celebrate every user's learning milestone with virtual high-fives"
    },
    {
      icon: Lightbulb,
      text: "Tuesday 'Walk & Talk' meetings often solve our toughest AI challenges"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section - More aligned with brand positioning */}
      <section className="pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-future-green/10 via-smart-beige/50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-future-green/20 to-blue-100 rounded-full border border-future-green/30">
              <span className="text-sm font-medium bg-gradient-to-r from-business-black to-emerald-700 bg-clip-text text-transparent">Meet the team behind LXERA</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-light text-business-black leading-tight">
              Building the future of
              <span className="block font-medium bg-gradient-to-r from-future-green via-emerald-500 to-teal-500 bg-clip-text text-transparent">AI-powered learning</span>
            </h1>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-light">
              Two AI and learning experts who got tired of watching organizations struggle with 
              ineffective training. So we built an intelligent platform that 
              <span className="text-purple-600 font-medium"> adapts to every learner</span>, 
              <span className="text-blue-600 font-medium"> scales across enterprises</span>, and 
              <span className="text-emerald-600 font-medium"> drives real innovation</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - More focused on the AI/learning mission */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-8 leading-tight">
                Our <span className="bg-gradient-to-r from-future-green to-emerald-500 bg-clip-text text-transparent">Mission</span>
              </h2>
              <div className="space-y-6 text-lg text-business-black/70 leading-relaxed font-light">
                <p>
                  It started with a simple question: Why does enterprise learning have to be so... <em>ineffective</em>? Sarah was watching brilliant teams struggle with generic training programs, and Marcus was developing AI that could understand complex human behavior patterns—but somehow, learning platforms still treated everyone identically.
                </p>
                <p>
                  One late-night conversation over (way too much) coffee later, LXERA was born. We're not just building software; we're crafting <span className="text-blue-600 font-medium">AI-powered experiences that make organizations think</span>, <span className="text-emerald-600 font-medium">"This actually transforms how our people learn and innovate."</span>
                </p>
                <p>
                  <span className="text-purple-600 font-medium">The best part?</span> Every day, we see teams discovering they're capable of innovation they never imagined. That's what drives us to push the boundaries of what's possible with AI and learning.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-future-green/20 via-blue-100/50 to-purple-100/50 rounded-3xl flex items-center justify-center relative overflow-hidden">
                <div className="w-32 h-32 bg-gradient-to-br from-future-green/40 to-emerald-400/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-16 h-16 bg-gradient-to-br from-future-green to-emerald-500 rounded-full shadow-lg flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                </div>
                {/* Floating elements representing AI/innovation */}
                <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-60 animate-float"></div>
                <div className="absolute bottom-6 left-6 w-4 h-4 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-4 w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fun Office Quirks Section - tied to innovation */}
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-smart-beige/30 to-future-green/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-medium text-business-black mb-8">
            How We Build Innovation-Driven AI
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {quirks.map((quirk, index) => {
              const IconComponent = quirk.icon;
              return (
                <div key={index} className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4">
                  <IconComponent className="w-6 h-6 text-future-green flex-shrink-0" />
                  <p className="text-business-black/70 text-sm">{quirk.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section - Updated to reflect AI/enterprise focus */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-blue-50/30 via-smart-beige/30 to-purple-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-4">
              What Drives Our <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Innovation</span>
            </h2>
            <p className="text-lg text-business-black/60 font-light">
              These principles guide every AI model we train and every learning experience we create.
            </p>
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

      {/* Team Section - More focused on expertise */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-4">
              Meet the <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Founders</span>
            </h2>
            <p className="text-lg text-business-black/60 font-light">
              Two experts with <span className="text-purple-600 font-medium">complementary backgrounds</span> in AI and enterprise learning, united by a vision for transformative education technology.
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
                <p className="text-sm text-business-black/50 mb-4">{member.background}</p>
                
                {/* Fun facts */}
                <div className="flex justify-center space-x-4 mb-6 text-sm">
                  <span className="bg-future-green/10 px-3 py-1 rounded-full text-business-black/60">
                    {member.funFact}
                  </span>
                  <span className="bg-blue-100/50 px-3 py-1 rounded-full text-business-black/60">
                    {member.hobby}
                  </span>
                </div>
                
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

      {/* CTA Section - More aligned with enterprise positioning */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black via-gray-900 to-purple-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-light text-white mb-6 leading-tight">
            Ready to Transform Your <span className="bg-gradient-to-r from-future-green to-emerald-400 bg-clip-text text-transparent">Learning Strategy?</span>
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed font-light">
            Whether you're a startup or an enterprise, let's explore how AI-powered personalization 
            can unlock your team's innovation potential and drive measurable learning outcomes.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-future-green to-emerald-500 hover:from-emerald-500 hover:to-future-green text-business-black font-medium px-8 py-4 text-lg rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Schedule a Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
