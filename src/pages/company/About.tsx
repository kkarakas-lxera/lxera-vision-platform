import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Users, Target, Coffee, Lightbulb, Smile } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PricingContactSales from "@/components/forms/PricingContactSales";

const About = () => {

  const values = [
    {
      icon: Heart,
      title: "Human-First Everything",
      description: "We're real people building for real people. Every line of code we write starts with asking: 'How can this make someone's day a little better?' Technology should feel like having a helpful friend, not a cold machine.",
      color: "from-pink-500 to-rose-400"
    },
    {
      icon: Users,
      title: "Learning for Everyone",
      description: "Whether you're a CEO or an intern, a tech wizard or someone who still calls IT for help—everyone deserves to grow. We believe the best ideas come from the most unexpected places.",
      color: "from-blue-500 to-cyan-400"
    },
    {
      icon: Lightbulb,
      title: "Purpose Over Profit",
      description: "Sure, we want to build a sustainable business, but what gets us up in the morning is knowing we helped someone unlock a skill they never thought they had. Those 'aha!' moments? That's our fuel.",
      color: "from-purple-500 to-indigo-400"
    }
  ];


  const quirks = [
    {
      icon: Coffee,
      text: "Our office runs on coffee and curiosity (mostly coffee)"
    },
    {
      icon: Smile,
      text: "We celebrate every user's 'aha!' moment with virtual high-fives"
    },
    {
      icon: Lightbulb,
      text: "Best ideas happen during our Tuesday 'Walk & Talk' meetings"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section - More personal and warm */}
      <section className="pt-32 pb-20 px-6 lg:px-12 bg-gradient-to-br from-future-green/10 via-smart-beige/50 to-purple-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-6">
            <div className="inline-block px-6 py-3 bg-gradient-to-r from-future-green/20 to-blue-100 rounded-full border border-future-green/30">
              <span className="text-sm font-medium bg-gradient-to-r from-business-black to-emerald-700 bg-clip-text text-transparent">Hi there! We're LXERA</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-light text-business-black leading-tight">
              We're the humans behind
              <span className="block font-medium bg-gradient-to-r from-future-green via-emerald-500 to-teal-500 bg-clip-text text-transparent">tomorrow's learning</span>
            </h1>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-light">
              Two caffeine-fueled dreamers who got tired of watching amazing people struggle with boring, 
              one-size-fits-all training. So we built something better—an AI that actually 
              <span className="text-purple-600 font-medium"> gets you</span>, 
              <span className="text-blue-600 font-medium"> adapts to you</span>, and 
              <span className="text-emerald-600 font-medium"> grows with you</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section - More personal narrative */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-8 leading-tight">
                Our <span className="bg-gradient-to-r from-future-green to-emerald-500 bg-clip-text text-transparent">Story</span>
              </h2>
              <div className="space-y-6 text-lg text-business-black/70 leading-relaxed font-light">
                <p>
                  It started with a simple frustration: Why does workplace learning have to be so... <em>boring</em>? Sarah was watching brilliant employees check out during training sessions, and Marcus was building AI that could understand complex human behavior—but somehow, learning platforms still treated everyone like they were the same person.
                </p>
                <p>
                  One late-night conversation over (way too much) coffee later, LXERA was born. We're not just building software; we're crafting experiences that make people think, <span className="text-blue-600 font-medium">"Wow, this actually makes sense!"</span>
                </p>
                <p>
                  <span className="text-emerald-600 font-medium">The best part?</span> Every day, we get messages from users who discovered they were capable of more than they ever imagined. That's the stuff that keeps us going.
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

      {/* Fun Office Quirks Section */}
      <section className="py-16 px-6 lg:px-12 bg-gradient-to-r from-smart-beige/30 to-future-green/10">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-medium text-business-black mb-8">
            A Few Things You Should Know About Us
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

      {/* Values Section - More human language */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-blue-50/30 via-smart-beige/30 to-purple-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light text-business-black mb-4">
              What <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Actually</span> Matters to Us
            </h2>
            <p className="text-lg text-business-black/60 font-light">
              These aren't just values we put on a wall—they're how we actually show up every day.
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


      {/* CTA Section - More personal invitation */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black via-gray-900 to-purple-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-light text-white mb-6 leading-tight">
            Want to Chat About <span className="bg-gradient-to-r from-future-green to-emerald-400 bg-clip-text text-transparent">Learning?</span>
          </h2>
          <p className="text-lg text-white/70 mb-10 leading-relaxed font-light">
            Seriously, we love talking about this stuff. Whether you have 5 employees or 50,000, 
            let's figure out how to make learning work better for your people.
          </p>
          <PricingContactSales 
            source="about_page"
            className="max-w-xs"
          />
        </div>
      </section>

      <Footer />
      
    </div>
  );
};

export default About;
