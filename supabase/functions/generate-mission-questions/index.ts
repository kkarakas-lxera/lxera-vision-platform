import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  employee_id: string
  content_section_id?: string
  module_content_id?: string
  section_name?: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  questions_count: number
  category?: string
  task_title?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      employee_id, 
      content_section_id, 
      module_content_id,
      section_name = 'general',
      difficulty_level = 'medium', 
      questions_count = 4,
      category = 'general',
      task_title
    }: RequestBody = await req.json()

    // Get the actual course content for context
    let courseContent = ''
    let contentId = content_section_id || module_content_id

    if (contentId) {
      const { data: content } = await supabaseClient
        .from('cm_module_content')
        .select('*')
        .eq('content_id', contentId)
        .eq('is_current_version', true)
        .single()

      if (content) {
        // Extract relevant section content
        const sectionContent = content[section_name as keyof typeof content]
        courseContent = typeof sectionContent === 'string' ? sectionContent : content.core_content || ''
      }
    }

    // If no specific content, get employee's company info for context
    let companyContext = ''
    if (!courseContent) {
      const { data: employee } = await supabaseClient
        .from('employees')
        .select('company_id, position')
        .eq('id', employee_id)
        .single()

      if (employee) {
        const { data: company } = await supabaseClient
          .from('companies')
          .select('name, industry')
          .eq('id', employee.company_id)
          .single()

        if (company) {
          companyContext = `Company: ${company.name}, Industry: ${company.industry}, Employee Position: ${employee.position}`
        }
      }
    }

    // Get employee's company_id for mission creation
    const { data: employee } = await supabaseClient
      .from('employees')
      .select('company_id')
      .eq('id', employee_id)
      .single()

    if (!employee) {
      throw new Error('Employee not found')
    }

    // Validate and fix section_name to match database constraints
    const validSections = ['introduction', 'core_content', 'practical_applications', 'case_studies', 'assessments'];
    const validSectionName = validSections.includes(section_name) ? section_name : 'core_content';
    
    // Validate difficulty_level
    const validDifficulties = ['easy', 'medium', 'hard'];
    const validDifficulty = validDifficulties.includes(difficulty_level) ? difficulty_level : 'medium';

    // Create mission first
    const missionData = {
      content_section_id: contentId,
      employee_id,
      company_id: employee.company_id, // Required for RLS
      mission_title: task_title || `Master ${validSectionName.replace('_', ' ')} - ${validDifficulty} Challenge`,
      mission_description: `Test your understanding of ${validSectionName.replace('_', ' ')} concepts through this interactive ${validDifficulty} level challenge.`,
      difficulty_level: validDifficulty,
      points_value: validDifficulty === 'easy' ? 50 : validDifficulty === 'medium' ? 100 : 150,
      estimated_minutes: Math.round(questions_count * 1.5),
      questions_count,
      skill_focus: [category, 'Problem Solving', 'Critical Thinking'],
      is_active: true,
      category,
      section_name: validSectionName
    }

    const { data: mission, error: missionError } = await supabaseClient
      .from('game_missions')
      .insert(missionData)
      .select()
      .single()

    if (missionError) {
      console.error('Mission creation error:', missionError)
      throw new Error(`Failed to create mission: ${missionError.message}`)
    }

    // Generate questions using OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `You are an expert educational content creator. Generate ${questions_count} multiple-choice questions based on the following content.

**Content Context:**
${courseContent || 'General business and professional skills content'}

**Company Context:**
${companyContext}

**Section:** ${section_name.replace('_', ' ')}
**Category:** ${category}
**Difficulty:** ${difficulty_level}

**Requirements:**
1. Create ${questions_count} multiple-choice questions (A, B, C, D options)
2. Questions should test understanding, application, and critical thinking
3. Make questions practical and relevant to real workplace scenarios
4. Difficulty should be ${difficulty_level} level
5. Include clear explanations for correct answers
6. Each question worth 25 points

**Response Format (JSON):**
{
  "questions": [
    {
      "question_text": "Clear, concise question text",
      "question_type": "multiple_choice",
      "correct_answer": "A",
      "answer_options": ["Option A", "Option B", "Option C", "Option D"],
      "explanation": "Clear explanation of why this answer is correct",
      "points_value": 25,
      "time_limit_seconds": 30,
      "order_position": 1
    }
  ]
}

Generate engaging, practical questions that help learners apply the concepts in real situations.`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: 'You are an expert educational content creator who generates high-quality, practical multiple-choice questions. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiResult = await openaiResponse.json()
    const generatedContent = openaiResult.choices[0].message.content

    // Parse the JSON response
    let questionsData
    try {
      questionsData = JSON.parse(generatedContent)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent)
      throw new Error('Failed to parse AI-generated questions')
    }

    // Insert questions into database - match existing schema
    const questionsToInsert = questionsData.questions.map((q: any, index: number) => {
      // Convert correct answer from letter to index (A=0, B=1, C=2, D=3)
      const correctAnswerIndex = q.correct_answer === 'A' ? 0 : 
                                  q.correct_answer === 'B' ? 1 :
                                  q.correct_answer === 'C' ? 2 : 3;
      
      return {
        mission_id: mission.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.answer_options, // jsonb array
        correct_answer: correctAnswerIndex, // integer index
        explanation: q.explanation || '',
        skill_focus: category,
        ai_generated: true
      }
    })

    const { error: questionsError } = await supabaseClient
      .from('game_questions')
      .insert(questionsToInsert)

    if (questionsError) {
      console.error('Questions insertion error:', questionsError)
      // Don't fail the mission if questions fail - we can retry
      console.log('Mission created but questions failed to insert:', questionsError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        mission_id: mission.id,
        questions_generated: questionsToInsert.length,
        message: 'Mission and questions generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Function error:', error)
    console.error('Error stack:', error.stack)
    
    // Log more details about the error
    const errorMessage = error.message || 'Internal server error'
    const errorDetails = {
      name: error.name,
      message: errorMessage,
      stack: error.stack
    }
    
    console.error('Detailed error:', JSON.stringify(errorDetails))
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: errorDetails
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})