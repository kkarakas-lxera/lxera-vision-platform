import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';

interface AIResponsibilityGenerationProps {
  onComplete?: () => void;
  workExperiences: Array<{ title: string; company: string }>;
}

export default function AIResponsibilityGeneration({ onComplete, workExperiences }: AIResponsibilityGenerationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const GENERATION_STEPS = [
    { id: 1, label: "🤖 Analyzing your roles", duration: 2000 },
    { id: 2, label: "📝 Generating responsibilities", duration: 4000 },
    { id: 3, label: "🎯 Identifying key achievements", duration: 3000 },
    { id: 4, label: "🛠️ Detecting technologies used", duration: 2000 },
    { id: 5, label: "✨ Finalizing suggestions", duration: 1000 }
  ];

  useEffect(() => {
    let totalTime = 0;
    
    GENERATION_STEPS.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index + 1);
      }, totalTime);
      
      totalTime += step.duration;
      
      setTimeout(() => {
        setCompletedSteps(prev => new Set(prev).add(step.id));
        
        if (index === GENERATION_STEPS.length - 1) {
          setTimeout(() => {
            onComplete?.();
          }, 1000);
        }
      }, totalTime - 500);
    });
  }, [onComplete]);

  const totalPositions = workExperiences.length;
  const currentPosition = Math.min(
    Math.ceil((currentStep / GENERATION_STEPS.length) * totalPositions),
    totalPositions
  );

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="text-sm font-medium text-blue-900 mb-3">
        Generating AI-powered suggestions for your {totalPositions} position{totalPositions > 1 ? 's' : ''}...
      </div>
      
      {totalPositions > 1 && currentStep > 0 && (
        <div className="text-xs text-blue-700 mb-2">
          Processing: {workExperiences[currentPosition - 1]?.title} at {workExperiences[currentPosition - 1]?.company}
        </div>
      )}
      
      <div className="space-y-2">
        {GENERATION_STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = completedSteps.has(step.id);
          const isUpcoming = currentStep < step.id;
          
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
        This usually takes 10-15 seconds. I'll show you everything for review!
      </div>
    </div>
  );
}