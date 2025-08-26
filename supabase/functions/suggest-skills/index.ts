import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@5.11.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

interface Suggestion {
  skill_name: string
  reason?: string
  category?: string
  suggested_proficiency_level?: number
  confidence?: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_id } = await req.json()
    if (!employee_id) {
      return new Response(JSON.stringify({ error: 'employee_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const groqApiKey = Deno.env.get('GROQ_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !groqApiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const groq = new OpenAI({ apiKey: groqApiKey, baseURL: 'https://api.groq.com/openai/v1' })

    // Load employee, cv data, and position data
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        id,
        company_id,
        cv_extracted_data,
        cv_analysis_data,
        current_position_id,
        current_position:st_company_positions!employees_current_position_id_fkey(
          position_title,
          required_skills,
          nice_to_have_skills,
          description
        )
      `)
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const positionTitle: string = employee.current_position?.position_title || ''
    const positionDescription: string = employee.current_position?.description || ''
    const requiredSkills: Array<{ skill_name: string; proficiency_level?: number }> = employee.current_position?.required_skills || []
    const niceToHaveSkills: Array<{ skill_name: string; proficiency_level?: number }> = employee.current_position?.nice_to_have_skills || []

    const cvSkills: Array<string | { skill_name: string }> = (employee.cv_extracted_data?.skills || []).map((s: any) => (typeof s === 'string' ? s : s.skill_name || s))
    const cvSummary: string | undefined = employee.cv_extracted_data?.professionalSummary || employee.cv_extracted_data?.professional_summary

    // Build prompt
    const prompt = `You are assisting in suggesting missing skills for a learner profile.

Context:
- Position Title: ${positionTitle || 'Unknown'}
- Position Description: ${positionDescription || 'N/A'}
- Required Skills: ${JSON.stringify(requiredSkills)}
- Nice-to-have Skills: ${JSON.stringify(niceToHaveSkills)}
- CV Skills: ${JSON.stringify(cvSkills)}
- CV Summary: ${cvSummary || 'N/A'}

Task:
Suggest up to 12 additional skills the person likely has or should add, that are not duplicates of required or CV skills, prioritizing skills highly relevant to the position and adjacent capabilities.

Return ONLY a JSON object with key "suggestions": an array of objects:
- skill_name: string
- category: one of ['role_core','adjacent','tooling','process']
- suggested_proficiency_level: integer 1-3 (1=Learning, 2=Using, 3=Expert)
- confidence: number between 0 and 1
- reason: short string (<=120 chars)
`

    // Call Groq with JSON output, with a fallback
    let suggestions: Suggestion[] = []
    try {
      const resp = await groq.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: 'You output strictly valid JSON with no markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0,
        max_tokens: 1200,
        response_format: { type: 'json_object' }
      })
      const content = resp.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(content)
      suggestions = Array.isArray(parsed?.suggestions) ? parsed.suggestions : []
      // Log usage
      if (resp.usage) {
        await supabase.from('st_llm_usage_metrics').insert({
          company_id: employee.company_id,
          service_type: 'skill_suggestions',
          model_used: 'openai/gpt-oss-20b',
          input_tokens: resp.usage.prompt_tokens || 0,
          output_tokens: resp.usage.completion_tokens || 0,
          cost_estimate: ((resp.usage.prompt_tokens || 0) * (0.10/1_000_000)) + ((resp.usage.completion_tokens || 0) * (0.50/1_000_000)),
          duration_ms: 0,
          success: true,
          metadata: { employee_id }
        })
      }
    } catch (e) {
      // Fallback: return empty suggestions
      suggestions = []
    }

    // Filter duplicates and normalize
    const lowerSet = new Set<string>([
      ...requiredSkills.map(s => (s.skill_name || '').toLowerCase()).filter(Boolean),
      ...cvSkills.map((s: any) => (typeof s === 'string' ? s : s?.skill_name || s)).map((n: any) => (typeof n === 'string' ? n.toLowerCase() : '')).filter(Boolean)
    ])

    const normalized = suggestions
      .filter(s => s && s.skill_name)
      .filter(s => !lowerSet.has(s.skill_name.toLowerCase()))
      .map<Suggestion>(s => ({
        skill_name: s.skill_name,
        category: s.category || 'adjacent',
        suggested_proficiency_level: Math.min(3, Math.max(1, Number(s.suggested_proficiency_level || 1))),
        confidence: Math.max(0, Math.min(1, Number(s.confidence || 0.6))),
        reason: s.reason || ''
      }))

    return new Response(JSON.stringify({ suggestions: normalized }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to suggest skills' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
