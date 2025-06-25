// Skills Extraction Edge Function
// Extract skills from any text input (job descriptions, CVs, etc.)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.24.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExtractionRequest {
  text: string
  context?: 'cv' | 'job_description' | 'general'
  matchToTaxonomy?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, context = 'general', matchToTaxonomy = true } = 
      await req.json() as ExtractionRequest

    if (!text || text.trim().length === 0) {
      throw new Error('Text input is required')
    }

    // Initialize services
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const openAIKey = Deno.env.get('OPENAI_API_KEY')!
    const configuration = new Configuration({ apiKey: openAIKey })
    const openai = new OpenAIApi(configuration)

    // Create context-specific prompt
    const systemPrompt = `You are an expert at extracting skills from text. 
    Extract all relevant skills including technical skills, soft skills, tools, technologies, and domain knowledge.
    For each skill, assess how clearly it's mentioned (confidence 0-1).`

    const userPrompt = `Extract skills from the following ${context}:

${text}

Return a JSON array of skills with this structure:
[
  {
    "skill_name": "skill name",
    "category": "technical|soft|tool|domain",
    "confidence": 0.9,
    "evidence": "quote or context from text"
  }
]

Be comprehensive but accurate. Only include skills that are clearly mentioned or strongly implied.`

    // Extract skills using OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const extractedSkills = JSON.parse(
      completion.data.choices[0].message?.content || '{"skills":[]}'
    ).skills || []

    // Match to taxonomy if requested
    let finalSkills = extractedSkills
    if (matchToTaxonomy) {
      finalSkills = await matchExtractedSkillsToTaxonomy(supabase, extractedSkills)
    }

    // Group skills by category
    const groupedSkills = finalSkills.reduce((acc: any, skill: any) => {
      const category = skill.category || 'other'
      if (!acc[category]) acc[category] = []
      acc[category].push(skill)
      return acc
    }, {})

    return new Response(
      JSON.stringify({
        success: true,
        totalSkills: finalSkills.length,
        skills: finalSkills,
        groupedSkills,
        context
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Skills extraction error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function matchExtractedSkillsToTaxonomy(
  supabase: any, 
  skills: any[]
): Promise<any[]> {
  const matchedSkills = []

  for (const skill of skills) {
    // Search in taxonomy
    const { data: matches } = await supabase
      .rpc('search_skills', { 
        search_term: skill.skill_name,
        limit_count: 3 
      })

    if (matches && matches.length > 0) {
      // Find best match based on relevance and category
      const bestMatch = matches[0]
      
      // Get full skill path
      const { data: skillPath } = await supabase
        .rpc('get_skill_path', { skill_uuid: bestMatch.skill_id })

      matchedSkills.push({
        ...skill,
        skill_id: bestMatch.skill_id,
        matched_skill_name: bestMatch.skill_name,
        skill_type: bestMatch.skill_type,
        hierarchy_level: bestMatch.hierarchy_level,
        match_confidence: bestMatch.relevance,
        skill_path: skillPath?.map((s: any) => s.skill_name).join(' > '),
        is_exact_match: skill.skill_name.toLowerCase() === bestMatch.skill_name.toLowerCase()
      })
    } else {
      // No match found
      matchedSkills.push({
        ...skill,
        skill_id: null,
        is_custom: true,
        match_confidence: 0
      })
    }
  }

  return matchedSkills
}