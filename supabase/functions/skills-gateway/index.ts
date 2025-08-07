import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'
import { corsHeaders } from '../_shared/cors.ts'

/**
 * Skills Gateway Edge Function
 * 
 * Single entry point for all skills operations to ensure consistency.
 * All proficiency values are standardized to 0-3 scale.
 * 
 * Operations:
 * - convertProficiency: Convert any format to 0-3 scale
 * - calculateGaps: Calculate skills gaps for employee or organization
 * - extractSkills: Extract skills from CV text (returns 0-3 scale)
 * - suggestSkills: Suggest skills for a position (returns 0-3 scale)
 * - standardizeSkills: Batch convert existing skills to 0-3 scale
 */

// Proficiency scale converter (matches UnifiedSkillsService)
function convertToStandard(value: any): number {
  // Handle null/undefined
  if (value === null || value === undefined) return 0;
  
  // If already a number, convert to 0-3 range
  if (typeof value === 'number') {
    // Handle percentage (0-100)
    if (value > 10) {
      if (value >= 75) return 3;      // Expert
      if (value >= 50) return 2;      // Using
      if (value >= 25) return 1;      // Learning
      return 0;                        // None
    }
    
    // Handle 0-5 scale
    if (value <= 5) {
      if (value >= 4) return 3;       // Expert
      if (value >= 3) return 2;       // Using
      if (value >= 1) return 1;       // Learning
      return 0;                        // None
    }
    
    // Already 0-3, just ensure bounds
    return Math.max(0, Math.min(3, Math.round(value)));
  }
  
  // Handle text proficiency levels
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase().trim();
    
    // Map all text variations to 0-3
    const textMappings: Record<string, number> = {
      // None/Zero
      'none': 0,
      'no experience': 0,
      'not applicable': 0,
      'n/a': 0,
      '': 0,
      
      // Learning (1)
      'learning': 1,
      'beginner': 1,
      'basic': 1,
      'fundamental': 1,
      'novice': 1,
      'entry': 1,
      'junior': 1,
      
      // Using (2)
      'using': 2,
      'intermediate': 2,
      'competent': 2,
      'proficient': 2,
      'good': 2,
      'solid': 2,
      'mid': 2,
      'middle': 2,
      
      // Expert (3)
      'expert': 3,
      'advanced': 3,
      'master': 3,
      'senior': 3,
      'specialist': 3,
      'guru': 3,
      'excellent': 3,
      'exceptional': 3
    };
    
    return textMappings[lowerValue] ?? 0;
  }
  
  // Default to 0 for any unhandled type
  return 0;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { operation, ...params } = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    let result: any = null

    switch (operation) {
      case 'convertProficiency': {
        // Convert any proficiency value to 0-3 scale
        const { value } = params
        result = {
          original: value,
          standardized: convertToStandard(value),
          label: ['None', 'Learning', 'Using', 'Expert'][convertToStandard(value)]
        }
        break
      }

      case 'calculateGaps': {
        // Calculate skills gaps using database function
        const { entityId, entityType, forceRefresh = false } = params
        
        const { data, error } = await supabase.rpc('get_skills_gaps', {
          p_entity_id: entityId,
          p_entity_type: entityType,
          p_force_refresh: forceRefresh
        })

        if (error) throw error
        result = data
        break
      }

      case 'extractSkills': {
        // Extract skills from CV text with AI (standardized to 0-3)
        const { cvText, positionId } = params
        
        // Get position requirements for context
        let positionContext = ''
        if (positionId) {
          const { data: position } = await supabase
            .from('st_company_positions')
            .select('title, required_skills')
            .eq('id', positionId)
            .single()
          
          if (position) {
            positionContext = `\nPosition: ${position.title}\nRequired skills: ${JSON.stringify(position.required_skills)}`
          }
        }

        // Call OpenAI to extract skills
        const openAIKey = Deno.env.get('OPENAI_API_KEY')!
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
              {
                role: 'system',
                content: `You are a skills extraction expert. Extract skills from CVs and assess proficiency.
                
                IMPORTANT: Use ONLY this 0-3 proficiency scale:
                - 0 = None/No experience
                - 1 = Learning/Beginner (0-2 years or basic knowledge)
                - 2 = Using/Intermediate (2-5 years or solid experience)
                - 3 = Expert/Advanced (5+ years or deep expertise)
                
                Consider years of experience, project complexity, and role seniority when assessing.
                ${positionContext}`
              },
              {
                role: 'user',
                content: `Extract skills from this CV and rate each skill's proficiency (0-3 scale):\n\n${cvText}`
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 2000
          })
        })

        const aiResponse = await response.json()
        const extractedData = JSON.parse(aiResponse.choices[0].message.content)
        
        // Ensure all proficiency values are 0-3
        if (extractedData.skills) {
          extractedData.skills = extractedData.skills.map((skill: any) => ({
            ...skill,
            proficiency: convertToStandard(skill.proficiency || skill.proficiency_level || 0),
            skill_name: skill.skill_name || skill.name
          }))
        }
        
        result = extractedData
        break
      }

      case 'suggestSkills': {
        // Suggest skills for a position (returns 0-3 scale)
        const { positionTitle, industry, department } = params
        
        const openAIKey = Deno.env.get('OPENAI_API_KEY')!
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
              {
                role: 'system',
                content: `You are an HR expert. Suggest required skills for job positions.
                
                IMPORTANT: Use ONLY this proficiency scale for required levels:
                - 1 = Learning (Entry level acceptable)
                - 2 = Using (Mid-level required)
                - 3 = Expert (Senior level required)
                
                Never use 0 for required skills.`
              },
              {
                role: 'user',
                content: `Suggest 10-15 required skills for: ${positionTitle} in ${industry || 'general'} industry, ${department || 'general'} department.`
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.5,
            max_tokens: 1500
          })
        })

        const aiResponse = await response.json()
        const suggestedSkills = JSON.parse(aiResponse.choices[0].message.content)
        
        // Ensure all proficiency values are 1-3 (no 0 for requirements)
        if (suggestedSkills.skills) {
          suggestedSkills.skills = suggestedSkills.skills.map((skill: any) => ({
            ...skill,
            proficiency_level: Math.max(1, convertToStandard(skill.proficiency_level || skill.proficiency || 2)),
            skill_name: skill.skill_name || skill.name
          }))
        }
        
        result = suggestedSkills
        break
      }

      case 'standardizeSkills': {
        // Batch convert existing skills to 0-3 scale
        const { employeeIds } = params
        
        for (const employeeId of employeeIds) {
          // Get all skills from various sources
          const { data: skillsProfile } = await supabase
            .from('st_employee_skills_profile')
            .select('extracted_skills, technical_skills, soft_skills')
            .eq('employee_id', employeeId)
            .single()
          
          const { data: validatedSkills } = await supabase
            .from('employee_skills_validation')
            .select('skill_name, proficiency_level')
            .eq('employee_id', employeeId)
          
          // Convert and store in unified format
          const unifiedSkills: any[] = []
          
          // Process extracted skills
          if (skillsProfile?.extracted_skills) {
            for (const skill of skillsProfile.extracted_skills) {
              unifiedSkills.push({
                employee_id: employeeId,
                skill_id: skill.skill_id,
                skill_name: skill.skill_name || skill.name,
                proficiency: convertToStandard(skill.proficiency_level || skill.proficiency),
                source: 'cv',
                years_experience: skill.years_experience,
                evidence: skill.evidence
              })
            }
          }
          
          // Process validated skills
          if (validatedSkills) {
            for (const skill of validatedSkills) {
              unifiedSkills.push({
                employee_id: employeeId,
                skill_name: skill.skill_name,
                proficiency: convertToStandard(skill.proficiency_level),
                source: 'verified'
              })
            }
          }
          
          // Upsert into unified table
          if (unifiedSkills.length > 0) {
            const { error } = await supabase
              .from('employee_skills')
              .upsert(unifiedSkills, {
                onConflict: 'employee_id,skill_name,source',
                ignoreDuplicates: false
              })
            
            if (error) console.error('Error upserting skills:', error)
          }
        }
        
        result = { 
          success: true, 
          message: `Standardized skills for ${employeeIds.length} employees` 
        }
        break
      }

      case 'getStandardScale': {
        // Return the standard scale definition
        result = {
          scale: [
            { value: 0, label: 'None', description: 'No experience or knowledge' },
            { value: 1, label: 'Learning', description: 'Beginner level, currently learning' },
            { value: 2, label: 'Using', description: 'Intermediate level, actively using' },
            { value: 3, label: 'Expert', description: 'Advanced level, deep expertise' }
          ],
          colors: {
            0: 'gray',
            1: 'yellow',
            2: 'green',
            3: 'blue'
          }
        }
        break
      }

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Skills gateway error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})