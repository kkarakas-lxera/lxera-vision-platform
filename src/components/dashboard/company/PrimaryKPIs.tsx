import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, Target, AlertTriangle, TrendingUp, GraduationCap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrimaryKPIsProps {
  totalEmployees: number;
  analysisCoveragePct: number; // 0-100
  skillsReadinessPct: number; // 0-100
  positionsWithGaps: number;
  criticalGaps: number;
  activeLearners: number;
  courseCompletionPct: number; // 0-100
  onNavigate: (path: string) => void;
  isTrial?: boolean;
}

const PrimaryKPIs: React.FC<PrimaryKPIsProps> = ({
  totalEmployees,
  analysisCoveragePct,
  skillsReadinessPct,
  positionsWithGaps,
  criticalGaps,
  activeLearners,
  courseCompletionPct,
  onNavigate,
  isTrial,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* Total Employees */}
      <Card className={cn('hover:shadow-sm transition-shadow cursor-pointer border-neutral-200 transition-transform hover:-translate-y-0.5', isTrial && 'bg-white/60 backdrop-blur-sm border-indigo-100')} onClick={() => onNavigate('/dashboard/employees')}>
        <CardHeader className="pb-1.5">
          <CardTitle className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center justify-between">
            Total Employees
            <Users className="h-3.5 w-3.5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-semibold tracking-[-0.01em]">{totalEmployees}</div>
        </CardContent>
      </Card>

      {/* Analysis Coverage */}
      <Card className={cn('hover:shadow-sm transition-shadow cursor-pointer border-neutral-200 transition-transform hover:-translate-y-0.5', isTrial && 'bg-white/60 backdrop-blur-sm border-indigo-100')} onClick={() => onNavigate('/dashboard/employees?tab=import')}>
        <CardHeader className="pb-1.5">
          <CardTitle className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center justify-between">
            Analysis Coverage
            <CheckCircle2 className="h-3.5 w-3.5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-semibold tracking-[-0.01em]">{analysisCoveragePct}%</div>
          <Progress value={analysisCoveragePct} className="mt-2 h-1.5" />
        </CardContent>
      </Card>

      {/* Skills Readiness */}
      <Card className={cn('hover:shadow-sm transition-shadow cursor-pointer border-neutral-200 transition-transform hover:-translate-y-0.5', isTrial && 'bg-white/60 backdrop-blur-sm border-indigo-100')} onClick={() => onNavigate('/dashboard/skills')}>
        <CardHeader className="pb-1.5">
          <CardTitle className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center justify-between">
            Skills Readiness
            <TrendingUp className="h-3.5 w-3.5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-semibold tracking-[-0.01em]">{skillsReadinessPct}%</div>
          <Progress value={skillsReadinessPct} className="mt-2 h-1.5" />
        </CardContent>
      </Card>

      {/* Positions with Gaps */}
      <Card className={cn('hover:shadow-sm transition-shadow cursor-pointer border-neutral-200 transition-transform hover:-translate-y-0.5', isTrial && 'bg-white/60 backdrop-blur-sm border-indigo-100')} onClick={() => onNavigate('/dashboard/employees')}>
        <CardHeader className="pb-1.5">
          <CardTitle className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center justify-between">
            Positions with Gaps
            <AlertTriangle className="h-3.5 w-3.5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-semibold tracking-[-0.01em]">{positionsWithGaps}</div>
        </CardContent>
      </Card>

      {/* Critical Gaps */}
      <Card className={cn('hover:shadow-sm transition-shadow cursor-pointer border-neutral-200 transition-transform hover:-translate-y-0.5', isTrial && 'bg-white/60 backdrop-blur-sm border-indigo-100')} onClick={() => onNavigate('/dashboard/employees')}>
        <CardHeader className="pb-1.5">
          <CardTitle className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center justify-between">
            Critical Gaps
            <Target className="h-3.5 w-3.5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-semibold tracking-[-0.01em]">{criticalGaps}</div>
        </CardContent>
      </Card>

      {/* Course Completion Rate */}
      <Card className={cn('hover:shadow-sm transition-shadow cursor-pointer border-neutral-200 transition-transform hover:-translate-y-0.5', isTrial && 'bg-white/60 backdrop-blur-sm border-indigo-100')} onClick={() => onNavigate('/dashboard/courses')}>
        <CardHeader className="pb-1.5">
          <CardTitle className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center justify-between">
            Course Completion
            <GraduationCap className="h-3.5 w-3.5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-semibold tracking-[-0.01em]">{courseCompletionPct}%</div>
          <div className="text-[11px] sm:text-xs text-muted-foreground mt-1">{activeLearners} active</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrimaryKPIs;


