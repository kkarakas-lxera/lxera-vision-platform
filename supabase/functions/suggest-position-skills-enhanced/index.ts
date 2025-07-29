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

    // Get Firecrawl API key if available
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    
    let marketInsights = ''
    
    // Step 1: Use Firecrawl to get real job market data (if API key available)
    if (firecrawlApiKey) {
      try {
        console.log('Fetching job market insights with Firecrawl...')
        
        const searchQuery = `"${position_title}" job requirements skills "${department || ''}"`.trim()
        
        const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 3,
            scrapeOptions: {
              formats: ['markdown', 'json'],
              onlyMainContent: true,
              maxTokens: 1000,
              jsonOptions: {
                prompt: `Extract the following information from this job posting:
                - job_title: The exact job title
                - company: The company name
                - required_skills: Array of required technical and soft skills
                - nice_to_have_skills: Array of preferred/bonus skills
                - experience_level: Years of experience required
                - key_responsibilities: Main duties and responsibilities
                - technologies: Specific tools, languages, frameworks mentioned`
              }
            }
          })
        })

        if (firecrawlResponse.ok) {
          const searchResults = await firecrawlResponse.json()
          
          if (searchResults.data && searchResults.data.length > 0) {
            marketInsights = `\n\nREAL JOB MARKET DATA:\n`
            const extractedSkills: string[] = []
            const extractedTechnologies: string[] = []
            
            searchResults.data.forEach((result: any, index: number) => {
              marketInsights += `\nSource ${index + 1}: ${result.url}\n`
              
              // Use structured JSON data if available
              if (result.json) {
                const jobData = result.json
                marketInsights += `Company: ${jobData.company || 'Unknown'}\n`
                marketInsights += `Role: ${jobData.job_title || position_title}\n`
                
                if (jobData.required_skills?.length > 0) {
                  extractedSkills.push(...jobData.required_skills)
                  marketInsights += `Required Skills: ${jobData.required_skills.join(', ')}\n`
                }
                
                if (jobData.technologies?.length > 0) {
                  extractedTechnologies.push(...jobData.technologies)
                  marketInsights += `Technologies: ${jobData.technologies.join(', ')}\n`
                }
                
                if (jobData.experience_level) {
                  marketInsights += `Experience: ${jobData.experience_level}\n`
                }
              }
              
              // Fallback to markdown if JSON extraction failed
              if (result.markdown) {
                marketInsights += `\nContent:\n${result.markdown.substring(0, 500)}...\n`
              }
              
              marketInsights += `---\n`
            })
            
            // Add aggregated skills summary
            if (extractedSkills.length > 0) {
              const uniqueSkills = [...new Set(extractedSkills)]
              marketInsights += `\nAGGREGATED SKILLS FROM JOB POSTINGS:\n${uniqueSkills.join(', ')}\n`
            }
            
            if (extractedTechnologies.length > 0) {
              const uniqueTech = [...new Set(extractedTechnologies)]
              marketInsights += `\nCOMMON TECHNOLOGIES:\n${uniqueTech.join(', ')}\n`
            }
          }
        }
      } catch (error) {
        console.error('Firecrawl search error:', error)
        // Continue without market insights
      }
    }

    // Step 2: Generate comprehensive skills with AI
    const aiPrompt = `Analyze this position and provide comprehensive skill suggestions:

Position: ${position_title}
Level: ${position_level || 'Not specified'}
Department: ${department || 'Not specified'}
Description: ${position_description || 'No description provided'}
${marketInsights}

Based on the position details${marketInsights ? ' and real job market data' : ''}, provide 20-25 relevant skills.

For each skill, provide:
- skill_name: Clear, concise skill name (2-4 words max)
- category: "essential" (must-have), "important" (strongly preferred), or "nice-to-have"
- proficiency_level: "basic", "intermediate", "advanced", or "expert"
- description: One sentence explaining how this skill applies to the role
- reason: Why this skill matters for this specific position
- skill_group: "technical", "soft", "leadership", "tools", or "industry"
- market_demand: "high", "medium", or "low" based on current industry trends

Consider:
- Current industry standards and trends
- Specific technologies and tools used in ${position_title} roles
- Soft skills critical for ${position_level || 'this'} level
- Emerging skills gaining importance
- Skills mentioned in actual job postings (if market data available)

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
        model: 'gpt-4-turbo-preview',
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
    
    try {
      const parsed = JSON.parse(content)
      skills = parsed.skills || []
      insights = parsed.insights || ''
      
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
          market_data_available: !!marketInsights,
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