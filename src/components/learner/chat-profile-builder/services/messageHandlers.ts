import React from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessageService } from '@/services/chatMessageService';
import QuickReplyButtons from '../chat/QuickReplyButtons';
import { Zap, Upload, Clock, Trophy } from 'lucide-react';

interface Message {
  id: string;
  type: 'bot' | 'user' | 'achievement' | 'challenge' | 'system';
  content: string | React.ReactNode;
  timestamp: Date;
  points?: number;
  achievement?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
  };
  metadata?: any;
}

const ACHIEVEMENTS = {
  QUICK_START: { name: "Quick Start", points: 50, icon: <Zap className="h-6 w-6 text-yellow-600" /> },
  CV_UPLOADED: { name: "Document Master", points: 200, icon: <Upload className="h-6 w-6 text-blue-600" /> },
  SPEED_DEMON: { name: "Speed Demon", points: 150, icon: <Clock className="h-6 w-6 text-purple-600" /> },
  COMPLETIONIST: { name: "Profile Hero", points: 500, icon: <Trophy className="h-6 w-6 text-gold-600" /> }
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
      icon: achievement.icon
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
    content: <QuickReplyButtons options={options} onSelect={(value, label) => handleQuickReply(value, label, optionsMap.get(value))} />,
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