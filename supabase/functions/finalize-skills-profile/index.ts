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
    const { employee_id } = await req.json()

    if (!employee_id) {
      throw new Error('employee_id is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get validated skills
    const { data: validatedSkills, error: skillsError } = await supabase
      .from('employee_skills_validation')
      .select('*')
      .eq('employee_id', employee_id)
      .gt('proficiency_level', 0) // Only skills they have

    if (skillsError) throw skillsError

    // Transform validated skills to profile format
    const extractedSkills = validatedSkills.map(skill => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      category: skill.is_from_position ? 'technical' : 'soft',
      proficiency_level: skill.proficiency_level,
      years_experience: null, // Could be enhanced later
      evidence: skill.is_from_cv ? 'Found in CV' : 'Self-reported',
      context: skill.is_from_position ? 'Required for position' : 'Additional skill',
      confidence: 1.0, // 100% confidence since user validated
      source: 'employee_validation'
    }))

    // Get employee position for gap calculation
    const { data: employee } = await supabase
      .from('employees')
      .select(`
        current_position_id,
        st_company_positions!employees_current_position_id_fkey (
          required_skills
        )
      `)
      .eq('id', employee_id)
      .single()

    // Calculate skills match score
    let matchScore = null
    if (employee?.st_company_positions?.required_skills) {
      const requiredSkills = employee.st_company_positions.required_skills
      const matchedSkills = requiredSkills.filter((reqSkill: any) => 
        validatedSkills.some(valSkill => 
          valSkill.skill_name === reqSkill.skill_name && 
          valSkill.proficiency_level >= 2 // At least "Using" level
        )
      )
      
      matchScore = requiredSkills.length > 0 
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : null
    }

    // Update skills profile
    const { error: profileError } = await supabase
      .from('st_employee_skills_profile')
      .upsert({
        employee_id,
        extracted_skills: extractedSkills,
        skills_match_score: matchScore,
        skills_validation_completed: true,
        analyzed_at: new Date().toISOString(),
        skills_analysis_version: 3, // Version 3 = validated data
        validation_metadata: {
          total_validated: validatedSkills.length,
          skills_with_proficiency: validatedSkills.filter(s => s.proficiency_level > 0).length,
          validation_date: new Date().toISOString()
        }
      }, { onConflict: 'employee_id' })

    if (profileError) throw profileError

    // Update employee record
    await supabase
      .from('employees')
      .update({
        skills_last_analyzed: new Date().toISOString(),
        skills_validation_completed: true
      })
      .eq('id', employee_id)

    // Trigger gap calculation
    await supabase.rpc('calculate_employee_skills_gap', { p_employee_id: employee_id })

    return new Response(
      JSON.stringify({ 
        success: true,
        skills_validated: validatedSkills.length,
        match_score: matchScore
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in finalize-skills-profile:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})