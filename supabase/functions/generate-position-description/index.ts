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

    const prompt = `Generate a professional position description for:

Position Title: ${position_title}
Level: ${position_level || 'Not specified'}
Department: ${department || 'Not specified'}

Write exactly 2 paragraphs:
1. First paragraph: Describe the role's purpose, main responsibilities, and impact on the organization
2. Second paragraph: Outline the ideal candidate profile, required experience level, and growth opportunities

Keep it concise, professional, and avoid generic phrases. Be specific to the position level and department.`

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
            content: 'You are an expert HR professional writing concise, engaging position descriptions. Focus on clarity and specificity.'
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