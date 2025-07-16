import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OnboardingStepHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  step?: string;
  status?: 'active' | 'completed' | 'pending';
  className?: string;
}

export function OnboardingStepHeader({
  icon: Icon,
  title,
  description,
  step,
  status = 'active',
  className
}: OnboardingStepHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between py-4 border-b", className)}>
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          status === 'completed' ? "bg-green-100 text-green-600" :
          status === 'active' ? "bg-blue-100 text-blue-600" :
          "bg-gray-100 text-gray-600"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      
      {step && (
        <Badge 
          variant={status === 'completed' ? 'default' : 'outline'}
          className={cn(
            "text-xs",
            status === 'completed' && "bg-green-600 text-white"
          )}
        >
          {step}
        </Badge>
      )}
    </div>
  );
}