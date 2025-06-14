
import React from "react";

const stats = [
  {
    label: "Innovative users onboarded",
    value: "3,000+",
  },
  {
    label: "Avg. team engagement boost",
    value: "54%",
  },
  {
    label: "Lessons completed/month",
    value: "6,800+",
  },
];

const HeroStats = ({ surface = false }: { surface?: boolean }) => {
  if (surface) {
    // Only show the standout stat (second one)
    return (
      <div className="mt-6 flex justify-center">
        <div className="rounded-xl shadow-lg bg-white/90 px-6 py-3 inline-block border border-future-green/30 animate-fade-in-up animate-delay-300">
          <span className="block text-3xl font-bold text-business-black font-playfair tracking-tight">
            {stats[1].value}
          </span>
          <span className="block text-xs font-medium text-business-black/65 mt-1">
            {stats[1].label}
          </span>
        </div>
      </div>
    );
  }

  // Default: Show the rest two, horizontally aligned for wide, stacked for mobile
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6 animate-fade-in-up animate-delay-800">
      {stats
        .filter((_, idx) => idx !== 1)
        .map((stat, i) => (
          <div
            key={stat.label}
            className="rounded-xl shadow-lg bg-white/80 px-5 py-2 min-w-[115px] border border-future-green/25"
          >
            <span className="block text-xl font-semibold text-business-black font-playfair">
              {stat.value}
            </span>
            <span className="block text-xs text-business-black/50 mt-1">
              {stat.label}
            </span>
          </div>
        ))}
    </div>
  );
};

export default HeroStats;
