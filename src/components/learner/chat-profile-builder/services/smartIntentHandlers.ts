import { supabase } from '@/lib/supabase';
import { FormData, SmartContext } from '../types';
// UI component imports removed as JSX is no longer used in this file
import type { Dispatch, SetStateAction, MutableRefObject } from 'react';

export interface SmartIntentHandlersContext {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  smartContext: SmartContext;
  setSmartContext: Dispatch<SetStateAction<SmartContext>>;
  currentStepRef: MutableRefObject<number>;
  maxStepReached: number;
  messages: any[];
  setMessages: Dispatch<SetStateAction<any[]>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  saveStepData: (isAutoSave?: boolean) => Promise<void>;
  addBotMessage: (content: string, points?: number, delay?: number) => void;
  showQuickReplies: (replies: Array<{ label: string; value: string }>) => void;
  navigateToStep: (step: number, intent: string) => void;
  moveToNextStep: () => void;
  showInlineWorkForm: () => void;
  showInlineEducationForm: () => void;
  showEditWorkForm: (index: number) => void;
  showEditEducationForm: (index: number) => void;
  showSkillAddition: () => void;
  showProfileSummary: () => void;
  showWorkSummary: () => void;
  showEducationSummary: () => void;
  showChallengesSelection: () => void;
  showGrowthSelection: () => void;
  askCurrentWorkQuestions: () => void;
  showGrowth: () => void;
  completeProfile: () => void;
}

export class SmartIntentHandlers {
  private context: SmartIntentHandlersContext;

  constructor(context: SmartIntentHandlersContext) {
    this.context = context;
  }

  async analyzeIntent(input: string) {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-profile-intent', {
        body: {
          input,
          context: {
            currentStep: this.context.currentStepRef.current,
            currentFocus: this.context.smartContext.currentFocus,
            recentInteractions: this.context.smartContext.recentInteractions.slice(-5),
            formData: this.context.formData,
            activeUI: this.context.smartContext.activeUI
          },
          formData: this.context.formData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Intent analysis failed:', error);
      return null;
    }
  }

  async executeSmartAction(intent: any) {
    const { type, entities, suggestedAction, naturalResponse } = intent;

    // Add natural response from AI
    if (naturalResponse) {
      this.context.addBotMessage(naturalResponse, 0, 300);
    }

    // Track interaction
    this.context.setSmartContext(prev => ({
      ...prev,
      recentInteractions: [...prev.recentInteractions, {
        type,
        data: entities,
        timestamp: new Date()
      }].slice(-10) // Keep last 10 interactions
    }));

    // Map of intent handlers
    const intentHandlers: Record<string, (entities: any) => Promise<void>> = {
      'provide_info': this.handleInfoProvision.bind(this),
      'correction': this.handleCorrection.bind(this),
      'navigation': this.handleSmartNavigation.bind(this),
      'add_item': this.handleAddItem.bind(this),
      'remove_item': this.handleRemoveItem.bind(this),
      'edit_item': this.handleEditItem.bind(this),
      'bulk_operation': this.handleBulkOperation.bind(this),
      'review': this.handleReviewRequest.bind(this),
      'confirmation': this.handleConfirmation.bind(this)
    };

    const handler = intentHandlers[type];
    if (handler) {
      await handler(entities);
    } else if (suggestedAction?.type === 'show_ui') {
      this.showDynamicUI(suggestedAction.params);
    }
  }

  async handleInfoProvision(entities: any) {
    const { field, value } = entities;
    
    if (field && value) {
      this.context.setFormData(prev => ({ ...prev, [field]: value }));
      await this.context.saveStepData(true);
      
      const nextAction = this.determineNextAction(field);
      if (nextAction) {
        this.executeNextAction(nextAction);
      }
    }
  }

  async handleCorrection(entities: any) {
    const { field, value, target } = entities;
    
    if (target === 'last_provided_field') {
      const lastInteraction = this.context.smartContext.recentInteractions
        .filter(i => i.type === 'provide_info')
        .pop();
      
      if (lastInteraction?.data?.field) {
        this.context.setFormData(prev => ({ 
          ...prev, 
          [lastInteraction.data.field]: value 
        }));
        await this.context.saveStepData(true);
      }
    } else if (field) {
      this.context.setFormData(prev => ({ ...prev, [field]: value }));
      await this.context.saveStepData(true);
    }
  }

  async handleSmartNavigation(entities: any) {
    const { target } = entities;
    
    const stepMap: Record<string, number> = {
      'cv': 1,
      'work': 2,
      'education': 3,
      'skills': 4,
      'current': 5,
      'challenges': 6,
      'growth': 7
    };
    
    const targetStep = stepMap[target] || parseInt(target);
    if (targetStep && targetStep <= this.context.maxStepReached) {
      this.context.navigateToStep(targetStep, 'edit_existing');
    }
  }

