import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Users,
  Upload,
  Send,
  Briefcase,
  ChartBar,
  CheckCircle2,
  ArrowRight,
  Circle,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  route: string;
  completed: boolean;
}

export default function SkillsGapOnboardingFlow() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'define_positions',
      title: 'Define Positions',
      description: 'Set up role requirements and skills',
      icon: <Briefcase className="h-5 w-5" />,
      action: 'Define',
      route: '/dashboard/positions',
      completed: false
    },
    {
      id: 'import_employees',
      title: 'Import Employees',
      description: 'Upload your employee list',
      icon: <Users className="h-5 w-5" />,
      action: 'Import',
      route: '/dashboard/employees/add',
      completed: false
    },
    {
      id: 'send_invites',
      title: 'Send Invites',
      description: 'Invite employees to complete profiles',
      icon: <Send className="h-5 w-5" />,
      action: 'Send',
      route: '/dashboard/employees',
      completed: false
    },
    {
      id: 'view_reports',
      title: 'View Reports',
      description: 'Review skills gap analysis',
      icon: <ChartBar className="h-5 w-5" />,
      action: 'View',
      route: '/dashboard/skills-gap',
      completed: false
    }
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, [userProfile]);

  const checkOnboardingStatus = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Check if positions exist
      const { count: positionCount } = await supabase
        .from('st_company_positions')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id);

      // Check if employees exist
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id);

      // Check if any employee has a user_id (indicating invites were sent)
      const { count: invitedCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id)
        .not('user_id', 'is', null);

      const updatedSteps = [...steps];
      let newCurrentStep = 0;
      
      if (positionCount && positionCount > 0) {
        updatedSteps[0].completed = true;
        newCurrentStep = 1;
      }
      
      if (employeeCount && employeeCount > 0) {
        updatedSteps[1].completed = true;
        newCurrentStep = 2;
      }
      
      if (invitedCount && invitedCount > 0) {
        updatedSteps[2].completed = true;
        newCurrentStep = 3;
        // Step 4 is always available after step 3
        updatedSteps[3].completed = false; // Keep it active, not completed
      }

      setCurrentStep(newCurrentStep);
      setSteps(updatedSteps);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = steps.filter(s => s.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the new era of Learning and Development
          </h1>
          <p className="text-lg text-gray-600">
            Follow these steps to analyze your team's skills and identify gaps
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
            Current plan: Free Trial
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-8 bg-white/60 backdrop-blur-sm border-indigo-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-700">
                Setup Progress
              </span>
              <span className="text-sm font-medium text-indigo-700">
                {completedSteps} of {steps.length} completed
              </span>
            </div>
            <div className="w-full bg-indigo-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200 bg-white/60 backdrop-blur-sm",
                step.completed && "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200",
                !step.completed && index === currentStep && "border-indigo-500 shadow-lg bg-white/80",
                !step.completed && index > currentStep && "opacity-60 border-indigo-100"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "p-2 rounded-lg",
                    step.completed ? "bg-indigo-100" : "bg-indigo-50",
                    index === currentStep && !step.completed && "bg-indigo-100"
                  )}>
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <div className={cn(
                        "text-indigo-300",
                        index === currentStep && "text-indigo-600"
                      )}>
                        {step.icon}
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant={step.completed ? "default" : "secondary"}
                    className={cn(
                      step.completed && "bg-indigo-600 text-white",
                      !step.completed && index === currentStep && "bg-indigo-600 text-white",
                      !step.completed && index > currentStep && "bg-indigo-100 text-indigo-600"
                    )}
                  >
                    Step {index + 1}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-3">{step.title}</CardTitle>
                <CardDescription className="text-sm">
                  {step.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate(step.route)}
                  disabled={!step.completed && index > currentStep && !(index === 3 && currentStep === 3)}
                  variant={step.completed ? "outline" : "default"}
                  className={cn(
                    "w-full",
                    step.completed && "border-indigo-200 text-indigo-600 hover:bg-indigo-50",
                    !step.completed && (index === currentStep || (index === 3 && currentStep === 3)) && "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                  )}
                >
                  {step.completed ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      {step.action}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-8 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Need Help Getting Started?
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Our AI-powered skills gap analysis helps you understand your team's capabilities
                  and identify areas for improvement. Complete all steps to unlock your comprehensive report.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                    View Tutorial
                  </Button>
                  <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}