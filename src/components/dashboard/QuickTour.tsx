import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

interface QuickTourProps {
  steps: TourStep[];
  onComplete: () => void;
}

export function QuickTour({ steps, onComplete }: QuickTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep]);

  const updatePosition = () => {
    const step = steps[currentStep];
    if (!step) return;

    const element = document.querySelector(step.target);
    if (!element) {
      // If element not found, try with data attribute
      const dataElement = document.querySelector(`[data-tab="${step.target.replace('[data-tab="', '').replace('"]', '')}"]`);
      if (dataElement) {
        const rect = dataElement.getBoundingClientRect();
        const placement = step.placement || 'bottom';
        
        let top = rect.top + window.scrollY;
        let left = rect.left + window.scrollX;

        switch (placement) {
          case 'bottom':
            top += rect.height + 10;
            left += rect.width / 2;
            break;
          case 'top':
            top -= 10;
            left += rect.width / 2;
            break;
          case 'left':
            top += rect.height / 2;
            left -= 10;
            break;
          case 'right':
            top += rect.height / 2;
            left += rect.width + 10;
            break;
        }

        setPosition({ top, left });
        setIsVisible(true);
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={handleSkip} />
      
      {/* Tour Card */}
      <Card
        className={cn(
          "fixed z-50 p-4 max-w-sm shadow-lg",
          "transform -translate-x-1/2",
          step.placement === 'top' && "-translate-y-full",
          step.placement === 'left' && "translate-x-0 -translate-y-1/2",
          step.placement === 'right' && "-translate-x-full -translate-y-1/2"
        )}
        style={{ top: position.top, left: position.left }}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <p className="text-sm text-gray-600 pr-4">{step.content}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-colors",
                    index === currentStep ? "bg-blue-600 w-6" : "bg-gray-300"
                  )}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}