
import { supabase } from '@/integrations/supabase/client';

export interface DemoRequest {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle?: string;
  phone?: string;
  companySize?: string;
  country?: string;
  message?: string;
  source?: string;
}

export interface DemoRequestRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  job_title?: string;
  phone?: string;
  company_size?: string;
  country?: string;
  message?: string;
  source?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  submitted_at: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class DemoRequestService {
  async submitDemoRequest(request: DemoRequest): Promise<{ success: boolean; error?: string }> {
    try {
      // Use edge function for public submissions (no auth required)
      const response = await supabase.functions.invoke('submit-demo-request', {
        body: request
      });

      if (response.error) {
        console.error('Error submitting demo request:', response.error);
        return { success: false, error: response.error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error submitting demo request:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async getDemoRequests(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<DemoRequestRecord[]> {
    let query = supabase
      .from('demo_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('submitted_at', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('submitted_at', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching demo requests:', error);
      return [];
    }

    return data || [];
  }

  async updateDemoRequest(
    id: string, 
    updates: {
      status?: string;
      notes?: string;
      processed_at?: string;
      processed_by?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('demo_requests')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating demo request:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Unexpected error updating demo request:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async getDemoRequestStats(): Promise<{
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    todayCount: number;
  }> {
    const { data, error } = await supabase
      .from('demo_requests')
      .select('status, submitted_at');

    if (error || !data) {
      console.error('Error fetching demo request stats:', error);
      return {
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        converted: 0,
        todayCount: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      total: data.length,
      new: data.filter(r => r.status === 'new').length,
      contacted: data.filter(r => r.status === 'contacted').length,
      qualified: data.filter(r => r.status === 'qualified').length,
      converted: data.filter(r => r.status === 'converted').length,
      todayCount: data.filter(r => new Date(r.submitted_at) >= today).length,
    };

    return stats;
  }
}

export const demoRequestService = new DemoRequestService();
