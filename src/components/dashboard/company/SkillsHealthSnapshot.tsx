import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrainCircuit, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillsHealthSnapshotProps {
  grade: string;
  overallScore: number; // 0-100
  trend: number; // +/-
  analyzedCount: number;
  totalCount: number;
  onViewDetails: () => void;
  isTrial?: boolean;
}

const SkillsHealthSnapshot: React.FC<SkillsHealthSnapshotProps> = ({
  grade,
  overallScore,
  trend,
  analyzedCount,
  totalCount,
  onViewDetails,
  isTrial,
}) => {
  return (
    <Card className={cn('border border-neutral-200 bg-white')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-neutral-50 border border-neutral-200">
              <BrainCircuit className={cn('h-4 w-4 text-neutral-700')} />
            </div>
            <CardTitle className="text-base sm:text-lg font-semibold tracking-[-0.01em]">Skills Health</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs sm:text-sm font-semibold">
            Grade: {grade}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Overall Match</p>
            <p className="text-xl sm:text-2xl font-bold tracking-[-0.01em]">
              {overallScore}%
              {trend !== 0 && (
                <span className={cn('text-xs sm:text-sm ml-2', trend > 0 ? 'text-green-600' : 'text-red-600')}>
                  {trend > 0 ? `↑${trend}%` : `↓${Math.abs(trend)}%`}
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Analysis Coverage</p>
            <p className="text-xl sm:text-2xl font-bold tracking-[-0.01em]">
              {analyzedCount}/{totalCount}
            </p>
          </div>
          <div className="flex items-end md:items-start md:justify-end">
            <Button onClick={onViewDetails} size="sm">
              View Detailed Analytics
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsHealthSnapshot;


