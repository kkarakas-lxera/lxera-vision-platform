import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PreGenerateRequest {
  employee_id: string;
  skills: Array<{
    skill_name: string;
    skill_id?: string;
    required_level?: number;
    source: 'position_required' | 'position_nice' | 'cv' | 'manual';
  }>;
  position_context: {
    id?: string;
    title: string;
    level?: string;
    department?: string;
  };
  employee_context: {
    years_experience?: number;
    current_projects?: string[];
    daily_challenges?: string[];
    education_level?: string;
    work_experience?: any[];
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      employee_id,
      skills,
      position_context,
      employee_context
    } = await req.json() as PreGenerateRequest

    if (!employee_id || !skills || skills.length === 0) {
      throw new Error('Employee ID and skills array are required')
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

    const results = []
    const errors = []

    // Process each skill
    for (const skill of skills) {
      try {
        console.log(`Pregenerating questions for skill: ${skill.skill_name}`)
        
        // Check if questions already exist
        const { data: existing } = await supabase
          .from('skill_assessment_questions')
          .select('id')
          .eq('employee_id', employee_id)
          .eq('skill_name', skill.skill_name)
          .single()

        if (existing) {
          console.log(`Questions already exist for ${skill.skill_name}, skipping`)
          results.push({
            skill_name: skill.skill_name,
            status: 'already_exists',
            question_id: existing.id
          })
          continue
        }

        // Determine required level
        const requiredLevel = skill.required_level 
          ? (skill.required_level === 1 ? 'basic' : skill.required_level === 2 ? 'intermediate' : 'advanced')
          : 'intermediate'

        // Generate questions using OpenAI
        const questionConfig = {
          basic: { count: 4, maxDifficulty: 2, timePerQuestion: 60 },
          intermediate: { count: 5, maxDifficulty: 3, timePerQuestion: 75 },
          advanced: { count: 5, maxDifficulty: 3, timePerQuestion: 90 }
        }
        const config = questionConfig[requiredLevel]

        const contextPrompt = `
Generate ${config.count} assessment questions for "${skill.skill_name}" tailored to this specific employee:

EMPLOYEE PROFILE:
- Role: ${position_context.title}${position_context.department ? ` in ${position_context.department}` : ''}
- Experience: ${employee_context.years_experience || 0} years
${employee_context.current_projects?.length ? `- Current Work: "${employee_context.current_projects.join('", "')}"` : ''}
${employee_context.daily_challenges?.length ? `- Daily Challenges: ${employee_context.daily_challenges.join('; ')}` : ''}
${employee_context.education_level ? `- Education: ${employee_context.education_level}` : ''}

ASSESSMENT CONTEXT:
- Target Proficiency: ${requiredLevel} level
- Position Requirement: ${skill.skill_name} at ${requiredLevel} level for ${position_context.title}
- Skill Source: ${skill.source}

Return questions as a JSON object with a "questions" array, where each question has:
- id: Unique identifier
- question: The question text
- type: "multiple_choice"
- options: Array of 4 plausible options
- correct_answer: Index (0-3) for correct option
- explanation: Detailed explanation
- difficulty: 1-${config.maxDifficulty}
- time_limit: ${config.timePerQuestion} seconds
- scoring_weight: 1.0-2.0
- skill_area: Specific aspect being tested`

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
                content: 'You are an expert technical interviewer. Generate practical, role-relevant assessment questions. Return valid JSON.'
              },
              {
                role: 'user',
                content: contextPrompt
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 2000,
            temperature: 0.7
          })
        })

        if (!openaiResponse.ok) {
          throw new Error('Failed to generate questions from OpenAI')
        }

        const openaiData = await openaiResponse.json()
        const aiResponse = JSON.parse(openaiData.choices[0]?.message?.content || '{}')
        
        let questions = []
        if (Array.isArray(aiResponse)) {
          questions = aiResponse
        } else if (aiResponse.questions) {
          questions = aiResponse.questions
        }

        // Validate and save questions
        if (questions.length > 0) {
          // Helper function to check if string is valid UUID
          const isValidUUID = (str: string) => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(str);
          };

          // Only use skill_id if it's a valid UUID, otherwise null
          const validSkillId = skill.skill_id && isValidUUID(skill.skill_id) ? skill.skill_id : null;

          const { data: saved, error: saveError } = await supabase
            .from('skill_assessment_questions')
            .insert({
              employee_id,
              skill_name: skill.skill_name,
              skill_id: validSkillId,
              position_id: position_context.id || null,
              questions,
              assessment_context: {
                required_level: requiredLevel,
                position_context,
                employee_context,
                skill_source: skill.source
              },
              is_used: false
            })
            .select('id')
            .single()

          if (saveError) {
            throw saveError
          }

          results.push({
            skill_name: skill.skill_name,
            status: 'generated',
            question_id: saved.id,
            question_count: questions.length
          })
        } else {
          throw new Error('No questions generated')
        }

      } catch (error) {
        console.error(`Error generating questions for ${skill.skill_name}:`, error)
        errors.push({
          skill_name: skill.skill_name,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        errors,
        summary: {
          total_skills: skills.length,
          generated: results.filter(r => r.status === 'generated').length,
          already_exists: results.filter(r => r.status === 'already_exists').length,
          failed: errors.length,
          successful: results.length // Total successful (generated + already_exists)
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in pregenerate-skill-questions:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})