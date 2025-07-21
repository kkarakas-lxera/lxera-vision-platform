import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Send, BarChart3, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { QuickActions } from '@/components/dashboard/EmployeeOnboarding/QuickActions';
import ActivityLog from '@/components/dashboard/EmployeeOnboarding/ActivityLog';

export default function OnboardingOverview() {
  const navigate = useNavigate();
  const { stats, loading, refreshData } = useOnboarding();

  // Refresh data when component mounts
  useEffect(() => {
    refreshData();
  }, []);

  const steps = [
    {
      number: 1,
      title: "Import Team Members",
      description: "Upload team member data via CSV or manual entry",
      icon: Users,
      completed: stats.total > 0,
      route: "/dashboard/onboarding/import",
      stat: `${stats.total} team members imported`,
      action: "Import"
    },
    {
      number: 2,
      title: "Invite Team Members",
      description: "Send invitations for profile completion and CV upload",
      icon: Send,
      completed: stats.withCV > 0 || stats.analyzed > 0,
      route: "/dashboard/onboarding/invite",
      stat: stats.pending > 0 || stats.completed > 0 
        ? `${stats.pending + stats.completed} invitations sent`
        : `${stats.notInvited} employees to invite`,
      action: "Send Invites"
    },
    {
      number: 3,
      title: "Skills Analysis",
      description: "Review skills gap analysis and export reports",
      icon: BarChart3,
      completed: stats.analyzed > 0,
      route: "/dashboard/onboarding/analysis",
      stat: `${stats.analyzed} analyzed CVs`,
      action: "Analyze"
    }
  ];


  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4">
      {/* Main Three-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side - Team Overview (2 columns) */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-base">Team Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="text-center p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Team Members</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending Invites</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-md border border-green-200">
                  <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-2xl font-bold text-blue-900">{stats.analyzed}</p>
                  <p className="text-xs text-muted-foreground">Analyzed CVs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle - Quick Actions (5 columns) */}
        <div className="lg:col-span-5">
          {(stats.total >= 10 || stats.withCV > 0 || stats.analyzed > 0) && (
            <QuickActions
              onAddEmployees={() => navigate('/dashboard/onboarding/import')}
              onUploadCVs={() => navigate('/dashboard/onboarding/invite')}
              onAnalyzeSkills={() => navigate('/dashboard/onboarding/invite')}
              onExportReport={() => navigate('/dashboard/onboarding/analysis')}
              hasEmployees={stats.total > 0}
              hasEmployeesWithCVs={stats.withCV > 0}
              hasEmployeesWithAnalysis={stats.analyzed > 0}
            />
          )}
        </div>

        {/* Right Side - Activity Log (5 columns) */}
        <div className="lg:col-span-5">
          <ActivityLog />
        </div>
      </div>

      {/* Step Cards - Full Width Below */}
      <Card className="overflow-hidden">
        <CardHeader className="py-3 border-b">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Setup Steps</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.completed;
              const canAccess = index === 0 || steps[index - 1].completed;
              const isFirstStep = index === 0;
              const showWelcomeMessage = isFirstStep && stats.total === 0;

              // Special welcome state for first step when no team members imported
              if (showWelcomeMessage) {
                return (
                  <div
                    key={step.number}
                    className="flex items-center gap-4 p-4 rounded-md border border-blue-200 bg-blue-50"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-blue-900">
                        {step.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ready to begin? Takes less than 5 minutes
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => navigate(step.route)}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      Get Started
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                );
              }

              // Regular step card
              return (
                <div
                  key={step.number}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-md border transition-colors",
                    isCompleted && "bg-green-50 border-green-200",
                    !isCompleted && canAccess && "bg-blue-50 border-blue-200",
                    !isCompleted && !canAccess && "bg-gray-50 border-gray-200 opacity-60"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    isCompleted && "bg-green-100 text-green-600",
                    !isCompleted && canAccess && "bg-blue-100 text-blue-600",
                    !isCompleted && !canAccess && "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-medium text-sm",
                        isCompleted && "text-green-800",
                        !isCompleted && canAccess && "text-blue-900",
                        !isCompleted && !canAccess && "text-gray-600"
                      )}>
                        {step.title}
                      </h3>
                      {canAccess && !isCompleted && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.stat}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => canAccess && navigate(step.route)}
                    disabled={!canAccess}
                    variant={isCompleted ? "ghost" : "default"}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        View
                      </>
                    ) : (
                      <>
                        {step.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              );
                })}
              </div>
            </CardContent>
          </Card>
    </div>
  );
}