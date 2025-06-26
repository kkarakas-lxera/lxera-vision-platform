import { supabase } from '@/integrations/supabase/client';
import { llmService } from '../llm/LLMService';

export interface PositionMapping {
  sourceText: string;
  suggestedPositionId: string;
  positionTitle: string;
  positionCode: string;
  confidence: number;
  reasoning: string;
  isFromCache: boolean;
}

export interface MappingOptions {
  useCache?: boolean;
  cacheThreshold?: number;
  maxSuggestions?: number;
  includeReasons?: boolean;
}

class PositionMappingService {
  private cacheExpiryHours = 24 * 7; // 1 week

  /**
   * Get position suggestions based on input text (job title, description, etc.)
   */
  async suggestPositions(
    companyId: string,
    sourceText: string,
    options: MappingOptions = {}
  ): Promise<PositionMapping[]> {
    const { 
      useCache = true, 
      cacheThreshold = 0.8, 
      maxSuggestions = 3,
      includeReasons = true 
    } = options;

    // Check cache first if enabled
    if (useCache) {
      const cachedSuggestions = await this.getCachedSuggestions(
        companyId, 
        sourceText, 
        cacheThreshold
      );
      
      if (cachedSuggestions.length >= maxSuggestions) {
        return cachedSuggestions.slice(0, maxSuggestions);
      }
    }

    // Get company positions
    const { data: positions, error } = await supabase
      .from('st_company_positions')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_template', false);

    if (error || !positions || positions.length === 0) {
      console.error('Failed to fetch positions:', error);
      return [];
    }

    // Use LLM to analyze and suggest positions
    const suggestions = await this.analyzeWithLLM(
      sourceText, 
      positions, 
      maxSuggestions,
      includeReasons
    );

    // Cache the suggestions
    await this.cacheSuggestions(companyId, sourceText, suggestions);

    return suggestions;
  }

