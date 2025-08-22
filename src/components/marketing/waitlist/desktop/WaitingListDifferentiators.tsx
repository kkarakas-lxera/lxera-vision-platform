import React from 'react';
import { Diamond, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { GradientCard } from './GradientCard';
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

export const WaitingListDifferentiators: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900 text-white relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7AE5C6]/10 via-transparent to-[#7AE5C6]/5" />
        {/* Teal glow extender to highlight cards and reach bottom */}
        <div aria-hidden className="absolute inset-x-0 top-0 bottom-0 pointer-events-none flex items-center justify-center">
          <div className="h-[120%] w-[80rem] max-w-[110vw] translate-y-10 lg:translate-y-24 bg-[#7AE5C6]/22 opacity-70 blur-[120px] rounded-[9999px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_55%,white_70%,transparent_100%)]" />
        </div>
      </div>
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold lg:text-5xl text-white">
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
            />
          ))}
        </div>
      </div>
    </section>
  );
};
