import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Send, BarChart3, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { QuickActions } from '@/components/dashboard/EmployeeOnboarding/QuickActions';

export default function OnboardingOverview() {
  const navigate = useNavigate();
  const { stats, loading } = useOnboarding();

  const steps = [
    {
      number: 1,
      title: "Import Team Members",
      description: "Upload team member data via CSV or manual entry",
      icon: Users,
      completed: stats.total > 0,
      route: "/dashboard/onboarding/import",
      stat: `${stats.total} team members imported`
    },
    {
      number: 2,
      title: "Invite Team Members",
      description: "Send invitations for profile completion and CV upload",
      icon: Send,
      completed: stats.withCV > 0 || stats.analyzed > 0,
      route: "/dashboard/onboarding/invite",
      stat: `${stats.completed} completed profiles`
    },
    {
      number: 3,
      title: "Skills Analysis",
      description: "Review skills gap analysis and export reports",
      icon: BarChart3,
      completed: stats.analyzed > 0,
      route: "/dashboard/onboarding/analysis",
      stat: `${stats.analyzed} analyzed CVs`
    }
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const overallProgress = (completedSteps / steps.length) * 100;

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Your Team to LXERA
        </h1>
        <p className="text-lg text-gray-600">
          Import your workforce in minutes, not hours
        </p>
      </div>

      {/* Main Two-Sided Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side - Team Overview (20%) */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-blue-600">Team Members</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-xs text-yellow-600">Pending Invites</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-2xl font-bold text-purple-600">{stats.analyzed}</p>
                  <p className="text-xs text-purple-600">Analyzed CVs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Steps and Progress (80%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Getting Started</span>
                <Badge variant="outline">
                  {completedSteps} of {steps.length} completed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span className="font-medium">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {(stats.total > 0 || stats.withCV > 0 || stats.analyzed > 0) && (
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

          {/* Step Cards */}
          <div className="grid gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.completed;
              const canAccess = index === 0 || steps[index - 1].completed;
              const isFirstStep = index === 0;
              const showWelcomeMessage = isFirstStep && stats.total === 0;

              // Special welcome card for first step when no team members imported
              if (showWelcomeMessage) {
                return (
                  <Card 
                    key={step.number}
                    className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-lg"
                  >
                    <CardContent className="p-8 text-center">
                      <div className="mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Ready to Get Started?</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Begin by importing your team members to start the onboarding process.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <Button 
                          size="lg" 
                          onClick={() => navigate('/dashboard/onboarding/import')}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Users className="h-5 w-5 mr-2" />
                          Import Team Members
                        </Button>
                        
                        <p className="text-xs text-gray-500">
                          Takes less than 5 minutes to get started
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // Regular step card
              return (
                <Card 
                  key={step.number} 
                  className={`transition-all duration-200 ${
                    isCompleted 
                      ? 'border-green-200 bg-green-50' 
                      : canAccess 
                        ? 'border-blue-200 hover:border-blue-300 cursor-pointer' 
                        : 'border-gray-200 opacity-60'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                          isCompleted 
                            ? 'bg-green-100 text-green-700' 
                            : canAccess 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                          <CardDescription>{step.description}</CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isCompleted && (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Badge>
                        )}
                        {!isCompleted && !canAccess && (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {step.stat}
                      </div>
                      <Button
                        variant={isCompleted ? "outline" : "default"}
                        size="sm"
                        onClick={() => canAccess && navigate(step.route)}
                        disabled={!canAccess}
                      >
                        {isCompleted ? 'Review' : 'Start'}
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}