import { supabase } from '@/integrations/supabase/client';

export interface ProfileSection {
  name: 'cv_upload' | 'basic_info' | 'work_experience' | 'education' | 'skills' | 'certifications' | 'languages' | 'projects' | 'current_work' | 'daily_tasks' | 'tools_technologies';
  isComplete: boolean;
  completedAt?: string;
  data?: any;
}

export interface ProfileInvitation {
  id: string;
  invitationToken: string;
  sentAt: string;
  viewedAt?: string;
  completedAt?: string;
  expiresAt: string;
}

export class EmployeeProfileService {
  static async getProfileSections(employeeId: string): Promise<ProfileSection[]> {
    const { data, error } = await supabase
      .from('employee_profile_sections')
      .select('*')
      .eq('employee_id', employeeId);

    if (error) throw error;

    const sections: ProfileSection[] = [
      'basic_info',
      'work_experience', 
      'education',
      'skills',
      'certifications',
      'languages',
      'projects'
    ].map(sectionName => {
      const section = data?.find(s => s.section_name === sectionName);
      return {
        name: sectionName as ProfileSection['name'],
        isComplete: section?.is_complete || false,
        completedAt: section?.completed_at,
        data: section?.data
      };
    });

    return sections;
  }

  static async updateProfileSection(
    employeeId: string, 
    sectionName: ProfileSection['name'], 
    data: any,
    isComplete: boolean = false
  ): Promise<void> {
    if (!employeeId || employeeId.trim() === '') {
      throw new Error('Employee ID is required');
    }

    try {
      const { error } = await supabase
        .from('employee_profile_sections')
        .upsert({
          employee_id: employeeId,
          section_name: sectionName,
          data,
          is_complete: isComplete,
          completed_at: isComplete ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'employee_id,section_name'
        });

      if (error) {
        console.error('Error updating profile section:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to update profile section:', { employeeId, sectionName, error });
      throw error;
    }
  }

  static async createProfileInvitation(employeeId: string): Promise<string> {
    const { data, error } = await supabase
      .from('profile_invitations')
      .insert({
        employee_id: employeeId
      })
      .select('invitation_token')
      .single();

    if (error) throw error;
    return data.invitation_token;
  }

  static async getInvitation(token: string): Promise<ProfileInvitation | null> {
    const { data, error } = await supabase
      .from('profile_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      invitationToken: data.invitation_token,
      sentAt: data.sent_at,
      viewedAt: data.viewed_at,
      completedAt: data.completed_at,
      expiresAt: data.expires_at
    };
  }

  static async markInvitationViewed(token: string): Promise<void> {
    const { error } = await supabase
      .from('profile_invitations')
      .update({ viewed_at: new Date().toISOString() })
      .eq('invitation_token', token);

    if (error) throw error;
  }

  static async saveSection(employeeId: string, sectionName: ProfileSection['name'], data: any): Promise<void> {
    await this.updateProfileSection(employeeId, sectionName, data, true);
  }

  static async loadSection(employeeId: string, sectionName: ProfileSection['name']): Promise<{ data: any } | null> {
    const { data, error } = await supabase
      .from('employee_profile_sections')
      .select('data')
      .eq('employee_id', employeeId)
      .eq('section_name', sectionName)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  }

  static async completeProfile(employeeId: string): Promise<void> {
    // Update employee profile_complete flag
    const { error: employeeError } = await supabase
      .from('employees')
      .update({
        profile_complete: true,
        profile_completion_date: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (employeeError) throw employeeError;

    // Mark invitation as completed
    const { error: inviteError } = await supabase
      .from('profile_invitations')
      .update({ completed_at: new Date().toISOString() })
      .eq('employee_id', employeeId)
      .is('completed_at', null);

    if (inviteError) throw inviteError;
  }

  static async calculateProfileCompleteness(employeeId: string): Promise<number> {
    const sections = await this.getProfileSections(employeeId);
    const completedSections = sections.filter(s => s.isComplete).length;
    return Math.round((completedSections / sections.length) * 100);
  }
}