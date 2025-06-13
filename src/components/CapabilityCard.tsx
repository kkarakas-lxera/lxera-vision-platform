
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  valueStatement: string;
  features: string[];
  impactStat: string;
  iconBg: string;
  badgeBg: string;
  badgeBorder: string;
  secondaryIcon: LucideIcon;
  index: number;
}

const CapabilityCard = ({
  icon: Icon,
  title,
  valueStatement,
  features,
  impactStat,
  iconBg,
  badgeBg,
  badgeBorder,
  secondaryIcon: SecondaryIcon,
  index
}: CapabilityCardProps) => {
  return (
    <Card 
      className="bg-white/95 backdrop-blur-sm border border-white/50 shadow-xl overflow-hidden group transition-all duration-700 hover:shadow-2xl hover:scale-[1.02] animate-fade-in-up relative"
      style={{animationDelay: `${300 + index * 150}ms`}}
    >
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-future-green/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <CardContent className="p-0 relative z-10">
        <div className="flex flex-col lg:flex-row items-center min-h-[280px]">
          {/* Enhanced Icon Section */}
          <div className="lg:w-1/3 p-8 lg:p-12 flex flex-col items-center lg:items-start relative">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-future-green/8 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 transform group-hover:scale-105"></div>
            
            <div className="relative mb-6">
              {/* Main icon container */}
              <div className={`w-24 h-24 ${iconBg} rounded-3xl flex items-center justify-center relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:shadow-2xl shadow-lg`}>
                <Icon className="w-10 h-10 text-white transition-all duration-500 group-hover:scale-125" />
                
                {/* Animated border */}
                <div className="absolute inset-0 rounded-3xl border-2 border-future-green/30 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-700 animate-pulse-slow"></div>
              </div>
              
              {/* Secondary icon */}
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-future-green/20 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 animate-delay-300">
                <SecondaryIcon className="w-5 h-5 text-future-green" />
              </div>
              
              {/* Floating particles effect */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-future-green/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float-gentle transition-all duration-700"></div>
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-emerald/40 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-float-gentle animate-delay-500 transition-all duration-700"></div>
            </div>
            
            {/* Enhanced badge */}
            <Badge className={`${badgeBg} text-business-black ${badgeBorder} text-sm px-6 py-3 font-bold transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg relative z-10 rounded-full`}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-current rounded-full animate-pulse-slow"></span>
                {impactStat}
              </span>
            </Badge>
          </div>

          {/* Enhanced Content Section */}
          <div className="lg:w-2/3 p-8 lg:p-12 lg:pl-8 relative">
            {/* Title with enhanced styling */}
            <h3 className="text-3xl lg:text-4xl font-bold text-business-black mb-4 transition-all duration-500 group-hover:text-future-green leading-tight">
              {title}
            </h3>
            
            {/* Value statement with better typography */}
            <p className="text-xl font-semibold text-business-black/80 mb-8 transition-colors duration-500 group-hover:text-business-black leading-relaxed">
              {valueStatement}
            </p>
            
            {/* Enhanced features list */}
            <ul className="space-y-4">
              {features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start text-business-black/80 group-hover:text-business-black transition-all duration-500 transform group-hover:translate-x-2 text-lg" style={{transitionDelay: `${featureIndex * 100}ms`}}>
                  <div className="relative mr-4 mt-2 flex-shrink-0">
                    <div className="w-2.5 h-2.5 bg-future-green rounded-full transition-all duration-500 group-hover:scale-150 group-hover:shadow-lg"></div>
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-future-green rounded-full animate-ping opacity-0 group-hover:opacity-30"></div>
                  </div>
                  <span dangerouslySetInnerHTML={{ __html: feature }} className="leading-relaxed" />
                </li>
              ))}
            </ul>
            
            {/* Enhanced progress indicator */}
            <div className="mt-8 relative">
              <div className="w-full h-1 bg-gradient-to-r from-future-green/20 via-future-green/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="h-full bg-gradient-to-r from-future-green to-emerald rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CapabilityCard;
