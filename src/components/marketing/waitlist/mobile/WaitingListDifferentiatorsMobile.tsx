import React from 'react';
import { Diamond, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { DIFFERENTIATORS_CONTENT } from '../shared/content';

const differentiatorIcons = [Diamond, TrendingUp, Lightbulb, Target];

export const WaitingListDifferentiatorsMobile: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900 text-white relative overflow-hidden">
      {/* Mobile background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7AE5C6]/10 via-transparent to-[#7AE5C6]/5" />
        {/* Mobile-optimized glow */}
        <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-center pointer-events-none">
          <div className="h-full w-[90vw] bg-[#7AE5C6]/20 opacity-50 blur-[80px] rounded-full" />
        </div>
      </div>
      
      <div className="relative px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white leading-tight">
            {DIFFERENTIATORS_CONTENT.title}
          </h2>
        </div>

        {/* Mobile-optimized single column grid */}
        <div className="space-y-6">
          {DIFFERENTIATORS_CONTENT.items.map((item, index) => {
            const IconComponent = differentiatorIcons[index];
            return (
              <div key={index} className="relative group">
                {/* Mobile-optimized card with gradient background */}
                <div className={`relative bg-gradient-to-br ${item.gradient} rounded-3xl p-6 overflow-hidden min-h-[200px] flex flex-col justify-between`}>
                  {/* Background overlay */}
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${item.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                      <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-white leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description at bottom */}
                  <div className="relative z-10">
                    <p className="text-white/95 leading-relaxed text-sm">
                      {item.description}
                    </p>
                  </div>

                  {/* Mobile-optimized decorative elements */}
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full" />
                  <div className="absolute -right-2 -bottom-2 w-12 h-12 bg-white/10 rounded-full" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile CTA section */}
        <div className="text-center mt-12">
          <div className="inline-flex flex-col items-center gap-3 rounded-2xl bg-gray-800/50 border border-gray-700/50 px-6 py-4 backdrop-blur-sm">
            <span className="text-white text-base font-medium">
              Experience the difference
            </span>
            <div className="flex items-center gap-2 text-[#7AE5C6] text-sm">
              <div className="w-2 h-2 bg-[#7AE5C6] rounded-full animate-pulse"></div>
              <span>Join the waitlist below</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};