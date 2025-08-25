import React, { useState } from 'react';
import { Target, Zap, TrendingUp, Lightbulb, BarChart3, Brain } from 'lucide-react';
import { WaitlistVariant } from '../shared/contentSelector';

const featureIcons = [Target, Zap, Lightbulb, TrendingUp, BarChart3, Brain];

const FeatureCardMobile: React.FC<{
  feature: any;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ feature, icon: IconComponent }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={`bg-gray-800 rounded-2xl p-6 border border-gray-700 transition-all duration-200 ${
        isPressed ? 'scale-98 border-[#7AE5C6]/40' : 'scale-100'
      }`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* Icon */}
      <div className="mb-4">
        <div className="w-12 h-12 bg-[#7AE5C6]/20 rounded-xl flex items-center justify-center">
          <IconComponent className="w-6 h-6 text-[#7AE5C6]" />
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold mb-3 text-white">
        {feature.title}
      </h3>
      <p className="text-gray-300 mb-4 leading-relaxed text-sm">
        {feature.description}
      </p>

      {/* Tags - Mobile optimized */}
      <div className="flex flex-wrap gap-2">
        {feature.tags.map((tag, tagIndex) => (
          <span
            key={tagIndex}
            className="px-3 py-1 bg-white/90 text-black text-xs rounded-full border border-black/20 shadow-sm font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

interface WaitingListFeaturesMobileProps {
  content: any;
  variant: WaitlistVariant;
}

export const WaitingListFeaturesMobile: React.FC<WaitingListFeaturesMobileProps> = ({ content, variant }) => {
  return (
    <section className="relative py-16 text-white" style={{ background: 'linear-gradient(to bottom, rgb(17 24 39), rgb(0 0 0))' }}>
      <div className="relative mx-auto max-w-4xl px-4">
        {/* Header - Mobile optimized */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white leading-tight">
            {content.FEATURES_CONTENT.title}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-base px-2">
            {content.FEATURES_CONTENT.subtitle}
          </p>
        </div>

        {/* Features Grid - Mobile optimized single column */}
        <div className="grid grid-cols-1 gap-6">
          {content.FEATURES_CONTENT.features.map((feature: any, index: number) => {
            const IconComponent = featureIcons[index];
            return (
              <FeatureCardMobile
                key={index}
                feature={feature}
                icon={IconComponent}
              />
            );
          })}
        </div>
        
        {/* Mobile CTA hint */}
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7AE5C6]/10 border border-[#7AE5C6]/30 px-4 py-2">
            <div className="w-2 h-2 bg-[#7AE5C6] rounded-full animate-pulse"></div>
            <span className="text-[#7AE5C6] text-sm font-medium">
              Ready to get started?
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};