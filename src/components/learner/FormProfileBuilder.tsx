import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Save, Check, Loader2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';

// Reuse existing form components
import FileDropZone from './chat/FileDropZone';
import CVAnalysisProgress from './chat/CVAnalysisProgress';
import WorkExperienceForm from './chat/WorkExperienceForm';
import EducationForm from './chat/EducationForm';
import SkillsSelector from './chat/SkillsSelector';
import MultiSelectCards from './chat/MultiSelectCards';
import CurrentProjectsForm from './chat/CurrentProjectsForm';
import ProfileSidebar from './ProfileSidebar';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import { ProfileBuilderStateService } from '@/services/profileBuilderStateService';

interface FormProfileBuilderProps {
  employeeId: string;
  onComplete: () => void;
}

const STEPS = [
  { id: 'cv_upload', title: 'CV Upload' },
  { id: 'work_experience', title: 'Work Experience' },
  { id: 'education', title: 'Education' },
  { id: 'skills', title: 'Skills Review' },
  { id: 'current_work', title: 'Current Projects' },
  { id: 'daily_tasks', title: 'Professional Challenges' },
  { id: 'tools_technologies', title: 'Growth Opportunities' }
];

export default function FormProfileBuilder({ employeeId, onComplete }: FormProfileBuilderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvAnalysisStatus, setCvAnalysisStatus] = useState<any>(null);
  const [cvExtractedData, setCvExtractedData] = useState<any>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<{
    challenges: string[];
    growthAreas: string[];
  }>({ challenges: [], growthAreas: [] });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load existing profile data and state
  useEffect(() => {
    loadProfileData();
  }, [employeeId]);

  const loadProfileData = async () => {
    try {
      // Load employee data
      const { data: employee } = await supabase
        .from('employees')
        .select('*, users!inner(full_name)')
        .eq('id', employeeId)
        .single();

      if (employee) {
        setEmployeeName(employee.users?.full_name || 'there');
        
        // Check if CV was already uploaded
        if (employee.cv_file_path) {
          setCvExtractedData(employee.cv_extracted_data);
          setCvAnalysisStatus({ status: 'completed' });
        }
      }

      // Load saved state
      const savedState = await ProfileBuilderStateService.loadState(employeeId);
      if (savedState) {
        setCurrentStep(savedState.step || 0);
        setFormData(savedState.formData || {});
      }

      // Load existing profile sections
      const sections = await EmployeeProfileService.getProfileSections(employeeId);
      const sectionData: any = {};
      sections.forEach(section => {
        sectionData[section.sectionName] = section.data;
      });
      setFormData(prev => ({ ...prev, ...sectionData }));
      
      // Check for local draft recovery
      try {
        const localDraft = localStorage.getItem(`profile_draft_${employeeId}`);
        if (localDraft) {
          const draftData = JSON.parse(localDraft);
          const draftAge = Date.now() - new Date(draftData.timestamp).getTime();
          
          // If draft is less than 3 days old and newer than saved data
          if (draftAge < 3 * 24 * 60 * 60 * 1000) {
            toast.info('Found unsaved draft. Would you like to restore it?', {
              action: {
                label: 'Restore',
                onClick: () => {
                  setFormData(draftData.formData);
                  setCurrentStep(draftData.currentStep);
                  localStorage.removeItem(`profile_draft_${employeeId}`);
                  toast.success('Draft restored');
                }
              },
              duration: 10000
            });
          } else {
            // Clean up old draft
            localStorage.removeItem(`profile_draft_${employeeId}`);
          }
        }
      } catch (error) {
        console.error('Error checking local draft:', error);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  // Load personalized suggestions for challenges and growth areas
  const loadPersonalizedSuggestions = async (stepData: any) => {
    try {
      setLoadingSuggestions(true);
      
      const { data, error } = await supabase.functions.invoke('generate-profile-suggestions', {
        body: { 
          employee_id: employeeId,
          step_data: stepData
        }
      });

      if (error) throw error;

      if (data?.challenges && data?.growthAreas) {
        setPersonalizedSuggestions({
          challenges: data.challenges,
          growthAreas: data.growthAreas
        });
      }
    } catch (error) {
      console.error('Error loading personalized suggestions:', error);
      // Fall back to some default suggestions if needed
      toast.error('Failed to load personalized suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Auto-save functionality with 2s debounce
  const saveProgress = useCallback(
    debounce(async (stepId: string, data: any) => {
      // Validate employeeId before saving
      if (!employeeId || employeeId === '') {
        console.error('Invalid employee ID - cannot save progress');
        return;
      }
      
      try {
        setIsSaving(true);
        
        // Save to database
        await EmployeeProfileService.updateProfileSection(
          employeeId,
          stepId,
          data,
          false // Not complete yet
        );

        // Save state
        await ProfileBuilderStateService.saveState(employeeId, {
          step: currentStep,
          formData: { ...formData, [stepId]: data },
          lastActivity: new Date().toISOString()
        });

        setLastSaved(new Date());
        setIsSaving(false);
      } catch (error) {
        console.error('Error saving progress:', error);
        toast.error('Failed to save progress');
        setIsSaving(false);
      }
    }, 2000),
    [employeeId, currentStep, formData]
  );

  const updateStepData = (stepId: string, data: any) => {
    setFormData(prev => ({ ...prev, [stepId]: data }));
    saveProgress(stepId, data);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    // Validate employeeId before proceeding
    if (!employeeId || employeeId === '') {
      toast.error('Unable to save progress - employee profile not found');
      return;
    }
    
    const currentStepData = STEPS[currentStep];
    
    // Mark current section as complete
    await EmployeeProfileService.updateProfileSection(
      employeeId,
      currentStepData.id,
      formData[currentStepData.id] || {},
      true
    );

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete profile
      await handleProfileComplete();
    }
  };

  const handleSaveDraft = async () => {
    // Validate employeeId before saving
    if (!employeeId || employeeId === '') {
      toast.error('Unable to save draft - employee profile not found');
      return;
    }
    
    try {
      setIsLoading(true);
      setIsSaving(true);
      
      // Save all profile sections, not just the current one
      const savePromises = STEPS.map(async (step) => {
        if (formData[step.id]) {
          return EmployeeProfileService.updateProfileSection(
            employeeId,
            step.id,
            formData[step.id],
            false // Not complete yet
          );
        }
      });
      
      // Save state to local storage as well
      await ProfileBuilderStateService.saveState(employeeId, {
        step: currentStep,
        formData: formData,
        lastActivity: new Date().toISOString()
      });
      
      // Wait for all saves to complete
      await Promise.all(savePromises.filter(Boolean));
      
      setLastSaved(new Date());
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft. Please try again.');
      
      // Recovery mechanism: try to at least save to local storage
      try {
        localStorage.setItem(`profile_draft_${employeeId}`, JSON.stringify({
          formData,
          currentStep,
          timestamp: new Date().toISOString()
        }));
        toast.info('Draft saved locally. Will sync when connection is restored.');
      } catch (localError) {
        console.error('Failed to save to local storage:', localError);
      }
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  const handleProfileComplete = async () => {
    try {
      setIsLoading(true);

      // Mark profile as complete
      await supabase
        .from('employees')
        .update({
          profile_complete: true,
          profile_completion_date: new Date().toISOString()
        })
        .eq('id', employeeId);

      // Clear state
      await ProfileBuilderStateService.clearState(employeeId);

      toast.success('Profile completed successfully!');
      onComplete();
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Failed to complete profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVAnalysis = async () => {
    if (!cvFile) return;

    try {
      setCvAnalysisStatus({ status: 'analyzing' });

      // Upload CV
      const formData = new FormData();
      formData.append('file', cvFile);
      formData.append('employeeId', employeeId);
      
      const { data, error } = await supabase.functions.invoke('upload-cv', {
        body: formData
      });

      if (error) throw error;

      if (data?.success) {
        // Wait for analysis to complete with timeout
        const maxAttempts = 45; // 90 seconds max (45 * 2000ms)
        let attempts = 0;
        
        const checkStatus = setInterval(async () => {
          attempts++;
          
          // Timeout after max attempts
          if (attempts >= maxAttempts) {
            clearInterval(checkStatus);
            setCvAnalysisStatus({ status: 'timeout' });
            toast.error('CV analysis is taking longer than expected. Please try again.');
            return;
          }
          
          try {
            const { data: statusData } = await supabase
              .from('cv_analysis_status')
              .select('*')
              .eq('employee_id', employeeId)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (statusData?.status === 'completed') {
              clearInterval(checkStatus);
              setCvAnalysisStatus({ status: 'completed' });
              
              // Load extracted data
              const { data: employee } = await supabase
                .from('employees')
                .select('cv_extracted_data')
                .eq('id', employeeId)
                .single();
                
              if (employee?.cv_extracted_data) {
                setCvExtractedData(employee.cv_extracted_data);
                toast.success('Experience & Education auto-filled');
              }
            } else if (statusData?.status === 'failed') {
              clearInterval(checkStatus);
              setCvAnalysisStatus({ status: 'failed' });
              toast.error('CV analysis failed');
            }
          } catch (error) {
            console.error('Error checking CV analysis status:', error);
            // Continue polling unless max attempts reached
          }
        }, 2000);
        
        // Store interval ID for cleanup
        return () => clearInterval(checkStatus);
      }
    } catch (error) {
      console.error('CV analysis error:', error);
      setCvAnalysisStatus({ status: 'failed' });
      toast.error('Failed to analyze CV');
    }
  };

  const canProceed = () => {
    const stepId = STEPS[currentStep].id;
    const stepData = formData[stepId];

    switch (stepId) {
      case 'cv_upload':
        return true; // Optional step
      case 'work_experience':
        return stepData?.length > 0;
      case 'education':
        return stepData?.length > 0;
      case 'skills':
        return stepData?.skills?.length > 0;
      case 'current_work':
        return stepData?.projects?.length > 0;
      case 'daily_tasks':
        return stepData?.selected?.length > 0;
      case 'tools_technologies':
        return stepData?.selected?.length > 0;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    const stepId = STEPS[currentStep].id;

    switch (stepId) {
      case 'cv_upload':
        return (
          <div className="space-y-6">
            {!cvExtractedData ? (
              <>
                {!cvFile ? (
                  <FileDropZone
                    onFileSelect={(file) => setCvFile(file)}
                    accept=".pdf,.doc,.docx"
                    maxSize={10 * 1024 * 1024}
                  />
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Upload className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">{cvFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCvFile(null);
                            setCvAnalysisStatus(null);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {!cvAnalysisStatus && (
                        <Button
                          className="w-full mt-4"
                          onClick={handleCVAnalysis}
                        >
                          Start CV Analysis
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {cvAnalysisStatus && (
                  <CVAnalysisProgress
                    status={cvAnalysisStatus}
                    onComplete={(extractedData) => {
                      setCvExtractedData(extractedData);
                      updateStepData('cv_upload', { extracted: true });
                    }}
                  />
                )}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-4 text-muted-foreground">OR</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={handleNext}
                  >
                    Skip and fill manually
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Check className="h-12 w-12 text-green-500 mx-auto" />
                    <h3 className="text-lg font-medium">Experience & Education auto-filled</h3>
                    <p className="text-sm text-muted-foreground">
                      Your work experience and education have been extracted from your CV. 
                      You can edit them in the next steps.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'work_experience':
        return (
          <WorkExperienceForm
            initialData={cvExtractedData?.work_experience || formData.work_experience || []}
            onComplete={(data) => updateStepData('work_experience', data)}
          />
        );

      case 'education':
        return (
          <EducationForm
            initialData={cvExtractedData?.education || formData.education || []}
            onComplete={(data) => updateStepData('education', data)}
          />
        );

      case 'skills':
        return (
          <SkillsSelector
            extractedSkills={cvExtractedData?.skills || []}
            existingSkills={formData.skills?.skills || []}
            onComplete={(skills) => updateStepData('skills', { skills })}
            onSkip={() => handleNext()}
          />
        );

      case 'current_work':
        return (
          <CurrentProjectsForm
            initialData={formData.current_work || {}}
            onComplete={(data) => updateStepData('current_work', data)}
          />
        );

      case 'daily_tasks':
        // Load suggestions when reaching this step
        if (personalizedSuggestions.challenges.length === 0 && !loadingSuggestions) {
          loadPersonalizedSuggestions({
            currentProjects: formData.current_work?.projects || [],
            teamSize: formData.current_work?.teamSize || 'Unknown',
            roleInTeam: formData.current_work?.roleInTeam || 'Unknown'
          });
        }

        return loadingSuggestions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Generating personalized challenges...</span>
          </div>
        ) : (
          <MultiSelectCards
            title="Professional Challenges"
            description="Select challenges that resonate with your experience"
            options={personalizedSuggestions.challenges.map((challenge, index) => ({
              id: `challenge-${index}`,
              icon: '🎯',
              title: challenge,
              description: ''
            }))}
            selected={formData.daily_tasks?.selected || []}
            onComplete={(selected) => updateStepData('daily_tasks', { selected })}
          />
        );

      case 'tools_technologies':
        return loadingSuggestions ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Preparing growth opportunities...</span>
          </div>
        ) : (
          <MultiSelectCards
            title="Growth Opportunities"
            description="Select areas where you'd like to develop further"
            options={personalizedSuggestions.growthAreas.map((area, index) => ({
              id: `growth-${index}`,
              icon: '🚀',
              title: area,
              description: ''
            }))}
            selected={formData.tools_technologies?.selected || []}
            onComplete={(selected) => updateStepData('tools_technologies', { selected })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar - My Profile */}
      <ProfileSidebar
        steps={STEPS.map((step, index) => ({
          id: index,
          name: step.id,
          title: step.title,
          status: index < currentStep ? 'completed' : 
                  index === currentStep ? 'current' : 'upcoming'
        }))}
        currentStep={currentStep}
        employeeName={employeeName || 'there'}
        onStepClick={(stepId) => {
          if (stepId <= currentStep) {
            setCurrentStep(stepId);
          }
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Heading + Breadcrumb */}
        <div className="border-b bg-card px-8 py-4">
          <h1 className="text-xl font-semibold">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
          </h1>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {renderStepContent()}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t bg-card px-8 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Prev Step
            </Button>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading || isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </>
                )}
              </Button>
              
              {isSaving && (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving all sections...
                </span>
              )}
              
              {lastSaved && !isSaving && !isLoading && (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Check className="h-3 w-3 text-green-500" />
                  Last saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
            >
              {currentStep === STEPS.length - 1 ? 'Submit Profile' : 'Next Step'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}