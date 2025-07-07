import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, CheckCircle } from 'lucide-react';

interface PracticalExerciseProps {
  moduleId: string;
  employeeId: string;
  onComplete: () => void;
  currentProgress?: any;
}

export default function PracticalExercise({ moduleId, employeeId, onComplete, currentProgress }: PracticalExerciseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Practical Exercise: Create a Basic Performance Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
          <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">🎯 Objective:</h3>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Create a basic performance report using spreadsheet software.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">📝 Steps Checklist:</h4>
          <div className="space-y-2">
            {[
              'Gather Data - Collect sales, costs, market data',
              'Create Spreadsheet - Input collected data',
              'Calculate Key Metrics - Use formulas for margins/profit',
              'Generate Charts - Create visual representations',
              'Summarize Findings - Write brief analysis',
              'Review - Check calculations and visuals'
            ].map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">📎 Required Deliverables:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Completed spreadsheet file</li>
            <li>• Summary report (300-500 words)</li>
            <li>• At least 2 charts/graphs</li>
          </ul>
        </div>

        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <p className="text-sm font-medium">Upload Your Files</p>
                <p className="text-xs text-muted-foreground">Drag files here or click to browse</p>
              </div>
              <Button variant="outline">Browse Files</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button variant="outline">Save Progress</Button>
          <Button>Submit Exercise</Button>
        </div>
      </CardContent>
    </Card>
  );
}