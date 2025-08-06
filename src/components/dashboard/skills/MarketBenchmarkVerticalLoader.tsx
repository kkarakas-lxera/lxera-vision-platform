import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Loader2, CheckCircle2, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketBenchmarkVerticalLoaderProps {
  isLoading: boolean;
  lastUpdate?: Date | null;
  isFirstLoad?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function MarketBenchmarkVerticalLoader({
  isLoading,
  lastUpdate,
  isFirstLoad = false,
  onRefresh,
  refreshing = false
}: MarketBenchmarkVerticalLoaderProps) {
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

  // Show regenerating state when refreshing
  if (refreshing) {
    return (
      <div className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 mb-4 animate-pulse">
        <div className="flex items-center gap-3">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <div>
            <span className="text-sm font-medium text-blue-900">Regenerating Market Benchmark...</span>
            <p className="text-xs text-blue-700 mt-0.5">Analyzing latest market data and recalculating all metrics</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show minimal status bar when not loading
  if (!isLoading) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          <span className="text-xs text-gray-500">
            Data cached • Updated <span className="font-medium text-gray-700">
              {lastUpdate ? formatLastUpdate(lastUpdate) : 'never'}
            </span>
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            <RefreshCcw className="h-3 w-3" />
            Refresh
          </button>
        )}
      </div>
    );
  }

  // Show vertical loading state
  return (
    <Card className="mb-6">
      <CardContent className="py-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Icon and spinner */}
          <div className="relative">
            <Brain className="h-12 w-12 text-gray-300" />
            <div className="absolute -bottom-1 -right-1">
              <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
          </div>

          {/* Loading text */}
          <div className="text-center space-y-1">
            <h3 className="text-sm font-medium text-gray-900">
              {isFirstLoad ? 'Generating Market Intelligence' : 'Refreshing Data'}
            </h3>
            <p className="text-xs text-gray-500">
              {isFirstLoad 
                ? 'This may take a moment for first-time analysis' 
                : 'Updating market benchmarks and insights'}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-150" />
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse delay-300" />
          </div>

          {/* Info text */}
          {isFirstLoad && (
            <p className="text-xs text-gray-400 text-center max-w-sm">
              Data will be cached for 7 days to improve performance on future visits
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}