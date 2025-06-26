import React from 'react';
import { Upload, Users, BarChart3, Download, Plus, FileSpreadsheet } from 'lucide-react';
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
      description: 'Import team members via CSV',
      action: onAddEmployees,
      enabled: true,
      variant: 'default' as const
    },
    {
      icon: Upload,
      title: 'Upload CVs',
      description: 'Bulk upload employee resumes',
      action: onUploadCVs,
      enabled: hasEmployees,
      variant: 'default' as const
    },
    {
      icon: BarChart3,
      title: 'Analyze Skills',
      description: 'Run AI-powered gap analysis',
      action: onAnalyzeSkills,
      enabled: hasEmployeesWithCVs,
      variant: 'default' as const
    },
    {
      icon: Download,
      title: 'Export Report',
      description: 'Download skills gap report',
      action: onExportReport,
      enabled: hasEmployeesWithAnalysis,
      variant: 'outline' as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Common tasks for employee onboarding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                onClick={action.action}
                disabled={!action.enabled}
                className="h-auto flex-col gap-2 py-3"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{action.title}</span>
              </Button>
            );
          })}
        </div>

        {/* Helpful tips */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Start by selecting a position in Step 1, then import employees. 
            This ensures accurate skills gap analysis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}