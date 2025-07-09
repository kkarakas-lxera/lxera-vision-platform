
import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Zap, Target, Users, BarChart3, Lightbulb, ArrowRight, CheckCircle, Sparkles, MessageCircle } from "lucide-react";
import ProgressiveDemoCapture from "@/components/forms/ProgressiveDemoCapture";
import ContactSalesModal from "@/components/ContactSalesModal";

const AIEngine = () => {
  const [isContactSalesModalOpen, setIsContactSalesModalOpen] = useState(false);
  const aiCapabilities = [
    {
      title: "Adaptive Learning Paths",
      description: "AI creates personalized learning journeys based on individual skills, goals, and learning preferences",
      icon: Target,
      features: ["Real-time path optimization", "Skill gap analysis", "Learning style adaptation", "Progress prediction"]
    },
    {
      title: "Intelligent Content Curation",
      description: "Advanced algorithms match learners with the most relevant content from vast knowledge repositories",
      icon: Brain,
      features: ["Content quality scoring", "Relevance matching", "Difficulty optimization", "Multi-format support"]
    },
    {
      title: "Personalized Mentorship",
      description: "AI-powered mentoring system provides 24/7 guidance and support tailored to each learner",
      icon: MessageCircle,
      features: ["Contextual guidance", "Learning assistance", "Progress coaching", "Motivation support"]
    },
    {
      title: "Performance Analytics",
      description: "Deep learning insights that track engagement, comprehension, and skill development",
      icon: BarChart3,
      features: ["Engagement tracking", "Comprehension analysis", "Skill progression", "Predictive insights"]
    }
  ];

  const technologyStack = [
    {
      name: "Natural Language Processing",
      description: "Advanced NLP for content understanding and learner communication",
      icon: MessageCircle
    },
    {
      name: "Machine Learning Models",
      description: "Sophisticated ML algorithms for personalization and prediction",
      icon: Brain
    },
    {
      name: "Adaptive Algorithms",
      description: "Dynamic systems that evolve with learner behavior and preferences",
      icon: Zap
    },
    {
      name: "Predictive Analytics",
      description: "Forward-looking insights that anticipate learning needs and outcomes",
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-smart-beige via-white to-future-green/5">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center bg-future-green/20 px-4 py-2 rounded-full text-business-black font-medium text-sm mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Engine
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-business-black mb-8 leading-tight font-inter">
            The Intelligence Behind
            <span className="text-business-black block mt-2"> LXERA</span>
          </h1>
          <p className="text-lg sm:text-xl text-business-black/70 max-w-4xl mx-auto mb-12 leading-relaxed font-normal font-inter">
            Discover the advanced AI capabilities that power personalized learning experiences 
            and drive measurable innovation outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ProgressiveDemoCapture
              source="ai_engine_page"
              buttonText="Request a Demo"
              onSuccess={() => {}}
            />
            <Button variant="outline" size="lg" className="rounded-xl px-8 py-4 text-base transition-all duration-300 hover:scale-105 font-inter font-normal">
              Watch How It Works
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* AI Capabilities Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Core AI Capabilities
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Advanced artificial intelligence features that make learning personal, engaging, and effective
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {aiCapabilities.map((capability, index) => {
              const IconComponent = capability.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-future-green/10 rounded-xl flex items-center justify-center mr-4">
                        <IconComponent className="w-6 h-6 text-business-black" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-business-black group-hover:text-business-black transition-colors">
                      {capability.title}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {capability.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {capability.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-business-black/70">
                          <CheckCircle className="w-4 h-4 text-future-green mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-6 bg-gradient-to-r from-smart-beige/20 to-future-green/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
              Advanced Technology Stack
            </h2>
            <p className="text-lg sm:text-xl text-business-black/70 max-w-3xl mx-auto leading-relaxed font-normal font-inter">
              Built on cutting-edge AI technologies for superior learning experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {technologyStack.map((tech, index) => {
              const IconComponent = tech.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-br from-future-green/20 to-future-green/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-business-black" />
                    </div>
                    <CardTitle className="text-lg text-business-black">
                      {tech.name}
                    </CardTitle>
                    <CardDescription className="text-business-black/60">
                      {tech.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-business-black mb-6 font-inter">
            Experience AI-Powered Learning
          </h2>
          <p className="text-lg sm:text-xl text-business-black/70 mb-8 leading-relaxed font-normal font-inter">
            See how LXERA's AI engine can transform learning and innovation in your organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ProgressiveDemoCapture
              source="ai_engine_page"
              buttonText="Request a Demo"
              onSuccess={() => {}}
            />
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-xl px-8 py-4 text-base transition-all duration-300 hover:scale-105 font-inter font-normal"
              onClick={() => setIsContactSalesModalOpen(true)}
            >
              Talk to Our Experts
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Modals */}
      <ContactSalesModal 
        isOpen={isContactSalesModalOpen} 
        onClose={() => setIsContactSalesModalOpen(false)}
      />
    </div>
  );
};

export default AIEngine;
