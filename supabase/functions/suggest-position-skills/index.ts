import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createErrorResponse, logSanitizedError } from '../_shared/error-utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { position_title } = await req.json()

    if (!position_title) {
      throw new Error('Position title is required')
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create OpenAI request
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
            content: 'You are an expert in workforce skills and competencies. Provide practical, relevant skill suggestions based on current industry standards. Use ONLY the 0-3 proficiency scale: 0=None, 1=Learning, 2=Using, 3=Expert.'
          },
          {
            role: 'user',
            content: `Suggest 15-20 skills for the position: "${position_title}"

Include:
- Technical skills specific to the role
- Relevant tools and technologies
- Important soft skills
- Emerging skills in the field
- Industry-specific competencies

For each skill, provide:
1. skill_name: The skill name
2. category: "essential", "important", or "nice-to-have"
3. proficiency_level: A number from 1-3 (1=Learning, 2=Using, 3=Expert - never use 0 for required skills)
4. description: Brief description (1 sentence)

IMPORTANT: Use proficiency scale 1-3 for position requirements (0 not applicable for job requirements).

Return as JSON object with a "skills" array.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      })
    })

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API request failed')
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    let skills = []
    try {
      const parsed = JSON.parse(content)
      skills = parsed.skills || []
      
      // Ensure proficiency levels are properly bounded (1-3 for requirements)
      skills = skills.map((skill: any) => ({
        ...skill,
        proficiency_level: Math.max(1, Math.min(3, skill.proficiency_level || 2))
      }))
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e)
      skills = []
    }

    return new Response(
      JSON.stringify({ skills }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    logSanitizedError(error, {
      requestId: crypto.randomUUID(),
      functionName: 'suggest-position-skills'
    })
    
    // Fail properly - no fallback data
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate skill suggestions',
        details: 'OpenAI service error - please check API key and retry'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})