  /**
   * Get position suggestions for multiple source texts (batch processing)
   */
  async suggestPositionsBatch(
    companyId: string,
    sourcetexts: string[],
    options: MappingOptions = {}
  ): Promise<Map<string, PositionMapping[]>> {
    const results = new Map<string, PositionMapping[]>();
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < sourcetexts.length; i += batchSize) {
      const batch = sourcetexts.slice(i, i + batchSize);
      
      const batchPromises = batch.map(text => 
        this.suggestPositions(companyId, text, options)
          .then(suggestions => ({ text, suggestions }))
          .catch(error => {
            console.error(`Failed to process: ${text}`, error);
            return { text, suggestions: [] };
          })
      );
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ text, suggestions }) => {
        results.set(text, suggestions);
      });
    }
    
    return results;
  }

  /**
   * Map position from free text input with validation
   */
  async mapPositionWithValidation(
    companyId: string,
    inputText: string,
    existingPositionCode?: string
  ): Promise<{
    isValid: boolean;
    mappedPosition?: PositionMapping;
    suggestions?: PositionMapping[];
    message: string;
  }> {
    // Check if exact position code exists
    if (existingPositionCode) {
      const { data: exactMatch } = await supabase
        .from('st_company_positions')
        .select('id, position_title, position_code')
        .eq('company_id', companyId)
        .eq('position_code', existingPositionCode)
        .single();

      if (exactMatch) {
        return {
          isValid: true,
          mappedPosition: {
            sourceText: inputText,
            suggestedPositionId: exactMatch.id,
            positionTitle: exactMatch.position_title,
            positionCode: exactMatch.position_code,
            confidence: 1.0,
            reasoning: 'Exact position code match',
            isFromCache: false
          },
          message: 'Position code validated successfully'
        };
      }
    }

    // Get suggestions if no exact match
    const suggestions = await this.suggestPositions(companyId, inputText, {
      maxSuggestions: 5,
      includeReasons: true
    });

    if (suggestions.length === 0) {
      return {
        isValid: false,
        suggestions: [],
        message: 'No matching positions found. Please create a new position or check the input.'
      };
    }

    // High confidence match
    if (suggestions[0].confidence >= 0.9) {
      return {
        isValid: true,
        mappedPosition: suggestions[0],
        suggestions: suggestions.slice(1),
        message: `Mapped to "${suggestions[0].positionTitle}" with ${Math.round(suggestions[0].confidence * 100)}% confidence`
      };
    }

    // Medium confidence - need user confirmation
    return {
      isValid: false,
      suggestions,
      message: 'Multiple position matches found. Please select the most appropriate one.'
    };
  }

  /**
   * Analyze with LLM to get position suggestions
   */
  private async analyzeWithLLM(
    sourceText: string,
    positions: any[],
    maxSuggestions: number,
    includeReasons: boolean
  ): Promise<PositionMapping[]> {
    const prompt = `
      Analyze this text and suggest the best matching positions:
      
      Input Text: "${sourceText}"
      
      Available Positions:
      ${positions.map(p => `- ${p.position_code}: ${p.position_title} (${p.department || 'No dept'})`).join('\n')}
      
      Return the top ${maxSuggestions} matches with confidence scores (0-1).
      ${includeReasons ? 'Include reasoning for each match.' : ''}
      
      Consider:
      1. Direct title matches
      2. Similar responsibilities
      3. Department alignment
      4. Skill requirements overlap
      
      Format as JSON array.
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at matching job titles and positions. Provide accurate confidence scores.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        })
      });

      const data = await response.json();
      const results = JSON.parse(data.choices[0].message.content);
      
      return (results.matches || results).map((match: any) => {
        const position = positions.find(p => p.position_code === match.position_code);
        return {
          sourceText,
          suggestedPositionId: position?.id || '',
          positionTitle: position?.position_title || match.position_title,
          positionCode: match.position_code,
          confidence: match.confidence || 0.5,
          reasoning: match.reasoning || '',
          isFromCache: false
        };
      });
    } catch (error) {
      console.error('LLM analysis failed:', error);
      // Fallback to simple text matching
      return this.fallbackMatching(sourceText, positions, maxSuggestions);
    }
  }

  /**
   * Simple fallback matching when LLM is unavailable
   */
  private fallbackMatching(
    sourceText: string,
    positions: any[],
    maxSuggestions: number
  ): PositionMapping[] {
    const searchTerms = sourceText.toLowerCase().split(/\s+/);
    
    const scored = positions.map(position => {
      const positionText = `${position.position_title} ${position.position_code} ${position.department || ''}`.toLowerCase();
      
      let score = 0;
      searchTerms.forEach(term => {
        if (positionText.includes(term)) {
          score += term.length > 3 ? 2 : 1;
        }
      });
      
      // Exact title match bonus
      if (position.position_title.toLowerCase() === sourceText.toLowerCase()) {
        score += 10;
      }
      
      return { position, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions);
    
    return scored.map(({ position, score }) => ({
      sourceText,
      suggestedPositionId: position.id,
      positionTitle: position.position_title,
      positionCode: position.position_code,
      confidence: Math.min(score / 10, 1),
      reasoning: 'Text similarity matching',
      isFromCache: false
    }));
  }

  /**
   * Get cached suggestions
   */
  private async getCachedSuggestions(
    companyId: string,
    sourceText: string,
    confidenceThreshold: number
  ): Promise<PositionMapping[]> {
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - this.cacheExpiryHours);

    const { data } = await supabase
      .from('st_position_mapping_suggestions')
      .select(`
        *,
        st_company_positions!inner(
          position_title,
          position_code
        )
      `)
      .eq('company_id', companyId)
      .eq('source_text', sourceText)
      .gte('confidence_score', confidenceThreshold)
      .gte('created_at', cutoffDate.toISOString())
      .order('confidence_score', { ascending: false });

    if (!data || data.length === 0) return [];

    // Update last used timestamp
    const ids = data.map(d => d.id);
    await supabase
      .from('st_position_mapping_suggestions')
      .update({ last_used_at: new Date().toISOString() })
      .in('id', ids);

    return data.map(item => ({
      sourceText: item.source_text,
      suggestedPositionId: item.suggested_position_id,
      positionTitle: item.st_company_positions.position_title,
      positionCode: item.st_company_positions.position_code,
      confidence: item.confidence_score,
      reasoning: item.reasoning || '',
      isFromCache: true
    }));
  }

  /**
   * Cache suggestions for future use
   */
  private async cacheSuggestions(
    companyId: string,
    sourceText: string,
    suggestions: PositionMapping[]
  ): Promise<void> {
    if (suggestions.length === 0) return;

    const cacheItems = suggestions
      .filter(s => !s.isFromCache && s.confidence >= 0.5)
      .map(s => ({
        company_id: companyId,
        source_text: sourceText,
        suggested_position_id: s.suggestedPositionId,
        confidence_score: s.confidence,
        reasoning: s.reasoning,
        metadata: {
          position_title: s.positionTitle,
          position_code: s.positionCode
        }
      }));

    if (cacheItems.length > 0) {
      await supabase
        .from('st_position_mapping_suggestions')
        .upsert(cacheItems, {
          onConflict: 'company_id,source_text,suggested_position_id'
        });
    }
  }

  /**
   * Clear cache for a company
   */
  async clearCache(companyId: string): Promise<void> {
    await supabase
      .from('st_position_mapping_suggestions')
      .delete()
      .eq('company_id', companyId);
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(companyId: string): Promise<{
    totalCached: number;
    uniqueSources: number;
    avgConfidence: number;
    mostSuggestedPositions: Array<{
      positionId: string;
      count: number;
    }>;
  }> {
    const { data } = await supabase
      .from('st_position_mapping_suggestions')
      .select('source_text, suggested_position_id, confidence_score')
      .eq('company_id', companyId);

    if (!data || data.length === 0) {
      return {
        totalCached: 0,
        uniqueSources: 0,
        avgConfidence: 0,
        mostSuggestedPositions: []
      };
    }

    const uniqueSources = new Set(data.map(d => d.source_text)).size;
    const avgConfidence = data.reduce((sum, d) => sum + d.confidence_score, 0) / data.length;
    
    const positionCounts = data.reduce((acc, d) => {
      acc[d.suggested_position_id] = (acc[d.suggested_position_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostSuggestedPositions = Object.entries(positionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([positionId, count]) => ({ positionId, count }));

    return {
      totalCached: data.length,
      uniqueSources,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      mostSuggestedPositions
    };
  }
}

// Export singleton instance
export const positionMappingService = new PositionMappingService();