import React from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessageService } from '@/services/chatMessageService';
import QuickReplyButtons from '../chat/QuickReplyButtons';
import { Zap, Upload, Clock, Trophy } from 'lucide-react';

interface Message {
  id: string;
  type: 'bot' | 'user' | 'achievement' | 'challenge' | 'system' | 'quick_replies';
  content: string | React.ReactNode;
  timestamp: Date;
  points?: number;
  achievement?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    iconName?: string;
    iconClass?: string;
  };
  metadata?: any;
}

const ACHIEVEMENTS = {
  QUICK_START: { name: "Quick Start", points: 50, iconName: 'Zap', iconClass: "h-6 w-6 text-yellow-600" },
  CV_UPLOADED: { name: "Document Master", points: 200, iconName: 'Upload', iconClass: "h-6 w-6 text-blue-600" },
  SPEED_DEMON: { name: "Speed Demon", points: 150, iconName: 'Clock', iconClass: "h-6 w-6 text-purple-600" },
  COMPLETIONIST: { name: "Profile Hero", points: 500, iconName: 'Trophy', iconClass: "h-6 w-6 text-gold-600" }
};

const addBotMessage = (
  content: string | React.ReactNode, 
  points = 0, 
  delay = 1000,
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setPoints: React.Dispatch<React.SetStateAction<number>>,
  savePointsToDatabase: (points: number) => void,
  userId: string,
  employeeId: string,
  currentStepRef: React.MutableRefObject<number>
) => {
  setIsTyping(true);
  
  setTimeout(async () => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      ...(points > 0 && { points }) // Only include points if greater than 0
    };
    
    setMessages(prev => [...prev, message]);
    if (points > 0) {
      setPoints(prev => {
        const newPoints = prev + points;
        // Save points to database
        savePointsToDatabase(newPoints);
        return newPoints;
      });
    }
    setIsTyping(false);
    
    // Auto-save message if it's a string
    if (userId && typeof content === 'string') {
      try {
        await ChatMessageService.saveMessage({
          employee_id: employeeId,
          user_id: userId,
          message_type: 'bot',
          content,
          metadata: { points },
          step: currentStepRef.current
        });
      } catch (error) {
        console.error('Failed to save bot message:', error);
      }
    }
  }, delay);
};

const addUserMessage = async (
  content: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  lastResponseTime: Date | null,
  setStreak: React.Dispatch<React.SetStateAction<number>>,
  employeeId: string,
  addAchievement: (achievement: typeof ACHIEVEMENTS.QUICK_START) => void,
  setLastResponseTime: React.Dispatch<React.SetStateAction<Date | null>>,
  userId: string,
  currentStepRef: React.MutableRefObject<number>
) => {
  const message: Message = {
    id: Date.now().toString(),
    type: 'user',
    content,
    timestamp: new Date()
  };
  
  setMessages(prev => [...prev, message]);
  
  // Update streak for quick responses
  if (lastResponseTime && (Date.now() - lastResponseTime.getTime()) < 5000) {
    setStreak(prev => {
      const newStreak = prev + 1;
      // Save streak to database
      supabase
        .from('employees')
        .update({ profile_builder_streak: newStreak })
        .eq('id', employeeId)
        .then(() => {})
        .catch(err => console.error('Failed to save streak:', err));
      
      if (newStreak > 2) {
        addAchievement(ACHIEVEMENTS.SPEED_DEMON);
      }
      return newStreak;
    });
  }
  setLastResponseTime(new Date());
  
  // Auto-save message
  if (userId) {
    try {
      await ChatMessageService.saveMessage({
        employee_id: employeeId,
        user_id: userId,
        message_type: 'user',
        content,
        step: currentStepRef.current
      });
    } catch (error) {
      console.error('Failed to save user message:', error);
    }
  }
};

const addAchievement = (
  achievement: typeof ACHIEVEMENTS.QUICK_START,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setPoints: React.Dispatch<React.SetStateAction<number>>,
  savePointsToDatabase: (points: number) => void
) => {
  const message: Message = {
    id: Date.now().toString(),
    type: 'achievement',
    content: '',
    timestamp: new Date(),
    points: achievement.points,
    achievement: {
      title: achievement.name,
      iconName: achievement.iconName,
      iconClass: achievement.iconClass
    }
  };
  
  setMessages(prev => [...prev, message]);
  setPoints(prev => {
    const newPoints = prev + achievement.points;
    savePointsToDatabase(newPoints);
    return newPoints;
  });
  toast.success(`Achievement Unlocked: ${achievement.name}!`);
};

