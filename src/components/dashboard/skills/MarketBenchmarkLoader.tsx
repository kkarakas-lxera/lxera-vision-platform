import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Users, CheckCircle2, RefreshCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketBenchmarkLoaderProps {
  isLoading: boolean;
  lastUpdate?: Date | null;
  nextUpdateHours?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
}

interface LoadingStep {
  id: string;
  label: string;
  icon: React.FC<{ className?: string }>;
  duration: number; // in milliseconds
}

const loadingSteps: LoadingStep[] = [
  {
    id: 'fetch',
    label: 'Fetching data',
    icon: Users,
    duration: 800
  },
  {
    id: 'analyze',
    label: 'Analyzing trends',
    icon: TrendingUp,
    duration: 1200
  },
  {
    id: 'ai',
    label: 'AI insights',
    icon: Brain,
    duration: 1500
  }
];

export function MarketBenchmarkLoader({
  isLoading,
  lastUpdate,
  nextUpdateHours = 336, // 14 days default
  onRefresh,
  refreshing = false
}: MarketBenchmarkLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!isLoading && !refreshing) {
      setCurrentStep(0);
      setStepProgress(0);
      setOverallProgress(0);
      return;
    }

    // Animate through steps
    let stepTimeout: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;
    
    const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
    const startTime = Date.now();

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const overall = Math.min((elapsed / totalDuration) * 100, 100);
      setOverallProgress(overall);

      // Calculate current step
      let accumulatedTime = 0;
      for (let i = 0; i < loadingSteps.length; i++) {
        const nextAccumulated = accumulatedTime + loadingSteps[i].duration;
        if (elapsed <= nextAccumulated) {
          setCurrentStep(i);
          const stepElapsed = elapsed - accumulatedTime;
          const stepProg = Math.min((stepElapsed / loadingSteps[i].duration) * 100, 100);
          setStepProgress(stepProg);
          break;
        }
        accumulatedTime = nextAccumulated;
      }

      if (overall < 100) {
        progressInterval = setTimeout(animateProgress, 50);
      }
    };

    animateProgress();

    return () => {
      clearTimeout(stepTimeout);
      clearTimeout(progressInterval);
    };
  }, [isLoading, refreshing]);

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const formatNextUpdate = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0 && remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  if (!isLoading && !refreshing) {
    // Show update status when not loading
    return (
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-500">
              Updated <span className="font-medium text-gray-700">
                {lastUpdate ? formatLastUpdate(lastUpdate) : 'never'}
              </span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">
              Next in <span className="font-medium text-gray-700">
                {formatNextUpdate(nextUpdateHours)}
              </span>
            </span>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            <RefreshCcw className="h-3 w-3" />
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Progress steps */}
        <div className="flex items-center gap-6">
          {loadingSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isComplete = index < currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  "flex items-center gap-2 transition-all duration-300",
                  isActive && "scale-105",
                  isComplete && "opacity-70",
                  isPending && "opacity-30"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                  isActive && "bg-blue-600 text-white animate-pulse",
                  isComplete && "bg-green-600 text-white",
                  isPending && "bg-gray-300 text-gray-500"
                )}>
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>

                {/* Label */}
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  isActive && "text-blue-700",
                  isComplete && "text-green-700",
                  isPending && "text-gray-400"
                )}>
                  {step.label}
                </span>

                {/* Connector line */}
                {index < loadingSteps.length - 1 && (
                  <div className="w-12 h-0.5 bg-gray-300 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Right side - Progress bar and percentage */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
            <span className="text-sm text-gray-600">Generating insights</span>
          </div>
          <div className="flex items-center gap-3">
            <Progress value={overallProgress} className="w-32 h-1.5" />
            <span className="text-sm font-medium text-blue-700 min-w-[3ch]">
              {Math.round(overallProgress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}