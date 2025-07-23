import React from 'react';
import type { Message } from '../types';
import type { EmployeeUpdateExtra } from '@/types/dbTypes';
import { ChatMessageService } from '@/services/chatMessageService';
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS } from '../constants';

export class MessageManager {
  private setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  private setIsTyping: (typing: boolean) => void;
  private setPoints: React.Dispatch<React.SetStateAction<number>>;
  private setStreak: React.Dispatch<React.SetStateAction<number>>;
  private setLastResponseTime: React.Dispatch<React.SetStateAction<Date | null>>;
  private employeeId: string;
  private userId: string;
  private currentStepRef: React.MutableRefObject<number>;
  private lastResponseTime: Date | null;
  private savePointsToDatabase: (points: number) => Promise<void>;

  constructor(
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setIsTyping: (typing: boolean) => void,
    setPoints: React.Dispatch<React.SetStateAction<number>>,
    setStreak: React.Dispatch<React.SetStateAction<number>>,
    setLastResponseTime: React.Dispatch<React.SetStateAction<Date | null>>,
    employeeId: string,
    userId: string,
    currentStepRef: React.MutableRefObject<number>,
    lastResponseTime: Date | null,
    savePointsToDatabase: (points: number) => Promise<void>
  ) {
    this.setMessages = setMessages;
    this.setIsTyping = setIsTyping;
    this.setPoints = setPoints;
    this.setStreak = setStreak;
    this.setLastResponseTime = setLastResponseTime;
    this.employeeId = employeeId;
    this.userId = userId;
    this.currentStepRef = currentStepRef;
    this.lastResponseTime = lastResponseTime;
    this.savePointsToDatabase = savePointsToDatabase;
  }

  addBotMessage = (content: string | React.ReactNode, points = 0, delay = 1000) => {
    this.setIsTyping(true);
    
    setTimeout(async () => {
      const message: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content,
        timestamp: new Date(),
        ...(points > 0 && { points }) // Only include points if greater than 0
      };
      
      this.setMessages(prev => [...prev, message]);
      if (points > 0) {
        this.setPoints(prev => {
          const newPoints = prev + points;
          // Save points to database
          this.savePointsToDatabase(newPoints);
          return newPoints;
        });
      }
      this.setIsTyping(false);
      
      // Auto-save message if it's a string
      if (this.userId && typeof content === 'string') {
        try {
          await ChatMessageService.saveMessage({
            employee_id: this.employeeId,
            user_id: this.userId,
            message_type: 'bot',
            content,
            step: String(this.currentStepRef.current)
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
    
    this.setMessages(prev => [...prev, message]);
    
    // Update streak for quick responses
    if (this.lastResponseTime && (Date.now() - this.lastResponseTime.getTime()) < 5000) {
      this.setStreak(prev => {
        const newStreak = prev + 1;
        // Save streak to database
        supabase
          .from('employees')
          .update({ 
            profile_builder_streak: newStreak 
          } as EmployeeUpdateExtra)
          .eq('id', this.employeeId)
          .then(() => {})
          .catch(err => console.error('Failed to save streak:', err));
        
        if (newStreak > 2) {
          this.addAchievement(ACHIEVEMENTS.SPEED_DEMON);
        }
        return newStreak;
      });
    }
    this.setLastResponseTime(new Date());
    
    // Auto-save message
    if (this.userId) {
      try {
        await ChatMessageService.saveMessage({
          employee_id: this.employeeId,
          user_id: this.userId,
          message_type: 'user',
          content,
          step: String(this.currentStepRef.current)
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
        icon: achievement.icon
      }
    };
    
    this.setMessages(prev => [...prev, message]);
    this.setPoints(prev => {
      const newPoints = prev + achievement.points;
      this.savePointsToDatabase(newPoints);
      return newPoints;
    });
  };

  showQuickReplies = (replies: Array<{ label: string; value: string }>) => {
    // Store the replies data to be rendered by the component
    const quickReplyMessage: Message = {
      id: 'quick-replies-' + Date.now(),
      type: 'quick_replies',
      content: JSON.stringify(replies), // Store as string, component will parse and render
      timestamp: new Date(),
      metadata: { replies }
    };
    
    this.setMessages(prev => [...prev, quickReplyMessage]);
  };

  private handleQuickReply = (value: string) => {
    // This would need to be connected to the main response handler
    // Will be implemented when integrating with main component
  };
}