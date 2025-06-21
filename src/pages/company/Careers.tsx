
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Heart, Zap, Target } from "lucide-react";

const Careers = () => {
  const openRoles = [
    {
      title: "Senior AI/ML Engineer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Join our AI team to build the next generation of personalized learning experiences."
    },
    {
      title: "Product Manager - Learning Analytics",
      department: "Product",
      location: "San Francisco, CA / Remote", 
      type: "Full-time",
      description: "Drive product strategy for our analytics and insights platform."
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Design intuitive and engaging learning experiences for global audiences."
    },
    {
      title: "Learning Science Researcher",
      department: "Research",
      location: "Remote",
      type: "Full-time",
      description: "Research and implement evidence-based learning methodologies."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "New York, NY / Remote",
      type: "Full-time",
      description: "Help enterprise clients maximize their learning outcomes with LXERA."
    },
    {
      title: "Sales Development Representative",
      department: "Sales",
      location: "San Francisco, CA",
      type: "Full-time",
      description: "Generate qualified leads and build relationships with potential clients."
    }
  ];

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
          <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6">
            Join the Future of
            <span className="block bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
              Learning Innovation
            </span>
          </h1>
          <p className="text-lg text-business-black/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            We're building a team of passionate innovators who believe in the power of learning 
            to transform organizations and unlock human potential.
          </p>
          <Button className="bg-future-green text-business-black font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105">
            View Open Positions
          </Button>
        </div>
      </section>

      {/* Open Roles Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-business-black mb-6">
              Open Positions
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Find your perfect role and help us revolutionize workplace learning
            </p>
          </div>
          
          <div className="space-y-6">
            {openRoles.map((role, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-business-black">{role.title}</h3>
                        <Badge variant="secondary" className="bg-future-green/10 text-future-green">
                          {role.department}
                        </Badge>
                      </div>
                      <p className="text-business-black/70 mb-4">{role.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-business-black/60">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {role.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {role.type}
                        </div>
                      </div>
                    </div>
                    <Button className="bg-business-black text-white font-medium rounded-xl transition-all duration-300 hover:scale-105">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-business-black mb-6">
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
            <h2 className="text-3xl font-bold text-business-black mb-6">
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
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
            Don't see the perfect role? We're always looking for exceptional talent to join our mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-future-green text-business-black font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105">
              Send Your Resume
            </Button>
            <Button variant="outline" className="border-white text-white font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105">
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
