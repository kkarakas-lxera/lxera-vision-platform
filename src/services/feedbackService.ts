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
        .from('company_feedback')
        .insert({
          company_id: data.company_id,
          user_id: data.user_id,
          type: data.type,
          category: data.category,
          priority: data.priority,
          title: data.title,
          description: data.description,
          user_email: data.user_email,
          user_name: data.user_name,
          status: 'new',
          metadata: {
            ...data.metadata,
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
      const { data: feedbacks, error } = await supabase
        .from('company_feedback')
        .select('id, type, title, description, priority, category, status, created_at, metadata')
        .eq('user_email', userId) // Using email as user identifier
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const submissions: FeedbackSubmission[] = (feedbacks || []).map(feedback => {
        return {
          id: feedback.id,
          type: feedback.type as FeedbackType,
          title: feedback.title,
          description: feedback.description,
          priority: feedback.priority as 'low' | 'medium' | 'high',
          category: feedback.category,
          status: feedback.status as 'new' | 'in_progress' | 'resolved' | 'closed',
          submitted_at: feedback.created_at,
          metadata: feedback.metadata,
        };
      });

      return { submissions };
    } catch (error) {
      console.error('Error fetching user feedback:', error);
      // Return empty array instead of error to prevent UI crashes
      return { submissions: [], error: 'Unable to load feedback at the moment' };
    }
  }

  async getCompanyFeedback(companyId: string, limit: number = 20): Promise<{ submissions: FeedbackSubmission[]; error?: string }> {
    try {
      const { data: feedbacks, error } = await supabase
        .from('company_feedback')
        .select('id, type, title, description, priority, category, status, created_at, metadata, user_email')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      const submissions: FeedbackSubmission[] = (feedbacks || []).map(feedback => {
        return {
          id: feedback.id,
          type: feedback.type as FeedbackType,
          title: feedback.title,
          description: feedback.description,
          priority: feedback.priority as 'low' | 'medium' | 'high',
          category: feedback.category,
          status: feedback.status as 'new' | 'in_progress' | 'resolved' | 'closed',
          submitted_at: feedback.created_at,
          metadata: { ...feedback.metadata, email: feedback.user_email },
        };
      });

      return { submissions };
    } catch (error) {
      console.error('Error fetching company feedback:', error);
      // Return empty array instead of error to prevent UI crashes
      return { submissions: [], error: 'Unable to load feedback at the moment' };
    }
  }
}

export const feedbackService = new FeedbackService();