import React, { useRef } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion, useInView } from 'framer-motion';
import { Target, Zap, TrendingUp, Lightbulb, BarChart3, Brain } from 'lucide-react';
import { WaitlistVariant } from '../shared/contentSelector';

const iconMap = {
  'Analyze workforce skills': Target,
  'Fuel innovation': Lightbulb,
  'Prove ROI': BarChart3,
  // Legacy mappings for backward compatibility
  'Spot skill gaps': Target,
  'Create training fast': Zap,
  'Track progress': TrendingUp,
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
      <section ref={ref} className="relative py-16 text-white overflow-hidden" style={{
        background: 'linear-gradient(to bottom, rgb(17 24 39), rgb(0 0 0))'
      }}>
      {/* Static gradient background matching ProcessFlow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 w-full h-full" style={{
          background: 'linear-gradient(to bottom right, rgb(0 0 0), rgb(15 23 42), rgba(8 145 178 / 0.6))'
        }}>
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, rgba(0 0 0 / 0.7), transparent, rgba(122 229 198 / 0.05))'
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at top right, rgba(122,229,198,0.15), transparent 50%)'
          }} />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse at bottom left, rgba(20,184,166,0.1), transparent 40%)'
          }} />
        </div>
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featuresWithIcons.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <m.div
                key={index}
                className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 hover:border-[#7AE5C6]/40 transition-all duration-300 shadow-lg"
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
                <h3 className="text-xl font-semibold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed text-base">
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
