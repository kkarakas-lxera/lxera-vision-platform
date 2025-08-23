import React from 'react';
import { Diamond, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { GradientCardMobile } from './GradientCardMobile';
import { DIFFERENTIATORS_CONTENT } from '../shared/content';

const differentiators = [
  {
    icon: Diamond,
    title: 'AI, not generic',
    description: 'Training isn\'t one-size-fits-all. LXERA adapts to real skills and actual needs.',
  },
  {
    icon: TrendingUp,
    title: 'Future-ready',
    description: 'We use real-time market data so skills stay current, relevant, and future-proof.',
  },
  {
    icon: Lightbulb,
    title: 'Skills to solutions',
    description: 'LXERA turns new skills into innovation, real outcomes, and measurable impact.',
  },
  {
    icon: Target,
    title: 'Clarity at every step',
    description: 'Dashboards make progress visible, actionable, and easy to share with leaders.',
  }
];

export const WaitingListDifferentiatorsMobile: React.FC = () => {
  return (
    <section className="py-16 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, rgb(0 0 0), rgb(17 24 39))' }}>      
      <div className="relative mx-auto max-w-4xl px-4">
        {/* Heading - Mobile optimized */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Why LXERA Is Different
          </h2>
        </div>

        {/* Differentiators Grid - Mobile single column */}
        <div className="grid grid-cols-1 gap-6">
          {differentiators.map((item, index) => (
            <GradientCardMobile
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};