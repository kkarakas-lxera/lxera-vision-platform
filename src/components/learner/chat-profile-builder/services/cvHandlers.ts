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

// Interface for CVHandlers context
export interface CVHandlersContext {
  employeeId: string;
  userId: string | null;
  currentStepRef: React.MutableRefObject<number>;
  maxStepReached: number;
  formData: FormData;
  stepHistory: Map<number, StepVisitHistory>;
  awardedMilestones: Set<string>;
  cvAcceptedSections: { work: boolean; education: boolean; certifications: boolean; languages: boolean };
  currentWorkIndex: number;
  currentEducationIndex: number;
  sectionsConfirmed: string[];
  // Setters
  setWaitingForCVUpload: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setCvExtractedData: (value: any) => void;
  setCvAnalysisComplete: (value: boolean) => void;
  setCvUploaded: (value: boolean) => void;
  setCurrentStep: (step: number) => void;
  setMaxStepReached: React.Dispatch<React.SetStateAction<number>>;
  setSectionsConfirmed: React.Dispatch<React.SetStateAction<string[]>>;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  // Functions
  addBotMessage: (content: string | React.ReactNode, points?: number, delay?: number) => void;
  addUserMessage: (content: string) => void;
  addAchievement: (achievement: typeof ACHIEVEMENTS.QUICK_START) => void;
  loadEmployeeData: () => Promise<void>;
  moveToNextStep: () => Promise<void>;
  initiateStep: (step: number) => void;
  saveStepData: (isAutoSave?: boolean) => Promise<void>;
}

// CV Processing class
export class CVHandlers {
  private context: CVHandlersContext;

  constructor(context: CVHandlersContext) {
    this.context = context;
  }

  async handleFileUpload(file: File) {
    if (this.context.currentStepRef.current === 1 || true) { // waitingForCVUpload condition
      // CV Upload - handleCVUpload will show the upload message
      await this.handleCVUpload(file);
    }
  }

  handleCVUploadResponse(response: string) {
    if (response === 'upload_cv') {
      this.context.setWaitingForCVUpload(true);
      this.context.addBotMessage("Perfect! Please use the paperclip icon below to select your CV file (PDF, DOC, or DOCX).", 0, 500);
      // Don't move to next step - wait for actual file upload
    } else if (response === 'manual_entry') {
      this.context.setWaitingForCVUpload(false);
      this.context.addBotMessage("No problem! Let's build your profile step by step. 📝", 0);
      setTimeout(() => this.context.moveToNextStep(), 1500);
    }
  }

