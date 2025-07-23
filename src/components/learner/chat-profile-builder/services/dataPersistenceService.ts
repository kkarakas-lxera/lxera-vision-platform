import type { Message, FormData } from '../types';
import { ChatMessageService } from '@/services/chatMessageService';
import { EmployeeProfileService } from '@/services/employeeProfileService';
import { supabase } from '@/integrations/supabase/client';
import React from 'react';

export class DataPersistenceService {
  private employeeId: string;
  private userId: string;
  private setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  private setHasMoreMessages: (hasMore: boolean) => void;
  private setCvUploaded: (uploaded: boolean) => void;
  private setNavigationState: React.Dispatch<React.SetStateAction<any>>;
  private setCvState: React.Dispatch<React.SetStateAction<any>>;
  private setLoadingHistory: (loading: boolean) => void;
  private showQuickReplies: (replies: any[]) => void;
  private initializeChat: () => void;
  private handleSectionAccept: (section: string, data: any) => void;
  private handleSectionUpdate: (section: string, data: any) => void;
  private handleAllSectionsComplete: () => void;
  private CVExtractedSections: React.ComponentType<any>;

  constructor(
    employeeId: string,
    userId: string,
    setters: {
      setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
      setHasMoreMessages: (hasMore: boolean) => void;
      setCvUploaded: (uploaded: boolean) => void;
      setNavigationState: React.Dispatch<React.SetStateAction<any>>;
      setCvState: React.Dispatch<React.SetStateAction<any>>;
      setLoadingHistory: (loading: boolean) => void;
    },
    handlers: {
      showQuickReplies: (replies: any[]) => void;
      initializeChat: () => void;
      handleSectionAccept: (section: string, data: any) => void;
      handleSectionUpdate: (section: string, data: any) => void;
      handleAllSectionsComplete: () => void;
    },
    components: {
      CVExtractedSections: React.ComponentType<any>;
    }
  ) {
    this.employeeId = employeeId;
    this.userId = userId;
    this.setMessages = setters.setMessages;
    this.setHasMoreMessages = setters.setHasMoreMessages;
    this.setCvUploaded = setters.setCvUploaded;
    this.setNavigationState = setters.setNavigationState;
    this.setCvState = setters.setCvState;
    this.setLoadingHistory = setters.setLoadingHistory;
    this.showQuickReplies = handlers.showQuickReplies;
    this.initializeChat = handlers.initializeChat;
    this.handleSectionAccept = handlers.handleSectionAccept;
    this.handleSectionUpdate = handlers.handleSectionUpdate;
    this.handleAllSectionsComplete = handlers.handleAllSectionsComplete;
    this.CVExtractedSections = components.CVExtractedSections;
  }

