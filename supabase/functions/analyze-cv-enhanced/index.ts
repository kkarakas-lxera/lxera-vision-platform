import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'
import { createErrorResponse, logSanitizedError, getUserFriendlyErrorMessage, getErrorStatusCode } from '../_shared/error-utils.ts'

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

  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  const sessionId = crypto.randomUUID() // For tracking this specific analysis session
  let employee_id: string | undefined // Declare at function scope
  let company_id: string | undefined // Declare at function scope for error logging
  
  try {
    const body = await req.json()
    employee_id = body.employee_id
    const { file_path, source, session_item_id, use_template } = body
    
    
    // Initialize OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    
    const openai = new OpenAI({ apiKey: openaiApiKey })

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
      try {
        console.log(`Updating status: ${status} (${progress}%) - ${message || ''}`)
        
        const { data, error } = await supabase
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
            },
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'employee_id,session_id'
          })
          .select()
        
        if (error) {
          console.error('Failed to update status:', JSON.stringify(error))
          // Log to metrics for visibility
          await supabase
            .from('st_llm_usage_metrics')
            .insert({
              company_id: employee?.company_id || 'unknown',
              service_type: 'cv_analysis_status_error',
              model_used: 'none',
              input_tokens: 0,
              output_tokens: 0,
              cost_estimate: 0,
              duration_ms: 0,
              success: false,
              error_code: error.code,
              metadata: {
                request_id: requestId,
                status,
                error: error.message
              }
            })
        } else {
          console.log('Status update successful:', data)
        }
      } catch (err) {
        console.error('Status update exception:', err.message || err)
      }
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
    
    // Store company_id for error logging
    company_id = employee.company_id

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

    // Download CV from storage
    await updateStatus('downloading', 10, 'Downloading CV file...')
    
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('employee-cvs')
      .download(file_path)

    if (downloadError) {
      throw new Error(`Failed to download CV: ${downloadError.message}`)
    }
    
    await updateStatus('uploading_to_ai', 20, 'Uploading CV to AI for analysis...')

    // Convert file to base64 for OpenAI
    const arrayBuffer = await fileData.arrayBuffer()
    const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
    // Get file details
    const fileName = file_path.split('/').pop() || ''
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'pdf'
    
    console.log(`Processing ${fileName} - ${arrayBuffer.byteLength} bytes`)
    
    await updateStatus('analyzing', 30, 'AI analyzing CV content...')

    // Enhanced prompt using template or default
    const systemPrompt = analysisTemplate?.system_prompt || 
      'You are an expert HR analyst specializing in technical skill assessment and CV analysis. Extract information accurately and comprehensively.'
    
    const promptTemplate = analysisTemplate?.prompt_template || `
      You are analyzing a CV/Resume. Extract ALL skills and technologies mentioned.
      
      Your response MUST be a valid JSON object with this EXACT structure:
      {
        "personal_info": {
          "name": "Full name from CV",
          "email": "Email address",
          "phone": "Phone number"
        },
        "summary": "Professional summary or objective from CV",
        "work_experience": [
          {
            "company": "Company name",
            "title": "Job title/position",
            "position": "Job title/position (same as title)",
            "startDate": "Start date in YYYY-MM format",
            "endDate": "End date in YYYY-MM format (null if current)",
            "current": false,
            "duration": "Time period as string (e.g. '2020-2023')",
            "description": "Combined description of role, responsibilities and achievements",
            "responsibilities": ["List of key responsibilities"],
            "achievements": ["List of key achievements"],
            "technologies": ["List of technologies used in this role"]
          }
        ],
        "education": [
          {
            "degree": "Degree name",
            "institution": "School/University name",
            "year": "Graduation year or period"
          }
        ],
        "certifications": [
          {
            "name": "Certification name",
            "issuer": "Issuing organization",
            "year": "Year obtained"
          }
        ],
        "skills": [
          {
            "skill_name": "EXACT skill name as written in CV",
            "category": "technical",
            "proficiency_level": 4,
            "years_experience": 2,
            "evidence": "Quote from CV showing this skill",
            "context": "Where/how this skill was used"
          }
        ],
        "languages": [
          {
            "language": "Language name",
            "proficiency": "Native/Fluent/Intermediate/Basic"
          }
        ],
        "total_experience_years": 8
      }
      
      CRITICAL INSTRUCTIONS:
      1. Extract EVERY technical skill mentioned (programming languages, frameworks, tools, databases, cloud services, etc.)
      2. Be EXTREMELY thorough - if something looks like a skill or technology, include it
      3. Use these categories: "technical" for tech skills, "soft" for soft skills, "domain" for industry knowledge
      4. Estimate proficiency_level: 5=Expert (5+ years), 4=Advanced (3-5 years), 3=Intermediate (1-3 years), 2=Basic (<1 year), 1=Beginner
      5. Include evidence - quote the exact text from CV that mentions this skill
      6. If you can't find certain information, use null instead of making it up
      
      FOR WORK EXPERIENCE:
      - Extract exact dates when available and convert to YYYY-MM format for startDate/endDate
      - If only years are given (e.g., "2020-2023"), use YYYY-01 format (e.g., "2020-01", "2023-12")
      - Set "current" to true and "endDate" to null if it's their current position
      - Combine all responsibilities and achievements into a single "description" field
      - Keep separate arrays for "responsibilities" and "achievements" for detailed analysis
      - Extract any technologies/tools mentioned for each role into "technologies" array
      
      Common skills to look for:
      - Programming: Python, JavaScript, Java, C++, Go, Ruby, PHP, Swift, Kotlin, etc.
      - Frontend: React, Angular, Vue.js, HTML, CSS, Sass, Bootstrap, Tailwind, etc.
      - Backend: Node.js, Express, Django, Flask, Spring, Rails, Laravel, etc.
      - Databases: MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, Oracle, etc.
      - Cloud: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, CI/CD, etc.
      - Tools: Git, Jira, Slack, VS Code, IntelliJ, Postman, etc.
      - Soft Skills: Leadership, Communication, Problem-solving, Teamwork, etc.
    `

    // Prepare the prompt (CV will be sent as file)
    const prompt = promptTemplate
    
    console.log('Using OpenAI PDF file analysis')
    console.log('File size:', arrayBuffer.byteLength, 'bytes')

    // Call OpenAI with file upload
    let completion
    const maxTokens = analysisTemplate?.parameters?.max_tokens || 4000
    const temperature = analysisTemplate?.parameters?.temperature || 0.3
    
    try {
      // Create messages with PDF file attachment using the correct format
      const messages = [
        { 
          role: 'system' as const, 
          content: systemPrompt 
        },
        { 
          role: 'user' as const, 
          content: [
            {
              type: 'file' as const,
              file: {
                filename: fileName,
                file_data: `data:application/pdf;base64,${base64String}`
              }
            },
            {
              type: 'text' as const,
              text: prompt
            }
          ]
        }
      ]
      
      completion = await openai.chat.completions.create({
        model: 'gpt-4o', // GPT-4o supports PDF files
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' }
      })
      
      console.log('OpenAI PDF analysis completed')
      console.log('Tokens used:', completion.usage?.total_tokens)
      
    } catch (openaiError) {
      logSanitizedError(openaiError, {
        requestId,
        functionName: 'analyze-cv-enhanced',
        metadata: { context: 'openai_pdf_analysis_error' }
      })
      throw new Error(`Failed to analyze CV: ${openaiError.message}`)
    }

    const rawResponse = completion.choices[0].message?.content || '{}'
    console.log('OpenAI raw response:', rawResponse)
    console.log('Response length:', rawResponse.length)
    
    let analysisResult
    try {
      analysisResult = JSON.parse(rawResponse)
      console.log('Parsed analysis result keys:', Object.keys(analysisResult))
      console.log('Skills array length:', analysisResult.skills?.length || 0)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError)
      analysisResult = {}
    }
    
    await updateStatus('processing', 60, 'Processing analysis results...')
    
    // Track token usage
    const tokensUsed = completion.usage?.total_tokens || 0
    const costEstimate = calculateCost(completion.usage)
    
    await supabase
      .from('st_llm_usage_metrics')
      .insert({
        company_id: employee.company_id,
        service_type: 'cv_analysis',
        model_used: 'gpt-4o',
        input_tokens: completion.usage?.prompt_tokens || 0,
        output_tokens: completion.usage?.completion_tokens || 0,
        cost_estimate: costEstimate,
        duration_ms: Date.now() - startTime,
        success: true,
        metadata: {
          request_id: requestId,
          employee_id,
          template_used: analysisTemplate?.template_name,
          file_upload: true
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
    
    // Ensure we have skills array
    if (!analysisResult.skills || !Array.isArray(analysisResult.skills)) {
      console.error('No skills array in analysis result')
      analysisResult.skills = []
    }
    
    const extractedSkills = (analysisResult.skills || []).map((skill: AnalysisSkill) => ({
      skill_id: null, // Will be mapped to NESTA taxonomy later
      skill_name: skill.skill_name || skill.name || '',
      category: skill.category || 'technical',
      proficiency_level: skill.proficiency_level || skill.level || 3,
      years_experience: skill.years_experience,
      evidence: skill.evidence || '',
      context: skill.context || '',
      confidence: 0.9, // High confidence for direct extraction
      source: 'cv_analysis'
    })).filter(skill => skill.skill_name && skill.skill_name.length > 0)
    
    console.log(`Extracted ${extractedSkills.length} skills from analysis`)

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
    
    // Store results in temporary cv_analysis_results table
    const { error: cvResultsError } = await supabase
      .from('cv_analysis_results')
      .upsert({
        employee_id: employee_id,
        extracted_skills: extractedSkills,
        work_experience: analysisResult.work_experience || [],
        education: analysisResult.education || [],
        analysis_status: 'completed',
        analyzed_at: new Date().toISOString()
      }, { onConflict: 'employee_id' })

    if (cvResultsError) {
      logSanitizedError(cvResultsError, {
        requestId,
        functionName: 'analyze-cv-enhanced',
        metadata: { context: 'cv_results_storage' }
      })
      throw cvResultsError
    }
    
    // Store skills in st_employee_skills_profile as jsonb
    const { error: profileError } = await supabase
      .from('st_employee_skills_profile')
      .upsert({
        employee_id: employee_id,
        cv_file_path: file_path,
        extracted_skills: extractedSkills, // Now stored as jsonb array
        analyzed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        skills_match_score: matchScore,
        career_readiness_score: 75 // Default score, will be updated later
      }, { onConflict: 'employee_id' })

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

    // Update employee record with extracted data
    const { error: employeeUpdateError } = await supabase
      .from('employees')
      .update({
        cv_file_path: file_path,
        cv_extracted_data: {
          work_experience: analysisResult.work_experience || [],
          education: analysisResult.education || [],
          certifications: analysisResult.certifications || [],
          languages: analysisResult.languages || [],
          total_experience_years: analysisResult.total_experience_years || 0,
          personal_info: analysisResult.personal_info || {},
          skills_count: extractedSkills.length
        },
        skills_last_analyzed: new Date().toISOString()
      })
      .eq('id', employee_id)
    
    if (employeeUpdateError) {
      console.error('Failed to update employee record:', employeeUpdateError)
    }

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
          company_id: company_id || null, // Use company_id if available
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
    
    const errorResponse = createErrorResponse(error, {
      requestId,
      functionName: 'analyze-cv-enhanced',
      employeeId: employee_id
    }, getErrorStatusCode(error))
    
    // Ensure CORS headers are included in error responses
    const headers = new Headers(errorResponse.headers)
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })
    
    return new Response(errorResponse.body, {
      status: errorResponse.status,
      headers
    })
  }
})

function calculateCost(usage: any): number {
  // GPT-4o pricing (as of 2024)
  const inputCostPer1k = 0.005  // $5 per 1M input tokens
  const outputCostPer1k = 0.015 // $15 per 1M output tokens
  
  const inputCost = (usage?.prompt_tokens || 0) / 1000 * inputCostPer1k
  const outputCost = (usage?.completion_tokens || 0) / 1000 * outputCostPer1k
  
  return inputCost + outputCost
}