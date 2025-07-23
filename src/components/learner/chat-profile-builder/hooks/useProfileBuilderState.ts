import { useState, useEffect, useRef } from 'react';
import { NavigationState, UIState, GamificationState, CVState, ProgressState, FormData, SmartContext } from '../types';
import { STEPS } from '../constants';

export const useProfileBuilderState = (employeeId: string) => {
  // Core State
  const [userId, setUserId] = useState<string>('');
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Navigation State
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentStep: 0,
    maxStepReached: 0,
    navigatingTo: null,
    showDynamicMessage: false,
    context: null,
    returnToStep: null,
    isUpdatingInfo: false
  });

  // UI State
  const [uiState, setUiState] = useState<UIState>({
    isTyping: false,
    isLoading: false,
    isInitializing: false,
    showRestartDialog: false,
    hasMoreMessages: false,
    loadingHistory: false,
    isGeneratingAI: false,
    aiGenerationStage: 'analyzing'
  });

  // Gamification State
  const [gamificationState, setGamificationState] = useState<GamificationState>({
    points: 0,
    elapsedTime: 0,
    startTime: null,
    stepStartTime: null,
    learningStreak: 0,
    achievements: []
  });

  // CV State
  const [cvState, setCvState] = useState<CVState>({
    isProcessingCV: false,
    cvFile: null,
    cvUploaded: false,
    cvProcessingStage: '',
    showCVConfirmation: false,
    cvData: null,
    isAnalyzingCV: false,
    cvSummaryData: null,
    lastCVUploadPath: '',
    cvUploadStep: '',
    cvUploadError: null
  });

  // Progress State
  const [progressState, setProgressState] = useState<ProgressState>({
    stepProgress: {},
    currentStepProgress: 0,
    sectionProgress: {}
  });

  // Form Data
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

  // Smart Context
  const [smartContext, setSmartContext] = useState<SmartContext>({
    currentStep: 0,
    recentInteractions: [],
    formData: formData
  });

  // Refs
  const currentStepRef = useRef(navigationState.currentStep);
  const maxStepReachedRef = useRef(navigationState.maxStepReached);

  // Update refs when state changes
  useEffect(() => {
    currentStepRef.current = navigationState.currentStep;
    maxStepReachedRef.current = navigationState.maxStepReached;
  }, [navigationState.currentStep, navigationState.maxStepReached]);

  // Update smart context when relevant state changes
  useEffect(() => {
    setSmartContext(prev => ({
      ...prev,
      currentStep: navigationState.currentStep,
      formData: formData
    }));
  }, [navigationState.currentStep, formData]);

  return {
    // State
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
    
    // Refs
    currentStepRef,
    maxStepReachedRef,
    
    // Computed values
    currentStep: navigationState.currentStep,
    maxStepReached: navigationState.maxStepReached,
    steps: STEPS
  };
};