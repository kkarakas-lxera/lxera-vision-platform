import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import { ChatMessageService } from '@/services/chatMessageService';
import { ProfileBuilderStateService, type ProfileBuilderState } from '@/services/profileBuilderStateService';
import { toast } from 'sonner';
import type React from 'react';

// Types (copied from original file)
interface Message {
  id: string;
  type: 'bot' | 'user' | 'achievement' | 'challenge' | 'system';
  content: string | React.ReactNode;
  timestamp: Date;
  points?: number;
  achievement?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
  };
  metadata?: any;
}

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
}

interface FormData {
  currentPosition: string;
  department: string;
  timeInRole: string;
  workExperience: WorkExperience[];
  education: Education[];
  currentProjects: string[];
  teamSize: string;
  roleInTeam: string;
  challenges: string[];
  growthAreas: string[];
}

const STEPS = [
  { id: 1, name: 'cv_upload', title: 'CV Upload' },
  { id: 2, name: 'work_experience', title: 'Work Experience' },
  { id: 3, name: 'education', title: 'Education' },
  { id: 4, name: 'skills', title: 'Skills Review' },
  { id: 5, name: 'current_work', title: 'Current Projects' },
  { id: 6, name: 'challenges', title: 'Challenges' },
  { id: 7, name: 'growth', title: 'Growth Areas' }
];

