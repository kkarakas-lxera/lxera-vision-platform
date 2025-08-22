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
    <div className="w-full px-2">
      {/* Mobile-optimized card - simple styling matching desktop */}
      <div
        className={`relative bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50 transition-all duration-200 shadow-lg ${
          isPressed ? 'scale-98 border-[#7AE5C6]/40' : 'scale-100'
        }`}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
      >
        {/* Icon */}
        <div className="mb-3">
          <div className="w-10 h-10 bg-[#7AE5C6]/20 rounded-xl flex items-center justify-center">
            <IconComponent className="w-5 h-5 text-[#7AE5C6]" />
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2 text-white">
          {title}
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm">
          {description}
        </p>
      </div>
    </div>
  );
};