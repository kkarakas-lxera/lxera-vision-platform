
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Users, Lightbulb, Target, Zap, BookOpen, MessageCircle, TrendingUp, Puzzle, Rocket, Quote } from "lucide-react";

const CitizenDeveloperEnablement = () => {
  const enablementFeatures = [
    {
      icon: BookOpen,
      title: "Personalized Learning for Builders",
      description: "Guided pathways for non-technical talent to learn automation, process design, and low-code tools."
    },
    {
      icon: MessageCircle,
      title: "Real-Time Help & Guidance",
      description: "In-app support helps learners prototype confidently and avoid getting stuck."
    },
    {
      icon: TrendingUp,
      title: "Skill Recognition & Progress Tracking",
      description: "Visual dashboards show what users are building — and how they're growing."
    },
    {
      icon: Puzzle,
      title: "Templates & Jumpstart Toolkits",
      description: "Ready-to-use assets make it easy to turn ideas into working solutions fast."
    },
    {
      icon: Users,
      title: "Mentorship & Collaboration Spaces",
      description: "Learners connect with peers or mentors to test and improve their solutions."
    },
    {
      icon: Rocket,
      title: "Integrated with Your Tools & Data",
      description: "Aligned with your internal systems so solutions can move into production easily."
    }
  ];

  const empowermentStats = [
    { number: "No", label: "Coding Required", icon: Zap },
    { number: "Real-time", label: "Support", icon: MessageCircle },
    { number: "Bottom-up", label: "Innovation", icon: Lightbulb },
    { number: "Everyday", label: "Experts", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-smart-beige to-green-50">
      <SEO 
        title="Citizen Developer Enablement - LXERA"
        description="Empower your people to solve problems, build tools, and innovate — no coding required."
        keywords="citizen developer, no-code development, employee empowerment, innovation enablement, process automation"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/30 to-future-green/20"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center animate-fade-in-up">
            <Badge className="mb-6 bg-emerald-600/20 text-business-black border-emerald-600/30 px-4 py-2 text-sm font-medium rounded-full font-inter">
              <Users className="w-4 h-4 mr-2" />
              Citizen Development
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight font-inter">
              Citizen Developer Enablement
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed font-inter">
              Empower your people to solve problems, build tools, and innovate — no coding required.
            </p>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {empowermentStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="text-center border-0 bg-gradient-to-br from-emerald-100/80 to-future-green/40 backdrop-blur-sm hover:from-emerald-200/80 hover:to-future-green/60 transition-all duration-300 animate-fade-in-up group" style={{ animationDelay: `${index * 100}ms` }}>
                    <CardContent className="pt-6">
                      <IconComponent className="w-8 h-8 text-emerald-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-2xl font-semibold text-emerald-600 mb-2">{stat.number}</div>
                      <div className="text-sm text-business-black/70">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-future-green text-white hover:from-emerald-700 hover:to-emerald-600 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 border-0 group font-inter"
              >
                Request a Demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-emerald-600/30 bg-future-green/20 backdrop-blur-sm text-business-black hover:bg-emerald-600 hover:text-white hover:border-emerald-600 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 font-inter"
              >
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* The Challenge Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-future-green/30 to-emerald-100/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 font-inter">
            Innovation shouldn't be limited to IT or leadership.
          </h2>
          <p className="text-lg text-business-black/70 leading-relaxed font-inter">
            Your teams are full of people who understand day-to-day challenges — but they often lack the tools or confidence to create solutions. Without support, ideas stay stuck. Innovation becomes siloed. And opportunities for growth are missed.
          </p>
        </div>
      </section>

      {/* How LXERA Helps Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-emerald-50 to-future-green/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6 font-inter">
              Turn everyday experts into solution creators.
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enablementFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-0 bg-gradient-to-br from-emerald-100/70 to-future-green/30 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:from-emerald-200/80 hover:to-future-green/50 transition-all duration-500 animate-fade-in-up hover:-translate-y-2 rounded-3xl p-6 relative"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-future-green rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-medium text-business-black group-hover:text-emerald-700 transition-colors mb-4 font-inter">
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
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-r from-emerald-600/20 to-future-green/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-8 font-inter">
            A culture where innovation comes from everywhere.
          </h2>
          <p className="text-lg text-business-black/70 leading-relaxed font-inter">
            LXERA creates the conditions for bottom-up innovation — giving people the skills, support, and confidence to solve real problems. As they build, they learn. As they learn, they drive transformation.
          </p>
        </div>
      </section>

      {/* Real Impact Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-emerald-50 to-future-green/20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-100 to-future-green/60 rounded-3xl p-12 text-center shadow-xl">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-future-green rounded-full flex items-center justify-center mx-auto mb-6">
                <Quote className="w-8 h-8 text-white" />
              </div>
            </div>
            <blockquote className="text-xl lg:text-2xl text-business-black italic mb-6 leading-relaxed font-inter">
              "I never thought I could build something that would change how we work — now I've done it twice."
            </blockquote>
            <cite className="text-business-black/70 font-medium font-inter">
              — Operations Coordinator, Citizen Dev Pilot
            </cite>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-emerald-600 to-future-green rounded-3xl p-12 shadow-2xl border border-emerald-200/50">
            <h2 className="text-3xl lg:text-4xl font-medium text-white mb-8 font-inter">
              Unleash the builders already on your team.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 border-0 font-inter"
              >
                Talk to an Expert
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-emerald-600 hover:border-white font-medium px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-white/30 focus:ring-offset-2 font-inter"
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

export default CitizenDeveloperEnablement;
