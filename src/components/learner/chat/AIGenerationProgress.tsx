import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Sparkles } from 'lucide-react';

interface AIGenerationProgressProps {
  stage: 'analyzing' | 'generating' | 'finalizing';
  currentStep: 'challenges' | 'growth';
}

export default function AIGenerationProgress({ stage, currentStep }: AIGenerationProgressProps) {
  const stages = {
    analyzing: {
      icon: Brain,
      message: currentStep === 'challenges' 
        ? "Analyzing your role and experience..." 
        : "Reviewing your profile and goals...",
      progress: 33
    },
    generating: {
      icon: Sparkles,
      message: currentStep === 'challenges'
        ? "Generating personalized challenges based on your profile..."
        : "Creating growth opportunities tailored to your career path...",
      progress: 66
    },
    finalizing: {
      icon: Loader2,
      message: "Finalizing suggestions...",
      progress: 90
    }
  };

  const currentStage = stages[stage];
  const Icon = currentStage.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200 shadow-sm"
    >
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          animate={{ rotate: stage === 'generating' ? 360 : 0 }}
          transition={{ duration: 2, repeat: stage === 'generating' ? Infinity : 0, ease: "linear" }}
          className="flex-shrink-0"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Icon className={`h-6 w-6 ${stage === 'finalizing' ? 'animate-spin' : ''} text-purple-600`} />
          </div>
        </motion.div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">AI Analysis in Progress</h3>
          <p className="text-sm text-gray-600">{currentStage.message}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${currentStage.progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Analyzing profile data</span>
          <span>{currentStage.progress}%</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 flex items-center gap-2 text-xs text-gray-500"
      >
        <div className="flex gap-1">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 bg-purple-400 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="w-1 h-1 bg-purple-400 rounded-full"
          />
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            className="w-1 h-1 bg-purple-400 rounded-full"
          />
        </div>
        <span>Powered by AI</span>
      </motion.div>
    </motion.div>
  );
}