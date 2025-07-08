import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Circle, 
  Users, 
  Upload, 
  BarChart3, 
  Download,
  PlayCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'in_progress' | 'completed';
  action?: () => void;
  count?: number;
  estimatedTime?: string;
}

interface MobileOnboardingFlowProps {
  steps: OnboardingStep[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  onStepAction?: (stepId: string) => void;
}

export function MobileOnboardingFlow({
  steps,
  currentStep = 0,
  onStepChange,
  onStepAction
}: MobileOnboardingFlowProps) {
  const [activeStep, setActiveStep] = useState(currentStep);

  const handleStepChange = (stepIndex: number) => {
    setActiveStep(stepIndex);
    onStepChange?.(stepIndex);
  };

  const getStepStatus = (index: number) => {
    const step = steps[index];
    return step.status;
  };

  const getCompletedSteps = () => {
    return steps.filter(step => step.status === 'completed').length;
  };

  const getProgressPercentage = () => {
    return (getCompletedSteps() / steps.length) * 100;
  };

  const StepIndicator = ({ step, index, isActive }: { step: OnboardingStep; index: number; isActive: boolean }) => {
    const Icon = step.icon;
    const status = getStepStatus(index);
    
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all",
        isActive && "bg-blue-50 border-2 border-blue-200",
        !isActive && "bg-white border border-gray-200"
      )}>
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
          status === 'completed' && "bg-green-100 text-green-600",
          status === 'in_progress' && "bg-blue-100 text-blue-600",
          status === 'pending' && "bg-gray-100 text-gray-400"
        )}>
          {status === 'completed' ? (
            <Check className="h-5 w-5" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              "font-medium text-sm",
              isActive && "text-blue-900",
              !isActive && status === 'completed' && "text-green-800",
              !isActive && status === 'pending' && "text-gray-600"
            )}>
              {step.title}
            </h3>
            {step.count !== undefined && (
              <Badge variant="outline" className="text-xs">
                {step.count}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 mb-1">
            {step.description}
          </p>
          {step.estimatedTime && (
            <p className="text-xs text-gray-500">
              ⏱️ {step.estimatedTime}
            </p>
          )}
        </div>
        
        {status === 'completed' && (
          <div className="flex-shrink-0">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Onboarding Progress</CardTitle>
            <span className="text-sm text-gray-600">
              {getCompletedSteps()}/{steps.length} completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={getProgressPercentage()} className="h-2" />
          <p className="text-xs text-gray-600 mt-2">
            {getProgressPercentage().toFixed(0)}% of onboarding complete
          </p>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex items-center justify-between px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStepChange(Math.max(0, activeStep - 1))}
          disabled={activeStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <div className="flex items-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepChange(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === activeStep && "bg-blue-600 w-6",
                index !== activeStep && getStepStatus(index) === 'completed' && "bg-green-600",
                index !== activeStep && getStepStatus(index) !== 'completed' && "bg-gray-300"
              )}
            />
          ))}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleStepChange(Math.min(steps.length - 1, activeStep + 1))}
          disabled={activeStep === steps.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Current Step Detail */}
      <Card>
        <CardContent className="p-4">
          <StepIndicator 
            step={steps[activeStep]} 
            index={activeStep} 
            isActive={true}
          />
          
          {steps[activeStep].action && (
            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => onStepAction?.(steps[activeStep].id)}
                className="w-full"
                disabled={steps[activeStep].status === 'completed'}
              >
                {steps[activeStep].status === 'completed' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start {steps[activeStep].title}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Steps Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="cursor-pointer"
              onClick={() => handleStepChange(index)}
            >
              <StepIndicator 
                step={step} 
                index={index} 
                isActive={index === activeStep}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Predefined onboarding steps for employee management
export const createEmployeeOnboardingSteps = (
  employeeCount: number,
  cvCount: number,
  analyzedCount: number,
  actions: {
    onAddEmployees: () => void;
    onUploadCVs: () => void;
    onAnalyzeSkills: () => void;
    onExportReport: () => void;
  }
): OnboardingStep[] => {
  return [
    {
      id: 'add_employees',
      title: 'Add Employees',
      description: 'Import your team members via CSV upload',
      icon: Users,
      status: employeeCount > 0 ? 'completed' : 'pending',
      action: actions.onAddEmployees,
      count: employeeCount,
      estimatedTime: '5-10 min'
    },
    {
      id: 'upload_cvs',
      title: 'Upload CVs',
      description: 'Bulk upload employee resumes for analysis',
      icon: Upload,
      status: cvCount > 0 ? 'completed' : employeeCount > 0 ? 'in_progress' : 'pending',
      action: actions.onUploadCVs,
      count: cvCount,
      estimatedTime: '10-15 min'
    },
    {
      id: 'analyze_skills',
      title: 'Analyze Skills',
      description: 'Run AI-powered skills gap analysis',
      icon: BarChart3,
      status: analyzedCount > 0 ? 'completed' : cvCount > 0 ? 'in_progress' : 'pending',
      action: actions.onAnalyzeSkills,
      count: analyzedCount,
      estimatedTime: '15-30 min'
    },
    {
      id: 'export_report',
      title: 'Export Report',
      description: 'Download comprehensive skills gap report',
      icon: Download,
      status: analyzedCount > 0 ? 'in_progress' : 'pending',
      action: actions.onExportReport,
      estimatedTime: '2-5 min'
    }
  ];
};