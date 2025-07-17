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
  const { userProfile, user } = useAuth();
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
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, [userProfile]);

  const checkOnboardingStatus = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Fetch company data
      const { data: company } = await supabase
        .from('companies')
        .select('subscription_tier')
        .eq('id', userProfile.company_id)
        .single();
      
      if (company) {
        setCompanyData(company);
      }
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

        {/* Progress, User Info, and Help Section - Three Columns */}
        <div className="mb-6 grid gap-3 grid-cols-1 md:grid-cols-3">
          {/* Setup Progress - Smaller */}
          <Card className="border-future-green/30 bg-white backdrop-blur-sm">
            <CardContent className="p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-business-black">
                  Setup Progress
                </span>
                <span className="text-xs font-medium text-business-black/70">
                  {completedSteps}/{steps.length}
                </span>
              </div>
              <div className="w-full bg-future-green/20 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-future-green to-future-green/80 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* User Info & Plan */}
          <Card className="border-future-green/30 bg-white backdrop-blur-sm">
            <CardContent className="p-2">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <div className="text-xs font-medium text-business-black">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-xs text-business-black/70">
                    {companyData?.subscription_tier === 'trial' ? 'Free Trial' : 
                     companyData?.subscription_tier === 'premium' ? 'Premium Plan' : 
                     'Free Plan'}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-6 px-2 text-xs border-future-green/30 text-business-black hover:bg-future-green hover:text-white"
                  onClick={() => navigate('/dashboard/settings')}
                >
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Help Section - Minimalistic */}
          <Card className="border-future-green/30 bg-white backdrop-blur-sm">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-future-green/20 rounded-lg">
                  <Sparkles className="h-3 w-3 text-future-green" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-business-black text-xs mb-1">
                    Need Help?
                  </h3>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-5 px-1.5 text-xs border-future-green/30 text-business-black hover:bg-future-green hover:text-white">
                      Tutorial
                    </Button>
                    <Button variant="outline" size="sm" className="h-5 px-1.5 text-xs border-future-green/30 text-business-black hover:bg-future-green hover:text-white">
                      Support
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Steps */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={cn(
                "relative overflow-hidden transition-all duration-200 bg-white/60 backdrop-blur-sm",
                step.completed && "bg-white border-future-green/30",
                !step.completed && index === currentStep && "border-future-green/50 shadow-lg bg-white/80",
                !step.completed && index > currentStep && "opacity-60 border-future-green/20"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "p-2 rounded-lg",
                    step.completed ? "bg-future-green/20" : "bg-future-green/10",
                    index === currentStep && !step.completed && "bg-future-green/15"
                  )}>
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-future-green" />
                    ) : (
                      <div className={cn(
                        "text-future-green/50",
                        index === currentStep && "text-future-green"
                      )}>
                        {step.icon}
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant={step.completed ? "default" : "secondary"}
                    className={cn(
                      step.completed && "bg-future-green text-business-black",
                      !step.completed && index === currentStep && "bg-future-green text-business-black",
                      !step.completed && index > currentStep && "bg-future-green/20 text-future-green"
                    )}
                  >
                    Step {index + 1}
                  </Badge>
                </div>
                <CardTitle className={cn(
                  "text-lg mt-3",
                  step.completed ? "text-business-black" : "text-business-black/70",
                  index === currentStep && !step.completed && "text-business-black"
                )}>{step.title}</CardTitle>
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
                    step.completed && "border-future-green/30 text-future-green hover:bg-future-green hover:text-white",
                    !step.completed && (index === currentStep || (index === 3 && currentStep === 3)) && "bg-gradient-to-r from-future-green to-future-green/80 hover:from-future-green/90 hover:to-future-green/70 text-business-black"
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
                {/* Current Step Indicator */}
                {!step.completed && index === currentStep && (
                  <div className="mt-2 text-center">
                    <div className="inline-flex items-center gap-1 text-xs text-future-green font-medium">
                      <Circle className="h-1.5 w-1.5 fill-current" />
                      Current Step
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}