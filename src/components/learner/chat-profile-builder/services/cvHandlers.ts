import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import { ChatMessageService } from '@/services/chatMessageService';
import { ProfileBuilderStateService, type ProfileBuilderState } from '@/services/profileBuilderStateService';
import CVExtractedSections from '../chat/CVExtractedSections';
import CVAnalysisProgress from '../chat/CVAnalysisProgress';
import SectionConfirmationProgress from '../chat/SectionConfirmationProgress';
import { Trophy, Zap, Upload, Clock } from 'lucide-react';

// Constants
const STEPS = [
  { id: 1, name: 'cv_upload', title: 'CV Upload' },
  { id: 2, name: 'work_experience', title: 'Work Experience' },
  { id: 3, name: 'education', title: 'Education' },
  { id: 4, name: 'skills', title: 'Skills Review' },
  { id: 5, name: 'current_work', title: 'Current Projects' },
  { id: 6, name: 'challenges', title: 'Challenges' },
  { id: 7, name: 'growth', title: 'Growth Areas' }
];

const ACHIEVEMENTS = {
  QUICK_START: { name: "Quick Start", points: 50, icon: <Zap className="h-6 w-6 text-yellow-600" /> },
  CV_UPLOADED: { name: "Document Master", points: 200, icon: <Upload className="h-6 w-6 text-blue-600" /> },
  SPEED_DEMON: { name: "Speed Demon", points: 150, icon: <Clock className="h-6 w-6 text-purple-600" /> },
  COMPLETIONIST: { name: "Profile Hero", points: 500, icon: <Trophy className="h-6 w-6 text-gold-600" /> }
};

// Types
interface Message {
  id: string;
  type: 'bot' | 'user' | 'system' | 'achievement';
  content: string | React.ReactNode;
  timestamp: Date;
  points?: number;
  achievement?: {
    title: string;
    icon: React.ReactNode;
  };
  metadata?: any;
}

interface FormData {
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    fieldOfStudy: string;
  }>;
  highestDegree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  currentProjects: string;
  teamSize: string;
  roleInTeam: string;
  challenges: string[];
  growthAreas: string[];
}

interface StepVisitHistory {
  stepId: number;
  firstVisitedAt: Date;
  lastVisitedAt: Date;
  visitCount: number;
  status: 'not_visited' | 'in_progress' | 'completed' | 'reviewing';
  completedAt?: Date;
  milestoneAwarded: boolean;
  savedState?: any;
}

