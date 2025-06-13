
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
      className="bg-white/90 backdrop-blur-sm border-0 lxera-shadow overflow-hidden group transition-all duration-500 hover:shadow-2xl lxera-hover animate-fade-in-up"
      style={{animationDelay: `${200 + index * 100}ms`}}
    >
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Icon Section */}
          <div className="lg:w-1/3 p-8 lg:p-12 flex flex-col items-center lg:items-start relative">
            <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative">
              <div className={`w-20 h-20 ${iconBg} rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl`}>
                <Icon className="w-8 h-8 text-white transition-all duration-300 group-hover:scale-125" />
                <div className="absolute inset-0 rounded-2xl border-2 border-future-green/20 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500"></div>
              </div>
              
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 animate-delay-200">
                <SecondaryIcon className="w-4 h-4 text-future-green/70" />
              </div>
            </div>
            
            <Badge className={`${badgeBg} text-business-black ${badgeBorder} text-sm px-4 py-2 font-bold transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg relative z-10`}>
              <span className="animate-pulse-slow">{impactStat}</span>
            </Badge>
          </div>

          {/* Content Section */}
          <div className="lg:w-2/3 p-8 lg:p-12 lg:pl-0 relative">
            <h3 className="text-2xl lg:text-3xl font-bold text-business-black mb-3 transition-all duration-300 group-hover:text-future-green">
              {title}
            </h3>
            <p className="text-lg font-semibold text-business-black/70 mb-6 transition-colors duration-300 group-hover:text-business-black/90">
              {valueStatement}
            </p>
            <ul className="space-y-3">
              {features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start text-business-black/80 group-hover:text-business-black transition-all duration-300 transform group-hover:translate-x-2" style={{transitionDelay: `${featureIndex * 100}ms`}}>
                  <div className="w-2 h-2 bg-future-green rounded-full mr-4 mt-2 flex-shrink-0 transition-all duration-300 group-hover:scale-150 group-hover:animate-pulse"></div>
                  <span dangerouslySetInnerHTML={{ __html: feature }} />
                </li>
              ))}
            </ul>
            
            <div className="mt-6 w-full h-0.5 bg-gradient-to-r from-future-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="h-full bg-future-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CapabilityCard;
