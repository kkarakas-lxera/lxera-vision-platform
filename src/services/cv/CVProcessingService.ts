
import { supabase } from '@/integrations/supabase/client';
import { llmService } from '@/services/llm/LLMService';

export class CVProcessingService {
  private companyId: string;

  constructor(companyId: string) {
    this.companyId = companyId;
  }

  async processCV(cvText: string, employeeId: string, userId?: string) {
    try {
      // Analyze CV with proper parameters
      const analysis = await llmService.analyzeCV(cvText, this.companyId, userId);
      
      // Process and store the analysis
      return analysis;
    } catch (error) {
      console.error('Error processing CV:', error);
      throw error;
    }
  }

  async analyzeSkillsGap(cvAnalysis: any, position: any, userId?: string) {
    try {
      // Analyze position match with proper parameters
      const matchAnalysis = await llmService.analyzePositionMatch(
        cvAnalysis,
        position,
        this.companyId,
        userId
      );
      
      return matchAnalysis;
    } catch (error) {
      console.error('Error analyzing skills gap:', error);
      throw error;
    }
  }

  async storeCVData(employeeId: string, fileName: string, fileData: string, fileSize: number) {
    try {
      const { error } = await supabase
        .from('employee_cv_uploads')
        .insert([
          {
            employee_id: employeeId,
            file_name: fileName,
            file_data: fileData,
            file_size: fileSize,
            file_type: 'application/pdf',
            uploaded_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error storing CV data:', error);
        throw error;
      }
    } catch (error: any) {
      console.error('Unexpected error storing CV data:', error);
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }

  async getCVData(employeeId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('employee_cv_uploads')
        .select('*')
        .eq('employee_id', employeeId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching CV data:', error);
        return null;
      }

      return data;
    } catch (error: any) {
      console.error('Unexpected error fetching CV data:', error);
      return null;
    }
  }
}

// Export a default instance factory function
export const createCVProcessingService = (companyId: string) => {
  return new CVProcessingService(companyId);
};
