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

interface WaitingListDifferentiatorsProps {
  content: any;
  variant: WaitlistVariant;
}

export const WaitingListDifferentiators: React.FC<WaitingListDifferentiatorsProps> = ({ content, variant }) => {
  // Select features based on variant
  const features = variant === 'enterprise' ? b2bFeatures : b2cFeatures;
  
  return (
    <section className="relative py-16 bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Static gradient background matching ProcessFlow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-black via-slate-900 to-cyan-950/60">
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-[#7AE5C6]/5" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(122,229,198,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.1),transparent_40%)]" />
        </div>
      </div>
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-3 lg:text-4xl text-white">
            What Makes LXERA Different
          </h2>
          <p className="text-lg text-white/70">
            Compare the power of LXERA with the limits of traditional tools.
          </p>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="grid bg-black/20 border-b border-white/20" style={{ gridTemplateColumns: '1.6fr 0.7fr 0.7fr' }}>
            <div className="py-4 px-5">
              <span className="text-base font-semibold text-white">Features</span>
            </div>
            <div className="py-4 px-3 text-center border-l border-white/20 bg-[#7AE5C6]/15 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7AE5C6]/30 to-[#7AE5C6]/10"></div>
              <div className="relative">
                <img
                  src="https://finwsjdjo4tof45q.public.blob.vercel-storage.com/icon%20light%20only%20%281%29.png"
                  alt="LXERA"
                  className="h-5 w-auto mx-auto"
                />
              </div>
            </div>
            <div className="py-4 px-3 text-center border-l border-white/20">
              <span className="text-base font-medium text-white/60">Others</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {features.map((feature, index) => {
              // More random distribution for "Others" column indicators
              const randomPattern = [true, false, true, true, false, true, false, true, false, true];
              const isHalfFilled = randomPattern[index % randomPattern.length];
              
              return (
                <div key={index} className="grid hover:bg-white/5 transition-all duration-200" style={{ gridTemplateColumns: '1.6fr 0.7fr 0.7fr' }}>
                  <div className="py-3 px-5">
                    <span className="text-white/90 text-base leading-snug">{feature}</span>
                  </div>
                  <div className="py-3 px-3 text-center border-l border-white/10 bg-[#7AE5C6]/5 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7AE5C6]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                      <div className="w-6 h-6 bg-[#7AE5C6] rounded-full mx-auto shadow-lg"></div>
                    </div>
                  </div>
                  <div className="py-3 px-3 text-center border-l border-white/10">
                    <div className="w-6 h-6 mx-auto relative flex items-center justify-center">
                      {isHalfFilled ? (
                        // Half-filled orange circle
                        <>
                          <div className="w-6 h-6 bg-gray-600/30 rounded-full absolute inset-0"></div>
                          <div className="w-6 h-6 bg-orange-400/70 rounded-full absolute inset-0" style={{ clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)' }}></div>
                        </>
                      ) : (
                        // Empty red circle
                        <div className="w-6 h-6 border-2 border-red-400/70 rounded-full"></div>
                      )}
                    </div>
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
