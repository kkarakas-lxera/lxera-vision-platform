import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  id?: string;
  employee_id: string;
  user_id: string;
  message_type: 'user' | 'bot' | 'system';
  content: string;
  metadata?: any;
  step?: string;
  created_at?: string;
  updated_at?: string;
}

export class ChatMessageService {
  static async saveMessage(message: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  static async saveMessages(messages: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at'>[]) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messages)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving chat messages:', error);
      throw error;
    }
  }

  static async getRecentMessages(employeeId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Return in chronological order
      return data ? data.reverse() : [];
    } catch (error) {
      console.error('Error loading chat messages:', error);
      return [];
    }
  }

  static async getAllMessages(employeeId: string, offset: number = 0, limit: number = 50) {
    try {
      const { data, error, count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact' })
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      return {
        messages: data ? data.reverse() : [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit
      };
    } catch (error) {
      console.error('Error loading all chat messages:', error);
      return { messages: [], total: 0, hasMore: false };
    }
  }

  static async deleteMessagesByEmployee(employeeId: string) {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('employee_id', employeeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting chat messages:', error);
      throw error;
    }
  }
}