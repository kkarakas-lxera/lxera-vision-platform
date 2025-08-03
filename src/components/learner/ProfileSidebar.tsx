import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  return (
    <div className="w-64 h-full bg-card border-r">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2">My Profile</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Welcome, {employeeName}
        </p>
        
        <nav className="space-y-1">
          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const canNavigate = step.id <= currentStep;
            
            return (
              <button
                key={step.id}
                onClick={() => canNavigate && onStepClick(step.id)}
                disabled={!canNavigate}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-left",
                  isCurrent && "bg-primary/10 text-primary font-medium",
                  !isCurrent && canNavigate && "hover:bg-muted",
                  !canNavigate && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className={cn(
                      "h-4 w-4",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )} />
                  )}
                </div>
                <span className="truncate">{step.title}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}