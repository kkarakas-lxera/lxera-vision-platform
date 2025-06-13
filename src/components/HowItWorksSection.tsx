
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
    <section id="how-it-works" className="w-full py-24 px-6 lg:px-12 bg-gradient-to-br from-white via-smart-beige/20 to-future-green/5 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-future-green rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Smooth transition from previous section */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-smart-beige/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header with enhanced animations */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-block mb-4 animate-slide-in-right" style={{animationDelay: '0.2s'}}>
            <span className="text-sm font-semibold text-future-green bg-future-green/10 px-4 py-2 rounded-full hover:bg-future-green/20 transition-colors duration-300">
              THE PROCESS
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            How LXERA Works
          </h2>
          <p className="text-xl lg:text-2xl text-business-black/80 max-w-3xl mx-auto animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            From onboarding to innovation in 4 smart steps
          </p>
          
          {/* Animated visual connector */}
          <div className="mt-8 flex justify-center animate-fade-in" style={{animationDelay: '0.8s'}}>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-future-green to-transparent animate-pulse-slow"></div>
          </div>
        </div>
        
        {/* Steps Container */}
        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-4 gap-8 relative">
              {/* Enhanced animated timeline spine */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-future-green/20 via-future-green/60 to-future-green/20 -translate-y-1/2 z-0 rounded-full">
                <div className="h-full bg-gradient-to-r from-future-green/40 via-future-green/80 to-future-green/40 rounded-full animate-pulse-slow"></div>
              </div>
              
              {steps.map((step, index) => (
                <div key={index} className="relative z-10 animate-fade-in-up group" style={{ animationDelay: `${index * 0.2}s` }}>
                  {/* Step Title with hover animation */}
                  <div className="text-center mb-6">
                    <span className="inline-block px-4 py-2 bg-future-green/20 text-business-black font-semibold rounded-full text-sm border border-future-green/30 hover:bg-future-green/30 hover:scale-105 transition-all duration-300">
                      {step.stepTitle}
                    </span>
                  </div>
                  
                  <Card className="bg-white border-0 lxera-shadow h-full transition-all duration-500 hover:shadow-xl hover:-translate-y-2 group-hover:scale-105">
                    <CardContent className="p-8 text-center h-full flex flex-col">
                      {/* Step Number with enhanced animations */}
                      <div className="w-20 h-20 bg-gradient-to-br from-future-green to-future-green/80 rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-lg hover:shadow-xl transition-all duration-300 group-hover:rotate-6">
                        <span className="text-business-black font-bold text-xl">{step.step}</span>
                        {index < steps.length - 1 && (
                          <ArrowRight className="absolute -right-12 top-1/2 -translate-y-1/2 w-6 h-6 text-future-green animate-pulse group-hover:animate-bounce" />
                        )}
                      </div>
                      
                      {/* Main Icon with enhanced animations */}
                      <div className="text-future-green mb-6 flex justify-center transition-all duration-300 hover:scale-125 hover:animate-pulse group-hover:text-emerald">
                        {step.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <h3 className="text-xl font-bold text-business-black group-hover:text-future-green transition-colors duration-300">{step.title}</h3>
                          <div className="text-future-green/70 transition-all duration-300 hover:scale-125 group-hover:animate-spin-slow">
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

          {/* Mobile Layout with enhanced animations */}
          <div className="lg:hidden space-y-8 relative">
            {/* Enhanced animated vertical timeline spine */}
            <div className="absolute left-10 top-0 bottom-0 w-1 bg-gradient-to-b from-future-green/20 via-future-green/60 to-future-green/20 z-0 rounded-full">
              <div className="w-full h-full bg-gradient-to-b from-future-green/40 via-future-green/80 to-future-green/40 rounded-full animate-pulse-slow"></div>
            </div>
            
            {steps.map((step, index) => (
              <div key={index} className="relative animate-fade-in-up group" style={{ animationDelay: `${index * 0.2}s` }}>
                {/* Step Title */}
                <div className="mb-4 ml-24">
                  <span className="inline-block px-4 py-2 bg-future-green/20 text-business-black font-semibold rounded-full text-sm border border-future-green/30 hover:bg-future-green/30 hover:scale-105 transition-all duration-300">
                    {step.stepTitle}
                  </span>
                </div>
                
                <Card className="bg-white border-0 lxera-shadow relative z-10 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group-hover:scale-102">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      {/* Step Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gradient-to-br from-future-green to-future-green/80 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
                          <span className="text-business-black font-bold text-xl">{step.step}</span>
                        </div>
                        <div className="text-future-green flex justify-center transition-all duration-300 hover:scale-125 hover:animate-pulse group-hover:text-emerald">
                          {step.icon}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xl font-bold text-business-black group-hover:text-future-green transition-colors duration-300">{step.title}</h3>
                          <div className="text-future-green/70 transition-all duration-300 hover:scale-125 group-hover:animate-spin-slow">
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
                
                {/* Enhanced mobile connector */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-6 relative z-10">
                    <div className="w-1 h-12 bg-gradient-to-b from-future-green/60 to-future-green/20 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced bottom CTA with animations */}
        <div className="text-center mt-20 animate-fade-in-up" style={{animationDelay: '1s'}}>
          <div className="bg-gradient-to-r from-future-green/10 to-transparent p-8 rounded-2xl hover:from-future-green/20 transition-all duration-500">
            <p className="text-lg text-business-black/70 mb-6 animate-fade-in" style={{animationDelay: '1.2s'}}>
              Ready to transform how your organization learns, grows, and innovates?
            </p>
            <Button 
              size="lg" 
              className="bg-business-black hover:bg-business-black/90 text-white px-8 py-3 text-lg font-semibold lxera-hover shadow-lg hover:shadow-xl animate-pulse-slow"
              style={{animationDelay: '1.4s'}}
            >
              Book a Demo
            </Button>
            <p className="text-sm text-business-black/60 mt-4 animate-fade-in" style={{animationDelay: '1.6s'}}>
              Join forward-thinking teams already accelerating growth with LXERA.
            </p>
          </div>
        </div>
      </div>
      
      {/* Smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  );
};

export default HowItWorksSection;
