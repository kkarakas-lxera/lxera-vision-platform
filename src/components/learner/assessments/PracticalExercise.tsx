import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface PracticalExerciseProps {
  moduleId: string;
  employeeId: string;
  onComplete: () => void;
  currentProgress?: any;
  onBack?: () => void;
}

export default function PracticalExercise({ moduleId, employeeId, onComplete, currentProgress, onBack }: PracticalExerciseProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const steps = [
    'Gather Data - Collect sales, costs, market data',
    'Create Spreadsheet - Input collected data', 
    'Calculate Key Metrics - Use formulas for margins/profit',
    'Generate Charts - Create visual representations',
    'Summarize Findings - Write brief analysis',
    'Review - Check calculations and visuals'
  ];

  const deliverables = [
    'Completed spreadsheet file',
    'Summary report (300-500 words)',
    'At least 2 charts/graphs'
  ];

  const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
  const progressPercentage = Math.round((completedSteps / steps.length) * 100);

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Practical Exercise</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {completedSteps}/{steps.length}
          </Badge>
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">45 min</span>
        </div>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      {/* Compact Objective */}
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
        <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Objective</div>
        <div className="text-sm text-blue-600 dark:text-blue-400">
          Create a basic performance report using spreadsheet software
        </div>
      </div>

      {/* Progressive Disclosure - Steps */}
      <div className="border rounded-lg">
        <button
          onClick={() => setExpandedSections(prev => ({ ...prev, steps: !prev.steps }))}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Steps Checklist</span>
            <Badge variant="outline" className="text-xs px-1 py-0">
              {completedSteps}/{steps.length}
            </Badge>
          </div>
          {expandedSections.steps ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.steps && (
          <div className="px-3 pb-3 space-y-2 border-t">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <button
                  onClick={() => toggleStep(index)}
                  className={`mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center text-xs transition-colors ${
                    checkedSteps[index] 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {checkedSteps[index] && '✓'}
                </button>
                <span className={`text-sm ${checkedSteps[index] ? 'line-through text-muted-foreground' : ''}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progressive Disclosure - Deliverables */}
      <div className="border rounded-lg">
        <button
          onClick={() => setExpandedSections(prev => ({ ...prev, deliverables: !prev.deliverables }))}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Required Deliverables</span>
          </div>
          {expandedSections.deliverables ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.deliverables && (
          <div className="px-3 pb-3 space-y-2 border-t">
            {deliverables.map((deliverable, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <span>{deliverable}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compact File Upload */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
        <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <div className="text-sm font-medium mb-1">Upload Files</div>
        <div className="text-xs text-muted-foreground mb-3">Drag files or click to browse</div>
        <Button variant="outline" size="sm">Choose Files</Button>
      </div>

      {/* Compact Actions */}
      <div className="flex gap-2 pt-2">
        <Button onClick={onBack} variant="outline" size="sm">
          Back
        </Button>
        <Button variant="outline" size="sm">
          Save Draft
        </Button>
        <Button size="sm" className="flex-1" disabled={progressPercentage < 100}>
          Submit Exercise
        </Button>
      </div>
    </div>
  );
}