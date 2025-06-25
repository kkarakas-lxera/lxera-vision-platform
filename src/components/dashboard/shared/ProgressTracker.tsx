import React from 'react';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function ProgressTracker({
  steps,
  currentStep,
  orientation = 'horizontal',
  className
}: ProgressTrackerProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  const getStepIcon = (step: Step, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'error':
        return <Circle className="h-5 w-5 text-red-600" />;
      default:
        return (
          <Circle 
            className={cn(
              "h-5 w-5",
              index <= currentIndex ? "text-blue-600" : "text-gray-300"
            )} 
          />
        );
    }
  };

  const getStepStatus = (step: Step, index: number) => {
    if (step.status === 'completed') return 'completed';
    if (step.status === 'in_progress') return 'in_progress';
    if (step.status === 'error') return 'error';
    if (index <= currentIndex) return 'active';
    return 'inactive';
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          
          return (
            <div key={step.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                {getStepIcon(step, index)}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      'w-px h-8 mt-2',
                      status === 'completed' || (index < currentIndex) 
                        ? 'bg-blue-600' 
                        : 'bg-gray-300'
                    )}
                  />
                )}
              </div>
              <div className="flex-1 pb-8">
                <h3 
                  className={cn(
                    'font-medium text-sm',
                    status === 'active' || status === 'in_progress' 
                      ? 'text-foreground' 
                      : status === 'completed'
                      ? 'text-green-700'
                      : status === 'error'
                      ? 'text-red-700'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const status = getStepStatus(step, index);
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className="mb-2">
                {getStepIcon(step, index)}
              </div>
              <div className="text-center">
                <h3 
                  className={cn(
                    'font-medium text-sm',
                    status === 'active' || status === 'in_progress' 
                      ? 'text-foreground' 
                      : status === 'completed'
                      ? 'text-green-700'
                      : status === 'error'
                      ? 'text-red-700'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1 max-w-24">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  'flex-1 h-px mx-4',
                  status === 'completed' || (index < currentIndex) 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}