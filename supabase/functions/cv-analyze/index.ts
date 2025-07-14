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
          .from('st_employee_skills_profile')
          .select(`
            *,
            employees!inner(
              id,
              first_name,
              last_name,
              email,
              cv_extracted_data,
              users!inner(company_id)
            )
          `)

        if (profileId) {
          query = query.eq('id', profileId)
        } else if (employeeId) {
          query = query.eq('employee_id', employeeId)
        } else {
          throw new Error('Either employeeId or profileId is required')
        }

        const { data: profile, error } = await query.single()

        if (error) {
          throw error
        }

        // Check access permissions
        const userCompanyId = userData.user.user_metadata.company_id
        const employeeCompanyId = profile.employees.users.company_id

        if (userCompanyId !== employeeCompanyId && userData.user.user_metadata.role !== 'super_admin') {
          throw new Error('Access denied')
        }

        // Enrich skills with taxonomy data
        const enrichedSkills = await enrichSkillsWithTaxonomy(supabase, profile.extracted_skills || [])

        return new Response(
          JSON.stringify({
            success: true,
            profile: {
              ...profile,
              extracted_skills: enrichedSkills
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'update': {
        // Update entire skills profile
        if (!profileId || !skillData) {
          throw new Error('profileId and skillData are required for update')
        }

        const { data, error } = await supabase
          .from('st_employee_skills_profile')
          .update({
            extracted_skills: skillData.extracted_skills,
            skills_match_score: skillData.skills_match_score,
            career_readiness_score: skillData.career_readiness_score,
            updated_at: new Date().toISOString()
          })
          .eq('id', profileId)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, profile: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'add-skill': {
        // Add a single skill
        if (!profileId || !skillData) {
          throw new Error('profileId and skillData are required')
        }

        // Get current skills
        const { data: currentProfile } = await supabase
          .from('st_employee_skills_profile')
          .select('extracted_skills')
          .eq('id', profileId)
          .single()

        const currentSkills = currentProfile?.extracted_skills || []
        
        // Search for skill in taxonomy
        const { data: taxonomyMatches } = await supabase
          .rpc('search_skills', { 
            search_term: skillData.skill_name,
            limit_count: 1 
          })

        const newSkill = {
          skill_id: taxonomyMatches?.[0]?.skill_id || null,
          skill_name: skillData.skill_name,
          confidence: skillData.confidence || 0.8,
          evidence: skillData.evidence || 'Manually added',
          years_experience: skillData.years_experience,
          proficiency_level: skillData.proficiency_level || 3,
          is_manual: true,
          added_at: new Date().toISOString()
        }

        const updatedSkills = [...currentSkills, newSkill]

        const { data, error } = await supabase
          .from('st_employee_skills_profile')
          .update({ 
            extracted_skills: updatedSkills,
            updated_at: new Date().toISOString()
          })
          .eq('id', profileId)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, skill: newSkill, profile: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'remove-skill': {
        // Remove a skill
        if (!profileId || !skillData?.skill_name) {
          throw new Error('profileId and skill_name are required')
        }

        // Get current skills
        const { data: currentProfile } = await supabase
          .from('st_employee_skills_profile')
          .select('extracted_skills')
          .eq('id', profileId)
          .single()

        const currentSkills = currentProfile?.extracted_skills || []
        const updatedSkills = currentSkills.filter(
          (skill: any) => skill.skill_name !== skillData.skill_name
        )

        const { data, error } = await supabase
          .from('st_employee_skills_profile')
          .update({ 
            extracted_skills: updatedSkills,
            updated_at: new Date().toISOString()
          })
          .eq('id', profileId)
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ success: true, profile: data }),
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