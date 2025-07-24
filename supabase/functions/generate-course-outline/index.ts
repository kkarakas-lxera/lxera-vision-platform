import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { 
  logSanitizedError, 
  createErrorResponse, 
  getErrorStatusCode,
  type ErrorLogContext 
} from '../_shared/error-utils.ts'

interface CourseModule {
  module_id: number
  module_name: string
  week: number
  duration_hours: number
  learning_objectives: string[]
  key_topics: string[]
  practical_exercises: string[]
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  priority: 'critical' | 'high' | 'medium' | 'low'
  skill_gap_addressed: string
  tools_integration: string[]
  personalization_factors: {
    practical_emphasis: number
    tool_specific_content: number
    experience_level: string
  }
}

interface CourseOutline {
  course_title: string
  description: string
  total_duration_weeks: number
  total_duration_hours: number
  target_audience: string
  prerequisites: string[]
  learning_outcomes: string[]
  modules: CourseModule[]
  personalization_metadata: {
    employee_name: string
    current_role: string
    experience_level: string
    skills_match_score: number
    challenges_addressed: number
    growth_areas_covered: number
  }
}

interface ProfileAnalysis {
  work_experience: any
  education: any
  current_work: any
  challenges: string[]
  growth_areas: string[]
  skills: any[]
  experience_level: string
}

interface CourseGenerationContext {
  employee_name: string
  position: string
  department: string
  experience_level: string
  current_projects: string[]
  team_size: string
  role_in_team: string
  top_skills: string[]
  professional_challenges: string[]
  growth_priorities: string[]
  skills_match_score: number
  required_skills: any[]
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  const functionName = 'generate-course-outline'

