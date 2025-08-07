import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SkillSuggestion {
  skill_name: string;
  category: 'essential' | 'important' | 'nice-to-have';
  proficiency_level: number; // 0-3 scale (0=None, 1=Learning, 2=Using, 3=Expert)
  description: string;
  reason?: string;
  skill_group?: 'technical' | 'soft' | 'leadership' | 'tools' | 'industry';
  market_demand?: 'high' | 'medium' | 'low';
  sources?: Array<{ title: string; url: string; }>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { position_title, position_description, position_level, department, additional_context } = await req.json()

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
${additional_context ? `Additional Requirements: ${additional_context}` : ''}

Based on actual 2025 job market data, provide 20-25 relevant skills that are most in-demand.

For each skill, create a section with this exact format:

### [Skill Name]
- **Category:** essential/important
- **Proficiency:** 1/2/3 (1=Learning, 2=Using, 3=Expert)
- **Market Demand:** high/medium/low
- **Skill Group:** technical/soft/leadership/tools/industry
- **Description:** [One sentence explaining how this skill applies to the role]
- **Reason:** [Why this skill matters for this specific position]
- **Sources:** [URL1](title1), [URL2](title2) (Include 1-2 most relevant source URLs if you found specific information from web search)

Consider:
- Current 2025 industry standards and trends
- Latest technologies and tools used in ${position_title} roles as of 2025
- Soft skills critical for ${position_level || 'this'} level in 2025
- Emerging skills gaining importance in 2025
- Skills mentioned in actual 2025 job postings (if market data available)

At the end, add a section:

## Insights
[Brief summary of key trends or patterns noticed from the 2025 job market data]`

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
            content: 'You are an expert HR consultant and skills analyst with deep knowledge of current job market trends. Provide practical, relevant skill suggestions based on industry best practices. Be specific and avoid generic skills. Use markdown formatting as requested.'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        max_tokens: 3000
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error('Failed to generate skills suggestions')
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content || ''

    const skills: SkillSuggestion[] = []
    let insights = ''
    let marketDataAvailable = false
    
    try {
      // Parse markdown format
      const skillSections = content.split(/###\s+/).slice(1) // Skip first empty element and handle ### with spaces
      
      for (const section of skillSections) {
        if (section.trim().startsWith('[')) continue // Skip any bracketed sections
        
        const lines = section.trim().split('\n')
        const skillName = lines[0].trim()
        
        if (!skillName || skillName.toLowerCase() === 'insights') break
        
        const skill: SkillSuggestion = {
          skill_name: skillName,
          category: 'important' as any,
          proficiency_level: 2, // Using level as default
          description: '',
          skill_group: 'industry' as any,
          market_demand: 'medium' as any
        }
        
        // Parse each line
        for (const line of lines.slice(1)) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('- **Category:**')) {
            const value = trimmedLine.replace('- **Category:**', '').trim().toLowerCase()
            if (['essential', 'important', 'nice-to-have'].includes(value)) {
              skill.category = value as any
            }
          } else if (trimmedLine.startsWith('- **Proficiency:**')) {
            const value = trimmedLine.replace('- **Proficiency:**', '').trim()
            const numValue = parseInt(value)
            if (!isNaN(numValue) && numValue >= 1 && numValue <= 3) {
              skill.proficiency_level = numValue
            }
          } else if (trimmedLine.startsWith('- **Market Demand:**')) {
            const value = trimmedLine.replace('- **Market Demand:**', '').trim().toLowerCase()
            if (['high', 'medium', 'low'].includes(value)) {
              skill.market_demand = value as any
            }
          } else if (trimmedLine.startsWith('- **Skill Group:**')) {
            const value = trimmedLine.replace('- **Skill Group:**', '').trim().toLowerCase()
            if (['technical', 'soft', 'leadership', 'tools', 'industry'].includes(value)) {
              skill.skill_group = value as any
            }
          } else if (trimmedLine.startsWith('- **Description:**')) {
            skill.description = trimmedLine.replace('- **Description:**', '').trim()
          } else if (trimmedLine.startsWith('- **Reason:**')) {
            skill.reason = trimmedLine.replace('- **Reason:**', '').trim()
          } else if (trimmedLine.startsWith('- **Sources:**')) {
            // Parse markdown links format: [URL1](title1), [URL2](title2)
            const sourcesText = trimmedLine.replace('- **Sources:**', '').trim()
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
            const sources: Array<{ title: string; url: string }> = []
            let match
            while ((match = linkRegex.exec(sourcesText)) !== null) {
              sources.push({
                url: match[1],
                title: match[2]
              })
            }
            if (sources.length > 0) {
              skill.sources = sources
            }
          }
        }
        
        skills.push(skill)
      }
      
      // Extract insights
      const insightsMatch = content.match(/## Insights\s*\n([\s\S]*?)$/i)
      if (insightsMatch) {
        insights = insightsMatch[1].trim()
      }
      
      // Check if web search was used based on model response
      const responseMessage = openaiData.choices[0]?.message
      if (responseMessage && responseMessage.search_results) {
        marketDataAvailable = true
        console.log('Web search results used:', responseMessage.search_results.length)
      } else {
        // Since we're using web search model, assume data is available
        marketDataAvailable = true
        console.log('Web search model used, marking as market data available')
      }
      
      console.log('Parsed skills count:', skills.length)
      console.log('First skill example:', skills[0])
      
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
      console.error('Response content:', content)
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