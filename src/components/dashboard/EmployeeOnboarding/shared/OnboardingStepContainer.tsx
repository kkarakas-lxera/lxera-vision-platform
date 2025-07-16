import React from 'react';
import { cn } from '@/lib/utils';

interface OnboardingStepContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function OnboardingStepContainer({
  children,
  className
}: OnboardingStepContainerProps) {
  return (
    <div className={cn(
      "space-y-6 p-6 bg-white rounded-lg border border-gray-200",
      className
    )}>
      {children}
    </div>
  );
}