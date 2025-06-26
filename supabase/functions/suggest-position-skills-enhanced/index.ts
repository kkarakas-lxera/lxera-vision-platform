import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SkillSuggestion {
  skill_id?: string;
  skill_name: string;
  category: 'essential' | 'important' | 'nice-to-have';
  proficiency_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  description: string;
  source: 'database' | 'ai';
  relevance_score?: number;
  reason?: string;
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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Step 1: Search skills taxonomy database
    console.log('Searching skills taxonomy database...')
    const searchTerms = extractKeyTerms(position_title, position_description)
    
    let databaseSkills: SkillSuggestion[] = []
    
    for (const term of searchTerms) {
      const { data: skills, error } = await supabase.rpc('search_skills', {
        search_term: term,
        limit_count: 5
      })

      if (!error && skills) {
        const mappedSkills = skills.map((skill: any) => ({
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
          category: 'important' as const,
          proficiency_level: 'intermediate' as const,
          description: skill.description || `${skill.skill_name} from ${skill.skill_type}`,
          source: 'database' as const,
          relevance_score: skill.rank || 0
        }))
        databaseSkills = [...databaseSkills, ...mappedSkills]
      }
    }

    // Remove duplicates based on skill_id
    const uniqueDbSkills = Array.from(
      new Map(databaseSkills.map(skill => [skill.skill_id, skill])).values()
    )

    console.log(`Found ${uniqueDbSkills.length} skills from database`)

    // Step 2: Get AI suggestions with context about database skills
    const aiPrompt = `Analyze this position and suggest relevant skills:

Position: ${position_title}
Level: ${position_level || 'Not specified'}
Department: ${department || 'Not specified'}
Description: ${position_description || 'No description provided'}

Skills already found in our database:
${uniqueDbSkills.map(s => `- ${s.skill_name}`).join('\n')}

Please suggest 15-20 additional skills that are:
1. Relevant to this specific position
2. NOT already in the database list above
3. Current and industry-standard

For each skill, provide:
- skill_name: Clear, concise skill name
- category: "essential" (must-have), "important" (strongly preferred), or "nice-to-have"
- proficiency_level: "basic", "intermediate", "advanced", or "expert"
- description: One sentence explaining the skill
- reason: Why this skill is relevant for this position

Consider:
- Technical skills specific to ${position_title}
- Tools and technologies commonly used
- Soft skills critical for success
- Emerging skills in the field
- Industry best practices

Return as JSON object with a "skills" array.`

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
            content: 'You are an expert HR consultant and skills analyst. Provide practical, relevant skill suggestions based on current industry standards and best practices.'
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
      throw new Error('OpenAI API request failed')
    }

    const openaiData = await openaiResponse.json()
    const content = openaiData.choices[0]?.message?.content

    let aiSkills: SkillSuggestion[] = []
    try {
      const parsed = JSON.parse(content)
      aiSkills = (parsed.skills || []).map((skill: any) => ({
        ...skill,
        source: 'ai' as const,
        relevance_score: 0.8 // AI suggestions get slightly lower base score
      }))
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e)
    }

    // Step 3: Categorize database skills based on position context
    const categorizedDbSkills = await categorizeSkillsWithAI(
      uniqueDbSkills,
      position_title,
      position_description,
      openaiApiKey
    )

    // Step 4: Combine and rank all skills
    const allSkills = [...categorizedDbSkills, ...aiSkills]
    
    // Sort by category (essential first) and relevance
    const sortedSkills = allSkills.sort((a, b) => {
      const categoryOrder = { 'essential': 0, 'important': 1, 'nice-to-have': 2 }
      const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category]
      if (categoryDiff !== 0) return categoryDiff
      
      // Within same category, database skills come first
      if (a.source !== b.source) {
        return a.source === 'database' ? -1 : 1
      }
      
      return (b.relevance_score || 0) - (a.relevance_score || 0)
    })

    // Limit to top 25 skills
    const finalSkills = sortedSkills.slice(0, 25)

    return new Response(
      JSON.stringify({ 
        skills: finalSkills,
        summary: {
          total_suggestions: finalSkills.length,
          from_database: finalSkills.filter(s => s.source === 'database').length,
          from_ai: finalSkills.filter(s => s.source === 'ai').length,
          essential_count: finalSkills.filter(s => s.category === 'essential').length,
          important_count: finalSkills.filter(s => s.category === 'important').length,
          nice_to_have_count: finalSkills.filter(s => s.category === 'nice-to-have').length
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
          from_database: 0,
          from_ai: 0,
          essential_count: 0,
          important_count: 0,
          nice_to_have_count: 0
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})

// Extract key terms from position title and description for database search
function extractKeyTerms(title: string, description?: string): string[] {
  const text = `${title} ${description || ''}`.toLowerCase()
  
  // Common technology/skill keywords to search for
  const keywords = text.match(/\b(react|angular|vue|node|python|java|javascript|typescript|aws|azure|gcp|docker|kubernetes|sql|nosql|mongodb|postgres|mysql|agile|scrum|devops|ci\/cd|machine learning|ai|data|analytics|cloud|microservices|api|rest|graphql|frontend|backend|fullstack|mobile|ios|android|security|testing|qa|automation|leadership|management|communication|design|ux|ui)\b/gi) || []
  
  // Also search for the main role terms
  const roleTerms = title.split(/\s+/).filter(term => 
    term.length > 3 && 
    !['the', 'and', 'for', 'with'].includes(term.toLowerCase())
  )
  
  return [...new Set([...keywords, ...roleTerms])].slice(0, 10) // Limit to 10 terms
}

// Use AI to categorize database skills based on position context
async function categorizeSkillsWithAI(
  skills: SkillSuggestion[],
  positionTitle: string,
  positionDescription: string | undefined,
  openaiApiKey: string
): Promise<SkillSuggestion[]> {
  if (skills.length === 0) return []

  const categorizationPrompt = `For the position "${positionTitle}"${positionDescription ? ` with description: "${positionDescription}"` : ''}, 
categorize these skills by importance:

${skills.map((s, i) => `${i + 1}. ${s.skill_name}`).join('\n')}

For each skill number, provide:
- category: "essential", "important", or "nice-to-have"
- proficiency_level: "basic", "intermediate", "advanced", or "expert"
- reason: One sentence why this skill matters for this position

Return as JSON object with "categorizations" array containing objects with: skill_index, category, proficiency_level, reason`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert at evaluating skill requirements for job positions.'
          },
          {
            role: 'user',
            content: categorizationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    })

    if (response.ok) {
      const data = await response.json()
      const parsed = JSON.parse(data.choices[0]?.message?.content || '{}')
      const categorizations = parsed.categorizations || []

      return skills.map((skill, index) => {
        const categorization = categorizations.find((c: any) => c.skill_index === index + 1)
        if (categorization) {
          return {
            ...skill,
            category: categorization.category || skill.category,
            proficiency_level: categorization.proficiency_level || skill.proficiency_level,
            reason: categorization.reason
          }
        }
        return skill
      })
    }
  } catch (error) {
    console.error('Error categorizing skills:', error)
  }

  return skills
}