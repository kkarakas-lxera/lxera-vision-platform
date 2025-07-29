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
1. First paragraph: Describe what this role does, its key responsibilities, and how it contributes to the organization. Use third-person language (e.g., "This role is responsible for...", "The ${position_title} will...")
2. Second paragraph: Describe the skills and experience the company is looking for in candidates. Focus on what the company needs from this position.

Write from the company's perspective as if posting a job description. Avoid addressing the reader directly. Be specific to the position level and department.`

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
            content: 'You are an expert HR professional writing job descriptions from the company perspective. Write in third-person about what the role entails and what the company is looking for. Never address the reader directly or use "you/your".'
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