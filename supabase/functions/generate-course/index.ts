import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CourseGenerationRequest {
  employee_id: string
  company_id: string
  assigned_by_id: string
  job_id?: string
  generation_mode?: 'full' | 'first_module' | 'remaining_modules' | 'outline_only' | 'regenerate_with_feedback'
  plan_id?: string // Optional plan_id for tracking outline to full course conversion
  enable_multimedia?: boolean // Optional flag to enable multimedia generation
  course_id?: string // For regeneration with feedback
  feedback_context?: string // Admin feedback for regeneration
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_id, company_id, assigned_by_id, job_id, generation_mode = 'full', plan_id, enable_multimedia = false, course_id, feedback_context } = await req.json() as CourseGenerationRequest

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Groq API integration
    const groqApiKey = Deno.env.get('GROQ_API_KEY') || ''
    const groqModel = 'openai/gpt-oss-20b'  // Same model as Ollama gpt-oss:20b
    const groqBaseUrl = 'https://api.groq.com/openai/v1/chat/completions'

    console.log(`🎯 Generation mode: ${generation_mode}`)
    console.log(`🤖 Using Groq model: ${groqModel} at ${groqBaseUrl}`)

    // Phase 1: Retrieve employee data
    const updateJobProgress = async (updates: any) => {
      if (!job_id) return
      
      await supabase
        .from('course_generation_jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', job_id)
    }

    await updateJobProgress({
      current_phase: 'Retrieving employee data',
      progress_percentage: 10
    })
    
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        id,
        position,
        department,
        career_goal,
        key_tools,
        company_id,
        current_position_id,
        users!inner (
          full_name,
          email
        )
      `)
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      throw new Error('Employee not found')
    }

    console.log(`👤 Employee: ${employee.users?.full_name} (${employee.position})`)

    // Phase 2: Retrieve existing skills gap analysis
    await updateJobProgress({
      current_phase: 'Retrieving skills gap analysis',
      progress_percentage: 20,
      current_employee_name: employee.users?.full_name || 'Unknown'
    })
    
    // Get skills from employee_skills table
    const { data: employeeSkills, error: skillsError } = await supabase
      .from('employee_skills')
      .select('*')
      .eq('employee_id', employee_id)

    if (skillsError || !employeeSkills || employeeSkills.length === 0) {
      throw new Error('Skills data not found. Please complete skills analysis first.')
    }

    console.log(`📊 Found ${employeeSkills.length} skills for analysis`)

    // Get position requirements for gap calculation
    const { data: currentPosition } = await supabase
      .from('st_company_positions')
      .select('required_skills, nice_to_have_skills')
      .eq('id', employee.current_position_id)
      .single()

    // Build a map of required skill levels from position
    const requiredSkillsMap = new Map()
    if (currentPosition?.required_skills) {
      currentPosition.required_skills.forEach((skill: any) => {
        requiredSkillsMap.set(skill.skill_name.toLowerCase(), {
          required_level: skill.proficiency_level || 3,
          is_mandatory: skill.is_mandatory || false
        })
      })
    }
    if (currentPosition?.nice_to_have_skills) {
      currentPosition.nice_to_have_skills.forEach((skill: any) => {
        if (!requiredSkillsMap.has(skill.skill_name.toLowerCase())) {
          requiredSkillsMap.set(skill.skill_name.toLowerCase(), {
            required_level: skill.proficiency_level || 2,
            is_mandatory: false
          })
        }
      })
    }

    // Extract skills gaps by comparing employee skills with position requirements
    const skillGaps: Array<{
      skill_name: string
      gap_severity: string
      current_level: number
      required_level: number
      skill_type: string
    }> = []
    
    // Process employee skills to identify gaps
    employeeSkills.forEach((skill: any) => {
      const skillKey = skill.skill_name.toLowerCase()
      const requirement = requiredSkillsMap.get(skillKey)
      const currentLevel = skill.proficiency || 0 // proficiency is 0-3 scale
      
      if (requirement) {
        // Map 0-3 scale to required level comparison
        const normalizedRequired = Math.min(requirement.required_level, 3)
        
        if (currentLevel < normalizedRequired) {
          // Calculate gap severity based on the difference
          let gap_severity = 'minor'
          const gap = normalizedRequired - currentLevel
          
          if (requirement.is_mandatory && gap >= 2) {
            gap_severity = 'critical'
          } else if (requirement.is_mandatory && gap >= 1) {
            gap_severity = 'major'
          } else if (gap >= 2) {
            gap_severity = 'major'
          } else if (gap >= 1) {
            gap_severity = 'moderate'
          }
          
          skillGaps.push({
            skill_name: skill.skill_name,
            gap_severity,
            current_level: currentLevel,
            required_level: normalizedRequired,
            skill_type: skill.source === 'position_requirement' ? 'required' : 'general'
          })
        }
      } else if (skill.proficiency < 2) {
        // Skills not in position requirements but low proficiency
        skillGaps.push({
          skill_name: skill.skill_name,
          gap_severity: skill.proficiency === 0 ? 'moderate' : 'minor',
          current_level: skill.proficiency,
          required_level: 2,
          skill_type: 'general'
        })
      }
    })
    
    // Also check for missing mandatory skills
    requiredSkillsMap.forEach((requirement, skillName) => {
      if (requirement.is_mandatory) {
        const hasSkill = employeeSkills.some((s: any) => 
          s.skill_name.toLowerCase() === skillName
        )
        if (!hasSkill) {
          skillGaps.push({
            skill_name: skillName.split(' ').map((w: string) => 
              w.charAt(0).toUpperCase() + w.slice(1)
            ).join(' '),
            gap_severity: 'critical',
            current_level: 0,
            required_level: requirement.required_level,
            skill_type: 'required'
          })
        }
      }
    })
    
    // If no gaps found, create some development opportunities
    if (skillGaps.length === 0 && employeeSkills.length > 0) {
      // Create development opportunities for skills that could be improved
      employeeSkills.slice(0, 3).forEach((skill: any) => {
        if (skill.proficiency < 3) {
          skillGaps.push({
            skill_name: skill.skill_name,
            gap_severity: 'minor',
            current_level: skill.proficiency,
            required_level: Math.min(skill.proficiency + 1, 3),
            skill_type: 'development'
          })
        }
      })
    }

    if (skillGaps.length === 0) {
      throw new Error('No skills gaps found to generate course')
    }

    // Sort by severity (critical > major > moderate > minor)
    const severityOrder = { critical: 0, major: 1, moderate: 2, minor: 3 }
    skillGaps.sort((a, b) => severityOrder[a.gap_severity] - severityOrder[b.gap_severity])

    console.log(`🎯 Found ${skillGaps.length} skill gaps to address`)

    // Validate Groq API key
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not configured')
    }

    console.log(`🎯 Processing generation mode: ${generation_mode}`)
    console.log(`👤 Employee: ${employee.users?.full_name}`)
    console.log(`🎯 Skill gaps count: ${skillGaps.length}`)
    
    // Route to appropriate generation function based on mode
    let result: any
    
    switch (generation_mode) {
      case 'outline_only':
        console.log('📋 Generating course outline only')
        result = await generateCourseOutline(
          employee,
          skillGaps,
          groqApiKey,
          groqModel
        )
        
        if (!result.success) {
          throw new Error(result.error || 'Course outline generation failed')
        }
        
        // Store outline in database
        const plan_id = crypto.randomUUID()
        const courseRecord = {
          plan_id,
          employee_id,
          employee_name: employee.users?.full_name || 'Unknown',
          session_id: job_id || crypto.randomUUID(),
          company_id,
          course_title: result.course_title,
          course_structure: result.course_structure,
          prioritized_gaps: { gaps: skillGaps },
          research_strategy: { strategy: 'direct_groq_generation' },
          learning_path: { path: 'personalized_modules' },
          research_queries: { queries: [] },
          total_modules: result.course_structure?.modules?.length || 4,
          course_duration_weeks: result.course_structure?.total_duration_weeks || 4,
          status: 'completed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { error: insertError } = await supabase
          .from('cm_course_plans')
          .insert(courseRecord)

        if (insertError) {
          console.error('❌ Failed to store course plan:', insertError)
          throw new Error(`Failed to store course plan: ${insertError.message}`)
        }

        console.log(`✅ Course outline generated and stored with plan_id: ${plan_id}`)
        
        return new Response(
          JSON.stringify({
            success: true,
            plan_id,
            course_title: result.course_title,
            employee_name: employee.users?.full_name || 'Unknown',
            generation_mode: 'outline_only',
            is_outline_only: true,
            processing_time: result.processing_time || 0
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )

      case 'full':
      case 'first_module':
      case 'remaining_modules':
      case 'regenerate_with_feedback':
        console.log(`🤖 Routing ${generation_mode} to Render agent pipeline`)
        
        // Route advanced generation modes to Render LangGraph pipeline
        const agentPipelineUrl = Deno.env.get('AGENT_PIPELINE_URL') || 'https://lxera-agent-pipeline.onrender.com/api/generate-course'
        
        await updateJobProgress({
          current_phase: `Routing to agent pipeline for ${generation_mode}`,
          progress_percentage: 10
        })
        
        const pipelineRequest = {
          employee_id,
          company_id,
          assigned_by_id,
          job_id,
          generation_mode,
          plan_id,
          enable_multimedia,
          course_id,
          feedback_context
        }
        
        console.log(`📤 Calling agent pipeline: ${agentPipelineUrl}`)
        console.log(`📋 Request payload:`, JSON.stringify(pipelineRequest, null, 2))
        
        const pipelineResponse = await fetch(agentPipelineUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pipelineRequest)
        })
        
        if (!pipelineResponse.ok) {
          const errorText = await pipelineResponse.text()
          console.error(`❌ Agent pipeline failed (${pipelineResponse.status}):`, errorText)
          throw new Error(`Agent pipeline failed: ${pipelineResponse.status} - ${errorText}`)
        }
        
        const pipelineResult = await pipelineResponse.json()
        console.log(`📥 Agent pipeline response:`, pipelineResult)
        
        if (!pipelineResult.pipeline_success) {
          throw new Error(pipelineResult.error || 'Agent pipeline execution failed')
        }
        
        result = {
          success: true,
          plan_id: pipelineResult.plan_id,
          course_title: pipelineResult.course_title,
          processing_time: pipelineResult.processing_time,
          source: 'agent_pipeline'
        }
        break

      default:
        throw new Error(`Unknown generation mode: ${generation_mode}`)
    }

    if (!result.success) {
      throw new Error(result.error || `${generation_mode} generation failed`)
    }

    console.log(`✅ ${generation_mode} generation completed successfully!`)
    
    return new Response(
      JSON.stringify({
        success: true,
        ...result,
        generation_mode,
        employee_name: employee.users?.full_name || 'Unknown'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Course generation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Course generation functions using Groq API
async function generateCourseOutline(
  employee: any,
  skillGaps: any[],
  groqApiKey: string,
  groqModel: string
) {
  const startTime = Date.now()
  
  try {
    console.log(`🔗 Connecting to Groq API`)
    
    // Prepare employee context
    const employeeContext = {
      name: employee.users?.full_name || 'Employee',
      position: employee.position || 'Professional',
      department: employee.department || 'General',
      career_goal: employee.career_goal || 'Professional development',
      key_tools: employee.key_tools || []
    }
    
    // Prepare skills gap context
    const criticalGaps = skillGaps
      .filter(gap => gap.gap_severity === 'critical')
      .slice(0, 5)
      .map(gap => `${gap.skill_name}: ${gap.current_level}/${gap.required_level}`)
      .join(', ')
    
    const majorGaps = skillGaps
      .filter(gap => gap.gap_severity === 'major')
      .slice(0, 3)
      .map(gap => `${gap.skill_name}: ${gap.current_level}/${gap.required_level}`)
      .join(', ')

    console.log(`🔍 Critical gaps: ${criticalGaps || 'None'}`)
    console.log(`🔍 Major gaps: ${majorGaps || 'None'}`)

    // Create the prompt for Ollama
    const prompt = `Create a personalized course plan for ${employeeContext.name}, ${employeeContext.position} in ${employeeContext.department} department.

