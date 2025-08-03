import React from 'react';
import { Check, Circle, CircleDot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProfileStep {
  id: number;
  name: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProfileSidebarProps {
  steps: ProfileStep[];
  currentStep: number;
  employeeName: string;
  onStepClick: (stepId: number) => void;
}

export default function ProfileSidebar({
  steps,
  currentStep,
  employeeName,
  onStepClick
}: ProfileSidebarProps) {
  const getStepIcon = (status: string, isCurrent: boolean) => {
    if (status === 'completed') {
      return <Check className="h-4 w-4 text-green-600" />;
    } else if (isCurrent) {
      return <CircleDot className="h-4 w-4 text-primary animate-pulse" />;
    } else {
      return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="w-72 h-full bg-card border-r flex flex-col">
      {/* Profile Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {employeeName === 'there' ? 'Profile Setup' : employeeName}
            </h3>
            <p className="text-xs text-muted-foreground">
              Build your profile
            </p>
          </div>
        </div>
      </div>
      
      {/* Steps Navigation */}
      <div className="flex-1 p-6">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Profile Steps
        </h4>
        
        <TooltipProvider>
          <nav className="space-y-1">
            {steps.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isCurrent = step.status === 'current';
              const canNavigate = step.id <= currentStep;
              
              return (
                <Tooltip key={step.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => canNavigate && onStepClick(step.id)}
                      disabled={!canNavigate}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all duration-200 text-left group relative",
                        isCurrent && "bg-primary/10 text-primary font-medium shadow-sm",
                        !isCurrent && canNavigate && "hover:bg-muted hover:shadow-sm",
                        !canNavigate && "opacity-50 cursor-not-allowed",
                        isCurrent && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-l-lg"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Step Number */}
                        <span className={cn(
                          "text-xs font-medium w-5",
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        )}>
                          {index + 1}.
                        </span>
                        
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {getStepIcon(step.status, isCurrent)}
                        </div>
                        
                        {/* Step Title */}
                        <span className={cn(
                          "truncate",
                          canNavigate && "group-hover:text-foreground"
                        )}>
                          {step.title}
                        </span>
                      </div>
                    </button>
                  </TooltipTrigger>
                  {!canNavigate && (
                    <TooltipContent side="right">
                      <p className="text-xs">Complete the previous steps first</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>
      </div>
      
      {/* Progress Summary */}
      <div className="p-6 border-t">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium">
            {steps.filter(s => s.status === 'completed').length} of {steps.length}
          </span>
        </div>
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ 
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}