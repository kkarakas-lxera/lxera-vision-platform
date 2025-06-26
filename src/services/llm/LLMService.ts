import { supabase } from '@/integrations/supabase/client';

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface CVAnalysisResult {
  personalInfo: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  professionalSummary?: string;
  workExperience: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description: string;
    achievements?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationDate?: string;
    gpa?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    date?: string;
    id?: string;
  }>;
  technicalSkills: Array<{
    category: string;
    skills: string[];
  }>;
  softSkills: string[];
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    role?: string;
  }>;
}

export interface PositionMatchAnalysis {
  overallScore: number;
  matchedSkills: Array<{
    skillName: string;
    matchType: 'exact' | 'similar' | 'related';
    confidence: number;
  }>;
  missingSkills: Array<{
    skillName: string;
    importance: 'critical' | 'important' | 'nice-to-have';
  }>;
  recommendations: string[];
  potentialGrowthAreas: string[];
}

export interface PositionSuggestion {
  positionId: string;
  positionTitle: string;
  positionCode: string;
  matchScore: number;
  confidence: number;
  reasoning: string;
  strengthAreas: string[];
  gapAreas: string[];
}

class LLMService {
  private apiKey: string | null = null;
  private baseURL = 'https://api.openai.com/v1';
  private defaultModel = 'gpt-4-turbo-preview';

  constructor() {
    // Initialize with API key from environment or fetch from secure storage
    this.apiKey = process.env.OPENAI_API_KEY || null;
  }

  /**
   * Initialize the service with API credentials
   */
  async initialize(): Promise<void> {
    if (!this.apiKey) {
      // Use environment variable for API key
      const apiKey = process.env.OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
      if (apiKey) {
        this.apiKey = apiKey;
      } else {
        console.warn('OpenAI API key not found in environment variables');
      }
    }
  }

  /**
   * Analyze a CV and extract structured information
   */
  async analyzeCV(
    cvText: string,
    config?: LLMConfig
  ): Promise<CVAnalysisResult> {
    const template = await this.getAnalysisTemplate('cv_analysis');
    
    const systemPrompt = config?.systemPrompt || template?.system_prompt || 
      'You are an expert HR analyst specializing in technical skill assessment and CV analysis.';
    
    const prompt = template?.prompt_template || this.getDefaultCVAnalysisPrompt();
    
    const response = await this.callLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${prompt}\n\nCV Content:\n${cvText}` }
      ],
      model: config?.model || this.defaultModel,
      temperature: config?.temperature || 0.3,
      max_tokens: config?.maxTokens || 2000,
      response_format: { type: 'json_object' }
    });

    // Track usage metrics
    await this.trackUsage('cv_analysis', response.usage);

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Analyze position match for an employee
   */
  async analyzePositionMatch(
    cvAnalysis: CVAnalysisResult,
    positionRequirements: any
  ): Promise<PositionMatchAnalysis> {
    const prompt = `
      Analyze the match between this candidate profile and the position requirements.
      
      Candidate Profile:
      ${JSON.stringify(cvAnalysis, null, 2)}
      
      Position Requirements:
      ${JSON.stringify(positionRequirements, null, 2)}
      
      Provide a detailed analysis including:
      1. Overall match score (0-100)
      2. Matched skills with confidence levels
      3. Missing critical skills
      4. Recommendations for the candidate
      5. Potential growth areas
      
      Format as JSON.
    `;

    const response = await this.callLLM({
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert talent analyst specializing in skills gap analysis and career development.' 
        },
        { role: 'user', content: prompt }
      ],
      model: this.defaultModel,
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    await this.trackUsage('position_match_analysis', response.usage);

    return JSON.parse(response.choices[0].message.content);
  }

  /**
   * Suggest best matching positions for a candidate
   */
  async suggestPositions(
    cvAnalysis: CVAnalysisResult,
    availablePositions: any[],
    maxSuggestions: number = 3
  ): Promise<PositionSuggestion[]> {
    const prompt = `
      Based on this candidate's profile, suggest the ${maxSuggestions} best matching positions from the available options.
      
      Candidate Profile:
      ${JSON.stringify(cvAnalysis, null, 2)}
      
      Available Positions:
      ${JSON.stringify(availablePositions, null, 2)}
      
      For each suggestion provide:
      1. Position details (ID, title, code)
      2. Match score (0-100)
      3. Confidence level (0-1)
      4. Reasoning for the match
      5. Strength areas where candidate excels
      6. Gap areas that need development
      
      Return as a JSON array sorted by match score.
    `;

    const response = await this.callLLM({
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert career advisor and talent matching specialist.' 
        },
        { role: 'user', content: prompt }
      ],
      model: this.defaultModel,
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    await this.trackUsage('position_suggestions', response.usage);

    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions || result;
  }

  /**
   * Extract skills from text using LLM
   */
  async extractSkills(
    text: string,
    context?: string
  ): Promise<Array<{ skill: string; category: string; confidence: number }>> {
    const prompt = `
      Extract all professional skills from the following text.
      ${context ? `Context: ${context}` : ''}
      
      Text:
      ${text}
      
      For each skill provide:
      1. Skill name
      2. Category (technical, soft, tool, language, etc.)
      3. Confidence score (0-1)
      
      Return as a JSON array.
    `;

    const response = await this.callLLM({
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at identifying and categorizing professional skills.' 
        },
        { role: 'user', content: prompt }
      ],
      model: this.defaultModel,
      temperature: 0.2,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    await this.trackUsage('skills_extraction', response.usage);

    const result = JSON.parse(response.choices[0].message.content);
    return result.skills || result;
  }

  /**
   * Private method to call OpenAI API
   */
  private async callLLM(params: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('LLM Service not initialized with API key');
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`LLM API Error: ${error.error?.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Get analysis template from database
   */
  private async getAnalysisTemplate(templateType: string): Promise<any> {
    const { data } = await supabase
      .from('st_analysis_templates')
      .select('*')
      .eq('template_type', templateType)
      .eq('is_active', true)
      .single();
    
    return data;
  }

  /**
   * Track LLM usage metrics
   */
  private async trackUsage(serviceType: string, usage: any): Promise<void> {
    try {
      const costEstimate = this.calculateCost(usage);
      
      await supabase
        .from('st_llm_usage_metrics')
        .insert({
          service_type: serviceType,
          model_used: this.defaultModel,
          input_tokens: usage.prompt_tokens,
          output_tokens: usage.completion_tokens,
          cost_estimate: costEstimate,
          success: true
        });
    } catch (error) {
      console.error('Failed to track LLM usage:', error);
    }
  }

  /**
   * Calculate estimated cost based on token usage
   */
  private calculateCost(usage: any): number {
    // GPT-4 Turbo pricing (as of 2024)
    const inputCostPer1k = 0.01;
    const outputCostPer1k = 0.03;
    
    const inputCost = (usage.prompt_tokens / 1000) * inputCostPer1k;
    const outputCost = (usage.completion_tokens / 1000) * outputCostPer1k;
    
    return inputCost + outputCost;
  }

  /**
   * Default CV analysis prompt
   */
  private getDefaultCVAnalysisPrompt(): string {
    return `
      Analyze this CV and extract the following information:
      1. Personal Information (name, contact details)
      2. Professional Summary
      3. Work Experience (with dates and descriptions)
      4. Education and Certifications
      5. Technical Skills (programming languages, tools, frameworks)
      6. Soft Skills
      7. Languages
      8. Notable Projects or Achievements
      
      Format the response as a structured JSON object matching the CVAnalysisResult interface.
    `;
  }
}

// Export singleton instance
export const llmService = new LLMService();