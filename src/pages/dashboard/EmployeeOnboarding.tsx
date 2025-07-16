import React, { useState, useEffect } from 'react';
import { Upload, Users, FileText, BarChart3, CheckCircle, AlertCircle, Clock, ArrowRight, ArrowLeft, HelpCircle, Zap, MousePointer, ChevronRight, ChevronDown, Settings2, Target, Link2, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { InlineAddEmployees } from '@/components/dashboard/EmployeeOnboarding/InlineAddEmployees';
import { InviteEmployees } from '@/components/dashboard/EmployeeOnboarding/InviteEmployees';
import { OnboardingProgress } from '@/components/dashboard/EmployeeOnboarding/OnboardingProgress';
import { SkillsGapAnalysis } from '@/components/dashboard/EmployeeOnboarding/SkillsGapAnalysis';
import { QuickActions } from '@/components/dashboard/EmployeeOnboarding/QuickActions';
import { AutomatedOnboardingDashboard } from '@/components/dashboard/EmployeeOnboarding/AutomatedOnboardingDashboard';
import { HRISService } from '@/services/hrisService';

interface ImportSession {
  id: string;
  import_type: string;
  total_employees: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

interface EmployeeStatus {
  id: string;
  name: string;
  email: string;
  position: string;
  cv_status: 'missing' | 'uploaded' | 'analyzed' | 'failed';
  skills_analysis: 'pending' | 'completed' | 'failed';
  gap_score?: number;
}

export default function EmployeeOnboarding() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [importSessions, setImportSessions] = useState<ImportSession[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyMode, setCompanyMode] = useState<'manual' | 'automated'>('manual');
  // Removed expandedSteps - showing active step content inline
  const [savingMode, setSavingMode] = useState(false);
  const [hasPositions, setHasPositions] = useState(false);
  const [checkingPositions, setCheckingPositions] = useState(true);
  const [hrisConnection, setHrisConnection] = useState<any>(null);
  const [checkingHRIS, setCheckingHRIS] = useState(false);

  // Fetch company's onboarding mode
  const fetchCompanyMode = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('onboarding_mode')
        .eq('id', userProfile.company_id)
        .single();
      
      if (error) throw error;
      if (data?.onboarding_mode) {
        setCompanyMode(data.onboarding_mode);
      }
    } catch (error) {
      console.error('Error fetching company mode:', error);
    }
  };

  // Check if company has positions defined
  const checkForPositions = async () => {
    if (!userProfile?.company_id) return;
    
    try {
      const { data, count } = await supabase
        .from('st_company_positions')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', userProfile.company_id);
      
      setHasPositions((count || 0) > 0);
    } catch (error) {
      console.error('Error checking positions:', error);
    } finally {
      setCheckingPositions(false);
    }
  };

  // Check HRIS connection
  const checkHRISConnection = async () => {
    if (!userProfile?.company_id || companyMode !== 'automated') return;
    
    setCheckingHRIS(true);
    try {
      const connection = await HRISService.getConnection(userProfile.company_id);
      setHrisConnection(connection);
    } catch (error) {
      console.error('Error checking HRIS connection:', error);
    } finally {
      setCheckingHRIS(false);
    }
  };

  // Save onboarding mode
  const saveOnboardingMode = async (mode: 'manual' | 'automated') => {
    if (!userProfile?.company_id) return;
    
    setSavingMode(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ onboarding_mode: mode })
        .eq('id', userProfile.company_id);
      
      if (error) throw error;
      
      setCompanyMode(mode);
      toast.success(`Switched to ${mode === 'manual' ? 'Manual' : 'Automated'} mode`);
      
      // Check HRIS if switching to automated
      if (mode === 'automated') {
        checkHRISConnection();
      }
    } catch (error) {
      console.error('Error saving mode:', error);
      toast.error('Failed to update onboarding mode');
    } finally {
      setSavingMode(false);
    }
  };

  // Connect HRIS
  const connectHRIS = async (provider: string) => {
    try {
      const authUrl = await HRISService.initiateConnection(userProfile?.company_id!, provider);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting HRIS:', error);
      toast.error('Failed to connect HRIS');
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      await fetchCompanyMode();
      await checkForPositions();
      await fetchImportSessions();
      await fetchEmployeeStatuses();
      setLoading(false);
    };

    initializePage();
  }, [userProfile]);

  useEffect(() => {
    checkHRISConnection();
  }, [companyMode]);

  const fetchImportSessions = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('st_import_sessions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImportSessions(data || []);
    } catch (error) {
      console.error('Error fetching import sessions:', error);
      toast.error('Failed to load import sessions');
    }
  };

  const fetchEmployeeStatuses = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('st_users')
        .select(`
          id,
          full_name,
          email,
          st_user_profiles!inner(
            position_title,
            cv_uploaded,
            cv_analyzed,
            skills_extracted
          )
        `)
        .eq('company_id', userProfile.company_id)
        .eq('role', 'learner');

      if (error) throw error;

      const statuses = (data || []).map(user => ({
        id: user.id,
        name: user.full_name,
        email: user.email,
        position: user.st_user_profiles[0]?.position_title || 'Not Assigned',
        cv_status: user.st_user_profiles[0]?.cv_analyzed 
          ? 'analyzed' 
          : user.st_user_profiles[0]?.cv_uploaded 
            ? 'uploaded' 
            : 'missing',
        skills_analysis: user.st_user_profiles[0]?.skills_extracted 
          ? 'completed' 
          : 'pending',
        gap_score: undefined
      }));

      setEmployeeStatuses(statuses);
    } catch (error) {
      console.error('Error fetching employee statuses:', error);
    }
  };

  // Calculate statistics
  const stats = {
    total: employeeStatuses.length,
    withCV: employeeStatuses.filter(e => e.cv_status !== 'missing').length,
    analyzed: employeeStatuses.filter(e => e.cv_status === 'analyzed').length,
    avgGapScore: 0
  };

  // Steps configuration
  const steps = [
    {
      number: 1,
      title: "Import Team Members",
      description: "Upload employee data",
      icon: Users,
      completed: stats.total > 0
    },
    {
      number: 2,
      title: "Invite Employees",
      description: "Employees upload profiles & CVs",
      icon: Zap,
      completed: stats.withCV > 0 || stats.analyzed > 0
    },
    {
      number: 3,
      title: "View Skills Gap Report",
      description: "Review analysis and export results",
      icon: CheckCircle,
      completed: stats.analyzed > 0
    }
  ];

  const canProceedToStep = (stepNumber: number) => {
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return stats.total > 0; // can invite after employees are imported
    if (stepNumber === 3) return stats.withCV > 0 || stats.analyzed > 0; // unlock report after CVs uploaded
    return false;
  };

  const nextStep = () => {
    if (currentStep < 3 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
      toast.success(`Step ${currentStep + 1} unlocked! Let's continue.`);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Remove toggleStepExpansion - no longer needed
  
  // Auto-refresh employee statuses periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (currentStep === 2 || currentStep === 3) {
        fetchEmployeeStatuses();
      }
    }, 5000); // Refresh every 5 seconds
    
    return () => clearInterval(interval);
  }, [currentStep]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Check positions first - applies to both modes
  if (!checkingPositions && !hasPositions) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Alert className="bg-white">
          <Target className="h-5 w-5" />
          <AlertTitle>Define Positions First</AlertTitle>
          <AlertDescription className="space-y-3 mt-2">
            <p>Before you can onboard employees, you need to define at least one position with its required skills.</p>
            <Button 
              onClick={() => navigate('/dashboard/positions/new')}
              className="w-full sm:w-auto"
            >
              <Target className="h-4 w-4 mr-2" />
              Create Your First Position
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check HRIS connection for automated mode
  if (companyMode === 'automated' && !checkingHRIS && !hrisConnection) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Compact Mode Selector */}
        <Card>
          <CardContent className="p-4">
            <RadioGroup value={companyMode} onValueChange={(value) => saveOnboardingMode(value as 'manual' | 'automated')} className="flex flex-row gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" disabled={savingMode} />
                <Label htmlFor="manual" className="cursor-pointer font-normal">Manual Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="automated" id="automated" disabled={savingMode} />
                <Label htmlFor="automated" className="cursor-pointer font-normal">Automated Mode</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* HRIS Connection Required */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Connect Your HR System
            </CardTitle>
            <CardDescription>
              Automated onboarding requires connecting your HRIS for employee data synchronization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => connectHRIS('bamboohr')}
              >
                <Building2 className="h-8 w-8" />
                <span>BambooHR</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => connectHRIS('workday')}
              >
                <Building2 className="h-8 w-8" />
                <span>Workday</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => connectHRIS('adp')}
              >
                <Building2 className="h-8 w-8" />
                <span>ADP</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Don't see your HRIS? Contact support for custom integrations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show automated dashboard if in automated mode with HRIS connected
  if (companyMode === 'automated' && hrisConnection) {
    return (
      <div className="p-6">
        {/* Compact Mode Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <RadioGroup value={companyMode} onValueChange={(value) => saveOnboardingMode(value as 'manual' | 'automated')} className="flex flex-row gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" disabled={savingMode} />
                <Label htmlFor="manual" className="cursor-pointer font-normal">Manual Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="automated" id="automated" disabled={savingMode} />
                <Label htmlFor="automated" className="cursor-pointer font-normal">Automated Mode</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <AutomatedOnboardingDashboard 
          companyId={userProfile?.company_id!}
          employeeStatuses={employeeStatuses}
          onRefresh={fetchEmployeeStatuses}
        />
      </div>
    );
  }

  // Manual mode interface
  return (
    <TooltipProvider>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Employee Onboarding</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Import your workforce data and let LXERA handle the rest
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p className="text-sm">
                <strong>Getting Started:</strong><br />
                1. Import employee data via CSV or HRIS<br />
                2. Invite employees to complete profiles<br />
                3. Review skills gap report
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Progress Summary */}
        <div className="mt-4 bg-gray-50 border rounded-lg p-4 flex items-center gap-4">
          <Progress value={stats.analyzed > 0 ? (stats.analyzed / Math.max(stats.total,1)) * 100 : 0} className="flex-1 h-2" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {stats.analyzed}/{stats.total} employees analyzed
          </span>
        </div>

        {/* Compact Mode Selector */}
        <Card>
          <CardContent className="p-4">
            <RadioGroup value={companyMode} onValueChange={(value) => saveOnboardingMode(value as 'manual' | 'automated')} className="flex flex-row gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" disabled={savingMode} />
                <Label htmlFor="manual" className="cursor-pointer font-normal">Manual Mode</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="automated" id="automated" disabled={savingMode} />
                <Label htmlFor="automated" className="cursor-pointer font-normal">Automated Mode</Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Quick Actions - Only show if we have data */}
        {(stats.total > 0 || stats.withCV > 0 || stats.analyzed > 0) && (
          <QuickActions
            onAddEmployees={() => setCurrentStep(1)}
            onUploadCVs={() => setCurrentStep(2)}
            onAnalyzeSkills={() => setCurrentStep(2)}
            onExportReport={() => setCurrentStep(3)}
            hasEmployees={stats.total > 0}
            hasEmployeesWithCVs={stats.withCV > 0}
            hasEmployeesWithAnalysis={stats.analyzed > 0}
          />
        )}

        {/* Overall Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {steps.filter(s => s.completed).length} of {steps.length} completed
            </span>
          </div>
          <Progress 
            value={(steps.filter(s => s.completed).length / steps.length) * 100} 
            className="h-2"
          />
        </div>

        {/* Steps - Clean Hierarchy */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = step.completed;
            const isClickable = canProceedToStep(step.number);

            return (
              <div key={step.number} className="relative">
                {/* Step Header */}
                <div 
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border bg-white transition-all",
                    isActive && "border-blue-500 shadow-sm",
                    !isActive && isClickable && "hover:border-gray-300 cursor-pointer",
                    !isClickable && "opacity-60 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (isClickable && !isActive) {
                      setCurrentStep(step.number);
                    }
                  }}
                >
                  <div className={`flex items-center justify-center h-7 w-7 rounded-full text-[10px] transition-colors ${
                          isCompleted 
                            ? 'bg-green-100 text-green-700' 
                            : isActive 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "font-semibold",
                        isActive ? "text-blue-900" : "text-gray-900"
                      )}>
                        {step.title}
                      </h3>
                      {isCompleted && (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    
                    {/* Step Progress Bar */}
                    {isActive && !isCompleted && (
                      <div className="mt-3">
                        <Progress 
                          value={
                            step.number === 1 ? (stats.total > 0 ? 100 : 0) :
                            step.number === 2 ? ((stats.withCV / Math.max(stats.total, 1)) * 100) :
                            step.number === 3 ? ((stats.analyzed / Math.max(stats.total, 1)) * 100) : 0
                          } 
                          className="h-1.5"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Content - Only show for active step */}
                {isActive && (
                  <div className="mt-4 ml-14 p-4 border-l-2 border-gray-200">
                    {step.number === 1 && (
                      <InlineAddEmployees 
                        onSessionCreated={() => {
                          fetchImportSessions();
                          fetchEmployeeStatuses();
                          // Auto-advance to step 2
                          if (canProceedToStep(2)) {
                            setTimeout(() => {
                              setCurrentStep(2);
                              toast.success('Employees imported! Now invite them to complete their profiles.');
                            }, 1000);
                          }
                        }}
                        existingSessions={importSessions}
                      />
                    )}
                    
                    {step.number === 2 && (
                      <InviteEmployees 
                        onInvitationsSent={() => {
                          fetchEmployeeStatuses();
                          // Check if we can advance to step 3
                          setTimeout(() => {
                            if (stats.withCV > 0 || stats.analyzed > 0) {
                              setCurrentStep(3);
                              toast.success('Great! Some employees have already uploaded their CVs.');
                            }
                          }, 1000);
                        }}
                      />
                    )}
                    
                    {step.number === 3 && (
                      <SkillsGapAnalysis
                        companyId={userProfile?.company_id!}
                        employeeStatuses={employeeStatuses}
                      />
                    )}
                  </div>
                )}

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-5 top-14 w-0.5 h-6 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>

        {/* Latest Import Sessions */}
        {importSessions.length > 0 && (
          <OnboardingProgress sessions={importSessions} />
        )}
      </div>
    </TooltipProvider>
  );
}