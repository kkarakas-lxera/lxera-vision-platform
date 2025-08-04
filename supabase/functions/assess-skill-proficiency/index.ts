import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AssessmentRequest {
  skill_name: string;
  skill_type?: 'skill' | 'skill_cluster';
  required_level?: 'basic' | 'intermediate' | 'advanced';
  position_context: {
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
    // Enhanced context fields
    total_years_in_field?: number;
    years_with_skill?: number;
    industry_domain?: string;
    team_size?: string;
    role_in_team?: string;
    recent_technologies?: string[];
    certifications?: string[];
    previous_positions?: string[];
    skill_usage_context?: string;
    related_skills?: string[];
  };
  employee_id?: string;
  position_id?: string;
  skill_id?: string;
  check_existing?: boolean; // If true, check for existing questions first
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'scenario' | 'code_review';
  question: string;
  options?: string[];
  correct_answer: string | number;
  explanation: string;
  difficulty: 1 | 2 | 3;
  time_limit: number; // seconds
  scoring_weight: number;
  skill_area?: string; // Specific aspect being tested
}

interface AssessmentResponse {
  assessment_id: string;
  skill_name: string;
  questions: Question[];
  estimated_time: number;
  context_used: {
    position: string;
    projects_referenced: boolean;
    difficulty_level: string;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      skill_name, 
      skill_type = 'skill',
      required_level = 'intermediate',
      position_context, 
      employee_context,
      employee_id,
      position_id,
      skill_id,
      check_existing = true
    } = await req.json() as AssessmentRequest

