import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import React from "react";

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
  isVisible?: boolean; // NEW: driven by scroll observer
}

// Helper to wrap numbers in bold
function highlightNumbers(text: string) {
  // Matches numbers with optional % or +, e.g. 60%, +180%, 99, 40%
  const parts = text.split(/(\d[\d,.]*%?|\+\d[\d,.]*%?)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\+?\d[\d,.]*%?$/.test(part) ? (
          <span key={i} className="font-bold">{part}</span>
        ) : (
          part
        )
      )}
    </>
  );
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
  roiMetrics,
  isVisible = true // default true for graceful fallback
}: CapabilityCardProps) => {
  const isSpecial = Boolean(tangibleResults);

  return (
    <section
      className={`relative group transition-all duration-700 focus-within:ring-2 focus-within:ring-future-green/40 rounded-2xl
        ${isVisible ? "animate-fade-in-up" : "opacity-0 translate-y-8"}
      `}
      tabIndex={0}
      // Delay is controlled by parent section; smooth fade-in by isVisible change
      aria-label={title}
    >
      {/* Soft grouping background */}
      <div className={`absolute inset-0 blur-xs rounded-2xl pointer-events-none
        ${index % 2 === 0
          ? "bg-gradient-to-br from-white/50 via-future-green/10 to-smart-beige/30"
          : "bg-gradient-to-bl from-future-green/12 via-white/20 to-smart-beige/30"
        }
      `}></div>

      {/* CARD FLEX ROW LAYOUT */}
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-stretch backdrop-blur-[2px] p-6 lg:p-10 xl:p-14 min-h-[260px] md:min-h-[240px] shadow-lg hover:shadow-2xl bg-white/80 rounded-2xl transition-all duration-300 border border-future-green/20">

        {/* Left: Content Section */}
        <div className="flex-1 flex flex-col justify-center w-full md:w-2/3 pr-0 md:pr-10">
          {/* Impact metric badge under icon */}
          {impactStat && (
            <div className="flex items-center gap-2 mb-2" tabIndex={-1}>
              <span className={`text-xs md:text-sm font-semibold px-4 py-2 rounded-full ${badgeBg} ${badgeBorder} border border-future-green/20 drop-shadow-sm bg-white/80`}>
                <span className="w-2 h-2 bg-current rounded-full inline-block mr-2"></span>
                {highlightNumbers(impactStat)}
              </span>
            </div>
          )}

          {/* Headings */}
          <h3 className="text-2xl md:text-3xl font-extrabold text-business-black mb-2 text-left tracking-tight leading-tight">
            {title}
          </h3>
          <p className="text-lg md:text-xl text-business-black/80 font-medium mb-2 text-left">
            {valueStatement}
          </p>
          {description && (
            <p className="text-base text-business-black/70 mb-6 text-left">
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
                <span className="leading-relaxed">{highlightNumbers(feature)}</span>
              </li>
            ))}
          </ul>

          {/* Tangible Results Block */}
          {isSpecial && tangibleResults && (
            <div className="mt-6 w-full p-4 rounded-xl bg-future-green/10 border border-future-green/30 flex items-start gap-3 shadow-md">
              <div>
                {/* Unified pill-style label with icon and text */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-future-green/90 text-white text-sm font-semibold mb-2 shadow-sm">
                  <tangibleResults.icon className="w-5 h-5 mr-1" aria-hidden="true" />
                  {tangibleResults.label}
                </div>
                <div className="text-business-black/80 text-md leading-relaxed mt-1">
                  {highlightNumbers(tangibleResults.description)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Icon Section */}
        <div
          className={`mt-6 md:mt-0 md:ml-8 flex-shrink-0 flex items-center justify-center
              w-24 h-24 md:w-32 md:h-32 ${iconBg} rounded-2xl shadow-md
              transition-all duration-300
              group-hover:shadow-emerald-200 group-hover:scale-110 group-hover:animate-pulse-slow
              focus-visible:ring focus-visible:ring-future-green/50
            `}
          tabIndex={-1}
          aria-hidden="true"
        >
          <Icon
            className="w-12 h-12 md:w-16 md:h-16 text-white transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg group-hover:animate-pulse-slow"
            aria-label={`${title} icon`}
          />
        </div>
      </div>
    </section>
  );
};

export default CapabilityCard;
