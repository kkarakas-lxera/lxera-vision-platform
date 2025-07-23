import React from 'react';
import type { FormData, Message } from '../types';
import { STEPS, ACHIEVEMENTS, ENABLE_SMART_MODE } from '../constants';

export interface StepHandlerContext {
  // State setters
  setCurrentStep: (step: number) => void;
  setMaxStepReached: React.Dispatch<React.SetStateAction<number>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  
  // Current values
  currentStepRef: React.MutableRefObject<number>;
  maxStepReached: number;
  formData: FormData;
  employeeId: string;
  
  // Functions
  addBotMessage: (content: string | React.ReactNode, points?: number, delay?: number) => void;
  addAchievement: (achievement: any) => void;
  showQuickReplies: (replies: Array<{ label: string; value: string; points?: number; variant?: string }>) => void;
  moveToNextStep: () => void;
  analyzeIntent: (input: string) => Promise<any>;
  executeSmartAction: (intent: any) => Promise<void>;
  
  // CV specific
  handleCVUpload: (file: File) => Promise<void>;
  
  // UI functions
  showInlineWorkForm: () => void;
  showInlineEducationForm: () => void;
  
  // Components - removed as JSX is no longer used
}

export class StepHandlers {
  private context: StepHandlerContext;

  constructor(context: StepHandlerContext) {
    this.context = context;
  }

  processUserResponse = async (response: string) => {
    // When smart mode is enabled, try intent processing for ALL inputs
    if (ENABLE_SMART_MODE) {
      console.log('Smart mode enabled, analyzing intent for:', response);
      
      // Try smart intent processing first
      const intent = await this.context.analyzeIntent(response);
      console.log('Intent analysis result:', intent);
      
      if (intent && intent.confidence > 0.7) {
        console.log('Executing smart action for intent:', intent.type);
        await this.context.executeSmartAction(intent);
        return;
      } else {
        console.log('Intent confidence too low or failed, falling back to structured handlers');
      }
    }

    // Fall back to existing handlers
    const step = this.context.currentStepRef.current;
    
    // Initial conversation
    if (step === 0) {
      if (response === 'start') {
        // Only award achievement if this is the first time starting
        if (this.context.maxStepReached === 0) {
          this.context.addAchievement(ACHIEVEMENTS.QUICK_START);
        }
        this.startStep1();
      } else if (response === 'rewards') {
        this.explainRewards();
      } else if (response === 'more_info') {
        this.explainProcess();
      }
      return;
    }

    // Handle actual profile steps
    const stepName = STEPS[step - 1]?.name;
    
    // Map of step handlers
    const stepHandlers: Record<string, (response: string) => void | Promise<void>> = {
      'cv_upload': this.handleCVUploadResponse,
      'work_experience': this.handleWorkExperience,
      'education': this.handleEducation,
      'skills': (response) => {
        if (response === 'skip_skills') {
          this.context.moveToNextStep();
        } else if (response === 'review_skills') {
          this.context.setMessages(prev => [...prev, {
            id: 'skills-component',
            type: 'system',
            content: JSON.stringify({
              type: 'chat_skills_review',
              employeeId: this.context.employeeId
            }),
            timestamp: new Date(),
            metadata: {
              componentType: 'ChatSkillsReview'
            }
          }]);
        }
      },
      'current_work': this.handleCurrentWork,
      'challenges': this.handleChallenges,
      'growth': this.handleGrowthAreas
    };
    
    const handler = stepHandlers[stepName];
    if (handler) {
      await handler(response);
    }
  };

  startStep1 = () => {
    this.context.setCurrentStep(1); // Move to CV upload step
    this.context.setMaxStepReached(prev => Math.max(prev, 1));
    // Don't show dynamic message for initial CV upload step
    this.context.addBotMessage(
      "Great! Let's start with the easiest way. Do you have a CV or resume handy? I can extract your information from it to save you time! 📄",
      0,
      1000
    );
    
    setTimeout(() => {
      this.context.showQuickReplies([
        { label: "📤 Upload CV", value: "upload_cv", points: 0, variant: 'primary' },
        { label: "✍️ Enter manually", value: "manual_entry", points: 0 }
      ]);
    }, 2000);
  };

  explainRewards = () => {
    this.context.addBotMessage(
      "Here's how you can earn points:\n\n🏃‍♂️ Quick Start (50 pts) - Begin your profile\n📄 Document Master (200 pts) - Upload your CV\n⚡ Speed Demon (150 pts) - Quick responses\n🏆 Profile Hero (500 pts) - Complete everything\n\nReady to start earning?",
      0,
      2000
    );
    
    setTimeout(() => {
      this.context.showQuickReplies([
        { label: "🚀 Let's start!", value: "start", points: 0 }
      ]);
    }, 3000);
  };

