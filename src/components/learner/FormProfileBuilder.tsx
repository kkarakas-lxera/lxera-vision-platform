import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Save, Check, Loader2, Upload, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from 'lodash';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Reuse existing form components
import FileDropZone from './chat/FileDropZone';
import CVAnalysisProgress from './chat/CVAnalysisProgress';
import WorkExperienceForm from './chat/WorkExperienceForm';
import EducationForm from './chat/EducationForm';
import SkillsSelector from './chat/SkillsSelector';
import MultiSelectCards from './chat/MultiSelectCards';
import CurrentProjectsForm from './chat/CurrentProjectsForm';
import CertificationsForm from './chat/CertificationsForm';
import LanguagesForm from './chat/LanguagesForm';
import ProfileSidebar from './ProfileSidebar';
import ProfileVerification from './ProfileVerification';
import { EmployeeProfileService, ProfileSection } from '@/services/employeeProfileService';
import { ProfileBuilderStateService } from '@/services/profileBuilderStateService';

interface FormProfileBuilderProps {
  employeeId: string;
  onComplete: () => void;
}

const STEPS = [
  { id: 'cv_upload', title: 'CV Upload' },
  { id: 'work_experience', title: 'Work Experience' },
  { id: 'education', title: 'Education' },
  { id: 'certifications', title: 'Certifications' },
  { id: 'languages', title: 'Languages' },
  { id: 'skills', title: 'Skills Review' },
  { id: 'current_work', title: 'Current Projects' },
  { id: 'daily_tasks', title: 'Professional Challenges' },
  { id: 'tools_technologies', title: 'Growth Opportunities' },
  { id: 'profile_verification', title: 'Profile Verification' }
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
  const [pollIntervalRef, setPollIntervalRef] = useState<NodeJS.Timeout | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [employee, setEmployee] = useState<any>(null);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<{
    challenges: string[];
    growthAreas: string[];
  }>({ challenges: [], growthAreas: [] });
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load existing profile data and state
  useEffect(() => {
    loadProfileData();
    
    // Cleanup polling interval on unmount
    return () => {
      if (pollIntervalRef) {
        clearInterval(pollIntervalRef);
      }
    };
  }, [employeeId, pollIntervalRef]);

  const loadProfileData = async () => {
    try {
      // Load employee data with position requirements
      const { data: employee } = await supabase
        .from('employees')
        .select(`
          *,
          users!inner(full_name),
          current_position:st_company_positions!current_position_id(
            id,
            position_title,
            position_level,
            department,
            required_skills,
            nice_to_have_skills
          ),
          target_position:st_company_positions!target_position_id(
            id,
            position_title,
            required_skills,
            nice_to_have_skills
          )
        `)
        .eq('id', employeeId)
        .single();

      if (employee) {
        setEmployee(employee);
        setEmployeeName(employee.users?.full_name || 'there');
        
        // Check if CV was already uploaded
        if (employee.cv_file_path) {
          setCvExtractedData(employee.cv_extracted_data);
          setCvAnalysisStatus({ status: 'completed' });
        }
      }

      // Check for stuck CV analysis ONLY if a CV is currently associated with the employee.
      // After a successful "Start Over" the CV file path will be cleared, so any historical
      // or RLS-protected rows in `cv_analysis_status` should be ignored.
      if (employee?.cv_file_path) {
        const { data: analysisStatus } = await supabase
          .from('cv_analysis_status')
          .select('*')
          .eq('employee_id', employeeId)
          .single();

        if (analysisStatus) {
          // If analysis is stuck in 'started' or has been running for too long
          const createdAt = new Date(analysisStatus.created_at);
          const now = new Date();
          const minutesElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60);

          if (
            analysisStatus.status === 'started' ||
            (analysisStatus.status === 'analyzing' && minutesElapsed > 5)
            // REMOVED: Don't treat long-completed status as stuck - this was the bug!
          ) {
            console.warn(`Detected stuck CV analysis: status=${analysisStatus.status}, minutes elapsed=${minutesElapsed}`);
            // Show as completed but stuck - only for truly stuck analysis
            setCvAnalysisStatus({ status: 'completed' });
            setCvExtractedData(null);
          } else if (analysisStatus.status === 'completed') {
            // Normal completed state - preserve existing extracted data if it exists
            setCvAnalysisStatus({ status: 'completed' });
            // Don't null the extracted data - it should already be loaded from employee record
          }
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

  // Create debounced save function outside of useCallback to prevent recreating
  const debouncedSave = React.useMemo(
    () => debounce(async (employeeId: string, stepId: string, data: any, currentStep: number, formData: any) => {
      // Validate employeeId before saving
      if (!employeeId || employeeId === '') {
        console.error('Invalid employee ID - cannot save progress');
        return;
      }
      
      // Validate stepId is a valid section name
      const validSectionNames = ['cv_upload', 'basic_info', 'work_experience', 'education', 'skills', 
        'certifications', 'languages', 'projects', 'current_work', 'daily_tasks', 'tools_technologies'];
      if (!stepId || !validSectionNames.includes(stepId)) {
        console.error('Invalid section name:', stepId);
        return;
      }
      
      try {
        setIsSaving(true);
        
        // Save to database with proper type casting
        await EmployeeProfileService.updateProfileSection(
          employeeId,
          stepId as ProfileSection['name'],
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
    [] // Empty dependency array - created only once
  );

  // Auto-save functionality
  const saveProgress = useCallback(
    (stepId: string, data: any) => {
      debouncedSave(employeeId, stepId, data, currentStep, formData);
    },
    [employeeId, currentStep, formData, debouncedSave]
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
    try {
      // Validate employeeId before proceeding
      if (!employeeId || employeeId === '') {
        toast.error('Unable to save progress - employee profile not found');
        return;
      }
      
      const currentStepData = STEPS[currentStep];
      
      // Check if current step meets requirements before proceeding
      if (!canProceed()) {
        toast.error('Please complete the current step before proceeding');
        return;
      }
      
      // Mark current section as complete
      await EmployeeProfileService.updateProfileSection(
        employeeId,
        currentStepData.id as ProfileSection['name'],
        formData[currentStepData.id] || {},
        true
      );

      if (currentStep < STEPS.length - 1) {
        // Save skills to validation table when moving from skills step or to verification step
        const isLeavingSkillsStep = STEPS[currentStep].id === 'skills' && formData.skills?.skills;
        const isEnteringVerificationStep = STEPS[currentStep + 1].id === 'profile_verification' && formData.skills?.skills;
        
        if (isLeavingSkillsStep || isEnteringVerificationStep) {
          await saveUnverifiedSkills(formData.skills.skills);
        }
        setCurrentStep(currentStep + 1);
      } else {
        // Complete profile
        await handleProfileComplete();
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      toast.error('Failed to proceed to next step. Please try again.');
    }
  };

  const handleSkipCVUpload = () => {
    // Skip CV upload and move to next step without saving
    if (currentStep === 0 && STEPS[currentStep].id === 'cv_upload') {
      setCurrentStep(1);
      updateStepData('cv_upload', { skipped: true });
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
            step.id as ProfileSection['name'],
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

  const saveUnverifiedSkills = async (skills: any[]) => {
    try {
      // Prepare skills for validation table
      const skillsToValidate = skills.map(skill => ({
        employee_id: employeeId,
        skill_name: skill.skill_name,
        skill_id: skill.skill_id || null,
        is_from_position: skill.source === 'position',
        is_from_cv: skill.source === 'cv',
        assessment_type: null, // Will be set during verification
        proficiency_level: null // Will be determined during verification
      }));

      // Insert skills into validation table (upsert to avoid duplicates)
      for (const skill of skillsToValidate) {
        const { error } = await supabase
          .from('employee_skills_validation')
          .upsert(skill, {
            onConflict: 'employee_id,skill_name'
          });

        if (error) {
          console.error('Error saving skill for validation:', error);
        }
      }
    } catch (error) {
      console.error('Error saving unverified skills:', error);
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

  const handleCVAnalysisRestart = async () => {
    try {
      setIsLoading(true);
      
      // CRITICAL: Stop any running polling intervals first
      if (pollIntervalRef) {
        clearInterval(pollIntervalRef);
        setPollIntervalRef(null);
      }
      
      // Clear CV analysis data from database
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          cv_file_path: null,
          cv_uploaded_at: null,
          cv_extracted_data: null,
          cv_analysis_data: null
        })
        .eq('id', employeeId);

      if (updateError) throw updateError;

      // Clear CV analysis status
      const { error: statusError } = await supabase
        .from('cv_analysis_status')
        .delete()
        .eq('employee_id', employeeId);

      if (statusError) console.error('Error clearing CV status:', statusError);

      // Clear any stored profile sections related to CV
      // Delete the sections instead of updating with null
      const { error: deleteError } = await supabase
        .from('employee_profile_sections')
        .delete()
        .eq('employee_id', employeeId)
        .in('section_name', ['cv_upload', 'work_experience', 'education']);
      
      if (deleteError) console.error('Error deleting profile sections:', deleteError);

      // CRITICAL: Clear the ProfileBuilderStateService state to prevent old data from being restored
      await ProfileBuilderStateService.clearState(employeeId);
      
      // Reset local state to initial state (as if visiting for first time)
      setCvFile(null);
      setCvAnalysisStatus(null);
      setCvExtractedData(null);
      setCurrentStep(0); // Reset to CV upload step
      setFormData(prev => {
        const newData = { ...prev };
        delete newData.cv_upload;
        delete newData.work_experience;
        delete newData.education;
        return newData;
      });
      
      toast.success('Ready to start fresh. Please upload your CV or skip this step.');
    } catch (error) {
      console.error('Error restarting CV analysis:', error);
      toast.error('Failed to reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCVAnalysis = async () => {
    if (!cvFile) return;

    try {
      setCvAnalysisStatus({ status: 'analyzing' });

      // Upload and analyze CV
      const formData = new FormData();
      formData.append('file', cvFile);
      formData.append('employeeId', employeeId);
      
      // Use fetch directly for FormData
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');
      
      // Get Supabase URL from the client
      const supabaseUrl = (supabase as any).supabaseUrl || (supabase as any).realtimeUrl?.replace('/realtime/v1', '');
      const supabaseAnonKey = (supabase as any).supabaseKey;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-cv-enhanced`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey || '',
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to analyze CV');
      }

      const data = await response.json();

      if (data?.success) {
        // Wait for analysis to complete with timeout
        const maxAttempts = 45; // 90 seconds max (45 * 2000ms)
        let attempts = 0;
        
        const checkStatus = setInterval(async () => {
          attempts++;
          
          // Timeout after max attempts
          if (attempts >= maxAttempts) {
            clearInterval(checkStatus);
            setPollIntervalRef(null);
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
              setPollIntervalRef(null);
              setCvAnalysisStatus({ status: 'completed' });
              
              // Add retry logic for loading extracted data with exponential backoff
              let retryAttempts = 0;
              const maxRetries = 5;
              
              const loadExtractedData = async () => {
                try {
                  const { data: employee } = await supabase
                    .from('employees')
                    .select('cv_extracted_data')
                    .eq('id', employeeId)
                    .single();
                    
                  if (employee?.cv_extracted_data) {
                    setCvExtractedData(employee.cv_extracted_data);
                    toast.success('Experience & Education auto-filled');
                    return true;
                  } else if (retryAttempts < maxRetries) {
                    retryAttempts++;
                    const delay = Math.min(1000 * Math.pow(2, retryAttempts), 5000); // Exponential backoff, max 5s
                    console.log(`CV data not ready yet, retrying in ${delay}ms (attempt ${retryAttempts}/${maxRetries})`);
                    setTimeout(loadExtractedData, delay);
                    return false;
                  } else {
                    console.warn('CV analysis completed but no extracted data found after retries');
                    // Still considered successful - user can continue manually
                    toast.info('CV analysis completed. You can proceed to fill information manually.');
                    return true;
                  }
                } catch (error) {
                  console.error('Error loading extracted data:', error);
                  if (retryAttempts < maxRetries) {
                    retryAttempts++;
                    const delay = Math.min(1000 * Math.pow(2, retryAttempts), 5000);
                    setTimeout(loadExtractedData, delay);
                    return false;
                  } else {
                    toast.error('Failed to load CV data. Please try restarting the analysis.');
                    return false;
                  }
                }
              };
              
              // Start loading extracted data
              await loadExtractedData();
            } else if (statusData?.status === 'failed') {
              clearInterval(checkStatus);
              setPollIntervalRef(null);
              setCvAnalysisStatus({ status: 'failed' });
              toast.error('CV analysis failed');
            }
          } catch (error) {
            console.error('Error checking CV analysis status:', error);
            // Continue polling unless max attempts reached
          }
        }, 2000);
        
        // Store interval ID for cleanup
        setPollIntervalRef(checkStatus);
      }
    } catch (error) {
      console.error('CV analysis error:', error);
      setCvAnalysisStatus({ status: 'failed' });
      toast.error('Failed to analyze CV');
    }
  };

  // Helper function to check for CV extracted data in both old and new formats
  const hasExtractedWorkExperience = () => {
    return (cvExtractedData?.work_experience && cvExtractedData.work_experience.length > 0) ||
           (cvExtractedData?.['Work Experience'] && cvExtractedData['Work Experience'].length > 0);
  };

  const hasExtractedEducation = () => {
    return (cvExtractedData?.education && cvExtractedData.education.length > 0) ||
           (cvExtractedData?.['Education'] && cvExtractedData['Education'].length > 0);
  };

  const hasExtractedSkills = () => {
    // Check for skills in multiple formats
    if (cvExtractedData?.skills && cvExtractedData.skills.length > 0) {
      return true;
    }
    
    // Check for old capitalized format
    if (cvExtractedData?.['Skills']) {
      if (Array.isArray(cvExtractedData['Skills']) && cvExtractedData['Skills'].length > 0) {
        return true;
      }
      // Check for nested skills structure
      if (cvExtractedData['Skills']['Technical Skills'] || cvExtractedData['Skills']['Soft Skills']) {
        const techSkills = cvExtractedData['Skills']['Technical Skills'] || [];
        const softSkills = cvExtractedData['Skills']['Soft Skills'] || [];
        return techSkills.length > 0 || softSkills.length > 0;
      }
    }
    
    return false;
  };

  const canProceed = () => {
    const stepId = STEPS[currentStep].id;
    const stepData = formData[stepId];

    console.log(`[canProceed] Checking step: ${stepId}`, {
      stepData: stepData ? 'exists' : 'null',
      cvExtractedData: cvExtractedData ? 'exists' : 'null',
      hasWorkExp: hasExtractedWorkExperience(),
      hasEducation: hasExtractedEducation(),
      hasSkills: hasExtractedSkills()
    });

    switch (stepId) {
      case 'cv_upload':
        return true; // Optional step - can always proceed
      case 'work_experience':
        // Can proceed if we have CV extracted data OR manual data
        return hasExtractedWorkExperience() || (stepData?.length > 0);
      case 'education':
        // Can proceed if we have CV extracted data OR manual data
        return hasExtractedEducation() || (stepData?.length > 0);
      case 'skills':
        // Can proceed if we have CV extracted skills OR manual skills
        return hasExtractedSkills() || (stepData?.skills?.length > 0);
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
                {/* Only show upload options when NOT analyzing or completed */}
                {cvAnalysisStatus?.status !== 'analyzing' && cvAnalysisStatus?.status !== 'completed' && (
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
                  </>
                )}
                
                {/* Show analysis progress */}
                {cvAnalysisStatus && (
                  <>
                    <CVAnalysisProgress
                      status={cvAnalysisStatus}
                      onComplete={async (extractedData) => {
                        // If no extracted data passed, try to load from database
                        if (!extractedData) {
                          const { data: employee } = await supabase
                            .from('employees')
                            .select('cv_extracted_data')
                            .eq('id', employeeId)
                            .single();
                          
                          if (employee?.cv_extracted_data) {
                            setCvExtractedData(employee.cv_extracted_data);
                            updateStepData('cv_upload', { extracted: true });
                            toast.success('CV data loaded successfully');
                          } else {
                            // If still no data, show the stuck message
                            setCvAnalysisStatus({ status: 'completed' });
                          }
                        } else {
                          setCvExtractedData(extractedData);
                          updateStepData('cv_upload', { extracted: true });
                        }
                      }}
                      onRetry={() => {
                        setCvAnalysisStatus(null);
                        handleCVAnalysis();
                      }}
                    />
                    
                    {/* Show restart button when analysis is stuck in 'completed' state without extracted data */}
                    {cvAnalysisStatus.status === 'completed' && !cvExtractedData && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-amber-900">
                              Analysis seems to be stuck
                            </h3>
                            <p className="text-sm text-amber-700 mt-1">
                              The analysis completed but data couldn't be loaded. You can restart the analysis or skip this step to continue manually.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSkipCVUpload}
                              disabled={isLoading}
                            >
                              Skip & Continue
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCVAnalysisRestart}
                              disabled={isLoading}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Start Over
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                {/* Only show OR section when no file is selected and not analyzing/completed */}
                {!cvFile && cvAnalysisStatus?.status !== 'analyzing' && cvAnalysisStatus?.status !== 'completed' && (
                  <>
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
                        onClick={handleSkipCVUpload}
                      >
                        Skip and fill manually
                      </Button>
                    </div>
                  </>
                )}
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
                    <Button
                      variant="outline"
                      onClick={handleCVAnalysisRestart}
                      disabled={isLoading}
                      className="mt-4"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Start Over with Different CV
                    </Button>
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

      case 'certifications':
        return (
          <CertificationsForm
            initialData={cvExtractedData?.certifications || formData.certifications || []}
            onComplete={(data) => updateStepData('certifications', data)}
          />
        );

      case 'languages':
        return (
          <LanguagesForm
            initialData={cvExtractedData?.languages || formData.languages || []}
            onComplete={(data) => updateStepData('languages', data)}
          />
        );

      case 'skills':
        // Get position skills from employee data
        const positionRequiredSkills = employee?.current_position?.required_skills || [];
        const positionNiceToHaveSkills = employee?.current_position?.nice_to_have_skills || [];
        
        return (
          <SkillsSelector
            extractedSkills={cvExtractedData?.skills || []}
            existingSkills={formData.skills?.skills || []}
            positionRequiredSkills={positionRequiredSkills}
            positionNiceToHaveSkills={positionNiceToHaveSkills}
            positionTitle={employee?.current_position?.position_title}
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
            subtitle="Select challenges that resonate with your experience"
            items={personalizedSuggestions.challenges || []}
            selectedItems={formData.daily_tasks?.selected || []}
            onSelectionChange={(selected) => updateStepData('daily_tasks', { selected })}
            onComplete={(selectedItems) => {
              updateStepData('daily_tasks', { selected: selectedItems });
              handleNext();
            }}
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
            subtitle="Select areas where you'd like to develop further"
            items={personalizedSuggestions.growthAreas || []}
            selectedItems={formData.tools_technologies?.selected || []}
            onSelectionChange={(selected) => updateStepData('tools_technologies', { selected })}
            onComplete={(selectedItems) => {
              updateStepData('tools_technologies', { selected: selectedItems });
              handleNext();
            }}
          />
        );

      case 'profile_verification':
        // Calculate years of experience more accurately
        const calculateTotalYears = () => {
          if (!formData.work_experience || formData.work_experience.length === 0) return 0;
          
          let totalMonths = 0;
          formData.work_experience.forEach((exp: any) => {
            if (exp.start_date && exp.end_date) {
              const start = new Date(exp.start_date);
              const end = exp.end_date === 'Present' ? new Date() : new Date(exp.end_date);
              totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            }
          });
          return Math.round(totalMonths / 12);
        };

        // Extract technologies from projects and CV
        const extractTechnologies = () => {
          const techs = new Set<string>();
          // From current projects
          if (formData.current_work?.projects) {
            formData.current_work.projects.forEach((project: string) => {
              // Simple extraction of common tech keywords
              const techKeywords = project.match(/\b(React|Node|Python|Java|AWS|Docker|Kubernetes|SQL|MongoDB|Redis|TypeScript|JavaScript|Vue|Angular|GraphQL|REST|API|CI\/CD|Git)\b/gi);
              if (techKeywords) {
                techKeywords.forEach(tech => techs.add(tech));
              }
            });
          }
          // From CV extracted skills
          if (cvExtractedData?.skills) {
            cvExtractedData.skills.forEach((skill: any) => {
              if (typeof skill === 'string') techs.add(skill);
              else if (skill.skill_name) techs.add(skill.skill_name);
            });
          }
          return Array.from(techs);
        };

        // Get previous job titles
        const getPreviousPositions = () => {
          if (!formData.work_experience) return [];
          return formData.work_experience
            .map((exp: any) => exp.job_title)
            .filter((title: string) => title && title !== employee?.current_position?.position_title);
        };

        // Get related skills from selected skills
        const getRelatedSkills = () => {
          if (!formData.skills?.skills) return [];
          return formData.skills.skills
            .map((skill: any) => skill.skill_name)
            .slice(0, 10); // Limit to 10 most relevant
        };

        // Prepare enhanced employee context
        const employeeContext = {
          // Basic info
          years_experience: formData.work_experience?.length || 0,
          current_projects: formData.current_work?.projects || [],
          daily_challenges: formData.daily_tasks?.selected || [],
          education_level: formData.education?.[0]?.degree || 'Not specified',
          work_experience: formData.work_experience || [],
          
          // Enhanced context
          total_years_in_field: calculateTotalYears(),
          team_size: formData.current_work?.teamSize || 'Not specified',
          role_in_team: formData.current_work?.roleInTeam || 'Not specified',
          recent_technologies: extractTechnologies(),
          certifications: formData.certifications?.map((cert: any) => cert.name) || [],
          previous_positions: getPreviousPositions(),
          related_skills: getRelatedSkills(),
          // Note: years_with_skill would need to be calculated per skill during assessment
        };

        return (
          <ProfileVerification
            employeeId={employeeId}
            positionId={employee?.current_position_id}
            positionTitle={employee?.current_position?.position_title}
            employeeContext={employeeContext}
            onComplete={() => handleNext()}
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

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-block">
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed() || isLoading}
                    >
                      {currentStep === STEPS.length - 1 ? 'Complete Profile' : 'Next Step'}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </span>
                </TooltipTrigger>
                {!canProceed() && (
                  <TooltipContent>
                    <p>Please complete the current step before proceeding</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}