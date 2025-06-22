
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users } from "lucide-react";
import { useState } from "react";
import DemoModal from "./DemoModal";

interface ConversionCTAProps {
  variant?: 'primary' | 'secondary' | 'urgency';
  title?: string;
  subtitle?: string;
  showUrgency?: boolean;
}

const ConversionCTA = ({ 
  variant = 'primary',
  title = "Ready to transform your learning experience?",
  subtitle = "Join innovative teams already using LXERA",
  showUrgency = false
}: ConversionCTAProps) => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const variants = {
    primary: "bg-gradient-to-br from-future-green to-emerald",
    secondary: "bg-gradient-to-br from-business-black to-gray-800",
    urgency: "bg-gradient-to-br from-pink-500 to-rose-500"
  };

  return (
    <>
      <div className={`${variants[variant]} rounded-3xl p-8 md:p-12 shadow-2xl border border-opacity-20 text-center`}>
        {showUrgency && (
          <div className="flex items-center justify-center gap-2 mb-4 animate-pulse">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-white/90 text-sm font-medium">Limited Early Access Spots Available</span>
          </div>
        )}
        
        <h3 className={`text-2xl lg:text-3xl font-semibold mb-4 font-inter ${variant === 'primary' ? 'text-business-black' : 'text-white'}`}>
          {title}
        </h3>
        
        <p className={`text-lg mb-8 font-inter ${variant === 'primary' ? 'text-business-black/80' : 'text-white/80'}`}>
          {subtitle}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Users className={`w-5 h-5 ${variant === 'primary' ? 'text-business-black/70' : 'text-white/70'}`} />
          <span className={`text-sm font-inter ${variant === 'primary' ? 'text-business-black/70' : 'text-white/70'}`}>
            500+ teams already building with LXERA
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setIsDemoModalOpen(true)}
            size="lg"
            className={`${variant === 'primary' 
              ? 'bg-business-black text-white hover:bg-business-black/90' 
              : variant === 'secondary'
              ? 'bg-future-green text-business-black hover:bg-emerald'
              : 'bg-white text-pink-600 hover:bg-pink-50'
            } font-semibold px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-offset-2 font-inter`}
          >
            Get Your Demo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className={`border-2 ${variant === 'primary' 
              ? 'border-business-black/30 text-business-black hover:bg-business-black hover:text-white' 
              : 'border-white/30 text-white hover:bg-white hover:text-business-black'
            } font-semibold px-8 py-4 rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-offset-2 font-inter`}
          >
            Start Free Trial
          </Button>
        </div>
      </div>

      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
      />
    </>
  );
};

export default ConversionCTA;
