import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OnboardingProgressBarProps {
  value: number;
  steps: {
    label: string;
    completed: boolean;
  }[];
  className?: string;
}

export function OnboardingProgressBar({
  value,
  steps,
  className
}: OnboardingProgressBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Progress</span>
        <span className="text-sm text-muted-foreground">{Math.round(value)}%</span>
      </div>
      
      <Progress value={value} className="h-2" />
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              step.completed ? "bg-green-500" : "bg-gray-300"
            )} />
            <span className={cn(
              "text-xs",
              step.completed ? "text-green-600" : "text-gray-500"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}