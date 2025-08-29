import React from 'react';
import { Badge } from '../../../ui/badge';
import { WaitlistVariant } from '../shared/contentSelector';

interface WaitingListProcessFlowProps {
  content: any;
  variant: WaitlistVariant;
}

export const WaitingListProcessFlow: React.FC<WaitingListProcessFlowProps> = ({ content, variant }) => {
  return (
    <section className="relative py-16 text-white overflow-hidden" style={{
      background: 'linear-gradient(to bottom, rgb(17 24 39), rgb(0 0 0))'
    }}>
      {/* Background */}
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
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 lg:text-4xl text-white">
            {content.PROCESS_FLOW_CONTENT.title}
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            {content.PROCESS_FLOW_CONTENT.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="space-y-24">
          {(content.PROCESS_FLOW_CONTENT.features || content.PROCESS_FLOW_CONTENT.steps || []).map((feature: any, index: number) => (
            <div key={feature.id || index} className={`flex items-center gap-16 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
              {/* Image Side */}
              <div className="flex-1">
                <div className="relative">
                  <img 
                    src={feature.image} 
                    alt={feature.headline || feature.title}
                    className="w-full h-auto rounded-2xl"
                    style={{ boxShadow: 'none', filter: 'none' }}
                  />
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                    {feature.headline || feature.title}
                  </h3>
                  <p className="text-lg text-gray-300 leading-relaxed">
                    {feature.text || feature.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3">
                  {(feature.tags || []).map((tag: string, tagIndex: number) => (
                    <Badge 
                      key={tagIndex}
                      variant="secondary"
                      className="bg-[#7AE5C6]/10 text-[#7AE5C6] border-[#7AE5C6]/20 hover:bg-[#7AE5C6]/20 hover:text-white transition-colors px-3 py-1 text-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
