import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CVAnalysisProgressProps {
  status?: { status: string; message?: string };
  onComplete?: (extractedData?: any) => void;
  onDataReady?: () => void;
  forceComplete?: boolean;
  onRetry?: () => void;
}

const ANALYSIS_STEPS = [
  { id: 1, label: "📥 Uploading document", duration: 2000 },
  { id: 2, label: "🔍 Extracting information", duration: 8000 },
  { id: 3, label: "💼 Processing work experience", duration: 6000 },
  { id: 4, label: "🎓 Identifying education", duration: 4000 },
  { id: 5, label: "⚡ Analyzing skills", duration: 5000 }
];

export default function CVAnalysisProgress({ status, onComplete, onDataReady, forceComplete, onRetry }: CVAnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Handle completed state effect
  useEffect(() => {
    if (status?.status === 'completed' && onComplete) {
      onComplete();
    }
  }, [status?.status, onComplete]);

  // Handle error states
  if (status?.status === 'failed' || status?.status === 'timeout') {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-900">
              {status.status === 'timeout' ? 'Analysis timed out' : 'Analysis failed'}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {status.message || 'The CV analysis encountered an error. Please try again.'}
            </p>
            {onRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={onRetry}
                className="mt-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Analysis
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle completed state
  if (status?.status === 'completed') {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <div>
            <h3 className="text-sm font-medium text-green-900">Analysis completed!</h3>
            <p className="text-sm text-green-700">Processing results...</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Only run animation if status is analyzing
    if (status?.status !== 'analyzing') return;

    let totalTime = 0;
    const timeouts: NodeJS.Timeout[] = [];
    
    ANALYSIS_STEPS.forEach((step, index) => {
      const timeout1 = setTimeout(() => {
        setCurrentStep(index + 1);
      }, totalTime);
      timeouts.push(timeout1);
      
      totalTime += step.duration;
      
      const timeout2 = setTimeout(() => {
        setCompletedSteps(prev => new Set(prev).add(step.id));
        
        // If this is the last step, call onComplete
        if (index === ANALYSIS_STEPS.length - 1) {
          const timeout3 = setTimeout(() => {
            onComplete?.();
          }, 1000);
          timeouts.push(timeout3);
        }
      }, totalTime - 500);
      timeouts.push(timeout2);
    });

    // Cleanup function to clear timeouts if component unmounts or status changes
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [status?.status, onComplete]);

  // Handle force complete from parent
  useEffect(() => {
    if (forceComplete) {
      // Complete all remaining steps immediately
      setCurrentStep(ANALYSIS_STEPS.length);
      setCompletedSteps(new Set(ANALYSIS_STEPS.map(step => step.id)));
      
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }
  }, [forceComplete, onComplete]);

  // Default to analyzing state
  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="text-sm font-medium text-blue-900 mb-3">
        Analyzing your CV... This usually takes 30-90 seconds.
      </div>
      
      <div className="space-y-2">
        {ANALYSIS_STEPS.map((step, index) => {
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
        We'll show you everything we find for review!
      </div>
    </div>
  );
}