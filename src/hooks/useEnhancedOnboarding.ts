import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cvProcessingService } from '@/services/cv/CVProcessingService';
import { positionMappingService } from '@/services/position/PositionMappingService';
import { llmService } from '@/services/llm/LLMService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import type { 
  EnhancedImportSession,
  BulkProcessingProgress,
  QueueStatusResponse,
  PositionMappingSuggestion
} from '@/types/enhanced-onboarding';

export function useEnhancedOnboarding() {
  const { userProfile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<BulkProcessingProgress | null>(null);

  /**
   * Initialize LLM service
   */
  const initializeLLM = useCallback(async () => {
    try {
      await llmService.initialize();
    } catch (error) {
      console.error('Failed to initialize LLM service:', error);
      toast({
        title: 'Warning',
        description: 'AI services may be limited. Some features might not work.',
        variant: 'destructive'
      });
    }
  }, []);

  /**
   * Create a new import session with position context
   */
  const createImportSession = useCallback(async (
    importType: string,
    activePositionId?: string,
    analysisConfig?: Record<string, any>
  ): Promise<EnhancedImportSession | null> => {
    if (!userProfile?.company_id) return null;

    try {
      const { data, error } = await supabase
        .from('st_import_sessions')
        .insert({
          company_id: userProfile.company_id,
          import_type: importType,
          total_employees: 0,
          processed: 0,
          successful: 0,
          failed: 0,
          status: 'pending',
          created_by: userProfile.id,
          active_position_id: activePositionId,
          analysis_config: analysisConfig || {},
          session_metadata: {
            created_from: 'enhanced_onboarding',
            version: '2.0'
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create import session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create import session',
        variant: 'destructive'
      });
      return null;
    }
  }, [userProfile]);

  /**
   * Queue CVs for bulk processing
   */
  const queueCVsForProcessing = useCallback(async (
    sessionId: string,
    cvFiles: Array<{ itemId: string; filePath: string }>,
    options?: { priority?: number }
  ): Promise<number> => {
    try {
      const queued = await cvProcessingService.queueBulkCVs(
        sessionId,
        cvFiles.map(f => ({ id: f.itemId, cv_file_path: f.filePath })),
        options
      );

      toast({
        title: 'CVs Queued',
        description: `${queued} CVs queued for processing`
      });

      return queued;
    } catch (error) {
      console.error('Failed to queue CVs:', error);
      toast({
        title: 'Error',
        description: 'Failed to queue CVs for processing',
        variant: 'destructive'
      });
      return 0;
    }
  }, []);

  /**
   * Start processing queued CVs
   */
  const startProcessing = useCallback(async (
    onProgress?: (progress: BulkProcessingProgress) => void
  ) => {
    if (isProcessing) {
      toast({
        title: 'Already Processing',
        description: 'CV processing is already in progress',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await cvProcessingService.processQueue({
        batchSize: 3,
        onProgress: (status) => {
          const progress: BulkProcessingProgress = {
            sessionId: processingProgress?.sessionId || '',
            totalQueued: processingProgress?.totalQueued || 0,
            processed: (processingProgress?.processed || 0) + (status.status === 'completed' ? 1 : 0),
            successful: (processingProgress?.successful || 0) + (status.status === 'completed' ? 1 : 0),
            failed: (processingProgress?.failed || 0) + (status.status === 'failed' ? 1 : 0),
            currentItem: {
              itemId: status.sessionItemId,
              status: status.status,
              progress: status.progress || 0
            }
          };
          
          setProcessingProgress(progress);
          onProgress?.(progress);
        }
      });

      toast({
        title: 'Processing Complete',
        description: `Processed ${result.processed} CVs. ${result.successful} successful, ${result.failed} failed.`
      });

    } catch (error) {
      console.error('Processing failed:', error);
      toast({
        title: 'Processing Error',
        description: 'An error occurred during CV processing',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
    }
  }, [isProcessing, processingProgress]);

  /**
   * Stop processing
   */
  const stopProcessing = useCallback(() => {
    cvProcessingService.cancelProcessing();
    setIsProcessing(false);
    toast({
      title: 'Processing Stopped',
      description: 'CV processing has been cancelled'
    });
  }, []);

  /**
   * Get queue status for a session
   */
  const getQueueStatus = useCallback(async (
    sessionId: string
  ): Promise<QueueStatusResponse | null> => {
    try {
      return await cvProcessingService.getQueueStatus(sessionId);
    } catch (error) {
      console.error('Failed to get queue status:', error);
      return null;
    }
  }, []);

  /**
   * Suggest positions based on text input
   */
  const suggestPositions = useCallback(async (
    inputText: string,
    options?: { maxSuggestions?: number }
  ): Promise<PositionMappingSuggestion[]> => {
    if (!userProfile?.company_id) return [];

    try {
      const mappings = await positionMappingService.suggestPositions(
        userProfile.company_id,
        inputText,
        options
      );

      return mappings.map(m => ({
        id: crypto.randomUUID(),
        company_id: userProfile.company_id,
        source_text: m.sourceText,
        suggested_position_id: m.suggestedPositionId,
        confidence_score: m.confidence,
        reasoning: m.reasoning,
        metadata: {
          position_title: m.positionTitle,
          position_code: m.positionCode,
          from_cache: m.isFromCache
        },
        created_at: new Date().toISOString(),
        last_used_at: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to suggest positions:', error);
      return [];
    }
  }, [userProfile]);

  /**
   * Validate position mapping
   */
  const validatePositionMapping = useCallback(async (
    inputText: string,
    positionCode?: string
  ) => {
    if (!userProfile?.company_id) return null;

    try {
      return await positionMappingService.mapPositionWithValidation(
        userProfile.company_id,
        inputText,
        positionCode
      );
    } catch (error) {
      console.error('Failed to validate position:', error);
      return null;
    }
  }, [userProfile]);

  /**
   * Get import session analytics
   */
  const getSessionAnalytics = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('v_import_session_analytics')
        .select('*')
        .eq('import_session_id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to get session analytics:', error);
      return null;
    }
  }, []);

  /**
   * Get LLM usage metrics
   */
  const getUsageMetrics = useCallback(async (
    dateRange?: { start: Date; end: Date }
  ) => {
    if (!userProfile?.company_id) return null;

    try {
      let query = supabase
        .from('st_llm_usage_metrics')
        .select('*')
        .eq('company_id', userProfile.company_id)
        .order('created_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate totals
      const totals = data.reduce((acc, metric) => ({
        totalTokens: acc.totalTokens + metric.total_tokens,
        totalCost: acc.totalCost + (metric.cost_estimate || 0),
        totalCalls: acc.totalCalls + 1,
        byService: {
          ...acc.byService,
          [metric.service_type]: (acc.byService[metric.service_type] || 0) + 1
        }
      }), { totalTokens: 0, totalCost: 0, totalCalls: 0, byService: {} });

      return { metrics: data, totals };
    } catch (error) {
      console.error('Failed to get usage metrics:', error);
      return null;
    }
  }, [userProfile]);

  return {
    // State
    isProcessing,
    processingProgress,
    
    // Methods
    initializeLLM,
    createImportSession,
    queueCVsForProcessing,
    startProcessing,
    stopProcessing,
    getQueueStatus,
    suggestPositions,
    validatePositionMapping,
    getSessionAnalytics,
    getUsageMetrics
  };
}