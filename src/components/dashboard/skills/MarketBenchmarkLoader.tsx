import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Users, Building2, CheckCircle2, Clock, RefreshCcw, Sparkles } from 'lucide-react';
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
  description: string;
  icon: React.FC<{ className?: string }>;
  duration: number; // in milliseconds
}

const loadingSteps: LoadingStep[] = [
  {
    id: 'fetch',
    label: 'Fetching Organization Data',
    description: 'Retrieving employee skills and department information',
    icon: Building2,
    duration: 1500
  },
  {
    id: 'analyze',
    label: 'Analyzing Market Trends',
    description: 'Comparing skills against industry benchmarks',
    icon: TrendingUp,
    duration: 2000
  },
  {
    id: 'ai',
    label: 'Generating AI Insights',
    description: 'Creating personalized strategic recommendations',
    icon: Brain,
    duration: 2500
  },
  {
    id: 'compile',
    label: 'Compiling Reports',
    description: 'Preparing department and employee analytics',
    icon: Users,
    duration: 1000
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
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-600">
              Last updated: <span className="font-medium text-gray-900">
                {lastUpdate ? formatLastUpdate(lastUpdate) : 'Never'}
              </span>
            </span>
            <span className="text-gray-600">
              Next update: <span className="font-medium text-gray-900">
                {formatNextUpdate(nextUpdateHours)}
              </span>
            </span>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh Now
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Loading Card */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Sparkles className="h-5 w-5 animate-pulse" />
                <h3 className="text-lg font-semibold">Generating Market Intelligence</h3>
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <p className="text-sm text-gray-600">
                Analyzing your organization against industry benchmarks
              </p>
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium text-blue-700">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>

            {/* Steps */}
            <div className="space-y-4 mt-8">
              {loadingSteps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                const isPending = index > currentStep;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg transition-all duration-300",
                      isActive && "bg-white/80 shadow-md border border-blue-200",
                      isComplete && "opacity-60",
                      isPending && "opacity-30"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isActive && "bg-blue-600 text-white animate-pulse",
                      isComplete && "bg-green-600 text-white",
                      isPending && "bg-gray-300 text-gray-500"
                    )}>
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className={cn(
                          "font-medium transition-colors",
                          isActive && "text-blue-900",
                          isComplete && "text-green-700",
                          isPending && "text-gray-500"
                        )}>
                          {step.label}
                        </h4>
                        {isActive && (
                          <span className="text-sm font-medium text-blue-600">
                            {Math.round(stepProgress)}%
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm",
                        isActive && "text-gray-700",
                        !isActive && "text-gray-500"
                      )}>
                        {step.description}
                      </p>
                      {isActive && (
                        <Progress value={stepProgress} className="h-1.5 mt-2" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fun Facts / Tips */}
            <div className="mt-6 p-4 bg-blue-100/50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    Did you know?
                  </p>
                  <p className="text-xs text-blue-700">
                    Our AI analyzes over 1,000 market data points to provide you with the most accurate skills benchmarks for your industry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton placeholders for the content that will appear */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-4/5"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}