import React from 'react';
import { Target, Zap, TrendingUp, Users, BarChart3, Brain } from 'lucide-react';
import { FEATURES_CONTENT } from '../shared/content';

const featureIcons = [Target, Zap, TrendingUp, Users, BarChart3, Brain];

export const WaitingListFeaturesMobile: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Mobile background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-4 w-32 h-32 bg-[#7AE5C6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-4 w-28 h-28 bg-[#7AE5C6]/15 rounded-full blur-2xl" />
      </div>

      <div className="relative px-4">
        {/* Header - mobile optimized */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white leading-tight">
            {FEATURES_CONTENT.title}
          </h2>
          <p className="text-white text-base leading-relaxed px-2">
            {FEATURES_CONTENT.subtitle}
          </p>
        </div>

        {/* Features - Mobile-first single column layout */}
        <div className="space-y-6">
          {FEATURES_CONTENT.features.map((feature, index) => {
            const IconComponent = featureIcons[index];
            return (
              <div
                key={index}
                className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-lg"
              >
                {/* Icon and Title Row */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#7AE5C6]/20 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-[#7AE5C6]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Tags - Mobile optimized layout */}
                <div className="flex flex-wrap gap-2">
                  {feature.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1.5 bg-white/90 text-black text-xs rounded-full border border-black/20 shadow-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile CTA section */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7AE5C6]/10 border border-[#7AE5C6]/30 px-4 py-2">
            <span className="text-[#7AE5C6] text-sm font-medium">
              Ready to get started? Scroll down to join the waitlist
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};