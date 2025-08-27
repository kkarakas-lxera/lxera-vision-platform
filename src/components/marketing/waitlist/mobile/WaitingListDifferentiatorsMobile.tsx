import React from 'react';
import { WaitlistVariant } from '../shared/contentSelector';

// B2B Feature comparison data
const b2bFeatures = [
  'Position management engine defining competencies required per role',
  'Skills taxonomy engine mapped to roles and market dynamics',
  'Market intelligence engine tracking real-time skill demand trends',
  'Hyper-personalized learning journeys aligned with workforce strategy',
  'ROI reports demonstrating measurable organizational impact',
  'Real-time dashboards monitoring workforce capabilities and performance',
  'HRIS integration automating role-based learning pathways',
  'Adaptive gamification sustaining enterprise-wide learner engagement',
  'Innovation sandbox converting employee skills into business solutions',
  'Human-in-the-loop oversight ensuring accuracy, compliance, and trust'
];

// B2C Feature comparison data for personal variant
const b2cFeatures = [
  'Personalized learning paths built around your goals',
  'Position insights showing skills needed for your role',
  'Market intelligence revealing trending skills in real time',
  'AI nudges and tips to keep you progressing',
  'Quick skill checks highlighting what you\'re missing',
  'Gamification that keeps you motivated to finish',
  'Safe practice space to apply new skills',
  'Real-world projects turning learning into career moves',
  'Progress dashboards celebrating wins and milestones',
  'Shareable reports showcasing skills growth to recruiters'
];

interface WaitingListDifferentiatorsMobileProps {
  content: any;
  variant: WaitlistVariant;
}

// Reusable indicator components for strict alignment and future tweaks
type OthersIndicatorVariant = 'half' | 'empty';

const LxeraDot: React.FC = () => (
  <div className="w-5 h-5 bg-[#7AE5C6] rounded-full shadow-lg" />
);

const OthersIndicator: React.FC<{ variant: OthersIndicatorVariant }> = ({ variant }) => {
  if (variant === 'half') {
    return (
      <div className="relative w-5 h-5">
        <div className="w-5 h-5 bg-gray-600/30 rounded-full absolute inset-0"></div>
        <div className="w-5 h-5 bg-orange-400/70 rounded-full absolute inset-0" style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)' }}></div>
      </div>
    );
  }
  return <div className="w-5 h-5 border-2 border-red-400/70 rounded-full" />;
};

export const WaitingListDifferentiatorsMobile: React.FC<WaitingListDifferentiatorsMobileProps> = ({ content, variant }) => {
  // Select features based on variant
  const features = variant === 'enterprise' ? b2bFeatures : b2cFeatures;
  // Keep icon columns strictly sized to the visual indicator (1.25rem = 20px)
  const gridColumnsTight = '1fr 1.25rem 1.25rem';
  
  return (
    <section className="py-16 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, rgb(17 24 39), rgb(0 0 0))' }}>
      <div className="relative mx-auto max-w-4xl px-4">
        {/* Heading - Mobile optimized */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Why LXERA Is Different
          </h2>
          <p className="text-lg text-white/70 mt-4">
            Compare our comprehensive platform with traditional solutions
          </p>
        </div>

        {/* Feature Comparison Table - Mobile Version */}
        <div className="bg-white/10 rounded-2xl border border-white/30 overflow-hidden mx-2 shadow-xl backdrop-blur-none">
          {/* Mobile Table Header */}
          {variant === 'enterprise' ? (
            <div className="bg-white/15 border-b border-white/30 p-3">
              <div
                className="grid items-center gap-x-4"
                style={{ gridTemplateColumns: gridColumnsTight }}
              >
                <span className="text-sm font-semibold text-white">Features</span>
                <div className="flex items-center justify-center">
                  <img
                    src="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/icon%20light%20only%20%281%29.png"
                    alt="LXERA"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[10px] font-medium text-white/60">Others</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/15 border-b border-white/30 p-3">
              <div
                className="grid items-center gap-x-4"
                style={{ gridTemplateColumns: gridColumnsTight }}
              >
                <span className="text-sm font-semibold text-white">Features</span>
                <div className="flex items-center justify-center">
                  <img
                    src="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/icon%20light%20only%20%281%29.png"
                    alt="LXERA"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-[10px] font-medium text-white/60">Others</span>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Feature List */}
          <div className="divide-y divide-white/10">
            {features.map((feature, index) => {
              // Random pattern for "Others" column - matches desktop logic
              const randomPattern = [true, false, true, true, false, true, false, true, false, true];
              const isHalfFilled = randomPattern[index % randomPattern.length];
              
              if (variant === 'enterprise') {
                return (
                  <div key={index} className="p-4 hover:bg-white/5 transition-all duration-200">
                    <div
                      className="grid items-center gap-x-2"
                      style={{ gridTemplateColumns: gridColumnsTight }}
                    >
                      <span className="text-white/90 text-xs leading-snug">{feature}</span>
                      <div className="flex items-center justify-center"><LxeraDot /></div>
                      <div className="flex items-center justify-center"><OthersIndicator variant={isHalfFilled ? 'half' : 'empty'} /></div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={index} className="p-4 hover:bg-white/5 transition-all duration-200">
                  <div
                    className="grid items-center gap-x-2"
                    style={{ gridTemplateColumns: gridColumnsTight }}
                  >
                    <span className="text-white/90 text-xs leading-snug">{feature}</span>
                    <div className="flex items-center justify-center"><LxeraDot /></div>
                    <div className="flex items-center justify-center"><OthersIndicator variant={isHalfFilled ? 'half' : 'empty'} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};