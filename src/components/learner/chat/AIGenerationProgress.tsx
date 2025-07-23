import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface AIGenerationProgressProps {
  stage: 'analyzing' | 'generating' | 'finalizing';
  currentStep: 'challenges' | 'growth';
}

const GENERATION_STEPS = {
  challenges: [
    { id: 1, label: "🧠 Analyzing your role and experience", duration: 3000 },
    { id: 2, label: "💡 Identifying common challenges", duration: 4000 },
    { id: 3, label: "🎯 Personalizing suggestions", duration: 3000 }
  ],
  growth: [
    { id: 1, label: "📊 Reviewing your profile and goals", duration: 3000 },
    { id: 2, label: "🚀 Identifying growth opportunities", duration: 4000 },
    { id: 3, label: "✨ Tailoring recommendations", duration: 3000 }
  ]
};

export default function AIGenerationProgress({ stage, currentStep }: AIGenerationProgressProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const steps = GENERATION_STEPS[currentStep];
  
  useEffect(() => {
    // Map stage to step index
    const stageToStep = {
      'analyzing': 1,
      'generating': 2,
      'finalizing': 3
    };
    
    const targetStep = stageToStep[stage];
    setCurrentStepIndex(targetStep);
    
    // Mark previous steps as completed
    const completed = new Set<number>();
    for (let i = 1; i < targetStep; i++) {
      completed.add(i);
    }
    setCompletedSteps(completed);
  }, [stage]);

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="text-sm font-medium text-blue-900 mb-3">
        {currentStep === 'challenges' 
          ? "Let me think about some challenges professionals in your role might face..."
          : "Preparing growth opportunities based on your profile..."
        }
      </div>
      
      <div className="space-y-2">
        {steps.map((step) => {
          const isActive = currentStepIndex === step.id;
          const isCompleted = completedSteps.has(step.id);
          const isUpcoming = currentStepIndex < step.id;
          
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: isUpcoming ? 0.3 : 1,
                scale: isActive ? 1.02 : 1
              }}
              className={`flex items-center gap-3 p-2 rounded transition-all duration-300 ${
                isActive ? 'bg-blue-100 border border-blue-300' : 
                isCompleted ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                )}
              </div>
              
              <span className={`text-sm ${
                isCompleted ? 'text-green-700 line-through' : 
                isActive ? 'text-blue-700 font-medium' : 
                'text-gray-600'
              }`}>
                {step.label}
              </span>
              
              {isActive && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: step.duration / 1000, ease: 'linear' }}
                  className="ml-auto h-1 bg-blue-500 rounded-full"
                  style={{ maxWidth: '50px' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      
      <div className="text-xs text-gray-600 mt-3">
        This should only take a few seconds...
      </div>
    </div>
  );
}