  async handleCVUpload(file: File) {
    // Reset waiting state
    this.context.setWaitingForCVUpload(false);
    this.context.setIsLoading(true);
    
    // Show upload progress
    this.context.addUserMessage(`📄 Uploading ${file.name}...`);
    
    // Show dynamic progress component
    setTimeout(() => {
      const messageId = 'cv-analysis-progress-' + Date.now();
      this.context.setMessages(prev => [...prev, {
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
      const uploadPath = `${this.context.employeeId}/${Date.now()}-${file.name}`;
      const { data: cvData, error: uploadError } = await supabase.storage
        .from('employee-cvs')
        .upload(uploadPath, file);

      if (uploadError) throw uploadError;

      // Analyze the CV
      const { data: analysisResult, error: analyzeError } = await supabase.functions.invoke('analyze-cv-enhanced', {
        body: { 
          employee_id: this.context.employeeId,
          file_path: cvData.path,
          source: 'chat_profile_builder'
        }
      });

      if (analyzeError) throw analyzeError;

      // Import CV data to profile first
      await supabase.functions.invoke('import-cv-to-profile', {
        body: { employeeId: this.context.employeeId }
      });
      
      // Reload data to get imported information including CV extracted data
      const { data: updatedEmployee } = await supabase
        .from('employees')
        .select('cv_extracted_data')
        .eq('id', this.context.employeeId)
        .single();
      
      if (updatedEmployee?.cv_extracted_data) {
        this.context.setCvExtractedData(updatedEmployee.cv_extracted_data);
        console.log('CV data loaded:', updatedEmployee.cv_extracted_data);
        
        // Reload full employee data and wait for state updates
        await this.context.loadEmployeeData();
        
        // Success! Force complete the progress animation
        this.context.setCvAnalysisComplete(true);
        this.context.addAchievement(ACHIEVEMENTS.CV_UPLOADED);
        this.context.setCvUploaded(true);
        
        setTimeout(() => {
          this.context.addBotMessage(
            "Excellent! I've successfully extracted your information. Let me show you what I found... ✨",
            0,
            1000
          );
        }, 1000);
        
        // Show CV sections after messages with more time for state updates
        setTimeout(() => {
          this.context.setIsLoading(false);
          // Use the fresh data directly instead of relying on state
          this.handleCVSummaryConfirmWithData(updatedEmployee.cv_extracted_data);
        }, 2500);
      } else {
        console.log('No CV data found after import');
        // Continue without showing summary
        this.context.addBotMessage(
          "I've uploaded your CV! Let's continue building your profile together. 💪",
          100,
          1000
        );
        setTimeout(() => {
          this.context.setIsLoading(false);
          this.context.moveToNextStep();
        }, 2000);
      }
      
    } catch (error) {
      console.error('CV upload error:', error);
      this.context.setIsLoading(false);
      this.context.addBotMessage(
        "Hmm, I had trouble reading your CV. No worries, we can enter the information together! 💪",
        0,
        1000
      );
      setTimeout(() => this.context.moveToNextStep(), 2000);
    }
  }

  async handleCVSummaryConfirmWithData(extractedData: any) {
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
      this.context.addBotMessage("I've processed your CV! Let's continue building your profile together. 💪", 0);
      setTimeout(() => this.context.moveToNextStep(), 1500);
      return;
    }
    
    // Show progressive sections display
    this.context.addBotMessage("Great! Now let's review your information. You can edit individual entries or accept entire sections. 📝", 0);
    
    // Reset confirmed sections for new CV review
    this.context.setSectionsConfirmed([]);
    
    setTimeout(async () => {
      const messageId = 'cv-sections-' + Date.now();
      this.context.setMessages(prev => [...prev, {
        id: messageId,
        type: 'system',
        content: (
          <CVExtractedSections
            extractedData={extractedData || {}}
            onSectionAccept={this.handleSectionAccept.bind(this)}
            onSectionUpdate={this.handleSectionUpdate.bind(this)}
            onComplete={this.handleAllSectionsComplete.bind(this)}
          />
        ),
        timestamp: new Date(),
        metadata: {
          componentType: 'CVExtractedSections',
          extractedData: extractedData
        }
      }]);
      
      // Save the CV sections display to database
      if (this.context.userId && extractedData) {
        try {
          await ChatMessageService.saveMessage({
            employee_id: this.context.employeeId,
            user_id: this.context.userId,
            message_type: 'system',
            content: 'CV_SECTIONS_DISPLAY',
            metadata: {
              componentType: 'CVExtractedSections',
              extractedData: extractedData
            },
            step: this.context.currentStepRef.current
          });
        } catch (error) {
          console.error('Failed to save CV sections message:', error);
        }
      }
    }, 1500);
  }
  
  handleSectionAccept(section: 'work' | 'education' | 'certifications' | 'languages') {
    // Add to confirmed sections
    this.context.setSectionsConfirmed(prev => {
      if (!prev.includes(section)) {
        return [...prev, section];
      }
      return prev;
    });
    
    // Check if we need to show the confirmation progress
    const confirmationMessageId = 'section-confirmations-' + Date.now();
    this.context.setMessages(prev => {
      // Remove any existing confirmation progress messages
      const filtered = prev.filter(m => !m.id.startsWith('section-confirmations-'));
      
      // Add new confirmation progress
      return [...filtered, {
        id: confirmationMessageId,
        type: 'system',
        content: (
          <SectionConfirmationProgress 
            confirmedSections={[...this.context.sectionsConfirmed, section].filter((s, i, arr) => arr.indexOf(s) === i)}
            onAllConfirmed={() => {
              // This will be called when all sections are confirmed
            }}
          />
        ),
        timestamp: new Date()
      }];
    });
    
    this.context.saveStepData(true);
  }
  
  handleSectionUpdate(section: 'work' | 'education' | 'certifications' | 'languages', data: any) {
    // Update the CV extracted data
    this.context.setCvExtractedData(prev => ({
      ...prev,
      [section === 'work' ? 'work_experience' : section]: data
    }));
    
    // Also update form data for work and education
    if (section === 'work') {
      this.context.setFormData(prev => ({ 
        ...prev, 
        workExperience: data.map((exp: any) => ({
          title: exp.title || exp.position || '',
          company: exp.company || '',
          duration: exp.duration || `${exp.startDate || ''} - ${exp.endDate || 'Present'}`,
          description: exp.description || ''
        }))
      }));
    } else if (section === 'education') {
      this.context.setFormData(prev => ({ 
        ...prev, 
        education: data.map((edu: any) => ({
          degree: edu.degree || '',
          institution: edu.institution || '',
          year: edu.year || '',
          fieldOfStudy: edu.fieldOfStudy || ''
        }))
      }));
    }
    this.context.saveStepData(true);
  }
  
  async handleAllSectionsComplete() {
    // Import CV data to profile
    await supabase.functions.invoke('import-cv-to-profile', {
      body: { employeeId: this.context.employeeId }
    });
    
    // Clear the sections display
    this.context.setMessages(prev => prev.filter(m => !m.id.startsWith('cv-sections-')));
    
    this.context.addBotMessage("Perfect! All your information has been verified and saved. Let's continue with your skills! 🚀", 0);
    
    // Move to skills step
    setTimeout(() => {
      this.context.setCurrentStep(4); // Skills step
      this.context.setMaxStepReached(prev => Math.max(prev, 4));
      this.context.initiateStep(4);
    }, 1500);
  }

  async saveStepData(isAutoSave = false) {
    const step = this.context.currentStepRef.current;
    if (step === 0 || step > STEPS.length) return;
    
    try {
      const stepName = STEPS[step - 1].name;
      
      // Convert step history Map to array for storage
      const stepHistoryArray = Array.from(this.context.stepHistory.entries()).map(([stepId, history]) => ({
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
        maxStepReached: this.context.maxStepReached,
        formData: this.context.formData,
        lastActivity: new Date().toISOString(),
        // Add component-specific states
        workExperienceState: {
          currentIndex: this.context.currentWorkIndex,
          verifiedIndexes: [],
          editingStates: {}
        },
        educationState: {
          currentIndex: this.context.currentEducationIndex,
          verifiedIndexes: [],
          editingStates: {}
        },
        cvSectionsState: {
          acceptedSections: this.context.cvAcceptedSections,
          currentSection: 'work'
        },
        // Context-aware navigation tracking
        stepHistory: stepHistoryArray,
        awardedMilestones: Array.from(this.context.awardedMilestones),
        awardedAchievements: [] // TODO: Track achievements properly
      };
      
      await ProfileBuilderStateService.saveState(this.context.employeeId, currentBuilderState);
      
      switch (stepName) {
        case 'work_experience':
          await EmployeeProfileService.saveSection(this.context.employeeId, 'work_experience', {
            experience: this.context.formData.workExperience
          });
          break;
          
        case 'education':
          await EmployeeProfileService.saveSection(this.context.employeeId, 'education', {
            education: this.context.formData.education.length > 0 ? this.context.formData.education : [{
              degree: this.context.formData.highestDegree,
              field: this.context.formData.fieldOfStudy,
              institution: this.context.formData.institution,
              graduationYear: this.context.formData.graduationYear
            }]
          });
          break;
          
        case 'current_work':
          await EmployeeProfileService.saveSection(this.context.employeeId, 'current_work', {
            projects: this.context.formData.currentProjects,
            teamSize: this.context.formData.teamSize,
            role: this.context.formData.roleInTeam
          });
          break;
          
        case 'challenges':
          await EmployeeProfileService.saveSection(this.context.employeeId, 'daily_tasks', {
            challenges: this.context.formData.challenges
          });
          break;
          
        case 'growth':
          await EmployeeProfileService.saveSection(this.context.employeeId, 'tools_technologies', {
            growthAreas: this.context.formData.growthAreas
          });
          break;
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}