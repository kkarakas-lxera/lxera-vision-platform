
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Heart, Briefcase, GraduationCap, Globe, Zap } from "lucide-react";

const Careers = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and wellness programs"
    },
    {
      icon: GraduationCap,
      title: "Learning & Growth",
      description: "Annual learning budget, conference attendance, and internal skill development"
    },
    {
      icon: Globe,
      title: "Remote-First Culture",
      description: "Work from anywhere with flexible hours and quarterly team retreats"
    },
    {
      icon: Zap,
      title: "Innovation Time",
      description: "20% time for personal projects and experimentation with new technologies"
    }
  ];

  const jobs = [
    {
      title: "Senior AI Engineer",
      department: "engineering",
      location: "Remote / San Francisco",
      type: "Full-time",
      level: "Senior",
      description: "Build cutting-edge AI systems that personalize learning experiences for millions of users.",
      requirements: ["5+ years ML/AI experience", "Python, TensorFlow/PyTorch", "PhD preferred"]
    },
    {
      title: "Product Designer",
      department: "design",
      location: "Remote / New York",
      type: "Full-time", 
      level: "Mid-Senior",
      description: "Design intuitive and beautiful learning experiences that delight users worldwide.",
      requirements: ["4+ years product design", "Figma expertise", "EdTech experience preferred"]
    },
    {
      title: "Learning Science Researcher",
      department: "research",
      location: "Remote / Boston",
      type: "Full-time",
      level: "Senior",
      description: "Research and validate learning methodologies that power our AI-driven platform.",
      requirements: ["PhD in Education/Psychology", "Research experience", "Statistical analysis skills"]
    },
    {
      title: "Full Stack Engineer",
      department: "engineering",
      location: "Remote / London",
      type: "Full-time",
      level: "Mid-Senior",
      description: "Build scalable web applications that serve learning content to global audiences.",
      requirements: ["3+ years full-stack experience", "React, Node.js", "Cloud platforms"]
    },
    {
      title: "Customer Success Manager",
      department: "customer",
      location: "Remote / Sydney",
      type: "Full-time",
      level: "Mid",
      description: "Help enterprise customers maximize value from their LXERA implementation.",
      requirements: ["3+ years customer success", "SaaS experience", "Strong communication skills"]
    },
    {
      title: "Marketing Manager",
      department: "marketing",
      location: "Remote / Toronto",
      type: "Full-time",
      level: "Mid",
      description: "Drive growth through content marketing, events, and digital campaigns.",
      requirements: ["4+ years B2B marketing", "Content strategy", "Analytics experience"]
    }
  ];

  const departments = [
    { id: "all", name: "All Positions", count: jobs.length },
    { id: "engineering", name: "Engineering", count: jobs.filter(j => j.department === "engineering").length },
    { id: "design", name: "Design", count: jobs.filter(j => j.department === "design").length },
    { id: "research", name: "Research", count: jobs.filter(j => j.department === "research").length },
    { id: "customer", name: "Customer Success", count: jobs.filter(j => j.department === "customer").length },
    { id: "marketing", name: "Marketing", count: jobs.filter(j => j.department === "marketing").length }
  ];

  const filteredJobs = selectedDepartment === "all" 
    ? jobs 
    : jobs.filter(job => job.department === selectedDepartment);

  return (
    <div className="min-h-screen bg-smart-beige">
      {/* Hero Section */}
      <section className="relative py-24 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/10 to-emerald/5"></div>
        <div className="max-w-6xl mx-auto relative text-center">
          <h1 className="text-5xl lg:text-7xl font-bold text-business-black mb-6">
            Join our mission to
            <span className="block bg-gradient-to-r from-future-green to-emerald bg-clip-text text-transparent">
              transform learning
            </span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8 leading-relaxed">
            We're looking for passionate innovators who want to shape the future of workplace learning 
            and unlock human potential at scale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105">
              View Open Positions
            </Button>
            <Button variant="outline" className="border-business-black text-business-black hover:bg-business-black hover:text-white rounded-xl px-8 py-3">
              Learn About Culture
            </Button>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-business-black mb-6">
              Why LXERA?
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              We're building more than a product—we're creating a culture of innovation, 
              learning, and meaningful impact.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green to-emerald rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-business-black">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-business-black/70 text-center leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-business-black mb-6">
              Open Positions
            </h2>
            <p className="text-xl text-business-black/70">
              Find your perfect role and start making an impact.
            </p>
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            {departments.map((dept) => (
              <Button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                variant={selectedDepartment === dept.id ? "default" : "outline"}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  selectedDepartment === dept.id 
                    ? "bg-business-black text-white hover:bg-business-black/90" 
                    : "border-business-black/30 text-business-black hover:bg-business-black hover:text-white"
                }`}
              >
                {dept.name} ({dept.count})
              </Button>
            ))}
          </div>

          {/* Job Listings */}
          <div className="space-y-6">
            {filteredJobs.map((job, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h3 className="text-2xl font-bold text-business-black group-hover:text-future-green transition-colors duration-300">
                          {job.title}
                        </h3>
                        <Badge className="bg-future-green/20 text-future-green border-0">
                          {job.level}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 mb-4 text-sm text-business-black/60">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {job.department.charAt(0).toUpperCase() + job.department.slice(1)}
                        </div>
                      </div>
                      
                      <p className="text-business-black/70 mb-4 leading-relaxed">
                        {job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, reqIndex) => (
                          <Badge key={reqIndex} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-business-black/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-business-black mb-2">
                No positions found
              </h3>
              <p className="text-business-black/60">
                Try selecting a different department or check back soon for new opportunities.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-business-black to-business-black/90">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Don't see the perfect role?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            We're always looking for exceptional talent. Send us your resume and tell us how you'd like to contribute.
          </p>
          <Button className="bg-future-green text-business-black hover:bg-emerald hover:text-white font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-300 hover:scale-105">
            Send Us Your Resume
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Careers;
