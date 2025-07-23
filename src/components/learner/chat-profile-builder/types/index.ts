import React from 'react';

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
  type: 'bot' | 'user' | 'achievement' | 'challenge' | 'system' | 'quick_replies';
  content: string | React.ReactNode;
  timestamp: Date;
  points?: number;
  achievement?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    iconName?: string;
    iconClass?: string;
  };
  metadata?: any;
}

interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description?: string;
  responsibilities?: any[];
}

interface Education {
  degree: string;
  fieldOfStudy?: string;
  institution: string;
  graduationYear?: string;
  year?: string;
}

interface FormData {
  currentPosition?: string;
  department?: string;
  timeInRole?: string;
  fullName?: string;
  email?: string;
  workExperience: WorkExperience[];
  education: Education[];
  currentProjects?: string[];
  teamSize?: string;
  roleInTeam?: string;
  skills?: any[];
  challenges: string[];
  growthAreas: string[];
  selectedChallenges?: any[];
  suggestedChallenges?: string[];
  selectedGrowthAreas?: any[];
  suggestedGrowthAreas?: string[];
}

interface NavigationState {
  currentStep: number;
  maxStepReached: number;
  navigatingTo: number | null;
  showDynamicMessage: boolean;
  context: NavigationContext | null;
  returnToStep: number | null;
  isUpdatingInfo: boolean;
}

interface UIState {
  isTyping: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  showRestartDialog: boolean;
  hasMoreMessages: boolean;
  loadingHistory: boolean;
  isGeneratingAI: boolean;
  aiGenerationStage: 'analyzing' | 'generating' | 'finalizing';
}

interface GamificationState {
  points: number;
  elapsedTime: number;
  startTime: Date | null;
  stepStartTime: Date | null;
  learningStreak: number;
  achievements: any[];
}

interface CVState {
  isProcessingCV: boolean;
  cvFile: File | null;
  cvUploaded: boolean;
  cvProcessingStage: string;
  showCVConfirmation: boolean;
  cvData: any;
  isAnalyzingCV: boolean;
  cvSummaryData: any;
  lastCVUploadPath: string;
  cvUploadStep: string;
  cvUploadError: string | null;
}

interface ProgressState {
  stepProgress: Record<number, number>;
  currentStepProgress: number;
  sectionProgress: Record<string, number>;
  currentEducationIndex?: number;
  currentWorkIndex?: number;
  currentWorkExperience?: any;
  sectionsConfirmed?: string[];
}

interface SmartContext {
  currentStep: number;
  currentFocus?: string;
  activeUI?: string;
  recentInteractions: Array<{
    type: string;
    data: any;
    timestamp: Date;
  }>;
  formData: FormData;
}

export type {
  StepVisitHistory,
  NavigationContext,
  ChatProfileBuilderProps,
  Message,
  WorkExperience,
  Education,
  FormData,
  NavigationState,
  UIState,
  GamificationState,
  CVState,
  ProgressState,
  SmartContext
};