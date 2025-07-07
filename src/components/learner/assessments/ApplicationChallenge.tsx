import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Upload, Clock, Trophy, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

interface ApplicationChallengeProps {
  moduleId: string;
  employeeId: string;
  onComplete: () => void;
  currentProgress?: any;
  onBack?: () => void;
}

export default function ApplicationChallenge({ moduleId, employeeId, onComplete, currentProgress, onBack }: ApplicationChallengeProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [uploadedTasks, setUploadedTasks] = useState<Record<number, boolean>>({});

  const tasks = [
    {
      id: 1,
      name: 'Data Collection',
      weight: 30,
      description: 'Gather sales figures, production costs, customer feedback',
      uploadText: 'Raw data files (Excel/CSV)'
    },
    {
      id: 2,
      name: 'Analysis',
      weight: 30,
      description: 'Calculate profitability metrics and analyze customer sentiment',
      uploadText: 'Analysis spreadsheet'
    },
    {
      id: 3,
      name: 'Report Creation',
      weight: 20,
      description: 'Comprehensive report with charts and graphs',
      uploadText: 'Written report (PDF/Word)'
    },
    {
      id: 4,
      name: 'Presentation',
      weight: 20,
      description: 'PowerPoint summarizing key findings',
      uploadText: 'Presentation file'
    }
  ];

  const completedTasks = Object.values(uploadedTasks).filter(Boolean).length;
  const progressPercentage = Math.round((completedTasks / tasks.length) * 100);

  const toggleUpload = (taskId: number) => {
    setUploadedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Final Challenge</h3>
        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">3 days left</span>
        </div>
      </div>

      {/* Compact Badges */}
      <div className="flex gap-2">
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 text-xs">
          <Trophy className="h-3 w-3 mr-1" />
          40% weight
        </Badge>
        <Badge variant="outline" className="text-xs">
          Attempt 1/2
        </Badge>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      {/* Compact Scenario */}
      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3">
        <div className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">Scenario</div>
        <div className="text-sm text-purple-600 dark:text-purple-400">
          Analyze newly launched product performance and create a CEO presentation
        </div>
      </div>

      {/* Progressive Disclosure - Tasks */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="border rounded-lg">
            <button
              onClick={() => setExpandedSections(prev => ({ ...prev, [`task-${task.id}`]: !prev[`task-${task.id}`] }))}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <div className="flex items-center gap-3">
                {uploadedTasks[task.id] ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300"></div>
                )}
                <span className="text-sm font-medium">{task.id}. {task.name}</span>
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {task.weight}%
                </Badge>
              </div>
              {expandedSections[`task-${task.id}`] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {expandedSections[`task-${task.id}`] && (
              <div className="px-3 pb-3 space-y-3 border-t">
                <div className="text-sm text-muted-foreground">
                  {task.description}
                </div>
                
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 text-center">
                  <button
                    onClick={() => toggleUpload(task.id)}
                    className="w-full"
                  >
                    {uploadedTasks[task.id] ? (
                      <div className="text-green-600">
                        <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-xs">Uploaded</div>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                        <div className="text-xs text-muted-foreground">{task.uploadText}</div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progressive Disclosure - Rubric */}
      <div className="border rounded-lg">
        <button
          onClick={() => setExpandedSections(prev => ({ ...prev, rubric: !prev.rubric }))}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">Scoring Rubric</span>
          </div>
          {expandedSections.rubric ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.rubric && (
          <div className="px-3 pb-3 border-t">
            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
              <div>Data Accuracy: 30%</div>
              <div>Analytical Depth: 30%</div>
              <div>Report Clarity: 20%</div>
              <div>Presentation: 20%</div>
            </div>
          </div>
        )}
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
          Submit for Review
        </Button>
      </div>
    </div>
  );
}