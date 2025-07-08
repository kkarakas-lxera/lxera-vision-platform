
import { Rocket, Shield, Zap, Target } from "lucide-react";

const AnimatedBackground = () => {
  return (
    <>
      {/* Desktop version with animations */}
      <div className="absolute inset-0 opacity-5 overflow-hidden hidden lg:block">
        <div className="absolute top-10 left-10 w-32 h-32 bg-future-green rounded-full animate-float flex items-center justify-center">
          <Rocket className="w-12 h-12 text-white" />
        </div>
        <div className="absolute top-64 right-20 w-24 h-24 bg-light-green rounded-full animate-float flex items-center justify-center" style={{animationDelay: '2s'}}>
          <Shield className="w-8 h-8 text-emerald" />
        </div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-future-green rounded-full animate-float flex items-center justify-center" style={{animationDelay: '1s'}}>
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-emerald rounded-full animate-float flex items-center justify-center" style={{animationDelay: '3s'}}>
          <Target className="w-5 h-5 text-white" />
        </div>
      </div>
      
      {/* Mobile version - static background pattern for better performance */}
      <div className="absolute inset-0 opacity-5 overflow-hidden lg:hidden">
        <div className="absolute top-10 left-10 w-24 h-24 bg-future-green rounded-full flex items-center justify-center">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        <div className="absolute bottom-10 right-10 w-20 h-20 bg-light-green rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-emerald" />
        </div>
      </div>
    </>
  );
};

export default AnimatedBackground;
