import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Target,
  TrendingUp,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillGap {
  skill_name: string;
  skill_type: string;
  required_level: string;
  current_level: string | null;
  gap_severity: 'critical' | 'important' | 'minor';
  employees_affected: number;
}

interface PositionAnalysis {
  position_title: string;
  position_code: string;
  total_employees: number;
  avg_gap_score: number;
  critical_gaps: number;
  top_gaps: SkillGap[];
}

interface MobilePositionSkillsChartProps {
  analysis: PositionAnalysis;
  onViewDetails?: () => void;
  isCompact?: boolean;
}

export const MobilePositionSkillsChart: React.FC<MobilePositionSkillsChartProps> = ({
  analysis,
  onViewDetails,
  isCompact = false
}) => {
  const [showAllGaps, setShowAllGaps] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'important':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const displayedGaps = showAllGaps ? analysis.top_gaps : analysis.top_gaps.slice(0, 3);

  return (
    <Card className={cn(
      "transition-all duration-200",
      !isCompact && "active:scale-[0.98]"
    )}>
      <CardHeader className={cn(
        "pb-3",
        isCompact && "p-4"
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {analysis.position_title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {analysis.position_code}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {analysis.total_employees} employees
              </Badge>
            </div>
          </div>
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn(
        "space-y-4",
        isCompact && "pt-0"
      )}>
        {/* Skills Match Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Skills Match Score</span>
            <div className="flex items-center gap-2">
              {getScoreIcon(analysis.avg_gap_score)}
              <span className={cn(
                "text-2xl font-bold",
                getScoreColor(analysis.avg_gap_score)
              )}>
                {analysis.avg_gap_score}%
              </span>
            </div>
          </div>
          <div className="relative">
            <Progress value={analysis.avg_gap_score} className="h-3" />
            <div 
              className={cn(
                "absolute inset-0 h-3 rounded-full opacity-80 transition-all",
                getProgressBarColor(analysis.avg_gap_score)
              )}
              style={{ width: `${analysis.avg_gap_score}%` }}
            />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <Target className="h-4 w-4 mx-auto text-gray-500 mb-1" />
            <p className="text-xs text-muted-foreground">Match Rate</p>
            <p className="text-sm font-semibold">{analysis.avg_gap_score}%</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <AlertTriangle className="h-4 w-4 mx-auto text-red-500 mb-1" />
            <p className="text-xs text-muted-foreground">Critical Gaps</p>
            <p className="text-sm font-semibold text-red-600">{analysis.critical_gaps}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <TrendingUp className="h-4 w-4 mx-auto text-blue-500 mb-1" />
            <p className="text-xs text-muted-foreground">Total Gaps</p>
            <p className="text-sm font-semibold">{analysis.top_gaps.length}</p>
          </div>
        </div>

        {/* Skill Gaps List */}
        {analysis.top_gaps.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-gray-500" />
              Top Skill Gaps
            </h4>
            <div className="space-y-2">
              {displayedGaps.map((gap, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{gap.skill_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className="text-xs h-5"
                      >
                        {gap.required_level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {gap.employees_affected} affected
                      </span>
                    </div>
                  </div>
                  <Badge 
                    className={cn(
                      "text-xs ml-2",
                      getSeverityColor(gap.gap_severity)
                    )}
                  >
                    {gap.gap_severity}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Show More/Less Button */}
            {analysis.top_gaps.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllGaps(!showAllGaps);
                }}
                className="w-full text-xs"
              >
                {showAllGaps ? 'Show Less' : `Show ${analysis.top_gaps.length - 3} More`}
              </Button>
            )}
          </div>
        )}

        {/* Empty State */}
        {analysis.top_gaps.length === 0 && (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No skill gaps identified
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};