import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ArrowRight, Target, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CriticalSkillsGap } from '@/types/common';

interface CriticalSkillsPanelProps {
  criticalGaps: CriticalSkillsGap[];
  className?: string;
}

export default function CriticalSkillsPanel({ criticalGaps, className }: CriticalSkillsPanelProps) {
  const navigate = useNavigate();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">Critical Skills Gaps</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm font-medium mb-1">What are Critical Skills Gaps?</p>
                  <p className="text-sm">
                    These are skills where employees have significantly low proficiency 
                    (below 40% match) compared to position requirements. Critical gaps 
                    directly impact productivity and should be addressed through immediate 
                    training or hiring.
                  </p>
                  <p className="text-sm mt-2">
                    <span className="font-medium">Severity levels:</span><br/>
                    • <span className="text-red-600">Critical:</span> &lt;40% proficiency<br/>
                    • <span className="text-orange-600">Moderate:</span> 40-70% proficiency<br/>
                    • <span className="text-green-600">Minor:</span> &gt;70% proficiency
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription>Skills requiring immediate attention</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard/skills/positions')}
          className="text-xs"
        >
          View All <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {criticalGaps.slice(0, 6).map((gap, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm">{gap.skill_name}</h4>
                <Badge variant="outline" className={`text-xs ${getSeverityColor(gap.gap_severity)}`}>
                  {gap.gap_severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>{gap.department}</span>
                  <span className="font-medium">{gap.employees_with_gap} employees affected</span>
                </div>
                <div className="text-xs text-gray-500">
                  {gap.employees_with_gap > 10 ? (
                    <span className="text-orange-600 font-medium">Consider group training</span>
                  ) : (
                    <span>Individual development</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {criticalGaps.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No critical skills gaps identified</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}