import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Users, CheckCircle, TrendingUp, Target, Award, Clock, BookOpen } from "lucide-react";

const WorkforceReskilling = () => {
  const timelineSteps = [
    {
      icon: Target,
      title: "Skills Assessment",
      description: "Comprehensive analysis of current capabilities and future requirements",
      duration: "Week 1-2",
      color: "bg-blue-500"
    },
    {
      icon: BookOpen,
      title: "Learning Path Design",
      description: "Customized roadmaps aligned with career goals and business needs",
      duration: "Week 3",
      color: "bg-green-500"
    },
    {
      icon: TrendingUp,
      title: "Skill Development",
      description: "Interactive learning modules with real-world applications",
      duration: "Week 4-12",
      color: "bg-purple-500"
    },
    {
      icon: Award,
      title: "Certification & Recognition",
      description: "Industry-recognized credentials and internal acknowledgment",
      duration: "Week 13+",
      color: "bg-orange-500"
    }
  ];

  const metrics = [
    { label: "Skills Gap Reduction", value: "45%", icon: Target },
    { label: "Pilot Team Retention", value: "92%", icon: Users },
    { label: "Career Advancement", value: "65%", icon: TrendingUp },
    { label: "Training ROI", value: "280%", icon: Award }
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <SEO 
        title="Workforce Reskilling & Upskilling - LXERA"
        description="Close skill gaps and future-proof your teams with comprehensive reskilling and upskilling programs powered by AI."
        keywords="workforce development, reskilling, upskilling, career development, skill gaps"
      />
      <Navigation />
      
      {/* Hero Section - Timeline Inspired */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium">
              <Clock className="w-4 h-4 mr-2" />
              Workforce Development • Beta Program
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-medium text-business-black mb-6 leading-tight">
              Build Tomorrow's
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent block"> Workforce Today</span>
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join innovative teams transforming their capabilities with strategic reskilling programs. Bridge skill gaps, boost retention, and prepare for tomorrow's challenges with our proven framework.
            </p>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {metrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="pt-6">
                    <IconComponent className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-3xl font-semibold text-blue-600 mb-2">{metric.value}</div>
                    <div className="text-sm text-business-black/70">{metric.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-600 font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 border-0"
            >
              Join Beta Program
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
            >
              Request Pilot Access
            </Button>
          </div>
        </div>
      </section>

      {/* Timeline Process Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-6">
              Your Reskilling Journey
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              A proven 4-step process that transforms your workforce capabilities
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full hidden lg:block"></div>
            
            <div className="space-y-12">
              {timelineSteps.map((step, index) => {
                const IconComponent = step.icon;
                const isEven = index % 2 === 0;
                
                return (
                  <div key={index} className={`flex items-center ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} animate-fade-in-up`} style={{ animationDelay: `${index * 200}ms` }}>
                    <div className={`w-full lg:w-5/12 ${isEven ? 'lg:pr-12' : 'lg:pl-12'}`}>
                      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center mb-4">
                            <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center mr-4`}>
                              <IconComponent className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-semibold text-business-black">{step.title}</CardTitle>
                              <Badge variant="outline" className="mt-1">{step.duration}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-business-black/70 leading-relaxed text-base">
                            {step.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Timeline Node */}
                    <div className="hidden lg:flex w-2/12 justify-center">
                      <div className={`w-8 h-8 ${step.color} rounded-full border-4 border-white shadow-lg flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
                    <div className="w-full lg:w-5/12"></div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-8">
                Early Results with Pilot Teams
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  "45% reduction in skill gaps",
                  "92% pilot team retention", 
                  "Future-ready capabilities",
                  "Clear career pathways",
                  "Measurable skill growth",
                  "Industry-validated training"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-lg text-business-black/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8">
              <div className="text-center mb-6">
                <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <div className="text-4xl font-semibold text-blue-600 mb-2">92%</div>
                <div className="text-xl font-semibold text-business-black mb-4">Pilot Retention</div>
              </div>
              <div className="text-business-black/70 text-center leading-relaxed">
                Teams participating in our pilot reskilling programs show exceptional retention and career satisfaction rates
              </div>
              <div className="mt-6 pt-6 border-t border-blue-200">
                <div className="text-sm text-business-black/60 text-center">
                  "The most impactful workforce development pilot we've participated in"
                </div>
                <div className="text-sm font-medium text-blue-600 text-center mt-2">
                  - Innovation Team Lead
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-50/80 via-white/70 to-indigo-50/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-blue-200/50">
            <h2 className="text-4xl lg:text-5xl font-medium text-business-black mb-6">
              Join Our Workforce Transformation Pilot
            </h2>
            <p className="text-xl text-business-black/70 mb-4 max-w-2xl mx-auto">
              Don't let skill gaps hold your team back. Join forward-thinking organizations building tomorrow's workforce today.
            </p>
            <p className="text-lg text-business-black/60 mb-8 max-w-2xl mx-auto">
              Limited pilot spots available for innovative teams ready to lead the transformation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-indigo-600 hover:to-blue-600 font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 border-0"
              >
                Apply for Pilot Program
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-business-black/20 bg-white/80 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-10 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-business-black/50 focus:ring-offset-2"
              >
                Schedule Assessment
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WorkforceReskilling;
