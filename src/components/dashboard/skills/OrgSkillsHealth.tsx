import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, AlertTriangle, Building2, TrendingUp } from 'lucide-react';

interface DepartmentSummary {
  department: string;
  total_employees: number;
  analyzed_employees: number;
  avg_skills_match: number | null;
  critical_gaps: number;
  moderate_gaps: number;
  exceeding_targets: number;
}

interface OverallStats {
  totalEmployees: number;
  analyzedEmployees: number;
  avgSkillsMatch: number;
  totalCriticalGaps: number;
  totalModerateGaps: number;
  departmentsCount: number;
}

interface HealthStatus {
  status: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface OrgSkillsHealthProps {
  overallStats: OverallStats;
  departmentSummaries: DepartmentSummary[];
  getDepartmentHealthStatus: (dept: Partial<DepartmentSummary>) => HealthStatus;
}

export default function OrgSkillsHealth({ 
  overallStats, 
  departmentSummaries, 
  getDepartmentHealthStatus 
}: OrgSkillsHealthProps) {
  const orgHealth = getDepartmentHealthStatus({
    department: 'Organization',
    total_employees: overallStats.totalEmployees,
    analyzed_employees: overallStats.analyzedEmployees,
    avg_skills_match: overallStats.avgSkillsMatch,
    critical_gaps: overallStats.totalCriticalGaps,
    moderate_gaps: overallStats.totalModerateGaps,
    exceeding_targets: 0
  });

  const HealthIcon = orgHealth.icon;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Organization Skills Health</CardTitle>
            <CardDescription>Comprehensive view of your workforce readiness</CardDescription>
          </div>
          <div className="text-right">
            <Badge className={`${orgHealth.bgColor} ${orgHealth.color} ${orgHealth.borderColor} border px-3 py-1.5`}>
              <HealthIcon className="h-4 w-4 mr-2" />
              <span className="font-semibold text-base">{orgHealth.label}</span>
            </Badge>
            <div className="text-sm text-gray-500 mt-1">Organization Health</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Coverage */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Coverage</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {overallStats.analyzedEmployees}/{overallStats.totalEmployees}
              </div>
              <div className="text-xs text-gray-500">employees analyzed</div>
              <Progress 
                value={overallStats.totalEmployees > 0 ? (overallStats.analyzedEmployees / overallStats.totalEmployees) * 100 : 0} 
                className="h-1"
              />
            </div>
          </div>

          {/* Skills Gaps */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Skills Gaps</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                {overallStats.totalCriticalGaps + overallStats.totalModerateGaps}
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-red-600 font-medium">{overallStats.totalCriticalGaps} critical</span>
                <span className="text-orange-600">{overallStats.totalModerateGaps} moderate</span>
              </div>
              {overallStats.totalCriticalGaps > 0 && (
                <div className="text-xs text-gray-500">Blocking productivity</div>
              )}
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Departments</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">{overallStats.departmentsCount}</div>
              <div className="text-xs text-gray-500">active teams</div>
              {overallStats.departmentsCount > 0 && (
                <div className="text-xs text-green-600">
                  {Math.round((departmentSummaries.filter(d => d.avg_skills_match !== null && d.avg_skills_match >= 70).length / overallStats.departmentsCount) * 100)}% meeting targets
                </div>
              )}
            </div>
          </div>

          {/* Estimated Impact */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Impact</span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-600">
                ${Math.round(overallStats.totalCriticalGaps * 2.5)}K
              </div>
              <div className="text-xs text-gray-500">potential savings</div>
              <div className="text-xs text-gray-500">via training vs hiring</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}