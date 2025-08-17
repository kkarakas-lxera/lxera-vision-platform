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

    // Agent Pipeline API endpoint (Render deployment)
    const agentPipelineUrl = Deno.env.get('AGENT_PIPELINE_URL') || 'https://lxera-agent-pipeline.onrender.com/api/generate-course'

    // For outline_only mode, skip directly to agent pipeline
    if (generation_mode === 'outline_only') {
      console.log('Outline-only mode detected, skipping skills gap analysis')
      
      // Call the agent pipeline directly for outline generation
      const pipelineRequest = {
        employee_id,
        company_id,
        assigned_by_id,
        job_id,
        generation_mode: 'outline_only'
      }

      const pipelineResponse = await fetch(agentPipelineUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipelineRequest)
      })

      if (!pipelineResponse.ok) {
        const errorText = await pipelineResponse.text()
        throw new Error(`Agent pipeline failed: ${errorText}`)
      }

      const pipelineResult = await pipelineResponse.json()

      if (!pipelineResult.pipeline_success) {
        throw new Error(pipelineResult.error || 'Agent pipeline execution failed')
      }

      // Return outline-only results
      return new Response(
        JSON.stringify({
          success: true,
          plan_id: pipelineResult.plan_id,
          course_title: pipelineResult.course_title,
          employee_name: pipelineResult.employee_name,
          generation_mode: 'outline_only',
          is_outline_only: true,
          processing_time: pipelineResult.total_processing_time
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Update job progress helper
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

    // Phase 1: Retrieve employee data
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

    // Phase 3: Create course plan
    await updateJobProgress({
      current_phase: 'Creating personalized course plan',
      progress_percentage: 30
    })
    
    const priorityGaps = skillGaps
      .filter(g => g.gap_severity !== 'minor')
      .slice(0, 7)

    // Prepare course metadata for the agent pipeline
    // This data can be sent to the pipeline if needed
    const courseMetadata = {
      course_title: `${employee.position} Skills Development Program`,
      employee_name: employee.users?.full_name || 'Employee',
      current_role: employee.position,
      career_goal: employee.career_goal || `Senior ${employee.position}`,
      key_skills: priorityGaps.map(g => g.skill_name).slice(0, 5),
      priority_level: skillGaps.some(g => g.gap_severity === 'critical') ? 'high' : 'medium',
      skills_gaps: priorityGaps
    }

    // Phase 4: Handle Feedback Context (if regenerating)
    let feedbackEnrichedMetadata = courseMetadata;
    let previousCourseContent = null;
    
    if (generation_mode === 'regenerate_with_feedback' && feedback_context && course_id) {
      await updateJobProgress({
        current_phase: 'Processing feedback for regeneration',
        progress_percentage: 30
      })
      
      // Fetch previous course content for context
      const { data: existingContent, error: contentError } = await supabase
        .from('cm_module_content')
        .select('*')
        .eq('content_id', course_id)
        .single()
      
      if (!contentError && existingContent) {
        previousCourseContent = existingContent;
      }
      
      // Enrich metadata with feedback context
      feedbackEnrichedMetadata = {
        ...courseMetadata,
        regeneration_context: {
          feedback_text: feedback_context,
          previous_course_id: course_id,
          previous_content: previousCourseContent,
          iteration_type: 'feedback_revision',
          improvement_focus: feedback_context // AI will parse this for specific improvements
        }
      }
    }

    // Phase 5: Call the Agent Pipeline
    await updateJobProgress({
      current_phase: generation_mode === 'regenerate_with_feedback' ? 'Regenerating course with feedback' : 'Initializing AI agents',
      progress_percentage: 35
    })

    // Prepare request for agent pipeline
    const pipelineRequest = {
      employee_id,
      company_id,
      assigned_by_id,
      job_id,
      generation_mode,
      plan_id,  // Pass plan_id for tracking and remaining_modules mode
      enable_multimedia,  // Pass multimedia flag
      course_metadata: feedbackEnrichedMetadata,
      skills_gaps: priorityGaps,
      feedback_context: feedback_context || null,
      previous_course_content: previousCourseContent
    }

    // Call the agent pipeline API
    const pipelineResponse = await fetch(agentPipelineUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipelineRequest)
    })

    if (!pipelineResponse.ok) {
      const errorText = await pipelineResponse.text()
      throw new Error(`Agent pipeline failed: ${errorText}`)
    }

    const pipelineResult = await pipelineResponse.json()

    if (!pipelineResult.pipeline_success) {
      throw new Error(pipelineResult.error || 'Agent pipeline execution failed')
    }

    // Extract results from pipeline
    const content_id = pipelineResult.content_id
    const assignment_id = pipelineResult.assignment_id

    if (!content_id) {
      throw new Error('No content_id returned from agent pipeline')
    }

    // Final progress update
    await updateJobProgress({
      current_phase: 'Course generation complete',
      progress_percentage: 100,
      successful_courses: 1
    })

    // Update cm_course_plans based on generation mode
    if ((generation_mode === 'full' || generation_mode === 'remaining_modules') && plan_id) {
      await supabase
        .from('cm_course_plans')
        .update({
          full_course_generated_at: new Date().toISOString(),
          metadata: {
            content_id: content_id,
            assignment_id: assignment_id,
            generation_completed: true,
            generation_mode: generation_mode
          }
        })
        .eq('plan_id', plan_id)
        
      console.log(`Updated course plan ${plan_id} with full generation timestamp (mode: ${generation_mode})`)
    }
    
    // Also check if there's a plan for this employee without plan_id
    // (for backward compatibility with existing flows)
    if (generation_mode === 'full' && !plan_id) {
      const { data: existingPlan } = await supabase
        .from('cm_course_plans')
        .select('plan_id')
        .eq('employee_id', employee_id)
        .eq('status', 'completed')
        .is('full_course_generated_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (existingPlan) {
        await supabase
          .from('cm_course_plans')
          .update({
            full_course_generated_at: new Date().toISOString(),
            metadata: {
              content_id: content_id,
              assignment_id: assignment_id,
              generation_completed: true
            }
          })
          .eq('plan_id', existingPlan.plan_id)
          
        console.log(`Updated course plan ${existingPlan.plan_id} with full generation timestamp (auto-detected)`)
      }
    }

    // Check if multimedia was generated
    const multimedia_info = pipelineResult.multimedia_session_id ? {
      multimedia_generated: true,
      multimedia_session_id: pipelineResult.multimedia_session_id,
      multimedia_status: pipelineResult.multimedia_status,
      videos_generated: pipelineResult.videos_generated || 0
    } : {
      multimedia_generated: false
    }

    // Return success response with pipeline results
    return new Response(
      JSON.stringify({
        success: true,
        content_id: content_id,
        assignment_id: assignment_id,
        module_name: pipelineResult.metadata?.module_name || 'Course Module',
        employee_name: employee.users?.full_name || 'Employee',
        module_count: generation_mode === 'first_module' ? 1 : (pipelineResult.total_modules || 1),
        generation_mode,
        is_partial_generation: generation_mode === 'first_module',
        is_completion: generation_mode === 'remaining_modules',
        is_regeneration: generation_mode === 'regenerate_with_feedback',
        token_savings: pipelineResult.token_savings,
        processing_time: pipelineResult.total_processing_time,
        ...multimedia_info
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

