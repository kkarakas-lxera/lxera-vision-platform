import React, { useState, useEffect } from 'react';
import { Upload, Users, FileText, BarChart3, CheckCircle, AlertCircle, Clock, ArrowRight, ArrowLeft, HelpCircle, Zap, MousePointer, ChevronRight, ChevronDown, Settings2, Target } from 'lucide-react';
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
import { AddEmployees } from '@/components/dashboard/EmployeeOnboarding/AddEmployees';
import { OnboardingProgress } from '@/components/dashboard/EmployeeOnboarding/OnboardingProgress';
import { SkillsGapAnalysis } from '@/components/dashboard/EmployeeOnboarding/SkillsGapAnalysis';
import { BulkCVUpload } from '@/components/dashboard/EmployeeOnboarding/BulkCVUpload';
import { SessionStatusCard } from '@/components/dashboard/EmployeeOnboarding/SessionStatusCard';
import { QuickActions } from '@/components/dashboard/EmployeeOnboarding/QuickActions';
import { AutomatedOnboardingDashboard } from '@/components/dashboard/EmployeeOnboarding/AutomatedOnboardingDashboard';

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
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [savingMode, setSavingMode] = useState(false);
  const [hasPositions, setHasPositions] = useState(false);
  const [checkingPositions, setCheckingPositions] = useState(true);

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
      toast.success('Onboarding mode updated successfully');
    } catch (error) {
      console.error('Error updating onboarding mode:', error);
      toast.error('Failed to update onboarding mode');
    } finally {
      setSavingMode(false);
    }
  };

  const fetchImportSessions = async () => {
    if (!userProfile?.company_id) return;

    try {
      const { data, error } = await supabase
        .from('st_import_sessions')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: ImportSession[] = (data || []).map(session => ({
        ...session,
        status: session.status as 'pending' | 'processing' | 'completed' | 'failed'
      }));
      
      setImportSessions(transformedData);
    } catch (error) {
      console.error('Error fetching import sessions:', error);
    }
  };

  const fetchEmployeeStatuses = async () => {
    if (!userProfile?.company_id) return;

    try {
      // Get employees first
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          id,
          position,
          cv_file_path,
          skills_last_analyzed,
          user_id,
          users!employees_user_id_fkey (
            full_name,
            email
          )
        `)
        .eq('company_id', userProfile.company_id);

      if (error) throw error;

      // Get skills profiles separately to bypass RLS join issues
      const employeeIds = employees?.map(e => e.id) || [];
      const { data: skillsProfiles, error: profilesError } = await supabase
        .from('st_employee_skills_profile')
        .select('employee_id, skills_match_score, analyzed_at, extracted_skills')
        .in('employee_id', employeeIds);

      if (profilesError) {
        console.error('Error fetching skills profiles:', profilesError);
      }

      // Create a map for easy lookup
      const profileMap = new Map();
      skillsProfiles?.forEach(profile => {
        if (!profileMap.has(profile.employee_id)) {
          profileMap.set(profile.employee_id, []);
        }
        profileMap.get(profile.employee_id).push(profile);
      });

      // Merge the data
      const employeesWithProfiles = employees?.map(emp => ({
        ...emp,
        st_employee_skills_profile: profileMap.get(emp.id) || []
      })) || [];

      // Transform data to include status information
      const statuses: EmployeeStatus[] = employeesWithProfiles.map(emp => {
        const hasProfile = emp.st_employee_skills_profile && 
                          Array.isArray(emp.st_employee_skills_profile) && 
                          emp.st_employee_skills_profile.length > 0;
        const profile = hasProfile ? emp.st_employee_skills_profile[0] : null;
        const hasExtractedSkills = profile?.extracted_skills && 
                                  Array.isArray(profile.extracted_skills) && 
                                  profile.extracted_skills.length > 0;
        
        // Use a fallback name if user doesn't exist
        const name = emp.users?.full_name || `Employee ${emp.id.slice(0, 8)}`;
        const email = emp.users?.email || `employee.${emp.id.slice(0, 8)}@company.com`;
        
        return {
          id: emp.id,
          name: name,
          email: email,
          position: emp.position || 'Not assigned',
          cv_status: emp.cv_file_path ? 
            (hasExtractedSkills ? 'analyzed' : 'uploaded') 
            : 'missing',
          skills_analysis: hasExtractedSkills ? 'completed' : 'pending',
          gap_score: profile?.skills_match_score || 0
        };
      });

      setEmployeeStatuses(statuses);
    } catch (error) {
      console.error('Error fetching employee statuses:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCompanyMode(), 
        fetchImportSessions(), 
        fetchEmployeeStatuses(),
        checkForPositions()
      ]);
      setLoading(false);
    };

    loadData();

    // Set up real-time subscription for skills profile changes
    const subscription = supabase
      .channel('skills-profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'st_employee_skills_profile',
          filter: `employee_id=in.(${employeeStatuses.map(e => e.id).join(',')})`
        },
        () => {
          // Refresh employee statuses when skills profile changes
          fetchEmployeeStatuses();
        }
      )
      .subscribe();

    // Also set up a periodic refresh every 5 seconds when analysis is in progress
    const hasAnalysisInProgress = employeeStatuses.some(
      e => e.cv_status === 'uploaded' && e.skills_analysis === 'pending'
    );
    
    let intervalId: NodeJS.Timeout | null = null;
    if (hasAnalysisInProgress) {
      intervalId = setInterval(() => {
        fetchEmployeeStatuses();
      }, 5000);
    }

    return () => {
      subscription.unsubscribe();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userProfile?.company_id, employeeStatuses.length]);


  const getOverallStats = () => {
    const total = employeeStatuses.length;
    const withCV = employeeStatuses.filter(e => e.cv_status !== 'missing').length;
    const analyzed = employeeStatuses.filter(e => e.skills_analysis === 'completed').length;

    return { total, withCV, analyzed };
  };

  const stats = getOverallStats();

  const steps = [
    {
      number: 1,
      title: "Import Employees",
      description: "Select position and import team members",
      icon: Users,
      completed: stats.total > 0
    },
    {
      number: 2,
      title: "Upload & Analyze CVs",
      description: "Upload resumes and run skills analysis",
      icon: BarChart3,
      completed: stats.analyzed > 0
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
    if (stepNumber === 2) return stats.total > 0;
    if (stepNumber === 3) return stats.withCV > 0;
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

  const toggleStepExpansion = (stepNumber: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };
  
  // Automatically expand the active step on mount
  React.useEffect(() => {
    setExpandedSteps(prev => ({
      ...prev,
      [currentStep]: true
    }));
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

  // Show different UI based on company's onboarding mode
  if (companyMode === 'automated') {
    return (
      <div className="p-6">
        <AutomatedOnboardingDashboard 
          companyId={userProfile?.company_id!}
          employeeStatuses={employeeStatuses}
          onRefresh={fetchEmployeeStatuses}
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Add Team Members</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Choose your onboarding method and add employees to analyze their skills
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
                1. Choose between Manual or Automated onboarding<br />
                2. Define position requirements (if not done)<br />
                3. Import employee data<br />
                4. Upload CVs and run skills analysis<br />
                5. View and export the skills gap report
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Onboarding Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Employee Onboarding Mode
            </CardTitle>
            <CardDescription>
              Choose how you want to onboard new employees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={companyMode} onValueChange={(value) => saveOnboardingMode(value as 'manual' | 'automated')}>
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="manual" id="manual" disabled={savingMode} />
                <div className="space-y-1">
                  <Label htmlFor="manual" className="text-base font-medium cursor-pointer">
                    Manual Mode (Traditional)
                  </Label>
                  <p className="text-sm text-gray-600">
                    Upload CVs and manually analyze employee skills. Full control over the process.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="automated" id="automated" disabled={savingMode} />
                <div className="space-y-1">
                  <Label htmlFor="automated" className="text-base font-medium cursor-pointer">
                    Automated Mode (AI-Powered)
                  </Label>
                  <p className="text-sm text-gray-600">
                    Connect HRIS, employees complete profiles, and courses are automatically assigned based on skills gaps.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Position Check Alert */}
        {!checkingPositions && !hasPositions && companyMode === 'manual' && (
          <Alert>
            <Target className="h-4 w-4" />
            <AlertTitle>Define Positions First</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>You need to define at least one position before importing employees.</p>
              <Button 
                onClick={() => navigate('/dashboard/positions')}
                size="sm"
                className="mt-2"
              >
                Define Positions
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Show rest of content only if positions exist or in automated mode */}
        {(hasPositions || companyMode === 'automated') && (
          <>
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

      {/* Step Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Onboarding Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = step.completed;
              const isClickable = canProceedToStep(step.number);
              const isExpanded = expandedSteps[step.number];

              return (
                <div key={step.number} className="border rounded-lg">
                  <div 
                    className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                      isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleStepExpansion(step.number)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                          isCompleted
                            ? 'bg-green-600 border-green-600'
                            : isActive
                            ? 'bg-blue-600 border-blue-600'
                            : isClickable
                            ? 'border-gray-300'
                            : 'border-gray-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isClickable) setCurrentStep(step.number);
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Done</Badge>}
                      {isActive && !isCompleted && <Badge className="bg-blue-100 text-blue-800 text-xs">Active</Badge>}
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {/* Expandable content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t">
                      <div className="mt-4">
                        {step.number === 1 && (
                          <div className="space-y-4">
                            {stats.total > 0 ? (
                              <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                <p className="text-lg font-medium text-foreground mb-2">
                                  {stats.total} employees already imported
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Your team members have been successfully imported. You can proceed to the next step.
                                </p>
                                <Button
                                  onClick={() => setCurrentStep(2)}
                                  className="mt-2"
                                >
                                  Continue to CV Upload
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium text-foreground mb-2">
                                  No employees imported yet
                                </p>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Import your team members to get started with skills analysis.
                                </p>
                                <Button
                                  onClick={() => {
                                    // In the future, this would open the import dialog
                                    toast.info('Import functionality coming soon!');
                                  }}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Import Employees
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        {step.number === 2 && (
                          <div className="space-y-3">
                            <OnboardingProgress
                              employees={employeeStatuses}
                              onRefresh={fetchEmployeeStatuses}
                            />
                          </div>
                        )}
                        {step.number === 3 && (
                          <SkillsGapAnalysis
                            employees={employeeStatuses}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </CardContent>
      </Card>
          </>
        )}

    </div>
    </TooltipProvider>
  );
}
