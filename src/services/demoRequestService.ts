
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
  source: string;
}

export interface DemoRequestRecord {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  job_title: string | null;
  phone: string | null;
  company_size: string | null;
  country: string | null;
  message: string | null;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export const demoRequestService = {
  async submitDemoRequest(demoRequest: DemoRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('demo_requests')
        .insert([
          {
            first_name: demoRequest.firstName,
            last_name: demoRequest.lastName,
            email: demoRequest.email,
            company: demoRequest.company,
            job_title: demoRequest.jobTitle || null,
            phone: demoRequest.phone || null,
            company_size: demoRequest.companySize || null,
            country: demoRequest.country || null,
            message: demoRequest.message || null,
            source: demoRequest.source,
            status: 'new', // Default status
            notes: null,
            processed_by: null,
            processed_at: null,
            submitted_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error submitting demo request:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error submitting demo request:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  async getAllDemoRequests(): Promise<DemoRequestRecord[]> {
    const { data, error } = await supabase
      .from('demo_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching demo requests:', error);
      throw new Error(`Failed to fetch demo requests: ${error.message}`);
    }

    // Cast the data to match our expected type structure
    const typedData: DemoRequestRecord[] = (data || []).map(item => ({
      ...item,
      status: (item.status as DemoRequestRecord['status']) || 'new'
    }));

    return typedData;
  },

  // Alias for backward compatibility
  async getDemoRequests(): Promise<DemoRequestRecord[]> {
    return this.getAllDemoRequests();
  },

  async getDemoRequestStats(): Promise<{ total: number; new: number }> {
    const { data, error } = await supabase
      .from('demo_requests')
      .select('status');

    if (error) {
      console.error('Error fetching demo request stats:', error);
      return { total: 0, new: 0 };
    }

    const total = data?.length || 0;
    const newRequests = data?.filter(item => item.status === 'new').length || 0;

    return { total, new: newRequests };
  },

  async getDemoRequestById(id: string): Promise<DemoRequestRecord | null> {
    const { data, error } = await supabase
      .from('demo_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching demo request by ID:', error);
      return null;
    }

    return data as DemoRequestRecord;
  },

  async updateDemoRequest(
    id: string,
    updates: Partial<DemoRequestRecord>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('demo_requests')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating demo request:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error updating demo request:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  async deleteDemoRequest(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('demo_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting demo request:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error deleting demo request:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },
};
