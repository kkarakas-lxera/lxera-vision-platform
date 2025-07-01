
import { supabase } from '@/integrations/supabase/client';

export interface CVAnalysisResult {
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  professionalSummary: string;
  workExperience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate?: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications: string[];
  technicalSkills: string[];
  softSkills: string[];
  languages: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export interface PositionMatchAnalysis {
  overallScore: number;
  skillsMatch: {
    matched: string[];
    missing: string[];
    additional: string[];
  };
  experienceMatch: number;
  recommendations: string[];
}

export interface PositionSuggestion {
  positionId: string;
  positionTitle: string;
  confidence: number;
  reasoning: string;
  strengthAreas: string[];
  gapAreas: string[];
}

class LLMService {
  private async trackUsage(
    serviceType: string,
    modelUsed: string,
    inputTokens: number,
    outputTokens: number,
    companyId: string,
    userId?: string
  ) {
    try {
      const costEstimate = (inputTokens * 0.0015 + outputTokens * 0.002) / 1000;
      
      await supabase
        .from('st_llm_usage_metrics')
        .insert({
          company_id: companyId,
          user_id: userId,
          service_type: serviceType,
          model_used: modelUsed,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens,
          cost_estimate: costEstimate,
          success: true
        });
    } catch (error) {
      console.error('Error tracking LLM usage:', error);
    }
  }

  initialize() {
    // Initialize the LLM service
  }

  async analyzeCV(cvText: string, companyId: string, userId?: string): Promise<CVAnalysisResult> {
    // Mock implementation for now
    const mockResult: CVAnalysisResult = {
      personalInfo: {
        name: 'John Doe',
        email: 'john.doe@email.com'
      },
      professionalSummary: 'Experienced professional with strong technical skills.',
      workExperience: [],
      education: [],
      certifications: [],
      technicalSkills: [],
      softSkills: [],
      languages: [],
      projects: []
    };

    // Track usage
    await this.trackUsage('cv_analysis', 'gpt-4', 1000, 500, companyId, userId);

    return mockResult;
  }

  async analyzePositionMatch(
    cvAnalysis: CVAnalysisResult,
    position: any,
    companyId: string,
    userId?: string
  ): Promise<PositionMatchAnalysis> {
    // Mock implementation for now
    const mockResult: PositionMatchAnalysis = {
      overallScore: 75,
      skillsMatch: {
        matched: [],
        missing: [],
        additional: []
      },
      experienceMatch: 70,
      recommendations: []
    };

    // Track usage
    await this.trackUsage('position_match', 'gpt-4', 800, 400, companyId, userId);

    return mockResult;
  }

  async suggestPositions(
    cvAnalysis: CVAnalysisResult,
    availablePositions: any[],
    maxSuggestions: number,
    companyId: string,
    userId?: string
  ): Promise<PositionSuggestion[]> {
    // Mock implementation for now
    const mockSuggestions: PositionSuggestion[] = [];

    // Track usage
    await this.trackUsage('position_suggestions', 'gpt-4', 1200, 600, companyId, userId);

    return mockSuggestions;
  }
}

export const llmService = new LLMService();
