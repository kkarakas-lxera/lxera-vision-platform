
import { Button } from "@/components/ui/button";
import { Wrench, MessageCircle, Network } from "lucide-react";

const JoinTheMovementSection = () => {
  const benefits = [
    { 
      icon: <Wrench className="w-8 h-8" />, 
      title: "Get early access to exclusive features",
      description: "Be the first to test cutting-edge capabilities"
    },
    { 
      icon: <MessageCircle className="w-8 h-8" />, 
      title: "Shape our roadmap through feedback",
      description: "Influence features based on your org's needs"
    },
    { 
      icon: <Network className="w-8 h-8" />, 
      title: "Join a private community of innovation leaders",
      description: "Connect with forward-thinking organizations"
    }
  ];

  return (
    <section className="w-full py-20 px-6 lg:px-12 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 bg-future-green rounded-full animate-float"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-future-green rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-future-green rounded-full animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        {/* Enhanced introduction with staggered animations */}
        <div className="mb-8 animate-fade-in-up">
          <p className="text-lg text-business-black/70 mb-4 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            It starts with leaders who go beyond traditional L&D. Join the pioneers building what's next.
          </p>
        </div>

        <h2 className="text-4xl lg:text-5xl font-bold text-business-black mb-8 animate-fade-in-scale" style={{animationDelay: '0.4s'}}>
          Join the Movement
        </h2>
        <p className="text-xl text-business-black/80 mb-12 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '0.6s'}}>
          LXERA is more than software — it's a new foundation for how organizations grow through learning and action.
        </p>
        
        {/* Enhanced benefits section with staggered animations */}
        <div className="bg-future-green/20 rounded-2xl p-8 mb-12 hover:bg-future-green/25 transition-all duration-500 animate-fade-in-scale border border-future-green/10" style={{animationDelay: '0.8s'}}>
          <h3 className="text-2xl font-bold text-business-black mb-8 animate-fade-in" style={{animationDelay: '1s'}}>As an early partner, you'll:</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col items-center text-center group animate-fade-in-up hover:scale-105 transition-all duration-300" style={{animationDelay: `${1.2 + index * 0.2}s`}}>
                <div className="text-business-black mb-4 group-hover:text-future-green group-hover:scale-110 transition-all duration-300 group-hover:animate-pulse">
                  {benefit.icon}
                </div>
                <p className="text-business-black font-semibold group-hover:text-future-green transition-colors duration-300 mb-2">{benefit.title}</p>
                <p className="text-sm text-business-black/60 italic">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced CTA button with animations */}
        <div className="animate-fade-in-up" style={{animationDelay: '1.8s'}}>
          <Button className="bg-business-black text-white hover:bg-business-black/90 text-lg px-8 py-4 rounded-full font-semibold lxera-hover hover:shadow-xl hover:scale-105 transition-all duration-300 animate-pulse-slow">
            Become an Early Innovation Partner
          </Button>
          <p className="text-sm text-business-black/60 mt-4 animate-fade-in" style={{animationDelay: '2s'}}>
            Redefine how your teams learn, build, and innovate—one experiment at a time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default JoinTheMovementSection;
