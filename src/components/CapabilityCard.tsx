
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  valueStatement: string;
  description?: string;
  features: string[];
  impactStat: string;
  tangibleResults?: {
    icon: LucideIcon;
    label: string;
    description: string;
  };
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
  description,
  features,
  impactStat,
  tangibleResults,
  iconBg,
  badgeBg,
  badgeBorder,
  secondaryIcon: SecondaryIcon,
  index,
  category,
  useCases = [],
  roiMetrics
}: CapabilityCardProps) => {
  const isSpecial = Boolean(tangibleResults);

  return (
    <section
      className="relative group transition-all duration-700 animate-fade-in-up p-0 md:p-1 focus-within:ring-2 focus-within:ring-future-green/40 rounded-2xl"
      tabIndex={0}
      style={{ animationDelay: `${300 + index * 150}ms` }}
      aria-label={title}
    >
      {/* Soft grouping background */}
      <div className={`absolute inset-0 blur-xs rounded-2xl pointer-events-none
        ${index % 2 === 0
          ? "bg-gradient-to-br from-white/50 via-future-green/10 to-smart-beige/30"
          : "bg-gradient-to-bl from-future-green/12 via-white/20 to-smart-beige/30"
        }
      `}></div>

      <div className="relative z-10 flex flex-col items-center backdrop-blur-[2px] p-6 lg:p-10 xl:p-14 min-h-[260px] md:min-h-[240px] shadow-lg hover:shadow-2xl bg-white/80 rounded-2xl transition-all duration-300 border border-future-green/20">
        {/* Icon top and centered */}
        <div
          className={`w-24 h-24 md:w-28 md:h-28 ${iconBg} rounded-2xl flex items-center justify-center mb-6 shadow-md transition-all duration-300
              group-hover:shadow-emerald-200 group-hover:scale-110 group-hover:animate-bounce-slow focus-visible:ring focus-visible:ring-future-green/50
            `}
          tabIndex={-1}
          aria-hidden="true"
        >
          <Icon
            className="w-12 h-12 text-white transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg group-hover:animate-pulse-slow"
            aria-label={`${title} icon`}
          />
        </div>

        {/* Impact metric badge under icon */}
        {impactStat && (
          <div className="flex items-center gap-2 mb-2" tabIndex={-1}>
            <span className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-full ${badgeBg} ${badgeBorder} border border-future-green/20 drop-shadow-sm bg-white/80`}>
              <span className="w-2 h-2 bg-current rounded-full inline-block mr-2"></span>
              {impactStat}
            </span>
          </div>
        )}

        {/* Headings */}
        <h3 className="text-2xl md:text-3xl font-extrabold text-business-black mb-2 text-center tracking-tight leading-tight">
          {title}
        </h3>
        <p className="text-lg md:text-xl text-business-black/80 font-medium mb-2 text-center">
          {valueStatement}
        </p>
        {description && (
          <p className="text-base text-business-black/70 mb-6 text-center">
            {description}
          </p>
        )}
        
        {/* Bullets */}
        <ul className="space-y-0 w-full mb-4">
          {features.map((feature, featureIndex) => (
            <li
              key={featureIndex}
              className={`flex items-start text-business-black/80 text-base relative transition-colors duration-200
                ${featureIndex > 0 ? "pt-4 mt-2 border-t border-future-green/10" : ""}
              `}
              aria-label={`Feature: ${feature.replace(/(<([^>]+)>)/gi, "")}`}
            >
              <span className="w-2 h-2 bg-future-green rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Tangible Results Block */}
        {isSpecial && tangibleResults && (
          <div className="mt-6 w-full p-4 rounded-xl bg-future-green/10 border border-future-green/30 flex items-start gap-3 shadow-md">
            <tangibleResults.icon
              className="w-8 h-8 text-future-green flex-shrink-0 mt-1"
              aria-label="Tangible Results icon"
            />
            <div>
              <div className="text-base font-semibold flex items-center gap-2 mb-1 text-emerald">
                🚀 <span className="font-bold">Tangible Results</span>
              </div>
              <div className="text-business-black/80 text-md leading-relaxed">
                {tangibleResults.description}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CapabilityCard;