  explainProcess = () => {
    this.context.addBotMessage(
      "I'll guide you through 7 simple steps:\n\n1. 📄 CV Upload (optional but helpful)\n2. 💼 Work Experience\n3. 🎓 Education Background\n4. 🎯 Skills Review\n5. 🚀 Current Projects\n6. 💪 Professional Challenges\n7. 📈 Growth Areas\n\nEach step builds your complete professional profile. Sound good?",
      0,
      2500
    );
    
    setTimeout(() => {
      this.context.showQuickReplies([
        { label: "Perfect! Let's go", value: "start", points: 0 }
      ]);
    }, 3500);
  };

  handleCVUploadResponse = (response: string) => {
    if (response === 'upload_cv') {
      this.context.addBotMessage("Perfect! Please drag and drop your CV file or click to browse.", 0, 500);
      // The file upload will be handled by the FileDropZone component
    } else if (response === 'manual_entry') {
      this.context.moveToNextStep(); // Go to work experience step
    }
  };

  handleWorkExperience = (response: string) => {
    if (response === 'add_work') {
      this.context.showInlineWorkForm();
    } else if (response === 'no_work' || response === 'skip_work') {
      this.context.moveToNextStep();
    } else {
      // Parse natural language work experience
      const workMatch = response.match(/^(.+?) at (.+?)$/i);
      if (workMatch) {
        const [, title, company] = workMatch;
        this.context.setFormData(prev => ({
          ...prev,
          workExperience: [...prev.workExperience, {
            title: title.trim(),
            company: company.trim(),
            duration: '',
            description: ''
          }]
        }));
        this.context.addBotMessage(`Added: ${title.trim()} at ${company.trim()}. How long were you in this role?`, 0, 300);
      } else {
        this.context.addBotMessage("I didn't quite catch that. Could you tell me your job title and company? For example: 'Software Engineer at Google'", 0, 300);
      }
    }
  };

  handleEducation = (response: string) => {
    if (response === 'add_education') {
      this.context.showInlineEducationForm();
    } else if (response === 'no_education' || response === 'skip_education') {
      this.context.moveToNextStep();
    } else {
      // Parse natural language education
      const eduMatch = response.match(/^(.+?) in (.+?) from (.+?)$/i);
      if (eduMatch) {
        const [, degree, field, institution] = eduMatch;
        this.context.setFormData(prev => ({
          ...prev,
          education: [...prev.education, {
            degree: degree.trim(),
            fieldOfStudy: field.trim(),
            institution: institution.trim(),
            graduationYear: ''
          }]
        }));
        this.context.addBotMessage(`Added: ${degree.trim()} in ${field.trim()} from ${institution.trim()}`, 0, 300);
      } else {
        this.context.addBotMessage("Could you tell me about your education? For example: 'Bachelor's in Computer Science from MIT'", 0, 300);
      }
    }
  };

  handleCurrentWork = (response: string) => {
    // Parse team size
    const teamSizeMatch = response.match(/(\d+)\s*(?:people|person|member)/i);
    if (teamSizeMatch) {
      const teamSize = teamSizeMatch[1];
      this.context.setFormData(prev => ({ ...prev, teamSize }));
      this.context.addBotMessage(`Got it, you work with ${teamSize} people. What's your role in the team?`, 0, 300);
      
      setTimeout(() => {
        this.context.showQuickReplies([
          { label: "Individual Contributor", value: "Individual Contributor" },
          { label: "Team Lead", value: "Team Lead" },
          { label: "Manager", value: "Manager" }
        ]);
      }, 1000);
      return;
    }

    // Handle role in team
    if (['Individual Contributor', 'Team Lead', 'Manager'].includes(response)) {
      this.context.setFormData(prev => ({ ...prev, roleInTeam: response }));
      this.context.addBotMessage(`Perfect! You're working as ${response}.`, 0, 300);
      setTimeout(() => {
        this.context.moveToNextStep();
      }, 1500);
      return;
    }

    // Handle project descriptions
    this.context.setFormData(prev => ({
      ...prev,
      currentProjects: [...prev.currentProjects, response.trim()]
    }));
    this.context.addBotMessage("Thanks! Any other current projects or responsibilities?", 0, 300);
  };

  handleChallenges = (response: string) => {
    if (response === 'skip_challenges') {
      this.context.moveToNextStep();
    } else {
      this.context.setFormData(prev => ({
        ...prev,
        challenges: [...prev.challenges, response.trim()]
      }));
      this.context.addBotMessage("That's valuable insight. Any other challenges you'd like to mention?", 0, 300);
    }
  };

  handleGrowthAreas = (response: string) => {
    if (response === 'complete_profile') {
      this.context.moveToNextStep();
    } else {
      this.context.setFormData(prev => ({
        ...prev,
        growthAreas: [...prev.growthAreas, response.trim()]
      }));
      this.context.addBotMessage("Excellent goal! Any other areas you'd like to develop?", 0, 300);
    }
  };
}