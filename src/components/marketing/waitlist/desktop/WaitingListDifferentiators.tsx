import React from 'react';
import { Diamond, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { GradientCard } from './GradientCard';
import { WaitlistVariant } from '../shared/contentSelector';

const iconMap = {
  'Turn skills into real results': Lightbulb,
  'Learn the skills in demand today': TrendingUp,
  'Learning made just for you': Diamond,
  'See your progress clearly': Target
};

interface WaitingListDifferentiatorsProps {
  content: any;
  variant: WaitlistVariant;
}

export const WaitingListDifferentiators: React.FC<WaitingListDifferentiatorsProps> = ({ content, variant }) => {
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
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-3 lg:text-4xl text-white">
            {content.DIFFERENTIATORS_CONTENT.title}
          </h2>
        </div>

        {/* Differentiators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.DIFFERENTIATORS_CONTENT.items.map((item: any, index: number) => (
            <GradientCard
              key={index}
              icon={iconMap[item.title as keyof typeof iconMap] || Diamond}
              title={item.title}
              description={item.description}
              variant="dark"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
