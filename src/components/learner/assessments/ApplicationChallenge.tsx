import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Upload, Clock, Trophy } from 'lucide-react';

interface ApplicationChallengeProps {
  moduleId: string;
  employeeId: string;
  onComplete: () => void;
  currentProgress?: any;
}

export default function ApplicationChallenge({ moduleId, employeeId, onComplete, currentProgress }: ApplicationChallengeProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Application Challenge: CEO Performance Report
          </CardTitle>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Due in 3 days</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-purple-100 text-purple-700">
            <Trophy className="h-3 w-3 mr-1" />
            40% of Final Grade
          </Badge>
          <Badge variant="outline">1 of 2 attempts</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
          <h3 className="font-medium text-purple-700 dark:text-purple-300 mb-2">📋 Scenario:</h3>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            You are an analyst at a mid-sized company. The CEO wants a report on the performance 
            of a newly launched product. Your task is to analyze sales, costs, and market reception 
            over the first quarter and prepare a presentation for the next board meeting.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">📝 Required Tasks:</h4>
          
          <div className="space-y-3">
            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">1️⃣ Data Collection (30%)</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Gather sales figures, production costs, customer feedback
              </p>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Upload: Raw data files (Excel/CSV)</p>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">2️⃣ Analysis (30%)</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Calculate profitability metrics and analyze customer sentiment
              </p>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Upload: Analysis spreadsheet</p>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">3️⃣ Report Creation (20%)</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Comprehensive report with charts and graphs
              </p>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Upload: Written report (PDF/Word)</p>
              </div>
            </div>

            <div className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">4️⃣ Presentation (20%)</span>
                <Badge variant="outline">Pending</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                PowerPoint summarizing key findings
              </p>
              <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Upload: Presentation file</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
          <h4 className="font-medium text-amber-700 dark:text-amber-300 mb-2">📊 Scoring Rubric:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Data Accuracy: 30%</div>
            <div>Analytical Depth: 30%</div>
            <div>Clarity of Report: 20%</div>
            <div>Effectiveness of Presentation: 20%</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline">Save Draft</Button>
          <Button variant="outline">Request Extension</Button>
          <Button>Submit for Review</Button>
        </div>
      </CardContent>
    </Card>
  );
}