const showQuickReplies = (
  options: any[],
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  handleQuickReply: (value: string, label: string, option?: any) => void
) => {
  // Clear any existing quick replies first
  setMessages(prev => prev.filter(m => m.type !== 'system' || !m.id.startsWith('quick-replies-')));
  
  // Store options for later point processing
  const optionsMap = new Map(options.map(opt => [opt.value, opt]));
  
  // Add new quick replies
  setMessages(prev => [...prev, {
    id: 'quick-replies-' + Date.now(),
    type: 'system',
    content: JSON.stringify({ type: 'quick_replies', options }),
    timestamp: new Date()
  }]);
};

const handleQuickReply = (
  value: string, 
  label: string, 
  option: any | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  addUserMessage: (content: string) => Promise<void>,
  processUserResponse: (value: string) => void
) => {
  // Clear quick replies immediately to prevent multiple clicks
  setMessages(prev => prev.filter(m => m.type !== 'system' || !m.id.startsWith('quick-replies-')));
  
  addUserMessage(label);
  
  // Only award points through achievements, not quick replies
  processUserResponse(value);
};

const handleTextInput = (
  message: string,
  addUserMessage: (content: string) => Promise<void>,
  processUserResponse: (message: string) => void
) => {
  addUserMessage(message);
  processUserResponse(message);
};

const loadMoreMessages = async (
  loadingHistory: boolean,
  hasMoreMessages: boolean,
  setLoadingHistory: React.Dispatch<React.SetStateAction<boolean>>,
  messages: Message[],
  employeeId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setHasMoreMessages: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (loadingHistory || !hasMoreMessages) return;
  
  setLoadingHistory(true);
  try {
    const currentCount = messages.length;
    const { messages: olderMessages, hasMore } = await ChatMessageService.getAllMessages(
      employeeId,
      currentCount,
      20
    );
    
    if (olderMessages.length > 0) {
      const formattedMessages: Message[] = olderMessages.map(msg => ({
        id: msg.id || crypto.randomUUID(),
        type: msg.message_type as Message['type'],
        content: msg.content,
        timestamp: new Date(msg.created_at || Date.now()),
        metadata: msg.metadata
      }));
      
      setMessages(prev => [...formattedMessages, ...prev]);
      setHasMoreMessages(hasMore);
    }
  } catch (error) {
    console.error('Error loading more messages:', error);
  } finally {
    setLoadingHistory(false);
  }
};

// Interface for MessageHandlers context
export interface MessageHandlersContext {
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  savePointsToDatabase: (points: number) => void;
  userId: string;
  employeeId: string;
  currentStepRef: React.MutableRefObject<number>;
  lastResponseTime: Date | null;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  setLastResponseTime: React.Dispatch<React.SetStateAction<Date | null>>;
  messages: Message[];
  loadingHistory: boolean;
  hasMoreMessages: boolean;
  setLoadingHistory: React.Dispatch<React.SetStateAction<boolean>>;
  setHasMoreMessages: React.Dispatch<React.SetStateAction<boolean>>;
}

// MessageHandlers class
export class MessageHandlers {
  private context: MessageHandlersContext;

  constructor(context: MessageHandlersContext) {
    this.context = context;
  }

