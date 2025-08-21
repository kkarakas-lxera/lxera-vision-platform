import React from 'react';
import LampHeader from './LampHeader';
import { Diamond, TrendingUp, Lightbulb, Target } from 'lucide-react';

const differentiators = [
  {
    icon: Diamond,
    title: 'AI, not generic',
    description: 'We use skills & needs.',
    gradient: 'from-blue-600 to-purple-600',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-300'
  },
  {
    icon: TrendingUp,
    title: 'Always future-ready',
    description: 'Real-time market data keeps skills relevant.',
    gradient: 'from-teal-500 to-green-500',
    iconBg: 'bg-teal-500/20',
    iconColor: 'text-teal-300'
  },
  {
    icon: Lightbulb,
    title: 'From skills to business solutions',
    description: 'Only platform to turn learning into innovation and impact.',
    gradient: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-300'
  },
  {
    icon: Target,
    title: 'Clarity at every step',
    description: 'Dashboards show measurable progress you can act on.',
    gradient: 'from-purple-600 to-pink-600',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-300'
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
        {/* Heading above lamp */}
        <div className="text-center mb-4">
          <h2 className="text-4xl font-bold lg:text-5xl text-white">
            Why LXERA Is Different
          </h2>
        </div>
        {/* Lamp glow without text */}
        <LampHeader className="mb-10">{null}</LampHeader>

        {/* Differentiators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {differentiators.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Card with gradient background */}
                <div className={`relative bg-gradient-to-br ${item.gradient} rounded-3xl p-8 h-full min-h-[300px] flex flex-col justify-between overflow-hidden`}>
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                      <IconComponent className={`w-7 h-7 ${item.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-4 text-white leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  {/* Description at bottom */}
                  <div className="relative z-10">
                    <p className="text-white/90 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
                  <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
