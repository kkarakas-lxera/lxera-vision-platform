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

interface MarketInsights {
  summary: string;
  key_findings: string[];
  recommendations: string[];
  business_impact: string;
  action_items: string[];
}

interface BenchmarkRequest {
  role: string;
  industry?: string;
  department?: string;
  force_refresh?: boolean;
  include_insights?: boolean;
  company_context?: {
    employees_count?: number;
    analyzed_count?: number;
    critical_gaps?: number;
    moderate_gaps?: number;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { role, industry, department, force_refresh = false, include_insights = false, company_context }: BenchmarkRequest = await req.json()

    if (!role) {
      throw new Error('Role is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for cached benchmarks if not forcing refresh
    if (!force_refresh) {
      // Get full benchmark data including metadata
      const { data: cachedBenchmark } = await supabase
        .from('market_skills_benchmarks')
        .select('skills, generated_at, expires_at')
        .eq('role_name', role)
        .eq('industry', industry || '')
        .eq('department', department || '')
        .gt('expires_at', new Date().toISOString())
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cachedBenchmark?.skills) {
        console.log('Returning cached benchmarks')
        
        // If insights are requested, check if we have cached insights
        let cachedInsights = undefined
        if (include_insights && cachedBenchmark.skills) {
          // Try to get cached insights from metadata
          const { data: benchmarkWithMeta } = await supabase
            .from('market_skills_benchmarks')
            .select('metadata')
            .eq('role_name', role)
            .eq('industry', industry || '')
            .eq('department', department || '')
            .gt('expires_at', new Date().toISOString())
            .order('generated_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          
          if (benchmarkWithMeta?.metadata?.insights) {
            cachedInsights = benchmarkWithMeta.metadata.insights
          }
        }
        
        return new Response(
          JSON.stringify({ 
            skills: cachedBenchmark.skills,
            insights: cachedInsights,
            cached: true,
            generated_at: cachedBenchmark.generated_at,
            expires_at: cachedBenchmark.expires_at
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

Return a JSON object with a "skills" property containing an array of skill objects. Each skill object must have:
- skill_name: Clear, concise skill name (e.g., "React.js", "Project Management", "Data Analysis")
- match_percentage: Expected proficiency level (0-100, where 100 means expert level expected)
- category: "critical" (must-have), "emerging" (growing importance), or "foundational" (baseline expectation)
- market_demand: "high", "medium", or "low" based on current job postings

Focus on:
1. Technical skills specific to the role
2. Relevant soft skills for the level
3. Industry-specific knowledge if applicable
4. Emerging technologies or methodologies gaining traction

Example format:
{
  "skills": [
    {
      "skill_name": "Product Management",
      "match_percentage": 90,
      "category": "critical",
      "market_demand": "high"
    }
  ]
}`

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
      console.log('Parsed AI response:', JSON.stringify(parsed, null, 2))
      
      // Handle different response formats
      if (Array.isArray(parsed)) {
        skills = parsed
      } else if (parsed.skills && Array.isArray(parsed.skills)) {
        skills = parsed.skills
      } else if (typeof parsed === 'object') {
        // If it's an object but not in expected format, try to extract array from any property
        const possibleArrays = Object.values(parsed).filter(val => Array.isArray(val))
        if (possibleArrays.length > 0) {
          skills = possibleArrays[0] as MarketSkill[]
        } else {
          console.error('No array found in AI response:', parsed)
          throw new Error('AI response does not contain a skills array')
        }
      } else {
        throw new Error('Unexpected AI response format')
      }
      
      // Validate that we have an array
      if (!Array.isArray(skills)) {
        console.error('Skills is not an array:', skills)
        throw new Error('Skills must be an array')
      }
      
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
      console.error('Raw AI response:', aiResponse)
      throw new Error('Failed to parse AI response')
    }

    // Store in database - will be updated after insights if needed
    let benchmarkId: string | null = null
    const { data: insertData, error: insertError } = await supabase
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
      .select('id')
      .single()
    
    if (insertData) {
      benchmarkId = insertData.id
    }

    if (insertError) {
      console.error('Error storing benchmarks:', insertError)
      // Continue even if storage fails
    }

    // Generate insights if requested
    let insights: MarketInsights | undefined;
    if (include_insights && company_context) {
      console.log('Generating market insights...')
      
      const insightsPrompt = `Based on the skills gap analysis for ${role} in ${department || 'this department'} ${industry ? `in the ${industry} industry` : ''}:

Company Context:
- Total employees: ${company_context.employees_count || 'Unknown'}
- Analyzed employees: ${company_context.analyzed_count || 0}
- Critical skill gaps: ${company_context.critical_gaps || 0}
- Moderate skill gaps: ${company_context.moderate_gaps || 0}

Skills Analysis:
${skills.map(s => `- ${s.skill_name}: ${s.category} skill with ${s.market_demand} market demand`).join('\n')}

Provide strategic insights in JSON format with:
- summary: A 2-3 sentence executive summary of the department's skills situation
- key_findings: Array of 3-4 specific observations about skill gaps and market alignment
- recommendations: Array of 3-4 actionable recommendations for addressing gaps
- business_impact: A paragraph explaining the business value and ROI of addressing these gaps
- action_items: Array of 3-4 immediate next steps (as plain strings, not objects)

Focus on:
1. Competitive advantage implications
2. Talent acquisition vs. training trade-offs
3. Industry-specific trends and benchmarks
4. Practical implementation strategies
5. Measurable business outcomes

Return only valid JSON with these exact fields.`

      try {
        const insightsCompletion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a strategic workforce planning advisor specializing in skills gap analysis and talent optimization. Provide actionable, business-focused insights that drive ROI.'
            },
            {
              role: 'user',
              content: insightsPrompt
            }
          ],
          temperature: 0.4,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        })

        const insightsResponse = insightsCompletion.choices[0]?.message?.content
        if (insightsResponse) {
          const parsedInsights = JSON.parse(insightsResponse)
          
          // Ensure action_items are strings
          if (parsedInsights.action_items && Array.isArray(parsedInsights.action_items)) {
            parsedInsights.action_items = parsedInsights.action_items.map(item => 
              typeof item === 'string' ? item : (item.task || item.toString())
            )
          }
          
          insights = parsedInsights
          
          // Update the benchmark with insights in metadata
          if (benchmarkId) {
            await supabase
              .from('market_skills_benchmarks')
              .update({
                metadata: {
                  total_skills: skills.length,
                  generated_by: 'gpt-4o',
                  timestamp: new Date().toISOString(),
                  insights: insights
                }
              })
              .eq('id', benchmarkId)
          }
        }
      } catch (insightsError) {
        console.error('Error generating insights:', insightsError)
        // Continue without insights if generation fails
      }
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

    const currentDate = new Date().toISOString()
    const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

    return new Response(
      JSON.stringify({ 
        skills: skills,
        insights: insights,
        cached: false,
        generated_at: currentDate,
        expires_at: expiryDate
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