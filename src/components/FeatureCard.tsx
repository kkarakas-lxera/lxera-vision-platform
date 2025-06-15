
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

const getBadgeStyle = (type: string) => {
  switch (type) {
    case "tech":
      return "bg-lxera-blue/20 text-lxera-blue border-lxera-blue/30";
    case "feature":
      return "bg-future-green/20 text-emerald border-future-green/30";
    case "benefit":
      return "bg-emerald/20 text-emerald border-emerald/30";
    case "quality":
      return "bg-emerald/20 text-emerald border-emerald/30";
    case "result":
      return "bg-lxera-red/20 text-lxera-red border-lxera-red/30";
    default:
      return "bg-smart-beige/50 text-business-black border-business-black/10";
  }
};

/** Desktop & Mobile card showing all */
const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  index,
  hoveredCard,
  setHoveredCard,
  desktop = false,
  expanded = false,
  onAccordionClick
}) => (
  <Card
    tabIndex={0}
    className={`
      ${feature.cardBg} border-0 lxera-shadow group transition-all duration-700 relative overflow-hidden flex flex-col 
      ${desktop ? "h-[470px] hover:shadow-2xl hover:scale-102 animate-fade-in-up" : "animate-fade-in-up"}
      focus-within:ring-2 focus-within:ring-future-green/40 outline-none
    `}
    style={desktop ? { animationDelay: `${0.8 + index * 0.1}s` } : { animationDelay: `${0.8 + index * 0.05}s` }}
    onMouseEnter={desktop && setHoveredCard ? () => setHoveredCard(index) : undefined}
    onMouseLeave={desktop && setHoveredCard ? () => setHoveredCard(null) : undefined}
    aria-label={feature.title}
  >
    <CardContent
      className={`relative z-10 h-full flex flex-col ${desktop ? "p-7" : "p-4"}`}
    >
      {/* Icon + Badges Header with new column layout */}
      <div className="flex items-start justify-between gap-2 mb-4">
        {/* Icon with enhanced animation */}
        <div className={`
          w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center text-white
          transition-all duration-500 group-hover:scale-110 focus:scale-110
          group-hover:shadow-lg focus:shadow-lg shadow-md
          group-hover:ring-2 group-hover:ring-future-green/40
          `}
          aria-hidden="true"
        >
          {feature.icon}
        </div>
        {/* Popular badge & space for more prominence */}
        <div className="flex flex-col items-end gap-2 min-w-[98px] text-right">
          {feature.popular && (
            <Badge className="bg-future-green/20 text-future-green border-future-green/30 text-xs px-2 py-1 flex items-center gap-1 font-semibold">
              <Crown className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          )}
          {/* Prominent ROI badge */}
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald bg-emerald/10 px-3 py-1 rounded-full shadow-md border border-emerald/30 tracking-tight">
            <TrendingUp className="w-3 h-3" />
            {feature.roi}
          </span>
        </div>
      </div>

      {/* Title, subtitle with improved hierarchy */}
      <div className="mb-2">
        <h3 className="text-xl font-extrabold text-business-black mb-1 leading-snug">
          {feature.title}
        </h3>
        <p className="text-base italic font-medium text-business-black/70">{feature.subtitle}</p>
      </div>

      {/* Description */}
      <p className="text-sm text-business-black/80 leading-relaxed my-2">
        {feature.description}
      </p>

      {/* Bullet section with border/bg */}
      <div className="bg-smart-beige/50 border border-future-green/20 rounded-lg px-3 py-2 my-2">
        <ul className="space-y-1">
          {feature.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start text-sm text-business-black/80">
              <span className="text-future-green mr-2 mt-0.5 font-bold">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Badges with new grouping */}
      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        {feature.badges.map((badge, i) => (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <Badge
                className={`text-xs px-3 py-1 ${getBadgeStyle(badge.type)} hover:scale-105 transition-all duration-300 cursor-help border font-semibold`}
              >
                {badge.text}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{badge.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default FeatureCard;
