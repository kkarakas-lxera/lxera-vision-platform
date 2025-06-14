
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Users, Brain, BarChart3, Lightbulb, UserCheck, Cpu, TrendingUp, Rocket } from "lucide-react";
import { StepData } from "@/data/howItWorksSteps";
import { useState } from "react";
import VideoModal from "./VideoModal";
import { useInView } from "@/hooks/useInView";

interface StepCardProps {
  step: StepData;
  index: number;
  isLast: boolean;
  layout: "desktop" | "mobile" | "pathway" | "pathway-vertical";
  side?: "left" | "right";
  reducedMotion?: boolean;
}

const iconMap = { Users, Brain, BarChart3, Lightbulb, UserCheck, Cpu, TrendingUp, Rocket };

export const StepCard = ({ step, index, isLast, layout, side, reducedMotion }: StepCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const MainIcon = iconMap[step.iconName as keyof typeof iconMap];

  // Animate card on scroll into view, respect reduced motion
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.18 });
  const animateClass = reducedMotion ? "" : inView ? "animate-fade-in-up" : "opacity-0 translate-y-8";

  // Keyboard support: open modal on Enter/Space
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      setShowModal(true);
    }
  };

  let arrow = null, sideAlign = "";
  if (layout === "desktop" && side) {
    sideAlign =
      side === "left"
        ? "ml-auto mr-8 pl-0 pr-8"
        : "mr-auto ml-8 pr-0 pl-8";
    arrow = (
      <span
        className={`
          absolute top-16 ${side === "left" ? "right-0 -mr-4" : "left-0 -ml-4"}
          z-20 w-8 flex justify-center pointer-events-none
        `}
      >
        <span className="block w-3 h-3 bg-future-green rounded-full border-2 border-white shadow"></span>
      </span>
    );
  }

  const NumberBadge = (
    <div className="flex items-center justify-center mb-3">
      <div className="w-16 h-16 bg-gradient-to-br from-future-green to-future-green/90 rounded-full shadow-lg flex items-center justify-center scale-105 border-4 border-white relative z-20">
        <span className="text-3xl font-extrabold text-business-black tracking-tight">
          {step.step}
        </span>
      </div>
    </div>
  );

  const IconBadge = (
    <div className="w-12 h-12 bg-gradient-to-br from-smart-beige/90 to-future-green/30 rounded-full flex items-center justify-center shadow group-hover:shadow-lg transition-all duration-500">
      <MainIcon className="w-6 h-6 text-future-green" />
    </div>
  );

  const VideoThumbnail = (
    <div className="relative rounded-xl overflow-hidden shadow-lg group mt-4">
      <img
        src={step.videoThumb}
        alt={`${step.title} preview`}
        className="w-full h-40 object-cover rounded-xl border-2 border-future-green/30 group-hover:scale-102 transition-transform duration-300 bg-[#e6faf3]"
        draggable={false}
        loading="lazy"
        decoding="async"
        style={{ maxWidth: "100%", height: "auto" }}
        width={600}
        height={160}
      />
      <button
        onClick={() => setShowModal(true)}
        aria-label={`Play video: ${step.title}`}
        tabIndex={0}
        role="button"
        onKeyDown={handleKeyDown}
        type="button"
        style={{ WebkitTapHighlightColor: "transparent" }}
        className="absolute inset-0 flex items-center justify-center bg-black/15 hover:bg-black/25 transition group outline-none focus-visible:ring-2 focus-visible:ring-future-green play-btn-glow"
      >
        <div className="w-14 h-14 flex items-center justify-center rounded-full bg-future-green/90 shadow-lg border-4 border-white hover:scale-110 transition relative animate-pulse-slow">
          <Play className="w-8 h-8 text-business-black drop-shadow" aria-hidden="true" />
        </div>
      </button>
    </div>
  );

  const VideoCaption = (
    <div className="text-xs text-business-black/70 text-center mt-2 mb-1">
      {step.videoCaption}
    </div>
  );

  const CardContentBody = (
    <>
      {arrow}
      {NumberBadge}
      <div className="flex flex-col items-center">
        {/* Icon removed as requested */}
        <h3 className="text-lg font-bold text-business-black text-center mt-2">{step.title}</h3>
        <div className="text-sm text-business-black/70 font-semibold mt-1 mb-2 text-center">{step.subtitle}</div>
        {/* Bullets removed as requested */}
        {VideoThumbnail}
        {VideoCaption}
        <div className="mt-3 mb-1 text-xs font-semibold text-business-black/80 text-center">{step.metrics}</div>
        {step.cta && (
          <Button
            size="sm"
            className="mt-2 bg-future-green text-business-black hover:bg-future-green/80 font-semibold rounded-full transition-all duration-300 shadow-sm px-5 py-2"
            type="button"
            tabIndex={0}
            aria-label={step.cta}
          >
            {step.cta}
          </Button>
        )}
      </div>
      {showModal && (
        <VideoModal
          isOpen={showModal}
          setIsOpen={setShowModal}
          videoUrl={step.videoUrl}
          videoCaption={step.videoCaption}
        />
      )}
    </>
  );

  if (layout === "pathway") {
    return (
      <div
        ref={ref}
        className={`
          relative z-10 group transition-transform flex flex-col items-center w-full h-full
          ${animateClass}
        `}
        style={{ animationDelay: `${index * 0.15}s` }}
      >
        <Card className="bg-white border-0 lxera-shadow relative z-10 hover:shadow-xl hover:-translate-y-2 group-hover:scale-105 transition-all duration-500 flex flex-col items-center w-full h-full min-h-[530px]">
          <CardContent className="p-6 flex flex-col h-full items-center w-full">{CardContentBody}</CardContent>
        </Card>
      </div>
    );
  }

  if (layout === "pathway-vertical") {
    return (
      <div
        ref={ref}
        className={`
          relative group flex flex-col items-center w-full h-full
          ${animateClass}
          ml-11
        `}
        style={{
          animationDelay: `${index * 0.18}s`,
        }}
      >
        <Card className="bg-white border-0 lxera-shadow p-3 relative z-10 hover:shadow-xl hover:-translate-y-1 group-hover:scale-102 transition-all duration-500 flex flex-col items-center w-full min-h-[530px]">
          <CardContent className="p-4 flex flex-col items-center w-full h-full">
            {CardContentBody}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (layout === "desktop") {
    return (
      <div
        ref={ref}
        className={`
          relative z-10 group
          ${side === "left" ? "items-end text-right" : "items-start text-left"}
          ${animateClass}
        `}
        style={{
          animationDelay: `${index * 0.18}s`,
          minWidth: '325px',
          maxWidth: '420px',
        }}
      >
        <div className={`relative ${sideAlign}`}>
          <Card className="bg-white border-0 lxera-shadow relative z-10 hover:shadow-xl hover:-translate-y-2 group-hover:scale-105 transition-all duration-500">
            <CardContent className="p-6 flex flex-col h-full">{CardContentBody}</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (layout === "mobile") {
    return (
      <div
        ref={ref}
        className={`relative group ${animateClass}`}
        style={{ animationDelay: `${index * 0.18}s` }}
      >
        <Card className="bg-white border-0 lxera-shadow p-3 relative z-10 hover:shadow-xl hover:-translate-y-1 group-hover:scale-102 transition-all duration-500">
          <CardContent className="p-4">{CardContentBody}</CardContent>
        </Card>
      </div>
    );
  }
};

// REMINDER: src/components/StepCard.tsx is now over 220 lines. Consider refactoring into smaller components/hooks for easier maintenance!
