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
      description: 'Import via CSV',
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
      <CardHeader className="py-3 border-b">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </div>
        <CardDescription className="text-xs mt-1">
          Common onboarding tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={index}
                className={`relative ${!action.enabled ? 'opacity-50' : ''}`}
              >
                <Button
                  variant={action.primary ? "default" : "outline"}
                  onClick={action.action}
                  disabled={!action.enabled}
                  className="w-full h-auto flex flex-col items-center justify-center p-4 space-y-2"
                >
                  <Icon className="h-5 w-5" />
                  <div className="space-y-0.5 text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Helpful tip - more subtle */}
        <div className="mt-4 p-2.5 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Tip:</span> Start with position selection for accurate skills analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}