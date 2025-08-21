import React from 'react';
import { ArrowRight, UserPlus, Unlock, Wrench, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import WhatsNextBackground from './WhatsNextBackground';

const steps = [
  {
    icon: ArrowRight,
    title: 'Sign up free',
    description: 'Join in minutes. No company setup. No credit card.',
    bgColor: 'bg-white',
    textColor: 'text-black',
    iconColor: 'text-black'
  },
  {
    icon: Unlock,
    title: 'Unlock full access',
    description: 'Get full access right away. Try skill insights, AI training, and dashboards.',
    bgColor: 'bg-gray-800',
    textColor: 'text-white',
    iconColor: 'text-[#7AE5C6]'
  },
  {
    icon: Wrench,
    title: 'See the difference',
    description: 'See how LXERA works and simplifies that you believe working your team.',
    bgColor: 'bg-white',
    textColor: 'text-black',
    iconColor: 'text-black'
  },
  {
    icon: Users,
    title: 'Bring everyone in',
    description: 'Coordinate with your company, invite and start training employees.',
    bgColor: 'bg-gray-800',
    textColor: 'text-white',
    iconColor: 'text-[#7AE5C6]'
  }
];

const CardDecorator = ({ children, isLight = false }: { children: React.ReactNode; isLight?: boolean }) => (
  <div aria-hidden className="relative mx-auto size-32 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
    <div className={`absolute inset-0 ${isLight ? '[--border:black]' : '[--border:white]'} bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20`} />
    <div className={`absolute inset-0 m-auto flex size-14 items-center justify-center rounded-md border ${isLight ? 'border-black/25' : 'border-white/25'} bg-transparent`}>
      {children}
    </div>
  </div>
);

export const WaitingListProcessFlow: React.FC = () => {
  return (
    <section className="relative py-24 bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <WhatsNextBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 lg:text-5xl text-white">
            What's Next
          </h2>
          <p className="text-white max-w-3xl mx-auto text-lg">
            Stop juggling tools. LXERA gives you one platform to bridge skill gaps, build training, and prove business impact.
          </p>
        </div>

        {/* Timeline flow with card-styled steps */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#7AE5C6]/50 via-[#7AE5C6]/30 to-[#7AE5C6]/50 transform -translate-x-1/2 hidden lg:block" />

          {/* Steps */}
          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isEven = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`relative flex flex-col items-center lg:grid lg:grid-cols-2 gap-8 lg:gap-16`}
                >
                  {/* Step Number Circle */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-[#7AE5C6] rounded-full flex items-center justify-center text-black font-bold text-lg z-10 hidden lg:flex">
                    {index + 1}
                  </div>

                  {/* Content Card wrapper */}
                  <div
                    className={`w-full flex ${
                      isEven
                        ? 'justify-center lg:justify-end lg:pr-8 lg:col-start-1'
                        : 'justify-center lg:justify-start lg:pl-8 lg:col-start-2'
                    }`}
                  >
                    <Card className={`group border-0 ${step.bgColor === 'bg-white' ? 'bg-white/90 text-black' : 'bg-gray-800/60 text-white'} backdrop-blur-md rounded-2xl max-w-[260px] mx-auto lg:mx-0`}>
                      <CardHeader className="pb-1 px-4 pt-4">
                        <div className="w-8 h-8 bg-[#7AE5C6] rounded-full flex items-center justify-center text-black font-bold text-sm mb-4 lg:hidden">
                          {index + 1}
                        </div>
                        <CardDecorator isLight={step.bgColor === 'bg-white'}>
                          <IconComponent className={`size-5 ${step.iconColor}`} aria-hidden />
                        </CardDecorator>
                        <h3 className={`mt-2 font-semibold text-base ${step.textColor === 'text-white' ? 'text-white' : 'text-black'}`}>{step.title}</h3>
                      </CardHeader>
                      <CardContent className="pt-0 px-4 pb-4">
                        <p className={`${step.textColor === 'text-white' ? 'text-gray-300' : 'text-gray-700'} text-xs leading-relaxed`}>{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
