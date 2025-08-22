import React from 'react';
import { Diamond, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { GradientCard } from './GradientCard';
import { GradientBackground } from '../../../ui/GradientBackground';
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

const softGradients = [
  "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
  "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)", 
  "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
  "linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fed7aa 100%)",
  "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
];

export const WaitingListDifferentiators: React.FC = () => {
  return (
    <GradientBackground 
      className="py-24 min-h-fit"
      gradients={softGradients}
      animationDuration={12}
      animationDelay={1}
      overlay={false}
    >
      <div className="w-full text-black relative">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold lg:text-5xl text-black">
            Why LXERA Is Different
          </h2>
        </div>

        {/* Differentiators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {differentiators.map((item, index) => (
            <GradientCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
              variant="light"
            />
          ))}
        </div>
        </div>
      </div>
    </GradientBackground>
  );
};
