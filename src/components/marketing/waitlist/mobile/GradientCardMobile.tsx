'use client'
import React, { useState } from "react";
import { LucideIcon } from 'lucide-react';

interface GradientCardMobileProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const GradientCardMobile: React.FC<GradientCardMobileProps> = ({ icon: IconComponent, title, description }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div className="w-full flex items-center justify-center px-2">
      {/* Mobile-optimized card - responsive sizing, touch-friendly */}
      <div
        className={`relative rounded-3xl overflow-hidden transition-transform duration-200 ${
          isPressed ? 'scale-98' : 'scale-100'
        }`}
        style={{
          width: "100%",
          maxWidth: "340px",
          height: "280px", // Smaller height for mobile
          backgroundColor: "#0e131f",
          boxShadow: "0 -8px 60px 8px rgba(78, 99, 255, 0.2), 0 0 8px 0 rgba(0, 0, 0, 0.4)",
        }}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
      >
        {/* Simplified glass reflection overlay for mobile */}
        <div
          className="absolute inset-0 z-35 pointer-events-none opacity-50"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0.04) 100%)",
            backdropFilter: "blur(1px)",
          }}
        />

        {/* Dark background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(180deg, #000000 0%, #000000 70%)",
          }}
        />

        {/* Simplified noise texture for mobile */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Mobile-optimized glow effect */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 z-20"
          style={{
            background: `
              radial-gradient(ellipse at bottom right, rgba(172, 92, 255, 0.6) -10%, rgba(79, 70, 229, 0) 70%),
              radial-gradient(ellipse at bottom left, rgba(56, 189, 248, 0.6) -10%, rgba(79, 70, 229, 0) 70%)
            `,
            filter: "blur(30px)",
          }}
        />

        {/* Central purple glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 z-21"
          style={{
            background: `
              radial-gradient(circle at bottom center, rgba(161, 58, 229, 0.6) -20%, rgba(79, 70, 229, 0) 60%)
            `,
            filter: "blur(35px)",
          }}
        />

        {/* Simplified bottom border glow for mobile */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] z-25"
          style={{
            background: "linear-gradient(90deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0.03) 100%)",
            boxShadow: "0 0 12px 2px rgba(172, 92, 255, 0.7), 0 0 20px 4px rgba(138, 58, 185, 0.5), 0 0 30px 6px rgba(56, 189, 248, 0.3)",
          }}
        />

        {/* Card content - mobile optimized spacing */}
        <div className="relative flex flex-col h-full p-6 z-40">
          {/* Icon circle - smaller for mobile */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(225deg, #171c2c 0%, #121624 100%)",
              boxShadow: "0 4px 8px -1px rgba(0, 0, 0, 0.2), inset 1px 1px 2px rgba(255, 255, 255, 0.1), inset -1px -1px 2px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Top-left highlight */}
            <div
              className="absolute top-0 left-0 w-2/3 h-2/3 opacity-30 rounded-full"
              style={{
                background: "radial-gradient(circle at top left, rgba(255, 255, 255, 0.4), transparent 70%)",
                pointerEvents: "none",
                filter: "blur(6px)"
              }}
            />

            {/* Icon - smaller for mobile */}
            <div className="flex items-center justify-center w-full h-full relative z-10">
              <IconComponent className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Content positioning - mobile optimized */}
          <div className="mb-auto">
            <h3
              className="text-xl font-medium text-white mb-2 leading-tight"
              style={{
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              {title}
            </h3>

            <p
              className="text-sm mb-4 text-gray-300 leading-relaxed"
              style={{
                lineHeight: 1.4,
                fontWeight: 350,
              }}
            >
              {description}
            </p>

            {/* Learn More with arrow - mobile friendly */}
            <a
              href="#"
              className="inline-flex items-center text-white text-sm font-medium group touch-none"
            >
              Learn More
              <svg
                className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
                width="8"
                height="8"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 8H15M15 8L8 1M15 8L8 15"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};