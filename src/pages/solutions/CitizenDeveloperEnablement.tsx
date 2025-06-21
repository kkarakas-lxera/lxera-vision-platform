import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Lightbulb, CheckCircle, Code, Zap, Workflow, Puzzle, Rocket, Users } from "lucide-react";

const CitizenDeveloperEnablement = () => {
  const developmentSteps = [
    {
      step: "01",
      icon: Puzzle,
      title: "Visual Application Builder",
      description: "Enterprise-grade interface for creating applications without coding expertise, designed for business leaders",
      features: ["Pre-built enterprise components", "Visual workflow designer", "Real-time collaboration"]
    },
    {
      step: "02", 
      icon: Workflow,
      title: "Strategic Process Automation",
      description: "Automate critical business processes and create efficient workflows that align with organizational objectives",
      features: ["Enterprise workflow templates", "Integration connectors", "Automated approval chains"]
    },
    {
      step: "03",
      icon: Rocket,
      title: "Enterprise Deployment",
      description: "Deploy your applications instantly to production with enterprise-grade security and scalability",
      features: ["Secure cloud deployment", "Mobile responsive design", "Enterprise security built-in"]
    }
  ];

  const useCases = [
    { icon: Users, title: "HR Management", description: "Employee onboarding and performance workflows" },
    { icon: Code, title: "Data Collection", description: "Custom forms and strategic reporting" },
    { icon: Zap, title: "Approval Processes", description: "Automated approval and governance chains" },
    { icon: Workflow, title: "Project Tracking", description: "Executive dashboards and project oversight" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-smart-beige to-yellow-50">
      <SEO 
        title="No Code Platform - Citizen Developer Enablement - LXERA"
        description="Enable business users to build and automate with no-code solutions. Join innovative teams creating applications without traditional coding."
        keywords="no-code, citizen developer, business automation, process automation, MVP"
      />
      <Navigation />
      
      {/* Hero Section - Card Grid Focus */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-amber-100 text-amber-700 border-amber-200 px-4 py-2 text-sm font-medium">
              <Lightbulb className="w-4 h-4 mr-2" />
              Enterprise No-Code Platform
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-medium text-business-black mb-6 leading-tight">
              Strategic No-Code Solutions for
              <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent block"> Enterprise Teams</span>
            </h1>
            <p className="text-xl text-business-black/70 mb-12 max-w-4xl mx-auto leading-relaxed">
              Empower HR Directors, L&D Directors, and Digital Transformation leaders to build powerful applications with zero coding. Create strategic solutions using intuitive drag-and-drop tools across Finance, Technology, EdTech, and Government sectors.
            </p>
          </div>

          {/* Interactive Demo Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl mb-12 animate-fade-in-scale">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Code className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-business-black mb-2">Visual Builder</h3>
                <p className="text-business-black/70 text-sm">Drag, drop, and create enterprise solutions</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-business-black mb-2">Auto-Deploy</h3>
                <p className="text-business-black/70 text-sm">Instantly deploy to production</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Workflow className="w-10 h-10 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-business-black mb-2">Smart Automation</h3>
                <p className="text-business-black/70 text-sm">Strategic workflows that work</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-yellow-600 hover:to-amber-600 font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-4 border-0"
            >
              Schedule Enterprise Demo
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-3 border-business-black/30 bg-white/90 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-business-black/30 focus:ring-offset-4"
            >
              View Executive Brief
            </Button>
          </div>
        </div>
      </section>

      {/* Step-by-Step Process */}
      <section className="py-20 px-6 lg:px-12 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              How Enterprise No-Code Development Works
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              From strategic vision to enterprise deployment in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {developmentSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card key={index} className="relative border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-500 animate-fade-in-up group overflow-hidden" style={{ animationDelay: `${index * 200}ms` }}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-bl-3xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{step.step}</span>
                  </div>
                  
                  <CardHeader className="pb-4 pt-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-business-black group-hover:text-amber-600 transition-colors">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <CardDescription className="text-business-black/70 leading-relaxed mb-6">
                      {step.description}
                    </CardDescription>
                    
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-sm text-business-black/80">
                          <CheckCircle className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
                          {feature}
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

      {/* Use Cases Grid */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Strategic Use Cases for Enterprise Leaders
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              See how strategic teams are solving real business challenges with no-code development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {useCases.map((useCase, index) => {
              const IconComponent = useCase.icon;
              return (
                <Card key={index} className="text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 animate-fade-in-up group cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-business-black mb-2">{useCase.title}</h3>
                    <p className="text-sm text-business-black/70">{useCase.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-amber-600 to-yellow-600 rounded-3xl p-12 text-center text-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-semibold mb-2">65%</div>
                <div className="text-white/90">Faster Delivery</div>
              </div>
              <div>
                <div className="text-4xl font-semibold mb-2">40%</div>
                <div className="text-white/90">Cost Reduction</div>
              </div>
              <div>
                <div className="text-4xl font-semibold mb-2">95%</div>
                <div className="text-white/90">Executive Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-medium text-business-black mb-6">
              Ready to Transform Your Enterprise Operations?
            </h2>
            <p className="text-lg text-business-black/70 mb-4 max-w-2xl mx-auto">
              Join strategic leaders across Finance, Technology, EdTech, and Government sectors who are already building solutions with enterprise no-code. Designed for HR Directors, L&D Directors, and Digital Transformation leaders.
            </p>
            <p className="text-base text-business-black/60 mb-8 max-w-2xl mx-auto">
              Trusted by mid-size enterprise partners across various industries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:from-yellow-600 hover:to-amber-600 font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-amber-500/30 focus:ring-offset-4 border-0"
              >
                Schedule Enterprise Demo
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-3 border-business-black/30 bg-white/90 backdrop-blur-sm text-business-black hover:bg-business-black hover:text-white hover:border-business-black font-semibold px-12 py-6 text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-3xl focus:ring-4 focus:ring-business-black/30 focus:ring-offset-4"
              >
                Request Strategic Brief
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
