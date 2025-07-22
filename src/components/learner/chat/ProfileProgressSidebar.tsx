import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Clock, Check, Lock, ChevronRight, Star, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Step {
  id: number;
  name: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  points?: number;
}

interface Achievement {
  id: string;
  name: string;
  points: number;
  icon: React.ReactNode;
  unlocked: boolean;
}

interface ProfileProgressSidebarProps {
  currentStep: number;
  totalSteps: number;
  points: number;
  streak: number;
  elapsedTime: number;
  steps: Step[];
  achievements: Achievement[];
  onStepClick: (stepId: number) => void;
}

export default function ProfileProgressSidebar({
  currentStep,
  totalSteps,
  points,
  streak,
  elapsedTime,
  steps,
  achievements,
  onStepClick
}: ProfileProgressSidebarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentStep / totalSteps) * 100;
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-3 w-3 text-green-600" />;
      case 'current':
        return <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />;
      case 'upcoming':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'locked':
        return <Lock className="h-3 w-3 text-gray-300" />;
    }
  };

  return (
    <div className="w-80 h-full bg-gradient-to-b from-blue-50 to-purple-50 border-l shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 bg-white/80 backdrop-blur-sm border-b">
        <div className="space-y-4">
          {/* Step Progress */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-sm font-medium text-gray-700">Progress</h3>
              <span className="text-xs text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {currentStep > 0 && currentStep <= steps.length && (
              <p className="text-sm font-semibold text-gray-900 mt-2">
                {steps[currentStep - 1]?.title}
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-900">{points}</p>
                  <p className="text-xs text-yellow-700">Points</p>
                </div>
              </div>
            </div>
            
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span className="font-mono">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
          Journey Steps
        </h4>
        <div className="space-y-2">
          {steps.map((step) => {
            const isClickable = step.status === 'completed' || step.status === 'current';
            
            return (
              <motion.button
                key={step.id}
                whileHover={isClickable ? { scale: 1.02 } : {}}
                whileTap={isClickable ? { scale: 0.98 } : {}}
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "w-full p-3 rounded-lg border transition-all duration-200",
                  "flex items-center gap-3 text-left",
                  step.status === 'completed' && "bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer",
                  step.status === 'current' && "bg-blue-50 border-blue-300 shadow-sm",
                  step.status === 'upcoming' && "bg-gray-50 border-gray-200",
                  step.status === 'locked' && "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center">
                  {getStepIcon(step.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Step {step.id}</p>
                  <p className="text-sm font-medium truncate">{step.title}</p>
                </div>
                
                {step.points && step.status === 'completed' && (
                  <span className="text-xs font-bold text-green-600">+{step.points}</span>
                )}
                
                {isClickable && (
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
          Achievements ({unlockedAchievements.length}/{achievements.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={false}
              animate={{
                opacity: achievement.unlocked ? 1 : 0.3,
                scale: achievement.unlocked ? 1 : 0.9
              }}
              whileHover={achievement.unlocked ? { scale: 1.1 } : {}}
              className={cn(
                "relative group",
                !achievement.unlocked && "grayscale"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
                {achievement.icon}
              </div>
              
              {/* Tooltip */}
              {achievement.unlocked && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-md px-2 py-1 whitespace-nowrap">
                    {achievement.name}
                    <div className="text-yellow-400 font-bold">+{achievement.points} pts</div>
                  </div>
                  <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final Message */}
      <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 text-center">
        <p className="text-xs text-gray-700">
          {currentStep === totalSteps 
            ? "🎉 Profile complete! Your personalized course awaits!"
            : "Complete all steps to unlock your learning path"}
        </p>
      </div>
    </div>
  );
}