import { supabase } from '@/integrations/supabase/client';

export interface DemoCapture {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  company_size: string | null;
  step_completed: number;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: 'captured' | 'scheduled' | 'completed';
  calendly_scheduled: boolean;
  demo_completed: boolean;
  created_at: string;
  updated_at: string;
  scheduled_at: string | null;
  completed_at: string | null;
}

export interface DemoCaptureRequest {
  email: string;
  name?: string;
  company?: string;
  companySize?: string;
  source: string;
  stepCompleted?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

class DemoCaptureService {
  async captureDemo(request: DemoCaptureRequest): Promise<DemoCapture> {
    const { data, error } = await supabase.functions.invoke('capture-demo', {
      body: {
        email: request.email,
        name: request.name,
        company: request.company,
        companySize: request.companySize,
        source: request.source,
        stepCompleted: request.stepCompleted || 1,
        utmSource: request.utmSource,
        utmMedium: request.utmMedium,
        utmCampaign: request.utmCampaign
      }
    });

    if (error) {
      console.error('Error capturing demo:', error);
      throw new Error('Failed to capture demo request');
    }

    return data.data;
  }

  async getDemoCaptures(): Promise<DemoCapture[]> {
    const { data, error } = await supabase
      .from('demo_captures')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching demo captures:', error);
      throw new Error('Failed to fetch demo captures');
    }

    return data || [];
  }

  async getDemoCaptureStats() {
    const { data, error } = await supabase
      .from('demo_captures')
      .select('status, created_at');

    if (error) {
      console.error('Error fetching demo capture stats:', error);
      throw new Error('Failed to fetch demo capture stats');
    }

    const total = data?.length || 0;
    const today = new Date().toDateString();
    const newToday = data?.filter(item => 
      new Date(item.created_at).toDateString() === today
    ).length || 0;

    return {
      total,
      newToday,
      captured: data?.filter(item => item.status === 'captured').length || 0,
      scheduled: data?.filter(item => item.status === 'scheduled').length || 0,
      completed: data?.filter(item => item.status === 'completed').length || 0
    };
  }

  async updateDemoCapture(id: string, updates: Partial<DemoCapture>): Promise<DemoCapture> {
    const { data, error } = await supabase
      .from('demo_captures')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating demo capture:', error);
      throw new Error('Failed to update demo capture');
    }

    return data;
  }

  async deleteDemoCapture(id: string): Promise<void> {
    const { error } = await supabase
      .from('demo_captures')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting demo capture:', error);
      throw new Error('Failed to delete demo capture');
    }
  }
}

export const demoCaptureService = new DemoCaptureService();