  try {
    const requestBody = await req.json()
    const { employee_id } = requestBody

    if (!employee_id) {
      const context: ErrorLogContext = { requestId, functionName }
      return createErrorResponse(
        new Error('employee_id is required'),
        context,
        400
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      const context: ErrorLogContext = { requestId, functionName }
      return createErrorResponse(
        new Error('Supabase configuration missing'),
        context,
        503
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`[${requestId}] Generating enhanced course outline for employee: ${employee_id}`)

    // Get employee data with comprehensive profile information
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        *,
        st_company_positions!employees_current_position_id_fkey (
          position_title,
          department,
          required_skills,
          nice_to_have_skills
        ),
        st_employee_skills_profile (
          extracted_skills,
          skills_match_score,
          gap_analysis_data
        )
      `)
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      throw new Error('Failed to fetch employee data')
    }

    // Get all profile sections for comprehensive context
    const { data: sections, error: sectionsError } = await supabase
      .from('employee_profile_sections')
      .select('section_name, data, is_complete')
      .eq('employee_id', employee_id)

    if (sectionsError) {
      const context: ErrorLogContext = { requestId, functionName, employeeId: employee_id }
      return createErrorResponse(
        new Error(`Failed to fetch profile sections: ${sectionsError.message}`),
        context,
        500
      )
    }

    if (!sections || sections.length === 0) {
      const context: ErrorLogContext = { requestId, functionName, employeeId: employee_id }
      return createErrorResponse(
        new Error('Profile not complete - please complete all 7 steps first'),
        context,
        400
      )
    }

    // Enhanced profile data extraction with comprehensive analysis
    const profileAnalysis: ProfileAnalysis = {
      work_experience: sections?.find(s => s.section_name === 'work_experience')?.data || {},
      education: sections?.find(s => s.section_name === 'education')?.data || {},
      current_work: sections?.find(s => s.section_name === 'current_work')?.data || {},
      challenges: sections?.find(s => s.section_name === 'daily_tasks')?.data?.challenges || [],
      growth_areas: sections?.find(s => s.section_name === 'tools_technologies')?.data?.growthAreas || [],
      skills: employee.st_employee_skills_profile?.extracted_skills || [],
      experience_level: calculateExperienceLevel(sections?.find(s => s.section_name === 'work_experience')?.data || {})
    }

    // Verify minimum profile completeness (critical sections)
    const requiredSections = ['work_experience', 'current_work', 'daily_tasks', 'tools_technologies']
    const completedSections = sections.filter(s => s.is_complete && requiredSections.includes(s.section_name))
    
    if (completedSections.length < 3) {
      const context: ErrorLogContext = { requestId, functionName, employeeId: employee_id }
      return createErrorResponse(
        new Error('Insufficient profile data - please complete at least work experience, current work, and professional challenges'),
        context,
        400
      )
    }

    // Prepare enhanced context for AI course outline generation
    const context: CourseGenerationContext = {
      employee_name: employee.full_name || 'Learner',
      position: employee.st_company_positions?.position_title || employee.position || 'Professional',
      department: employee.st_company_positions?.department || employee.department || 'General',
      experience_level: profileAnalysis.experience_level,
      current_projects: Array.isArray(profileAnalysis.current_work.projects) ? 
        profileAnalysis.current_work.projects : 
        (profileAnalysis.current_work.projects ? [profileAnalysis.current_work.projects] : []),
      team_size: profileAnalysis.current_work.teamSize || 'Unknown',
      role_in_team: profileAnalysis.current_work.role || 'Individual Contributor',
      top_skills: profileAnalysis.skills.slice(0, 10).map((s: any) => s.skill_name || s.name || s),
      professional_challenges: Array.isArray(profileAnalysis.challenges) ? 
        profileAnalysis.challenges : 
        (profileAnalysis.challenges ? [profileAnalysis.challenges] : []),
      growth_priorities: Array.isArray(profileAnalysis.growth_areas) ? 
        profileAnalysis.growth_areas : 
        (profileAnalysis.growth_areas ? [profileAnalysis.growth_areas] : []),
      skills_match_score: employee.st_employee_skills_profile?.skills_match_score || 0,
      required_skills: employee.st_company_positions?.required_skills || []
    }

    // Calculate personalization factors for advanced course customization
    const personalizationFactors = {
      practical_emphasis: context.professional_challenges.length > 3 ? 0.8 : 0.7,
      tool_integration_score: context.top_skills.filter(skill => 
        skill.toLowerCase().includes('excel') || 
        skill.toLowerCase().includes('powerbi') ||
        skill.toLowerCase().includes('sap') ||
        skill.toLowerCase().includes('python') ||
        skill.toLowerCase().includes('sql')
      ).length / Math.max(context.top_skills.length, 1),
      complexity_level: context.experience_level === 'expert-level' ? 0.9 : 
                       context.experience_level === 'senior-level' ? 0.7 : 
                       context.experience_level === 'mid-level' ? 0.5 : 0.3
    }

    // Generate course outline using OpenAI with enhanced prompting
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) {
      const context: ErrorLogContext = { requestId, functionName, employeeId: employee_id }
      return createErrorResponse(
        new Error('OpenAI API key not configured'),
        context,
        503
      )
    }

    // Enhanced prompt with planning tools methodology
    const enhancedPrompt = `Create a highly personalized 4-week course outline for ${context.employee_name} as their completion reward for finishing the 7-step profile building process.

LEARNER PROFILE ANALYSIS:
- Name: ${context.employee_name}
- Current Role: ${context.position}
- Department: ${context.department}
- Experience Level: ${context.experience_level}
- Team Context: ${context.role_in_team} in a ${context.team_size} team
- Skills Match Score: ${context.skills_match_score}%
- Top Skills: ${context.top_skills.slice(0, 10).join(', ')}
- Current Projects: ${context.current_projects.join(', ')}

PERSONALIZATION FACTORS:
- Practical Emphasis: ${(personalizationFactors.practical_emphasis * 100).toFixed(0)}%
- Tool Integration Score: ${(personalizationFactors.tool_integration_score * 100).toFixed(0)}%
- Complexity Level: ${(personalizationFactors.complexity_level * 100).toFixed(0)}%

DEVELOPMENT PRIORITIES (From Profile Analysis):
- Professional Challenges: ${context.professional_challenges.slice(0, 6).join('; ')}
- Growth Priorities: ${context.growth_priorities.slice(0, 6).join('; ')}
- Required Skills Gap: ${context.required_skills.slice(0, 5).map(s => typeof s === 'string' ? s : s.skill || 'Unknown Skill').join('; ')}

COURSE REQUIREMENTS:
1. Create 4-week intensive course with 6-8 modules (1-2 per week)
2. Address their top 3-4 professional challenges directly
3. Build on existing skills while filling critical gaps
4. Include tool-specific applications for their current tech stack
5. Progressive difficulty: foundational → intermediate → advanced → expert
6. High practical emphasis (${(personalizationFactors.practical_emphasis * 100).toFixed(0)}% hands-on content)
7. Real-world scenarios from their actual work context
8. Clear ROI for their career progression to next role

ENHANCED OUTPUT FORMAT (JSON):
{
  "course_title": "Highly specific title addressing their key challenge",
  "description": "Compelling description showing value and career impact",
  "total_duration_weeks": 4,
  "total_duration_hours": 20,
  "target_audience": "${context.experience_level} ${context.position} seeking advancement",
  "prerequisites": ["Based on their current skill level"],
  "learning_outcomes": [
    "Measurable outcome addressing challenge 1",
    "Measurable outcome addressing challenge 2", 
    "Measurable outcome for career progression"
  ],
  "modules": [
    {
      "module_id": 1,
      "module_name": "Specific name targeting their #1 challenge",
      "week": 1,
      "duration_hours": 3,
      "priority": "critical|high|medium",
      "skill_gap_addressed": "Specific gap from their profile",
      "tools_integration": ["List of their actual tools"],
      "learning_objectives": [
        "Apply X to their current projects",
        "Master Y using their existing tools"
      ],
      "key_topics": [
        "Topic 1 with direct work relevance",
        "Topic 2 building on their strengths",
        "Topic 3 addressing skill gap"
      ],
      "practical_exercises": [
        "Exercise using their project context",
        "Real scenario from their role type"
      ],
      "difficulty_level": "foundational|intermediate|advanced",
      "personalization_factors": {
        "practical_emphasis": ${personalizationFactors.practical_emphasis},
        "tool_specific_content": ${personalizationFactors.tool_integration_score},
        "experience_level": "${context.experience_level}"
      }
    }
  ]
}

CRITICAL: This is a REWARD for completing their profile. Make it incredibly valuable, actionable, and directly applicable to their career advancement. Show clear connection between their profile data and course content.`

    console.log(`[${requestId}] Calling OpenAI GPT-4 for personalized course generation...`)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4', // Using full GPT-4 for better personalization
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning and development specialist who creates highly personalized, actionable course outlines based on detailed employee profiles. Focus on practical application and career advancement. ALWAYS respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent structure
        max_tokens: 3000, // Increased for comprehensive modules
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errorContext: ErrorLogContext = { requestId, functionName, employeeId: employee_id }
      const errorText = await response.text()
      return createErrorResponse(
        new Error(`OpenAI API error: ${response.status} - ${errorText}`),
        errorContext,
        502
      )
    }

    const aiResponse = await response.json()
    
    if (!aiResponse.choices || !aiResponse.choices[0] || !aiResponse.choices[0].message || !aiResponse.choices[0].message.content) {
      const errorContext: ErrorLogContext = { requestId, functionName, employeeId: employee_id }
      return createErrorResponse(
        new Error('Invalid OpenAI response structure'),
        errorContext,
        502
      )
    }

    let courseOutline: CourseOutline
    try {
      courseOutline = JSON.parse(aiResponse.choices[0].message.content)
    } catch (parseError) {
      const errorContext: ErrorLogContext = { requestId, functionName, employeeId: employee_id }
      console.error(`[${requestId}] Failed to parse OpenAI JSON response:`, aiResponse.choices[0].message.content)
      return createErrorResponse(
        new Error('Failed to parse course outline from AI response'),
        errorContext,
        502
      )
    }

    // Validate course outline structure
    if (!courseOutline.course_title || !courseOutline.modules || !Array.isArray(courseOutline.modules)) {
      const errorContext: ErrorLogContext = { requestId, functionName, employeeId: employee_id }
      return createErrorResponse(
        new Error('Invalid course outline structure from AI'),
        errorContext,
        502
      )
    }

    console.log(`[${requestId}] Successfully generated course outline: "${courseOutline.course_title}" with ${courseOutline.modules.length} modules`)

    // Enhanced course outline with personalization metadata
    const enhancedCourseOutline: CourseOutline = {
      ...courseOutline,
      personalization_metadata: {
        employee_name: context.employee_name,
        current_role: context.position,
        experience_level: context.experience_level,
        skills_match_score: context.skills_match_score,
        challenges_addressed: context.professional_challenges.length,
        growth_areas_covered: context.growth_priorities.length
      }
    }

    // Store the course outline in the existing cm_course_plans table
    console.log(`[${requestId}] Storing course outline in cm_course_plans table...`)
    const { error: storeError } = await supabase
      .from('cm_course_plans')
      .insert({
        plan_id: globalThis.crypto.randomUUID(),
        employee_id,
        company_id: employee.company_id, // Add company_id from employee record
        employee_name: context.employee_name,
        session_id: `reward-${requestId}`,
        course_structure: enhancedCourseOutline,
        prioritized_gaps: {
          skills_gaps: employee.st_employee_skills_profile?.gap_analysis_data || [],
          required_skills_missing: employee.st_company_positions?.required_skills?.filter((skill: any) => 
            !profileAnalysis.skills.some((s: any) => 
              (s.skill_name || s.name || s).toLowerCase() === (skill.skill || skill).toLowerCase()
            )
          ) || []
        },
        research_strategy: {
          type: 'outline_only',
          generated_for: 'profile_completion_reward'
        },
        learning_path: {
          personalization_score: Math.round(75 + (context.skills_match_score * 0.15) + (personalizationFactors.practical_emphasis * 10)),
          practical_emphasis: personalizationFactors.practical_emphasis,
          tool_integration_score: personalizationFactors.tool_integration_score
        },
        employee_profile: context,
        planning_agent_version: 'outline-reward-v1.0',
        total_modules: enhancedCourseOutline.modules.length,
        course_duration_weeks: enhancedCourseOutline.total_duration_weeks || 4,
        course_title: enhancedCourseOutline.course_title,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (storeError) {
      console.error(`[${requestId}] Error storing course outline:`, storeError)
      // Log but don't fail the request if storage fails
      const errorContext: ErrorLogContext = { requestId, functionName, employeeId: employee_id, metadata: { storeError } }
      logSanitizedError(storeError, errorContext)
    } else {
      console.log(`[${requestId}] Course outline stored successfully`)
    }

    // Calculate comprehensive metrics
    const totalHours = enhancedCourseOutline.modules.reduce((total, module) => total + (module.duration_hours || 3), 0)
    const personalizationScore = Math.min(98, 
      75 + 
      (context.skills_match_score * 0.15) + 
      (personalizationFactors.practical_emphasis * 10) +
      (personalizationFactors.tool_integration_score * 8)
    )

    // Create success response with enhanced reward messaging
    const successResponse = {
      success: true,
      request_id: requestId,
      course_outline: {
        ...enhancedCourseOutline,
        total_duration_hours: totalHours,
        personalization_score: Math.round(personalizationScore),
        generation_metadata: {
          generated_for: context.employee_name,
          generated_at: new Date().toISOString(),
          challenges_addressed: context.professional_challenges.length,
          growth_areas_covered: context.growth_priorities.length,
          skills_analyzed: context.top_skills.length,
          experience_level: context.experience_level,
          practical_emphasis: `${(personalizationFactors.practical_emphasis * 100).toFixed(0)}%`,
          tool_integration: `${(personalizationFactors.tool_integration_score * 100).toFixed(0)}%`,
          is_completion_reward: true,
          ai_model_used: 'gpt-4',
          processing_time_ms: Date.now() - new Date().getTime()
        }
      },
      reward_message: {
        title: "🎉 Course Outline Generated Successfully!",
        description: `Congratulations ${context.employee_name}! Your personalized "${enhancedCourseOutline.course_title}" course outline is ready.`,
        highlights: [
          `${enhancedCourseOutline.modules.length} personalized modules`,
          `${totalHours} hours of targeted learning`,
          `${personalizationScore}% personalization score`,
          `${context.professional_challenges.length} challenges addressed`,
          `Direct application to your ${context.position} role`
        ]
      }
    }

    console.log(`[${requestId}] Course outline generation completed successfully`)
    
    return new Response(
      JSON.stringify(successResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        } 
      }
    )

  } catch (error) {
    const errorContext: ErrorLogContext = { 
      requestId, 
      functionName, 
      employeeId: employee_id || undefined,
      metadata: { 
        error_type: error.constructor?.name || 'Unknown',
        timestamp: new Date().toISOString()
      }
    }
    
    console.error(`[${requestId}] Unexpected error in generate-course-outline:`, error)
    
    const statusCode = getErrorStatusCode(error)
    return createErrorResponse(error, errorContext, statusCode)
  }
})

function calculateExperienceLevel(workExperience: any): string {
  if (!workExperience || (!workExperience.experience && !workExperience.experiences)) {
    return 'entry-level'
  }

  const experiences = workExperience.experiences || workExperience.experience || []
  if (!Array.isArray(experiences) || experiences.length === 0) {
    return 'entry-level'
  }

  // Calculate total years of experience
  let totalYears = 0
  let currentYear = new Date().getFullYear()
  
  experiences.forEach((exp: any) => {
    const duration = exp.duration || exp.dates || ''
    
    // Look for year patterns in duration
    const yearMatches = duration.match(/(\d{4})/g)
    if (yearMatches && yearMatches.length >= 1) {
      const startYear = parseInt(yearMatches[0])
      let endYear = currentYear
      
      // Check if there's an end year or if it's current
      if (yearMatches.length > 1 && !duration.toLowerCase().includes('present') && !duration.toLowerCase().includes('current')) {
        endYear = parseInt(yearMatches[yearMatches.length - 1])
      }
      
      totalYears += Math.max(0, endYear - startYear)
    } else {
      // Fallback: assume 1 year per role if no clear dates
      totalYears += 1
    }
  })

  // Determine experience level
  if (totalYears <= 2) {
    return 'entry-level'
  } else if (totalYears <= 5) {
    return 'mid-level'
  } else if (totalYears <= 10) {
    return 'senior-level'
  } else {
    return 'expert-level'
  }
}