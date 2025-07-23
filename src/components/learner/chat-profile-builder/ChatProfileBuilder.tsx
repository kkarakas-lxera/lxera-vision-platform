import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import { ChatMessageService } from '@/services/chatMessageService';
import { ProfileBuilderStateService, type ProfileBuilderState } from '@/services/profileBuilderStateService';
import ChatMessage from '../chat/ChatMessage';
import QuickReplyButtons from '../chat/QuickReplyButtons';
import ChatInput from '../chat/ChatInput';
import TypingIndicator from '../chat/TypingIndicator';
import FileDropZone from '../chat/FileDropZone';
import CVExtractedSections from '../chat/CVExtractedSections';
import CVAnalysisProgress from '../chat/CVAnalysisProgress';
import ProfileProgressSidebar from '../chat/ProfileProgressSidebar';
import ChatSkillsReview from '../chat/ChatSkillsReview';
import ProfileStepMessage from '../chat/ProfileStepMessage';
import SectionConfirmationProgress from '../chat/SectionConfirmationProgress';
import CourseOutlineReward from '../CourseOutlineReward';
import AIGenerationProgress from '../chat/AIGenerationProgress';
import { Trophy, Zap, Upload, Clock, ChevronUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Import all types and constants
import type {
  StepVisitHistory,
  NavigationContext,
  ChatProfileBuilderProps,
  Message,
  WorkExperience,
  Education,
  FormData,
} from './types';
import type { EmployeeUpdateExtra } from '@/types/dbTypes';
import { STEPS, ACHIEVEMENTS, ENABLE_SMART_MODE } from './constants';

// Import all extracted services and handlers
import { useProfileBuilderState } from './hooks/useProfileBuilderState';
import { MessageManager } from './services/messageManager';
import { NavigationService } from './services/navigationService';
import { SmartIntentService } from './services/smartIntentService';
import { DataPersistenceService } from './services/dataPersistenceService';
import { StepHandlers } from './handlers/stepHandlers';
import { IntentHandlers } from './handlers/intentHandlers';
import { SmartIntentHandlers } from './services/smartIntentHandlers';
import { CVHandlers } from './services/cvHandlers';
import { MessageHandlers } from './services/messageHandlers';
import { StepProcessors } from './handlers/stepProcessors';

export default function ChatProfileBuilder({ employeeId, onComplete }: ChatProfileBuilderProps) {
  // Use the extracted custom hook for state management
  const {
    userId, setUserId,
    employeeData, setEmployeeData,
    isCompleted, setIsCompleted,
    navigationState, setNavigationState,
    uiState, setUiState,
    gamificationState, setGamificationState,
    cvState, setCvState,
    progressState, setProgressState,
    formData, setFormData,
    smartContext, setSmartContext,
    currentStepRef,
    maxStepReachedRef,
    currentStep,
    maxStepReached,
    steps: STEPS_DATA
  } = useProfileBuilderState(employeeId);

  // Backward-compatibility helper setters that aren't returned by the hook
  const setCurrentStep = (step: number) => setNavigationState(prev => ({ ...prev, currentStep: step }));
  const setMaxStepReached = (val: number) => setNavigationState(prev => ({ ...prev, maxStepReached: val }));

  // UI shortcuts (these already exist but are rarely used standalone)
  const setIsTyping = (v: boolean) => setUiState(prev => ({ ...prev, isTyping: v }));
  const setIsLoading = (v: boolean) => setUiState(prev => ({ ...prev, isLoading: v }));
  const setIsInitializing = (v: boolean) => setUiState(prev => ({ ...prev, isInitializing: v }));
  const setShowRestartDialog = (v: boolean) => setUiState(prev => ({ ...prev, showRestartDialog: v }));
  const setHasMoreMessages = (v: boolean) => setUiState(prev => ({ ...prev, hasMoreMessages: v }));
  const setLoadingHistory = (v: boolean) => setUiState(prev => ({ ...prev, loadingHistory: v }));
  const setIsGeneratingAI = (v: boolean) => setUiState(prev => ({ ...prev, isGeneratingAI: v }));
  const setAiGenerationStage = (stage: typeof uiState.aiGenerationStage) => setUiState(prev => ({ ...prev, aiGenerationStage: stage }));

  // Gamification helpers
  const setPoints = (updater: ((prev: number) => number) | number) =>
    setGamificationState(prev => ({ ...prev, points: typeof updater === 'function' ? (updater as Function)(prev.points) : updater }));
  const setStreak = (updater: ((prev: number) => number) | number) =>
    setGamificationState(prev => ({ ...prev, learningStreak: typeof updater === 'function' ? (updater as Function)(prev.learningStreak) : updater }));

  // CV state helpers
  const setCvUploaded = (v: boolean) => setCvState(prev => ({ ...prev, cvUploaded: v }));
  const setWaitingForCVUpload = (v: boolean) => setCvState(prev => ({ ...prev, cvFile: v ? null : prev.cvFile }));
  const setCvExtractedData = (data: any) => setCvState(prev => ({ ...prev, cvData: data }));
  const setCvAnalysisComplete = (v: boolean) => setCvState(prev => ({ ...prev, isAnalyzingCV: !v }));

  // The progress-state hook already provides dedicated setters; no extra aliases needed here.

  // Original state that wasn't moved to the hook
  const [messages, setMessages] = useState<Message[]>([]);
  const [builderState, setBuilderState] = useState<ProfileBuilderState | null>(null);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<any>(null);
  const [courseOutline, setCourseOutline] = useState<any>(null);
  const [stepHistory, setStepHistory] = useState<Map<number, StepVisitHistory>>(new Map());

  // Additional state that needs to be individual
  const [lastResponseTime, setLastResponseTime] = useState<Date | null>(null);
  const [awardedMilestones, setAwardedMilestones] = useState<Set<string>>(new Set());
  const [cvAcceptedSections, setCvAcceptedSections] = useState({
    work: false,
    education: false,
    certifications: false,
    languages: false
  });
  const [currentEducationIndex, setCurrentEducationIndex] = useState(0);
  const [currentWorkIndex, setCurrentWorkIndex] = useState(0);
  const [currentWorkExperience, setCurrentWorkExperience] = useState<any>({});
  const [sectionsConfirmed, setSectionsConfirmed] = useState<string[]>([]);
  const [showDynamicMessage, setShowDynamicMessage] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<number | null>(null);
  const [returnToStep, setReturnToStep] = useState<number | null>(null);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  // Smart Intent Context
  interface SmartContext {
    currentStep: number;
    currentFocus?: string;
    recentInteractions: Array<{
      type: string;
      data: any;
      timestamp: Date;
    }>;
    activeUI?: string;
    formData: any;
  }

  // Legacy state mapping for backward compatibility - will be gradually phased out
  const currentStepLegacy = navigationState.currentStep;
  const maxStepReachedLegacy = navigationState.maxStepReached;
  const navigatingToLegacy = navigationState.navigatingTo;
  const showDynamicMessageLegacy = navigationState.showDynamicMessage;
  const isTyping = uiState.isTyping;
  const isLoading = uiState.isLoading;
  const isInitializing = uiState.isInitializing;
  const showRestartDialog = uiState.showRestartDialog;
  const hasMoreMessages = uiState.hasMoreMessages;
  const loadingHistory = uiState.loadingHistory;
  const isGeneratingAI = uiState.isGeneratingAI;
  const aiGenerationStage = uiState.aiGenerationStage;
  const points = gamificationState.points;
  const elapsedTime = gamificationState.elapsedTime;
  const streak = gamificationState.learningStreak;
  const cvUploaded = cvState.cvUploaded;
  const waitingForCVUpload = cvState.cvFile === null && currentStepLegacy === 1;
  const cvExtractedData = cvState.cvData;
  const cvAnalysisComplete = cvState.isAnalyzingCV === false && cvState.cvData !== null;

  // Additional refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conversationStartTime = useRef<Date>(new Date());

  // Keep refs in sync with state
  useEffect(() => {
    currentStepRef.current = currentStepLegacy;
  }, [currentStepLegacy]);

  useEffect(() => {
    maxStepReachedRef.current = maxStepReachedLegacy;
  }, [maxStepReachedLegacy]);

  // Synchronize individual state variables with consolidated state objects
  useEffect(() => {
    setCurrentStep(navigationState.currentStep);
    setMaxStepReached(navigationState.maxStepReached);
    setNavigatingTo(navigationState.navigatingTo);
    setShowDynamicMessage(navigationState.showDynamicMessage);
    setReturnToStep(navigationState.returnToStep);
    setIsUpdatingInfo(navigationState.isUpdatingInfo);
  }, [navigationState]);

  useEffect(() => {
    setIsTyping(uiState.isTyping);
    setIsLoading(uiState.isLoading);
    setIsInitializing(uiState.isInitializing);
    setShowRestartDialog(uiState.showRestartDialog);
    setHasMoreMessages(uiState.hasMoreMessages);
    setLoadingHistory(uiState.loadingHistory);
    setIsGeneratingAI(uiState.isGeneratingAI);
    setAiGenerationStage(uiState.aiGenerationStage);
  }, [uiState]);

  useEffect(() => {
    setPoints(gamificationState.points);
    setStreak(gamificationState.learningStreak);
    setLastResponseTime(gamificationState.startTime);
  }, [gamificationState]);

  useEffect(() => {
    setCvUploaded(cvState.cvUploaded);
    setWaitingForCVUpload(cvState.cvFile === null && currentStep === 1);
    setCvExtractedData(cvState.cvData);
    setCvAnalysisComplete(cvState.isAnalyzingCV === false && cvState.cvData !== null);
  }, [cvState, currentStep]);

  useEffect(() => {
    setCurrentEducationIndex(progressState.currentEducationIndex);
    setCurrentWorkIndex(progressState.currentWorkIndex);
    setCurrentWorkExperience(progressState.currentWorkExperience);
    setSectionsConfirmed(progressState.sectionsConfirmed);
  }, [progressState]);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setGamificationState(prev => ({
        ...prev,
        elapsedTime: Math.floor((Date.now() - conversationStartTime.current.getTime()) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save points to database
  const savePointsToDatabase = async (newPoints: number) => {
    try {
      await supabase
        .from('employees')
        .update({ 
          profile_builder_points: newPoints,
          profile_builder_streak: streak
        } as EmployeeUpdateExtra)
        .eq('id', employeeId);
    } catch (error) {
      console.error('Failed to save points:', error);
    }
  };

  // Initialize chat
  const initializeChat = () => {
    setIsInitializing(true);
    
    setTimeout(() => {
      const welcomeMessage = employeeData?.full_name
        ? `Hello ${employeeData.full_name}! 👋 Welcome to your personalized learning journey!`
        : "Hello! 👋 Welcome to your personalized learning journey!";
      
      addBotMessage(welcomeMessage, 0, 500);
      
      setTimeout(() => {
        addBotMessage(
          "I'm here to help you unlock your potential and advance your career. Our system uses AI to create personalized learning paths based on your unique profile and goals.",
          0,
          1000
        );
        
        setTimeout(() => {
          addBotMessage(
            "By completing your profile, you'll earn points, unlock achievements, and get access to tailored courses that will help you grow professionally. How does that sound? 🚀",
            0,
            1500
          );
          
          setTimeout(() => {
            showQuickReplies([
              { label: "Let's start! 🚀", value: "start", points: 50, variant: 'primary' },
              { label: "Tell me more", value: "more_info" },
              { label: "What rewards?", value: "rewards" }
            ]);
          }, 2000);
        }, 1000);
      }, 500);
      setIsInitializing(false);
    }, 1000);
  };

  // Message management functions
  const addBotMessage = (content: string | React.ReactNode, points = 0, delay = 1000) => {
    setIsTyping(true);
    
    setTimeout(async () => {
      const message: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
        ...(points > 0 && { points })
      };
      
      setMessages(prev => [...prev, message]);
      if (points > 0) {
        setPoints(prev => {
          const newPoints = prev + points;
          savePointsToDatabase(newPoints);
          return newPoints;
        });
      }
      setIsTyping(false);
      
      // Auto-save message if it's a string
      if (userId && typeof content === 'string') {
        try {
          await ChatMessageService.saveMessage({
            employee_id: employeeId,
            user_id: userId,
            message_type: 'bot',
            content,
            metadata: { points },
            step: String(currentStepRef.current)
          });
        } catch (error) {
          console.error('Failed to save bot message:', error);
        }
      }
    }, delay);
  };

  const addUserMessage = async (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    
    // Update streak for quick responses
    if (lastResponseTime && (Date.now() - lastResponseTime.getTime()) < 5000) {
      setStreak(prev => {
        const newStreak = prev + 1;
        // Save streak to database
        supabase
          .from('employees')
          .update({ profile_builder_streak: newStreak })
          .eq('id', employeeId)
          .then(() => {})
          .catch(err => console.error('Failed to save streak:', err));
        
        if (newStreak > 2) {
          addAchievement(ACHIEVEMENTS.SPEED_DEMON);
        }
        return newStreak;
      });
    }
    setLastResponseTime(new Date());
    
    // Auto-save message
    if (userId) {
      try {
        await ChatMessageService.saveMessage({
          employee_id: employeeId,
          user_id: userId,
          message_type: 'user',
          content,
          step: String(currentStepRef.current)
        });
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }
  };

  const addAchievement = (achievement: { name: string; points: number; icon: any; iconClassName: string }) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'achievement',
      content: '',
      timestamp: new Date(),
      points: achievement.points,
      achievement: {
        title: achievement.name,
        icon: React.createElement(achievement.icon, { className: achievement.iconClassName })
      }
    };
    
    setMessages(prev => [...prev, message]);
    setPoints(prev => {
      const newPoints = prev + achievement.points;
      savePointsToDatabase(newPoints);
      return newPoints;
    });
    toast.success(`Achievement Unlocked: ${achievement.name}!`);
  };

  const showQuickReplies = (options: any[]) => {
    // Clear any existing quick replies first
    setMessages(prev => prev.filter(m => m.type !== 'system' || !m.id.startsWith('quick-replies-')));
    
    // Store options for later point processing
    const optionsMap = new Map(options.map(opt => [opt.value, opt]));
    
    // Add new quick replies
    setMessages(prev => [...prev, {
      id: 'quick-replies-' + Date.now(),
      type: 'system',
      content: <QuickReplyButtons options={options} onSelect={(value, label) => handleQuickReply(value, label, optionsMap.get(value))} />,
      timestamp: new Date()
    }]);
  };

  // Handle user interactions
  const handleQuickReply = (value: string, label: string, option?: any) => {
    // Clear quick replies immediately to prevent multiple clicks
    setMessages(prev => prev.filter(m => m.type !== 'system' || !m.id.startsWith('quick-replies-')));
    
    addUserMessage(label);
    
    // Only award points through achievements, not quick replies
    processUserResponse(value);
  };

  // Missing function implementations from original ChatProfileBuilder
  const handleCVUpload = async (file: File) => {
    // Reset waiting state
    setWaitingForCVUpload(false);
    setUiState(prev => ({ ...prev, isLoading: true }));
    
    // Show upload progress
    await messageManager.addUserMessage(`📄 Uploading ${file.name}...`);
    
    // Show dynamic progress component
    setTimeout(() => {
      const messageId = 'cv-analysis-progress-' + Date.now();
      setMessages(prev => [...prev, {
        id: messageId,
        type: 'system',
        content: (
          <CVAnalysisProgress 
            forceComplete={cvAnalysisComplete}
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
        setCvState(prev => ({ ...prev, cvData: updatedEmployee.cv_extracted_data }));
        console.log('CV data loaded:', updatedEmployee.cv_extracted_data);
        
        // Reload full employee data and wait for state updates
        await loadEmployeeData();
        
        // Success! Force complete the progress animation
        setCvState(prev => ({ ...prev, isAnalyzingCV: false, cvUploaded: true }));
        messageManager.addAchievement(ACHIEVEMENTS.CV_UPLOADED);
        
        setTimeout(() => {
          messageManager.addBotMessage(
            "Excellent! I've successfully extracted your information. Let me show you what I found... ✨",
            0,
            1000
          );
        }, 1000);
        
        // Show CV sections after messages with more time for state updates
        setTimeout(() => {
          setUiState(prev => ({ ...prev, isLoading: false }));
          // Move to next step after showing sections
          setTimeout(() => {
            setNavigationState(prev => ({ 
              ...prev, 
              currentStep: 2, 
              maxStepReached: Math.max(prev.maxStepReached, 2) 
            }));
          }, 2000);
        }, 2000);
      }
      
    } catch (error) {
      console.error('CV upload error:', error);
      setUiState(prev => ({ ...prev, isLoading: false }));
      messageManager.addBotMessage(
        "Hmm, I had trouble reading your CV. No worries, we can enter the information together! 💪",
        0,
        1000
      );
      setTimeout(() => {
        setNavigationState(prev => ({ 
          ...prev, 
          currentStep: 2, 
          maxStepReached: Math.max(prev.maxStepReached, 2) 
        }));
      }, 2000);
    }
  };

  const showInlineWorkForm = () => {
    const messageId = 'inline-work-form-' + Date.now();
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-3">Add Work Experience</h3>
          <div className="space-y-3">
            <input placeholder="Job Title" className="w-full px-3 py-2 border rounded" />
            <input placeholder="Company" className="w-full px-3 py-2 border rounded" />
            <select className="w-full px-3 py-2 border rounded">
              <option>Duration</option>
              <option>&lt; 1 year</option>
              <option>1-3 years</option>
              <option>3-5 years</option>
              <option>5+ years</option>
            </select>
            <div className="flex gap-2">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                onClick={() => {
                  setMessages(prev => prev.filter(m => m.id !== messageId));
                }}>
                Save
              </button>
              <button 
                className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                onClick={() => {
                  setMessages(prev => prev.filter(m => m.id !== messageId));
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ),
      timestamp: new Date()
    }]);
  };

  const showInlineEducationForm = () => {
    const messageId = 'inline-education-form-' + Date.now();
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-3">Add Education</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newEducation = {
              degree: formData.get('degree') as string,
              institution: formData.get('institution') as string,
              year: formData.get('year') as string
            };
            
            setFormData(prev => ({
              ...prev,
              education: [...(prev.education || []), newEducation]
            }));
            setMessages(prev => prev.filter(m => m.id !== messageId));
            messageManager.addBotMessage(`Added ${newEducation.degree} from ${newEducation.institution}.`);
          }}>
            <div className="space-y-3">
              <input name="degree" placeholder="Degree" required className="w-full px-3 py-2 border rounded" />
              <input name="institution" placeholder="Institution" required className="w-full px-3 py-2 border rounded" />
              <input name="year" placeholder="Year" required className="w-full px-3 py-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Save</button>
                <button 
                  type="button" 
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  onClick={() => {
                    setMessages(prev => prev.filter(m => m.id !== messageId));
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      ),
      timestamp: new Date()
    }]);
  };

  const showEditWorkForm = (index: number) => {
    const work = formData.workExperience?.[index];
    if (!work) return;
    
    const messageId = `edit-work-form-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-3">Edit Work Experience</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const updated = {
              title: formData.get('title') as string,
              company: formData.get('company') as string,
              duration: formData.get('duration') as string
            };
            
            setFormData(prev => ({
              ...prev,
              workExperience: prev.workExperience.map((w, i) => 
                i === index ? { ...updated, responsibilities: [] } : w
              )
            }));
            setMessages(prev => prev.filter(m => m.id !== messageId));
            messageManager.addBotMessage(`Updated ${updated.title} at ${updated.company}.`);
          }}>
            <div className="space-y-3">
              <input name="title" placeholder="Job Title" defaultValue={work.title} required className="w-full px-3 py-2 border rounded" />
              <input name="company" placeholder="Company" defaultValue={work.company} required className="w-full px-3 py-2 border rounded" />
              <input name="duration" placeholder="Duration" defaultValue={work.duration} required className="w-full px-3 py-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Save</button>
                <button 
                  type="button" 
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  onClick={() => {
                    setMessages(prev => prev.filter(m => m.id !== messageId));
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      ),
      timestamp: new Date()
    }]);
  };

  const showEditEducationForm = (index: number) => {
    const edu = formData.education?.[index];
    if (!edu) return;
    
    const messageId = `edit-education-form-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-3">Edit Education</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const updated = {
              degree: formData.get('degree') as string,
              institution: formData.get('institution') as string,
              year: formData.get('year') as string
            };
            
            setFormData(prev => ({
              ...prev,
              education: prev.education.map((e, i) => 
                i === index ? updated : e
              )
            }));
            setMessages(prev => prev.filter(m => m.id !== messageId));
            messageManager.addBotMessage(`Updated ${updated.degree} from ${updated.institution}.`);
          }}>
            <div className="space-y-3">
              <input name="degree" placeholder="Degree" defaultValue={edu.degree} required className="w-full px-3 py-2 border rounded" />
              <input name="institution" placeholder="Institution" defaultValue={edu.institution} required className="w-full px-3 py-2 border rounded" />
              <input name="year" placeholder="Year" defaultValue={edu.year} required className="w-full px-3 py-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Save</button>
                <button 
                  type="button" 
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  onClick={() => {
                    setMessages(prev => prev.filter(m => m.id !== messageId));
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      ),
      timestamp: new Date()
    }]);
  };

  const showSkillAddition = () => {
    const messageId = 'skill-addition-' + Date.now();
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="max-w-2xl">
          <div className="text-sm font-medium mb-3">Add a New Skill</div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const skillName = formData.get('skill') as string;
            if (skillName) {
              setFormData(prev => ({
                ...prev,
                skills: [...(prev.skills || []), { name: skillName, level: 2 }]
              }));
              setMessages(prev => prev.filter(m => m.id !== messageId));
              messageManager.addBotMessage(`Added \"${skillName}\" to your skills.`);
            }
          }}>
            <div className="space-y-3">
              <input 
                name="skill" 
                placeholder="Enter skill name" 
                required 
                className="w-full px-3 py-2 border rounded" 
              />
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Add Skill</button>
                <button 
                  type="button" 
                  className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  onClick={() => {
                    setMessages(prev => prev.filter(m => m.id !== messageId));
                  }}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      ),
      timestamp: new Date()
    }]);
  };

  const showProfileSummary = () => {
    const messageId = 'profile-summary-' + Date.now();
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="max-w-2xl space-y-4">
          <div className="text-sm font-medium mb-3">Your Complete Profile Summary</div>
          
          {/* Personal Info */}
          {formData.fullName && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Personal Information</h4>
              <p className="text-sm">{formData.fullName}</p>
              {formData.email && <p className="text-xs text-gray-600">{formData.email}</p>}
            </div>
          )}
          
          {/* Work Experience */}
          {formData.workExperience?.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Work Experience</h4>
              {formData.workExperience.map((work, i) => (
                <div key={i} className="mb-2">
                  <p className="text-sm font-medium">{work.title}</p>
                  <p className="text-xs text-gray-600">{work.company} • {work.duration}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Education */}
          {formData.education?.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Education</h4>
              {formData.education.map((edu, i) => (
                <div key={i} className="mb-2">
                  <p className="text-sm font-medium">{edu.degree}</p>
                  <p className="text-xs text-gray-600">{edu.institution} • {edu.year}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Skills */}
          {formData.skills?.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="text-xs font-medium text-gray-600 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              setMessages(prev => prev.filter(m => m.id !== messageId));
              messageManager.addBotMessage("What would you like to edit?");
              messageManager.showQuickReplies([
                { label: "Work Experience", value: "edit_work" },
                { label: "Education", value: "edit_education" },
                { label: "Skills", value: "edit_skills" },
                { label: "Everything looks good", value: "profile_complete" }
              ]);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      ),
      timestamp: new Date()
    }]);
  };

  const showWorkSummary = () => {
    const messageId = `work-experience-summary-${Date.now()}`;
    const items = formData.workExperience || [];
    
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="max-w-2xl">
          <div className="text-sm font-medium mb-3">Your Work Experience</div>
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((work, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{work.title}</p>
                      <p className="text-xs text-gray-600">{work.company} • {work.duration}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMessages(prev => prev.filter(m => m.id !== messageId));
                        showEditWorkForm(i);
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No work experience added yet.</p>
          )}
          <button
            onClick={() => {
              setMessages(prev => prev.filter(m => m.id !== messageId));
              messageManager.addBotMessage("Your Work Experience reviewed. What's next?");
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      ),
      timestamp: new Date()
    }]);
  };

  const showEducationSummary = () => {
    const messageId = `your-education-summary-${Date.now()}`;
    const items = formData.education || [];
    
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="max-w-2xl">
          <div className="text-sm font-medium mb-3">Your Education</div>
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((edu, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{edu.degree}</p>
                      <p className="text-xs text-gray-600">{edu.institution} • {edu.year}</p>
                    </div>
                    <button
                      onClick={() => {
                        setMessages(prev => prev.filter(m => m.id !== messageId));
                        showEditEducationForm(i);
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No education added yet.</p>
          )}
          <button
            onClick={() => {
              setMessages(prev => prev.filter(m => m.id !== messageId));
              messageManager.addBotMessage("Your Education reviewed. What's next?");
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      ),
      timestamp: new Date()
    }]);
  };

  const showChallengesSelection = () => {
    const messageId = `challenges-selection-${Date.now()}`;
    const items = formData.suggestedChallenges || [];
    
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="max-w-2xl">
          <div className="text-sm font-medium mb-3">Select Professional Challenges</div>
          <div className="text-xs text-gray-600 mb-4">Choose challenges that resonate with your current role (select at least one)</div>
          
          <div className="space-y-2">
            {items.map((item, index) => (
              <label key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.selectedChallenges?.includes(index)}
                  onChange={(e) => {
                    const selected = formData.selectedChallenges || [];
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        selectedChallenges: [...selected, index]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        selectedChallenges: selected.filter(i => i !== index)
                      }));
                    }
                  }}
                  className="mt-1 rounded"
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
          
          <button
            onClick={() => {
              if (!formData.selectedChallenges?.length) {
                messageManager.addBotMessage("Please select at least one challenge to continue.");
                return;
              }
              setMessages(prev => prev.filter(m => m.id !== messageId));
              messageManager.addBotMessage("Thanks for sharing! Now let's explore growth opportunities.");
              setNavigationState(prev => ({ 
                ...prev, 
                currentStep: 7, 
                maxStepReached: Math.max(prev.maxStepReached, 7) 
              }));
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 w-full"
          >
            Continue →
          </button>
        </div>
      ),
      timestamp: new Date()
    }]);
  };
  
  const showGrowthSelection = () => {
    const messageId = `growth-selection-${Date.now()}`;
    const items = formData.suggestedGrowthAreas || [];
    
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <div className="max-w-2xl">
          <div className="text-sm font-medium mb-3">Select Growth Opportunities</div>
          <div className="text-xs text-gray-600 mb-4">Choose areas where you'd like to grow (select at least one)</div>
          
          <div className="space-y-2">
            {items.map((item, index) => (
              <label key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.selectedGrowthAreas?.includes(index)}
                  onChange={(e) => {
                    const selected = formData.selectedGrowthAreas || [];
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        selectedGrowthAreas: [...selected, index]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        selectedGrowthAreas: selected.filter(i => i !== index)
                      }));
                    }
                  }}
                  className="mt-1 rounded"
                />
                <span className="text-sm">{item}</span>
              </label>
            ))}
          </div>
          
          <button
            onClick={() => {
              if (!formData.selectedGrowthAreas?.length) {
                messageManager.addBotMessage("Please select at least one growth area to continue.");
                return;
              }
              setMessages(prev => prev.filter(m => m.id !== messageId));
              messageManager.addBotMessage("Excellent! Your profile is now complete! 🎉");
              setIsCompleted(true);
              onComplete?.();
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 w-full"
          >
            Complete Profile →
          </button>
        </div>
      ),
      timestamp: new Date()
    }]);
  };

  const showDynamicUI = (params: any) => {
    const { type, data } = params;
    
    const uiMap: Record<string, () => void> = {
      'work_form': showInlineWorkForm,
      'education_form': showInlineEducationForm,
      'skills_review': () => console.log('Skills review'),
      'profile_summary': showProfileSummary,
      'challenges_selection': showChallengesSelection,
      'growth_selection': showGrowthSelection,
      'work_summary': showWorkSummary,
      'education_summary': showEducationSummary
    };
    
    const handler = uiMap[type];
    if (handler) {
      handler();
    } else {
      console.log('Unknown UI type:', type);
    }
  };

  // Process user response (placeholder - will be replaced with actual implementation)
  const processUserResponse = (response: string) => {
    console.log('Processing user response:', response);
    // This will be implemented with the actual step processing logic
  };

  const dataPersistenceServiceRef = useRef<DataPersistenceService | null>(null);

  // ALL component handler functions like handleQuickReply, handleCVUpload, saveStepData, etc. must be defined BEFORE the useEffect hook below.
  
  const saveStepData = async (autoSave = false) => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    try {
      if (dataPersistenceServiceRef.current) {
        await dataPersistenceServiceRef.current.saveStepData(formData, currentStep, autoSave);
        if (!autoSave) toast.success('Progress saved!', { duration: 2000 });
      }
    } catch (error) {
      console.error('Failed to save step data:', error);
      toast.error('Failed to save progress');
    }
  };

  // Navigate to step with context - override the one below
  const navigateToStepWithContext = (stepNumber: number, source = 'sidebar') => {
    console.log(`Navigating to step ${stepNumber} from ${source}`);
    navigationService.navigateToStep(stepNumber);
  };

  // Move to next step
  const moveToNextStep = () => {
    const nextStep = currentStep + 1;
    if (nextStep <= STEPS.length) {
      setCurrentStep(nextStep);
      setMaxStepReached(Math.max(maxStepReached, nextStep));
      setNavigationState(prev => ({
        ...prev,
        currentStep: nextStep,
        maxStepReached: Math.max(prev.maxStepReached, nextStep)
      }));
    }
  };

  // Update step history
  const updateStepHistory = (stepId: number, status: 'not_visited' | 'in_progress' | 'completed' | 'reviewing') => {
    setStepHistory(prev => {
      const updated = new Map(prev);
      const existing = updated.get(stepId) || {
        stepId,
        firstVisitedAt: new Date(),
        lastVisitedAt: new Date(),
        visitCount: 0,
        status: 'not_visited',
        milestoneAwarded: false
      };
      
      updated.set(stepId, {
        ...existing,
        status,
        lastVisitedAt: new Date(),
        visitCount: existing.visitCount + 1,
        ...(status === 'completed' && { completedAt: new Date() })
      });
      
      return updated;
    });
  };

  // Complete profile
  const completeProfile = async () => {
    try {
      setIsCompleted(true);
      addAchievement(ACHIEVEMENTS.COMPLETIONIST);
      
      // Save final profile data
      await saveStepData();
      
      // Mark profile as complete
      try {
        await supabase
          .from('employees')
          .update({ profile_builder_completed: true } as EmployeeUpdateExtra)
          .eq('id', employeeId);
      } catch (dbError) {
        console.error('Failed to update profile completion:', dbError);
      }
      
      // Generate course outline if needed
      if (!courseOutline) {
        // Course generation logic would go here
        console.log('Generating course outline...');
      }
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Failed to complete profile');
    }
  };

  // Initialize services with current state and setters
  const messageManager = new MessageManager(
    setMessages,
    (typing: boolean) => setUiState(prev => ({ ...prev, isTyping: typing })),
    (points: number) => setGamificationState(prev => ({ ...prev, points })),
    (streak: number) => setGamificationState(prev => ({ ...prev, learningStreak: streak })),
    (time: Date | null) => setGamificationState(prev => ({ ...prev, startTime: time })),
    employeeId,
    userId,
    currentStepRef,
    gamificationState.startTime,
    async (points: number) => {
      try {
        await supabase
          .from('employees')
          .update({ profile_builder_points: points } as EmployeeUpdateExtra)
          .eq('id', employeeId);
      } catch (error) {
        console.error('Failed to save points:', error);
      }
    }
  );

  const navigationService = new NavigationService(
    navigationState,
    setNavigationState,
    currentStepRef,
    maxStepReachedRef
  );

  const smartIntentService = new SmartIntentService();

  // Initialize handlers with proper context
  const stepHandlerContext = {
    setCurrentStep,
    setMaxStepReached,
    setMessages,
    setFormData,
    currentStepRef,
    maxStepReached: navigationState.maxStepReached,
    formData,
    employeeId,
    addBotMessage: messageManager.addBotMessage,
    addAchievement: messageManager.addAchievement,
    showQuickReplies: messageManager.showQuickReplies,
    moveToNextStep: () => navigationService.moveToNextStep(),
    analyzeIntent: smartIntentService.analyzeIntent,
    executeSmartAction: async (intent: any) => {
      const smartHandlers = new SmartIntentHandlers(stepHandlerContext);
      await smartHandlers.executeSmartAction(intent);
    },
    handleCVUpload: async (file: File) => {
      const cvHandlers = new CVHandlers(stepHandlerContext);
      await cvHandlers.handleCVUpload(file);
    },
    showInlineWorkForm: () => {
      const messageHandlers = new MessageHandlers(stepHandlerContext);
      messageHandlers.showInlineWorkForm();
    },
    showInlineEducationForm: () => {
      const messageHandlers = new MessageHandlers(stepHandlerContext);
      messageHandlers.showInlineEducationForm();
    },
    ChatSkillsReview,
    // Add other missing properties from various handler contexts
    userId,
    setWaitingForCVUpload,
    saveStepData,
    navigateToStep,
    initiateStep: (step: number) => {}, // Placeholder
    onComplete,
    isUpdatingInfo,
    returnToStep,
    setReturnToStep,
    setIsUpdatingInfo,
    currentWorkExperience,
    setCurrentWorkExperience,
    currentEducationIndex,
    setCurrentEducationIndex,
    currentWorkIndex,
    setCurrentWorkIndex,
    personalizedSuggestions,
    setCourseOutline,
    setIsCompleted,
  };

  const stepHandlers = new StepHandlers(stepHandlerContext);
  const intentHandlers = new IntentHandlers(stepHandlerContext);
  const stepProcessors = new StepProcessors(stepHandlerContext);

  // Initialize DataPersistenceService
  const dataPersistenceService = userId ? new DataPersistenceService(
    employeeId,
    userId,
    {
      setMessages,
      setHasMoreMessages,
      setCvUploaded,
      setNavigationState,
      setCvState,
      setLoadingHistory
    },
    {
      showQuickReplies: messageManager.showQuickReplies,
      initializeChat,
      handleSectionAccept,
      handleSectionUpdate,
      handleAllSectionsComplete
    },
    {
      CVExtractedSections
    }
  ) : null;

  // Initialize conversation
  useEffect(() => {
    loadEmployeeData();
    loadCurrentUser();
  }, [employeeId]);

  // Load current user
  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  // Load employee data
  const loadEmployeeData = async () => {
    try {
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      setEmployeeData(employee);

      // Initialize gamification state from database
      if (employee.profile_builder_points) {
        setGamificationState(prev => ({ ...prev, points: employee.profile_builder_points }));
      }
      if (employee.profile_builder_streak) {
        setGamificationState(prev => ({ ...prev, learningStreak: employee.profile_builder_streak }));
      }

      // Check CV status
      if (employee.cv_file_path) {
        setCvState(prev => ({ ...prev, cvUploaded: true }));
      }
      if (employee.cv_extracted_data) {
        setCvState(prev => ({ ...prev, cvData: employee.cv_extracted_data }));
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      toast.error('Failed to load employee data');
    }
  };

  // Start chat after employee data loads
  useEffect(() => {
    if (employeeData && userId) {
      loadChatHistory();
    }
  }, [employeeData, userId]);

  // Load chat history
  const loadChatHistory = async () => {
    if (!userId) return;
    setUiState(prev => ({ ...prev, loadingHistory: true }));
    try {
      if (dataPersistenceServiceRef.current) {
        const history = await dataPersistenceServiceRef.current.loadChatHistory();
        if (history.length > 0) {
          setMessages(history);
          const lastMessage = history[history.length - 1];
          const lastStep = lastMessage.metadata?.step || 0;
          setNavigationState(prev => ({
            ...prev,
            currentStep: lastStep,
            maxStepReached: Math.max(prev.maxStepReached, lastStep)
          }));
        } else {
          startConversation();
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      toast.error('Could not load chat history.');
      startConversation();
    } finally {
      setUiState(prev => ({ ...prev, loadingHistory: false }));
    }
  };

  // Start conversation
  const startConversation = () => {
    const welcomeMessage = employeeData?.full_name
      ? `Hello ${employeeData.full_name}! 👋 Welcome to your personalized learning journey!`
      : "Hello! 👋 Welcome to your personalized learning journey!";
    
    messageManager.addBotMessage(welcomeMessage, 0, 500);
    
    setTimeout(() => {
      messageManager.addBotMessage(
        "I'm here to help build your professional profile and create a customized learning path just for you. Let's get started! 🚀",
        0,
        1000
      );
      
      setTimeout(() => {
        messageManager.addBotMessage(
          "To give you the best personalized experience, I can analyze your CV to automatically extract your experience and skills. Would you like to:",
          0,
          1500
        );
        
        setTimeout(() => {
          messageManager.showQuickReplies([
            { label: "📄 Upload my CV", value: "upload_cv", points: 50 },
            { label: "✏️ Fill manually", value: "manual_entry", points: 25 }
          ]);
        }, 2000);
      }, 1000);
    }, 500);

    setNavigationState(prev => ({ ...prev, currentStep: 1, maxStepReached: 1 }));
    messageManager.addAchievement(ACHIEVEMENTS.QUICK_START);
  };

  // Handle text input
  const handleTextInput = async (input: string) => {
    await messageManager.addUserMessage(input);
    await stepHandlers.processUserResponse(input);
  };

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (currentStepLegacy === 1 || waitingForCVUpload) {
      const cvHandlers = new CVHandlers(
        employeeId,
        messageManager,
        setCvState,
        setUiState
      );
      await cvHandlers.handleCVUpload(file);
    }
  };

  // Handle section accept
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
    
    // Save section data using auto-save
    saveStepData(true);
  };

  // Handle section update
  const handleSectionUpdate = (section: 'work' | 'education' | 'certifications' | 'languages', data: any) => {
    // Update the CV extracted data
    setCvState(prev => ({
      ...prev,
      cvData: {
        ...prev.cvData,
        [section === 'work' ? 'work_experience' : section]: data
      }
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
    
    // Save updated data
    saveStepData(true);
  };

  // Handle all sections complete
  const handleAllSectionsComplete = async () => {
    // Import CV data to profile
    await supabase.functions.invoke('import-cv-to-profile', {
      body: { employeeId }
    });
    
    // Clear the sections display
    setMessages(prev => prev.filter(m => !m.id.startsWith('cv-sections-')));
    
    messageManager.addBotMessage("Perfect! All your information has been verified and saved. Let's continue with your skills! 🚀", 0);
    
    // Move to skills step
    setTimeout(() => {
      setNavigationState(prev => ({ 
        ...prev, 
        currentStep: 4, 
        maxStepReached: Math.max(prev.maxStepReached, 4) 
      }));
    }, 1500);
  };

  // Initialize DataPersistenceService after all function definitions
  useEffect(() => {
    if (!dataPersistenceServiceRef.current && userId && messageManager) {
      const allHandlersAndSetters = {
        // All state and setters required by any service or handler
        employeeId,
        userId,
        setMessages,
        setHasMoreMessages,
        setCvUploaded,
        setNavigationState,
        setCvState,
        setLoadingHistory,
        showQuickReplies,
        initializeChat,
        handleSectionAccept,
        handleSectionUpdate,
        handleAllSectionsComplete,
        CVExtractedSections,
        setCurrentStep,
        setMaxStepReached,
        setFormData,
        currentStepRef,
        maxStepReached: navigationState.maxStepReached,
        formData,
        addBotMessage: messageManager.addBotMessage,
        addAchievement: messageManager.addAchievement,
        moveToNextStep: () => navigationService.moveToNextStep(),
        analyzeIntent: smartIntentService.analyzeIntent,
        executeSmartAction: async (intent: any) => {
          const smartHandlers = new SmartIntentHandlers(allHandlersAndSetters);
          await smartHandlers.executeSmartAction(intent);
        },
        handleCVUpload: async (file: File) => {
          const cvHandlers = new CVHandlers(allHandlersAndSetters);
          await cvHandlers.handleCVUpload(file);
        },
        showInlineWorkForm: () => {
          const messageHandlers = new MessageHandlers(allHandlersAndSetters);
          messageHandlers.showInlineWorkForm();
        },
        showInlineEducationForm: () => {
          const messageHandlers = new MessageHandlers(allHandlersAndSetters);
          messageHandlers.showInlineEducationForm();
        },
        ChatSkillsReview,
        setWaitingForCVUpload,
        saveStepData,
        navigateToStep,
        initiateStep: (step: number) => {}, // Placeholder
        onComplete,
        isUpdatingInfo,
        returnToStep,
        setReturnToStep,
        setIsUpdatingInfo,
        currentWorkExperience,
        setCurrentWorkExperience,
        currentEducationIndex,
        setCurrentEducationIndex,
        currentWorkIndex,
        setCurrentWorkIndex,
        personalizedSuggestions,
        setCourseOutline,
        setIsCompleted,
      };

      dataPersistenceServiceRef.current = new DataPersistenceService(
        employeeId,
        userId,
        {
          setMessages,
          setHasMoreMessages,
          setCvUploaded,
          setNavigationState,
          setCvState,
          setLoadingHistory
        },
        {
          showQuickReplies: messageManager.showQuickReplies,
          initializeChat,
          handleSectionAccept,
          handleSectionUpdate,
          handleAllSectionsComplete
        },
        {
          CVExtractedSections
        }
      );
      
      const stepHandlers = new StepHandlers(allHandlersAndSetters);
      const intentHandlers = new IntentHandlers(allHandlersAndSetters);
      const stepProcessors = new StepProcessors(allHandlersAndSetters);
      
      // Now safe to load data
      loadEmployeeData();
      loadChatHistory();
    }
  }, [employeeId, userId, messageManager]);

  // Navigate to step
  const navigateToStep = (stepNumber: number) => {
    navigationService.navigateToStep(stepNumber);
  };

  // Load more messages
  const loadMoreMessages = async () => {
    setUiState(prev => ({ ...prev, loadingHistory: true }));
    
    try {
      const offset = messages.length;
      const olderMessages = await ChatMessageService.getRecentMessages(employeeId, 10, offset);
      
      if (olderMessages.length > 0) {
        const formattedMessages: Message[] = olderMessages.map((msg: any) => ({
          id: msg.id || crypto.randomUUID(),
          type: msg.message_type as Message['type'],
          content: msg.content,
          timestamp: new Date(msg.created_at || Date.now()),
          metadata: msg.metadata
        }));

        setMessages(prev => [...formattedMessages.reverse(), ...prev]);
        
        // Check if there are more messages
        const { total } = await ChatMessageService.getAllMessages(employeeId, 0, 1);
        setUiState(prev => ({ ...prev, hasMoreMessages: total > (messages.length + olderMessages.length) }));
      } else {
        setUiState(prev => ({ ...prev, hasMoreMessages: false }));
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
      toast.error('Failed to load chat history');
    } finally {
      setUiState(prev => ({ ...prev, loadingHistory: false }));
    }
  };

  // Handle start fresh
  const handleStartFresh = async () => {
    setMessages([]);
    setFormData({
      workExperience: [],
      education: [],
      skills: [],
      challenges: [],
      growthAreas: []
    });
    setNavigationState(prev => ({
      ...prev,
      currentStep: 0,
      maxStepReached: 0
    }));
    if (dataPersistenceServiceRef.current) {
      await dataPersistenceServiceRef.current.clearProfileData();
    }
    initializeChat();
    setUiState(prev => ({ ...prev, showRestartDialog: false }));
  };

  // Get steps for menu
  const getStepsForMenu = () => {
    return STEPS.map(step => ({
      ...step,
      completed: step.id <= maxStepReachedLegacy,
      current: step.id === currentStepLegacy
    }));
  };

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (Object.keys(formData).some(key => formData[key as keyof FormData])) {
        await dataPersistenceServiceRef.current?.saveStepData(formData, currentStep, true);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, currentStep]);

  // Update smart context when relevant state changes
  useEffect(() => {
    setSmartContext(prev => ({
      ...prev,
      currentStep: currentStep,
      formData: formData
    }));
  }, [currentStep, formData]);

  // Auto-save functionality for form data
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      const step = currentStepRef.current;
      if (step > 0 && step <= STEPS.length) {
        saveStepData(true);
      }
    }, 2000);
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, currentStep]);

  // Initialize gamification state from database when employee data loads
  useEffect(() => {
    if (employeeData) {
      // Initialize gamification state from database
      if (employeeData.profile_builder_points) {
        setPoints(employeeData.profile_builder_points);
        setGamificationState(prev => ({ ...prev, points: employeeData.profile_builder_points }));
      }
      if (employeeData.profile_builder_streak) {
        setStreak(employeeData.profile_builder_streak);
        setGamificationState(prev => ({ ...prev, learningStreak: employeeData.profile_builder_streak }));
      }

      // Check CV status
      if (employeeData.cv_file_path) {
        setCvUploaded(true);
        setCvState(prev => ({ ...prev, cvUploaded: true }));
      }
      if (employeeData.cv_extracted_data) {
        setCvExtractedData(employeeData.cv_extracted_data);
        setCvState(prev => ({ ...prev, cvData: employeeData.cv_extracted_data }));
      }
    }
  }, [employeeData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear skills component on component unmount
      setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
    };
  }, []);

  // Render completed state
  if (isCompleted && courseOutline) {
    return (
      <CourseOutlineReward
        courseOutline={courseOutline}
        employeeName={employeeData?.full_name || 'Learner'}
        loading={false}
        error={null}
        onViewFullCourse={() => console.log('View course')}
        onStartCourse={() => console.log('Start course')}
        onRetryGeneration={() => {}}
      />
    );
  }

  // Get achievements data
  const achievements = [
    { id: 'quick_start', ...ACHIEVEMENTS.QUICK_START, unlocked: points >= 50, icon: React.createElement(ACHIEVEMENTS.QUICK_START.icon, { className: ACHIEVEMENTS.QUICK_START.iconClassName }) },
    { id: 'cv_uploaded', ...ACHIEVEMENTS.CV_UPLOADED, unlocked: cvUploaded, icon: React.createElement(ACHIEVEMENTS.CV_UPLOADED.icon, { className: ACHIEVEMENTS.CV_UPLOADED.iconClassName }) },
    { id: 'speed_demon', ...ACHIEVEMENTS.SPEED_DEMON, unlocked: streak > 2, icon: React.createElement(ACHIEVEMENTS.SPEED_DEMON.icon, { className: ACHIEVEMENTS.SPEED_DEMON.iconClassName }) },
    { id: 'completionist', ...ACHIEVEMENTS.COMPLETIONIST, unlocked: currentStepLegacy === STEPS.length, icon: React.createElement(ACHIEVEMENTS.COMPLETIONIST.icon, { className: ACHIEVEMENTS.COMPLETIONIST.iconClassName }) }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Start Fresh button */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <h2 className="text-sm font-medium text-gray-700">Profile Builder Chat</h2>
          {messages.length >= 2 && !isCompleted && (
            <AlertDialog open={showRestartDialog} onOpenChange={(open) => setUiState(prev => ({ ...prev, showRestartDialog: open }))}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  Start Fresh
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start Fresh?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear your current conversation and all profile data including:
                    • Work experience • Education • Skills • Certifications
                    • CV uploads • Current projects • Challenges • Growth areas
                    
                    Only your basic login information will be preserved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleStartFresh}>
                    Yes, Start Fresh
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 text-center mb-2">
              Messages: {messages.length}, Has more: {hasMoreMessages.toString()}
            </div>
          )}
          
          {/* Load More Messages Button */}
          {hasMoreMessages && (
            <div className="flex justify-center mb-4">
              <Button
                variant="ghost"
                onClick={loadMoreMessages}
                disabled={loadingHistory}
                className="text-sm"
              >
                {loadingHistory ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Load previous messages
                  </>
                )}
              </Button>
            </div>
          )}
          
          <AnimatePresence>
            {messages.map((message) => (
              <ChatMessage key={message.id} {...message} />
            ))}
          </AnimatePresence>
          
          {/* Dynamic step message - shows during navigation and step transitions */}
          {showDynamicMessage && currentStepLegacy > 0 && currentStepLegacy !== 4 && (
            <ProfileStepMessage 
              step={currentStepLegacy}
              navigatingTo={navigatingTo}
              onNavigationComplete={() => {
                setNavigationState(prev => ({ ...prev, navigatingTo: null }));
              }}
              forceUpdate={!navigatingTo}
            />
          )}
        
          {isTyping && <TypingIndicator />}
        
          {/* Show file drop zone when waiting for CV upload */}
          {waitingForCVUpload && !isLoading && (
            <>
              <FileDropZone 
                onFileSelect={handleFileUpload}
                isLoading={isLoading}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Having trouble? You can also:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCvState(prev => ({ ...prev, cvFile: {} as File })); // Clear waiting state
                    messageManager.addBotMessage("No problem! Let's build your profile together step by step. 💪", 0);
                    setTimeout(() => {
                      messageManager.addBotMessage("First, let's talk about your work experience. What's your current or most recent job title?", 0, 500);
                      setNavigationState(prev => ({ 
                        ...prev, 
                        currentStep: 2, 
                        maxStepReached: Math.max(prev.maxStepReached, 2) 
                      }));
                    }, 1000);
                  }}
                >
                  Continue without CV
                </Button>
              </div>
            </>
          )}
        
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <ChatInput
          onSend={handleTextInput}
          onFileUpload={(currentStepLegacy === 1 || waitingForCVUpload) ? handleFileUpload : undefined}
          disabled={isLoading || isTyping}
          isLoading={isLoading}
          placeholder={
            waitingForCVUpload ? "Upload your CV using the area above..." : 
            currentStepLegacy === 1 ? "Type or upload your CV..." : 
            "Type your response..."
          }
        />
      </div>
      
      {/* Right Sidebar */}
      <ProfileProgressSidebar
        currentStep={currentStepLegacy}
        totalSteps={STEPS.length}
        points={points}
        streak={streak}
        elapsedTime={elapsedTime}
        steps={getStepsForMenu()}
        achievements={achievements}
        onStepClick={navigateToStep}
      />
    </div>
  );
}