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
        <span className="text-sm font-medium text-indigo-700">Progress</span>
        <span className="text-sm text-indigo-600">{Math.round(value)}%</span>
      </div>
      
      <div className="w-full bg-indigo-100 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              step.completed ? "bg-indigo-600" : "bg-indigo-200"
            )} />
            <span className={cn(
              "text-xs",
              step.completed ? "text-indigo-600" : "text-indigo-400"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}