    if (!skill_name || !position_context?.title) {
      throw new Error('Skill name and position title are required')
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for existing questions if requested and employee_id provided
    if (check_existing && employee_id) {
      console.log('Checking for existing questions for:', { employee_id, skill_name })
      
      const { data: existingQuestions, error: fetchError } = await supabase
        .from('skill_assessment_questions')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('skill_name', skill_name)
        .eq('is_used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!fetchError && existingQuestions && existingQuestions.questions) {
        console.log('Found existing questions, returning them')
        
        // Mark as used
        await supabase
          .from('skill_assessment_questions')
          .update({ 
            is_used: true,
            used_at: new Date().toISOString()
          })
          .eq('id', existingQuestions.id)
        
        const response: AssessmentResponse = {
          assessment_id: existingQuestions.id,
          skill_name,
          questions: existingQuestions.questions,
          estimated_time: existingQuestions.questions.reduce((sum: number, q: any) => sum + (q.time_limit || 60), 0),
          context_used: existingQuestions.assessment_context?.context_used || {
            position: position_context.title,
            projects_referenced: false,
            difficulty_level: required_level
          }
        }

        return new Response(
          JSON.stringify(response),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      }
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Enhanced question configuration with more questions for better accuracy
    const questionConfig = {
      basic: { count: 4, maxDifficulty: 2, timePerQuestion: 60 },
      intermediate: { count: 5, maxDifficulty: 3, timePerQuestion: 75 },
      advanced: { count: 5, maxDifficulty: 3, timePerQuestion: 90 }
    }
    const config = questionConfig[required_level]

    // Build context for AI
    const hasProjects = employee_context.current_projects && employee_context.current_projects.length > 0
    const hasChallenges = employee_context.daily_challenges && employee_context.daily_challenges.length > 0
    const totalYears = employee_context.total_years_in_field || employee_context.years_experience || 0
    const yearsWithSkill = employee_context.years_with_skill || Math.floor(totalYears * 0.7) // Estimate if not provided
    
    // Determine appropriate difficulty based on experience
    const getDifficultyGuidance = () => {
      if (yearsWithSkill >= 5 && required_level === 'basic') {
        return 'For an experienced professional, focus on nuanced fundamentals and best practices rather than basic definitions'
      } else if (yearsWithSkill < 2 && required_level === 'advanced') {
        return 'Test potential and learning ability with progressively challenging scenarios'
      }
      return 'Match questions to their experience level and the position requirements'
    }
    
    // Get skill-specific focus areas
    const getSkillFocusAreas = () => {
      const skillFocusMap: Record<string, string> = {
        'React': 'component architecture, state management, performance optimization, hooks patterns',
        'Node.js': 'async patterns, API design, error handling, scalability considerations',
        'Python': 'data structures, libraries usage, code efficiency, testing practices',
        'SQL': 'query optimization, data modeling, transaction handling, performance tuning',
        'TypeScript': 'type safety, generics, advanced types, migration strategies',
        'AWS': 'service selection, cost optimization, security best practices, architecture patterns',
        'Docker': 'containerization strategies, multi-stage builds, orchestration, security',
        'Git': 'branching strategies, conflict resolution, workflow optimization, team collaboration'
      }
      return skillFocusMap[skill_name] || 'practical application and problem-solving'
    }
    
    const contextPrompt = `
Generate ${config.count} assessment questions for "${skill_name}" tailored to this specific employee:

EMPLOYEE PROFILE:
- Role: ${position_context.title}${position_context.department ? ` in ${position_context.department}` : ''}
- Experience: ${totalYears} years total${yearsWithSkill ? `, ${yearsWithSkill} years with ${skill_name}` : ''}
${hasProjects ? `- Current Work: "${employee_context.current_projects.join('", "')}"` : ''}
${employee_context.team_size ? `- Team Context: ${employee_context.team_size} team, role as ${employee_context.role_in_team}` : ''}
${hasChallenges ? `- Daily Challenges: ${employee_context.daily_challenges.join('; ')}` : ''}
${employee_context.related_skills?.length ? `- Related Skills: ${employee_context.related_skills.join(', ')}` : ''}
${employee_context.education_level ? `- Education: ${employee_context.education_level}` : ''}

ASSESSMENT CONTEXT:
- Target Proficiency: ${required_level} level
- Position Requirement: ${skill_name} at ${required_level} level for ${position_context.title}
- Assessment Focus: ${getSkillFocusAreas()}
- Difficulty Guidance: ${getDifficultyGuidance()}

QUESTION DESIGN REQUIREMENTS:
1. Question 1: Warm-up question related to their daily use of ${skill_name}${hasProjects ? ' in their current projects' : ''}
2. Questions 2-${config.count-1}: Progressively challenging scenarios that test ${required_level}-level competency
3. Question ${config.count}: Complex real-world problem requiring ${required_level === 'advanced' ? 'optimization and strategic thinking' : required_level === 'intermediate' ? 'problem-solving and best practices' : 'fundamental understanding'}

${hasProjects ? `\nPROJECT-SPECIFIC GUIDANCE:\nGiven they work on "${employee_context.current_projects[0]}", include at least one question that relates to challenges they might face in this context.` : ''}

QUESTION TYPES TO INCLUDE:
- Scenario-based: "In your role as ${position_context.title}, how would you..."
- Problem-solving: Real issues they might encounter
- Best practices: Industry standards for ${skill_name}
- Trade-offs: Decision-making between approaches
${required_level === 'advanced' ? '- Architecture/Design: High-level system design using ' + skill_name : ''}

For each question, provide:
- id: Unique identifier
- question: The question text (personalized to their context)
- type: "multiple_choice", "scenario", or "code_review"
- options: Array of 4 plausible options (for multiple choice)
- correct_answer: Index (0-3) for multiple choice, or expected approach for scenarios
- explanation: Detailed explanation referencing best practices
- difficulty: 1-${config.maxDifficulty} (calibrated to their experience)
- time_limit: ${config.timePerQuestion} seconds
- scoring_weight: 1.0-2.0 (higher for more important questions)
- skill_area: Specific aspect of ${skill_name} being tested

Return as a JSON object with a "questions" array.`

    console.log('Generating assessment questions for:', skill_name)
    
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
            content: `You are an expert technical interviewer and skill assessor with deep knowledge across multiple domains. Your role is to create personalized, practical assessment questions that accurately gauge real-world proficiency.

Key principles:
1. Questions must be directly relevant to how the skill is used in their specific role and projects
2. Avoid theoretical questions - focus on practical scenarios they would actually encounter
3. Consider their experience level and adjust complexity accordingly
4. Create questions that differentiate between memorization and true understanding
5. Include real-world edge cases and trade-offs they should know at their level
6. For experienced professionals, avoid basic questions that might seem insulting
7. Reference their actual projects and challenges when possible

You must return valid JSON with the specified structure.`
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
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      throw new Error('Failed to generate assessment questions')
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = JSON.parse(openaiData.choices[0]?.message?.content || '{}')
    
    // Extract questions array from various possible response formats
    let questions: Question[] = []
    if (Array.isArray(aiResponse)) {
      questions = aiResponse
    } else if (aiResponse.questions && Array.isArray(aiResponse.questions)) {
      questions = aiResponse.questions
    } else {
      // Try to find an array in the response
      const arrayKey = Object.keys(aiResponse).find(key => Array.isArray(aiResponse[key]))
      if (arrayKey) {
        questions = aiResponse[arrayKey]
      }
    }

    // Validate and clean questions
    questions = questions.slice(0, config.count).map((q, index) => ({
      id: q.id || `q_${index + 1}_${Date.now()}`,
      type: q.type || 'multiple_choice',
      question: q.question || '',
      options: q.options || [],
      correct_answer: q.correct_answer ?? 0,
      explanation: q.explanation || '',
      difficulty: Math.min(Math.max(q.difficulty || 1, 1), config.maxDifficulty),
      time_limit: q.time_limit || config.timePerQuestion,
      scoring_weight: Math.min(Math.max(q.scoring_weight || 1.0, 1.0), 2.0), // Between 1.0 and 2.0
      skill_area: q.skill_area || 'general'
    }))

    // Generate assessment ID
    const assessmentId = `assess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const response: AssessmentResponse = {
      assessment_id: assessmentId,
      skill_name,
      questions,
      estimated_time: questions.reduce((sum, q) => sum + q.time_limit, 0),
      context_used: {
        position: position_context.title,
        projects_referenced: hasProjects,
        difficulty_level: required_level
      }
    }

    console.log(`Generated ${questions.length} questions for ${skill_name}`)

    // Save questions to database if employee_id is provided
    if (employee_id) {
      console.log('Saving generated questions to database')
      
      const { error: saveError } = await supabase
        .from('skill_assessment_questions')
        .insert({
          employee_id,
          skill_name,
          skill_id: skill_id || null,
          position_id: position_id || null,
          questions,
          assessment_context: {
            required_level,
            position_context,
            employee_context,
            context_used: response.context_used
          },
          is_used: true, // Mark as used immediately since we're returning it
          used_at: new Date().toISOString()
        })

      if (saveError) {
        console.error('Error saving questions to database:', saveError)
        // Don't throw - still return the questions even if save fails
      } else {
        console.log('Questions saved successfully')
      }
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in assess-skill-proficiency:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        assessment_id: null,
        questions: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  }
})