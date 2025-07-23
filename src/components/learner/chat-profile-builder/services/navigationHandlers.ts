import { supabase } from '@/integrations/supabase/client';
import { ProfileBuilderStateService } from '@/services/profileBuilderStateService';

// Types and interfaces
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

const STEPS = [
  { id: 1, name: 'cv_upload', title: 'CV Upload' },
  { id: 2, name: 'work_experience', title: 'Work Experience' },
  { id: 3, name: 'education', title: 'Education' },
  { id: 4, name: 'skills', title: 'Skills Review' },
  { id: 5, name: 'current_work', title: 'Current Projects' },
  { id: 6, name: 'challenges', title: 'Challenges' },
  { id: 7, name: 'growth', title: 'Growth Areas' }
];

// Navigation functions extracted from ChatProfileBuilder.tsx
export const createNavigationHandlers = ({
  currentStepRef,
  setCurrentStep,
  setMaxStepReached,
  setMessages,
  setShowDynamicMessage,
  setNavigatingTo,
  setNavigationContext,
  stepHistory,
  setStepHistory,
  maxStepReached,
  saveStepData,
  completeProfile,
  updateStepHistory,
  awardMilestone,
  cvUploaded,
  employeeId,
  formData,
  currentWorkIndex,
  addBotMessage,
  showQuickReplies,
  currentEducationIndex,
  setCurrentEducationIndex,
  cvExtractedData,
  handleCVSectionSpecific,
  personalizedSuggestions,
  generatePersonalizedSuggestions,
  showChallenges,
  showGrowthAreas,
  isUpdatingInfo,
  returnToStep,
  setIsGeneratingAI,
  setAiGenerationStage,
  AIGenerationProgress,
  ChatSkillsReview,
  moveToNextStep: moveToNextStepOriginal
}: any) => {

  // Helper function to update step visit history
  const updateStepHistoryHandler = (stepId: number, status: StepVisitHistory['status']) => {
    setStepHistory((prev: Map<number, StepVisitHistory>) => {
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
  const awardMilestoneHandler = (milestoneId: string, points: number, message: string, awardedMilestones: Set<string>, setAwardedMilestones: any) => {
    if (awardedMilestones.has(milestoneId)) {
      console.log(`Milestone ${milestoneId} already awarded, skipping`);
      return;
    }
    
    addBotMessage(message, points);
    setAwardedMilestones((prev: Set<string>) => new Set(prev).add(milestoneId));
    
    // Update step history to mark milestone as awarded
    const history = stepHistory.get(currentStepRef.current);
    if (history) {
      history.milestoneAwarded = true;
      setStepHistory(new Map(stepHistory));
    }
  };

  // Helper to determine navigation intent
  const determineNavigationIntent = (targetStep: number, history?: StepVisitHistory): NavigationContext['intent'] => {
    if (!history || history.status === 'not_visited') return 'first_visit';
    if (history.status === 'in_progress') return 'continue_progress';
    if (history.status === 'completed') return 'review_completed';
    return 'edit_existing';
  };

  // New function to load saved state
  const loadSavedStateForStep = async (step: number) => {
    if (!employeeId) return;
    
    try {
      const savedState = await ProfileBuilderStateService.loadState(employeeId);
      if (savedState) {
        // Restore saved state for the step
        // Implementation would depend on the specific state structure
        console.log('Loading saved state for step:', step, savedState);
      }
    } catch (error) {
      console.error('Failed to load state for step:', error);
    }
  };

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
      setMessages((prev: any[]) => prev.filter(m => {
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
        setMaxStepReached((prev: number) => Math.max(prev, step + 1));
        
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
      setMessages((prev: any[]) => prev.filter(m => {
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

  const initiateStep = async (step: number, context?: NavigationContext) => {
    const stepData = STEPS[step - 1];
    if (!stepData) return;
    
    // Use default context if not provided (for backward compatibility)
    const navContext = context || {
      source: 'forward_progression',
      intent: determineNavigationIntent(step, stepHistory.get(step))
    };
    
    console.log(`Initiating step ${step} (${stepData.name}) with context:`, navContext);
    console.log(`Current messages count: ${setMessages.length || 0}`);

    // Clear components only for first visits or when needed
    if (step !== 4 && navContext.intent === 'first_visit') {
      setMessages((prev: any[]) => prev.filter(m => m.id !== 'skills-component'));
    }

    // Show dynamic message only for first visits (except CV upload and skills)
    if (step > 1 && step !== 4 && navContext.intent === 'first_visit') {
      setShowDynamicMessage(true);
    }

    switch (stepData.name) {
      case 'work_experience':
        // Clear skills components only on first visit
        if (navContext.intent === 'first_visit') {
          setMessages((prev: any[]) => prev.filter(m => m.id !== 'skills-component'));
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
        setMessages((prev: any[]) => prev.filter(m => m.id !== 'skills-component'));
        
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
            setMessages((prev: any[]) => prev.filter(m => m.id !== 'skills-component'));
            
            // Show skills review component
            setTimeout(() => {
              setMessages((prev: any[]) => [...prev, {
                id: 'skills-component',
                type: 'system',
                content: (
                  ChatSkillsReview({
                    employeeId: employeeId,
                    onComplete: () => {
                      updateStepHistory(4, 'completed');
                      moveToNextStep();
                    }
                  })
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
          setMessages((prev: any[]) => prev.filter(m => m.id !== 'skills-component'));
        }
        
        // Handle based on navigation context
        if (navContext.intent === 'first_visit') {
          // Check if data already exists even on first visit
          if (formData.teamSize && formData.roleInTeam) {
            addBotMessage(
              `I see you're working in a ${formData.teamSize} team as a ${formData.roleInTeam}. Would you like to update this information?`,
              0,
              500
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Update Info", value: "update_team" },
                { label: "Continue", value: "continue", variant: 'primary' }
              ]);
            }, 1000);
          } else {
            // First time on this step - no data yet
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
        } else if (navContext.intent === 'continue_progress') {
          // Continue from where they left off
          if (formData.teamSize && formData.roleInTeam) {
            // Both are already set - show review message
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
          } else if (formData.teamSize && !formData.roleInTeam) {
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
        } else if (navContext.intent === 'edit_existing') {
          // They want to edit existing data
          if (formData.teamSize && formData.roleInTeam) {
            addBotMessage(
              `Let's update your current work information. You previously indicated:\n\nTeam size: ${formData.teamSize}\nRole: ${formData.roleInTeam}\n\nWhat would you like to change?`,
              0,
              500
            );
            setTimeout(() => {
              showQuickReplies([
                { label: "Update Info", value: "update_team" },
                { label: "Keep Current Info", value: "continue", variant: 'primary' }
              ]);
            }, 1000);
          } else {
            // No existing data, start fresh
            addBotMessage("Let's add your current work information. What size team do you work with?", 0, 1000);
            setTimeout(() => {
              showQuickReplies([
                { label: "Working alone", value: "Working alone" },
                { label: "2-5 people", value: "2-5 people" },
                { label: "6-10 people", value: "6-10 people" },
                { label: "10+ people", value: "10+ people" }
              ]);
            }, 2000);
          }
        }
        break;

      case 'challenges':
        setShowDynamicMessage(false);
        // CRITICAL: Remove any lingering skills components
        setMessages((prev: any[]) => prev.filter(m => m.id !== 'skills-component'));
        
        // Handle based on navigation context
        if (navContext.intent === 'review_completed') {
          // User is reviewing already completed challenges
          if (formData.challenges && formData.challenges.length > 0) {
            addBotMessage(
              `You've already identified ${formData.challenges.length} challenge${formData.challenges.length > 1 ? 's' : ''}:\n\n${formData.challenges.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}\n\nWould you like to review or update these?`,
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
              `Let's update your professional challenges. Currently selected:\n\n${formData.challenges.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}\n\nWhat would you like to do?`,
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
        setMessages((prev: any[]) => prev.filter(m => m.id !== 'skills-component'));
        
        // Handle based on navigation context
        if (navContext.intent === 'review_completed') {
          // User is reviewing already completed growth areas
          if (formData.growthAreas && formData.growthAreas.length > 0) {
            addBotMessage(
              `You've identified ${formData.growthAreas.length} growth area${formData.growthAreas.length > 1 ? 's' : ''}:\n\n${formData.growthAreas.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n')}\n\nWould you like to review these before completing your profile?`,
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
              `Let's update your growth areas. Currently selected:\n\n${formData.growthAreas.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n')}\n\nWhat would you like to do?`,
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
        } else if (history.status === 'in_progress' && step.id !== currentStepRef.current) {
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

  return {
    moveToNextStep,
    navigateToStep,
    initiateStep,
    getStepsForMenu,
    goToPreviousStep,
    determineNavigationIntent,
    loadSavedStateForStep,
    updateStepHistory: updateStepHistoryHandler,
    awardMilestone: awardMilestoneHandler,
    getStepStatus
  };
};