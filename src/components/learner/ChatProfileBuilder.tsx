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
        const formattedMessages: Message[] = recentMessages.map(msg => {
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
      
      // Reset points in database
      await supabase
        .from('employees')
        .update({ 
          profile_builder_points: 0,
          profile_builder_streak: 0
        })
        .eq('id', employeeId);
      
      // Close dialog
      setShowRestartDialog(false);
      
      // Start fresh conversation
      setTimeout(() => {
        initializeChat();
      }, 500);
      
      toast.success('Starting fresh! Let\'s build your profile together.');
    } catch (error) {
      console.error('Error starting fresh:', error);
      toast.error('Failed to reset. Please try again.');
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
        // Skills handled by component
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
      saveStepData(true); // Save immediately
      setTimeout(() => {
        moveToNextStep();
      }, 500); // Small delay to ensure state is saved
    }
  };

  const handleChallenges = (response: string) => {
    if (response === 'update_challenges') {
      // Reset challenges and show selection again
      setFormData(prev => ({ ...prev, challenges: [] }));
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

  // Navigation
  const moveToNextStep = () => {
    const step = currentStepRef.current;
    if (step < STEPS.length) {
      console.log(`Moving from step ${step} to step ${step + 1}`);
      
      // Award milestone points for completing certain steps
      if (step === 2 && !cvUploaded) { // Completed work experience manually
        addBotMessage("Great progress! Work experience completed. 🎯", 50);
      } else if (step === 3) { // Completed education
        addBotMessage("Education milestone reached! 📚", 50);
      } else if (step === 4) { // Completed skills
        addBotMessage("Skills validated! You're halfway there! 🌟", 100);
      }
      
      // Clear any system messages (quick replies) when moving steps
      setMessages(prev => prev.filter(m => m.type !== 'system'));
      // Clear dynamic message before transition to prevent wrong step message
      setShowDynamicMessage(false);
      
      // Use setTimeout to ensure state updates happen in order
      setTimeout(() => {
        setCurrentStep(step + 1);
        setMaxStepReached(prev => Math.max(prev, step + 1));
        saveStepData(true);
        
        // Small delay before initiating new step
        setTimeout(() => {
          // Only show dynamic message for non-skills steps
          if (step + 1 !== 4) {
            setShowDynamicMessage(true);
          }
          initiateStep(step + 1);
        }, 100);
      }, 50);
    } else {
      completeProfile();
    }
  };

  const goToPreviousStep = () => {
    const step = currentStepRef.current;
    if (step > 1) {
      // Clear system messages
      setMessages(prev => prev.filter(m => m.type !== 'system'));
      setCurrentStep(prev => prev - 1);
      saveStepData(true);
      
      addBotMessage(`Let's go back to ${STEPS[step - 2].title}. 👈`, 0, 500);
      setTimeout(() => {
        initiateStep(step - 1);
      }, 1000);
    }
  };

  const navigateToStep = (targetStep: number) => {
    const step = currentStepRef.current;
    
    // Only allow navigation to completed or current steps
    if (targetStep < 1 || targetStep > STEPS.length) return;
    if (targetStep > maxStepReached + 1) return; // Can't skip ahead beyond max reached + 1
    
    console.log(`Navigating from step ${step} to step ${targetStep}`);
    
    // Close menu
    setShowNavigationMenu(false);
    
    // Clear ALL system messages including skills review
    setMessages(prev => prev.filter(m => {
      // Remove system messages and any skills components
      return m.type !== 'system' && m.id !== 'skills-component';
    }));
    
    // Clear dynamic message first
    setShowDynamicMessage(false);
    
    // Set navigation state
    setNavigatingTo(targetStep);
    
    // Only show navigation message for non-skills steps
    if (targetStep !== 4) {
      setShowDynamicMessage(true);
    }
    
    // Navigate after animation completes
    setTimeout(() => {
      setCurrentStep(targetStep);
      setNavigatingTo(null);
      saveStepData(true);
      
      // Clear dynamic message again before initiating new step
      setShowDynamicMessage(false);
      
      setTimeout(() => {
        initiateStep(targetStep);
      }, 100);
    }, 1500);
  };

  const initiateStep = (step: number) => {
    const stepData = STEPS[step - 1];
    if (!stepData) return;
    
    console.log(`Initiating step ${step} (${stepData.name})`);
    console.log(`Current showDynamicMessage: ${showDynamicMessage}`);
    console.log(`Current messages count: ${messages.length}`);

    // Clear any lingering skills review components when not on skills step
    if (step !== 4) {
      setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
    }

    // Show dynamic message for main step transitions (except CV upload and skills)
    if (step > 1 && step !== 4) {
      setShowDynamicMessage(true);
    }

    switch (stepData.name) {
      case 'work_experience':
        // If we have CV extracted data, show only work experience section
        if (cvExtractedData && cvExtractedData.work_experience?.length > 0) {
          setTimeout(() => {
            handleCVSectionSpecific(cvExtractedData, 'work');
          }, 1000);
        } else if (formData.workExperience.length > 0) {
          // We have existing work experience data - show it for review/edit
          setCurrentWorkIndex(0);
          addBotMessage(
            `Welcome back! I see you've already entered ${formData.workExperience.length} work experience${formData.workExperience.length > 1 ? 's' : ''}. Let's review them:`,
            0,
            500
          );
          setTimeout(() => {
            const exp = formData.workExperience[0];
            addBotMessage(
              `📋 ${exp.title} at ${exp.company}\n${exp.duration ? `⏱️ ${exp.duration}` : ''}\n\nWould you like to review/edit these entries or continue to the next step?`,
              0,
              1000
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Review & Edit", value: "confirm_single_experience" },
                { label: "Continue to Education", value: "skip_work_verification", variant: 'primary' },
                { label: "Add Another Position", value: "add_more" }
              ]);
            }, 1500);
          }, 1000);
        } else {
          addBotMessage("Let's talk about your work experience. What's your current or most recent job title?", 0, 1000);
        }
        break;

      case 'education':
        // If we have CV extracted data, show only education section
        if (cvExtractedData && cvExtractedData.education?.length > 0) {
          setTimeout(() => {
            handleCVSectionSpecific(cvExtractedData, 'education');
          }, 1000);
        } else if (formData.education.length > 0) {
          // We have existing education data - show it for review/edit
          setCurrentEducationIndex(0);
          addBotMessage(
            `Welcome back! I see you've already entered ${formData.education.length} education record${formData.education.length > 1 ? 's' : ''}. Let's review:`,
            0,
            500
          );
          setTimeout(() => {
            const edu = formData.education[0];
            addBotMessage(
              `🎓 ${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}\n🏫 ${edu.institution}\n${edu.year || edu.graduationYear ? `📅 ${edu.year || edu.graduationYear}` : ''}\n\nWould you like to review/edit these entries or continue?`,
              0,
              1000
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Review & Edit", value: "confirm_single_education" },
                { label: "Continue to Skills", value: "skip_education_verification", variant: 'primary' },
                { label: "Add Another Degree", value: "add_more_education" }
              ]);
            }, 1500);
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
        break;

      case 'skills':
        setShowDynamicMessage(false); // Prevent ProfileStepMessage from showing
        // Clear any existing skills review components to prevent duplicates
        setMessages(prev => prev.filter(m => m.id !== 'skills-component'));
        
        setTimeout(() => {
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
        }, 1000);
        break;

      case 'current_work':
        setShowDynamicMessage(false);
        // Check if we have existing current work data
        if (formData.teamSize && formData.roleInTeam) {
          addBotMessage(
            `Welcome back! I see you work with a team of ${formData.teamSize} as a ${formData.roleInTeam}. Would you like to update this information or continue?`,
            0,
            1000
          );
          setTimeout(() => {
            showQuickReplies([
              { label: "Update Team Info", value: "update_team" },
              { label: "Continue to Challenges", value: "continue", variant: 'primary' }
            ]);
          }, 2000);
        } else {
          addBotMessage("Tell me about your current work. What size team do you work with?", 0, 1000);
          setTimeout(() => {
            showQuickReplies([
              { label: "Working alone", value: "Working alone" },
              { label: "2-5 people", value: "2-5 people" },
              { label: "6-10 people", value: "6-10 people" },
              { label: "10+ people", value: "10+ people" }
            ]);
          }, 2000);
        }
        break;

      case 'challenges':
        setShowDynamicMessage(false);
        // Check if we have existing challenges selected
        if (formData.challenges && formData.challenges.length > 0) {
          addBotMessage(
            `Welcome back! You previously selected ${formData.challenges.length} challenge${formData.challenges.length > 1 ? 's' : ''}:\n\n${formData.challenges.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nWould you like to update these or continue?`,
            0,
            1000
          );
          setTimeout(() => {
            showQuickReplies([
              { label: "Update Challenges", value: "update_challenges" },
              { label: "Continue to Growth Areas", value: "continue", variant: 'primary' }
            ]);
          }, 1500);
        } else if (!personalizedSuggestions) {
          addBotMessage("Let me think about some challenges professionals in your role might face...", 0, 1000);
          generatePersonalizedSuggestions();
        } else {
          showChallenges();
        }
        break;

      case 'growth':
        setShowDynamicMessage(false);
        // Check if we have existing growth areas selected
        if (formData.growthAreas && formData.growthAreas.length > 0) {
          addBotMessage(
            `Welcome back! You previously selected ${formData.growthAreas.length} growth area${formData.growthAreas.length > 1 ? 's' : ''}:\n\n${formData.growthAreas.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\nWould you like to update these or complete your profile?`,
            0,
            1000
          );
          setTimeout(() => {
            showQuickReplies([
              { label: "Update Growth Areas", value: "update_growth" },
              { label: "Complete Profile", value: "complete", variant: 'primary' }
            ]);
          }, 1500);
        } else if (!personalizedSuggestions) {
          addBotMessage("Preparing growth opportunities based on your profile...", 0, 1000);
          generatePersonalizedSuggestions();
        } else {
          showGrowthAreas();
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
      
      // Save comprehensive state
      const currentBuilderState: ProfileBuilderState = {
        step,
        maxStepReached,
        formData,
        lastActivity: new Date().toISOString(),
        // Add component-specific states as needed
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
    return STEPS.map((step, index) => ({
      id: step.id,
      name: step.name,
      title: step.title,
      status: getStepStatus(step.id),
      points: 0 // Points are awarded through achievements only
    }));
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
                    This will clear your current conversation and progress. You'll start from the beginning.
                    Your basic information will be preserved.
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