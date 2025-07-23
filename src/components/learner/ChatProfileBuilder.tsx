import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import { ChatMessageService } from '@/services/chatMessageService';
import { ProfileBuilderStateService, type ProfileBuilderState } from '@/services/profileBuilderStateService';
import ChatMessage from './chat/ChatMessage';
import QuickReplyButtons from './chat/QuickReplyButtons';
import ChatInput from './chat/ChatInput';
import TypingIndicator from './chat/TypingIndicator';
import FileDropZone from './chat/FileDropZone';
import CVExtractedSections from './chat/CVExtractedSections';
import CVAnalysisProgress from './chat/CVAnalysisProgress';
import ProfileProgressSidebar from './chat/ProfileProgressSidebar';
import ChatSkillsReview from './chat/ChatSkillsReview';
import ProfileStepMessage from './chat/ProfileStepMessage';
import SectionConfirmationProgress from './chat/SectionConfirmationProgress';
import CourseOutlineReward from './CourseOutlineReward';
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

interface NavigationContext {
  source: 'forward_progression' | 'backward_navigation' | 'sidebar_jump' | 'restoration';
  intent: 'first_visit' | 'continue_progress' | 'review_completed' | 'edit_existing';
}

interface ChatProfileBuilderProps {
  employeeId: string;
  onComplete: () => void;
}

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

interface FormData {
  currentPosition: string;
  department: string;
  timeInRole: string;
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: string;
  }>;
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

const ACHIEVEMENTS = {
  QUICK_START: { name: "Quick Start", points: 50, icon: <Zap className="h-6 w-6 text-yellow-600" /> },
  CV_UPLOADED: { name: "Document Master", points: 200, icon: <Upload className="h-6 w-6 text-blue-600" /> },
  SPEED_DEMON: { name: "Speed Demon", points: 150, icon: <Clock className="h-6 w-6 text-purple-600" /> },
  COMPLETIONIST: { name: "Profile Hero", points: 500, icon: <Trophy className="h-6 w-6 text-gold-600" /> }
};

