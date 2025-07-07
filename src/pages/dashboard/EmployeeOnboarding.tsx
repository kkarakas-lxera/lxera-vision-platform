import React, { useState, useEffect } from 'react';
import { Upload, Users, FileText, BarChart3, CheckCircle, AlertCircle, Clock, ArrowRight, ArrowLeft, HelpCircle, Zap, MousePointer, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AddEmployees } from '@/components/dashboard/EmployeeOnboarding/AddEmployees';
import { OnboardingProgress } from '@/components/dashboard/EmployeeOnboarding/OnboardingProgress';
import { SkillsGapAnalysis } from '@/components/dashboard/EmployeeOnboarding/SkillsGapAnalysis';
import { BulkCVUpload } from '@/components/dashboard/EmployeeOnboarding/BulkCVUpload';
import { SessionStatusCard } from '@/components/dashboard/EmployeeOnboarding/SessionStatusCard';
import { QuickActions } from '@/components/dashboard/EmployeeOnboarding/QuickActions';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [importSessions, setImportSessions] = useState<ImportSession[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingMethod, setOnboardingMethod] = useState<'none' | 'api' | 'manual'>('none');
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

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
      await Promise.all([fetchImportSessions(), fetchEmployeeStatuses()]);
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

  // Check if there's existing data to determine if we should skip method selection
  // Only auto-skip to manual mode on initial load, not when user explicitly goes back
  const [hasAutoSkipped, setHasAutoSkipped] = useState(false);
  
  useEffect(() => {
    if (!loading && employeeStatuses.length > 0 && onboardingMethod === 'none' && !hasAutoSkipped) {
      // If there's already employee data, go straight to manual mode
      setOnboardingMethod('manual');
      setHasAutoSkipped(true);
    }
  }, [loading, employeeStatuses.length, onboardingMethod, hasAutoSkipped]);

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

  // Show onboarding method selection if none selected
  if (onboardingMethod === 'none') {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Employee Onboarding</h1>
            <p className="text-lg text-muted-foreground">
              Choose how you'd like to import your team members
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* API Integration Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">HR System Integration</CardTitle>
                <CardDescription className="mt-2">
                  Connect your existing HR system for automatic employee data sync
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>One-click sync from 50+ HR systems</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Real-time updates when employees change</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Automatic data mapping</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => {
                    toast.info('HR System Integration coming soon! For now, please use manual import.');
                    // In the future: setOnboardingMethod('api')
                  }}
                >
                  Connect HR System
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Coming soon
                </p>
              </CardContent>
            </Card>

            {/* Manual Import Option */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <MousePointer className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Manual Import</CardTitle>
                <CardDescription className="mt-2">
                  Upload a CSV file or add employees one by one
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Import via CSV or add individually</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Bulk CV upload and analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Immediate skills gap analysis</span>
                  </div>
                </div>
                <Button 
                  className="w-full"
                  variant="default"
                  onClick={() => setOnboardingMethod('manual')}
                >
                  Start Manual Import
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Available now
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Not sure which to choose? <a href="#" className="text-blue-600 hover:underline">Learn more</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOnboardingMethod('none');
                setHasAutoSkipped(false);
              }}
              className="mt-1"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Onboard New Team Members</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Add employees, analyze their skills, and create personalized learning paths
              </p>
            </div>
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
                1. Select a default position for your employees<br />
                2. Import employee data via CSV<br />
                3. Upload CVs for each employee<br />
                4. Run skills analysis to identify gaps<br />
                5. View and export the skills gap report
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

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
                          <AddEmployees
                            onImportComplete={() => {
                              fetchImportSessions();
                              fetchEmployeeStatuses();
                            }}
                            importSessions={importSessions}
                            onNextStep={nextStep}
                          />
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


    </div>
    </TooltipProvider>
  );
}
