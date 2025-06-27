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
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_id, company_id, assigned_by_id, job_id } = await req.json() as CourseGenerationRequest

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Agent Pipeline API endpoint (you'll need to deploy the Python API server)
    const agentPipelineUrl = Deno.env.get('AGENT_PIPELINE_URL') || 'http://localhost:8080/generate-course'

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
    
    // Get skills profile with gap analysis already completed
    const { data: profile, error: profileError } = await supabase
      .from('st_employee_skills_profile')
      .select('*')
      .eq('employee_id', employee_id)
      .single()

    if (profileError || !profile || !profile.gap_analysis_completed_at) {
      throw new Error('Skills gap analysis not found. Please complete skills analysis first.')
    }

    // Get position requirements for context
    const { data: positionReqs } = await supabase
      .from('st_position_requirements')
      .select('required_skills')
      .eq('position', employee.position)
      .eq('company_id', company_id)
      .single()

    // Extract skills gaps from the existing analysis
    const skillGaps = []
    
    // Process technical skills - convert array format to gap analysis
    if (profile.technical_skills && Array.isArray(profile.technical_skills)) {
      profile.technical_skills.forEach((skill: any) => {
        // For testing, create mock gaps for skills where proficiency < 4
        if (skill.proficiency_level < 4) {
          skillGaps.push({
            skill_name: skill.skill_name,
            gap_severity: skill.proficiency_level < 2 ? 'critical' : skill.proficiency_level < 3 ? 'major' : 'moderate',
            current_level: skill.proficiency_level || 2,
            required_level: 4,
            skill_type: 'technical'
          })
        }
      })
    }
    
    // Process soft skills - convert array format to gap analysis  
    if (profile.soft_skills && Array.isArray(profile.soft_skills)) {
      profile.soft_skills.forEach((skill: any) => {
        // For testing, create mock gaps for skills where proficiency < 4
        if (skill.proficiency_level < 4) {
          skillGaps.push({
            skill_name: skill.skill_name,
            gap_severity: skill.proficiency_level < 2 ? 'critical' : skill.proficiency_level < 3 ? 'major' : 'moderate',
            current_level: skill.proficiency_level || 2,
            required_level: 4,
            skill_type: 'soft'
          })
        }
      })
    }
    
    // If no gaps from proficiency analysis, create some mock gaps for testing
    if (skillGaps.length === 0 && profile.technical_skills && Array.isArray(profile.technical_skills)) {
      // Create mock gaps for the first 3 technical skills for testing
      profile.technical_skills.slice(0, 3).forEach((skill: any) => {
        skillGaps.push({
          skill_name: skill.skill_name,
          gap_severity: 'moderate',
          current_level: skill.proficiency_level || 3,
          required_level: 5,
          skill_type: 'technical'
        })
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

    const coursePlan = {
      course_title: `${employee.position} Skills Development Program`,
      employee_name: employee.users?.full_name || 'Employee',
      current_role: employee.position,
      career_goal: employee.career_goal || `Senior ${employee.position}`,
      key_tools: priorityGaps.map(g => g.skill_name).slice(0, 5),
      personalization_level: 'advanced',
      priority_level: skillGaps.some(g => g.gap_severity === 'critical') ? 'high' : 'medium',
      learning_objectives: priorityGaps.map(gap => ({
        skill: gap.skill_name,
        from_level: gap.current_level,
        to_level: gap.required_level,
      })),
    }

    // Phase 4: Call the Agent Pipeline
    await updateJobProgress({
      current_phase: 'Initializing AI agents',
      progress_percentage: 35
    })

    // Prepare request for agent pipeline
    const pipelineRequest = {
      employee_id,
      company_id,
      assigned_by_id,
      job_id
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

    // Return success response with pipeline results
    return new Response(
      JSON.stringify({
        success: true,
        content_id: content_id,
        assignment_id: assignment_id,
        module_name: pipelineResult.metadata?.module_name || 'Course Module',
        employee_name: employee.users?.full_name || 'Employee',
        module_count: 1,
        token_savings: pipelineResult.token_savings,
        processing_time: pipelineResult.total_processing_time
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