export default function ChatProfileBuilder({ employeeId, onComplete }: ChatProfileBuilderProps) {
  // State Management
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for initial greeting
  const [maxStepReached, setMaxStepReached] = useState(0); // Track furthest step reached
  const [isTyping, setIsTyping] = useState(false);
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponseTime, setLastResponseTime] = useState<Date | null>(null);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState<any>(null);
  const [courseOutline, setCourseOutline] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [currentWorkExperience, setCurrentWorkExperience] = useState<any>({});
  const [waitingForCVUpload, setWaitingForCVUpload] = useState(false);
  const [cvExtractedData, setCvExtractedData] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentEducationIndex, setCurrentEducationIndex] = useState(0);
  const [currentWorkIndex, setCurrentWorkIndex] = useState(0);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showNavigationMenu, setShowNavigationMenu] = useState(false);
  const [cvAnalysisComplete, setCvAnalysisComplete] = useState(false);
  const [builderState, setBuilderState] = useState<ProfileBuilderState | null>(null);
  const [navigatingTo, setNavigatingTo] = useState<number | null>(null);
  const [showDynamicMessage, setShowDynamicMessage] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [sectionsConfirmed, setSectionsConfirmed] = useState<string[]>([]);
  const [cvAcceptedSections, setCvAcceptedSections] = useState({
    work: false,
    education: false,
    certifications: false,
    languages: false
  });
  
  // Context-aware navigation state
  const [stepHistory, setStepHistory] = useState<Map<number, StepVisitHistory>>(new Map());
  const [awardedMilestones, setAwardedMilestones] = useState<Set<string>>(new Set());
  const [navigationContext, setNavigationContext] = useState<NavigationContext | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conversationStartTime = useRef<Date>(new Date());
  const currentStepRef = useRef(currentStep);
  
  // Keep ref in sync with state
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - conversationStartTime.current.getTime()) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Form Data (reusing existing structure)
  const [formData, setFormData] = useState<FormData>({
    currentPosition: '',
    department: '',
    timeInRole: '',
    workExperience: [],
    education: [],
    currentProjects: [],
    teamSize: '',
    roleInTeam: '',
    challenges: [],
    growthAreas: []
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Start chat after employee data loads
  useEffect(() => {
    if (employeeData && userId) {
      loadChatHistory();
    }
  }, [employeeData, userId]);

  // Restore step UI when navigating back with existing data
  // Remove this useEffect as it causes infinite loops when initiateStep creates new messages

  // Load chat history
  const loadChatHistory = async () => {
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
          setCurrentStep(lastStep);
          setMaxStepReached(prev => Math.max(prev, lastStep));
          
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
            setWaitingForCVUpload(true);
            setCurrentStep(1);
            setMaxStepReached(prev => Math.max(prev, 1));
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
  const loadMoreMessages = async () => {
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

  const handleStartFresh = async () => {
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

  const initializeChat = () => {
    // Prevent duplicate initialization
    if (isInitializing) return;
    setIsInitializing(true);
    
    addBotMessage(
      `Hey ${employeeData?.full_name || 'there'}! 👋 I'm Lexie, your AI profile assistant. Ready to build your professional profile together? It's like a quest where you unlock rewards along the way!`,
      0,
      1500
    );
    
    setTimeout(() => {
      addBotMessage(
        "This usually takes about 5 minutes, and you'll earn points and achievements as we go. How does that sound?",
        0,
        1000
      );
      
      setTimeout(() => {
        showQuickReplies([
          { label: "Let's start! 🚀", value: "start", points: 50, variant: 'primary' },
          { label: "Tell me more", value: "more_info" },
          { label: "What rewards?", value: "rewards" }
        ]);
        setIsInitializing(false); // Reset initialization flag after completion
      }, 1200);
    }, 2000);
  };

  // Save points to database
  const savePointsToDatabase = async (newPoints: number) => {
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

  // Load existing employee data
  const loadEmployeeData = async () => {
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

  // Message Management
  const addBotMessage = (content: string | React.ReactNode, points = 0, delay = 1000) => {
    setIsTyping(true);
    
    setTimeout(async () => {
      const message: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
        ...(points > 0 && { points }) // Only include points if greater than 0
      };
      
      setMessages(prev => [...prev, message]);
      if (points > 0) {
        setPoints(prev => {
          const newPoints = prev + points;
          // Save points to database
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
            step: currentStepRef.current
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
          step: currentStepRef.current
        });
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }
  };

  const addAchievement = (achievement: typeof ACHIEVEMENTS.QUICK_START) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'achievement',
      content: '',
      timestamp: new Date(),
      points: achievement.points,
      achievement: {
        title: achievement.name,
        icon: achievement.icon
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
    addUserMessage(label);
    
    // Only award points through achievements, not quick replies
    processUserResponse(value);
  };

  const handleTextInput = (message: string) => {
    addUserMessage(message);
    processUserResponse(message);
  };

  const handleFileUpload = async (file: File) => {
    if (currentStep === 1 || waitingForCVUpload) {
      // CV Upload - handleCVUpload will show the upload message
      await handleCVUpload(file);
    }
  };

  // Auto-save effect
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

  // Process responses based on current step
  const processUserResponse = (response: string) => {
    const step = currentStepRef.current;
    
    // Initial conversation
    if (step === 0) {
      if (response === 'start') {
        // Only award achievement if this is the first time starting
        if (maxStepReached === 0) {
          addAchievement(ACHIEVEMENTS.QUICK_START);
        }
        startStep1();
      } else if (response === 'rewards') {
        explainRewards();
      } else if (response === 'more_info') {
        explainProcess();
      }
      return;
    }

    // Handle actual profile steps
    const stepName = STEPS[step - 1]?.name;
    
    switch (stepName) {
      case 'cv_upload':
        handleCVUploadResponse(response);
        break;
        
      case 'work_experience':
        handleWorkExperience(response);
        break;
        
      case 'education':
        handleEducation(response);
        break;
        
      case 'skills':
        // Handle skills step responses
        if (response === 'skip_skills') {
          moveToNextStep();
        } else if (response === 'review_skills') {
          // Show skills review component
          setMessages(prev => [...prev, {
            id: 'skills-component',
            type: 'system',
            content: (
              <ChatSkillsReview
                employeeId={employeeId}
                onComplete={() => {
                  moveToNextStep();
                }}
              />
            ),
            timestamp: new Date()
          }]);
        }
        break;
        
      case 'current_work':
        handleCurrentWork(response);
        break;
        
      case 'challenges':
        handleChallenges(response);
        break;
        
      case 'growth':
        handleGrowthAreas(response);
        break;
    }
  };

  // Step handlers
  const startStep1 = () => {
    setCurrentStep(1); // Move to CV upload step
    setMaxStepReached(prev => Math.max(prev, 1));
    // Don't show dynamic message for initial CV upload step
    addBotMessage(
      "Great! Let's start with the easiest way. Do you have a CV or resume handy? I can extract your information from it to save you time! 📄",
      0,
      1000
    );
    
    setTimeout(() => {
      showQuickReplies([
        { label: "📤 Upload CV", value: "upload_cv", points: 0, variant: 'primary' },
        { label: "✍️ Enter manually", value: "manual_entry", points: 0 }
      ]);
    }, 2000);
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

  const handleWorkExperience = (response: string) => {
    // Handle single entry verification
    if (response === 'confirm_single_experience') {
      const nextIndex = currentWorkIndex + 1;
      if (nextIndex < formData.workExperience.length) {
        // Show next work experience
        setCurrentWorkIndex(nextIndex);
        const exp = formData.workExperience[nextIndex];
        addBotMessage(
          `Good! Let's verify the next one (${nextIndex + 1} of ${formData.workExperience.length}):\n\n📋 ${exp.title} at ${exp.company}\n${exp.duration ? `⏱️ ${exp.duration}` : ''}\n\nIs this correct?`,
          50,
          1000
        );
        setTimeout(() => {
          showQuickReplies([
            { label: "Yes, that's correct", value: "confirm_single_experience", variant: 'primary' },
            { label: "Edit this position", value: "edit_single_experience" },
            { label: "Continue to next step", value: "skip_work_verification" }
          ]);
        }, 1500);
      } else {
        // All verified
        addBotMessage("Perfect! All your work experiences have been verified. 👍", 0);
        setTimeout(() => moveToNextStep(), 1500);
      }
      return;
    } else if (response === 'edit_single_experience') {
      // Edit current entry
      const exp = formData.workExperience[currentWorkIndex];
      setCurrentWorkExperience({ ...exp, editing: true, index: currentWorkIndex });
      addBotMessage("Let's update this position. What's the correct job title?", 0);
      return;
    } else if (response === 'skip_work_verification') {
      addBotMessage("No problem! Let's continue to education. 📚", 0);
      setTimeout(() => moveToNextStep(), 1500);
      return;
    } else if (response === 'confirm_experience') {
      // Legacy - treat as confirm all
      addBotMessage("Perfect! Your work experience looks great. 👍", 0);
      setTimeout(() => moveToNextStep(), 1500);
      return;
    } else if (response === 'edit_experience') {
      // Legacy - clear all
      setFormData(prev => ({ ...prev, workExperience: [] }));
      addBotMessage("No problem! Let's update this. What's your correct job title?", 0);
      return;
    }
    
    // Handle editing or building new experience
    if (currentWorkExperience.editing && currentWorkExperience.index !== undefined) {
      // Editing existing entry
      if (!currentWorkExperience.title) {
        setCurrentWorkExperience(prev => ({ ...prev, title: response }));
        addBotMessage("And which company is/was this with?", 0);
      } else if (!currentWorkExperience.company) {
        setCurrentWorkExperience(prev => ({ ...prev, company: response }));
        addBotMessage("How long have you been in this role?", 0);
        showQuickReplies([
          { label: "Less than 1 year", value: "< 1 year" },
          { label: "1-3 years", value: "1-3 years" },
          { label: "3-5 years", value: "3-5 years" },
          { label: "5+ years", value: "5+ years" }
        ]);
      } else if (!currentWorkExperience.duration) {
        // Update the existing entry
        const updatedExperience = { 
          title: currentWorkExperience.title,
          company: currentWorkExperience.company,
          duration: response,
          description: currentWorkExperience.description || ''
        };
        
        setFormData(prev => {
          const updated = [...prev.workExperience];
          updated[currentWorkExperience.index] = updatedExperience;
          return { ...prev, workExperience: updated };
        });
        
        setCurrentWorkExperience({});
        saveStepData(true);
        
        // Continue with verification from where we left off
        const nextIndex = currentWorkExperience.index + 1;
        if (nextIndex < formData.workExperience.length) {
          setCurrentWorkIndex(nextIndex);
          const exp = formData.workExperience[nextIndex];
          addBotMessage(
            `Updated! Now let's check the next one (${nextIndex + 1} of ${formData.workExperience.length}):\n\n📋 ${exp.title} at ${exp.company}\n${exp.duration ? `⏱️ ${exp.duration}` : ''}\n\nIs this correct?`,
            50,
            1000
          );
          setTimeout(() => {
            showQuickReplies([
              { label: "Yes, that's correct", value: "confirm_single_experience", variant: 'primary' },
              { label: "Edit this position", value: "edit_single_experience" },
              { label: "Continue to next step", value: "skip_work_verification" }
            ]);
          }, 1500);
        } else {
          addBotMessage("Perfect! All your work experiences have been updated. 👍", 0);
          setTimeout(() => moveToNextStep(), 1500);
        }
      }
    } else {
      // Building new experience
      if (!currentWorkExperience.title) {
        setCurrentWorkExperience({ title: response });
        addBotMessage("And which company is/was this with?", 0);
      } else if (!currentWorkExperience.company) {
        setCurrentWorkExperience(prev => ({ ...prev, company: response }));
        addBotMessage("How long have you been in this role?", 0);
        showQuickReplies([
          { label: "Less than 1 year", value: "< 1 year" },
          { label: "1-3 years", value: "1-3 years" },
          { label: "3-5 years", value: "3-5 years" },
          { label: "5+ years", value: "5+ years" }
        ]);
      } else if (!currentWorkExperience.duration) {
        const newExperience = { ...currentWorkExperience, duration: response };
        setFormData(prev => ({
          ...prev,
          workExperience: [...prev.workExperience, newExperience]
        }));
        setCurrentWorkExperience({});
        saveStepData(true);
        
        addBotMessage("Excellent! Would you like to add another position?", 0);
        showQuickReplies([
          { label: "Add another position", value: "add_more" },
          { label: "Continue to education", value: "continue", variant: 'primary' }
        ]);
      } else if (response === 'add_more') {
        setCurrentWorkExperience({});
        addBotMessage("What's the role title for this position?", 0);
      } else if (response === 'continue') {
        moveToNextStep();
      }
    }
  };

  const handleEducation = (response: string) => {
    // Handle single entry verification
    if (response === 'confirm_single_education') {
      const nextIndex = currentEducationIndex + 1;
      if (nextIndex < formData.education.length) {
        // Show next education
        setCurrentEducationIndex(nextIndex);
        const edu = formData.education[nextIndex];
        addBotMessage(
          `Good! Let's verify the next one (${nextIndex + 1} of ${formData.education.length}):\n\n🎓 ${edu.degree}\n🏫 ${edu.institution}\n${edu.year ? `📅 ${edu.year}` : ''}\n\nIs this correct?`,
          50,
          1000
        );
        setTimeout(() => {
          showQuickReplies([
            { label: "Yes, that's correct", value: "confirm_single_education", variant: 'primary' },
            { label: "Edit this education", value: "edit_single_education" },
            { label: "Continue to next step", value: "skip_education_verification" }
          ]);
        }, 1500);
      } else {
        // All verified
        addBotMessage("Excellent! All your education details have been verified. 🎓", 0);
        setTimeout(() => moveToNextStep(), 1500);
      }
      return;
    } else if (response === 'edit_single_education') {
      // Edit current entry - store index for later
      const edu = formData.education[currentEducationIndex];
      // Temporarily store the index
      setFormData(prev => ({ 
        ...prev, 
        education: prev.education.filter((_, i) => i !== currentEducationIndex)
      }));
      addBotMessage("Let's update this education. What's the correct degree?", 0);
      setTimeout(() => {
        showQuickReplies([
          { label: "High School", value: "High School" },
          { label: "Bachelor's", value: "Bachelor" },
          { label: "Master's", value: "Master" },
          { label: "PhD", value: "PhD" },
          { label: "Other", value: "Other" }
        ]);
      }, 1000);
      return;
    } else if (response === 'skip_education_verification') {
      addBotMessage("No problem! Let's continue with your skills. 💪", 0);
      setTimeout(() => moveToNextStep(), 1500);
      return;
    } else if (response === 'confirm_education') {
      // Legacy - treat as confirm all
      addBotMessage("Great! Your education details are confirmed. 🎓", 0);
      setTimeout(() => moveToNextStep(), 1500);
      return;
    } else if (response === 'edit_education') {
      // Legacy - clear all
      setFormData(prev => ({ ...prev, education: [] }));
      addBotMessage("Let's update your education. What's your degree?", 0);
      setTimeout(() => {
        showQuickReplies([
          { label: "High School", value: "High School" },
          { label: "Bachelor's", value: "Bachelor" },
          { label: "Master's", value: "Master" },
          { label: "PhD", value: "PhD" },
          { label: "Other", value: "Other" }
        ]);
      }, 1000);
      return;
    } else if (response === 'add_more_education') {
      addBotMessage("What additional degree do you have?", 0);
      setTimeout(() => {
        showQuickReplies([
          { label: "Bachelor's", value: "Bachelor" },
          { label: "Master's", value: "Master" },
          { label: "PhD", value: "PhD" },
          { label: "Certificate", value: "Certificate" }
        ]);
      }, 1000);
      return;
    }
    
    // Build education entry
    if (!formData.education.length || !formData.education[formData.education.length - 1]?.degree) {
      // Starting new education entry
      const newEducation = { degree: response, institution: '', year: '' };
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, newEducation]
      }));
      addBotMessage("Which institution did you attend?", 0);
    } else if (!formData.education[formData.education.length - 1].institution) {
      // Update institution
      setFormData(prev => {
        const updated = [...prev.education];
        updated[updated.length - 1].institution = response;
        return { ...prev, education: updated };
      });
      addBotMessage("What year did you graduate?", 0);
    } else {
      // Update year and save
      setFormData(prev => {
        const updated = [...prev.education];
        updated[updated.length - 1].year = response;
        return { ...prev, education: updated };
      });
      saveStepData(true);
      
      addBotMessage("Perfect! Your education is recorded. 📚", 0);
      setTimeout(() => moveToNextStep(), 1500);
    }
  };

  const handleCurrentWork = (response: string) => {
    if (response === 'update_team') {
      // Reset current work data to update
      setFormData(prev => ({ ...prev, teamSize: '', roleInTeam: '' }));
      addBotMessage("Let's update your team information. What size team do you work with?", 0, 500);
      setTimeout(() => {
        showQuickReplies([
          { label: "Working alone", value: "Working alone" },
          { label: "2-5 people", value: "2-5 people" },
          { label: "6-10 people", value: "6-10 people" },
          { label: "10+ people", value: "10+ people" }
        ]);
      }, 1500);
      return;
    } else if (response === 'continue') {
      moveToNextStep();
      return;
    }
    
    if (!formData.teamSize) {
      setFormData(prev => ({ ...prev, teamSize: response }));
      addBotMessage("And what's your role in the team?", 0, 500);
      setTimeout(() => {
        showQuickReplies([
          { label: "Individual Contributor", value: "Individual Contributor" },
          { label: "Team Lead", value: "Team Lead" },
          { label: "Manager", value: "Manager" }
        ]);
      }, 1000);
    } else if (!formData.roleInTeam) {
      setFormData(prev => ({ ...prev, roleInTeam: response }));
      // Ensure state is saved before moving
      saveStepData(true); // Use await to ensure save completes
      setTimeout(() => {
        moveToNextStep();
      }, 1000); // Increased timeout
    }
  };

  const handleChallenges = (response: string) => {
    if (response === 'update_challenges') {
      // Reset challenges and show selection again
      setFormData(prev => ({ ...prev, challenges: [] }));
      showChallenges();
      return;
    } else if (response === 'add_more_challenges') {
      // Show additional challenges without resetting
      showChallenges();
      return;
    } else if (response === 'continue' && formData.challenges.length > 0) {
      moveToNextStep();
      return;
    }
    
    if (personalizedSuggestions?.challenges) {
      // Handle selection from suggestions
      const isSelection = personalizedSuggestions.challenges.includes(response);
      if (isSelection) {
        setFormData(prev => ({
          ...prev,
          challenges: [...prev.challenges, response]
        }));
        addBotMessage("Good choice! Any other challenges?", 0);
      } else if (response === 'continue') {
        moveToNextStep();
      }
    }
  };

  const handleGrowthAreas = (response: string) => {
    if (response === 'update_growth') {
      // Reset growth areas and show selection again
      setFormData(prev => ({ ...prev, growthAreas: [] }));
      showGrowthAreas();
      return;
    } else if (response === 'add_more_growth') {
      // Show additional growth areas without resetting
      showGrowthAreas();
      return;
    } else if (response === 'complete') {
      completeProfile();
      return;
    }
    
    if (personalizedSuggestions?.growthAreas) {
      // Handle selection from suggestions
      const isSelection = personalizedSuggestions.growthAreas.includes(response);
      if (isSelection) {
        setFormData(prev => ({
          ...prev,
          growthAreas: [...prev.growthAreas, response]
        }));
        
        if (formData.growthAreas.length >= 2) {
          addBotMessage("Excellent choices! Let me prepare your personalized learning path...", 0);
          completeProfile();
        } else {
          addBotMessage("Great! Pick one or two more areas you'd like to focus on.", 0);
        }
      }
    }
  };

  // Helper function to update step visit history
  const updateStepHistory = (stepId: number, status: StepVisitHistory['status']) => {
    setStepHistory(prev => {
      const newHistory = new Map(prev);
      const existing = newHistory.get(stepId);
      
      if (existing) {
        existing.status = status;
        existing.lastVisitedAt = new Date();
        existing.visitCount += 1;
        if (status === 'completed' && !existing.completedAt) {
          existing.completedAt = new Date();
        }
      } else {
        newHistory.set(stepId, {
          stepId,
          firstVisitedAt: new Date(),
          lastVisitedAt: new Date(),
          visitCount: 1,
          status,
          milestoneAwarded: false
        });
      }
      
      return newHistory;
    });
  };
  
  // Helper function for idempotent milestone awarding
  const awardMilestone = (milestoneId: string, points: number, message: string) => {
    if (awardedMilestones.has(milestoneId)) {
      console.log(`Milestone ${milestoneId} already awarded, skipping`);
      return;
    }
    
    addBotMessage(message, points);
    setAwardedMilestones(prev => new Set(prev).add(milestoneId));
    
    // Update step history to mark milestone as awarded
    const history = stepHistory.get(currentStepRef.current);
    if (history) {
      history.milestoneAwarded = true;
      setStepHistory(new Map(stepHistory));
    }
  };
  
  // Navigation
  const moveToNextStep = async () => {
    const step = currentStepRef.current;
    if (step < STEPS.length) {
      console.log(`Moving from step ${step} to step ${step + 1}`);
      
      // CRITICAL: Save current state BEFORE moving to next step
      await saveStepData(true);
      
      // Mark current step as completed
      updateStepHistory(step, 'completed');
      
      // Award milestone points for completing certain steps (idempotent)
      if (step === 2 && !cvUploaded) {
        awardMilestone('work_experience_manual', 50, "Great progress! Work experience completed. 🎯");
      } else if (step === 3) {
        awardMilestone('education_complete', 50, "Education milestone reached! 📚");
      } else if (step === 4) {
        awardMilestone('skills_validated', 100, "Skills validated! You're halfway there! 🌟");
      }
      
      // Clear any system messages and skills components when moving steps
      setMessages(prev => prev.filter(m => {
        // Remove system messages and skills component
        if (m.id === 'skills-component') return false;
        if (m.type === 'system') return false;
        return true;
      }));
      // Clear dynamic message before transition to prevent wrong step message
      setShowDynamicMessage(false);
      
      // Use setTimeout to ensure state updates happen in order
      setTimeout(() => {
        setCurrentStep(step + 1);
        setMaxStepReached(prev => Math.max(prev, step + 1));
        
        // Small delay before initiating new step
        setTimeout(() => {
          const context: NavigationContext = {
            source: 'forward_progression',
            intent: 'first_visit'
          };
          
          // Update visit history for the new step
          updateStepHistory(step + 1, 'in_progress');
          
          // Only show dynamic message for non-skills steps on first visit
          if (step + 1 !== 4) {
            setShowDynamicMessage(true);
          }
          initiateStep(step + 1, context);
        }, 100);
      }, 50);
    } else {
      completeProfile();
    }
  };

  const goToPreviousStep = async () => {
    const step = currentStepRef.current;
    if (step > 1) {
      // Save current state before going back
      await saveStepData(true);
      
      // Use navigateToStep with 'back' source for proper context
      navigateToStep(step - 1, 'back');
    }
  };

  // Helper to determine navigation intent
  const determineNavigationIntent = (targetStep: number, history?: StepVisitHistory): NavigationContext['intent'] => {
    if (!history || history.status === 'not_visited') return 'first_visit';
    if (history.status === 'in_progress') return 'continue_progress';
    if (history.status === 'completed') return 'review_completed';
    return 'edit_existing';
  };
  
  const navigateToStep = async (targetStep: number, source: 'sidebar' | 'progression' | 'back' = 'sidebar') => {
    const step = currentStepRef.current;
    
    // Only allow navigation to completed or current steps
    if (targetStep < 1 || targetStep > STEPS.length) return;
    if (targetStep > maxStepReached + 1) return; // Can't skip ahead beyond max reached + 1
    
    console.log(`Navigating from step ${step} to step ${targetStep}`);
    
    // CRITICAL: Save current state BEFORE navigating away
    await saveStepData(true);
    
    // Determine navigation context
    const context: NavigationContext = {
      source: source === 'back' ? 'backward_navigation' : 
              source === 'sidebar' ? 'sidebar_jump' : 'forward_progression',
      intent: determineNavigationIntent(targetStep, stepHistory.get(targetStep))
    };
    
    setNavigationContext(context);
    
    // Only clear messages if truly needed based on context
    if (context.intent === 'first_visit' || (targetStep === 4 && context.intent !== 'review_completed')) {
      setMessages(prev => prev.filter(m => {
        // Filter out skills component and system messages that contain React components
        if (m.id === 'skills-component') return false;
        if (m.type === 'system' && typeof m.content !== 'string') return false;
        return true;
      }));
    }
    
    // Clear dynamic message first
    setShowDynamicMessage(false);
    
    // Set navigation state
    setNavigatingTo(targetStep);
    
    // Only show dynamic message for non-skills steps and first visits
    if (targetStep !== 4 && context.intent === 'first_visit') {
      setShowDynamicMessage(true);
    }
    
    // Navigate after animation completes
    setTimeout(async () => {
      setCurrentStep(targetStep);
      setNavigatingTo(null);
      
      // Clear dynamic message again before initiating new step
      setShowDynamicMessage(false);
      
      // Load saved state for the target step
      await loadSavedStateForStep(targetStep);
      
      // Update visit history
      updateStepHistory(targetStep, context.intent === 'review_completed' ? 'reviewing' : 'in_progress');
      
      setTimeout(() => {
        initiateStep(targetStep, context);
      }, 100);
    }, 1500);
  };

  // New function to load saved state
  const loadSavedStateForStep = async (step: number) => {
    if (!employeeId) return;
    
    try {
      const savedState = await ProfileBuilderStateService.loadState(employeeId);
      if (savedState) {
        setBuilderState(savedState);
        
        // Restore form data for the step
        if (savedState.formData) {
          setFormData(savedState.formData);
        }
        
        // Restore CV sections state
        if (savedState.cvSectionsState) {
          setCvAcceptedSections(savedState.cvSectionsState.acceptedSections);
        }
        
        // Restore step history
        if (savedState.stepHistory) {
          const historyMap = new Map<number, StepVisitHistory>();
          savedState.stepHistory.forEach(history => {
            historyMap.set(history.stepId, {
              ...history,
              firstVisitedAt: new Date(history.firstVisitedAt),
              lastVisitedAt: new Date(history.lastVisitedAt),
              completedAt: history.completedAt ? new Date(history.completedAt) : undefined
            });
          });
          setStepHistory(historyMap);
        }
        
        // Restore awarded milestones
        if (savedState.awardedMilestones) {
          setAwardedMilestones(new Set(savedState.awardedMilestones));
        }
        
        // Restore step-specific states
        switch (step) {
          case 2: // Work Experience
            if (savedState.workExperienceState) {
              setCurrentWorkIndex(savedState.workExperienceState.currentIndex || 0);
              // Restore other work states as needed
            }
            break;
          case 3: // Education
            if (savedState.educationState) {
              setCurrentEducationIndex(savedState.educationState.currentIndex || 0);
              // Restore other education states
            }
            break;
          case 4: // Skills
            if (savedState.skillsReviewState) {
              // Skills state is managed by the ChatSkillsReview component
              // which loads its own state from the database
            }
            break;
          case 5: // Current Work
            // Form data for teamSize and roleInTeam already restored above
            break;
          case 6: // Challenges
            // Form data for challenges already restored above
            break;
          case 7: // Growth
            // Form data for growthAreas already restored above
            break;
        }
        
        console.log(`Restored state for step ${step}`);
      }
    } catch (error) {
      console.error('Failed to load state for step:', error);
    }
  };

  const initiateStep = async (step: number, context?: NavigationContext) => {
    const stepData = STEPS[step - 1];
    if (!stepData) return;
    
    // Use default context if not provided (for backward compatibility)
    const navContext = context || {
      source: 'forward_progression',
      intent: determineNavigationIntent(step, stepHistory.get(step))
    };
    
    console.log(`Initiating step ${step} (${stepData.name}) with context:`, navContext);
    console.log(`Current messages count: ${messages.length}`);

    // Clear components only for first visits or when needed
    if (step !== 4 && navContext.intent === 'first_visit') {
      setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
    }

    // Show dynamic message only for first visits (except CV upload and skills)
    if (step > 1 && step !== 4 && navContext.intent === 'first_visit') {
      setShowDynamicMessage(true);
    }

    switch (stepData.name) {
      case 'work_experience':
        // Clear skills components only on first visit
        if (navContext.intent === 'first_visit') {
          setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
        }
        
        // Handle based on navigation context
        if (navContext.intent === 'first_visit') {
          // First time visiting this step
          if (cvExtractedData && cvExtractedData.work_experience?.length > 0) {
            setTimeout(() => {
              handleCVSectionSpecific(cvExtractedData, 'work');
            }, 1000);
          } else {
            addBotMessage("Let's talk about your work experience. What's your current or most recent job title?", 0, 1000);
          }
        } else if (navContext.intent === 'continue_progress') {
          // Returning to continue where they left off
          if (formData.workExperience.length > 0 && currentWorkIndex < formData.workExperience.length) {
            addBotMessage("Let's continue where we left off with your work experience.", 0, 500);
            // Resume from current index
            setTimeout(() => {
              const exp = formData.workExperience[currentWorkIndex];
              addBotMessage(
                `📋 ${exp.title} at ${exp.company}\n${exp.duration ? `⏱️ ${exp.duration}` : ''}\n\nIs this information correct?`,
                0,
                1000
              );
              showQuickReplies([
                { label: "Yes, continue", value: "confirm_single_experience" },
                { label: "Edit this entry", value: "edit_experience" }
              ]);
            }, 1000);
          }
        } else if (navContext.intent === 'review_completed') {
          // They completed this step and are reviewing
          addBotMessage(
            `Your work experience is complete! You have ${formData.workExperience.length} position${formData.workExperience.length > 1 ? 's' : ''} recorded.`,
            0,
            500
          );
          setTimeout(() => {
            showQuickReplies([
              { label: "Quick Review", value: "confirm_single_experience" },
              { label: "Add Another Position", value: "add_more" },
              { label: "All Good", value: "skip_work_verification", variant: 'primary' }
            ]);
          }, 1000);
        }
        break;

      case 'education':
        // CRITICAL: Remove any lingering skills components
        setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
        
        // Handle based on navigation context
        if (navContext.intent === 'review_completed') {
          // User is reviewing already completed education
          setCurrentEducationIndex(0);
          addBotMessage(
            `Welcome back to your education history! You have ${formData.education.length} education record${formData.education.length > 1 ? 's' : ''}. Would you like to review or update them?`,
            0,
            500
          );
          setTimeout(() => {
            const edu = formData.education[0];
            addBotMessage(
              `🎓 ${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}\n🏫 ${edu.institution}\n${edu.year || edu.graduationYear ? `📅 ${edu.year || edu.graduationYear}` : ''}\n\nWhat would you like to do?`,
              0,
              1000
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Review & Edit", value: "confirm_single_education" },
                { label: "Add Another Degree", value: "add_more_education" },
                { label: "Continue", value: "skip_education_verification", variant: 'primary' }
              ]);
            }, 1500);
          }, 1000);
        } else if (navContext.intent === 'continue_progress') {
          // Returning to continue where they left off
          if (currentEducationIndex > 0 && currentEducationIndex < formData.education.length) {
            addBotMessage("Let's continue with your education records.", 0, 500);
            setTimeout(() => {
              const edu = formData.education[currentEducationIndex];
              addBotMessage(
                `🎓 ${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}\n🏫 ${edu.institution}\n${edu.year || edu.graduationYear ? `📅 ${edu.year || edu.graduationYear}` : ''}\n\nIs this information correct?`,
                0,
                1000
              );
              setTimeout(() => {
                showQuickReplies([
                  { label: "Yes, continue", value: "confirm_single_education", variant: 'primary' },
                  { label: "Edit this entry", value: "edit_education" },
                  { label: "Skip to Skills", value: "skip_education_verification" }
                ]);
              }, 1500);
            }, 1000);
          } else {
            // Default continue behavior
            addBotMessage("Let's continue setting up your education. Where did we leave off?", 0, 500);
            setTimeout(() => {
              showQuickReplies([
                { label: "Add Education", value: "add_education" },
                { label: "Review Existing", value: "review_education" },
                { label: "Continue to Skills", value: "skip_education_verification", variant: 'primary' }
              ]);
            }, 1000);
          }
        } else if (navContext.intent === 'first_visit') {
          // First time visiting this step
          if (cvExtractedData && cvExtractedData.education?.length > 0) {
            setTimeout(() => {
              handleCVSectionSpecific(cvExtractedData, 'education');
            }, 1000);
          } else {
            addBotMessage("Now let's talk about your education. What's your highest degree?", 0, 1000);
            setTimeout(() => {
              showQuickReplies([
                { label: "High School", value: "High School" },
                { label: "Bachelor's", value: "Bachelor" },
                { label: "Master's", value: "Master" },
                { label: "PhD", value: "PhD" },
                { label: "Other", value: "Other" }
              ]);
            }, 1500);
          }
        } else {
          // Edit existing - show current data for editing
          if (formData.education.length > 0) {
            setCurrentEducationIndex(0);
            addBotMessage(
              `Let's update your education records. You have ${formData.education.length} record${formData.education.length > 1 ? 's' : ''}:`,
              0,
              500
            );
            setTimeout(() => {
              const edu = formData.education[0];
              addBotMessage(
                `🎓 ${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}\n🏫 ${edu.institution}\n${edu.year || edu.graduationYear ? `📅 ${edu.year || edu.graduationYear}` : ''}\n\nWhat would you like to do?`,
                0,
                1000
              );
              setTimeout(() => {
                showQuickReplies([
                  { label: "Edit This Entry", value: "edit_education" },
                  { label: "Add Another", value: "add_more_education" },
                  { label: "Remove This Entry", value: "remove_education" },
                  { label: "Continue", value: "skip_education_verification", variant: 'primary' }
                ]);
              }, 1500);
            }, 1000);
          } else {
            // No existing data - start fresh
            addBotMessage("Let's add your education background. What's your highest degree?", 0, 1000);
            setTimeout(() => {
              showQuickReplies([
                { label: "High School", value: "High School" },
                { label: "Bachelor's", value: "Bachelor" },
                { label: "Master's", value: "Master" },
                { label: "PhD", value: "PhD" },
                { label: "Other", value: "Other" }
              ]);
            }, 1500);
          }
        }
        break;

      case 'skills':
        setShowDynamicMessage(false); // Prevent ProfileStepMessage from showing
        
        // Handle based on navigation context
        if (navContext.intent === 'review_completed') {
          // They already completed skills validation
          addBotMessage(
            "Your skills have been validated! ✅",
            0,
            500
          );
          setTimeout(() => {
            showQuickReplies([
              { label: "Quick Review", value: "review_skills" },
              { label: "Continue", value: "skip_skills", variant: 'primary' }
            ]);
          }, 1000);
        } else {
          // First visit or continuing - check database
          const { data: employee } = await supabase
            .from('employees')
            .select('skills_validation_completed')
            .eq('id', employeeId)
            .single();
          
          if (employee?.skills_validation_completed && navContext.intent !== 'edit_existing') {
            // Mark as completed in history
            updateStepHistory(4, 'completed');
            
            // Skills already validated, jump to review mode
            addBotMessage(
              "I see you've already validated your skills! Would you like to review them or continue?",
              0,
              500
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Review Skills", value: "review_skills" },
                { label: "Continue", value: "skip_skills", variant: 'primary' }
              ]);
            }, 1000);
          } else {
            // Clear any existing skills components
            setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
            
            // Show skills review component
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: 'skills-component',
                type: 'system',
                content: (
                  <ChatSkillsReview
                    employeeId={employeeId}
                    onComplete={() => {
                      updateStepHistory(4, 'completed');
                      moveToNextStep();
                    }}
                  />
                ),
                timestamp: new Date()
              }]);
            }, 1000);
          }
        }
        break;

      case 'current_work':
        setShowDynamicMessage(false);
        
        // Clear skills components only on first visit
        if (navContext.intent === 'first_visit') {
          setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
        }
        
        // Handle based on navigation context
        if (navContext.intent === 'first_visit') {
          // First time on this step
          addBotMessage("Tell me about your current work. What size team do you work with?", 0, 1000);
          setTimeout(() => {
            showQuickReplies([
              { label: "Working alone", value: "Working alone" },
              { label: "2-5 people", value: "2-5 people" },
              { label: "6-10 people", value: "6-10 people" },
              { label: "10+ people", value: "10+ people" }
            ]);
          }, 2000);
        } else if (navContext.intent === 'continue_progress') {
          // Continue from where they left off
          if (formData.teamSize && !formData.roleInTeam) {
            // They answered team size but not role
            addBotMessage("Let's continue - what's your role in the team?", 0, 500);
            setTimeout(() => {
              showQuickReplies([
                { label: "Individual Contributor", value: "Individual Contributor" },
                { label: "Team Lead", value: "Team Lead" },
                { label: "Manager", value: "Manager" }
              ]);
            }, 1000);
          } else if (!formData.teamSize) {
            // They haven't started yet
            addBotMessage("Let's continue with your current work. What size team do you work with?", 0, 1000);
            setTimeout(() => {
              showQuickReplies([
                { label: "Working alone", value: "Working alone" },
                { label: "2-5 people", value: "2-5 people" },
                { label: "6-10 people", value: "6-10 people" },
                { label: "10+ people", value: "10+ people" }
              ]);
            }, 2000);
          }
        } else if (navContext.intent === 'review_completed') {
          // They completed this step and are reviewing
          addBotMessage(
            `Your current work info: Team of ${formData.teamSize} as a ${formData.roleInTeam} ✅`,
            0,
            500
          );
          setTimeout(() => {
            showQuickReplies([
              { label: "Update Info", value: "update_team" },
              { label: "Continue", value: "continue", variant: 'primary' }
            ]);
          }, 1000);
        }
        break;

      case 'challenges':
        setShowDynamicMessage(false);
        // CRITICAL: Remove any lingering skills components
        setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
        
        // Handle based on navigation context
        if (navContext.intent === 'review_completed') {
          // User is reviewing already completed challenges
          if (formData.challenges && formData.challenges.length > 0) {
            addBotMessage(
              `You've already identified ${formData.challenges.length} challenge${formData.challenges.length > 1 ? 's' : ''}:\n\n${formData.challenges.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nWould you like to review or update these?`,
              0,
              500
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Update Challenges", value: "update_challenges" },
                { label: "Keep These", value: "continue", variant: 'primary' },
                { label: "Add More", value: "add_more_challenges" }
              ]);
            }, 1000);
          } else {
            // Shouldn't happen, but handle gracefully
            addBotMessage("Let's identify the challenges you're facing in your role.", 0, 500);
            if (!personalizedSuggestions) {
              generatePersonalizedSuggestions();
            } else {
              showChallenges();
            }
          }
        } else if (navContext.intent === 'continue_progress') {
          // They were in the middle of selecting challenges
          addBotMessage("Let's continue identifying your professional challenges.", 0, 500);
          if (!personalizedSuggestions) {
            addBotMessage("Let me prepare some suggestions based on your profile...", 0, 1000);
            generatePersonalizedSuggestions();
          } else {
            showChallenges();
          }
        } else if (navContext.intent === 'first_visit') {
          // First time on this step
          addBotMessage("Let me think about some challenges professionals in your role might face...", 0, 1000);
          generatePersonalizedSuggestions();
        } else {
          // Edit existing - allow them to change their selections
          if (formData.challenges && formData.challenges.length > 0) {
            addBotMessage(
              `Let's update your professional challenges. Currently selected:\n\n${formData.challenges.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nWhat would you like to do?`,
              0,
              500
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Replace All", value: "update_challenges" },
                { label: "Add More", value: "add_more_challenges" },
                { label: "Keep These", value: "continue", variant: 'primary' }
              ]);
            }, 1000);
          } else {
            // No existing challenges - start selection
            addBotMessage("Let's identify the challenges you're currently facing.", 0, 500);
            if (!personalizedSuggestions) {
              generatePersonalizedSuggestions();
            } else {
              showChallenges();
            }
          }
        }
        break;

      case 'growth':
        setShowDynamicMessage(false);
        // CRITICAL: Remove any lingering skills components
        setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
        
        // Handle based on navigation context
        if (navContext.intent === 'review_completed') {
          // User is reviewing already completed growth areas
          if (formData.growthAreas && formData.growthAreas.length > 0) {
            addBotMessage(
              `You've identified ${formData.growthAreas.length} growth area${formData.growthAreas.length > 1 ? 's' : ''}:\n\n${formData.growthAreas.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\nWould you like to review these before completing your profile?`,
              0,
              500
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Update Areas", value: "update_growth" },
                { label: "Add More", value: "add_more_growth" },
                { label: "Complete Profile", value: "complete", variant: 'primary' }
              ]);
            }, 1000);
          } else {
            // Shouldn't happen, but handle gracefully
            addBotMessage("Let's identify areas where you'd like to grow professionally.", 0, 500);
            if (!personalizedSuggestions) {
              generatePersonalizedSuggestions();
            } else {
              showGrowthAreas();
            }
          }
        } else if (navContext.intent === 'continue_progress') {
          // They were in the middle of selecting growth areas
          addBotMessage("Let's continue identifying your growth opportunities.", 0, 500);
          if (!personalizedSuggestions) {
            addBotMessage("Preparing personalized suggestions...", 0, 1000);
            generatePersonalizedSuggestions();
          } else {
            showGrowthAreas();
          }
        } else if (navContext.intent === 'first_visit') {
          // First time on this step
          addBotMessage("Preparing growth opportunities based on your profile...", 0, 1000);
          generatePersonalizedSuggestions();
        } else {
          // Edit existing - allow them to change their selections
          if (formData.growthAreas && formData.growthAreas.length > 0) {
            addBotMessage(
              `Let's update your growth areas. Currently selected:\n\n${formData.growthAreas.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\nWhat would you like to do?`,
              0,
              500
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Replace All", value: "update_growth" },
                { label: "Add More", value: "add_more_growth" },
                { label: "Complete Profile", value: "complete", variant: 'primary' }
              ]);
            }, 1000);
          } else {
            // No existing growth areas - start selection
            addBotMessage("Let's identify areas where you'd like to grow.", 0, 500);
            if (!personalizedSuggestions) {
              generatePersonalizedSuggestions();
            } else {
              showGrowthAreas();
            }
          }
        }
        break;
    }
  };

  const generatePersonalizedSuggestions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-profile-suggestions', {
        body: { 
          employee_id: employeeId,
          step_data: {
            currentProjects: formData.currentProjects,
            teamSize: formData.teamSize,
            roleInTeam: formData.roleInTeam
          }
        }
      });
      
      if (data?.challenges && data?.growthAreas) {
        setPersonalizedSuggestions({
          challenges: data.challenges,
          growthAreas: data.growthAreas
        });
        
        // Show appropriate content based on current step
        const step = currentStepRef.current;
        if (step === 6) {
          setTimeout(() => showChallenges(), 1000);
        } else if (step === 7) {
          setTimeout(() => showGrowthAreas(), 1000);
        }
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback suggestions
      setPersonalizedSuggestions({
        challenges: [
          "Keeping up with rapidly changing technology",
          "Balancing technical work with team collaboration",
          "Managing time across multiple projects",
          "Communicating technical concepts to non-technical stakeholders"
        ],
        growthAreas: [
          "Leadership and mentoring skills",
          "Advanced technical certifications",
          "Project management methodologies",
          "Public speaking and presentation skills"
        ]
      });
    }
  };

  const showChallenges = () => {
    addBotMessage(
      "Based on your profile, here are some challenges you might be facing. Select any that resonate with you:",
      0,
      1000
    );
    
    setTimeout(() => {
      const challenges = personalizedSuggestions.challenges.slice(0, 4);
      showQuickReplies([
        ...challenges.map(c => ({ label: c, value: c })),
        { label: "Continue →", value: "continue", variant: 'primary' }
      ]);
    }, 1500);
  };

  const showGrowthAreas = () => {
    addBotMessage(
      "Finally, which areas would you like to grow in? Pick 2-3 that excite you most:",
      0,
      1000
    );
    
    setTimeout(() => {
      const areas = personalizedSuggestions.growthAreas.slice(0, 5);
      showQuickReplies(areas.map(a => ({ label: a, value: a, variant: 'success' as const })));
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

  // Complete profile
  const completeProfile = async () => {
    setIsCompleted(true);
    addAchievement(ACHIEVEMENTS.COMPLETIONIST);
    
    // Generate course outline
    const { data } = await supabase.functions.invoke('generate-course-outline', {
      body: { employee_id: employeeId }
    });
    
    if (data?.success) {
      setCourseOutline(data.courseOutline);
    }
    
    // Mark profile as complete
    await EmployeeProfileService.completeProfile(employeeId);
    
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const explainRewards = () => {
    addBotMessage(
      "Great question! As you complete your profile, you'll unlock:\n\n🎯 A personalized learning path based on your goals\n📊 Skills gap analysis\n🏆 Achievement badges\n📚 Course recommendations\n\nReady to start?",
      0,
      1500
    );
    
    setTimeout(() => {
      showQuickReplies([
        { label: "Let's go! 🚀", value: "start", points: 50, variant: 'primary' },
        { label: "Tell me more", value: "more_info" }
      ]);
    }, 2000);
  };

  const explainProcess = () => {
    addBotMessage(
      "I'll guide you through 7 quick steps:\n\n1️⃣ CV Upload (optional)\n2️⃣ Work Experience\n3️⃣ Education\n4️⃣ Skills Review\n5️⃣ Current Projects\n6️⃣ Challenges\n7️⃣ Growth Goals\n\nYou'll see your progress at the top, and I'll celebrate with you along the way! 🎉",
      0,
      1500
    );
    
    setTimeout(() => {
      showQuickReplies([
        { label: "Perfect, let's start!", value: "start", points: 50, variant: 'primary' }
      ]);
    }, 2500);
  };

  const handleCVSummaryConfirm = async () => {
    handleCVSummaryConfirmWithData(cvExtractedData);
  };

  const handleCVSectionSpecific = async (extractedData: any, section: 'work' | 'education') => {
    // Show CV sections component with specific section focus
    const messageId = `cv-sections-${section}-` + Date.now();
    setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: (
        <CVExtractedSections
          extractedData={extractedData}
          onSectionAccept={handleSectionAccept}
          onSectionUpdate={handleSectionUpdate}
          onComplete={handleAllSectionsComplete}
          initialSection={section} // Pass the specific section to focus on
        />
      ),
      timestamp: new Date(),
      metadata: {
        componentType: 'CVExtractedSections',
        extractedData: extractedData,
        specificSection: section
      }
    }]);
    
    // Save the CV sections display to database
    if (userId && extractedData) {
      try {
        await ChatMessageService.saveMessage({
          employee_id: employeeId,
          user_id: userId,
          message_type: 'system',
          content: `CV_SECTIONS_DISPLAY_${section.toUpperCase()}`,
          metadata: {
            componentType: 'CVExtractedSections',
            extractedData: extractedData,
            specificSection: section
          },
          step: currentStepRef.current
        });
      } catch (error) {
        console.error('Failed to save CV sections message:', error);
      }
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


  // Helper functions for navigation
  const getStepStatus = (stepId: number) => {
    const step = currentStepRef.current;
    if (stepId < step) return 'completed';
    if (stepId === step) return 'current';
    if (stepId <= maxStepReached + 1) return 'upcoming'; // Allow access to previously reached steps + 1
    return 'locked';
  };

  const getStepsForMenu = () => {
    return STEPS.map((step, index) => {
      const history = stepHistory.get(step.id);
      let status = getStepStatus(step.id);
      
      // Override status based on visit history
      if (history) {
        if (history.status === 'completed') {
          status = 'completed';
        } else if (history.status === 'in_progress' && step.id !== currentStep) {
          // Show as upcoming if it was started but not current
          status = 'upcoming';
        }
      }
      
      return {
        id: step.id,
        name: step.name,
        title: step.title,
        status: status,
        points: history?.milestoneAwarded ? 10 : 0, // Show points if milestone was awarded
        visitCount: history?.visitCount || 0
      };
    });
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    { id: 'quick_start', ...ACHIEVEMENTS.QUICK_START, unlocked: points >= 50 },
    { id: 'cv_uploaded', ...ACHIEVEMENTS.CV_UPLOADED, unlocked: cvUploaded },
    { id: 'speed_demon', ...ACHIEVEMENTS.SPEED_DEMON, unlocked: streak > 2 },
    { id: 'completionist', ...ACHIEVEMENTS.COMPLETIONIST, unlocked: currentStep === STEPS.length }
  ];

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear skills component on component unmount
      setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
    };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Start Fresh button */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
          <h2 className="text-sm font-medium text-gray-700">Profile Builder Chat</h2>
          {messages.length >= 2 && !isCompleted && (
            <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
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
          {showDynamicMessage && currentStep > 0 && currentStep !== 4 && (
            <ProfileStepMessage 
              step={currentStep}
              navigatingTo={navigatingTo}
              onNavigationComplete={() => {
                setNavigatingTo(null);
              }}
              forceUpdate={!navigatingTo}
            />
          )}
        
        {isTyping && <TypingIndicator />}
        
        {/* Show file drop zone when waiting for CV upload */}
        {waitingForCVUpload && !isLoading && (
          <>
            <FileDropZone 
              onFileSelect={handleCVUpload}
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
                  setWaitingForCVUpload(false);
                  addBotMessage("No problem! Let's build your profile together step by step. 💪", 0);
                  setTimeout(() => {
                    addBotMessage("First, let's talk about your work experience. What's your current or most recent job title?", 0, 500);
                    setCurrentStep(2); // Move to work experience
                    setMaxStepReached(prev => Math.max(prev, 2));
                  }, 1000);
                }}
              >
                Continue without CV
              </Button>
            </div>
          </>
        )}
        
        {/* CV sections are now displayed as system messages */}
        
        <div ref={messagesEndRef} />
      </div>

        {/* Input Area */}
        <ChatInput
          onSend={handleTextInput}
          onFileUpload={(currentStep === 1 || waitingForCVUpload) ? handleFileUpload : undefined}
          disabled={isLoading || isTyping}
          isLoading={isLoading}
          placeholder={
            waitingForCVUpload ? "Upload your CV using the area above..." : 
            currentStep === 1 ? "Type or upload your CV..." : 
            "Type your response..."
          }
        />
      </div>

      {/* Right Sidebar */}
      <ProfileProgressSidebar
        currentStep={currentStep}
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