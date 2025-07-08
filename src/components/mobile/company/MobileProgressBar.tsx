import React from 'react';
import { cn } from '@/lib/utils';

interface MobileProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  animated?: boolean;
  className?: string;
}

export const MobileProgressBar: React.FC<MobileProgressBarProps> = ({
  value,
  max = 100,
  label,
  size = 'md',
  variant = 'default',
  showValue = true,
  animated = true,
  className
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    danger: 'bg-red-500'
  };

  const getVariantByValue = (percent: number) => {
    if (percent >= 80) return 'success';
    if (percent >= 60) return 'warning';
    return 'danger';
  };

  const actualVariant = variant === 'default' ? getVariantByValue(percentage) : variant;

  return (
    <div className={cn("w-full", className)}>
      {/* Label and Value */}
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background */}
        <div className={cn(
          "w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
          sizeClasses[size]
        )}>
          {/* Progress Fill */}
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              variantClasses[actualVariant],
              animated && "animate-pulse"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Milestones/Markers */}
        <div className="absolute inset-0 flex items-center">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className="absolute w-px h-full bg-white/40"
              style={{ left: `${milestone}%` }}
            />
          ))}
        </div>
      </div>

      {/* Touch-friendly indicator */}
      <div className="relative mt-1">
        <div
          className={cn(
            "absolute top-0 w-3 h-3 -mt-1 -ml-1.5 rounded-full shadow-lg transition-all duration-300",
            variantClasses[actualVariant],
            "border-2 border-white dark:border-gray-800"
          )}
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
};