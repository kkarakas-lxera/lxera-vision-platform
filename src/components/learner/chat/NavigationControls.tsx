import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationControlsProps {
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canSkip: boolean;
  onBack: () => void;
  onSkip: () => void;
  onMenuClick: () => void;
  stepName?: string;
}

export default function NavigationControls({
  currentStep,
  totalSteps,
  canGoBack,
  canSkip,
  onBack,
  onSkip,
  onMenuClick,
  stepName
}: NavigationControlsProps) {
  return (
    <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between p-3">
        {/* Left side - Back button */}
        <div className="flex-1">
          {canGoBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>

        {/* Center - Step indicator */}
        <div className="flex-1 text-center">
          <div className="text-xs text-gray-500 mb-1">
            Step {currentStep} of {totalSteps}
          </div>
          {stepName && (
            <div className="text-sm font-medium text-gray-900">
              {stepName}
            </div>
          )}
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  scale: i + 1 === currentStep ? 1.2 : 1,
                  opacity: i + 1 <= currentStep ? 1 : 0.3
                }}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i + 1 < currentStep && "bg-green-500",
                  i + 1 === currentStep && "bg-blue-600",
                  i + 1 > currentStep && "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>

        {/* Right side - Skip and Menu buttons */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {canSkip && currentStep < totalSteps && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="gap-1"
            >
              Skip
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={onMenuClick}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}