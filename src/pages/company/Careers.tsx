import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Heart, Zap, Target, ArrowRight } from "lucide-react";

const Careers = () => {
  const openRoles = [];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance plus wellness stipends"
    },
    {
      icon: Zap,
      title: "Growth & Development",
      description: "Annual learning budget and access to LXERA's premium learning platform"
    },
    {
      icon: Users,
      title: "Work-Life Balance",
      description: "Flexible schedules, unlimited PTO, and remote-friendly culture"
    },
    {
      icon: Target,
      title: "Equity & Impact",
      description: "Competitive equity package and opportunity to shape the future of learning"
    }
  ];

  const values = [
    "Innovation-first mindset",
    "Collaborative spirit",
    "Customer obsession",
    "Continuous learning",
    "Inclusive culture",
    "Global perspective"
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-6 leading-tight">
            Join the Future of
            <span className="block bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
              Learning Innovation
            </span>
          </h1>
          <p className="text-lg text-business-black/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            We're building a team of passionate innovators who believe in the power of learning 
            to transform organizations and unlock human potential.
          </p>
          <Button 
            onClick={() => window.open('https://www.linkedin.com/company/lxera', '_blank')}
            className="bg-future-green text-business-black font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105"
          >
            Join Our Talent Network
          </Button>
        </div>
      </section>

      {/* Open Roles Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Open Positions
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              We currently don't have any openings. Please check back later or join our talent network below.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Why Work at LXERA?
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              We believe in taking care of our team so they can do their best work
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="text-center border-0 bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-emerald/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-future-green" />
                    </div>
                    <CardTitle className="text-lg text-business-black mb-2">
                      {benefit.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              What We Look For
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Beyond skills and experience, we value these qualities in our team members
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300">
                <span className="text-business-black font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black to-business-black/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-medium text-white mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            We're always looking for exceptional talent to join our mission. Be the first to know when we have new openings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-future-green text-business-black hover:text-white font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-future-green/30 focus:ring-offset-4 border-0"
            >
              Send Your Resume
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-business-black hover:border-white font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-2 focus:ring-white/50 focus:ring-offset-2"
            >
              Learn More About Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
