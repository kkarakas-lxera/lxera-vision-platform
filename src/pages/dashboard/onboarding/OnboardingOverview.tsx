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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-business-black to-future-green bg-clip-text text-transparent">
          Welcome Your Team to LXERA
        </h1>
        <p className="text-lg text-gray-700 font-medium">
          Import your workforce in minutes, not hours
        </p>
      </div>

      {/* Main Two-Sided Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side - Team Overview (20%) */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-white/95 backdrop-blur-md border-gray-200/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg text-business-black">Team Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="text-center p-3 bg-gradient-to-br from-future-green/20 to-future-green/10 rounded-lg border border-future-green/20">
                  <p className="text-2xl font-bold text-business-black">{stats.total}</p>
                  <p className="text-xs text-gray-700 font-medium">Team Members</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-lxera-blue/20 to-lxera-blue/10 rounded-lg border border-lxera-blue/20">
                  <p className="text-2xl font-bold text-business-black">{stats.pending}</p>
                  <p className="text-xs text-gray-700 font-medium">Pending Invites</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-future-green/30 to-future-green/15 rounded-lg border border-future-green/30">
                  <p className="text-2xl font-bold text-business-black">{stats.completed}</p>
                  <p className="text-xs text-gray-700 font-medium">Completed</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-business-black/10 to-business-black/5 rounded-lg border border-business-black/20">
                  <p className="text-2xl font-bold text-business-black">{stats.analyzed}</p>
                  <p className="text-xs text-gray-700 font-medium">Analyzed CVs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Steps and Progress (80%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Overall Progress - Enhanced */}
          <div className="bg-gradient-to-r from-smart-beige via-future-green/15 to-smart-beige border border-future-green/30 rounded-xl p-5 shadow-xl hover:shadow-2xl transition-shadow duration-300 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-business-black to-future-green flex items-center justify-center animate-pulse">
                    <span className="text-white font-bold text-sm">{completedSteps}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-business-black">Getting Started</h3>
                    <p className="text-xs text-gray-700 font-medium mt-0.5">{completedSteps} of {steps.length} steps completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-8">
                  <Progress value={overallProgress} className="h-2.5 w-40 bg-future-green/20" />
                  <span className="text-sm font-medium text-business-black min-w-[3rem] text-right">{Math.round(overallProgress)}%</span>
                </div>
              </div>
              {overallProgress === 100 && (
                <Badge className="bg-future-green text-business-black animate-bounce font-bold">
                  Complete! 🎉
                </Badge>
              )}
            </div>
          </div>

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
                    className="bg-gradient-to-br from-smart-beige via-future-green/15 to-smart-beige border-future-green/30 shadow-2xl backdrop-blur-md overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-future-green/5 via-transparent to-business-black/5" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-future-green/10 rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-lxera-blue/10 rounded-full blur-2xl" />
                    
                    <CardContent className="relative p-8 text-center">
                      <div className="mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-business-black to-future-green rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-business-black mb-3">Ready to Get Started?</h3>
                        <p className="text-gray-700 text-sm leading-relaxed font-medium">
                          Begin by importing your team members to start the onboarding process.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <Button 
                          size="lg" 
                          onClick={() => navigate('/dashboard/onboarding/import')}
                          className="w-full bg-gradient-to-r from-business-black to-business-black/90 hover:from-business-black hover:to-business-black text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Users className="h-5 w-5 mr-2" />
                          Import Team Members
                        </Button>
                        
                        <p className="text-xs text-gray-600 font-medium">
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
                  className={`transition-all duration-200 backdrop-blur-md ${
                    isCompleted 
                      ? 'border-future-green/40 bg-gradient-to-br from-future-green/20 to-future-green/10 shadow-lg' 
                      : canAccess 
                        ? 'border-lxera-blue/30 bg-white/90 hover:border-future-green/40 cursor-pointer shadow-md hover:shadow-xl' 
                        : 'border-gray-300/50 bg-gray-50/80 opacity-60'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-10 w-10 rounded-full ${
                          isCompleted 
                            ? 'bg-future-green/20 text-business-black' 
                            : canAccess 
                              ? 'bg-lxera-blue/20 text-business-black' 
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
                          <Badge variant="default" className="bg-future-green text-business-black font-bold">
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