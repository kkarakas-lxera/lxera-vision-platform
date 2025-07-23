import { supabase } from '@/integrations/supabase/client';
import type { SmartContext, FormData } from '../types';
import { UI_CONSTANTS } from '../constants';

export class SmartIntentService {
  static async analyzeIntent(input: string, context: SmartContext, formData: FormData) {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-profile-intent', {
        body: {
          input,
          context: {
            currentStep: context.currentStep,
            currentFocus: context.currentFocus,
            recentInteractions: context.recentInteractions.slice(-5),
            formData: formData,
            activeUI: context.activeUI
          },
          formData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Intent analysis failed:', error);
      return null;
    }
  }

  static updateSmartContext(
    prevContext: SmartContext, 
    type: string, 
    entities: any, 
    currentStep: number, 
    formData: FormData
  ): SmartContext {
    return {
      ...prevContext,
      currentStep,
      formData,
      recentInteractions: [...prevContext.recentInteractions, {
        type,
        data: entities,
        timestamp: new Date()
      }].slice(-UI_CONSTANTS.maxRecentInteractions)
    };
  }

  static determineNextAction(field: string, currentStep: number) {
    const fieldProgressions: Record<string, Record<string, { type: string; field: string }>> = {
      '2': { // Work experience step
        'title': { type: 'ask', field: 'company' },
        'company': { type: 'ask', field: 'duration' }
      },
      '5': { // Current work step
        'teamSize': { type: 'ask', field: 'roleInTeam' }
      }
    };
    
    return fieldProgressions[currentStep]?.[field] || null;
  }

  static getStepMap(): Record<string, number> {
    return {
      'cv': 1,
      'work': 2,
      'education': 3,
      'skills': 4,
      'current': 5,
      'challenges': 6,
      'growth': 7
    };
  }
}