// Load chat history
export const loadChatHistory = async (
  employeeId: string,
  setMessages: (messages: Message[]) => void,
  setHasMoreMessages: (hasMore: boolean) => void,
  setCvUploaded: (uploaded: boolean) => void,
  setNavigationState: (state: any) => void,
  showQuickReplies: (replies: any[]) => void,
  initializeChat: () => void,
  setCvState: (state: any) => void,
  cvUploaded: boolean,
  handleSectionAccept: (section: string) => void,
  handleSectionUpdate: (section: string, data: any) => void,
  handleAllSectionsComplete: () => void
) => {
  try {
    const recentMessages = await ChatMessageService.getRecentMessages(employeeId, 10);
    
    if (recentMessages.length > 0) {
      // Check if there are more messages
      const { total } = await ChatMessageService.getAllMessages(employeeId, 0, 1);
      console.log('Chat history check:', { 
        recentMessagesLength: recentMessages.length, 
        totalMessages: total, 
        hasMore: total > 10 
      });
      setHasMoreMessages(total > 10);
      
      // Check if CV has been uploaded from chat history
      const cvUploadMessage = recentMessages.find(msg => 
        msg.content?.includes('📄 Uploading') || 
        msg.metadata?.componentType === 'CVExtractedSections'
      );
      if (cvUploadMessage) {
        setCvUploaded(true);
      }
      
      // Convert saved messages to app format
      const formattedMessages: Message[] = recentMessages.map((msg: { id?: string; message_type: string; content: string; created_at?: string; metadata?: any; step?: string }) => {
        // Handle special system messages that need component restoration
        if (msg.message_type === 'system' && msg.metadata?.componentType === 'CVExtractedSections') {
          return {
            id: msg.id || crypto.randomUUID(),
            type: 'system' as Message['type'],
            content: (
              <CVExtractedSections
                extractedData={msg.metadata.extractedData || {}}
                onSectionAccept={handleSectionAccept}
                onSectionUpdate={handleSectionUpdate}
                onComplete={handleAllSectionsComplete}
              />
            ),
            timestamp: new Date(msg.created_at || Date.now()),
            metadata: msg.metadata
          };
        }
        
        return {
          id: msg.id || crypto.randomUUID(),
          type: msg.message_type as Message['type'],
          content: msg.content,
          timestamp: new Date(msg.created_at || Date.now()),
          metadata: msg.metadata
        };
      });
      
      setMessages(formattedMessages);
      
      // Resume from last step if available
      const lastStep = recentMessages.reduce((maxStep, msg) => {
        const msgStep = msg.step ? parseInt(msg.step) : 0;
        return msgStep > maxStep ? msgStep : maxStep;
      }, 0);
      
      if (lastStep > 0) {
        // We have existing progress - set the step and load saved state
        setNavigationState(prev => ({ 
          ...prev, 
          currentStep: lastStep,
          maxStepReached: Math.max(prev.maxStepReached, lastStep)
        }));
        
        // Important: Don't show any new messages, just restore the step UI
        // The messages are already loaded from history
        return; // Exit early - don't initialize chat or show welcome messages
      } else {
        // Check if we're at step 0 but have started (e.g., saw the welcome message)
        const hasStarted = recentMessages.some(msg => 
          msg.content?.includes('How does that sound?') ||
          msg.content?.includes("Let's start!")
        );
        
        if (hasStarted) {
          // User has seen welcome but hasn't started step 1 yet
          const lastBotMessage = recentMessages.filter(msg => msg.message_type === 'bot').pop();
          if (lastBotMessage?.content?.includes('How does that sound?')) {
            // Recreate the initial quick replies
            setTimeout(() => {
              showQuickReplies([
                { label: "Let's start! 🚀", value: "start", points: 50, variant: 'primary' },
                { label: "Tell me more", value: "more_info" },
                { label: "What rewards?", value: "rewards" }
              ]);
            }, 500);
          }
          return; // Exit early - don't show duplicate welcome
        }
        
        // Check if we're in the middle of CV upload
        const hasUploadMessage = recentMessages.some(msg => 
          msg.content?.includes('Upload CV') || msg.content?.includes('paperclip icon')
        );
        if (hasUploadMessage && !cvUploaded) {
          setCvState(prev => ({ ...prev, waitingForUpload: true }));
          setNavigationState(prev => ({ 
            ...prev, 
            currentStep: 1,
            maxStepReached: Math.max(prev.maxStepReached, 1)
          }));
          return; // Exit early
        }
      }
    } else {
      // No history, start fresh
      initializeChat();
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
    initializeChat();
  }
};

// Load more messages
export const loadMoreMessages = async (
  employeeId: string,
  messages: Message[],
  hasMoreMessages: boolean,
  loadingHistory: boolean,
  setLoadingHistory: (loading: boolean) => void,
  setMessages: (messages: Message[]) => void,
  setHasMoreMessages: (hasMore: boolean) => void
) => {
  if (loadingHistory || !hasMoreMessages) return;
  
  setLoadingHistory(true);
  try {
    const currentCount = messages.length;
    const { messages: olderMessages, hasMore } = await ChatMessageService.getAllMessages(
      employeeId,
      currentCount,
      20
    );
    
    if (olderMessages.length > 0) {
      const formattedMessages: Message[] = olderMessages.map(msg => ({
        id: msg.id || crypto.randomUUID(),
        type: msg.message_type as Message['type'],
        content: msg.content,
        timestamp: new Date(msg.created_at || Date.now()),
        metadata: msg.metadata
      }));
      
      setMessages(prev => [...formattedMessages, ...prev]);
      setHasMoreMessages(hasMore);
    }
  } catch (error) {
    console.error('Error loading more messages:', error);
  } finally {
    setLoadingHistory(false);
  }
};

// Load existing employee data
export const loadEmployeeData = async (
  employeeId: string,
  setEmployeeData: (data: any) => void,
  setFormData: (data: FormData) => void,
  setPoints: (points: number) => void,
  setStreak: (streak: number) => void,
  setCvExtractedData: (data: any) => void,
  setCvUploaded: (uploaded: boolean) => void,
  setBuilderState: (state: ProfileBuilderState | null) => void,
  setMaxStepReached: (step: number) => void
) => {
  try {
    const { data: employee } = await supabase
      .from('employees')
      .select(`
        *, 
        companies(name),
        st_company_positions!employees_current_position_id_fkey(
          position_title,
          department
        )
      `)
      .eq('id', employeeId)
      .single();

    if (employee) {
      setEmployeeData(employee);
      setFormData(prev => ({
        ...prev,
        currentPosition: employee.st_company_positions?.position_title || '',
        department: employee.st_company_positions?.department || ''
      }));
      
      // Restore points and streak
      if (employee.profile_builder_points !== null) {
        setPoints(employee.profile_builder_points);
      }
      if (employee.profile_builder_streak !== null) {
        setStreak(employee.profile_builder_streak);
      }
      
      // Load CV extracted data if available
      if (employee.cv_extracted_data) {
        setCvExtractedData(employee.cv_extracted_data);
        setCvUploaded(true);
        console.log('Loaded CV extracted data from employee:', employee.cv_extracted_data);
        
        // Update form data with CV data - handle both old and new formats
        if (employee.cv_extracted_data.work_experience) {
          setFormData(prev => ({
            ...prev,
            workExperience: employee.cv_extracted_data.work_experience.map((exp: any) => ({
              title: exp.title || exp.position || '',
              company: exp.company || '',
              duration: exp.duration || exp.dates || `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
              description: exp.description || '',
              responsibilities: exp.responsibilities || [],
              achievements: exp.achievements || exp.key_achievements || [],
              technologies: exp.technologies || []
            }))
          }));
        }
        if (employee.cv_extracted_data.education) {
          setFormData(prev => ({
            ...prev,
            education: employee.cv_extracted_data.education.map((edu: any) => ({
              degree: edu.degree || '',
              institution: edu.institution || '',
              year: edu.year || '',
              fieldOfStudy: edu.fieldOfStudy || ''
            }))
          }));
        }
      }
    }

    // Load existing profile sections
    const sections = await EmployeeProfileService.getProfileSections(employeeId);
    
    // Load saved profile builder state
    const savedState = await ProfileBuilderStateService.loadState(employeeId);
    if (savedState) {
      setBuilderState(savedState);
      // Restore form data if available
      if (savedState.formData) {
        setFormData(savedState.formData);
      }
      // Restore max step reached
      if (savedState.maxStepReached) {
        setMaxStepReached(savedState.maxStepReached);
      }
    }
    
    // Process sections and update formData as needed
    
  } catch (error) {
    console.error('Error loading employee data:', error);
  }
};

// Save points to database
export const savePointsToDatabase = async (employeeId: string, newPoints: number, streak: number) => {
  try {
    await supabase
      .from('employees')
      .update({ 
        profile_builder_points: newPoints,
        profile_builder_streak: streak
      })
      .eq('id', employeeId);
  } catch (error) {
    console.error('Failed to save points:', error);
  }
};

// Save step data
export const saveStepData = async (
  employeeId: string,
  currentStepRef: React.MutableRefObject<number>,
  maxStepReached: number,
  formData: FormData,
  currentWorkIndex: number,
  currentEducationIndex: number,
  cvAcceptedSections: any,
  stepHistory: Map<any, any>,
  awardedMilestones: Set<string>,
  isAutoSave = false
) => {
  const step = currentStepRef.current;
  if (step === 0 || step > STEPS.length) return;
  
  try {
    const stepName = STEPS[step - 1].name;
    
    // Convert step history Map to array for storage
    const stepHistoryArray = Array.from(stepHistory.entries()).map(([stepId, history]) => ({
      stepId,
      status: history.status,
      firstVisitedAt: history.firstVisitedAt.toISOString(),
      lastVisitedAt: history.lastVisitedAt.toISOString(),
      visitCount: history.visitCount,
      completedAt: history.completedAt?.toISOString(),
      milestoneAwarded: history.milestoneAwarded
    }));
    
    // Save comprehensive state
    const currentBuilderState: ProfileBuilderState = {
      step,
      maxStepReached,
      formData,
      lastActivity: new Date().toISOString(),
      // Add component-specific states
      workExperienceState: {
        currentIndex: currentWorkIndex,
        verifiedIndexes: [],
        editingStates: {}
      },
      educationState: {
        currentIndex: currentEducationIndex,
        verifiedIndexes: [],
        editingStates: {}
      },
      cvSectionsState: {
        acceptedSections: cvAcceptedSections,
        currentSection: 'work'
      },
      // Context-aware navigation tracking
      stepHistory: stepHistoryArray,
      awardedMilestones: Array.from(awardedMilestones),
      awardedAchievements: [] // TODO: Track achievements properly
    };
    
    await ProfileBuilderStateService.saveState(employeeId, currentBuilderState);
    
    switch (stepName) {
      case 'work_experience':
        await EmployeeProfileService.saveSection(employeeId, 'work_experience', {
          experience: formData.workExperience
        });
        break;
        
      case 'education':
        await EmployeeProfileService.saveSection(employeeId, 'education', {
          education: formData.education.length > 0 ? formData.education : [{
            degree: formData.highestDegree,
            field: formData.fieldOfStudy,
            institution: formData.institution,
            graduationYear: formData.graduationYear
          }]
        });
        break;
        
      case 'current_work':
        await EmployeeProfileService.saveSection(employeeId, 'current_work', {
          projects: formData.currentProjects,
          teamSize: formData.teamSize,
          role: formData.roleInTeam
        });
        break;
        
      case 'challenges':
        await EmployeeProfileService.saveSection(employeeId, 'daily_tasks', {
          challenges: formData.challenges
        });
        break;
        
      case 'growth':
        await EmployeeProfileService.saveSection(employeeId, 'tools_technologies', {
          growthAreas: formData.growthAreas
        });
        break;
    }
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Handle start fresh - clear all data
export const handleStartFresh = async (
  employeeId: string,
  employeeData: any,
  setMessages: (messages: Message[]) => void,
  setCurrentStep: (step: number) => void,
  setMaxStepReached: (step: number) => void,
  setPoints: (points: number) => void,
  setStreak: (streak: number) => void,
  setCvUploaded: (uploaded: boolean) => void,
  setCvExtractedData: (data: any) => void,
  setWaitingForCVUpload: (waiting: boolean) => void,
  setCurrentEducationIndex: (index: number) => void,
  setCurrentWorkIndex: (index: number) => void,
  setCurrentWorkExperience: (exp: any) => void,
  setIsLoading: (loading: boolean) => void,
  setIsTyping: (typing: boolean) => void,
  setShowDynamicMessage: (show: boolean) => void,
  setNavigatingTo: (to: number | null) => void,
  setCvAnalysisComplete: (complete: boolean) => void,
  setBuilderState: (state: ProfileBuilderState | null) => void,
  setIsInitializing: (initializing: boolean) => void,
  setSectionsConfirmed: (sections: string[]) => void,
  setStepHistory: (history: Map<any, any>) => void,
  setAwardedMilestones: (milestones: Set<string>) => void,
  setCvAcceptedSections: (sections: any) => void,
  setFormData: (data: FormData) => void,
  setShowRestartDialog: (show: boolean) => void,
  initializeChat: () => void
) => {
  try {
    // Clear all messages from database
    await ChatMessageService.deleteMessagesByEmployee(employeeId);
    
    // Clear saved profile builder state
    await ProfileBuilderStateService.clearState(employeeId);
    
    // Delete ALL profile sections except basic_info
    const sectionsToDelete = [
      'work_experience',
      'education',
      'skills',
      'certifications',
      'languages',
      'projects',
      'current_work',
      'tools_technologies',
      'daily_tasks'
    ];
    
    // Delete all profile sections
    const { error: sectionsError } = await supabase
      .from('employee_profile_sections')
      .delete()
      .eq('employee_id', employeeId)
      .in('section_name', sectionsToDelete);
    
    if (sectionsError) {
      console.error('Error deleting profile sections:', sectionsError);
    }
    
    // Clear CV data and skills profile
    const { error: cvError } = await supabase
      .from('employees')
      .update({ 
        cv_file_path: null,
        cv_uploaded_at: null,
        cv_extracted_data: null,
        cv_analysis_data: null,
        profile_data: null,
        profile_complete: false,
        profile_completion_date: null,
        skills_validation_completed: false,
        profile_builder_points: 0,
        profile_builder_streak: 0
      })
      .eq('id', employeeId);
    
    if (cvError) {
      console.error('Error clearing CV data:', cvError);
    }
    
    // Clear skills profile data
    const { error: skillsError } = await supabase
      .from('st_employee_skills_profile')
      .delete()
      .eq('employee_id', employeeId);
    
    if (skillsError) {
      console.error('Error clearing skills profile:', skillsError);
    }
    
    // Delete CV analysis results
    const { error: cvResultsError } = await supabase
      .from('cv_analysis_results')
      .delete()
      .eq('employee_id', employeeId);
    
    if (cvResultsError) {
      console.error('Error deleting cv_analysis_results:', cvResultsError);
    }
    
    // Delete skills validation data
    const { error: skillsValidationError } = await supabase
      .from('employee_skills_validation')
      .delete()
      .eq('employee_id', employeeId);
    
    if (skillsValidationError) {
      console.error('Error deleting skills validation:', skillsValidationError);
    }
    
    // Delete CV file from storage if exists
    const { data: employee } = await supabase
      .from('employees')
      .select('cv_file_path')
      .eq('id', employeeId)
      .single();
    
    if (employee?.cv_file_path) {
      // Extract the path after 'employee-cvs/'
      const filePath = employee.cv_file_path.replace(/^.*employee-cvs\//, '');
      
      const { error: storageError } = await supabase
        .storage
        .from('employee-cvs')
        .remove([filePath]);
      
      if (storageError) {
        console.error('Error deleting CV file:', storageError);
      }
    }
    
    // Reset all state
    setMessages([]);
    setCurrentStep(0);
    setMaxStepReached(0); // Reset max step reached
    setPoints(0);
    setStreak(0);
    setCvUploaded(false);
    setCvExtractedData(null);
    setWaitingForCVUpload(false);
    setCurrentEducationIndex(0);
    setCurrentWorkIndex(0);
    setCurrentWorkExperience({});
    setIsLoading(false);
    setIsTyping(false);
    setShowDynamicMessage(false); // Reset dynamic message
    setNavigatingTo(null); // Reset navigation state
    setCvAnalysisComplete(false); // Reset CV analysis state
    setBuilderState(null); // Clear builder state
    setIsInitializing(false); // Reset initialization flag
    setSectionsConfirmed([]); // Reset confirmed sections
    setStepHistory(new Map()); // Clear step history
    setAwardedMilestones(new Set()); // Clear awarded milestones
    setCvAcceptedSections({ // Reset CV sections
      work: false,
      education: false,
      certifications: false,
      languages: false
    });
    setFormData({
      currentPosition: employeeData?.st_company_positions?.position_title || '',
      department: employeeData?.st_company_positions?.department || '',
      timeInRole: '',
      workExperience: [],
      education: [],
      currentProjects: [],
      teamSize: '',
      roleInTeam: '',
      challenges: [],
      growthAreas: []
    });
    
    // Points already reset in the employees update above
    
    // Close dialog
    setShowRestartDialog(false);
    
    // Start fresh conversation
    setTimeout(() => {
      initializeChat();
    }, 500);
    
    toast.success('Starting fresh! All profile data has been cleared.');
  } catch (error) {
    console.error('Error starting fresh:', error);
    toast.error('Failed to start fresh. Please try again.');
  }
};

// Load current user
export const loadCurrentUser = async (setUserId: (id: string) => void) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    setUserId(user.id);
  }
};