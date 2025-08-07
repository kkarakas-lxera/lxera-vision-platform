// CV Analysis Edge Function
// Provides analysis results and allows manual skill editing

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { createErrorResponse, logSanitizedError, getErrorStatusCode } from '../_shared/error-utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SkillData {
  skill_name: string;
  proficiency_level?: number;
  years_experience?: number;
  [key: string]: unknown;
}

interface AnalysisRequest {
  employeeId?: string
  profileId?: string
  action?: 'get' | 'update' | 'add-skill' | 'remove-skill'
  skillData?: SkillData
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    })

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      throw new Error('Unauthorized')
    }

    const requestData = await req.json() as AnalysisRequest
    const { employeeId, profileId, action = 'get', skillData } = requestData

    switch (action) {
      case 'get': {
        // Get analysis results
        let query = supabase
          .from('employees')
          .select(`
            id,
            full_name,
            email,
            cv_analysis_data,
            skills_last_analyzed,
            skills_validation_completed,
            company_id,
            employee_skills (
              skill_name,
              proficiency,
              source,
              years_experience,
              skill_id
            )
          `)

        if (employeeId) {
          query = query.eq('id', employeeId)
        } else {
          throw new Error('employeeId is required')
        }

        const { data: employee, error } = await query.single()

        if (error) {
          throw error
        }

        // Check access permissions
        const userCompanyId = userData.user.user_metadata.company_id
        const employeeCompanyId = employee.company_id

        if (userCompanyId !== employeeCompanyId && userData.user.user_metadata.role !== 'super_admin') {
          throw new Error('Access denied')
        }

        // Transform employee_skills to legacy format for compatibility
        const extractedSkills = employee.employee_skills?.map((skill: any) => ({
          skill_id: skill.skill_id,
          skill_name: skill.skill_name,
          proficiency_level: skill.proficiency, // Already 0-3
          years_experience: skill.years_experience,
          source: skill.source,
          confidence: 1.0 // Validated data has high confidence
        })) || []

        // Enrich skills with taxonomy data
        const enrichedSkills = await enrichSkillsWithTaxonomy(supabase, extractedSkills)

        return new Response(
          JSON.stringify({
            success: true,
            profile: {
              id: employee.id,
              employee_id: employee.id,
              full_name: employee.full_name,
              email: employee.email,
              extracted_skills: enrichedSkills,
              skills_match_score: employee.cv_analysis_data?.skills_match_score || 0,
              career_readiness_score: employee.cv_analysis_data?.career_readiness_score || 0,
              skills_validation_completed: employee.skills_validation_completed,
              analyzed_at: employee.skills_last_analyzed
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        // Update entire skills profile
        if (!employeeId || !skillData) {
          throw new Error('employeeId and skillData are required for update')
        }

        // Update employee record
        const { error: employeeError } = await supabase
          .from('employees')
          .update({
            cv_analysis_data: {
              skills_match_score: skillData.skills_match_score,
              career_readiness_score: skillData.career_readiness_score,
              extracted_skills: skillData.extracted_skills,
              updated_at: new Date().toISOString()
            }
          })
          .eq('id', employeeId)

        if (employeeError) throw employeeError

        // Update employee_skills table
        if (skillData.extracted_skills && Array.isArray(skillData.extracted_skills)) {
          // Delete existing skills
          await supabase
            .from('employee_skills')
            .delete()
            .eq('employee_id', employeeId)

          // Insert updated skills
          const skillsToInsert = skillData.extracted_skills.map((skill: any) => ({
            employee_id: employeeId,
            skill_id: skill.skill_id || null,
            skill_name: skill.skill_name,
            proficiency: skill.proficiency_level || 0,
            source: skill.source || 'verified',
            years_experience: skill.years_experience
          }))

          if (skillsToInsert.length > 0) {
            const { error: skillsError } = await supabase
              .from('employee_skills')
              .insert(skillsToInsert)

            if (skillsError) throw skillsError
          }
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Skills profile updated successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'add-skill': {
        // Add a single skill
        if (!employeeId || !skillData) {
          throw new Error('employeeId and skillData are required')
        }

        // Get current skills from employee_skills table
        const { data: currentSkills } = await supabase
          .from('employee_skills')
          .select('*')
          .eq('employee_id', employeeId)
        
        // Search for skill in taxonomy
        const { data: taxonomyMatches } = await supabase
          .rpc('search_skills', { 
            search_term: skillData.skill_name,
            limit_count: 1 
          })

        // Check if skill already exists
        const existingSkill = currentSkills?.find(
          (skill: any) => skill.skill_name.toLowerCase() === skillData.skill_name.toLowerCase()
        )

        if (existingSkill) {
          throw new Error('Skill already exists')
        }

        const newSkillData = {
          employee_id: employeeId,
          skill_id: taxonomyMatches?.[0]?.skill_id || null,
          skill_name: skillData.skill_name,
          proficiency: skillData.proficiency_level || 3, // 0-3 scale
          source: 'manual',
          years_experience: skillData.years_experience,
          created_at: new Date().toISOString()
        }

        const { data: insertedSkill, error } = await supabase
          .from('employee_skills')
          .insert(newSkillData)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, skill: insertedSkill }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'remove-skill': {
        // Remove a skill
        if (!employeeId || !skillData?.skill_name) {
          throw new Error('employeeId and skill_name are required')
        }

        const { error } = await supabase
          .from('employee_skills')
          .delete()
          .eq('employee_id', employeeId)
          .eq('skill_name', skillData.skill_name)

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, message: 'Skill removed successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    return createErrorResponse(error, {
      requestId: crypto.randomUUID(),
      functionName: 'cv-analyze'
    }, getErrorStatusCode(error))
  }
})

// Helper function to enrich skills with full taxonomy data
async function enrichSkillsWithTaxonomy(supabase: any, skills: any[]): Promise<any[]> {
  const enrichedSkills = []

  for (const skill of skills) {
    if (skill.skill_id) {
      // Get full skill path from taxonomy
      const { data: skillPath } = await supabase
        .rpc('get_skill_path', { skill_uuid: skill.skill_id })

      enrichedSkills.push({
        ...skill,
        skill_path: skillPath || [],
        full_path: skillPath?.map((s: any) => s.skill_name).join(' > ') || skill.skill_name
      })
    } else {
      // Custom skill without taxonomy match
      enrichedSkills.push({
        ...skill,
        skill_path: [],
        full_path: skill.skill_name,
        is_custom: true
      })
    }
  }

  return enrichedSkills
}