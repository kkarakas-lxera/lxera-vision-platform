import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'
import { createErrorResponse, logSanitizedError } from '../_shared/error-utils.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { employeeData } = await req.json()

    if (!employeeData) {
      throw new Error('Employee data is required')
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Create a comprehensive prompt for weekly insights
    const prompt = `You are an HR analytics expert. Generate a personalized weekly performance insight paragraph for an employee based on their profile data. Keep it professional, encouraging, and actionable.

Employee Profile:
- Name: ${employeeData.name}
- Current Position: ${employeeData.currentPosition}
${employeeData.targetPosition ? `- Target Position: ${employeeData.targetPosition}` : ''}
- Skills Match Score: ${employeeData.matchScore}%
- Career Readiness Score: ${employeeData.readinessScore}%
- Total Skills Identified: ${employeeData.skillsCount}
- Top Skills: ${employeeData.skills.map((s: any) => `${s.name} (${s.level}/5)`).join(', ')}
- Active Courses: ${employeeData.recentCourses}
- Completed Courses: ${employeeData.completedCourses}

Generate a single paragraph (4-6 sentences) that:
1. Acknowledges their current progress and strengths
2. Identifies 1-2 key areas for improvement
3. Provides specific actionable recommendations
4. Ends with an encouraging note about their career trajectory

Keep the tone professional yet personable. Focus on actionable insights rather than generic advice.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an HR analytics expert providing personalized employee development insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logSanitizedError(error, {
        requestId,
        functionName: 'generate-employee-insights',
        metadata: { context: 'openai_api_call' }
      })
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const insights = data.choices[0]?.message?.content || 'Unable to generate insights at this time.'

    // Log the usage for analytics
    const { data: usageData, error: usageError } = await supabaseClient
      .from('st_llm_usage')
      .insert({
        model: 'gpt-4o-mini',
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
        cost: ((data.usage?.prompt_tokens || 0) * 0.00015 + (data.usage?.completion_tokens || 0) * 0.0006) / 1000,
        function_name: 'generate-employee-insights',
        metadata: {
          employee_name: employeeData.name,
          timestamp: new Date().toISOString()
        }
      })

    if (usageError) {
      logSanitizedError(usageError, {
        requestId,
        functionName: 'generate-employee-insights',
        metadata: { context: 'usage_logging' }
      })
    }

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return createErrorResponse(error, {
      requestId,
      functionName: 'generate-employee-insights'
    }, 400)
  }
})