  async handleAddItem(entities: any) {
    const { target } = entities;
    
    const addItemMap: Record<string, () => void> = {
      'work_experience': this.context.showInlineWorkForm,
      'job': this.context.showInlineWorkForm,
      'position': this.context.showInlineWorkForm,
      'education': this.context.showInlineEducationForm,
      'degree': this.context.showInlineEducationForm,
      'skill': this.context.showSkillAddition
    };
    
    const handler = addItemMap[target];
    if (handler) handler();
  }

  async handleRemoveItem(entities: any) {
    const { target, index } = entities;
    
    if (typeof index !== 'number') return;
    
    const removeActions: Record<string, () => void> = {
      'work_experience': () => {
        this.context.setFormData(prev => ({
          ...prev,
          workExperience: prev.workExperience.filter((_, i) => i !== index)
        }));
        this.context.addBotMessage(`Removed work experience #${index + 1}`, 0);
      },
      'education': () => {
        this.context.setFormData(prev => ({
          ...prev,
          education: prev.education.filter((_, i) => i !== index)
        }));
        this.context.addBotMessage(`Removed education #${index + 1}`, 0);
      }
    };
    
    const action = removeActions[target];
    if (action) {
      action();
      await this.context.saveStepData(true);
    }
  }

  async handleEditItem(entities: any) {
    const { target, index } = entities;
    
    if (typeof index !== 'number') return;
    
    const editItemMap: Record<string, (index: number) => void> = {
      'work_experience': this.context.showEditWorkForm,
      'education': this.context.showEditEducationForm
    };
    
    const handler = editItemMap[target];
    if (handler) handler(index);
  }

  async handleBulkOperation(entities: any) {
    const { operation, target } = entities;
    
    if (operation === 'remove_all' && target === 'certifications') {
      this.context.setFormData(prev => ({ ...prev, certifications: [] }));
      this.context.addBotMessage("Removed all certifications", 0);
      await this.context.saveStepData(true);
    }
  }

  async handleReviewRequest(entities: any) {
    const { target } = entities;
    
    const reviewMap: Record<string, () => void> = {
      'all': this.context.showProfileSummary,
      'everything': this.context.showProfileSummary,
      'work': this.context.showWorkSummary,
      'education': this.context.showEducationSummary
    };
    
    const handler = reviewMap[target];
    if (handler) handler();
  }

  async handleConfirmation(entities: any) {
    const { target } = entities;
    
    if (target === 'current_section') {
      this.context.moveToNextStep();
    }
  }

  private determineNextAction(field: string) {
    const step = this.context.currentStepRef.current;
    
    const fieldProgressions: Record<string, Record<string, { type: string; field: string }>> = {
      '2': { // Work experience step
        'title': { type: 'ask', field: 'company' },
        'company': { type: 'ask', field: 'duration' }
      },
      '5': { // Current work step
        'teamSize': { type: 'ask', field: 'roleInTeam' }
      }
    };
    
    return fieldProgressions[step]?.[field] || null;
  }

  private executeNextAction(action: any) {
    if (action.type !== 'ask') return;
    
    const askActions: Record<string, () => void> = {
      'company': () => {
        this.context.addBotMessage("And which company is/was this with?", 0, 300);
      },
      'duration': () => {
        this.context.addBotMessage("How long have you been in this role?", 0, 300);
        this.context.showQuickReplies([
          { label: "< 1 year", value: "< 1 year" },
          { label: "1-3 years", value: "1-3 years" },
          { label: "3-5 years", value: "3-5 years" },
          { label: "5+ years", value: "5+ years" }
        ]);
      },
      'roleInTeam': () => {
        this.context.addBotMessage("And what's your role in the team?", 0, 300);
        this.context.showQuickReplies([
          { label: "Individual Contributor", value: "Individual Contributor" },
          { label: "Team Lead", value: "Team Lead" },
          { label: "Manager", value: "Manager" }
        ]);
      }
    };
    
    const handler = askActions[action.field];
    if (handler) handler();
  }

  private showDynamicUI(params: any) {
    const { type, data } = params;
    
    const uiMap: Record<string, () => void> = {
      'work_form': this.context.showInlineWorkForm,
      'education_form': this.context.showInlineEducationForm,
      'skills_review': this.showSkillsReview.bind(this),
      'profile_summary': this.context.showProfileSummary,
      'challenges_selection': this.context.showChallengesSelection,
      'growth_selection': this.context.showGrowthSelection,
      'work_summary': this.context.showWorkSummary,
      'education_summary': this.context.showEducationSummary
    };
    
    const handler = uiMap[type];
    if (handler) {
      handler();
    } else {
      console.log('Unknown UI type:', type);
    }
  }

  private showSkillsReview() {
    const skills = this.context.formData.skills || [];
    const messageId = 'skills-review-' + Date.now();
    
    this.context.setMessages(prev => [...prev, {
      id: messageId,
      type: 'system',
      content: JSON.stringify({
        type: 'skills_review_interactive',
        skills: skills,
        title: 'Review Your Skills',
        subtitle: 'Rate your proficiency level for each skill'
      }),
      timestamp: new Date(),
      metadata: {
        componentType: 'SkillsReviewInteractive',
        skills: skills,
        messageId: messageId
      }
    }]);
  }
}