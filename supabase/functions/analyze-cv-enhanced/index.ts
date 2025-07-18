import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'
import { PDFExtract } from 'https://esm.sh/pdf-extract@1.0.12'
import * as mammoth from 'https://esm.sh/mammoth@1.6.0'
import { createErrorResponse, logSanitizedError, getUserFriendlyErrorMessage, getErrorStatusCode } from '../_shared/error-utils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  const sessionId = crypto.randomUUID() // For tracking this specific analysis session
  
  try {
    const { employee_id, file_path, source, session_item_id, use_template } = await req.json()
    
    
    // Initialize OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    
    const configuration = new Configuration({ apiKey: openaiApiKey })
    const openai = new OpenAIApi(configuration)

    // Validate required parameters
    if (!employee_id || !file_path) {
      throw new Error('Missing required parameters: employee_id and file_path')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Helper function to update analysis status
    const updateStatus = async (status: string, progress: number, message?: string) => {
      await supabase
        .from('cv_analysis_status')
        .upsert({
          employee_id,
          session_id: sessionId,
          status,
          progress,
          message,
          metadata: { 
            source,
            file_path,
            request_id: requestId 
          }
        }, {
          onConflict: 'employee_id,session_id'
        })
    }
    
    // Initial status
    await updateStatus('initializing', 0, 'Starting CV analysis...')

    // Get employee and company information
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        id,
        company_id,
        position,
        current_position_id,
        target_position_id,
        st_company_positions!employees_current_position_id_fkey(
          id,
          position_code,
          position_title,
          required_skills,
          description
        )
      `)
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      throw new Error('Failed to fetch employee information')
    }

    // Get analysis template if requested
    let analysisTemplate = null
    if (use_template) {
      const { data: template } = await supabase
        .from('st_analysis_templates')
        .select('*')
        .eq('company_id', employee.company_id)
        .eq('template_type', 'cv_analysis')
        .eq('is_active', true)
        .single()
      
      analysisTemplate = template
    }

    // Update session item if provided
    if (session_item_id) {
      await supabase
        .from('st_import_session_items')
        .update({
          analysis_started_at: new Date().toISOString(),
          status: 'processing'
        })
        .eq('id', session_item_id)
    }

    // Extract CV text
    await updateStatus('downloading', 10, 'Downloading CV file...')
    const cvContent = null
    let cvText = ''
    
    // Download CV from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('employee-cvs')
      .download(file_path)

    if (downloadError) {
      throw new Error(`Failed to download CV: ${downloadError.message}`)
    }
    
    await updateStatus('extracting_text', 20, 'Extracting text from document...')

    // Extract text based on file type
    const fileName = file_path.split('/').pop() || ''
    
    if (fileName.toLowerCase().endsWith('.pdf')) {
      // For PDF extraction, we'll use a simple approach
      // In production, consider using pdf-parse or similar
      try {
        const arrayBuffer = await fileData.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        // Basic PDF text extraction (simplified)
        cvText = await extractTextFromPDF(uint8Array)
      } catch (pdfError) {
        logSanitizedError(pdfError, {
          requestId,
          functionName: 'analyze-cv-enhanced',
          metadata: { context: 'pdf_extraction' }
        })
        throw new Error('Failed to extract text from PDF')
      }
    } else if (fileName.toLowerCase().endsWith('.docx')) {
      // For DOCX files
      try {
        const arrayBuffer = await fileData.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        cvText = result.value
      } catch (docxError) {
        logSanitizedError(docxError, {
          requestId,
          functionName: 'analyze-cv-enhanced',
          metadata: { context: 'docx_extraction' }
        })
        throw new Error('Failed to extract text from DOCX')
      }
    } else {
      // Assume text file
      cvText = await fileData.text()
    }

    if (!cvText || cvText.trim().length < 50) {
      throw new Error('CV content is too short or empty')
    }
    
    await updateStatus('analyzing', 40, 'AI analyzing skills and experience...')

    // Enhanced prompt using template or default
    const systemPrompt = analysisTemplate?.system_prompt || 
      'You are an expert HR analyst specializing in technical skill assessment and CV analysis. Extract information accurately and comprehensively.'
    
    const promptTemplate = analysisTemplate?.prompt_template || `
      Analyze this CV comprehensively and extract the following information:
      
      1. Personal Information (name, contact details)
      2. Professional Summary
      3. Work Experience (with dates, companies, positions, key achievements)
      4. Education (degrees, institutions, dates)
      5. Certifications (name, issuer, date if available)
      6. Skills:
         - Technical Skills (programming languages, tools, frameworks, databases)
         - Soft Skills (leadership, communication, teamwork, etc.)
         - Domain Knowledge (industry-specific expertise)
      7. Languages (with proficiency levels)
      8. Notable Projects or Achievements
      9. Total years of experience
      
      For each skill, provide:
      - skill_name: The specific skill
      - category: technical|soft|domain|tool|language
      - proficiency_level: 1-5 (1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert)
      - years_experience: estimated years (can be null)
      - evidence: specific evidence from CV
      - context: where/how this skill was used
      
      Format the response as a structured JSON object.
    `

    const prompt = `${promptTemplate}\n\nCV Content:\n${cvText}`

    // Call OpenAI with enhanced prompt
    let completion
    const maxTokens = analysisTemplate?.parameters?.max_tokens || 3000
    const temperature = analysisTemplate?.parameters?.temperature || 0.3
    
    try {
      completion = await openai.createChatCompletion({
        model: analysisTemplate?.parameters?.model || 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' }
      })
    } catch (openaiError) {
      logSanitizedError(openaiError, {
        requestId,
        functionName: 'analyze-cv-enhanced',
        metadata: { context: 'openai_api_error' }
      })
      throw new Error(`Failed to analyze CV: ${openaiError.message}`)
    }

    const analysisResult = JSON.parse(completion.data.choices[0].message?.content || '{}')
    
    await updateStatus('processing', 60, 'Processing analysis results...')
    
    // Track token usage
    const tokensUsed = completion.data.usage?.total_tokens || 0
    const costEstimate = calculateCost(completion.data.usage)
    
    await supabase
      .from('st_llm_usage_metrics')
      .insert({
        company_id: employee.company_id,
        service_type: 'cv_analysis',
        model_used: analysisTemplate?.parameters?.model || 'gpt-4-turbo-preview',
        input_tokens: completion.data.usage?.prompt_tokens || 0,
        output_tokens: completion.data.usage?.completion_tokens || 0,
        cost_estimate: costEstimate,
        duration_ms: Date.now() - startTime,
        success: true,
        metadata: {
          request_id: requestId,
          employee_id,
          template_used: analysisTemplate?.template_name
        }
      })

    // Enhanced skills extraction with better structure
    interface AnalysisSkill {
      skill_name?: string;
      name?: string;
      category?: string;
      proficiency_level?: number;
      level?: number;
      years_experience?: number;
      evidence?: string;
      context?: string;
    }
    
    const extractedSkills = (analysisResult.skills || []).map((skill: AnalysisSkill) => ({
      skill_id: null, // Will be mapped to NESTA taxonomy later
      skill_name: skill.skill_name || skill.name,
      category: skill.category || 'technical',
      proficiency_level: skill.proficiency_level || skill.level || 3,
      years_experience: skill.years_experience,
      evidence: skill.evidence || '',
      context: skill.context || '',
      confidence: 0.9, // High confidence for direct extraction
      source: 'cv_analysis'
    }))

    // Calculate initial match score if position exists
    let matchScore = null
    let positionMatchAnalysis = {}
    
    if (employee.st_company_positions) {
      const position = employee.st_company_positions
      const requiredSkills = position.required_skills || []
      
      // Simple match calculation (will be enhanced with LLM later)
      const matchedSkills = requiredSkills.filter(reqSkill => 
        extractedSkills.some(extSkill => 
          extSkill.skill_name.toLowerCase().includes(reqSkill.skill_name.toLowerCase()) ||
          reqSkill.skill_name.toLowerCase().includes(extSkill.skill_name.toLowerCase())
        )
      )
      
      matchScore = requiredSkills.length > 0 
        ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
        : null
        
      positionMatchAnalysis = {
        position_id: position.id,
        position_title: position.position_title,
        matched_skills: matchedSkills.length,
        total_required: requiredSkills.length,
        match_percentage: matchScore
      }
    }

    await updateStatus('storing', 80, 'Storing analysis results...')
    
    // Store enhanced analysis results
    const profileData = {
      employee_id: employee_id,
      cv_file_path: file_path,
      cv_summary: analysisResult.summary || analysisResult.professional_summary || '',
      extracted_skills: extractedSkills,
      current_position_id: employee.current_position_id,
      target_position_id: employee.target_position_id,
      skills_match_score: matchScore,
      analyzed_at: new Date().toISOString(),
      // New enhanced fields
      skills_analysis_version: 2,
      experience_years: analysisResult.total_experience_years,
      education_level: analysisResult.education?.[0]?.degree || null,
      certifications: analysisResult.certifications || [],
      industry_experience: analysisResult.work_experience?.map((exp: any) => ({
        company: exp.company,
        industry: exp.industry || 'Unknown',
        years: exp.duration || 0
      })) || [],
      soft_skills: extractedSkills.filter(s => s.category === 'soft'),
      technical_skills: extractedSkills.filter(s => s.category === 'technical'),
      languages: analysisResult.languages || [],
      projects_summary: analysisResult.projects?.map((p: any) => p.name).join(', ') || null,
      analysis_metadata: {
        cv_length: cvText.length,
        analysis_time_ms: Date.now() - startTime,
        template_used: analysisTemplate?.template_name,
        model_used: analysisTemplate?.parameters?.model || 'gpt-4-turbo-preview',
        tokens_used: tokensUsed
      }
    }

    const { error: profileError } = await supabase
      .from('st_employee_skills_profile')
      .upsert(profileData, { onConflict: 'employee_id' })

    if (profileError) {
      logSanitizedError(profileError, {
        requestId,
        functionName: 'analyze-cv-enhanced',
        metadata: { context: 'skills_profile_storage' }
      })
      throw profileError
    }

    // Update session item if provided
    if (session_item_id) {
      await supabase
        .from('st_import_session_items')
        .update({
          cv_analysis_result: extractedSkills,
          confidence_score: matchScore ? matchScore / 100 : 0.5,
          position_match_analysis: positionMatchAnalysis,
          analysis_completed_at: new Date().toISOString(),
          analysis_tokens_used: tokensUsed,
          status: 'completed'
        })
        .eq('id', session_item_id)
    }

    // Update employee record
    await supabase
      .from('employees')
      .update({
        cv_file_path: file_path,
        cv_extracted_data: {
          work_experience: analysisResult.work_experience || [],
          education: analysisResult.education || [],
          certifications: analysisResult.certifications || [],
          languages: analysisResult.languages || [],
          total_experience_years: analysisResult.total_experience_years || 0
        },
        skills_last_analyzed: new Date().toISOString()
      })
      .eq('id', employee_id)

    const analysisTime = Date.now() - startTime
    
    await updateStatus('completed', 100, 'Analysis completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'CV analyzed successfully',
        employee_id,
        file_path,
        session_id: sessionId, // Include session ID for frontend tracking
        skills_extracted: extractedSkills.length,
        match_score: matchScore,
        analysis_time_ms: analysisTime,
        tokens_used: tokensUsed,
        cost_estimate: costEstimate
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    const errorTime = Date.now() - startTime
    
    // Log error metrics with sanitized information
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      await supabase
        .from('st_llm_usage_metrics')
        .insert({
          service_type: 'cv_analysis',
          model_used: 'gpt-4-turbo-preview',
          input_tokens: 0,
          output_tokens: 0,
          cost_estimate: 0,
          duration_ms: errorTime,
          success: false,
          error_code: error.constructor?.name || 'UnknownError',
          metadata: {
            request_id: requestId,
            employee_id: employee_id || 'unknown'
          }
        })
    } catch (logError) {
      logSanitizedError(logError, {
        requestId,
        functionName: 'analyze-cv-enhanced',
        metadata: { context: 'error_metrics_logging' }
      })
    }
    
    return createErrorResponse(error, {
      requestId,
      functionName: 'analyze-cv-enhanced',
      employeeId: employee_id
    }, getErrorStatusCode(error))
  }
})

function calculateCost(usage: any): number {
  // GPT-4 Turbo pricing (as of 2024)
  const inputCostPer1k = 0.01
  const outputCostPer1k = 0.03
  
  const inputCost = (usage?.prompt_tokens || 0) / 1000 * inputCostPer1k
  const outputCost = (usage?.completion_tokens || 0) / 1000 * outputCostPer1k
  
  return inputCost + outputCost
}

// Simple PDF text extraction (basic implementation)
async function extractTextFromPDF(pdfData: Uint8Array): Promise<string> {
  // Convert PDF data to string and extract readable text
  const pdfString = new TextDecoder('utf-8', { fatal: false }).decode(pdfData)
  
  // Basic text extraction - look for text between stream markers
  const textMatches = pdfString.match(/\(([^)]+)\)/g) || []
  const extractedText = textMatches
    .map(match => match.slice(1, -1)) // Remove parentheses
    .join(' ')
    .replace(/\\(\d{3})/g, (match, code) => String.fromCharCode(parseInt(code, 8))) // Handle octal codes
    .replace(/\\/g, '') // Remove escape characters
  
  // If basic extraction fails, try to find text in common PDF structures
  if (extractedText.length < 50) {
    const streamMatches = pdfString.match(/stream[\s\S]*?endstream/g) || []
    const streamText = streamMatches
      .map(stream => {
        // Try to extract readable text from streams
        const text = stream.replace(/[^\x20-\x7E\s]/g, ' ') // Keep only printable ASCII
        return text.trim()
      })
      .filter(text => text.length > 10)
      .join(' ')
    
    return streamText || 'Unable to extract text from PDF'
  }
  
  return extractedText
}