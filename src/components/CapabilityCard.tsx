import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

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
  category?: string;
  useCases?: string[];
  roiMetrics?: string;
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
  index,
  useCases = [],
  roiMetrics
}: CapabilityCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="relative group transition-all duration-700 animate-fade-in-up p-0 md:p-1"
      style={{animationDelay: `${300 + index * 150}ms`}}
    >
      {/* Gradient background band, no card border */}
      <div className={`absolute inset-0 blur-xs rounded-2xl pointer-events-none 
        ${index % 2 === 0 
          ? "bg-gradient-to-br from-white/55 via-future-green/10 to-smart-beige/30" 
          : "bg-gradient-to-bl from-future-green/8 via-white/20 to-smart-beige/30"
        }
      `}></div>
      <div className="relative z-10 flex flex-col lg:flex-row items-center backdrop-blur-[2px] p-6 lg:p-8 xl:p-12 min-h-[260px] md:min-h-[240px]">
        {/* Icon & Stat */}
        <div className="lg:w-1/3 flex flex-col items-center lg:items-start mb-4 lg:mb-0">
          <div className={`w-20 h-20 md:w-24 md:h-24 ${iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-full ${badgeBg} ${badgeBorder}`}>
              <span className="w-2 h-2 bg-current rounded-full inline-block mr-2"></span>
              {impactStat}
            </span>
          </div>
          {roiMetrics && (
            <div className="mt-3 text-center lg:text-left text-xs bg-future-green/10 text-future-green font-semibold rounded-full px-3 py-1">
              {roiMetrics}
            </div>
          )}
        </div>
        {/* Content */}
        <div className="lg:w-2/3 pl-0 lg:pl-8">
          <h3 className="text-2xl md:text-3xl font-bold text-business-black mb-2">
            {title}
          </h3>
          <p className="text-lg md:text-xl text-business-black/80 font-medium mb-6">
            {valueStatement}
          </p>
          <ul className="space-y-3 mb-4">
            {features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-start text-business-black/80 text-base">
                <span className="w-2 h-2 bg-future-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span dangerouslySetInnerHTML={{ __html: feature }} className="leading-relaxed" />
              </li>
            ))}
          </ul>
          {useCases.length > 0 && (
            <div className="border-t border-future-green/20 pt-4 mt-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-future-green hover:text-emerald font-semibold text-sm mb-2 focus:outline-none"
              >
                <span>Real-World Use Cases</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {isExpanded && (
                <div className="space-y-2 mt-2">
                  {useCases.map((useCase, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-business-black/70 text-sm">
                      <span className="w-1.5 h-1.5 bg-emerald rounded-full mt-2 flex-shrink-0"></span>
                      <span>{useCase}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapabilityCard;
