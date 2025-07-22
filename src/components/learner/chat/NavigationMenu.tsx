import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Clock, Lock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Step {
  id: number;
  name: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming' | 'locked';
  points?: number;
}

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  steps: Step[];
  currentStep: number;
  totalPoints: number;
  timeSpent: string;
  onStepClick: (stepId: number) => void;
}

export default function NavigationMenu({
  isOpen,
  onClose,
  steps,
  currentStep,
  totalPoints,
  timeSpent,
  onStepClick
}: NavigationMenuProps) {
  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'current':
        return <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'locked':
        return <Lock className="h-4 w-4 text-gray-300" />;
    }
  };

  const getStepStyles = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-900 cursor-pointer hover:bg-green-100';
      case 'current':
        return 'bg-blue-50 border-blue-300 text-blue-900';
      case 'upcoming':
        return 'bg-gray-50 border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-100';
      case 'locked':
        return 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Profile Progress</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium">{totalPoints} pts</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl">⏱️</span>
                  <span className="font-medium">{timeSpent}</span>
                </div>
              </div>
            </div>

            {/* Steps List */}
            <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
              {steps.map((step) => (
                <motion.button
                  key={step.id}
                  whileHover={{ scale: step.status !== 'locked' ? 1.02 : 1 }}
                  whileTap={{ scale: step.status !== 'locked' ? 0.98 : 1 }}
                  onClick={() => step.status !== 'locked' && onStepClick(step.id)}
                  disabled={step.status === 'locked'}
                  className={cn(
                    "w-full p-3 rounded-lg border-2 transition-all duration-200",
                    "flex items-center gap-3",
                    getStepStyles(step.status)
                  )}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                    {getStepIcon(step.status)}
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium opacity-60">Step {step.id}</span>
                      {step.points && step.status === 'completed' && (
                        <span className="text-xs font-bold text-green-600">+{step.points}</span>
                      )}
                    </div>
                    <p className="font-medium text-sm">{step.title}</p>
                  </div>
                  
                  {step.status !== 'locked' && (
                    <ChevronRight className="h-4 w-4 opacity-40" />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
              <div className="text-xs text-gray-600 text-center">
                Complete all steps to unlock your personalized learning path
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}