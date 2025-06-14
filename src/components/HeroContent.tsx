
import React from "react";
import HeroStats from "./HeroStats";

const HeroContent = () => {
  return (
    <div className="relative text-center space-y-8 z-10">
      {/* Headline with display font and staggered fade */}
      <div>
        <h1 className="headline font-playfair text-4xl sm:text-5xl lg:text-7xl font-bold text-business-black leading-tight tracking-tight">
          <span className="block animate-fade-in-up" style={{ animationDelay: "0ms" }}>
            LXERA is the first
          </span>
          <span
            className="block drop-shadow-sm animate-fade-in-up"
            style={{ color: "#aeb171", animationDelay: "180ms" }}
          >
            Learning &amp; Innovation Experience
          </span>
          <span className="block text-business-black drop-shadow-sm animate-fade-in-up" style={{ animationDelay: "340ms" }}>
            Platform
          </span>
        </h1>
        {/* Supporting subtitle */}
        <div className="mt-4 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <p className="text-lg sm:text-xl lg:text-2xl text-business-black/80 max-w-2xl mx-auto font-medium leading-relaxed">
            The smartest way to unlock, scale, and showcase frontline innovation—faster than ever.
          </p>
        </div>
      </div>

      <div className="mt-4 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
        <p className="subheadline text-lg sm:text-xl lg:text-2xl text-business-black/85 max-w-4xl mx-auto font-medium leading-relaxed">
          Empower teams to <span className="relative">learn faster</span> and{" "}
          <span className="relative">innovate from the frontline</span> in one intelligent ecosystem.
        </p>
      </div>

      {/* Standout stat surfaced up */}
      <HeroStats surface />

    </div>
  );
};

export default HeroContent;
