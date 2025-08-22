import React from 'react';
import { Diamond, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { GradientCardMobile } from './GradientCardMobile';
import { DIFFERENTIATORS_CONTENT } from '../shared/content';

const differentiators = [
  {
    icon: Diamond,
    title: 'AI, not generic',
    description: 'We use skills & needs.',
  },
  {
    icon: TrendingUp,
    title: 'Always future-ready',
    description: 'Real-time market data keeps skills relevant.',
  },
  {
    icon: Lightbulb,
    title: 'From skills to business solutions',
    description: 'Only platform to turn learning into innovation and impact.',
  },
  {
    icon: Target,
    title: 'Clarity at every step',
    description: 'Dashboards show measurable progress you can act on.',
  }
];

export const WaitingListDifferentiatorsMobile: React.FC = () => {
  return (
    <section className="py-16 bg-white text-black relative overflow-hidden">      
      <div className="relative mx-auto max-w-4xl px-4">
        {/* Heading - Mobile optimized */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black leading-tight">
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