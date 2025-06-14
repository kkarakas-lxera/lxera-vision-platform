import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, Brain, BarChart3, Lightbulb, UserCheck, Cpu, TrendingUp, Rocket } from "lucide-react";
import { StepData } from "@/data/howItWorksSteps";
import { useState } from "react";

interface StepCardProps {
  step: StepData;
  index: number;
  isLast: boolean;
  layout: 'desktop' | 'mobile';
}

const iconMap = {
  Users,
  Brain,
  BarChart3,
  Lightbulb,
  UserCheck,
  Cpu,
  TrendingUp,
  Rocket
};

export const StepCard = ({ step, index, isLast, layout }: StepCardProps) => {
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const formatDescription = (desc: string) => {
    return desc.split('**').map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="font-semibold text-business-black">{part}</strong>;
      }
      return part;
    });
  };

  const MainIcon = iconMap[step.iconName as keyof typeof iconMap];
  const SubIcon = iconMap[step.subIconName as keyof typeof iconMap];

  if (layout === 'mobile') {
    return (
      <div className="relative animate-fade-in-up group" style={{ animationDelay: `${index * 0.2}s` }}>
        {/* Step Number Label (Huge, above everything else, only on mobile) */}
        <div className="flex flex-col items-center mb-3">
          <span className="text-4xl font-extrabold text-future-green leading-snug tracking-wide drop-shadow-sm">
            {step.step}
          </span>
        </div>
        {/* Step Title Badge */}
        <div className="mb-4 flex justify-center">
          <span className="inline-block px-4 py-2 bg-future-green/20 text-business-black font-semibold rounded-full text-sm border border-future-green/30 hover:bg-future-green/30 hover:scale-105 transition-all duration-300">
            {step.stepTitle}
          </span>
        </div>
        
        <Card className="bg-white border-0 lxera-shadow relative z-10 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group-hover:scale-102">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {/* Hide the step number inside the badge, only show icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-future-green to-future-green/80 rounded-full flex items-center justify-center mb-4 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:rotate-3">
                  <MainIcon className="w-8 h-8 text-business-black" />
                </div>
                <div className="text-future-green flex justify-center transition-all duration-300 hover:scale-125 hover:animate-pulse group-hover:text-emerald">
                  <SubIcon className="w-5 h-5" />
                </div>
              </div>
              
              <div className="flex-1">
                {/* Headline (title) */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-business-black group-hover:text-future-green transition-colors duration-300">{step.title}</h3>
                </div>
                <p className="text-business-black/70 leading-relaxed mb-4">
                  {formatDescription(step.desc)}
                </p>
                {step.metrics && (
                  <div className="text-sm text-future-green font-semibold mb-3">
                    ✓ {step.metrics}
                  </div>
                )}
                {step.cta && (
                  <Button size="sm" variant="outline" className="hover:bg-future-green/10">
                    <Play className="w-3 h-3 mr-1" />
                    {step.cta}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative z-10 animate-fade-in-up group" style={{ animationDelay: `${index * 0.2}s` }}>
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-2 bg-future-green/20 text-business-black font-semibold rounded-full text-sm border border-future-green/30 hover:bg-future-green/30 hover:scale-105 transition-all duration-300">
          {step.stepTitle}
        </span>
      </div>
      
      <Card 
        className="bg-white border-0 lxera-shadow h-full transition-all duration-500 hover:shadow-xl hover:-translate-y-2 group-hover:scale-105 relative overflow-hidden"
        onMouseEnter={() => setIsPreviewVisible(true)}
        onMouseLeave={() => setIsPreviewVisible(false)}
      >
        <CardContent className="p-8 text-center h-full flex flex-col">
          <div className="w-20 h-20 bg-gradient-to-br from-future-green to-future-green/80 rounded-full flex items-center justify-center mx-auto mb-6 relative shadow-lg hover:shadow-xl transition-all duration-300 group-hover:rotate-6">
            <span className="text-business-black font-bold text-xl">{step.step}</span>
            {!isLast && (
              <ArrowRight className="absolute -right-12 top-1/2 -translate-y-1/2 w-6 h-6 text-future-green animate-pulse group-hover:animate-bounce" />
            )}
          </div>
          
          <div className="text-future-green mb-6 flex justify-center transition-all duration-300 hover:scale-125 hover:animate-pulse group-hover:text-emerald">
            <MainIcon className="w-8 h-8" />
          </div>
          
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h3 className="text-xl font-bold text-business-black group-hover:text-future-green transition-colors duration-300">{step.title}</h3>
              <div className="text-future-green/70 transition-all duration-300 hover:scale-125 group-hover:animate-spin-slow">
                <SubIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-business-black/70 text-sm leading-relaxed flex-1 mb-4">
              {formatDescription(step.desc)}
            </p>
            
            {step.metrics && (
              <div className="text-xs text-future-green font-semibold mb-3 animate-fade-in">
                ✓ {step.metrics}
              </div>
            )}
            
            {step.cta && (
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-auto hover:bg-future-green/10 transition-all duration-300"
              >
                <Play className="w-3 h-3 mr-1" />
                {step.cta}
              </Button>
            )}
          </div>
          
          {/* Preview overlay */}
          {isPreviewVisible && (
            <div className="absolute inset-0 bg-future-green/5 flex items-center justify-center animate-fade-in">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                <div className="text-sm text-business-black font-medium">Preview Step {step.step}</div>
                <div className="text-xs text-business-black/70 mt-1">Interactive demo available</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
