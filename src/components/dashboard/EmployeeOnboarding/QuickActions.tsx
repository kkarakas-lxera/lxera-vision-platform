import React from 'react';
import { Upload, Users, BarChart3, Download, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAddEmployees: () => void;
  onUploadCVs: () => void;
  onAnalyzeSkills: () => void;
  onExportReport: () => void;
  hasEmployees: boolean;
  hasEmployeesWithCVs: boolean;
  hasEmployeesWithAnalysis: boolean;
}

export function QuickActions({
  onAddEmployees,
  onUploadCVs,
  onAnalyzeSkills,
  onExportReport,
  hasEmployees,
  hasEmployeesWithCVs,
  hasEmployeesWithAnalysis
}: QuickActionsProps) {
  const actions = [
    {
      icon: Users,
      title: 'Add Employees',
      description: 'Add team members',
      action: onAddEmployees,
      enabled: true,
      primary: true
    },
    {
      icon: Upload,
      title: 'Upload CVs',
      description: 'Bulk upload resumes',
      action: onUploadCVs,
      enabled: hasEmployees,
      primary: false
    },
    {
      icon: BarChart3,
      title: 'Analyze Skills',
      description: 'AI gap analysis',
      action: onAnalyzeSkills,
      enabled: hasEmployeesWithCVs,
      primary: false
    },
    {
      icon: Download,
      title: 'Export Report',
      description: 'Download CSV',
      action: onExportReport,
      enabled: hasEmployeesWithAnalysis,
      primary: false
    }
  ];

  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="py-2.5 border-b">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-muted-foreground" />
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.action}
                disabled={!action.enabled}
                className={`h-auto py-2.5 px-3 flex items-center gap-2 justify-start ${
                  !action.enabled ? 'opacity-50' : ''
                } ${action.primary && action.enabled ? 'border-primary' : ''}`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Simplified tip */}
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Start with position selection for accurate analysis
        </p>
      </CardContent>
    </Card>
  );
}