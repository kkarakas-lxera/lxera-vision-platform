import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameProgressProps {
  currentStep: number;
  totalSteps: number;
  points: number;
  streak?: number;
  timeRemaining?: number;
  className?: string;
}

export default function GameProgress({
  currentStep,
  totalSteps,
  points,
  streak = 0,
  timeRemaining,
  className
}: GameProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn(
      "bg-white border-b border-gray-200 px-4 py-3",
      className
    )}>
      {/* Progress Dots */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {currentStep}/{totalSteps}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-300",
                  index < currentStep
                    ? "bg-blue-600"
                    : "bg-gray-300"
                )}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          {/* Points */}
          <motion.div
            key={points}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1"
          >
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-bold text-gray-900">{points}</span>
          </motion.div>

          {/* Streak */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1"
            >
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">{streak}</span>
            </motion.div>
          )}

          {/* Timer */}
          {timeRemaining !== undefined && (
            <div className="flex items-center gap-1">
              <Timer className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600"
        />
      </div>
    </div>
  );
}