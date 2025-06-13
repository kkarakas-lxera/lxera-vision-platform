
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Brain, BarChart3, Lightbulb, ArrowRight, UserCheck, Cpu, TrendingUp, Rocket } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      stepTitle: "Step 1",
      title: "Intelligent Onboarding",
      desc: "Smart user assessment automatically maps your role, skills, and learning preferences. The platform configures **personalized dashboards** and learning paths tailored to your specific needs and organizational goals.",
      icon: <Users className="w-8 h-8" />,
      subIcon: <UserCheck className="w-4 h-4" />
    },
    {
      step: "02", 
      stepTitle: "Step 2",
      title: "Curated Learning Journey",
      desc: "AI delivers bite-sized, relevant content when you need it most. **Adaptive sequencing** adjusts difficulty and pacing based on your progress, while integrated knowledge bases ensure learning is grounded in your actual work context.",
      icon: <Brain className="w-8 h-8" />,
      subIcon: <Cpu className="w-4 h-4" />
    },
    {
      step: "03",
      stepTitle: "Step 3",
      title: "Real-Time Feedback Loop", 
      desc: "Continuous progress tracking provides **actionable insights**. Smart nudges and personalized recommendations keep you engaged, while predictive analytics identify skill gaps before they impact performance.",
      icon: <BarChart3 className="w-8 h-8" />,
      subIcon: <TrendingUp className="w-4 h-4" />
    },
    {
      step: "04",
      stepTitle: "Step 4",
      title: "Innovation Activation",
      desc: "Submit ideas, co-create solutions, and turn insights into **measurable business outcomes**. Collaborative sandboxes and low-code prototyping tools enable your team to transform learning into tangible impact.",
      icon: <Lightbulb className="w-8 h-8" />,
      subIcon: <Rocket className="w-4 h-4" />
    }
  ];

  const formatDescription = (desc: string) => {
    return desc.split('**').map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-business-black">{part}</strong>;
      }
      return part;
    });
  };

  return (
    <section id="how-it-works" className="w-full py-20 px-6 lg:px-12 bg-gradient-to-br from-smart-beige/30 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-4">
            How LXERA Works
          </h2>
          <p className="text-xl lg:text-2xl text-business-black/80 max-w-3xl mx-auto">
            From onboarding to innovation in 4 smart steps
          </p>
        </div>
        
        {/* Steps Container */}
        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-4 gap-8 relative">
              {/* Timeline Spine */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-future-green/40 via-future-green/60 to-future-green/40 -translate-y-1/2 z-0"></div>
              
              {steps.map((step, index) => (
                <div key={index} className="relative z-10">
                  {/* Step Title */}
                  <div className="text-center mb-4">
                    <span className="inline-block px-3 py-1 bg-future-green/20 text-business-black font-semibold rounded-full text-sm">
                      {step.stepTitle}
                    </span>
                  </div>
                  
                  <Card className="bg-white border-0 lxera-shadow lxera-hover h-full">
                    <CardContent className="p-8 text-center h-full flex flex-col">
                      {/* Step Number */}
                      <div className="w-16 h-16 bg-future-green rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <span className="text-business-black font-bold text-xl">{step.step}</span>
                        {index < steps.length - 1 && (
                          <ArrowRight className="absolute -right-12 top-1/2 -translate-y-1/2 w-6 h-6 text-future-green" />
                        )}
                      </div>
                      
                      {/* Main Icon with Animation */}
                      <div className="text-future-green mb-4 flex justify-center transition-transform duration-300 hover:scale-110 hover:animate-pulse">
                        {step.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <h3 className="text-xl font-bold text-business-black">{step.title}</h3>
                          <div className="text-future-green/70 transition-transform duration-300 hover:scale-110">
                            {step.subIcon}
                          </div>
                        </div>
                        <p className="text-business-black/70 text-sm leading-relaxed flex-1">
                          {formatDescription(step.desc)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8 relative">
            {/* Vertical Timeline Spine */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-future-green/40 via-future-green/60 to-future-green/40 z-0"></div>
            
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Title */}
                <div className="mb-4 ml-20">
                  <span className="inline-block px-3 py-1 bg-future-green/20 text-business-black font-semibold rounded-full text-sm">
                    {step.stepTitle}
                  </span>
                </div>
                
                <Card className="bg-white border-0 lxera-shadow relative z-10">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      {/* Step Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-future-green rounded-full flex items-center justify-center mb-4">
                          <span className="text-business-black font-bold text-xl">{step.step}</span>
                        </div>
                        <div className="text-future-green flex justify-center transition-transform duration-300 hover:scale-110 hover:animate-pulse">
                          {step.icon}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xl font-bold text-business-black">{step.title}</h3>
                          <div className="text-future-green/70 transition-transform duration-300 hover:scale-110">
                            {step.subIcon}
                          </div>
                        </div>
                        <p className="text-business-black/70 leading-relaxed">
                          {formatDescription(step.desc)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Mobile Arrow */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4 relative z-10">
                    <div className="w-0.5 h-8 bg-future-green/30"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-business-black/70 mb-6">
            Ready to transform how your organization learns, grows, and innovates?
          </p>
          <Button 
            size="lg" 
            className="bg-business-black hover:bg-business-black/90 text-white px-8 py-3 text-lg font-semibold lxera-hover"
          >
            Book a Demo
          </Button>
          <p className="text-sm text-business-black/60 mt-4">
            Join forward-thinking teams already accelerating growth with LXERA.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