// CV Processing and Form Handling Functions
export const createCVHandlers = (
  employeeId: string,
  userId: string | null,
  currentStepRef: React.MutableRefObject<number>,
  maxStepReached: number,
  formData: FormData,
  stepHistory: Map<number, StepVisitHistory>,
  awardedMilestones: Set<string>,
  cvAcceptedSections: { work: boolean; education: boolean; certifications: boolean; languages: boolean },
  currentWorkIndex: number,
  currentEducationIndex: number,
  sectionsConfirmed: string[],
  // Setters
  setWaitingForCVUpload: (value: boolean) => void,
  setIsLoading: (value: boolean) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setCvExtractedData: (value: any) => void,
  setCvAnalysisComplete: (value: boolean) => void,
  setCvUploaded: (value: boolean) => void,
  setCurrentStep: (step: number) => void,
  setMaxStepReached: React.Dispatch<React.SetStateAction<number>>,
  setSectionsConfirmed: React.Dispatch<React.SetStateAction<string[]>>,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  // Functions
  addBotMessage: (content: string | React.ReactNode, points?: number, delay?: number) => void,
  addUserMessage: (content: string) => void,
  addAchievement: (achievement: typeof ACHIEVEMENTS.QUICK_START) => void,
  loadEmployeeData: () => Promise<void>,
  moveToNextStep: () => Promise<void>,
  initiateStep: (step: number) => void,
  saveStepData: (isAutoSave?: boolean) => Promise<void>
) => {

  const handleFileUpload = async (file: File) => {
    if (currentStepRef.current === 1 || true) { // waitingForCVUpload condition
      // CV Upload - handleCVUpload will show the upload message
      await handleCVUpload(file);
    }
  };

  const handleCVUploadResponse = (response: string) => {
    if (response === 'upload_cv') {
      setWaitingForCVUpload(true);
      addBotMessage("Perfect! Please use the paperclip icon below to select your CV file (PDF, DOC, or DOCX).", 0, 500);
      // Don't move to next step - wait for actual file upload
    } else if (response === 'manual_entry') {
      setWaitingForCVUpload(false);
      addBotMessage("No problem! Let's build your profile step by step. 📝", 0);
      setTimeout(() => moveToNextStep(), 1500);
    }
  };

  const handleCVUpload = async (file: File) => {
    // Reset waiting state
    setWaitingForCVUpload(false);
    setIsLoading(true);
    
    // Show upload progress
    addUserMessage(`📄 Uploading ${file.name}...`);
    
    // Show dynamic progress component
    setTimeout(() => {
      const messageId = 'cv-analysis-progress-' + Date.now();
      setMessages(prev => [...prev, {
        id: messageId,
        type: 'system',
        content: (
          <CVAnalysisProgress 
            forceComplete={false} // cvAnalysisComplete
            onComplete={() => {
              console.log('CV analysis progress completed');
            }}
          />
        ),
        timestamp: new Date()
      }]);
    }, 500);
    
    try {
      // Upload the file
      const uploadPath = `${employeeId}/${Date.now()}-${file.name}`;
      const { data: cvData, error: uploadError } = await supabase.storage
        .from('employee-cvs')
        .upload(uploadPath, file);

      if (uploadError) throw uploadError;

      // Analyze the CV
      const { data: analysisResult, error: analyzeError } = await supabase.functions.invoke('analyze-cv-enhanced', {
        body: { 
          employee_id: employeeId,
          file_path: cvData.path,
          source: 'chat_profile_builder'
        }
      });

      if (analyzeError) throw analyzeError;

      // Import CV data to profile first
      await supabase.functions.invoke('import-cv-to-profile', {
        body: { employeeId }
      });
      
      // Reload data to get imported information including CV extracted data
      const { data: updatedEmployee } = await supabase
        .from('employees')
        .select('cv_extracted_data')
        .eq('id', employeeId)
        .single();
      
      if (updatedEmployee?.cv_extracted_data) {
        setCvExtractedData(updatedEmployee.cv_extracted_data);
        console.log('CV data loaded:', updatedEmployee.cv_extracted_data);
        
        // Reload full employee data and wait for state updates
        await loadEmployeeData();
        
        // Success! Force complete the progress animation
        setCvAnalysisComplete(true);
        addAchievement(ACHIEVEMENTS.CV_UPLOADED);
        setCvUploaded(true);
        
        setTimeout(() => {
          addBotMessage(
            "Excellent! I've successfully extracted your information. Let me show you what I found... ✨",
            0,
            1000
          );
        }, 1000);
        
        // Show CV sections after messages with more time for state updates
        setTimeout(() => {
          setIsLoading(false);
          // Use the fresh data directly instead of relying on state
          handleCVSummaryConfirmWithData(updatedEmployee.cv_extracted_data);
        }, 2500);
      } else {
        console.log('No CV data found after import');
        // Continue without showing summary
        addBotMessage(
          "I've uploaded your CV! Let's continue building your profile together. 💪",
          100,
          1000
        );
        setTimeout(() => {
          setIsLoading(false);
          moveToNextStep();
        }, 2000);
      }
      
    } catch (error) {
      console.error('CV upload error:', error);
      setIsLoading(false);
      addBotMessage(
        "Hmm, I had trouble reading your CV. No worries, we can enter the information together! 💪",
        0,
        1000
      );
      setTimeout(() => moveToNextStep(), 2000);
    }
  };

  const handleCVSummaryConfirmWithData = async (extractedData: any) => {
    // Check if we actually have extracted data with meaningful content
    const hasWorkExperience = extractedData?.work_experience && extractedData.work_experience.length > 0;
    const hasEducation = extractedData?.education && extractedData.education.length > 0;
    const hasCertifications = extractedData?.certifications && extractedData.certifications.length > 0;
    const hasLanguages = extractedData?.languages && extractedData.languages.length > 0;
    
    console.log('CV Data Check:', {
      hasWorkExperience,
      hasEducation,
      hasCertifications,
      hasLanguages,
      fullData: extractedData
    });
    
    if (!extractedData || (!hasWorkExperience && !hasEducation && !hasCertifications && !hasLanguages)) {
      console.log('No meaningful CV extracted data available, skipping sections display');
      addBotMessage("I've processed your CV! Let's continue building your profile together. 💪", 0);
      setTimeout(() => moveToNextStep(), 1500);
      return;
    }
    
    // Show progressive sections display
    addBotMessage("Great! Now let's review your information. You can edit individual entries or accept entire sections. 📝", 0);
    
    // Reset confirmed sections for new CV review
    setSectionsConfirmed([]);
    
    setTimeout(async () => {
      const messageId = 'cv-sections-' + Date.now();
      setMessages(prev => [...prev, {
        id: messageId,
        type: 'system',
        content: (
          <CVExtractedSections
            extractedData={extractedData || {}}
            onSectionAccept={handleSectionAccept}
            onSectionUpdate={handleSectionUpdate}
            onComplete={handleAllSectionsComplete}
          />
        ),
        timestamp: new Date(),
        metadata: {
          componentType: 'CVExtractedSections',
          extractedData: extractedData
        }
      }]);
      
      // Save the CV sections display to database
      if (userId && extractedData) {
        try {
          await ChatMessageService.saveMessage({
            employee_id: employeeId,
            user_id: userId,
            message_type: 'system',
            content: 'CV_SECTIONS_DISPLAY',
            metadata: {
              componentType: 'CVExtractedSections',
              extractedData: extractedData
            },
            step: currentStepRef.current
          });
        } catch (error) {
          console.error('Failed to save CV sections message:', error);
        }
      }
    }, 1500);
  };
  
  const handleSectionAccept = (section: 'work' | 'education' | 'certifications' | 'languages') => {
    // Add to confirmed sections
    setSectionsConfirmed(prev => {
      if (!prev.includes(section)) {
        return [...prev, section];
      }
      return prev;
    });
    
    // Check if we need to show the confirmation progress
    const confirmationMessageId = 'section-confirmations-' + Date.now();
    setMessages(prev => {
      // Remove any existing confirmation progress messages
      const filtered = prev.filter(m => !m.id.startsWith('section-confirmations-'));
      
      // Add new confirmation progress
      return [...filtered, {
        id: confirmationMessageId,
        type: 'system',
        content: (
          <SectionConfirmationProgress 
            confirmedSections={[...sectionsConfirmed, section].filter((s, i, arr) => arr.indexOf(s) === i)}
            onAllConfirmed={() => {
              // This will be called when all sections are confirmed
            }}
          />
        ),
        timestamp: new Date()
      }];
    });
    
    saveStepData(true);
  };
  
  const handleSectionUpdate = (section: 'work' | 'education' | 'certifications' | 'languages', data: any) => {
    // Update the CV extracted data
    setCvExtractedData(prev => ({
      ...prev,
      [section === 'work' ? 'work_experience' : section]: data
    }));
    
    // Also update form data for work and education
    if (section === 'work') {
      setFormData(prev => ({ 
        ...prev, 
        workExperience: data.map((exp: any) => ({
          title: exp.title || exp.position || '',
          company: exp.company || '',
          duration: exp.duration || `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
          description: exp.description || ''
        }))
      }));
    } else if (section === 'education') {
      setFormData(prev => ({ 
        ...prev, 
        education: data.map((edu: any) => ({
          degree: edu.degree || '',
          institution: edu.institution || '',
          year: edu.year || '',
          fieldOfStudy: edu.fieldOfStudy || ''
        }))
      }));
    }
    saveStepData(true);
  };
  
  const handleAllSectionsComplete = async () => {
    // Import CV data to profile
    await supabase.functions.invoke('import-cv-to-profile', {
      body: { employeeId }
    });
    
    // Clear the sections display
    setMessages(prev => prev.filter(m => !m.id.startsWith('cv-sections-')));
    
    addBotMessage("Perfect! All your information has been verified and saved. Let's continue with your skills! 🚀", 0);
    
    // Move to skills step
    setTimeout(() => {
      setCurrentStep(4); // Skills step
      setMaxStepReached(prev => Math.max(prev, 4));
      initiateStep(4);
    }, 1500);
  };

  // Save data (reuse existing logic)
  const saveStepData = async (isAutoSave = false) => {
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

  return {
    handleFileUpload,
    handleCVUploadResponse,
    handleCVUpload,
    handleCVSummaryConfirmWithData,
    handleSectionAccept,
    handleSectionUpdate,
    handleAllSectionsComplete,
    saveStepData
  };
};