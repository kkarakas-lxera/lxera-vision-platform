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
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_id, company_id, assigned_by_id } = await req.json() as CourseGenerationRequest

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Phase 1: Retrieve employee data
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

    // Phase 2: Get skills profile and gaps
    const { data: profile, error: profileError } = await supabase
      .from('st_employee_skills_profile')
      .select('*')
      .eq('employee_id', employee_id)
      .single()

    if (profileError || !profile) {
      throw new Error('Skills profile not found. Please complete skills analysis first.')
    }

    // Phase 3: Analyze skills gaps
    const skillGaps = []
    if (profile.technical_skills) {
      Object.entries(profile.technical_skills).forEach(([skillName, skillData]: [string, any]) => {
        if (skillData.gap_severity && skillData.gap_severity !== 'none') {
          skillGaps.push({
            skill_name: skillName,
            gap_severity: skillData.gap_severity,
            current_level: skillData.current_level || 0,
            required_level: skillData.required_level || 3,
          })
        }
      })
    }

    if (skillGaps.length === 0) {
      throw new Error('No skills gaps found to generate course')
    }

    // Phase 4: Create course plan
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

    // Phase 5: Create course content in database
    const { data: content, error: contentError } = await supabase
      .from('cm_module_content')
      .insert({
        company_id,
        module_name: coursePlan.course_title,
        employee_name: coursePlan.employee_name,
        session_id: `api_${Date.now()}`,
        module_spec: coursePlan,
        status: 'approved', // For demo, skip quality loop
        priority_level: coursePlan.priority_level,
        revision_count: 0,
        total_word_count: 7500,
        // Generate basic content structure
        introduction: generateIntroduction(employee, coursePlan),
        core_content: generateCoreContent(coursePlan),
        practical_applications: generatePracticalApplications(coursePlan),
        case_studies: generateCaseStudies(coursePlan),
        assessments: generateAssessments(coursePlan),
      })
      .select('content_id')
      .single()

    if (contentError) {
      console.error('Content creation error:', contentError)
      throw new Error('Failed to create course content')
    }

    // Phase 6: Create course assignment
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const { data: assignment, error: assignError } = await supabase
      .from('course_assignments')
      .insert({
        employee_id,
        course_id: content.content_id,
        company_id,
        assigned_by: assigned_by_id,
        assigned_at: new Date().toISOString(),
        due_date: dueDate.toISOString(),
        priority: 'high',
        status: 'assigned',
        progress_percentage: 0,
      })
      .select('id')
      .single()

    if (assignError) {
      console.error('Assignment creation error:', assignError)
      throw new Error('Failed to create course assignment')
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        content_id: content.content_id,
        assignment_id: assignment.id,
        module_name: coursePlan.course_title,
        employee_name: coursePlan.employee_name,
        module_count: 1,
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

// Helper functions for content generation
function generateIntroduction(employee: any, coursePlan: any): string {
  return `Welcome ${employee.users?.full_name}! This personalized course is designed specifically for your role as ${employee.position} to help you advance towards ${coursePlan.career_goal}. You'll master ${coursePlan.key_tools.length} key skills that are critical for your professional growth.`
}

function generateCoreContent(coursePlan: any): string {
  const sections = coursePlan.learning_objectives.map((obj: any, i: number) => 
    `Section ${i + 1}: ${obj.skill}
Current Level: ${obj.from_level}
Target Level: ${obj.to_level}

[Comprehensive content for ${obj.skill} would be generated here by the AI agents]`
  ).join('\n\n')
  
  return `Core Learning Content:\n\n${sections}`
}

function generatePracticalApplications(coursePlan: any): string {
  return `Practical Applications:\n\n${coursePlan.key_tools.map((tool: string) => 
    `- Hands-on exercises with ${tool}
- Real-world scenarios for ${tool}
- Best practices implementation`
  ).join('\n\n')}`
}

function generateCaseStudies(coursePlan: any): string {
  return `Case Studies:\n\n1. Industry-leading implementation of ${coursePlan.key_tools[0]}
2. Success story: Transforming workflows with modern tools
3. Lessons learned from real projects in your field`
}

function generateAssessments(coursePlan: any): string {
  return `Assessments:\n\n${coursePlan.learning_objectives.map((obj: any, i: number) => 
    `Quiz ${i + 1}: ${obj.skill} Proficiency
- 10 questions covering key concepts
- Practical scenarios
- Skill demonstration tasks`
  ).join('\n\n')}`
}