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
  let employee_id: string | undefined

  try {
    const requestBody = await req.json()
    employee_id = requestBody.employee_id

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
    console.log(`[${requestId}] Request body:`, JSON.stringify(requestBody))

    // First, try to get the employee data with user relationship
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        *,
        users!employees_user_id_fkey (
          email,
          full_name
        )
      `)
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      console.error(`[${requestId}] Employee fetch error:`, empError)
      throw new Error(`Failed to fetch employee data: ${empError?.message || 'Employee not found'}`)
    }

    // Get position data separately
    let positionData = null
    if (employee.current_position_id) {
      const { data: position } = await supabase
        .from('st_company_positions')
        .select('position_title, department, required_skills, nice_to_have_skills')
        .eq('id', employee.current_position_id)
        .single()
      positionData = position
    }

    // Get skills profile data separately
    let skillsProfileData = null
    const { data: skillsProfile } = await supabase
      .from('st_employee_skills_profile')
      .select('extracted_skills, skills_match_score, gap_analysis_data')
      .eq('employee_id', employee_id)
      .single()
    skillsProfileData = skillsProfile

    // Combine the data
    employee.st_company_positions = positionData
    employee.st_employee_skills_profile = skillsProfileData
    
    console.log(`[${requestId}] Employee data fetched - Name: ${employee.full_name || employee.users?.full_name || 'Not set'}, Email: ${employee.email || employee.users?.email || 'Not set'}`)

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
    const emailAddress = employee.email || employee.users?.email
    const fullName = employee.full_name || employee.users?.full_name
    const context: CourseGenerationContext = {
      employee_name: fullName || (emailAddress ? emailAddress.split('@')[0] : null) || `Employee ${employee.id.substring(0, 8)}`,
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
    
    console.log(`[${requestId}] Context prepared for ${context.employee_name} (${context.experience_level})`)

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
    const enhancedPrompt = `Create a highly personalized 4-week course outline for ${context.employee_name} that perfectly harmonizes their professional challenges, growth areas, and skills gaps.

LEARNER PROFILE ANALYSIS:
- Name: ${context.employee_name}
- Current Role: ${context.position}
- Department: ${context.department}
- Experience Level: ${context.experience_level}
- Team Context: ${context.role_in_team} in a ${context.team_size} team
- Skills Match Score: ${context.skills_match_score}%
- Current Expertise: ${context.top_skills.slice(0, 5).join(', ')}
- Active Projects: ${context.current_projects.slice(0, 3).join(', ')}

PERSONALIZATION MAPPING:
1. PROFESSIONAL CHALLENGES (Pain Points to Solve):
   ${context.professional_challenges.slice(0, 4).map((c, i) => `   ${i + 1}. ${c}`).join('\n')}

2. GROWTH PRIORITIES (Career Aspirations):
   ${context.growth_priorities.slice(0, 4).map((g, i) => `   ${i + 1}. ${g}`).join('\n')}

3. SKILLS GAPS (What's Missing for Next Level):
   ${context.required_skills.slice(0, 4).map((s, i) => `   ${i + 1}. ${typeof s === 'string' ? s : s.skill || 'Unknown'}`).join('\n')}

HARMONIZATION STRATEGY:
Create modules that simultaneously:
- Solve a specific professional challenge
- Develop a growth priority skill
- Fill an identified skills gap
- Build on their existing expertise (${context.top_skills.slice(0, 3).join(', ')})

COURSE DESIGN PRINCIPLES:
1. Each module must address AT LEAST one challenge AND one growth area
2. Progressive learning path: Foundation → Application → Mastery → Leadership
3. ${(personalizationFactors.practical_emphasis * 100).toFixed(0)}% practical, hands-on content
4. Direct application to their ${context.position} role and current projects
5. Clear connection between learning and career advancement

REQUIRED OUTPUT FORMAT (JSON):
{
  "course_title": "[Specific Title that Reflects Their #1 Challenge + Role]",
  "description": "A personalized 4-week course that addresses your specific challenges: [challenge 1], [challenge 2], while building skills in [growth area 1], [growth area 2] to advance your career as a ${context.position}.",
  "total_duration_weeks": 4,
  "total_duration_hours": 20,
  "target_audience": "${context.employee_name} - ${context.experience_level} ${context.position}",
  "prerequisites": [
    "Your existing skills in [top skill 1 from their profile]",
    "Current experience with [tool/process they already use]"
  ],
  "learning_outcomes": [
    "Overcome [specific challenge 1] by implementing [solution]",
    "Master [growth priority 1] to [specific career outcome]",
    "Fill skill gap in [missing skill 1] through practical application",
    "Transform from [current state] to [desired future state]"
  ],
  "modules": [
    {
      "module_id": 1,
      "module_name": "[Action-Oriented Title that Addresses Challenge #1]",
      "week": 1,
      "duration_hours": 3,
      "priority": "critical",
      "skill_gap_addressed": "[Specific gap from their profile]",
      "challenge_addressed": "[Specific challenge from their profile]",
      "growth_area_developed": "[Specific growth priority from their profile]",
      "learning_objectives": [
        "Map this to solving their challenge #1",
        "Connect to their growth priority #1",
        "Fill specific skill gap #1"
      ],
      "key_topics": [
        "Topic directly related to their ${context.position} role",
        "Application to their current project: ${context.current_projects[0] || 'daily work'}",
        "Building on their strength in ${context.top_skills[0] || 'existing skills'}"
      ],
      "difficulty_level": "beginner"
    }
  ]
}

MODULE GENERATION RULES:
1. Generate EXACTLY 6-8 modules (this is an OUTLINE, not full course content)
2. Each module MUST explicitly state which challenge, growth area, and skill gap it addresses
3. Module progression: Week 1 (Foundation) → Week 2 (Application) → Week 3 (Advanced) → Week 4 (Mastery)
4. Module names must be SPECIFIC to their role and challenges, not generic
5. Every module must show clear harmony between challenges + growth areas + skill gaps

EXAMPLE MODULE NAMING:
❌ BAD: "Communication Skills" or "Advanced Techniques"
✅ GOOD: "Executive Presentation Skills for Data-Driven ${context.position} Decisions" 
✅ GOOD: "Automating ${context.professional_challenges[0] || 'Daily Tasks'} with ${context.top_skills[0] || 'Your Tools'}"

CRITICAL: This course outline is their REWARD for completing the profile. Every module must feel personally crafted for ${context.employee_name}, directly addressing their specific situation, challenges, and aspirations. Show them a clear path from where they are to where they want to be.`

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
            content: 'You are an expert learning and development specialist who creates highly personalized course OUTLINES (not full courses). Your #1 priority is to harmonize the learner\'s professional challenges, growth aspirations, and skill gaps into a cohesive learning journey. Every module must explicitly show how it addresses their specific situation. Use their actual challenges and growth areas as module titles and content focus. Make the course feel like it was custom-designed for this individual, because it is. Follow the exact JSON structure provided. ALWAYS respond with valid JSON only, no additional text or markdown.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent structure
        max_tokens: 3000 // Increased for comprehensive modules
        // Note: response_format not supported with GPT-4
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
    
    // Ensure modules have required structure
    if (!enhancedCourseOutline.modules || enhancedCourseOutline.modules.length === 0) {
      const errorContext: ErrorLogContext = { requestId, functionName, employeeId: employee_id }
      return createErrorResponse(
        new Error('No modules returned from AI - please try again'),
        errorContext,
        502
      )
    }

    // Store the course outline in the existing cm_course_plans table
    console.log(`[${requestId}] Storing course outline in cm_course_plans table...`)
    const { error: storeError } = await supabase
      .from('cm_course_plans')
      .insert({
        plan_id: globalThis.crypto.randomUUID(),
        employee_id,
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