
import { useEffect, useState } from "react";

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep?: number;
}

export const ProgressIndicator = ({ totalSteps, currentStep = 1 }: ProgressIndicatorProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress((currentStep / totalSteps) * 100);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentStep, totalSteps]);

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex justify-between text-sm text-business-black/60 mb-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
      <div className="w-full bg-future-green/20 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-future-green to-emerald transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};
