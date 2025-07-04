// Backward compatibility wrapper for ticketService
// This file is maintained to support legacy code that still uses demoRequestService

import { ticketService, TicketRecord } from './ticketService';

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

// Helper function to convert TicketRecord to DemoRequestRecord
const ticketToDemoRequest = (ticket: TicketRecord): DemoRequestRecord => ({
  id: ticket.id,
  first_name: ticket.first_name,
  last_name: ticket.last_name,
  email: ticket.email,
  company: ticket.company || '',
  job_title: ticket.job_title,
  phone: ticket.phone,
  company_size: ticket.company_size,
  country: ticket.country,
  message: ticket.message,
  source: ticket.source,
  status: ticket.status,
  notes: ticket.notes,
  processed_by: ticket.processed_by,
  processed_at: ticket.processed_at,
  submitted_at: ticket.submitted_at,
  created_at: ticket.created_at,
  updated_at: ticket.updated_at
});

export const demoRequestService = {
  async submitDemoRequest(demoRequest: DemoRequest): Promise<{ success: boolean; error?: string }> {
    return ticketService.submitDemoRequest(demoRequest);
  },

  async getAllDemoRequests(): Promise<DemoRequestRecord[]> {
    const tickets = await ticketService.getDemoRequests();
    return tickets.map(ticketToDemoRequest);
  },

  async getDemoRequests(): Promise<DemoRequestRecord[]> {
    return this.getAllDemoRequests();
  },

  async getDemoRequestStats(): Promise<{ total: number; new: number }> {
    return ticketService.getDemoRequestStats();
  },

  async getDemoRequestById(id: string): Promise<DemoRequestRecord | null> {
    const ticket = await ticketService.getTicketById(id);
    return ticket && ticket.ticket_type === 'demo_request' ? ticketToDemoRequest(ticket) : null;
  },

  async updateDemoRequest(
    id: string,
    updates: Partial<DemoRequestRecord>
  ): Promise<{ success: boolean; error?: string }> {
    return ticketService.updateTicket(id, updates);
  },

  async deleteDemoRequest(id: string): Promise<{ success: boolean; error?: string }> {
    return ticketService.deleteTicket(id);
  },
};