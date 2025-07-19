import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4.28.0'
import * as mammoth from 'https://esm.sh/mammoth@1.6.0'
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
      try {
        const arrayBuffer = await fileData.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Use enhanced PDF extraction
        cvText = await extractTextFromPDF(uint8Array)
        
        // Log extraction result
        console.log(`PDF extraction completed - extracted ${cvText.length} characters`)
        
        if (cvText.length < 100) {
          console.log('First 200 chars:', cvText.substring(0, 200))
        }
      } catch (pdfError) {
        console.error('PDF extraction error:', pdfError.message)
        logSanitizedError(pdfError, {
          requestId,
          functionName: 'analyze-cv-enhanced',
          metadata: { context: 'pdf_extraction', fileName }
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
      console.error(`CV text extraction failed - only ${cvText.length} characters extracted`)
      console.log('First 200 chars of extracted text:', cvText.substring(0, 200))
      
      // Update status with error
      await updateStatus('error', 30, 'Failed to extract sufficient text from CV')
      
      throw new Error(`CV content is too short or empty (only ${cvText.length} characters extracted)`)
    }
    
    // Log successful extraction
    console.log(`Successfully extracted ${cvText.length} characters from CV`)
    console.log('First 500 chars of extracted text:', cvText.substring(0, 500))
    console.log('Last 500 chars of extracted text:', cvText.substring(cvText.length - 500))
    
    await updateStatus('analyzing', 40, 'AI analyzing skills and experience...')

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
            "position": "Job title",
            "duration": "Time period",
            "achievements": ["List of key achievements or responsibilities"]
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
      
      Common skills to look for:
      - Programming: Python, JavaScript, Java, C++, Go, Ruby, PHP, Swift, Kotlin, etc.
      - Frontend: React, Angular, Vue.js, HTML, CSS, Sass, Bootstrap, Tailwind, etc.
      - Backend: Node.js, Express, Django, Flask, Spring, Rails, Laravel, etc.
      - Databases: MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, Oracle, etc.
      - Cloud: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, CI/CD, etc.
      - Tools: Git, Jira, Slack, VS Code, IntelliJ, Postman, etc.
      - Soft Skills: Leadership, Communication, Problem-solving, Teamwork, etc.
    `

    const prompt = `${promptTemplate}\n\nCV Content:\n${cvText}`
    
    console.log('Prompt template being used:', promptTemplate.substring(0, 300) + '...')
    console.log('Full prompt length:', prompt.length)
    console.log('CV text length in prompt:', cvText.length)

    // Call OpenAI with enhanced prompt
    let completion
    const maxTokens = analysisTemplate?.parameters?.max_tokens || 3000
    const temperature = analysisTemplate?.parameters?.temperature || 0.3
    
    try {
      completion = await openai.chat.completions.create({
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
        model_used: analysisTemplate?.parameters?.model || 'gpt-4-turbo-preview',
        input_tokens: completion.usage?.prompt_tokens || 0,
        output_tokens: completion.usage?.completion_tokens || 0,
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
      experience_years: analysisResult.total_experience_years || 0,
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
        tokens_used: tokensUsed,
        extraction_method: 'enhanced_pymupdf_pattern'
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
  // GPT-4 Turbo pricing (as of 2024)
  const inputCostPer1k = 0.01
  const outputCostPer1k = 0.03
  
  const inputCost = (usage?.prompt_tokens || 0) / 1000 * inputCostPer1k
  const outputCost = (usage?.completion_tokens || 0) / 1000 * outputCostPer1k
  
  return inputCost + outputCost
}

// Enhanced PDF text extraction following PyMuPDF4LLM pattern
async function extractTextFromPDF(pdfData: Uint8Array): Promise<string> {
  const pdfString = new TextDecoder('latin1').decode(pdfData)
  
  // Extract all text objects with their positions
  interface TextObject {
    text: string
    x?: number
    y?: number
    fontSize?: number
  }
  
  const textObjects: TextObject[] = []
  
  // Parse all objects in the PDF
  const objectMatches = pdfString.match(/\d+\s+\d+\s+obj[\s\S]*?endobj/g) || []
  
  for (const obj of objectMatches) {
    // Skip if not a content stream
    if (!obj.includes('stream')) continue
    
    // Extract the stream content
    const streamMatch = obj.match(/stream\s*([\s\S]*?)\s*endstream/)
    if (!streamMatch) continue
    
    const streamContent = streamMatch[1]
    let currentX = 0
    let currentY = 0
    let currentFontSize = 12
    
    // Parse text positioning and extraction commands
    const commands = streamContent.split(/\s+/)
    
    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i]
      
      // Text positioning (Td, TD, Tm)
      if (cmd === 'Td' && i >= 2) {
        currentX += parseFloat(commands[i-2]) || 0
        currentY += parseFloat(commands[i-1]) || 0
      } else if (cmd === 'Tm' && i >= 6) {
        currentX = parseFloat(commands[i-2]) || 0
        currentY = parseFloat(commands[i-1]) || 0
      }
      
      // Font size (Tf)
      if (cmd === 'Tf' && i >= 2) {
        currentFontSize = parseFloat(commands[i-1]) || 12
      }
      
      // Text extraction (Tj)
      if (cmd === 'Tj' && i >= 1) {
        const textMatch = commands[i-1].match(/^\((.*)\)$/)
        if (textMatch) {
          const text = decodeOctalString(textMatch[1])
          if (text.trim()) {
            textObjects.push({
              text,
              x: currentX,
              y: currentY,
              fontSize: currentFontSize
            })
          }
        }
      }
      
      // Text array extraction (TJ)
      if (cmd === 'TJ' && i >= 1) {
        // Find the array in the original stream content
        const tjIndex = streamContent.indexOf(commands[i-1])
        const arrayMatch = streamContent.substring(tjIndex).match(/^\[(.*?)\]/)
        if (arrayMatch) {
          const arrayContent = arrayMatch[1]
          const textMatches = arrayContent.match(/\([^)]*\)/g) || []
          const texts = textMatches.map(m => decodeOctalString(m.slice(1, -1)))
          const combinedText = texts.join('').trim()
          if (combinedText) {
            textObjects.push({
              text: combinedText,
              x: currentX,
              y: currentY,
              fontSize: currentFontSize
            })
          }
        }
      }
    }
  }
  
  // If structured extraction found text, organize it
  if (textObjects.length > 0) {
    // Sort by Y position (top to bottom) then X position (left to right)
    textObjects.sort((a, b) => {
      const yDiff = (b.y || 0) - (a.y || 0) // PDF Y coordinates are bottom-up
      if (Math.abs(yDiff) > 5) return yDiff
      return (a.x || 0) - (b.x || 0)
    })
    
    // Group text objects into lines based on Y position
    const lines: string[] = []
    let currentLine: string[] = []
    let lastY = textObjects[0]?.y || 0
    
    for (const obj of textObjects) {
      const yDiff = Math.abs((obj.y || 0) - lastY)
      
      // New line if Y position changes significantly
      if (yDiff > 5 && currentLine.length > 0) {
        lines.push(currentLine.join(' '))
        currentLine = []
      }
      
      currentLine.push(obj.text)
      lastY = obj.y || 0
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '))
    }
    
    const structuredText = lines.join('\n')
    console.log(`Structured extraction found ${structuredText.length} characters in ${lines.length} lines`)
    
    if (structuredText.length > 100) {
      return cleanExtractedText(structuredText)
    }
  }
  
  // Fallback: Enhanced pattern matching for text content
  let extractedText = ''
  
  // Method 1: Extract from BT...ET blocks with better handling
  const btBlocks = pdfString.match(/BT[\s\S]*?ET/g) || []
  for (const block of btBlocks) {
    // Extract all text showing operations
    const textOps = block.match(/\(((?:[^()\\]|\\[\\()]|\\[0-7]{1,3})*)\)\s*Tj/g) || []
    const tjTexts = textOps.map(op => {
      const match = op.match(/\(((?:[^()\\]|\\[\\()]|\\[0-7]{1,3})*)\)/)
      return match ? decodeOctalString(match[1]) : ''
    }).filter(t => t.trim())
    
    // Extract from TJ arrays
    const tjArrays = block.match(/\[((?:[^\[\]]*\([^)]*\)[^\[\]]*)*)\]\s*TJ/g) || []
    for (const array of tjArrays) {
      const strings = array.match(/\(([^)]*)\)/g) || []
      const arrayTexts = strings.map(s => decodeOctalString(s.slice(1, -1))).filter(t => t.trim())
      tjTexts.push(...arrayTexts)
    }
    
    if (tjTexts.length > 0) {
      extractedText += tjTexts.join(' ') + '\n'
    }
  }
  
  // Method 2: Direct text pattern extraction
  if (extractedText.length < 100) {
    const directTextMatches = pdfString.match(/\(([^)]+)\)/g) || []
    const directTexts = directTextMatches
      .map(match => decodeOctalString(match.slice(1, -1)))
      .filter(text => {
        // Filter out non-text content
        const cleaned = text.trim()
        return cleaned.length > 2 && /[a-zA-Z]/.test(cleaned)
      })
    
    if (directTexts.length > 0) {
      extractedText = directTexts.join(' ')
    }
  }
  
  console.log(`Fallback extraction found ${extractedText.length} characters`)
  
  return cleanExtractedText(extractedText) || 'Unable to extract text from PDF'
}

// Clean and normalize extracted text
function cleanExtractedText(text: string): string {
  return text
    // Fix common OCR/extraction issues
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/(\w)-\s+(\w)/g, '$1$2') // Fix word breaks
    .replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2') // Add paragraph breaks
    .replace(/•/g, '\n• ') // Format bullet points
    .replace(/[^\x20-\x7E\n\r\t]/g, '') // Remove non-printable chars
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim()
}

// Helper function to decode octal strings in PDFs
function decodeOctalString(str: string): string {
  return str
    .replace(/\\(\d{1,3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
}