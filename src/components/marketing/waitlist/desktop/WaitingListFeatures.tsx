import React, { useRef } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion, useInView } from 'framer-motion';
import StaticBeamsBackground from '../StaticBeamsBackground';
import { Target, Zap, TrendingUp, Lightbulb, BarChart3, Brain } from 'lucide-react';
import { WaitlistVariant } from '../shared/contentSelector';

const iconMap = {
  'Spot skill gaps': Target,
  'Create training fast': Zap,
  'Fuel innovation': Lightbulb,
  'Track progress': TrendingUp,
  'Report ROI': BarChart3,
  'Stay future-ready': Brain
};

interface WaitingListFeaturesProps {
  content: any;
  variant: WaitlistVariant;
}

export const WaitingListFeatures: React.FC<WaitingListFeaturesProps> = ({ content, variant }) => {
  const featuresWithIcons = content.FEATURES_CONTENT.features.map((feature: any) => ({
    ...feature,
    icon: iconMap[feature.title as keyof typeof iconMap] || Target
  }));
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "100px" });
  return (
    <LazyMotion features={domAnimation}>
      <section ref={ref} className="relative py-16 text-white">
      {/* Static SVG beams background */}
      <StaticBeamsBackground className="pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 lg:text-4xl text-white">
            {content.FEATURES_CONTENT.title}
          </h2>
          <p className="text-white max-w-3xl mx-auto text-base">
            {content.FEATURES_CONTENT.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresWithIcons.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <m.div
                key={index}
                className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 hover:border-[#7AE5C6]/40 transition-all duration-300 shadow-lg"
                initial={shouldReduceMotion ? undefined : { opacity: 0, y: 30 }}
                animate={shouldReduceMotion ? undefined : (isInView ? { opacity: 1, y: 0 } : {})}
                transition={shouldReduceMotion ? undefined : { 
                  duration: 0.4, 
                  delay: index * 0.1,
                  ease: [0.25, 0.1, 0.25, 1] 
                }}
              >
                {/* Icon */}
                <div className="mb-4">
                  <div className="w-10 h-10 bg-[#7AE5C6]/20 rounded-xl flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-[#7AE5C6]" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-4 leading-snug text-sm">
                  {feature.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {feature.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 bg-stone-100/60 text-business-black text-xs rounded-full border border-stone-200/20 shadow-sm backdrop-blur-sm"
                      style={{ filter: 'blur(0.3px)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </m.div>
            );
          })}
        </div>
      </div>
      </section>
    </LazyMotion>
  );
};
