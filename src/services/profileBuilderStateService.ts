import { supabase } from '@/integrations/supabase/client';

export interface ProfileBuilderState {
  step: number;
  maxStepReached?: number;
  cvSectionsState?: {
    acceptedSections: {
      work: boolean;
      education: boolean;
      certifications: boolean;
      languages: boolean;
    };
    currentSection: string;
  };
  skillsReviewState?: {
    selectedSkills: any[];
    removedSkills: string[];
    currentIndex: number;
    completed: boolean;
  };
  workExperienceState?: {
    currentIndex: number;
    verifiedIndexes: number[];
    editingStates: any;
  };
  educationState?: {
    currentIndex: number;
    verifiedIndexes: number[];
    editingStates: any;
  };
  formData?: any;
  lastActivity: string;
}

export class ProfileBuilderStateService {
  private static readonly STATE_KEY = 'profile_builder_state';

  static async saveState(employeeId: string, state: ProfileBuilderState) {
    try {
      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: this.STATE_KEY,
          data: state,
          is_complete: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'employee_id,section_name'
        });

      if (error) throw error;
      console.log('Profile builder state saved:', state);
    } catch (error) {
      console.error('Failed to save profile builder state:', error);
    }
  }

  static async loadState(employeeId: string): Promise<ProfileBuilderState | null> {
    try {
      const { data, error } = await supabase
        .from('employee_profile_sections')
        .select('data')
        .eq('employee_id', employeeId)
        .eq('section_name', this.STATE_KEY)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      
      if (data?.data) {
        console.log('Profile builder state loaded:', data.data);
        return data.data as ProfileBuilderState;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load profile builder state:', error);
      return null;
    }
  }

  static async clearState(employeeId: string) {
    try {
      const { error } = await supabase
        .from('employee_profile_sections')
        .delete()
        .eq('employee_id', employeeId)
        .eq('section_name', this.STATE_KEY);

      if (error) throw error;
      console.log('Profile builder state cleared');
    } catch (error) {
      console.error('Failed to clear profile builder state:', error);
    }
  }

  // Save specific component state
  static async saveCVSectionsState(employeeId: string, cvSectionsState: ProfileBuilderState['cvSectionsState']) {
    const currentState = await this.loadState(employeeId) || {} as ProfileBuilderState;
    currentState.cvSectionsState = cvSectionsState;
    currentState.lastActivity = new Date().toISOString();
    await this.saveState(employeeId, currentState);
  }

  static async saveSkillsReviewState(employeeId: string, skillsReviewState: ProfileBuilderState['skillsReviewState']) {
    const currentState = await this.loadState(employeeId) || {} as ProfileBuilderState;
    currentState.skillsReviewState = skillsReviewState;
    currentState.lastActivity = new Date().toISOString();
    await this.saveState(employeeId, currentState);
  }

  static async saveWorkExperienceState(employeeId: string, workExperienceState: ProfileBuilderState['workExperienceState']) {
    const currentState = await this.loadState(employeeId) || {} as ProfileBuilderState;
    currentState.workExperienceState = workExperienceState;
    currentState.lastActivity = new Date().toISOString();
    await this.saveState(employeeId, currentState);
  }

  static async saveEducationState(employeeId: string, educationState: ProfileBuilderState['educationState']) {
    const currentState = await this.loadState(employeeId) || {} as ProfileBuilderState;
    currentState.educationState = educationState;
    currentState.lastActivity = new Date().toISOString();
    await this.saveState(employeeId, currentState);
  }
}