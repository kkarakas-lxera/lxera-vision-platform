import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Target, TrendingUp } from 'lucide-react';

interface CareerPathSectionProps {
  employee: {
    position: string;
    current_position_title?: string;
    target_position_title?: string;
    skills_profile?: {
      skills_match_score: number;
      career_readiness_score: number;
    };
  };
}

export function CareerPathSection({ employee }: CareerPathSectionProps) {
  const currentPosition = employee.current_position_title || employee.position;
  const targetPosition = employee.target_position_title || 'Not set';
  const matchScore = employee.skills_profile?.skills_match_score || 0;
  const readinessScore = employee.skills_profile?.career_readiness_score || 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Career Path
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Position Path */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Badge variant="outline" className="mb-2">Current Position</Badge>
            <p className="font-medium text-lg">{currentPosition}</p>
          </div>
          
          <ArrowRight className="h-6 w-6 text-muted-foreground" />
          
          <div className="flex-1 text-right">
            <Badge variant="outline" className="mb-2 bg-blue-50">Target Position</Badge>
            <p className="font-medium text-lg">{targetPosition}</p>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Career Readiness</span>
              <span className={`text-sm font-bold ${getScoreColor(readinessScore)}`}>
                {readinessScore}%
              </span>
            </div>
            <Progress value={readinessScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Overall readiness for target position
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Skills Match</span>
              <span className={`text-sm font-bold ${getScoreColor(matchScore)}`}>
                {Math.round(matchScore)}%
              </span>
            </div>
            <Progress value={matchScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Current skills alignment with target position
            </p>
          </div>
        </div>

        {/* Insights */}
        {targetPosition !== 'Not set' && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Career Progress</p>
                <p className="text-blue-700 mt-1">
                  {matchScore >= 80 
                    ? "Excellent progress! You're well-positioned for advancement."
                    : matchScore >= 60
                    ? "Good progress. Focus on key skill gaps to reach your target."
                    : "Keep developing your skills. Consider targeted learning paths."}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}