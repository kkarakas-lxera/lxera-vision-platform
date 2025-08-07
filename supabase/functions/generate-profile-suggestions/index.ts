import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_id, step_data } = await req.json()

    if (!employee_id) {
      throw new Error('employee_id is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Generating suggestions for employee: ${employee_id}`)
    console.log(`Step data received:`, JSON.stringify(step_data))

    // Get employee data with all relevant information
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        *,
        positions:current_position_id (
          position_title,
          department,
          required_skills,
          nice_to_have_skills
        ),
        employee_skills (
          skill_name,
          proficiency,
          source,
          years_experience
        )
      `)
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      throw new Error('Failed to fetch employee data')
    }

    // Get work experience from profile sections
    const { data: sections } = await supabase
      .from('employee_profile_sections')
      .select('section_name, data')
      .eq('employee_id', employee_id)
      .in('section_name', ['work_experience', 'education', 'skills'])

    console.log('Profile sections:', sections)
    
    const workExperience = sections?.find(s => s.section_name === 'work_experience')?.data || {}
    const education = sections?.find(s => s.section_name === 'education')?.data || {}
    const skills = employee.employee_skills || []

    console.log('Context for AI:', {
      position: employee.positions?.position_title || employee.position || 'Unknown',
      department: employee.positions?.department || employee.department || 'Unknown',
      currentProjects: step_data?.currentProjects || [],
      teamSize: step_data?.teamSize || 'Unknown',
      roleInTeam: step_data?.roleInTeam || 'Unknown',
      workExperience: workExperience.experiences || workExperience.experience || [],
      education: education.education || [],
      skills: skills.map((s: any) => s.skill_name).slice(0, 20), // Top 20 skills
      yearsOfExperience: calculateYearsOfExperience(workExperience),
      skillsMatchScore: employee.cv_analysis_data?.skills_match_score || 0
    })
    
    // Prepare context for AI
    const context = {
      position: employee.positions?.position_title || employee.position || 'Unknown',
      department: employee.positions?.department || employee.department || 'Unknown',
      currentProjects: step_data?.currentProjects || [],
      teamSize: step_data?.teamSize || 'Unknown',
      roleInTeam: step_data?.roleInTeam || 'Unknown',
      workExperience: workExperience.experiences || workExperience.experience || [],
      education: education.education || [],
      skills: skills.map((s: any) => s.skill_name).slice(0, 20), // Top 20 skills
      yearsOfExperience: calculateYearsOfExperience(workExperience),
      skillsMatchScore: employee.cv_analysis_data?.skills_match_score || 0
    }

    // Generate suggestions using OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `Based on the following employee profile, generate personalized professional challenges they might be facing and growth areas they should focus on.

Employee Context:
- Position: ${context.position}
- Department: ${context.department}
- Years of Experience: ${context.yearsOfExperience}
- Team Size: ${context.teamSize}
- Role in Team: ${context.roleInTeam}
- Current Projects: ${context.currentProjects.join(', ')}
- Top Skills: ${context.skills.slice(0, 10).join(', ')}
- Skills Match Score: ${context.skillsMatchScore}%

Generate exactly 12 professional challenges and 12 growth areas that are:
1. Highly specific to their role and experience level
2. Based on their current projects and team dynamics
3. Addressing gaps between their current skills and position requirements
4. Forward-looking and career-advancing
5. Mix of technical, leadership, and soft skill areas

Format the response as JSON:
{
  "challenges": [
    "Specific challenge 1",
    "Specific challenge 2",
    ...
  ],
  "growthAreas": [
    "Specific growth area 1",
    "Specific growth area 2",
    ...
  ]
}

Make them actionable, specific, and relevant. Avoid generic suggestions.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a career development expert specializing in creating personalized professional development plans. Generate specific, actionable suggestions based on the employee profile.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const suggestions = JSON.parse(aiResponse.choices[0].message.content)
    
    console.log('Generated suggestions:', { challenges: suggestions.challenges?.length || 0, growthAreas: suggestions.growthAreas?.length || 0 })

    // Store suggestions in a temporary table or return directly
    const { error: storeError } = await supabase
      .from('employee_profile_suggestions')
      .upsert({
        employee_id,
        challenges: suggestions.challenges,
        growth_areas: suggestions.growthAreas,
        generated_at: new Date().toISOString(),
        context_used: context
      }, { onConflict: 'employee_id' })

    if (storeError) {
      console.error('Error storing suggestions:', storeError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        challenges: suggestions.challenges,
        growthAreas: suggestions.growthAreas,
        message: 'Personalized suggestions generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-profile-suggestions:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function calculateYearsOfExperience(workExperience: any): number {
  if (!workExperience || (!workExperience.experiences && !workExperience.experience)) {
    return 0
  }

  const experiences = workExperience.experiences || workExperience.experience || []
  if (!Array.isArray(experiences) || experiences.length === 0) {
    return 0
  }

  // Find the earliest start date
  let earliestYear = new Date().getFullYear()
  
  experiences.forEach((exp: any) => {
    const duration = exp.duration || exp.dates || ''
    const yearMatch = duration.match(/(\d{4})/)
    if (yearMatch) {
      const year = parseInt(yearMatch[1])
      if (year < earliestYear) {
        earliestYear = year
      }
    }
  })

  return new Date().getFullYear() - earliestYear
}