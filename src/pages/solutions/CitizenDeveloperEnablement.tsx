
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { ArrowRight, Lightbulb, CheckCircle, Code, Zap, Workflow } from "lucide-react";

const CitizenDeveloperEnablement = () => {
  const features = [
    {
      icon: Code,
      title: "No-Code Development",
      description: "Empower business users to create applications without traditional coding skills"
    },
    {
      icon: Workflow,
      title: "Process Automation",
      description: "Build automated workflows that streamline business operations effortlessly"
    },
    {
      icon: Zap,
      title: "Rapid Deployment",
      description: "Go from idea to implementation in days, not months"
    }
  ];

  const benefits = [
    "80% faster application delivery",
    "50% reduction in IT backlog",
    "Democratized development",
    "Business-driven solutions",
    "Reduced development costs",
    "Innovation at scale"
  ];

  return (
    <div className="min-h-screen bg-smart-beige">
      <SEO 
        title="Citizen Developer Enablement - LXERA"
        description="Equip business users to build and automate without coding. Enable citizen developers to create solutions that drive business value."
        keywords="citizen developer, no-code, low-code, business automation, process automation"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-amber-100 text-amber-700 border-amber-200 px-4 py-2 text-sm font-medium">
                Citizen Development
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-business-black mb-6 leading-tight">
                Citizen Developer
                <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent"> Enablement</span>
              </h1>
              <p className="text-xl text-business-black/70 mb-8 leading-relaxed">
                Equip business users to build and automate without coding. Transform your workforce into solution creators with intuitive development tools and comprehensive training.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold"
                >
                  Schedule Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in-scale">
              <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-3xl p-8 shadow-2xl">
                <Lightbulb className="w-24 h-24 text-amber-600 mx-auto mb-6" />
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-business-black mb-4">Innovation Engine</h3>
                  <p className="text-business-black/70">Turn ideas into reality without code</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-12 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
              Key Features
            </h2>
            <p className="text-lg text-business-black/70 max-w-3xl mx-auto">
              Comprehensive platform that enables business users to create powerful solutions without technical barriers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-business-black">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-business-black/70 text-center leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-8">
                Business Impact
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span className="text-business-black/80">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-8 text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">80%</div>
              <div className="text-business-black font-semibold mb-4">Faster Delivery</div>
              <div className="text-business-black/70">
                Citizen developers deliver applications 80% faster than traditional development cycles
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl lg:text-4xl font-bold text-business-black mb-6">
              Democratize Development
            </h2>
            <p className="text-lg text-business-black/70 mb-8 max-w-2xl mx-auto">
              Unlock the potential of your business users. Enable them to create solutions that drive real business value without waiting for IT resources.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white hover:shadow-lg transition-all duration-300 px-8 py-4 text-lg font-semibold"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-business-black/30 text-business-black hover:bg-business-black hover:text-white px-8 py-4 text-lg"
              >
                Contact Sales
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
