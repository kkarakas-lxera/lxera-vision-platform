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
  const [animateIn, setAnimateIn] = useState(false);
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
    // Trigger animation on mount
    setTimeout(() => setAnimateIn(true), 100);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-white p-4 md:p-6 font-inter">
      <div className={cn(
        "max-w-6xl mx-auto transition-all duration-1000 ease-out",
        animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}>
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className={cn(
            "text-3xl md:text-4xl font-semibold text-gray-900 mb-3 font-inter tracking-tight transition-all duration-700 delay-100",
            animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Welcome to the new era of Learning and Development
          </h1>
          <p className={cn(
            "text-lg text-gray-600 font-normal font-inter transition-all duration-700 delay-200",
            animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            Follow these steps to analyze your team's skills and identify gaps
          </p>
          <div className={cn(
            "mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200 transition-all duration-700 delay-300 shadow-sm hover:shadow-md",
            animateIn ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Current plan: Free Trial
          </div>
        </div>

        {/* Progress and Help Section - Side by Side */}
        <div className={cn(
          "mb-6 grid gap-3 grid-cols-1 md:grid-cols-2 transition-all duration-700 delay-400",
          animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {/* Setup Progress - Smaller */}
          <Card className="border-future-green/30 bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-business-black font-inter">
                  Setup Progress
                </span>
                <span className="text-xs font-medium text-business-black/70 font-inter">
                  {completedSteps}/{steps.length}
                </span>
              </div>
              <div className="w-full bg-future-green/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-future-green to-future-green/80 h-1.5 rounded-full transition-all duration-700 ease-out relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section - Minimalistic */}
          <Card className="border-future-green/30 bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-future-green/20 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="h-3.5 w-3.5 text-future-green" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-business-black text-xs mb-1 font-inter">
                    Need Help?
                  </h3>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs border-future-green/30 text-business-black hover:bg-future-green hover:text-white font-inter font-medium transition-all duration-200">
                      Tutorial
                    </Button>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs border-future-green/30 text-business-black hover:bg-future-green hover:text-white font-inter font-medium transition-all duration-200">
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
                "relative overflow-hidden transition-all duration-500 bg-white/60 backdrop-blur-sm hover:shadow-xl group",
                step.completed && "bg-gradient-to-br from-smart-beige via-future-green/10 to-smart-beige border-future-green/30",
                !step.completed && index === currentStep && "border-future-green/50 shadow-lg bg-white/80 scale-105",
                !step.completed && index > currentStep && "opacity-60 border-future-green/20",
                animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{
                transitionDelay: `${500 + index * 100}ms`
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    step.completed ? "bg-future-green/20" : "bg-future-green/10",
                    index === currentStep && !step.completed && "bg-future-green/15",
                    "group-hover:scale-110"
                  )}>
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-future-green animate-pulse" />
                    ) : (
                      <div className={cn(
                        "text-future-green/50 transition-colors duration-300",
                        index === currentStep && "text-future-green animate-pulse"
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
                  "text-lg mt-3 font-inter font-semibold",
                  step.completed ? "text-business-black" : "text-business-black/70",
                  index === currentStep && !step.completed && "text-business-black"
                )}>{step.title}</CardTitle>
                <CardDescription className="text-sm font-inter font-normal">
                  {step.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  onClick={() => navigate(step.route)}
                  disabled={!step.completed && index > currentStep && !(index === 3 && currentStep === 3)}
                  variant={step.completed ? "outline" : "default"}
                  className={cn(
                    "w-full font-inter font-medium transition-all duration-300",
                    step.completed && "border-future-green/30 text-future-green hover:bg-future-green hover:text-white",
                    !step.completed && (index === currentStep || (index === 3 && currentStep === 3)) && "bg-gradient-to-r from-future-green to-future-green/80 hover:from-future-green/90 hover:to-future-green/70 text-business-black hover:shadow-lg"
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
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
                {/* Current Step Indicator */}
                {!step.completed && index === currentStep && (
                  <div className="mt-2 text-center">
                    <div className="inline-flex items-center gap-1 text-xs text-future-green font-medium font-inter animate-pulse">
                      <Circle className="h-1.5 w-1.5 fill-current animate-pulse" />
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