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
  Sparkles,
  Activity,
  Target,
  HelpCircle,
  MessageCircle,
  Building2
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
      route: '/dashboard/onboarding/import',
      completed: false
    },
    {
      id: 'send_invites',
      title: 'Send Invites',
      description: 'Invite employees to complete profiles',
      icon: <Send className="h-5 w-5" />,
      action: 'Send',
      route: '/dashboard/onboarding/invite',
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
      
      // Also fetch company name from skills_gap_leads if available
      let companyName = '';
      if (userProfile.email) {
        const { data: leadData } = await supabase
          .from('skills_gap_leads')
          .select('company')
          .eq('email', userProfile.email)
          .eq('status', 'converted')
          .single();
        
        if (leadData) {
          companyName = leadData.company;
        }
      }
      
      if (company) {
        setCompanyData({ ...company, company: companyName });
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

      // Check if any invitations have been sent
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('company_id', userProfile.company_id);
      
      const employeeIds = employees?.map(e => e.id) || [];
      
      const { count: invitedCount } = await supabase
        .from('profile_invitations')
        .select('*', { count: 'exact', head: true })
        .in('employee_id', employeeIds);

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
    <div className="p-4 max-w-5xl mx-auto font-inter">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Skills Gap Analysis Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete these steps to analyze your team's skills</p>
      </div>

      <div className="space-y-4">
        {/* Progress Overview */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Setup Progress</CardTitle>
              </div>
              <Badge className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {completedSteps} of {steps.length} Complete
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Get started with your skills gap analysis</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Help
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <Card className="overflow-hidden">
          <CardHeader className="py-3 border-b">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Setup Steps</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-md border transition-colors",
                    step.completed && "bg-green-50 border-green-200",
                    !step.completed && index === currentStep && "bg-blue-50 border-blue-200",
                    !step.completed && index > currentStep && "bg-gray-50 border-gray-200 opacity-60"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                    step.completed && "bg-green-100 text-green-600",
                    !step.completed && index === currentStep && "bg-blue-100 text-blue-600",
                    !step.completed && index > currentStep && "bg-gray-100 text-gray-400"
                  )}>
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <div className="text-muted-foreground">
                        {step.icon}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-medium text-sm",
                        step.completed && "text-green-800",
                        !step.completed && index === currentStep && "text-blue-900",
                        !step.completed && index > currentStep && "text-gray-600"
                      )}>
                        {step.title}
                      </h3>
                      {index === currentStep && !step.completed && (
                        <Badge variant="outline" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => navigate(step.route)}
                    disabled={!step.completed && index > currentStep && !(index === 3 && currentStep === 3)}
                    variant={step.completed ? "ghost" : "default"}
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {step.completed ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Trial Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span className="text-xs">Analyze up to 10 employees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span className="text-xs">AI-powered skills extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span className="text-xs">Detailed gap visualization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                  <span className="text-xs">Export reports to CSV</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="py-3 border-b">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Need Help?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Get assistance with your skills gap analysis setup
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    View Tutorial
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Users className="h-3 w-3 mr-1" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}