import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  Info,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SkillBadge } from '@/components/dashboard/shared/SkillBadge';
import { UnifiedSkillsService } from '@/services/UnifiedSkillsService';

interface SkillGap {
  skill_name: string;
  skill_type?: string;
  required_level: number | string;  // Accept both for compatibility
  current_level: number | string | null;
  gap_severity: 'critical' | 'important' | 'minor';
  employees_affected: number;
  proficiency_gap?: number;
}

interface MobileSkillsGapCardProps {
  gap: SkillGap;
  totalEmployees: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  rank?: number;
}

export const MobileSkillsGapCard: React.FC<MobileSkillsGapCardProps> = ({
  gap,
  totalEmployees,
  isExpanded = false,
  onToggleExpand,
  rank
}) => {
  const [isLocalExpanded, setIsLocalExpanded] = useState(isExpanded);
  
  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setIsLocalExpanded(!isLocalExpanded);
    }
  };

  const expanded = onToggleExpand ? isExpanded : isLocalExpanded;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'important':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'important':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'important':
        return 'bg-orange-500';
      case 'minor':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const affectedPercentage = Math.round((gap.employees_affected / totalEmployees) * 100);
  const skillTypeLabel = gap.skill_type.replace('_', ' ').charAt(0).toUpperCase() + 
                        gap.skill_type.replace('_', ' ').slice(1);

  return (
    <Card 
      className={cn(
        "transition-all duration-200 active:scale-[0.98]",
        expanded && "shadow-md"
      )}
      onClick={handleToggle}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              {rank && (
                <span className="text-sm font-semibold text-muted-foreground mt-0.5">
                  #{rank}
                </span>
              )}
              <div className="flex-1">
                <SkillBadge 
                  skill={{
                    skill_name: gap.skill_name,
                    proficiency_level: UnifiedSkillsService.convertToStandard(gap.required_level)
                  }}
                  showProficiency={true}
                  size="md"
                  className="mb-1"
                />
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {skillTypeLabel}
                  </Badge>
                  <Badge className={cn("text-xs", getSeverityColor(gap.gap_severity))}>
                    <span className="flex items-center gap-1">
                      {getSeverityIcon(gap.gap_severity)}
                      {gap.gap_severity}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Employees affected</span>
            <span className="font-medium">{gap.employees_affected} ({affectedPercentage}%)</span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <Progress 
              value={affectedPercentage} 
              className="h-2"
            />
            <div 
              className={cn(
                "absolute inset-0 h-2 rounded-full opacity-80 transition-all",
                getProgressColor(gap.gap_severity)
              )}
              style={{ width: `${affectedPercentage}%` }}
            />
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-3">
            {/* Required vs Current Level */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  <span>Required Level</span>
                </div>
                <p className="text-sm font-medium">{gap.required_level}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Current Average</span>
                </div>
                <p className="text-sm font-medium">
                  {gap.current_level || 'Not assessed'}
                </p>
              </div>
            </div>

            {/* Impact Analysis */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 space-y-2">
              <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Impact Analysis
              </h5>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <Users className="h-3 w-3 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {affectedPercentage}% of workforce lacks this skill
                  </span>
                </div>
                {gap.proficiency_gap && (
                  <div className="flex items-center gap-2 text-xs">
                    <Target className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Average proficiency gap: {gap.proficiency_gap} levels
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Recommendations */}
            {gap.gap_severity === 'critical' && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <p className="text-xs text-red-800 dark:text-red-200">
                  <strong>Recommended Action:</strong> Immediate training required. 
                  Consider mandatory courses or workshops for affected employees.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};