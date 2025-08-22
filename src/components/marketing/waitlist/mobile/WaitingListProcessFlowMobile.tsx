import React, { useState } from 'react';
import { ArrowRight, UserPlus, Unlock, Wrench, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../ui/card';
import { PROCESS_FLOW_CONTENT } from '../shared/content';

const stepIcons = [ArrowRight, Unlock, Wrench, Users];

const CardDecorator = ({ children, isLight = false }: { children: React.ReactNode; isLight?: boolean }) => (
  <div aria-hidden className="relative mx-auto size-20 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
    <div className={`absolute inset-0 ${isLight ? '[--border:black]' : '[--border:white]'} bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:16px_16px] opacity-20`} />
    <div className={`absolute inset-0 m-auto flex size-10 items-center justify-center rounded-md border ${isLight ? 'border-black/25' : 'border-white/25'} bg-transparent`}>
      {children}
    </div>
  </div>
);

const ProcessStepCardMobile: React.FC<{
  step: typeof PROCESS_FLOW_CONTENT.steps[0];
  index: number;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ step, index, icon: IconComponent }) => {
  const [isPressed, setIsPressed] = useState(false);
  const isLight = step.bgColor === 'bg-white';

  return (
    <div className="relative flex items-start gap-6">
      {/* Step Number Circle */}
      <div className="w-10 h-10 bg-[#7AE5C6] rounded-full flex items-center justify-center text-black font-bold text-base z-10 flex-shrink-0">
        {index + 1}
      </div>

      {/* Content Card with mobile touch interactions */}
      <div className="flex-1">
        <Card 
          className={`group border-0 bg-gray-800/60 backdrop-blur-md text-white rounded-xl transition-all duration-200 shadow-lg ${
            isPressed ? 'scale-98' : 'scale-100'
          }`}
          onTouchStart={() => setIsPressed(true)}
          onTouchEnd={() => setIsPressed(false)}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
        >
          <CardHeader className="pb-2 px-4 pt-4">
            <CardDecorator isLight={isLight}>
              <IconComponent className={`size-4 ${step.iconColor}`} aria-hidden />
            </CardDecorator>
            <h3 className="mt-2 font-semibold text-sm text-white">
              {step.title}
            </h3>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <p className="text-gray-300 text-xs leading-relaxed">
              {step.description}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const WaitingListProcessFlowMobile: React.FC = () => {
  return (
    <section className="relative py-16 text-white overflow-hidden" style={{ background: 'linear-gradient(to bottom, rgb(17 24 39), rgb(0 0 0))' }}>
      <div className="relative z-10 mx-auto max-w-4xl px-4">
        {/* Header - Mobile optimized */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white leading-tight">
            {PROCESS_FLOW_CONTENT.title}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-base px-2">
            {PROCESS_FLOW_CONTENT.subtitle}
          </p>
        </div>

        {/* Mobile Timeline flow with touch-optimized cards */}
        <div className="relative">
          {/* Vertical Connecting Line for Mobile */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#7AE5C6]/50 via-[#7AE5C6]/30 to-[#7AE5C6]/50" />

          {/* Steps */}
          <div className="space-y-12">
            {PROCESS_FLOW_CONTENT.steps.map((step, index) => {
              const IconComponent = stepIcons[index];

              return (
                <ProcessStepCardMobile
                  key={index}
                  step={step}
                  index={index}
                  icon={IconComponent}
                />
              );
            })}
          </div>
        </div>

        {/* Mobile progress hint */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7AE5C6]/10 border border-[#7AE5C6]/30 px-4 py-2">
            <div className="w-2 h-2 bg-[#7AE5C6] rounded-full animate-pulse"></div>
            <span className="text-[#7AE5C6] text-sm font-medium">
              Simple 4-step process
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};