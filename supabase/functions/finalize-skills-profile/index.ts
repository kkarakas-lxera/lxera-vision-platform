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

    // Get employee skills (verified ones)
    const { data: employeeSkills, error: skillsError } = await supabase
      .from('employee_skills')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('source', 'verified') // Only verified skills
      .gt('proficiency', 0) // Only skills they have

    if (skillsError) throw skillsError

    // Transform to expected format
    const extractedSkills = employeeSkills.map(skill => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      category: 'technical', // Can be enhanced with categorization
      proficiency_level: skill.proficiency, // Already 0-3
      years_experience: skill.years_experience,
      evidence: 'User verified',
      context: 'Profile completion',
      confidence: 1.0, // 100% confidence since user validated
      source: 'verified'
    }))

    // Get employee position for gap calculation
    const { data: employee } = await supabase
      .from('employees')
      .select(`
        current_position_id,
        positions:current_position_id (
          required_skills
        )
      `)
      .eq('id', employee_id)
      .single()

    // Calculate skills match score
    let matchScore = null
    if (employee?.positions?.required_skills) {
      const requiredSkills = employee.positions.required_skills
      const matchedSkills = requiredSkills.filter((reqSkill: any) => 
        employeeSkills.some(skill => 
          skill.skill_name === reqSkill.skill_name && 
          skill.proficiency >= 2 // At least "Using" level
        )
      )
      
      matchScore = requiredSkills.length > 0 
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : null
    }

    // Update employee record with skills match score and validation status
    const { error: profileError } = await supabase
      .from('employees')
      .update({
        cv_analysis_data: {
          ...employee?.cv_analysis_data,
          skills_match_score: matchScore,
          extracted_skills: extractedSkills,
          validation_completed: true,
          validation_date: new Date().toISOString(),
          total_validated: employeeSkills.length,
          skills_with_proficiency: employeeSkills.filter(s => s.proficiency > 0).length
        }
      })
      .eq('id', employee_id)

    if (profileError) throw profileError

    // Update employee record with final validation status
    await supabase
      .from('employees')
      .update({
        skills_last_analyzed: new Date().toISOString(),
        skills_validation_completed: true
      })
      .eq('id', employee_id)

    // Clear any cached gaps to trigger recalculation on next access
    await supabase
      .from('skills_gap_cache')
      .delete()
      .eq('entity_id', employee_id)
      .eq('entity_type', 'employee')

    return new Response(
      JSON.stringify({ 
        success: true,
        skills_validated: employeeSkills.length,
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