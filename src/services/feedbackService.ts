import { supabase } from '@/integrations/supabase/client';
import { FeedbackType } from '@/components/feedback/FeedbackModal';

export interface FeedbackSubmission {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  submitted_at: string;
  metadata?: Record<string, any>;
}

export interface CreateFeedbackData {
  type: FeedbackType;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  user_id: string;
  user_email: string;
  user_name: string;
  company_id?: string;
  metadata?: Record<string, any>;
}

class FeedbackService {
  async submitFeedback(data: CreateFeedbackData): Promise<{ success: boolean; feedbackId?: string; error?: string }> {
    try {
      const { data: feedback, error } = await supabase
        .from('tickets')
        .insert({
          ticket_type: data.type,
          first_name: data.user_name.split(' ')[0] || 'User',
          last_name: data.user_name.split(' ').slice(1).join(' ') || '',
          email: data.user_email,
          company: data.company_id || 'Unknown',
          message: `${data.title}\n\n${data.description}`,
          priority: data.priority,
          source: 'Platform Dashboard',
          status: 'new',
          metadata: {
            ...data.metadata,
            category: data.category,
            platform: 'web',
            submitted_from: 'dashboard',
          },
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }

      return { success: true, feedbackId: feedback.id };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserFeedback(userId: string, limit: number = 10): Promise<{ submissions: FeedbackSubmission[]; error?: string }> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('id, ticket_type, message, priority, status, submitted_at, metadata')
        .eq('email', userId) // Using email as user identifier since that's how we store it
        .in('ticket_type', ['bug_report', 'feature_request', 'general_feedback'])
        .order('submitted_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const submissions: FeedbackSubmission[] = tickets.map(ticket => {
        const [title, ...descriptionParts] = ticket.message.split('\n\n');
        const description = descriptionParts.join('\n\n');
        
        return {
          id: ticket.id,
          type: ticket.ticket_type as FeedbackType,
          title: title || 'Feedback',
          description: description || ticket.message,
          priority: ticket.priority as 'low' | 'medium' | 'high',
          category: ticket.metadata?.category || 'Other',
          status: ticket.status as 'new' | 'in_progress' | 'resolved' | 'closed',
          submitted_at: ticket.submitted_at,
          metadata: ticket.metadata,
        };
      });

      return { submissions };
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      return { submissions: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getCompanyFeedback(companyId: string, limit: number = 20): Promise<{ submissions: FeedbackSubmission[]; error?: string }> {
    try {
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('id, ticket_type, message, priority, status, submitted_at, metadata, email')
        .eq('company', companyId)
        .in('ticket_type', ['bug_report', 'feature_request', 'general_feedback'])
        .order('submitted_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const submissions: FeedbackSubmission[] = tickets.map(ticket => {
        const [title, ...descriptionParts] = ticket.message.split('\n\n');
        const description = descriptionParts.join('\n\n');
        
        return {
          id: ticket.id,
          type: ticket.ticket_type as FeedbackType,
          title: title || 'Feedback',
          description: description || ticket.message,
          priority: ticket.priority as 'low' | 'medium' | 'high',
          category: ticket.metadata?.category || 'Other',
          status: ticket.status as 'new' | 'in_progress' | 'resolved' | 'closed',
          submitted_at: ticket.submitted_at,
          metadata: { ...ticket.metadata, email: ticket.email },
        };
      });

      return { submissions };
    } catch (error) {
      console.error('Error fetching company feedback:', error);
      return { submissions: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const feedbackService = new FeedbackService();