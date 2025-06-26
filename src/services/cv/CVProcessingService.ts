import { supabase } from '@/integrations/supabase/client';
import { llmService, CVAnalysisResult, PositionSuggestion } from '../llm/LLMService';

export interface CVProcessingOptions {
  priority?: number;
  activePositionId?: string;
  batchSize?: number;
  maxRetries?: number;
}

export interface ProcessingStatus {
  queueId: string;
  sessionItemId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  error?: string;
}

export interface BulkProcessingResult {
  sessionId: string;
  totalQueued: number;
  processed: number;
  successful: number;
  failed: number;
  averageProcessingTime?: number;
}

class CVProcessingService {
  private processorId: string;
  private isProcessing: boolean = false;
  private abortController: AbortController | null = null;

  constructor() {
    this.processorId = `processor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Queue CVs for bulk processing
   */
  async queueBulkCVs(
    importSessionId: string,
    sessionItems: Array<{ id: string; cv_file_path: string }>,
    options: CVProcessingOptions = {}
  ): Promise<number> {
    const { priority = 5, maxRetries = 3 } = options;
    
    const queueItems = sessionItems.map(item => ({
      import_session_id: importSessionId,
      session_item_id: item.id,
      cv_file_path: item.cv_file_path,
      priority,
      max_retries: maxRetries,
      status: 'pending'
    }));

    const { data, error } = await supabase
      .from('st_cv_processing_queue')
      .insert(queueItems)
      .select();

    if (error) {
      console.error('Failed to queue CVs:', error);
      throw new Error(`Failed to queue CVs: ${error.message}`);
    }

    return data?.length || 0;
  }

  /**
   * Process CVs from the queue
   */
  async processQueue(
    options: { 
      batchSize?: number; 
      onProgress?: (status: ProcessingStatus) => void;
      signal?: AbortSignal;
    } = {}
  ): Promise<BulkProcessingResult> {
    const { batchSize = 5, onProgress, signal } = options;
    
    if (this.isProcessing) {
      throw new Error('Processing already in progress');
    }

    this.isProcessing = true;
    this.abortController = new AbortController();
    
    // Link the external abort signal if provided
    if (signal) {
      signal.addEventListener('abort', () => this.abortController?.abort());
    }

    const result: BulkProcessingResult = {
      sessionId: '',
      totalQueued: 0,
      processed: 0,
      successful: 0,
      failed: 0
    };

    try {
      while (!this.abortController.signal.aborted) {
        // Get next batch of CVs to process
        const batch = await this.getNextBatch(batchSize);
        
        if (batch.length === 0) {
          break; // No more items to process
        }

        // Process batch in parallel
        const processingPromises = batch.map(item => 
          this.processSingleCV(item, onProgress)
        );

        const results = await Promise.allSettled(processingPromises);
        
        // Update statistics
        results.forEach(promiseResult => {
          if (promiseResult.status === 'fulfilled' && promiseResult.value) {
            if (promiseResult.value.success) {
              result.successful++;
            } else {
              result.failed++;
            }
          } else {
            result.failed++;
          }
          result.processed++;
        });

        // Update session if we have one
        if (batch[0]?.import_session_id && !result.sessionId) {
          result.sessionId = batch[0].import_session_id;
        }
      }

      return result;
    } finally {
      this.isProcessing = false;
      this.abortController = null;
    }
  }

  /**
   * Get next batch of CVs from queue
   */
  private async getNextBatch(batchSize: number): Promise<any[]> {
    const batch = [];
    
    for (let i = 0; i < batchSize; i++) {
      const { data } = await supabase
        .rpc('get_next_cv_for_processing', {
          p_processor_id: this.processorId
        });
      
      if (data && data.length > 0) {
        batch.push(data[0]);
      }
    }
    
    return batch;
  }

  /**
   * Process a single CV
   */
  private async processSingleCV(
    queueItem: any,
    onProgress?: (status: ProcessingStatus) => void
  ): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Update progress
      onProgress?.({
        queueId: queueItem.queue_id,
        sessionItemId: queueItem.session_item_id,
        status: 'processing',
        progress: 10
      });

      // Get session item details
      const { data: sessionItem, error: itemError } = await supabase
        .from('st_import_session_items')
        .select(`
          *,
          st_import_sessions!inner(
            active_position_id,
            analysis_config
          )
        `)
        .eq('id', queueItem.session_item_id)
        .single();

      if (itemError || !sessionItem) {
        throw new Error('Failed to fetch session item');
      }

      onProgress?.({
        queueId: queueItem.queue_id,
        sessionItemId: queueItem.session_item_id,
        status: 'processing',
        progress: 20
      });

      // Determine the source and prepare the file path
      const { source, filePath } = this.parseFilePath(queueItem.cv_file_path);
      
      // Call the CV analysis edge function
      const { data: analysisResult, error: analysisError } = await supabase.functions
        .invoke('analyze-cv-enhanced', {
          body: {
            employee_id: sessionItem.employee_id,
            file_path: filePath,
            source: source,
            session_item_id: queueItem.session_item_id,
            use_template: true
          }
        });

      if (analysisError) {
        throw analysisError;
      }

      onProgress?.({
        queueId: queueItem.queue_id,
        sessionItemId: queueItem.session_item_id,
        status: 'processing',
        progress: 60
      });

      // Get CV analysis results
      const { data: cvProfile } = await supabase
        .from('st_employee_skills_profile')
        .select('*')
        .eq('employee_id', sessionItem.employee_id)
        .single();

      if (cvProfile) {
        // Perform position matching if active position is set
        const activePositionId = sessionItem.st_import_sessions?.active_position_id;
        
        if (activePositionId) {
          const { data: position } = await supabase
            .from('st_company_positions')
            .select('*')
            .eq('id', activePositionId)
            .single();

          if (position) {
            // Calculate position match
            const matchAnalysis = await llmService.analyzePositionMatch(
              this.convertToLLMFormat(cvProfile),
              position
            );

            // Update session item with analysis results
            await supabase
              .from('st_import_session_items')
              .update({
                cv_analysis_result: cvProfile.extracted_skills,
                confidence_score: matchAnalysis.overallScore / 100,
                position_match_analysis: matchAnalysis,
                analysis_completed_at: new Date().toISOString(),
                status: 'completed'
              })
              .eq('id', queueItem.session_item_id);
          }
        } else {
          // No active position, just update with CV analysis
          await supabase
            .from('st_import_session_items')
            .update({
              cv_analysis_result: cvProfile.extracted_skills,
              analysis_completed_at: new Date().toISOString(),
              status: 'completed'
            })
            .eq('id', queueItem.session_item_id);
        }

        // Get position suggestions
        const suggestions = await this.suggestPositions(
          sessionItem.employee_id,
          cvProfile
        );

        if (suggestions.length > 0) {
          await supabase
            .from('st_import_session_items')
            .update({
              suggested_positions: suggestions
            })
            .eq('id', queueItem.session_item_id);
        }
      }

      onProgress?.({
        queueId: queueItem.queue_id,
        sessionItemId: queueItem.session_item_id,
        status: 'processing',
        progress: 90
      });

      // Mark as completed in queue
      await supabase
        .from('st_cv_processing_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', queueItem.queue_id);

      // Track processing time
      const processingTime = Date.now() - startTime;
      
      onProgress?.({
        queueId: queueItem.queue_id,
        sessionItemId: queueItem.session_item_id,
        status: 'completed',
        progress: 100
      });

      return { success: true };

    } catch (error: any) {
      console.error('CV processing error:', error);
      
      // Update queue status
      await supabase
        .from('st_cv_processing_queue')
        .update({
          status: 'failed',
          error_details: { 
            message: error.message,
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', queueItem.queue_id);

      // Update session item
      await supabase
        .from('st_import_session_items')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', queueItem.session_item_id);

      onProgress?.({
        queueId: queueItem.queue_id,
        sessionItemId: queueItem.session_item_id,
        status: 'failed',
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Suggest positions for an employee based on CV analysis
   */
  private async suggestPositions(
    employeeId: string,
    cvProfile: any
  ): Promise<PositionSuggestion[]> {
    // Get company positions
    const { data: employee } = await supabase
      .from('employees')
      .select('company_id')
      .eq('id', employeeId)
      .single();

    if (!employee) return [];

    const { data: positions } = await supabase
      .from('st_company_positions')
      .select('*')
      .eq('company_id', employee.company_id);

    if (!positions || positions.length === 0) return [];

    // Use LLM to suggest best matches
    const cvAnalysis = this.convertToLLMFormat(cvProfile);
    const suggestions = await llmService.suggestPositions(
      cvAnalysis,
      positions,
      3
    );

    // Cache suggestions for future use
    for (const suggestion of suggestions) {
      await supabase
        .from('st_position_mapping_suggestions')
        .upsert({
          company_id: employee.company_id,
          source_text: cvProfile.cv_summary || '',
          suggested_position_id: suggestion.positionId,
          confidence_score: suggestion.confidence,
          reasoning: suggestion.reasoning,
          metadata: {
            employee_id: employeeId,
            strength_areas: suggestion.strengthAreas,
            gap_areas: suggestion.gapAreas
          }
        });
    }

    return suggestions;
  }

  /**
   * Parse file path to determine source and correct path format
   */
  private parseFilePath(filePath: string): { source: string; filePath: string } {
    // Handle database storage format (db:uuid)
    if (filePath.startsWith('db:')) {
      return {
        source: 'database',
        filePath: filePath.substring(3) // Remove 'db:' prefix
      };
    }
    
    // Handle temporary file format (./temp-cv-*.txt)
    if (filePath.startsWith('./temp-cv-')) {
      return {
        source: 'storage',
        filePath: filePath.substring(2) // Remove './' prefix
      };
    }
    
    // Handle standard storage format (cvs/company_id/employee_id/filename)
    // or any other storage path
    return {
      source: 'storage',
      filePath: filePath
    };
  }

  /**
   * Convert database CV profile to LLM format
   */
  private convertToLLMFormat(cvProfile: any): CVAnalysisResult {
    return {
      personalInfo: {
        name: cvProfile.employee_name || 'Unknown',
        email: cvProfile.employee_email,
        phone: cvProfile.employee_phone,
        location: cvProfile.employee_location
      },
      professionalSummary: cvProfile.cv_summary,
      workExperience: cvProfile.work_experience || [],
      education: cvProfile.education || [],
      certifications: cvProfile.certifications || [],
      technicalSkills: cvProfile.technical_skills || [],
      softSkills: cvProfile.soft_skills || [],
      languages: cvProfile.languages || [],
      projects: cvProfile.projects || []
    };
  }

  /**
   * Get queue status for a session
   */
  async getQueueStatus(importSessionId: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const { data } = await supabase
      .from('st_cv_processing_queue')
      .select('status')
      .eq('import_session_id', importSessionId);

    const status = {
      total: data?.length || 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };

    data?.forEach(item => {
      status[item.status as keyof typeof status]++;
    });

    return status;
  }

  /**
   * Cancel processing
   */
  cancelProcessing(): void {
    this.abortController?.abort();
  }

  /**
   * Check if processing is active
   */
  isActive(): boolean {
    return this.isProcessing;
  }
}

// Export singleton instance
export const cvProcessingService = new CVProcessingService();