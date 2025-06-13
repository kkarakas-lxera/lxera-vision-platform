import { Button } from "@/components/ui/button";
import { Wrench, MessageCircle, Network, ArrowRight, Star, Users, Zap } from "lucide-react";

const JoinTheMovementSection = () => {
  const benefits = [
    { 
      icon: <Wrench className="w-8 h-8" />, 
      title: "Get early access to exclusive features",
      description: "Be the first to test cutting-edge capabilities",
      delay: "1.2s"
    },
    { 
      icon: <MessageCircle className="w-8 h-8" />, 
      title: "Shape our roadmap through feedback",
      description: "Influence features based on your org's needs",
      delay: "1.4s"
    },
    { 
      icon: <Network className="w-8 h-8" />, 
      title: "Join a private community of innovation leaders",
      description: "Connect with forward-thinking organizations",
      delay: "1.6s"
    }
  ];

  const trustIndicators = [
    { icon: <Users className="w-4 h-4" />, text: "50+ Early Partners" },
    { icon: <Star className="w-4 h-4" />, text: "4.9/5 Rating" },
    { icon: <Zap className="w-4 h-4" />, text: "99% Uptime" }
  ];

  return (
    <section className="w-full py-20 px-6 lg:px-12 overflow-hidden relative">
      {/* Enhanced animated background with mesh gradient */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-future-green/20 via-transparent to-smart-beige/30"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-br from-future-green to-future-green/50 rounded-full blur-xl animate-float-gentle"></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-gradient-to-br from-business-black/20 to-future-green/30 rounded-full blur-lg animate-float-gentle" style={{animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-future-green/40 to-smart-beige/20 rounded-full blur-md animate-float-gentle" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-future-green/30 rounded-full blur-sm animate-float-gentle" style={{animationDelay: '2s'}}></div>
        </div>
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h2 className="text-4xl lg:text-6xl font-bold text-business-black mb-8 animate-fade-in-scale leading-tight" style={{animationDelay: '0.4s'}}>
          Join the <span className="text-transparent bg-gradient-to-r from-future-green to-business-black bg-clip-text">Movement</span>
        </h2>
        <p className="text-xl lg:text-2xl text-business-black/80 mb-16 max-w-4xl mx-auto animate-fade-in-up leading-relaxed" style={{animationDelay: '0.6s'}}>
          LXERA is more than software — it's a new foundation for how organizations grow through learning and action.
        </p>
        
        {/* Enhanced benefits section with asymmetrical layout */}
        <div className="relative mb-16 animate-fade-in-scale" style={{animationDelay: '0.8s'}}>
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-future-green animate-pulse' : 'bg-future-green/30'} transition-all duration-500`} style={{animationDelay: `${1 + index * 0.2}s`}}></div>
                  {index < 2 && <div className="w-8 h-0.5 bg-future-green/20 mx-2"></div>}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-future-green/20 via-future-green/10 to-transparent rounded-3xl p-8 lg:p-12 mb-12 hover:from-future-green/25 hover:via-future-green/15 transition-all duration-700 border border-future-green/20 backdrop-blur-sm">
            <h3 className="text-2xl lg:text-3xl font-bold text-business-black mb-12 animate-fade-in" style={{animationDelay: '1s'}}>
              As an early partner, you'll:
            </h3>
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="group relative animate-fade-in-up hover:scale-105 transition-all duration-500 cursor-pointer" style={{animationDelay: benefit.delay}}>
                  {/* Card background with enhanced hover effect */}
                  <div className="absolute inset-0 bg-white/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-future-green/20"></div>
                  
                  <div className="relative flex flex-col items-center text-center p-6 rounded-2xl">
                    {/* Icon with enhanced animation */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-future-green/20 rounded-full scale-150 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
                      <div className="relative text-business-black group-hover:text-future-green group-hover:scale-110 transition-all duration-300 group-hover:animate-bounce-slow">
                        {benefit.icon}
                      </div>
                    </div>
                    
                    {/* Enhanced typography */}
                    <h4 className="text-lg font-bold text-business-black group-hover:text-future-green transition-colors duration-300 mb-3 leading-tight">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-business-black/60 italic leading-relaxed group-hover:text-business-black/80 transition-colors duration-300">
                      {benefit.description}
                    </p>
                    
                    {/* Hover indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-future-green group-hover:w-12 transition-all duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Enhanced CTA section with trust indicators */}
        <div className="animate-fade-in-up" style={{animationDelay: '1.8s'}}>
          {/* Trust indicators */}
          <div className="flex justify-center items-center gap-6 mb-6 animate-fade-in" style={{animationDelay: '1.9s'}}>
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-business-black/60 hover:text-business-black transition-colors duration-300">
                <div className="text-future-green">
                  {indicator.icon}
                </div>
                <span className="font-medium">{indicator.text}</span>
              </div>
            ))}
          </div>

          {/* Urgency message with enhanced styling */}
          <div className="relative mb-6 animate-fade-in" style={{animationDelay: '2s'}}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-future-green/10 to-transparent rounded-full"></div>
            <p className="relative text-business-black/70 font-medium py-3 px-6">
              🔥 Only a limited number of partners will be onboarded during early access
            </p>
          </div>

          {/* Enhanced CTA button */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-future-green/20 to-business-black/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <Button className="relative bg-gradient-to-r from-business-black to-business-black/90 hover:from-business-black/90 hover:to-business-black text-white text-lg px-10 py-6 rounded-full font-bold lxera-hover hover:shadow-2xl hover:shadow-business-black/30 hover:scale-105 transition-all duration-500 animate-pulse-slow group border-2 border-transparent hover:border-future-green/20">
              <span className="relative z-10">Become an Early Innovation Partner</span>
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-future-green/0 via-future-green/10 to-future-green/0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Button>
          </div>

          <p className="text-sm text-business-black/60 mt-6 animate-fade-in leading-relaxed" style={{animationDelay: '2.1s'}}>
            Redefine how your teams learn, build, and innovate—one experiment at a time.
          </p>
        </div>

        {/* Enhanced testimonial with card design */}
        <div className="mt-16 animate-fade-in-up" style={{animationDelay: '2.2s'}}>
          <div className="relative max-w-2xl mx-auto">
            {/* Background card */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-future-green/10 rounded-2xl backdrop-blur-sm border border-future-green/20 shadow-lg"></div>
            
            <div className="relative p-8">
              {/* Quote icon */}
              <div className="absolute -top-4 left-8 w-8 h-8 bg-future-green rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">"</span>
              </div>
              
              <div className="pt-4">
                <p className="text-business-black/80 text-xl lg:text-2xl italic font-medium leading-relaxed mb-4">
                  We built this with real teams like ours. It shows.
                </p>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-future-green"></div>
                  <div className="text-center">
                    <p className="text-business-black/70 font-semibold text-sm">Early Innovation Partner</p>
                    <p className="text-business-black/50 text-xs mt-1">(Beta Cohort)</p>
                  </div>
                  <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-future-green"></div>
                </div>
                
                {/* Rating stars */}
                <div className="flex justify-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-future-green text-future-green" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom transition element */}
        <div className="mt-16 animate-fade-in" style={{animationDelay: '2.4s'}}>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-future-green to-transparent mx-auto"></div>
        </div>
      </div>
    </section>
  );
};

export default JoinTheMovementSection;
