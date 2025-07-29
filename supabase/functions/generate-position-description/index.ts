import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { position_title, position_level, department } = await req.json()

    if (!position_title) {
      throw new Error('Position title is required')
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `Generate a professional job description from the company's perspective for:

Position Title: ${position_title}
Level: ${position_level || 'Not specified'}
Department: ${department || 'Not specified'}

Write exactly 2 paragraphs:
1. First paragraph: Describe what the company needs this role to accomplish, its key responsibilities, and how it contributes to organizational goals. Use company-focused language (e.g., "The company requires this role to...", "This position will deliver...")
2. Second paragraph: Describe the specific capabilities and qualifications the company seeks for this position. Focus on what the organization needs to achieve its objectives.

Write from the company's internal perspective, as if documenting what the company needs from this position. DO NOT write as if addressing candidates or as a job posting. Be specific to the position level and department.`

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
            content: 'You are an expert HR professional documenting position requirements for internal company use. Write from the company\'s internal perspective about what the organization needs from this role. Never write as if creating a job posting or addressing candidates. Focus on organizational needs and objectives.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error('Failed to generate description')
    }

    const openaiData = await openaiResponse.json()
    const description = openaiData.choices[0]?.message?.content || ''

    return new Response(
      JSON.stringify({ 
        description: description.trim()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in generate-position-description:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        description: ''
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})