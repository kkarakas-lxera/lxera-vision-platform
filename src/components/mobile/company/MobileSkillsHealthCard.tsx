import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  BrainCircuit, 
  ArrowRight, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Target
} from 'lucide-react';

interface SkillsHealthData {
  overallScore: number;
  grade: string;
  trend: number;
  criticalGaps: number;
  analyzedCount: number;
  totalCount: number;
}

interface MobileSkillsHealthCardProps {
  skillsHealth: SkillsHealthData;
  onViewDetails: () => void;
  isFreeTrialUser?: boolean;
}

const MobileSkillsHealthCard: React.FC<MobileSkillsHealthCardProps> = ({ skillsHealth, onViewDetails, isFreeTrialUser = false }) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B+':
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C+':
      case 'C':
        return 'text-orange-600 bg-orange-100';
      case 'D':
      case 'F':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <Target className="h-5 w-5 text-orange-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getStatusMessage = (score: number) => {
    if (score >= 90) return "Excellent skills alignment";
    if (score >= 80) return "Strong skills foundation";
    if (score >= 70) return "Good skills with some gaps";
    if (score >= 60) return "Moderate skills gaps";
    return "Significant skills gaps";
  };

  const analysisProgress = skillsHealth.totalCount > 0 ? (skillsHealth.analyzedCount / skillsHealth.totalCount) * 100 : 0;

  return (
    <Card className={cn(
      "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm",
      isFreeTrialUser && "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 bg-blue-600/10 rounded-lg",
              isFreeTrialUser && "bg-indigo-600/10"
            )}>
              <BrainCircuit className={cn(
                "h-6 w-6 text-blue-600",
                isFreeTrialUser && "text-indigo-600"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Skills Health</CardTitle>
              <p className="text-sm text-muted-foreground">Overall assessment</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "text-lg font-bold px-3 py-1",
              getGradeColor(skillsHealth.grade)
            )}
          >
            {skillsHealth.grade}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {getStatusIcon(skillsHealth.overallScore)}
            <span className="text-3xl font-bold">{skillsHealth.overallScore}%</span>
            {skillsHealth.trend > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+{skillsHealth.trend}%</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {getStatusMessage(skillsHealth.overallScore)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Overall Match</span>
            <span className="text-sm text-muted-foreground">Target: 80%</span>
          </div>
          <Progress 
            value={skillsHealth.overallScore} 
            className={cn(
              "h-3",
              skillsHealth.overallScore < 60 && "[&>div]:bg-red-500",
              skillsHealth.overallScore >= 60 && skillsHealth.overallScore < 80 && "[&>div]:bg-orange-500"
            )}
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Analysis</p>
            <p className="text-lg font-bold">{skillsHealth.analyzedCount}</p>
            <p className="text-xs text-muted-foreground">of {skillsHealth.totalCount}</p>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Critical Gaps</p>
            <p className={cn(
              "text-lg font-bold",
              skillsHealth.criticalGaps > 0 ? "text-red-600" : "text-green-600"
            )}>
              {skillsHealth.criticalGaps}
            </p>
            <p className="text-xs text-muted-foreground">urgent</p>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Improvement</p>
            <p className="text-lg font-bold text-blue-600">+18%</p>
            <p className="text-xs text-muted-foreground">90 days</p>
          </div>
        </div>

        {/* Analysis Coverage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Analysis Coverage</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(analysisProgress)}%
            </span>
          </div>
          <Progress value={analysisProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {skillsHealth.analyzedCount} of {skillsHealth.totalCount} employees analyzed
          </p>
        </div>

        {/* Recommendations */}
        <div className="bg-white/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm">Recommendations</h4>
          <div className="space-y-2">
            {skillsHealth.criticalGaps > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Address {skillsHealth.criticalGaps} critical skill gaps</span>
              </div>
            )}
            {skillsHealth.overallScore < 80 && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Focus on targeted training programs</span>
              </div>
            )}
            {analysisProgress < 100 && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Complete CV analysis for all employees</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onViewDetails}
          className={cn(
            "w-full",
            isFreeTrialUser && "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-800"
          )}
          size="lg"
        >
          View Detailed Analytics
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default MobileSkillsHealthCard;