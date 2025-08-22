import React from 'react';
import { ArrowRight, UserPlus, Unlock, Wrench, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../../ui/card';
import { PROCESS_FLOW_CONTENT } from '../shared/content';

const stepIcons = [ArrowRight, Unlock, Wrench, Users];

export const WaitingListProcessFlowMobile: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Mobile background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-[#7AE5C6]/5 via-transparent to-[#7AE5C6]/10" />
        <div className="absolute top-16 left-4 w-24 h-24 bg-[#7AE5C6]/20 rounded-full blur-2xl" />
        <div className="absolute bottom-16 right-4 w-20 h-20 bg-[#7AE5C6]/15 rounded-full blur-xl" />
      </div>

      <div className="relative px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white leading-tight">
            {PROCESS_FLOW_CONTENT.title}
          </h2>
          <p className="text-white text-base leading-relaxed px-2">
            {PROCESS_FLOW_CONTENT.subtitle}
          </p>
        </div>

        {/* Mobile-optimized vertical timeline */}
        <div className="relative">
          {/* Vertical connecting line - mobile */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#7AE5C6]/50 via-[#7AE5C6]/30 to-[#7AE5C6]/50" />

          {/* Steps */}
          <div className="space-y-8">
            {PROCESS_FLOW_CONTENT.steps.map((step, index) => {
              const IconComponent = stepIcons[index];
              const isLight = step.bgColor === 'bg-white';

              return (
                <div key={index} className="relative flex items-start gap-4">
                  {/* Step number circle */}
                  <div className="relative z-10 w-12 h-12 bg-[#7AE5C6] rounded-full flex items-center justify-center text-black font-bold text-lg flex-shrink-0">
                    {index + 1}
                  </div>

                  {/* Content card */}
                  <div className="flex-1">
                    <Card className={`${isLight ? 'bg-white/95 text-black' : 'bg-gray-800/80 text-white'} backdrop-blur-sm rounded-2xl border-0 shadow-lg`}>
                      <CardHeader className="pb-3 px-6 pt-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 ${isLight ? 'bg-gray-100' : 'bg-[#7AE5C6]/20'} rounded-lg flex items-center justify-center`}>
                            <IconComponent className={`w-4 h-4 ${isLight ? 'text-black' : 'text-[#7AE5C6]'}`} />
                          </div>
                          <h3 className={`font-semibold text-lg ${isLight ? 'text-black' : 'text-white'}`}>
                            {step.title}
                          </h3>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 px-6 pb-6">
                        <p className={`${isLight ? 'text-gray-700' : 'text-gray-300'} text-sm leading-relaxed`}>
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#7AE5C6]/10 border border-[#7AE5C6]/30 px-6 py-3">
            <div className="w-2 h-2 bg-[#7AE5C6] rounded-full animate-pulse"></div>
            <span className="text-[#7AE5C6] text-sm font-medium">
              Start your journey today
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};