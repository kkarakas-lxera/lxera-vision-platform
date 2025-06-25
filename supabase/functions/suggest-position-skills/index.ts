import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
            content: 'You are an expert in workforce skills and competencies. Provide practical, relevant skill suggestions based on current industry standards.'
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
3. proficiency_level: "basic", "intermediate", "advanced", or "expert"
4. description: Brief description (1 sentence)

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
    console.error('Error in suggest-position-skills function:', error)
    
    // Return fallback skills on error
    const fallbackSkills = [
      { skill_name: 'Communication', category: 'essential', proficiency_level: 'advanced', description: 'Clear verbal and written communication' },
      { skill_name: 'Problem Solving', category: 'essential', proficiency_level: 'advanced', description: 'Analytical thinking and solution development' },
      { skill_name: 'Team Collaboration', category: 'important', proficiency_level: 'intermediate', description: 'Working effectively in teams' },
      { skill_name: 'Time Management', category: 'important', proficiency_level: 'intermediate', description: 'Prioritizing and managing tasks efficiently' },
      { skill_name: 'Adaptability', category: 'nice-to-have', proficiency_level: 'intermediate', description: 'Flexibility in changing environments' }
    ]
    
    return new Response(
      JSON.stringify({ skills: fallbackSkills, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})