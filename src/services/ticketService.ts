import { supabase } from '@/integrations/supabase/client';

export type TicketType = 'demo_request' | 'contact_sales' | 'early_access';

export interface BaseTicket {
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

export interface DemoRequest extends BaseTicket {
  ticketType: 'demo_request';
}

export interface ContactSalesRequest extends BaseTicket {
  ticketType: 'contact_sales';
  budgetRange?: string;
  timeline?: string;
  useCase?: string;
}

export interface EarlyAccessRequest extends BaseTicket {
  ticketType: 'early_access';
  useCase?: string;
  referralSource?: string;
}

export type TicketRequest = DemoRequest | ContactSalesRequest | EarlyAccessRequest;

export interface TicketRecord {
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
  priority: 'low' | 'medium' | 'high';
  notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  ticket_type: TicketType;
  budget_range: string | null;
  timeline: string | null;
  use_case: string | null;
  referral_source: string | null;
}

export const ticketService = {
  async submitTicket(ticket: TicketRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const baseData = {
        first_name: ticket.firstName,
        last_name: ticket.lastName,
        email: ticket.email,
        company: ticket.company,
        job_title: ticket.jobTitle || null,
        phone: ticket.phone || null,
        company_size: ticket.companySize || null,
        country: ticket.country || null,
        message: ticket.message || null,
        source: ticket.source,
        status: 'new' as const,
        priority: 'medium' as const,
        notes: null,
        processed_by: null,
        processed_at: null,
        submitted_at: new Date().toISOString(),
        ticket_type: ticket.ticketType,
      };

      let insertData = { ...baseData };

      if (ticket.ticketType === 'contact_sales') {
        insertData = {
          ...insertData,
          budget_range: ticket.budgetRange || null,
          timeline: ticket.timeline || null,
          use_case: ticket.useCase || null,
        };
      } else if (ticket.ticketType === 'early_access') {
        insertData = {
          ...insertData,
          use_case: ticket.useCase || null,
          referral_source: ticket.referralSource || null,
        };
      }

      const { error } = await supabase
        .from('tickets')
        .insert([insertData]);

      if (error) {
        console.error('Error submitting ticket:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error submitting ticket:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  async getAllTickets(ticketType?: TicketType): Promise<TicketRecord[]> {
    let query = supabase
      .from('tickets')
      .select('*');

    if (ticketType) {
      query = query.eq('ticket_type', ticketType);
    }

    const { data, error } = await query.order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      throw new Error(`Failed to fetch tickets: ${error.message}`);
    }

    return (data || []) as TicketRecord[];
  },

  async getTicketStats(ticketType?: TicketType): Promise<{ total: number; new: number; byType: Record<TicketType, number> }> {
    let query = supabase
      .from('tickets')
      .select('status, ticket_type');

    if (ticketType) {
      query = query.eq('ticket_type', ticketType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ticket stats:', error);
      return { total: 0, new: 0, byType: { demo_request: 0, contact_sales: 0, early_access: 0 } };
    }

    const total = data?.length || 0;
    const newTickets = data?.filter(item => item.status === 'new').length || 0;
    
    const byType = data?.reduce((acc, item) => {
      acc[item.ticket_type as TicketType] = (acc[item.ticket_type as TicketType] || 0) + 1;
      return acc;
    }, { demo_request: 0, contact_sales: 0, early_access: 0 } as Record<TicketType, number>) || { demo_request: 0, contact_sales: 0, early_access: 0 };

    return { total, new: newTickets, byType };
  },

  async getTicketById(id: string): Promise<TicketRecord | null> {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching ticket by ID:', error);
      return null;
    }

    return data as TicketRecord;
  },

  async updateTicket(
    id: string,
    updates: Partial<TicketRecord>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating ticket:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error updating ticket:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  async deleteTicket(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting ticket:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Unexpected error deleting ticket:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  },

  // Backward compatibility methods for demo requests
  async submitDemoRequest(demoRequest: Omit<DemoRequest, 'ticketType'>): Promise<{ success: boolean; error?: string }> {
    return this.submitTicket({ ...demoRequest, ticketType: 'demo_request' });
  },

  async getAllDemoRequests(): Promise<TicketRecord[]> {
    return this.getAllTickets('demo_request');
  },

  async getDemoRequests(): Promise<TicketRecord[]> {
    return this.getAllDemoRequests();
  },

  async getDemoRequestStats(): Promise<{ total: number; new: number }> {
    const stats = await this.getTicketStats('demo_request');
    return { total: stats.total, new: stats.new };
  },

  async getDemoRequestById(id: string): Promise<TicketRecord | null> {
    const ticket = await this.getTicketById(id);
    return ticket && ticket.ticket_type === 'demo_request' ? ticket : null;
  },

  async updateDemoRequest(id: string, updates: Partial<TicketRecord>): Promise<{ success: boolean; error?: string }> {
    return this.updateTicket(id, updates);
  },

  async deleteDemoRequest(id: string): Promise<{ success: boolean; error?: string }> {
    return this.deleteTicket(id);
  },
};

// Re-export for backward compatibility
export const demoRequestService = ticketService;