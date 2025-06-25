// CV Processing Edge Function
// Handles CV file processing, text extraction, and OpenAI analysis

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@4.24.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CVProcessRequest {
  employeeId: string
  companyId: string
  filePath: string
  fileName: string
  currentPosition?: string
  targetPosition?: string
}

interface ExtractedSkill {
  skill_name: string
  confidence: number
  evidence: string
  years_experience?: number
}

interface CVAnalysisResult {
  summary: string
  extracted_skills: ExtractedSkill[]
  work_experience: Array<{
    company: string
    position: string
    duration: string
    responsibilities: string[]
  }>
  education: Array<{
    institution: string
    degree: string
    field: string
    year: string
  }>
  certifications: string[]
  languages: string[]
  total_experience_years: number
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request data
    const { employeeId, companyId, filePath, fileName, currentPosition, targetPosition } = 
      await req.json() as CVProcessRequest

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Initialize OpenAI
    const openAIKey = Deno.env.get('OPENAI_API_KEY')!
    const configuration = new Configuration({ apiKey: openAIKey })
    const openai = new OpenAIApi(configuration)

    // Download CV from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('employee-cvs')
      .download(filePath)

    if (downloadError) {
      throw new Error(`Failed to download CV: ${downloadError.message}`)
    }

    // Extract text from CV
    let cvText = ''
    if (fileName.toLowerCase().endsWith('.pdf')) {
      // For Deno, we'll use a simpler approach or external API for PDF parsing
      // In production, consider using a PDF parsing service
      cvText = await extractTextFromPDF(fileData)
    } else if (fileName.toLowerCase().endsWith('.docx')) {
      cvText = await extractTextFromDOCX(fileData)
    } else {
      // Assume text file
      cvText = await fileData.text()
    }

    // Analyze CV with OpenAI
    const analysisPrompt = `
You are an expert HR analyst. Analyze the following CV and extract structured information.

CV Text:
${cvText}

${currentPosition ? `Current Position: ${currentPosition}` : ''}
${targetPosition ? `Target Position: ${targetPosition}` : ''}

Please extract and return the following information in JSON format:
1. A brief professional summary (2-3 sentences)
2. List of skills with confidence level (0-1) and evidence from CV
3. Work experience with company, position, duration, and key responsibilities
4. Education history
5. Professional certifications
6. Languages spoken
7. Estimated total years of experience

Focus on technical skills, soft skills, and domain expertise. For each skill, provide:
- skill_name: The name of the skill
- confidence: How confident you are this person has this skill (0-1)
- evidence: Quote or context from CV supporting this skill
- years_experience: Estimated years of experience with this skill (if determinable)

Return only valid JSON.
`

    const completion = await openai.createChatCompletion({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert CV analyzer. Extract structured data from CVs accurately.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })

    const analysisResult = JSON.parse(completion.data.choices[0].message?.content || '{}') as CVAnalysisResult

    // Match skills to NESTA taxonomy
    const matchedSkills = await matchSkillsToTaxonomy(supabase, analysisResult.extracted_skills)

    // Save analysis results
    const { data: profileData, error: profileError } = await supabase
      .from('st_employee_skills_profile')
      .upsert({
        employee_id: employeeId,
        cv_file_path: filePath,
        cv_summary: analysisResult.summary,
        extracted_skills: matchedSkills,
        current_position_id: currentPosition,
        target_position_id: targetPosition,
        analyzed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      throw new Error(`Failed to save profile: ${profileError.message}`)
    }

    // Update employee record
    await supabase
      .from('employees')
      .update({
        cv_file_path: filePath,
        cv_extracted_data: {
          work_experience: analysisResult.work_experience,
          education: analysisResult.education,
          certifications: analysisResult.certifications,
          languages: analysisResult.languages,
          total_experience_years: analysisResult.total_experience_years
        },
        skills_last_analyzed: new Date().toISOString()
      })
      .eq('id', employeeId)

    return new Response(
      JSON.stringify({
        success: true,
        profileId: profileData.id,
        summary: analysisResult.summary,
        skillsCount: matchedSkills.length,
        experienceYears: analysisResult.total_experience_years
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('CV processing error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Helper function to match skills to NESTA taxonomy
async function matchSkillsToTaxonomy(
  supabase: any, 
  extractedSkills: ExtractedSkill[]
): Promise<any[]> {
  const matchedSkills = []

  for (const skill of extractedSkills) {
    // Search for skill in taxonomy
    const { data: matches } = await supabase
      .rpc('search_skills', { 
        search_term: skill.skill_name,
        limit_count: 5 
      })

    if (matches && matches.length > 0) {
      // Use the best match
      const bestMatch = matches[0]
      matchedSkills.push({
        skill_id: bestMatch.skill_id,
        skill_name: bestMatch.skill_name,
        confidence: skill.confidence * bestMatch.relevance, // Combine confidences
        evidence: skill.evidence,
        years_experience: skill.years_experience,
        proficiency_level: determineProficiencyLevel(skill.years_experience),
        match_quality: bestMatch.relevance
      })
    } else {
      // No match found, store as custom skill
      matchedSkills.push({
        skill_id: null,
        skill_name: skill.skill_name,
        confidence: skill.confidence,
        evidence: skill.evidence,
        years_experience: skill.years_experience,
        proficiency_level: determineProficiencyLevel(skill.years_experience),
        is_custom: true
      })
    }
  }

  return matchedSkills
}

// Helper function to determine proficiency level based on experience
function determineProficiencyLevel(yearsExperience?: number): number {
  if (!yearsExperience) return 3 // Default to intermediate
  if (yearsExperience < 1) return 1 // Beginner
  if (yearsExperience < 3) return 2 // Basic
  if (yearsExperience < 5) return 3 // Intermediate
  if (yearsExperience < 8) return 4 // Advanced
  return 5 // Expert
}

// Placeholder for PDF text extraction
async function extractTextFromPDF(fileData: Blob): Promise<string> {
  // In production, use a PDF parsing library or service
  // For now, return a placeholder
  return 'PDF parsing not implemented in this example. Consider using pdf-parse or an external service.'
}

// Placeholder for DOCX text extraction  
async function extractTextFromDOCX(fileData: Blob): Promise<string> {
  // In production, use a DOCX parsing library or service
  // For now, return a placeholder
  return 'DOCX parsing not implemented in this example. Consider using mammoth or an external service.'
}