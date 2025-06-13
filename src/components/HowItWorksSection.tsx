
import { Card, CardContent } from "@/components/ui/card";
import { Users, Brain, BarChart3, Lightbulb, ArrowRight } from "lucide-react";

const HowItWorksSection = () => {
  const steps = [
    {
      step: "01",
      title: "Intelligent Onboarding",
      desc: "Smart user assessment automatically maps your role, skills, and learning preferences. The platform configures personalized dashboards and learning paths tailored to your specific needs and organizational goals.",
      icon: <Users className="w-8 h-8" />
    },
    {
      step: "02", 
      title: "Curated Learning Journey",
      desc: "AI delivers bite-sized, relevant content when you need it most. Adaptive sequencing adjusts difficulty and pacing based on your progress, while integrated knowledge bases ensure learning is grounded in your actual work context.",
      icon: <Brain className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Real-Time Feedback Loop", 
      desc: "Continuous progress tracking provides actionable insights. Smart nudges and personalized recommendations keep you engaged, while predictive analytics identify skill gaps before they impact performance.",
      icon: <BarChart3 className="w-8 h-8" />
    },
    {
      step: "04",
      title: "Innovation Activation",
      desc: "Transform learning into action through collaborative sandboxes and low-code prototyping tools. Submit ideas, build solutions with your team, and turn insights into tangible business impact.",
      icon: <Lightbulb className="w-8 h-8" />
    }
  ];

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
              {/* Connection Lines */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-future-green/30 -translate-y-1/2 z-0"></div>
              
              {steps.map((step, index) => (
                <div key={index} className="relative z-10">
                  <Card className="bg-white border-0 lxera-shadow lxera-hover h-full">
                    <CardContent className="p-8 text-center h-full flex flex-col">
                      {/* Step Number */}
                      <div className="w-16 h-16 bg-future-green rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <span className="text-business-black font-bold text-xl">{step.step}</span>
                        {index < steps.length - 1 && (
                          <ArrowRight className="absolute -right-12 top-1/2 -translate-y-1/2 w-6 h-6 text-future-green" />
                        )}
                      </div>
                      
                      {/* Icon */}
                      <div className="text-future-green mb-4 flex justify-center">{step.icon}</div>
                      
                      {/* Content */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-business-black mb-4">{step.title}</h3>
                        <p className="text-business-black/70 text-sm leading-relaxed flex-1">{step.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="bg-white border-0 lxera-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      {/* Step Number & Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-future-green rounded-full flex items-center justify-center mb-4">
                          <span className="text-business-black font-bold text-xl">{step.step}</span>
                        </div>
                        <div className="text-future-green flex justify-center">{step.icon}</div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-business-black mb-3">{step.title}</h3>
                        <p className="text-business-black/70 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Mobile Arrow */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-4">
                    <div className="w-0.5 h-8 bg-future-green/30"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-business-black/70 mb-4">
            Ready to transform how your organization learns and innovates?
          </p>
          <p className="text-sm text-business-black/60">
            Join forward-thinking teams already accelerating growth with LXERA.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
