import React from 'react';
import { Upload, Users, BarChart3, Download, Plus, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ElementType;
  title: string;
  description: string;
  action: () => void;
  enabled: boolean;
  variant?: 'default' | 'outline' | 'secondary';
  color?: string;
  badge?: string;
}

interface MobileQuickActionsProps {
  onAddEmployees: () => void;
  onUploadCVs: () => void;
  onAnalyzeSkills: () => void;
  onExportReport: () => void;
  hasEmployees: boolean;
  hasEmployeesWithCVs: boolean;
  hasEmployeesWithAnalysis: boolean;
  employeeCount?: number;
  cvCount?: number;
  analyzedCount?: number;
}

export function MobileQuickActions({
  onAddEmployees,
  onUploadCVs,
  onAnalyzeSkills,
  onExportReport,
  hasEmployees,
  hasEmployeesWithCVs,
  hasEmployeesWithAnalysis,
  employeeCount = 0,
  cvCount = 0,
  analyzedCount = 0
}: MobileQuickActionsProps) {
  const actions: QuickAction[] = [
    {
      icon: Users,
      title: 'Add Employees',
      description: 'Import team members',
      action: onAddEmployees,
      enabled: true,
      color: 'bg-blue-50 text-blue-600',
      badge: employeeCount > 0 ? `${employeeCount} added` : undefined
    },
    {
      icon: Upload,
      title: 'Upload CVs',
      description: 'Bulk upload resumes',
      action: onUploadCVs,
      enabled: hasEmployees,
      color: 'bg-purple-50 text-purple-600',
      badge: cvCount > 0 ? `${cvCount} uploaded` : undefined
    },
    {
      icon: BarChart3,
      title: 'Analyze Skills',
      description: 'Run AI gap analysis',
      action: onAnalyzeSkills,
      enabled: hasEmployeesWithCVs,
      color: 'bg-green-50 text-green-600',
      badge: analyzedCount > 0 ? `${analyzedCount} analyzed` : undefined
    },
    {
      icon: Download,
      title: 'Export Report',
      description: 'Download skills report',
      action: onExportReport,
      enabled: hasEmployeesWithAnalysis,
      color: 'bg-orange-50 text-orange-600',
      variant: 'outline'
    }
  ];

  // Grid layout for quick actions
  const GridLayout = () => (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.action}
            disabled={!action.enabled}
            className={cn(
              "relative p-4 rounded-xl transition-all duration-200",
              "flex flex-col items-center justify-center text-center gap-2",
              "min-h-[120px] touch-manipulation",
              action.enabled 
                ? cn(action.color || 'bg-gray-50', 'active:scale-95 shadow-sm') 
                : 'bg-gray-50 opacity-50',
              "disabled:cursor-not-allowed"
            )}
          >
            <Icon className={cn(
              "h-8 w-8",
              !action.enabled && "text-gray-400"
            )} />
            <div className="space-y-1">
              <p className={cn(
                "font-medium text-sm",
                !action.enabled && "text-gray-500"
              )}>
                {action.title}
              </p>
              <p className={cn(
                "text-xs",
                action.enabled ? "text-gray-600" : "text-gray-400"
              )}>
                {action.description}
              </p>
            </div>
            {action.badge && action.enabled && (
              <Badge 
                variant="secondary" 
                className="absolute top-2 right-2 text-xs px-2 py-0.5"
              >
                {action.badge}
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );

  // List layout for quick actions (alternative view)
  const ListLayout = () => (
    <div className="space-y-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.action}
            disabled={!action.enabled}
            className={cn(
              "w-full p-4 rounded-xl transition-all duration-200",
              "flex items-center gap-4 touch-manipulation",
              action.enabled 
                ? 'bg-white border border-gray-200 shadow-sm active:scale-[0.98]' 
                : 'bg-gray-50 opacity-50',
              "disabled:cursor-not-allowed"
            )}
          >
            <div className={cn(
              "p-3 rounded-lg",
              action.enabled ? action.color : 'bg-gray-100'
            )}>
              <Icon className={cn(
                "h-6 w-6",
                !action.enabled && "text-gray-400"
              )} />
            </div>
            <div className="flex-1 text-left">
              <p className={cn(
                "font-medium text-sm",
                !action.enabled && "text-gray-500"
              )}>
                {action.title}
              </p>
              <p className={cn(
                "text-xs mt-0.5",
                action.enabled ? "text-gray-600" : "text-gray-400"
              )}>
                {action.description}
              </p>
            </div>
            {action.badge && action.enabled && (
              <Badge variant="secondary" className="text-xs">
                {action.badge}
              </Badge>
            )}
            <ChevronRight className={cn(
              "h-4 w-4",
              action.enabled ? "text-gray-400" : "text-gray-300"
            )} />
          </button>
        );
      })}
    </div>
  );

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription className="text-sm">
          Complete these steps to onboard your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show grid layout by default, can be toggled */}
        <GridLayout />

        {/* Progress indicator */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">Onboarding Progress</p>
            <span className="text-sm text-blue-700">
              {analyzedCount > 0 ? '75%' : cvCount > 0 ? '50%' : employeeCount > 0 ? '25%' : '0%'}
            </span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: analyzedCount > 0 ? '75%' : cvCount > 0 ? '50%' : employeeCount > 0 ? '25%' : '0%' 
              }}
            />
          </div>
          <p className="text-xs text-blue-700 mt-2">
            {!hasEmployees && "Start by adding employees to your organization"}
            {hasEmployees && !hasEmployeesWithCVs && "Upload CVs to continue"}
            {hasEmployeesWithCVs && !hasEmployeesWithAnalysis && "Analyze skills to identify gaps"}
            {hasEmployeesWithAnalysis && "Export your skills gap report"}
          </p>
        </div>

        {/* Swipe hint for mobile users */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
          <span>Swipe between steps</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </CardContent>
    </Card>
  );
}