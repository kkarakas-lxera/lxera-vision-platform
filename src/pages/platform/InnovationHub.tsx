
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Users, Zap, Target, ArrowRight, Sparkles, Layers, Network } from "lucide-react";
import { Link } from "react-router-dom";

const InnovationHub = () => {
  const hubFeatures = [
    {
      title: "Ideation Tools",
      description: "AI-powered brainstorming and idea generation platforms for creative problem-solving",
      icon: Lightbulb,
      capabilities: ["Idea mapping", "Concept clustering", "Innovation challenges", "Inspiration feeds"]
    },
    {
      title: "Collaboration Environments",
      description: "Virtual spaces designed for cross-functional teams to co-create and innovate together",
      icon: Users,
      capabilities: ["Virtual whiteboards", "Real-time collaboration", "Project workspaces", "Team matching"]
    },
    {
      title: "AI-Augmented Prototyping",
      description: "Intelligent tools that help transform ideas into actionable prototypes and solutions",
      icon: Zap,
      capabilities: ["Rapid prototyping", "AI suggestions", "Resource optimization", "Feasibility analysis"]
    },
    {
      title: "CoE Support Capabilities",
      description: "Center of Excellence tools for scaling innovation across the organization",
      icon: Target,
      capabilities: ["Best practice sharing", "Innovation metrics", "Success tracking", "Knowledge repository"]
    }
  ];

  const innovationProcess = [
    {
      step: "Discover",
      description: "Identify opportunities and challenges",
      tools: ["Market insights", "Problem identification", "Trend analysis"]
    },
    {
      step: "Ideate",
      description: "Generate and refine innovative solutions",
      tools: ["Brainstorming tools", "AI inspiration", "Concept development"]
    },
    {
      step: "Prototype",
      description: "Build and test minimum viable solutions",
      tools: ["Rapid prototyping", "User testing", "Feedback loops"]
    },
    {
      step: "Scale",
      description: "Implement and expand successful innovations",
      tools: ["Implementation guides", "Success metrics", "Knowledge sharing"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <Lightbulb className="w-4 h-4 mr-2" />
            Innovation Enablement
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
            Innovation
            <span className="text-business-black"> Hub</span>
          </h1>
          <p className="text-xl text-business-black/70 max-w-3xl mx-auto mb-8">
            Empower your organization with comprehensive innovation tools that transform ideas 
            into impact through AI-augmented collaboration and prototyping capabilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Explore Innovation Tools
            </Button>
            <Button variant="outline" size="lg" className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Innovation Process Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Hub Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
              Complete Innovation Ecosystem
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Everything your teams need to innovate effectively, from initial ideation to scaled implementation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {hubFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center">
                        <IconComponent className="w-7 h-7 text-business-black" />
                      </div>
                      <Sparkles className="w-5 h-5 text-business-black/60" />
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60 mb-4">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {feature.capabilities.map((capability, capIndex) => (
                        <div key={capIndex} className="text-sm text-business-black/70 bg-future-green/10 rounded-lg px-3 py-2">
                          {capability}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Innovation Process */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
              Structured Innovation Journey
            </h2>
            <p className="text-xl text-business-black/70 max-w-3xl mx-auto">
              Guide teams through a proven innovation process with integrated tools and support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {innovationProcess.map((phase, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-future-green to-future-green rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <CardTitle className="text-lg text-business-black mb-2">
                    {phase.step}
                  </CardTitle>
                  <CardDescription className="text-business-black/60 mb-4">
                    {phase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {phase.tools.map((tool, toolIndex) => (
                      <li key={toolIndex} className="text-sm text-business-black/70 bg-white/50 rounded px-3 py-1">
                        {tool}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                {index < innovationProcess.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-future-green" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
            Transform Ideas Into Business Impact
          </h2>
          <p className="text-xl text-business-black/70 mb-8">
            Empower your teams with the tools and processes they need to drive meaningful innovation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-business-black text-white rounded-xl px-8 transition-all duration-300 hover:scale-105">
              Start Innovating
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-xl px-8 transition-all duration-300 hover:scale-105">
              <Link to="/platform/mentorship-support">
                Mentorship Support <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InnovationHub;
