import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, Crown } from "lucide-react";
import React from "react";

interface FeatureCardProps {
  feature: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    description: string;
    bullets: string[];
    badges: { text: string; tooltip: string; type: string }[];
    iconBg: string;
    cardBg: string;
    roi: string;
    popular?: boolean;
  };
  index: number;
  hoveredCard?: number | null;
  setHoveredCard?: (idx: number | null) => void;
  desktop?: boolean;
  expanded?: boolean;
  onAccordionClick?: () => void;
}

// Badge color scheme map
const getBadgeStyle = (type: string) => {
  switch (type) {
    case "tech":
      return "bg-lxera-blue/15 text-lxera-blue"; // Removed border
    case "feature":
      return "bg-future-green/15 text-emerald";  // Removed border
    case "benefit":
      return "bg-emerald/15 text-emerald";       // Removed border
    case "quality":
      return "bg-emerald/15 text-emerald";
    case "result":
      return "bg-lxera-red/10 text-lxera-red";   // Removed border
    default:
      return "bg-smart-beige/60 text-business-black";
  }
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  index,
  hoveredCard,
  setHoveredCard,
  desktop = false,
  expanded = false,
  onAccordionClick,
}) => {
  // Enhanced accessibility (focus/focus-visible)
  return (
    <Card
      tabIndex={0}
      className={`
        group overflow-hidden flex flex-col 
        transition-all duration-700 relative 
        ${feature.cardBg} border-0 lxera-shadow
        ${desktop 
          ? "h-[500px] hover:shadow-2xl hover:scale-105 focus-within:scale-105 animate-fade-in-up" 
          : "animate-fade-in-up"}
        focus-within:ring-2 focus-within:ring-future-green/40 outline-none
        ${expanded ? "shadow-2xl scale-102" : ""}
        z-0
      `}
      style={desktop 
        ? { animationDelay: `${0.8 + index * 0.09}s` } 
        : { animationDelay: `${0.8 + index * 0.04}s` }}
      onMouseEnter={desktop && setHoveredCard ? () => setHoveredCard(index) : undefined}
      onMouseLeave={desktop && setHoveredCard ? () => setHoveredCard(null) : undefined}
      aria-label={feature.title}
    >
      <CardContent
        className={`relative z-10 h-full flex flex-col gap-1 ${desktop ? "p-8" : "p-4"}`}
      >
        {/* Icon, popular badge, ROI badge */}
        <div className="flex items-start justify-between mb-2">
          <div
            className={`
              w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center
              transition-transform duration-300 bg-gradient-to-br ${feature.iconBg}
              text-white shadow-md
              group-hover:scale-110 group-focus:scale-110
              border-0
              outline-none focus:ring-2 focus:ring-emerald/40
            `}
            aria-hidden="true"
          >
            <span className="sr-only">{feature.title} icon</span>
            <span
              tabIndex={-1}
              aria-hidden="true"
              className="group-hover:animate-pulse"
            >
              {feature.icon}
            </span>
          </div>
          <div className="flex flex-col items-end min-w-[106px] gap-1 mt-1">
            {feature.popular && (
              <Badge className="bg-future-green/25 text-future-green px-2 py-1 text-xs font-bold flex items-center gap-1 rounded-xl shadow">
                <Crown className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            )}
            {/* Enhanced ROI badge */}
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald bg-white/90 px-3 py-1 rounded-full shadow-lg tracking-tight mt-1 mb-0">
              <TrendingUp className="w-3 h-3 text-future-green" />
              <span className="whitespace-nowrap">{feature.roi}</span>
            </span>
          </div>
        </div>
        {/* Title + subtitle */}
        <div className="mb-1 mt-2">
          <h3 className="text-2xl font-extrabold text-business-black mb-1 leading-snug">
            {feature.title}
          </h3>
          <p className="text-base italic font-medium text-business-black/60">
            {feature.subtitle}
          </p>
        </div>
        {/* Description */}
        <p className="text-sm text-business-black/80 leading-relaxed my-2 mb-0">
          {feature.description}
        </p>
        {/* Feature bullets */}
        <div className="bg-smart-beige/80 border border-future-green/30 rounded-lg px-4 py-2 mt-2 mb-2 shadow-inner">
          <ul className="space-y-1">
            {feature.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start text-[15px] text-business-black/90 font-medium leading-snug">
                <span className="w-4 flex items-start justify-center text-future-green font-extrabold select-none">•</span>
                <span className="pl-1">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Badges section */}
        <div className="flex flex-wrap gap-2 mt-auto pt-3 mb-1 -ml-1">
          {feature.badges.map((badge, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Badge
                  className={`text-xs px-3 py-1 rounded-full font-semibold hover:scale-105 transition-all duration-300 cursor-help ${getBadgeStyle(badge.type)}`}
                  tabIndex={0}
                  aria-label={badge.tooltip}
                >
                  {badge.text}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-white/95 border-future-green/25 text-xs shadow-lg">
                <span>{badge.tooltip}</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        {/* Optional: mobile expand arrow */}
        {!desktop && (
          <button
            onClick={onAccordionClick}
            aria-label={expanded ? "Collapse" : "Expand"}
            tabIndex={-1}
            className={`absolute bottom-2 right-2 p-1 bg-future-green/10 text-future-green rounded-full border border-future-green/20 shadow-sm ${expanded ? "rotate-180" : ""} transition-all duration-200`}
            style={{ pointerEvents: "none" }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
