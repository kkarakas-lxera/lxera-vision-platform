import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SkillSuggestion {
  skill_name: string;
  category: 'essential' | 'important' | 'nice-to-have';
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  reason?: string;
  skill_group?: 'technical' | 'soft' | 'leadership' | 'tools' | 'industry';
  market_demand?: 'high' | 'medium' | 'low';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { position_title, position_description, position_level, department } = await req.json()

    if (!position_title) {
      throw new Error('Position title is required')
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate comprehensive skills with AI using web search
    console.log('Generating skills with OpenAI web search...')
    
    const aiPrompt = `Search the web for current 2025 job postings for "${position_title}"${department ? ` in ${department} department` : ''} to understand the latest requirements. Then analyze this position and provide comprehensive skill suggestions:

Position: ${position_title}
Level: ${position_level || 'Not specified'}
Department: ${department || 'Not specified'}
Description: ${position_description || 'No description provided'}

Based on actual 2025 job market data, provide 20-25 relevant skills that are most in-demand.

For each skill, provide:
- skill_name: Clear, concise skill name (2-4 words max)
- category: "essential" (must-have), "important" (strongly preferred), or "nice-to-have"
- proficiency_level: "basic", "intermediate", "advanced", or "expert"
- description: One sentence explaining how this skill applies to the role
- reason: Why this skill matters for this specific position
- skill_group: "technical", "soft", "leadership", "tools", or "industry"
- market_demand: "high", "medium", or "low" based on current industry trends

Consider:
- Current 2025 industry standards and trends
- Latest technologies and tools used in ${position_title} roles as of 2025
- Soft skills critical for ${position_level || 'this'} level in 2025
- Emerging skills gaining importance in 2025
- Skills mentioned in actual 2025 job postings (if market data available)

Return ONLY a JSON object with:
{
  "skills": [array of skill objects],
  "insights": "Brief summary of key trends or patterns noticed"
}`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-search-preview',
        web_search_options: { 
          search_context_size: 'medium'
        },
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR consultant and skills analyst with deep knowledge of current job market trends. Provide practical, relevant skill suggestions based on industry best practices. Be specific and avoid generic skills.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error('Failed to generate skills suggestions')
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    let skills: SkillSuggestion[] = []
    let insights = ''
    let marketDataAvailable = false
    
    try {
      const parsed = JSON.parse(content)
      skills = parsed.skills || []
      insights = parsed.insights || ''
      
      // Check if web search was used based on model response
      const responseMessage = openaiData.choices[0]?.message
      if (responseMessage && responseMessage.search_results) {
        marketDataAvailable = true
        console.log('Web search results used:', responseMessage.search_results.length)
      }
      
      // Sort skills by category (essential first) and market demand
      skills.sort((a, b) => {
        const categoryOrder = { 'essential': 0, 'important': 1, 'nice-to-have': 2 }
        const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category]
        if (categoryDiff !== 0) return categoryDiff
        
        const demandOrder = { 'high': 0, 'medium': 1, 'low': 2 }
        const demandA = a.market_demand || 'medium'
        const demandB = b.market_demand || 'medium'
        return demandOrder[demandA] - demandOrder[demandB]
      })
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e)
      throw new Error('Invalid response format from AI')
    }

    return new Response(
      JSON.stringify({ 
        skills: skills,
        summary: {
          total_suggestions: skills.length,
          essential_count: skills.filter(s => s.category === 'essential').length,
          important_count: skills.filter(s => s.category === 'important').length,
          nice_to_have_count: skills.filter(s => s.category === 'nice-to-have').length,
          market_data_available: marketDataAvailable,
          insights: insights
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in suggest-position-skills-enhanced:', error)
    
    return new Response(
      JSON.stringify({ 
        skills: [],
        error: error.message,
        summary: {
          total_suggestions: 0,
          essential_count: 0,
          important_count: 0,
          nice_to_have_count: 0,
          market_data_available: false,
          insights: ''
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})