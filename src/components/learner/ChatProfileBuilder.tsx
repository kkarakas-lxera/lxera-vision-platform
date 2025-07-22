import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import ChatMessage from './chat/ChatMessage';
import QuickReplyButtons from './chat/QuickReplyButtons';
import ChatInput from './chat/ChatInput';
import GameProgress from './chat/GameProgress';
import TypingIndicator from './chat/TypingIndicator';
import SkillsValidationCards from './SkillsValidationCards';
import CourseOutlineReward from './CourseOutlineReward';
import { Trophy, Zap, Upload, Clock } from 'lucide-react';

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
  QUICK_START: { name: "Quick Start", points: 100, icon: <Zap className="h-6 w-6 text-yellow-600" /> },
  CV_UPLOADED: { name: "Document Master", points: 200, icon: <Upload className="h-6 w-6 text-blue-600" /> },
  SPEED_DEMON: { name: "Speed Demon", points: 150, icon: <Clock className="h-6 w-6 text-purple-600" /> },
  COMPLETIONIST: { name: "Profile Hero", points: 500, icon: <Trophy className="h-6 w-6 text-gold-600" /> }
};

export default function ChatProfileBuilder({ employeeId, onComplete }: ChatProfileBuilderProps) {
  // State Management
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 for initial greeting
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const conversationStartTime = useRef<Date>(new Date());
  
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
  }, [employeeId]);

  // Start chat after employee data loads
  useEffect(() => {
    if (employeeData && messages.length === 0) {
      initializeChat();
    }
  }, [employeeData]);

  const initializeChat = () => {
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
      }, 1200);
    }, 2000);
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
      }

      // Load existing profile sections
      const sections = await EmployeeProfileService.getProfileSections(employeeId);
      // Process sections and update formData as needed
      
    } catch (error) {
      console.error('Error loading employee data:', error);
    }
  };

  // Message Management
  const addBotMessage = (content: string | React.ReactNode, points = 0, delay = 1000) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const message: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
        ...(points > 0 && { points }) // Only include points if greater than 0
      };
      
      setMessages(prev => [...prev, message]);
      if (points > 0) {
        setPoints(prev => prev + points);
      }
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    
    // Update streak for quick responses
    if (lastResponseTime && (Date.now() - lastResponseTime.getTime()) < 5000) {
      setStreak(prev => prev + 1);
      if (streak > 2) {
        addAchievement(ACHIEVEMENTS.SPEED_DEMON);
      }
    }
    setLastResponseTime(new Date());
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
    setPoints(prev => prev + achievement.points);
    toast.success(`Achievement Unlocked: ${achievement.name}!`);
  };

  const showQuickReplies = (options: any[]) => {
    // Quick replies are shown outside messages, managed by state
    setMessages(prev => [...prev, {
      id: 'quick-replies-' + Date.now(),
      type: 'system',
      content: <QuickReplyButtons options={options} onSelect={handleQuickReply} />,
      timestamp: new Date()
    }]);
  };

  // Handle user interactions
  const handleQuickReply = (value: string, label: string) => {
    addUserMessage(label);
    processUserResponse(value);
  };

  const handleTextInput = (message: string) => {
    addUserMessage(message);
    processUserResponse(message);
  };

  const handleFileUpload = async (file: File) => {
    if (currentStep === 1) {
      // CV Upload
      addUserMessage("📄 Uploading CV...");
      await handleCVUpload(file);
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (currentStep > 0 && currentStep <= STEPS.length) {
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
    // Initial conversation
    if (currentStep === 0) {
      if (response === 'start') {
        addAchievement(ACHIEVEMENTS.QUICK_START);
        startStep1();
      } else if (response === 'rewards') {
        explainRewards();
      } else if (response === 'more_info') {
        explainProcess();
      }
      return;
    }

    // Handle actual profile steps
    const stepName = STEPS[currentStep - 1]?.name;
    
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
    addBotMessage(
      "Great! Let's start with the easiest way. Do you have a CV or resume handy? I can extract your information from it to save you time! 📄",
      100,
      1000
    );
    
    setTimeout(() => {
      showQuickReplies([
        { label: "📤 Upload CV", value: "upload_cv", points: 200, variant: 'primary' },
        { label: "✍️ Enter manually", value: "manual_entry", points: 100 },
        { label: "Skip for now", value: "skip_cv" }
      ]);
    }, 2000);
  };

  const handleCVUploadResponse = (response: string) => {
    if (response === 'upload_cv') {
      addBotMessage("Perfect! You can drag and drop your CV or click the paperclip icon below to upload it.", 0, 500);
    } else if (response === 'manual_entry' || response === 'skip_cv') {
      moveToNextStep();
    }
  };

  const handleCVUpload = async (file: File) => {
    setIsLoading(true);
    addBotMessage("Analyzing your CV... This usually takes 30-60 seconds. 🔍", 0, 500);
    
    try {
      // Reuse existing CV upload logic
      const uploadPath = `${employeeId}/${Date.now()}-${file.name}`;
      const { data: cvData, error: uploadError } = await supabase.storage
        .from('employee-cvs')
        .upload(uploadPath, file);

      if (uploadError) throw uploadError;

      const { data: analysisResult, error: analyzeError } = await supabase.functions.invoke('analyze-cv-enhanced', {
        body: { 
          employee_id: employeeId,
          file_path: cvData.path,
          source: 'chat_profile_builder'
        }
      });

      if (analyzeError) throw analyzeError;

      addAchievement(ACHIEVEMENTS.CV_UPLOADED);
      setCvUploaded(true);
      addBotMessage(
        "Excellent! I've extracted your information. Let me show you what I found...",
        150,
        1500
      );
      
      // Import CV data to profile
      await supabase.functions.invoke('import-cv-to-profile', {
        body: { employeeId }
      });
      
      // Reload data to get imported information
      await loadEmployeeData();
      
      // Move to next step
      setTimeout(() => moveToNextStep(), 2000);
      
    } catch (error) {
      console.error('CV upload error:', error);
      addBotMessage(
        "Hmm, I had trouble reading your CV. No worries, we can enter the information together!",
        0,
        1000
      );
      setTimeout(() => moveToNextStep(), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkExperience = (response: string) => {
    // Store current work experience being built
    if (!currentWorkExperience.title) {
      setCurrentWorkExperience({ title: response });
      addBotMessage("And which company is/was this with?", 50);
    } else if (!currentWorkExperience.company) {
      setCurrentWorkExperience(prev => ({ ...prev, company: response }));
      addBotMessage("How long have you been in this role?", 50);
      showQuickReplies([
        { label: "Less than 1 year", value: "< 1 year" },
        { label: "1-3 years", value: "1-3 years" },
        { label: "3-5 years", value: "3-5 years" },
        { label: "5+ years", value: "5+ years" }
      ]);
    } else if (!currentWorkExperience.duration) {
      setCurrentWorkExperience(prev => ({ ...prev, duration: response }));
      setFormData(prev => ({
        ...prev,
        workExperience: [...prev.workExperience, currentWorkExperience]
      }));
      saveStepData(true);
      
      addBotMessage("Great! Would you like to add another work experience?", 100);
      showQuickReplies([
        { label: "Add another", value: "add_more" },
        { label: "Continue", value: "continue", variant: 'primary' }
      ]);
    } else if (response === 'add_more') {
      setCurrentWorkExperience({});
      addBotMessage("What's the role title?", 0);
    } else if (response === 'continue') {
      moveToNextStep();
    }
  };

  const handleEducation = (response: string) => {
    // Handle education responses
    if (!formData.education.length) {
      addBotMessage("What's your highest degree?", 0);
      showQuickReplies([
        { label: "High School", value: "High School" },
        { label: "Bachelor's", value: "Bachelor" },
        { label: "Master's", value: "Master" },
        { label: "PhD", value: "PhD" },
        { label: "Other", value: "Other" }
      ]);
    } else {
      setFormData(prev => ({
        ...prev,
        highestDegree: response
      }));
      moveToNextStep();
    }
  };

  const handleCurrentWork = (response: string) => {
    if (!formData.teamSize) {
      setFormData(prev => ({ ...prev, teamSize: response }));
      addBotMessage("And what's your role in the team?", 50);
      showQuickReplies([
        { label: "Individual Contributor", value: "Individual Contributor" },
        { label: "Team Lead", value: "Team Lead" },
        { label: "Manager", value: "Manager" }
      ]);
    } else {
      setFormData(prev => ({ ...prev, roleInTeam: response }));
      moveToNextStep();
    }
  };

  const handleChallenges = (response: string) => {
    if (personalizedSuggestions?.challenges) {
      // Handle selection from suggestions
      const isSelection = personalizedSuggestions.challenges.includes(response);
      if (isSelection) {
        setFormData(prev => ({
          ...prev,
          challenges: [...prev.challenges, response]
        }));
        addBotMessage("Good choice! Any other challenges?", 50);
      } else if (response === 'continue') {
        moveToNextStep();
      }
    }
  };

  const handleGrowthAreas = (response: string) => {
    if (personalizedSuggestions?.growthAreas) {
      // Handle selection from suggestions
      const isSelection = personalizedSuggestions.growthAreas.includes(response);
      if (isSelection) {
        setFormData(prev => ({
          ...prev,
          growthAreas: [...prev.growthAreas, response]
        }));
        
        if (formData.growthAreas.length >= 2) {
          addBotMessage("Excellent choices! Let me prepare your personalized learning path...", 200);
          completeProfile();
        } else {
          addBotMessage("Great! Pick one or two more areas you'd like to focus on.", 50);
        }
      }
    }
  };

  // Navigation
  const moveToNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      saveStepData(true); // Auto-save
      initiateStep(currentStep + 1);
    } else {
      completeProfile();
    }
  };

  const initiateStep = (step: number) => {
    const stepData = STEPS[step - 1];
    if (!stepData) return;

    switch (stepData.name) {
      case 'work_experience':
        if (formData.workExperience.length > 0 && cvUploaded) {
          addBotMessage(
            `I see you have experience as ${formData.workExperience[0].title} at ${formData.workExperience[0].company}. Anything else you'd like to add?`,
            0,
            1000
          );
          showQuickReplies([
            { label: "Add more experience", value: "add_more" },
            { label: "Looks good, continue", value: "continue", variant: 'primary' }
          ]);
        } else {
          addBotMessage("Let's talk about your work experience. What's your current or most recent job title?", 0, 1000);
        }
        break;

      case 'education':
        if (formData.education.length > 0 && cvUploaded) {
          addBotMessage(
            `I found your ${formData.education[0].degree} from ${formData.education[0].institution}. Is this your highest degree?`,
            0,
            1000
          );
          showQuickReplies([
            { label: "Yes, that's correct", value: "continue", variant: 'primary' },
            { label: "No, let me update", value: "update" }
          ]);
        } else {
          handleEducation('');
        }
        break;

      case 'skills':
        addBotMessage("Time for a quick skills review! ⚡", 0, 500);
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 'skills-component',
            type: 'system',
            content: (
              <SkillsValidationCards
                employeeId={employeeId}
                onComplete={() => {
                  addBotMessage("Awesome skills inventory! 🎯", 200);
                  moveToNextStep();
                }}
              />
            ),
            timestamp: new Date()
          }]);
        }, 1000);
        break;

      case 'current_work':
        addBotMessage("Tell me about your current work. What size team do you work with?", 0, 1000);
        showQuickReplies([
          { label: "Working alone", value: "Working alone" },
          { label: "2-5 people", value: "2-5 people" },
          { label: "6-10 people", value: "6-10 people" },
          { label: "10+ people", value: "10+ people" }
        ]);
        break;

      case 'challenges':
        if (!personalizedSuggestions) {
          addBotMessage("Let me think about some challenges professionals in your role might face...", 0, 1000);
          generatePersonalizedSuggestions();
        } else {
          showChallenges();
        }
        break;

      case 'growth':
        if (!personalizedSuggestions) {
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
        if (currentStep === 6) {
          setTimeout(() => showChallenges(), 1000);
        } else if (currentStep === 7) {
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
    if (currentStep === 0 || currentStep > STEPS.length) return;
    
    try {
      const stepName = STEPS[currentStep - 1].name;
      
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Game Progress Header */}
      <GameProgress
        currentStep={Math.max(0, currentStep)}
        totalSteps={STEPS.length}
        points={points}
        streak={streak}
      />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage key={message.id} {...message} />
          ))}
        </AnimatePresence>
        
        {isTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleTextInput}
        onFileUpload={currentStep === 1 ? handleFileUpload : undefined}
        disabled={isLoading || isTyping}
        isLoading={isLoading}
        placeholder={
          currentStep === 1 ? "Type or upload your CV..." : "Type your response..."
        }
      />
    </div>
  );
}