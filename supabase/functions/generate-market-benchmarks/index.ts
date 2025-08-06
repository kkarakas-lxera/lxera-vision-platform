import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@5.11.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MarketSkill {
  skill_name: string;
  match_percentage: number;
  category: 'critical' | 'emerging' | 'foundational';
  market_demand: 'high' | 'medium' | 'low';
  source?: 'ai' | 'cv' | 'verified';
}

interface BenchmarkRequest {
  role: string;
  industry?: string;
  department?: string;
  force_refresh?: boolean;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { role, industry, department, force_refresh = false }: BenchmarkRequest = await req.json()

    if (!role) {
      throw new Error('Role is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for cached benchmarks if not forcing refresh
    if (!force_refresh) {
      const { data: cachedData } = await supabase.rpc('get_market_benchmarks', {
        p_role_name: role,
        p_industry: industry,
        p_department: department
      })

      if (cachedData) {
        console.log('Returning cached benchmarks')
        return new Response(
          JSON.stringify({ 
            skills: cachedData,
            cached: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Generate new benchmarks with OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('Generating market benchmarks with OpenAI...')
    
    const aiPrompt = `Analyze the current 2025 job market for the following role and provide market skill benchmarks:

Role: ${role}
${industry ? `Industry: ${industry}` : ''}
${department ? `Department: ${department}` : ''}

Based on current market data and trends, provide exactly 8-12 skills that are most important for this role in 2025.

For each skill, provide a JSON object with:
- skill_name: Clear, concise skill name (e.g., "React.js", "Project Management", "Data Analysis")
- match_percentage: Expected proficiency level (0-100, where 100 means expert level expected)
- category: "critical" (must-have), "emerging" (growing importance), or "foundational" (baseline expectation)
- market_demand: "high", "medium", or "low" based on current job postings

Focus on:
1. Technical skills specific to the role
2. Relevant soft skills for the level
3. Industry-specific knowledge if applicable
4. Emerging technologies or methodologies gaining traction

Return ONLY a JSON array of skill objects, no additional text or markdown.`

    const openai = new OpenAI({ apiKey: openaiApiKey })
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a market intelligence analyst specializing in workforce skills analysis. Provide accurate, data-driven insights about current job market requirements. Return only valid JSON.'
        },
        {
          role: 'user',
          content: aiPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    // Parse the response
    let skills: MarketSkill[]
    try {
      const parsed = JSON.parse(aiResponse)
      skills = parsed.skills || parsed
      
      // Validate and clean the skills
      skills = skills.map(skill => ({
        skill_name: skill.skill_name || 'Unknown Skill',
        match_percentage: Math.min(100, Math.max(0, skill.match_percentage || 50)),
        category: ['critical', 'emerging', 'foundational'].includes(skill.category) 
          ? skill.category 
          : 'foundational',
        market_demand: ['high', 'medium', 'low'].includes(skill.market_demand) 
          ? skill.market_demand 
          : 'medium'
      }))
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      throw new Error('Failed to parse AI response')
    }

    // Store in database
    const { error: insertError } = await supabase
      .from('market_skills_benchmarks')
      .insert({
        role_name: role,
        industry: industry,
        department: department,
        skills: skills,
        metadata: {
          total_skills: skills.length,
          generated_by: 'gpt-4o',
          timestamp: new Date().toISOString()
        }
      })

    if (insertError) {
      console.error('Error storing benchmarks:', insertError)
      // Continue even if storage fails
    }

    // Track usage
    const inputTokens = aiPrompt.length / 4 // Rough estimate
    const outputTokens = JSON.stringify(skills).length / 4
    const costEstimate = (inputTokens * 0.0015 + outputTokens * 0.002) / 1000

    await supabase
      .from('st_llm_usage_metrics')
      .insert({
        service_type: 'market_benchmarks',
        model_used: 'gpt-4o',
        input_tokens: Math.round(inputTokens),
        output_tokens: Math.round(outputTokens),
        total_tokens: Math.round(inputTokens + outputTokens),
        cost_estimate: costEstimate,
        success: true
      })

    return new Response(
      JSON.stringify({ 
        skills: skills,
        cached: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-market-benchmarks:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred generating benchmarks' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})