  // Load chat history
  loadChatHistory = async () => {
    try {
      const recentMessages = await ChatMessageService.getRecentMessages(this.employeeId, 10);
      
      if (recentMessages.length > 0) {
        // Check if there are more messages
        const { total } = await ChatMessageService.getAllMessages(this.employeeId, 0, 1);
        console.log('Chat history check:', { 
          recentMessagesLength: recentMessages.length, 
          totalMessages: total, 
          hasMore: total > 10 
        });
        this.setHasMoreMessages(total > 10);
        
        // Check if CV has been uploaded from chat history
        const cvUploadMessage = recentMessages.find(msg => 
          msg.content?.includes('📄 Uploading') || 
          msg.metadata?.componentType === 'CVExtractedSections'
        );
        if (cvUploadMessage) {
          this.setCvUploaded(true);
        }
        
        // Convert saved messages to app format
        const formattedMessages: Message[] = recentMessages.map((msg: { id?: string; message_type: string; content: string; created_at?: string; metadata?: any; step?: string }) => {
          // Handle special system messages that need component restoration
          if (msg.message_type === 'system' && msg.metadata?.componentType === 'CVExtractedSections') {
            return {
              id: msg.id || crypto.randomUUID(),
              type: 'system' as Message['type'],
              content: msg.content || 'CV Sections Display',
              timestamp: new Date(msg.created_at || Date.now()),
              metadata: msg.metadata
            };
          }
          
          return {
            id: msg.id || crypto.randomUUID(),
            type: msg.message_type as Message['type'],
            content: msg.content,
            timestamp: new Date(msg.created_at || Date.now()),
            metadata: msg.metadata
          };
        });
        
        this.setMessages(formattedMessages);
        
        // Resume from last step if available
        const lastStep = recentMessages.reduce((maxStep, msg) => {
          const msgStep = msg.step ? parseInt(msg.step) : 0;
          return msgStep > maxStep ? msgStep : maxStep;
        }, 0);
        
        if (lastStep > 0) {
          // We have existing progress - set the step and load saved state
          this.setNavigationState(prev => ({ 
            ...prev, 
            currentStep: lastStep,
            maxStepReached: Math.max(prev.maxStepReached, lastStep)
          }));
          
          // Important: Don't show any new messages, just restore the step UI
          // The messages are already loaded from history
          return formattedMessages; // Return the messages
        } else {
          // Check if we're at step 0 but have started (e.g., saw the welcome message)
          const hasStarted = recentMessages.some(msg => 
            msg.content?.includes('How does that sound?') ||
            msg.content?.includes("Let's start!")
          );
          
          if (hasStarted) {
            // User has seen welcome but hasn't started step 1 yet
            const lastBotMessage = recentMessages.filter(msg => msg.message_type === 'bot').pop();
            if (lastBotMessage?.content?.includes('How does that sound?')) {
              // Recreate the initial quick replies
              setTimeout(() => {
                this.showQuickReplies([
                  { label: "Let's start! 🚀", value: "start", points: 50, variant: 'primary' },
                  { label: "Tell me more", value: "more_info" },
                  { label: "What rewards?", value: "rewards" }
                ]);
              }, 500);
            }
            return formattedMessages; // Exit early - don't show duplicate welcome
          }
          
          // Check if we're in the middle of CV upload
          const hasUploadMessage = recentMessages.some(msg => 
            msg.content?.includes('Upload CV') || msg.content?.includes('paperclip icon')
          );
          if (hasUploadMessage) {
            this.setCvState(prev => ({ ...prev, waitingForUpload: true }));
            this.setNavigationState(prev => ({ 
              ...prev, 
              currentStep: 1,
              maxStepReached: Math.max(prev.maxStepReached, 1)
            }));
            return formattedMessages; // Exit early
          }
        }
        // Return messages for any other case
        return formattedMessages;
      } else {
        // No history, start fresh
        this.initializeChat();
        return []; // Return empty array
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      this.initializeChat();
      return []; // Return empty array on error
    }
  };

  // Load more messages
  loadMoreMessages = async (messages: Message[], loadingHistory: boolean, hasMoreMessages: boolean) => {
    if (loadingHistory || !hasMoreMessages) return;
    
    this.setLoadingHistory(true);
    try {
      const currentCount = messages.length;
      const { messages: olderMessages, hasMore } = await ChatMessageService.getAllMessages(
        this.employeeId,
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
        
        this.setMessages(prev => [...formattedMessages, ...prev]);
        this.setHasMoreMessages(hasMore);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      this.setLoadingHistory(false);
    }
  };

  // Load employee data
  loadEmployeeData = async () => {
    try {
      console.log('Loading employee data for ID:', this.employeeId);
      
      // First get employee basic info
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', this.employeeId)
        .single();

      if (employeeError) {
        console.error('Employee lookup error:', employeeError);
        throw employeeError;
      }

      if (!employee) {
        throw new Error('Employee not found');
      }

      return employee;
    } catch (error) {
      console.error('Error loading employee data:', error);
      throw error;
    }
  };

  // Save points to database
  savePointsToDatabase = async (points: number) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          profile_builder_points: points,
          last_activity: new Date().toISOString()
        })
        .eq('id', this.employeeId);

      if (error) {
        console.error('Error saving points:', error);
      }
    } catch (error) {
      console.error('Failed to save points to database:', error);
    }
  };

  // Save step data
  saveStepData = async (formData: FormData, currentStep: number, isAutoSave: boolean = false) => {
    try {
      if (!this.userId) return;

      const stepData = {
        step: currentStep,
        data: formData,
        completed_at: new Date().toISOString(),
        auto_save: isAutoSave
      };

      await EmployeeProfileService.saveStepData(this.employeeId, stepData);
      
      if (!isAutoSave) {
        console.log(`Step ${currentStep} data saved successfully`);
      }
    } catch (error) {
      console.error('Error saving step data:', error);
    }
  };

  // Clear profile data
  clearProfileData = async () => {
    try {
      // Clear messages from chat history
      await ChatMessageService.deleteMessages(this.employeeId);
      
      // Clear form data
      this.setMessages([]);
      
      // Reset navigation state
      this.setNavigationState({
        currentStep: 0,
        maxStepReached: 0
      });
      
      // Reset CV state
      this.setCvState({
        cvUploaded: false,
        cvData: null,
        waitingForUpload: false,
        sectionsConfirmed: []
      });
      
      console.log('Profile data cleared successfully');
    } catch (error) {
      console.error('Error clearing profile data:', error);
    }
  };
}