  addBotMessage = (content: string | React.ReactNode, points = 0, delay = 1000) => {
    this.context.setIsTyping(true);
    
    setTimeout(async () => {
      const message: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
        ...(points > 0 && { points }) // Only include points if greater than 0
      };
      
      this.context.setMessages(prev => [...prev, message]);
      if (points > 0) {
        this.context.setPoints(prev => {
          const newPoints = prev + points;
          // Save points to database
          this.context.savePointsToDatabase(newPoints);
          return newPoints;
        });
      }
      this.context.setIsTyping(false);
      
      // Auto-save message if it's a string
      if (this.context.userId && typeof content === 'string') {
        try {
          await ChatMessageService.saveMessage({
            employee_id: this.context.employeeId,
            user_id: this.context.userId,
            message_type: 'bot',
            content,
            metadata: { points },
            step: this.context.currentStepRef.current
          });
        } catch (error) {
          console.error('Failed to save bot message:', error);
        }
      }
    }, delay);
  };

  addUserMessage = async (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    this.context.setMessages(prev => [...prev, message]);
    
    // Update streak for quick responses
    if (this.context.lastResponseTime && (Date.now() - this.context.lastResponseTime.getTime()) < 5000) {
      this.context.setStreak(prev => {
        const newStreak = prev + 1;
        // Save streak to database
        supabase
          .from('employees')
          .update({ profile_builder_streak: newStreak })
          .eq('id', this.context.employeeId)
          .then(() => {})
          .catch(err => console.error('Failed to save streak:', err));
        
        if (newStreak > 2) {
          this.addAchievement(ACHIEVEMENTS.SPEED_DEMON);
        }
        return newStreak;
      });
    }
    this.context.setLastResponseTime(new Date());
    
    // Auto-save message
    if (this.context.userId) {
      try {
        await ChatMessageService.saveMessage({
          employee_id: this.context.employeeId,
          user_id: this.context.userId,
          message_type: 'user',
          content,
          step: this.context.currentStepRef.current
        });
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }
  };

  addAchievement = (achievement: typeof ACHIEVEMENTS.QUICK_START) => {
    const message: Message = {
      id: Date.now().toString(),
      type: 'achievement',
      content: '',
      timestamp: new Date(),
      points: achievement.points,
      achievement: {
        title: achievement.name,
        iconName: achievement.iconName,
        iconClass: achievement.iconClass
      }
    };
    
    this.context.setMessages(prev => [...prev, message]);
    this.context.setPoints(prev => {
      const newPoints = prev + achievement.points;
      this.context.savePointsToDatabase(newPoints);
      return newPoints;
    });
    toast.success(`Achievement Unlocked: ${achievement.name}!`);
  };

  showQuickReplies = (options: any[], handleQuickReply: (value: string, label: string, option?: any) => void) => {
    // Clear any existing quick replies first
    this.context.setMessages(prev => prev.filter(m => m.type !== 'system' || !m.id.startsWith('quick-replies-')));
    
    // Store options for later point processing
    const optionsMap = new Map(options.map(opt => [opt.value, opt]));
    
    // Add new quick replies
    this.context.setMessages(prev => [...prev, {
      id: 'quick-replies-' + Date.now(),
      type: 'system',
      content: JSON.stringify({ type: 'quick_replies', options }),
      timestamp: new Date()
    }]);
  };

  handleQuickReply = (
    value: string, 
    label: string, 
    option: any | undefined,
    processUserResponse: (value: string) => void
  ) => {
    // Clear quick replies immediately to prevent multiple clicks
    this.context.setMessages(prev => prev.filter(m => m.type !== 'system' || !m.id.startsWith('quick-replies-')));
    
    this.addUserMessage(label);
    
    // Only award points through achievements, not quick replies
    processUserResponse(value);
  };

  handleTextInput = (message: string, processUserResponse: (message: string) => void) => {
    this.addUserMessage(message);
    processUserResponse(message);
  };

  loadMoreMessages = async () => {
    if (this.context.loadingHistory || !this.context.hasMoreMessages) return;
    
    this.context.setLoadingHistory(true);
    try {
      const currentCount = this.context.messages.length;
      const { messages: olderMessages, hasMore } = await ChatMessageService.getAllMessages(
        this.context.employeeId,
        currentCount,
        20
      );
      
      if (olderMessages.length > 0) {
        const formattedMessages: Message[] = olderMessages.map(msg => ({
          id: msg.id || crypto.randomUUID(),
          type: msg.message_type as Message['type'],
          content: msg.content,
          timestamp: new Date(msg.created_at || Date.now()),
          metadata: msg.metadata
        }));
        
        this.context.setMessages(prev => [...formattedMessages, ...prev]);
        this.context.setHasMoreMessages(hasMore);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      this.context.setLoadingHistory(false);
    }
  };
}

// Export legacy functions for backward compatibility
export {
  addBotMessage,
  addUserMessage,
  addAchievement,
  showQuickReplies,
  handleQuickReply,
  handleTextInput,
  loadMoreMessages,
  ACHIEVEMENTS,
  type Message
};