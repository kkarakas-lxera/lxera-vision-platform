import { supabase } from '@/integrations/supabase/client';

export interface HRISEmployee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department?: string;
  startDate?: string;
  manager?: string;
}

export interface HRISConnection {
  id: string;
  provider: 'unified_to' | 'bamboohr' | 'workday' | 'adp';
  connectionId?: string;
  lastSyncAt?: string;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncError?: string;
}

export class HRISService {
  static async getConnection(companyId: string): Promise<HRISConnection | null> {
    const { data, error } = await supabase
      .from('hris_connections')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      provider: data.provider,
      connectionId: data.connection_id,
      lastSyncAt: data.last_sync_at,
      syncStatus: data.sync_status,
      syncError: data.sync_error
    };
  }

  static async initiateOAuth(companyId: string, provider: string): Promise<string> {
    // In production, this would generate the OAuth URL with proper credentials
    // For now, returning a placeholder URL
    const baseUrl = 'https://app.unified.to/oauth';
    const params = new URLSearchParams({
      provider,
      redirect_uri: `${window.location.origin}/dashboard/settings/hris-callback`,
      state: companyId
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  static async handleOAuthCallback(companyId: string, code: string, provider: string): Promise<boolean> {
    try {
      // In production, exchange code for tokens via backend
      const { error } = await supabase
        .from('hris_connections')
        .upsert({
          company_id: companyId,
          provider,
          connection_id: code, // Placeholder - would be actual connection ID
          sync_status: 'idle'
        });

      return !error;
    } catch (err) {
      console.error('OAuth callback error:', err);
      return false;
    }
  }

  static async syncEmployees(companyId: string): Promise<void> {
    const { error: statusError } = await supabase
      .from('hris_connections')
      .update({ sync_status: 'syncing', sync_error: null })
      .eq('company_id', companyId);

    if (statusError) throw new Error('Failed to update sync status');

    // Create sync log
    const { data: syncLog, error: logError } = await supabase
      .from('hris_sync_logs')
      .insert({
        company_id: companyId,
        sync_type: 'manual',
        status: 'started'
      })
      .select()
      .single();

    if (logError) throw new Error('Failed to create sync log');

    try {
      // In production, this would call the actual HRIS API
      // For now, simulating a successful sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update sync log
      await supabase
        .from('hris_sync_logs')
        .update({
          status: 'completed',
          employees_synced: 0,
          completed_at: new Date().toISOString()
        })
        .eq('id', syncLog.id);

      // Update connection status
      await supabase
        .from('hris_connections')
        .update({ 
          sync_status: 'idle',
          last_sync_at: new Date().toISOString()
        })
        .eq('company_id', companyId);

    } catch (error) {
      // Log error
      await supabase
        .from('hris_sync_logs')
        .update({
          status: 'failed',
          errors: { message: error instanceof Error ? error.message : 'Unknown error' },
          completed_at: new Date().toISOString()
        })
        .eq('id', syncLog.id);

      // Update connection status
      await supabase
        .from('hris_connections')
        .update({ 
          sync_status: 'error',
          sync_error: error instanceof Error ? error.message : 'Sync failed'
        })
        .eq('company_id', companyId);

      throw error;
    }
  }

  static async disconnectHRIS(companyId: string): Promise<boolean> {
    const { error } = await supabase
      .from('hris_connections')
      .delete()
      .eq('company_id', companyId);

    return !error;
  }
}