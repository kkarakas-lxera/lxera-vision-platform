import React, { useState, useEffect } from 'react';
import { Upload, Users, FileText, BarChart3, CheckCircle, AlertCircle, Clock, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
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
  course_generation: 'pending' | 'in_progress' | 'completed' | 'failed';
  gap_score?: number;
}

export default function EmployeeOnboarding() {
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [importSessions, setImportSessions] = useState<ImportSession[]>([]);
  const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
  const [loading, setLoading] = useState(true);

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
      // Get employees with their onboarding status and skills profiles
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          id,
          user_id,
          position,
          cv_file_path,
          skills_last_analyzed,
          users!inner(full_name, email),
          st_employee_skills_profile(
            skills_match_score,
            career_readiness_score,
            gap_analysis_completed_at
          )
        `)
        .eq('company_id', userProfile.company_id)
        .eq('is_active', true);

      if (error) throw error;

      // Transform data to include status information
      const statuses: EmployeeStatus[] = (employees || []).map(emp => {
        const skillsProfile = emp.st_employee_skills_profile?.[0];
        return {
          id: emp.id,
          name: emp.users.full_name,
          email: emp.users.email,
          position: emp.position || 'Not assigned',
          cv_status: emp.cv_file_path ? 
            (skillsProfile?.gap_analysis_completed_at ? 'analyzed' : 'uploaded') 
            : 'missing',
          skills_analysis: skillsProfile?.gap_analysis_completed_at ? 'completed' : 'pending',
          course_generation: 'pending',
          gap_score: skillsProfile?.skills_match_score || 0
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
  }, [userProfile?.company_id]);

  const getOverallStats = () => {
    const total = employeeStatuses.length;
    const withCV = employeeStatuses.filter(e => e.cv_status !== 'missing').length;
    const analyzed = employeeStatuses.filter(e => e.skills_analysis === 'completed').length;
    const coursesGenerated = employeeStatuses.filter(e => e.course_generation === 'completed').length;

    return { total, withCV, analyzed, coursesGenerated };
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

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Onboard New Team Members</h1>
            <p className="text-muted-foreground mt-1">
              Add employees, analyze their skills, and create personalized learning paths
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
        <CardHeader>
          <CardTitle className="text-lg">Onboarding Progress</CardTitle>
          <CardDescription>
            Complete these steps to get your team members up and running
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = step.completed;
              const isClickable = canProceedToStep(step.number);

              return (
                <div key={step.number} className="flex items-center">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                          isCompleted
                            ? 'bg-green-600 border-green-600'
                            : isActive
                            ? 'bg-blue-600 border-blue-600'
                            : isClickable
                            ? 'border-gray-300 hover:border-blue-400 cursor-pointer'
                            : 'border-gray-200'
                        }`}
                        onClick={() => isClickable && setCurrentStep(step.number)}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-xs">{step.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  <div className="ml-3 flex-1">
                    <p className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div className={`h-0.5 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.withCV}</div>
              <div className="text-xs text-muted-foreground">CVs Uploaded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.analyzed}</div>
              <div className="text-xs text-muted-foreground">Skills Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.coursesGenerated}</div>
              <div className="text-xs text-muted-foreground">Learning Paths</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-4">
        {currentStep === 1 && (
          <div className="space-y-4">
            <AddEmployees
              onImportComplete={() => {
                fetchImportSessions();
                fetchEmployeeStatuses();
              }}
              importSessions={importSessions}
              onNextStep={nextStep}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <BulkCVUpload
              onUploadComplete={fetchEmployeeStatuses}
            />
            <OnboardingProgress
              employees={employeeStatuses}
              onRefresh={fetchEmployeeStatuses}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <SkillsGapAnalysis
              employees={employeeStatuses}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Learning Path Generation</CardTitle>
                <CardDescription>
                  Generate personalized courses based on identified skill gaps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    Course generation integration coming soon...
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This will integrate with the existing ContentManager to generate 4-6 week courses
                    targeting specific skills gaps identified during the analysis phase.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Step
          </Button>

          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </div>

          <Button
            onClick={nextStep}
            disabled={!canProceedToStep(currentStep + 1) || currentStep === 3}
            className="flex items-center gap-2"
          >
            Next Step
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Recent Sessions - Show at the bottom */}
      {importSessions.length > 0 && currentStep === 1 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {importSessions.slice(0, 3).map(session => (
              <SessionStatusCard
                key={session.id}
                session={session}
                positionTitle={session.active_position_id ? 'Position assigned' : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