CRITICAL SKILL GAPS: ${criticalGaps}
MAJOR SKILL GAPS: ${majorGaps}
CAREER GOAL: ${employeeContext.career_goal}
KEY TOOLS: ${employeeContext.key_tools.join(', ')}

Generate a comprehensive course structure with:
- Appropriate course title
- 4-6 practical modules
- 4-8 weeks total duration
- Focus on addressing critical gaps first

Return ONLY valid JSON in this exact format:
{
  "course_title": "Specific course title",
  "total_duration_weeks": 6,
  "modules": [
    {
      "module_id": 1,
      "module_name": "Module title",
      "week": 1,
      "priority": "critical",
      "skill_gap_addressed": "specific skill",
      "duration_weeks": 2,
      "description": "Module description"
    }
  ]
}`

    // Call Groq API with detailed logging
    console.log(`📤 Sending request to Groq API...`)
    console.log(`🤖 Model: ${groqModel}`)
    console.log(`📋 Request payload size: ${prompt.length} characters`)
    console.log(`⏰ Request start time: ${new Date().toISOString()}`)
    
    const requestStart = Date.now()
    
    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log(`⏰ Request timeout after 45 seconds, aborting...`)
      controller.abort()
    }, 45000)
    
    let response: any
    try {
      console.log('🚀 Executing fetch to Groq API...')
      
      const requestBody = {
        model: groqModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning designer who creates personalized course structures. Always return valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' }
      }
      
      console.log(`📦 Request body size: ${JSON.stringify(requestBody).length} bytes`)
      
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      
      clearTimeout(timeoutId)
      console.log(`📡 Groq API response received after ${Date.now() - requestStart}ms`)
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error(`❌ Groq API request failed:`, error.message)
      console.error(`❌ Error name: ${error.name}`)
      console.error(`❌ Error stack: ${error.stack}`)
      
      if (error.name === 'AbortError') {
        console.error(`❌ Groq request timed out after 45 seconds`)
        throw new Error('Groq request timed out - model may be too slow or overloaded')
      }
      throw new Error(`Groq API request failed: ${error.message}`)
    }
    
    const requestTime = Date.now() - requestStart
    console.log(`⏱️ Groq API request completed in ${requestTime}ms`)
    console.log(`📊 Response status: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Groq API error: ${response.status} - ${errorText}`)
      throw new Error(`Groq API failed: ${response.status} - ${errorText}`)
    }

    console.log(`📥 Reading Groq response...`)
    const result = await response.json()
    console.log('🤖 Groq response received successfully')
    console.log(`📝 Response has choices: ${!!result.choices}`)
    console.log(`📝 Content length: ${result.choices?.[0]?.message?.content?.length || 0} characters`)

    // Extract and parse the course structure
    let courseStructure: any
    let jsonStr = ''
    try {
      const content = result.choices?.[0]?.message?.content || ''
      console.log(`🔍 Parsing response content (${content.length} chars)`)
      console.log(`📄 Raw content preview: ${content.substring(0, 200)}...`)
      
      // Parse JSON directly (Groq returns clean JSON with response_format)
      jsonStr = content
      console.log(`🧪 Attempting to parse JSON...`)
      courseStructure = JSON.parse(jsonStr)
      console.log(`✅ Course structure parsed successfully: "${courseStructure.course_title}"`)
      console.log(`📊 Structure info: ${courseStructure.modules?.length || 0} modules, ${courseStructure.total_duration_weeks || 0} weeks`)
      
    } catch (parseError: any) {
      console.error('❌ Failed to parse Groq response:', parseError)
      console.error(`💣 Parse error details:`, parseError.message)
      console.error(`📄 Failed JSON string (first 500 chars):`, jsonStr?.substring(0, 500))
      throw new Error(`Failed to parse course structure from Groq: ${parseError.message}`)
    }

    const processingTime = Date.now() - startTime
    console.log(`⏱️ Groq processing completed in ${processingTime}ms`)

    return {
      success: true,
      course_title: courseStructure.course_title,
      course_structure: courseStructure,
      processing_time: processingTime
    }

  } catch (error) {
    console.error('❌ Groq integration error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Helper function to generate detailed module content (used only for outline_only mode)
async function generateModuleContent(
  module: any,
  courseTitle: string,
  groqApiKey: string,
  groqModel: string
) {
  const prompt = `Generate detailed content for this course module:

Course: ${courseTitle}
Module: ${module.module_name}
Duration: ${module.duration_hours || 3} hours
Learning Objectives: ${module.learning_objectives?.join(', ') || 'Professional development'}
Key Topics: ${module.key_topics?.join(', ') || 'Core concepts'}

Create comprehensive module content including:
- Introduction
- Learning objectives
- Core content sections
- Practical exercises
- Key takeaways
- Resources and next steps

Return structured JSON with sections and content.`
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          {
            role: 'system',
            content: 'You are an expert instructional designer. Create detailed, engaging module content in structured JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      })
    })
    
    if (!response.ok) {
      throw new Error(`Groq API failed: ${response.status}`)
    }
    
    const result = await response.json()
    const content = result.choices?.[0]?.message?.content
    
    return JSON.parse(content || '{}')
    
  } catch (error) {
    console.error(`❌ Error generating module content:`, error)
    return {
      error: 'Failed to generate module content',
      module_name: module.module_name
    }
  }
}