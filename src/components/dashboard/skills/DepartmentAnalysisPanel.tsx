import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  ArrowRight,
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MarketGapBars from '@/components/dashboard/skills/MarketGapBars';
import type { DepartmentMarketGap } from '@/types/marketSkills';

interface DepartmentSummary {
  department: string;
  total_employees: number;
  analyzed_employees: number;
  avg_skills_match: number | null;
  critical_gaps: number;
  moderate_gaps: number;
  exceeding_targets: number;
}

interface HealthStatus {
  status: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface DepartmentAnalysisPanelProps {
  departmentSummaries: DepartmentSummary[];
  departmentMarketGaps: Record<string, DepartmentMarketGap>;
  expandedDepartments: Set<string>;
  setExpandedDepartments: React.Dispatch<React.SetStateAction<Set<string>>>;
  getDepartmentHealthStatus: (dept: DepartmentSummary) => HealthStatus;
  className?: string;
}

export default function DepartmentAnalysisPanel({
  departmentSummaries,
  departmentMarketGaps,
  expandedDepartments,
  setExpandedDepartments,
  getDepartmentHealthStatus,
  className
}: DepartmentAnalysisPanelProps) {
  const navigate = useNavigate();

  const toggleDepartmentExpansion = (department: string) => {
    setExpandedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(department)) {
        newSet.delete(department);
      } else {
        newSet.add(department);
      }
      return newSet;
    });
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Department Analysis</CardTitle>
          <CardDescription>Skills performance by department</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard/skills/employees')}
          className="text-xs"
        >
          View All <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {departmentSummaries.slice(0, 5).map((dept, index) => {
          const marketGap = departmentMarketGaps[dept.department];
          const isExpanded = expandedDepartments.has(dept.department);
          const health = getDepartmentHealthStatus(dept);
          const HealthIcon = health.icon;
          
          return (
            <div 
              key={index} 
              className="flex flex-col p-3 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => navigate(`/dashboard/skills/department/${encodeURIComponent(dept.department)}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{dept.department}</h4>
                    <div className="flex items-center gap-2">
                      {dept.analyzed_employees === dept.total_employees ? (
                        <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                          Full coverage
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-500">
                          {Math.round((dept.analyzed_employees / dept.total_employees) * 100)}% analyzed
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{dept.total_employees} people</span>
                      </div>
                      {dept.critical_gaps > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0">
                          {dept.critical_gaps} critical gaps
                        </Badge>
                      )}
                      {dept.moderate_gaps > 0 && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0 bg-orange-100 text-orange-700">
                          {dept.moderate_gaps} moderate
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge className={`${health.bgColor} ${health.color} ${health.borderColor} border text-xs px-1.5 py-0`}>
                      <HealthIcon className="h-3 w-3 mr-1" />
                      {health.label}
                    </Badge>
                    {dept.analyzed_employees < dept.total_employees && (
                      <span className="text-xs text-gray-500">
                        {dept.total_employees - dept.analyzed_employees} pending analysis
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 ml-3" />
              </div>
              
              {/* Market Gap Toggle */}
              {marketGap && marketGap.skills.length > 0 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDepartmentExpansion(dept.department);
                    }}
                    className="mt-2 flex items-center justify-between w-full text-xs text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      <Brain className="h-3 w-3" />
                      Market Skills Gap ({marketGap.skills.length} skills)
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  
                  {/* Expandable Market Gap Section */}
                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <MarketGapBars
                        skills={marketGap.skills}
                        industry={marketGap.industry}
                        className="text-xs"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}