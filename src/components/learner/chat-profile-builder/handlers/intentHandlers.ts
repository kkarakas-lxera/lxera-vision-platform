import { FormData, SmartContext } from '../types';
import { SmartIntentService } from '../services/smartIntentService';
import type { Dispatch, SetStateAction } from 'react';

export interface IntentHandlerContext {
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  smartContext: SmartContext;
  currentStep: number;
  maxStepReached: number;
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
}

export class IntentHandlers {
  private context: IntentHandlerContext;

  constructor(context: IntentHandlerContext) {
    this.context = context;
  }

  async handleInfoProvision(entities: any) {
    const { field, value } = entities;
    
    if (field && value) {
      this.context.setFormData(prev => ({ ...prev, [field]: value }));
      await this.context.saveStepData(true);
      
      const nextAction = SmartIntentService.determineNextAction(field, this.context.currentStep);
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
    
    const stepMap = SmartIntentService.getStepMap();
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

  getIntentHandlerMap() {
    return {
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
  }
}