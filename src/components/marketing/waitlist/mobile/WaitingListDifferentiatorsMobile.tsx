import React from 'react';
import { Diamond, TrendingUp, Lightbulb, Target } from 'lucide-react';
import { GradientCardMobile } from './GradientCardMobile';
import { WaitlistVariant } from '../shared/contentSelector';

const iconMap = {
  'From skills to business solutions': Lightbulb,
  'Always future-ready': TrendingUp,
  'Personalized, not generic': Diamond,
  'Clarity at every step': Target
};

interface WaitingListDifferentiatorsMobileProps {
  content: any;
  variant: WaitlistVariant;
}

export const WaitingListDifferentiatorsMobile: React.FC<WaitingListDifferentiatorsMobileProps> = ({ content, variant }) => {
  return (
    <section className="py-16 text-white relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, rgb(0 0 0), rgb(17 24 39))' }}>      
      <div className="relative mx-auto max-w-4xl px-4">
        {/* Heading - Mobile optimized */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white leading-tight">
            {content.DIFFERENTIATORS_CONTENT.title}
          </h2>
        </div>

        {/* Differentiators Grid - Mobile single column */}
        <div className="grid grid-cols-1 gap-6">
          {content.DIFFERENTIATORS_CONTENT.items.map((item: any, index: number) => (
            <GradientCardMobile
              key={index}
              icon={iconMap[item.title as keyof typeof iconMap] || Diamond}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};