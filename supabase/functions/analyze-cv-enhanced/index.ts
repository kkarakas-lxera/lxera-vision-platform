import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// Responses API is available from v5.0.0 upward
import OpenAI from 'https://esm.sh/openai@5.11.0'
// Error handling utilities (inlined to avoid import issues)
interface ErrorLogContext {
  requestId: string;
  functionName: string;
  userId?: string;
  employeeId?: string;
  metadata?: Record<string, any>;
}

interface SanitizedError {
  type: string;
  message: string;
  code?: string;
  requestId: string;
  timestamp: string;
}

function getSafeErrorMessage(error: any): string {
  if (!error) return 'Unknown error occurred';
  
  const message = error.message || String(error);
  
  // Remove potentially sensitive information
  return message
    .replace(/\/[^\/\s]+\/[^\/\s]+\/[^\/\s]+/g, '/***/***/***') // Remove file paths
    .replace(/key_[a-zA-Z0-9]+/g, 'key_***') // Remove API keys
    .replace(/token_[a-zA-Z0-9]+/g, 'token_***') // Remove tokens
    .replace(/password[:\s]*[^\s]+/gi, 'password: ***') // Remove passwords
    .replace(/secret[:\s]*[^\s]+/gi, 'secret: ***') // Remove secrets
    .substring(0, 200); // Limit message length
}

function logSanitizedError(error: any, context: ErrorLogContext): void {
  const sanitized: SanitizedError = {
    type: error.constructor?.name || 'Error',
    message: getSafeErrorMessage(error),
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  };

  if (error.code) {
    sanitized.code = error.code;
  }
  
  console.error(`[${context.functionName}] [${context.requestId}] Error:`, {
    type: sanitized.type,
    message: sanitized.message,
    code: sanitized.code,
    timestamp: sanitized.timestamp,
    metadata: context.metadata
  });
}

function getUserFriendlyErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred';
  
  const message = error.message || String(error);
  
  // Return user-friendly messages for common errors
  if (message.includes('OPENAI_API_KEY') || message.includes('API key')) {
    return 'Service is temporarily unavailable. Please contact support.';
  }
  
  if (message.includes('rate limit') || message.includes('429')) {
    return 'Too many requests. Please try again in a few moments.';
  }
  
  if (message.includes('timeout') || message.includes('TIMEOUT')) {
    return 'Request timed out. Please try again.';
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return 'Invalid input provided. Please check your data.';
  }
  
  if (message.includes('unauthorized') || message.includes('401')) {
    return 'Authentication required. Please log in.';
  }
  
  if (message.includes('forbidden') || message.includes('403')) {
    return 'Access denied. You do not have permission to perform this action.';
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 'Requested resource not found.';
  }
  
  // For file upload errors, preserve some specific messages
  if (message.includes('Unsupported file type') || 
      message.includes('File too large') || 
      message.includes('CV text too short')) {
    return message;
  }
  
  // Default generic message
  return 'An unexpected error occurred. Please try again.';
}

function getErrorStatusCode(error: any): number {
  if (!error) return 500;
  
  const message = error.message || String(error);
  
  if (message.includes('OPENAI_API_KEY') || message.includes('API key')) {
    return 503; // Service Unavailable
  }
  
  if (message.includes('rate limit') || message.includes('429')) {
    return 429; // Too Many Requests
  }
  
  if (message.includes('timeout')) {
    return 504; // Gateway Timeout
  }
  
  if (message.includes('validation') || message.includes('invalid') || 
      message.includes('CV text too short') || message.includes('Unsupported file type')) {
    return 400; // Bad Request
  }
  
  if (message.includes('unauthorized') || message.includes('401')) {
    return 401; // Unauthorized
  }
  
  if (message.includes('forbidden') || message.includes('403')) {
    return 403; // Forbidden
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 404; // Not Found
  }
  
  return 500; // Internal Server Error
}

function createErrorResponse(
  error: any, 
  context: ErrorLogContext, 
  statusCode: number = 500
): Response {
  // Log the error with sanitized information
  logSanitizedError(error, context);
  
  // Create user-friendly response
  const userMessage = getUserFriendlyErrorMessage(error);
  
  const responseBody = {
    error: userMessage,
    request_id: context.requestId,
    timestamp: new Date().toISOString()
  };
  
  // Only include error details in development mode
  if (Deno.env.get('DEVELOPMENT') === 'true') {
    responseBody.details = getSafeErrorMessage(error);
  }
  
  return new Response(
    JSON.stringify(responseBody),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  );
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

/**
 * Parse a JSON string that may have stray bytes (BOM, dash, newline, etc.)
 * before the opening brace. Falls back to stripping everything before the
 * first "{". If parsing still fails, the original error is re-thrown.
 */
function safeJsonParse(raw: string): any {
  try {
    return JSON.parse(raw);
  } catch (err) {
    const brace = raw.indexOf('{');
    if (brace !== -1) {
      return JSON.parse(raw.slice(brace));
    }
    throw err;
  }
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
  
  // Initialize Supabase client at function scope for error handlers
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  try {
    // Check content type to determine how to parse the request
    const contentType = req.headers.get('content-type') || ''
    let file_path: string
    let source: string = 'form_profile_builder'
    let session_item_id: string | undefined
    let use_template: boolean = false
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'No authorization header' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create client with user's auth token for auth checks
      const authClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      )

      // Verify user is authenticated
      const { data: { user }, error: authError } = await authClient.auth.getUser()
      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authentication' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Parse FormData
      const formData = await req.formData()
      const file = formData.get('file') as File
      employee_id = formData.get('employeeId') as string

      if (!file || !employee_id) {
        return new Response(
          JSON.stringify({ error: 'Missing file or employeeId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user's profile using service client
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('company_id, role')
        .eq('id', user.id)
        .single()

      if (profileError || !userProfile) {
        return new Response(
          JSON.stringify({ error: 'User profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check permissions - allow learners to upload their own CV
      if (!['company_admin', 'super_admin', 'learner'].includes(userProfile.role)) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Verify employee belongs to user's company
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('company_id, user_id')
        .eq('id', employee_id)
        .single()

      if (employeeError || !employee || employee.company_id !== userProfile.company_id) {
        return new Response(
          JSON.stringify({ error: 'Employee not found or unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Additional check for learners - they can only upload their own CV
      if (userProfile.role === 'learner' && employee.user_id !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Learners can only upload their own CV' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create file path
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      file_path = `${employee_id}/${timestamp}-${fileName}`

      // Upload file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee-cvs')
        .upload(file_path, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        logSanitizedError(uploadError, {
          requestId,
          functionName: 'analyze-cv-enhanced',
          metadata: { context: 'storage_upload' }
        })
        return new Response(
          JSON.stringify({ error: 'Upload failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Update employee record with CV path
      const { error: updateError } = await supabase
        .from('employees')
        .update({ 
          cv_file_path: file_path,
          cv_uploaded_at: new Date().toISOString()
        })
        .eq('id', employee_id)

      if (updateError) {
        logSanitizedError(updateError, {
          requestId,
          functionName: 'analyze-cv-enhanced',
          metadata: { context: 'employee_update' }
        })
        // Try to clean up uploaded file
        await supabase.storage.from('employee-cvs').remove([file_path])
        
        return new Response(
          JSON.stringify({ error: 'Failed to update employee record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      company_id = userProfile.company_id
    } else {
      // Handle JSON body (existing functionality)
      try {
        const body = await req.json()
        employee_id = body.employee_id
        file_path = body.file_path
        source = body.source || source
        session_item_id = body.session_item_id
        use_template = body.use_template || false
        
        // Validate required parameters
        if (!employee_id || !file_path) {
          throw new Error('Missing required parameters: employee_id and file_path')
        }
      } catch (jsonError: any) {
        // If JSON parsing fails, provide a clearer error
        if (jsonError.message?.includes('JSON')) {
          throw new Error('Invalid request body. Expected JSON or multipart/form-data')
        }
        throw jsonError
      }
    }
    
    // Initialize OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured')
    }
    
    const openai = new OpenAI({ apiKey: openaiApiKey })
    
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
              company_id: company_id || 'unknown',
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
    
    // Validate required parameters before proceeding
    if (!employee_id) {
      throw new Error('Employee ID is required')
    }
    
    if (!file_path) {
      throw new Error('File path is required')
    }
    
    // Initial status update
    await updateStatus('started', 0, 'Starting CV analysis')
    
    // Fetch employee data to get company_id
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, company_id, user_id, employee_profile_sections(id, section_name, data)')
      .eq('id', employee_id)
      .single()
    
    if (empError || !employee) {
      console.error('Employee query error:', empError)
      throw new Error(`Employee not found: ${employee_id}`)
    }
    
    company_id = employee.company_id
    
    // Update status: Downloading CV
    await updateStatus('downloading', 10, 'Downloading CV file')
    
    // Download the CV file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('employee-cvs')
      .download(file_path)
    
    if (downloadError || !fileData) {
      throw new Error(`Failed to download CV: ${downloadError?.message || 'Unknown error'}`)
    }
    
    // Update status: Processing CV
    await updateStatus('processing', 20, 'Processing CV file')
    
    // Convert file to base64
    const buffer = await fileData.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    
    // Extract text from CV using OpenAI Vision API
    await updateStatus('extracting', 30, 'Extracting text from CV')
    
    // Determine if the file is a PDF or image based on file extension
    const isPdf = file_path.toLowerCase().endsWith('.pdf')
    
    // For PDFs, use the new responses API; for images, use chat completions
    let extractedText = ''
    let apiResponse: any = null
    let modelUsed = 'gpt-4o-mini'
    
    if (isPdf) {
      try {
        // Use the new responses API for PDF processing
        modelUsed = 'gpt-4o'
        apiResponse = await openai.responses.create({
          model: modelUsed,
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_file",
                  filename: file_path.split('/').pop() || 'cv.pdf',
                  file_data: `data:application/pdf;base64,${base64}`
                },
                {
                  type: "input_text",
                  text: "Extract all text from this CV/resume document. Maintain the structure and formatting as much as possible. Return as plain text."
                }
              ]
            }
          ]
        })
        
        extractedText = apiResponse.output_text || ''
      } catch (pdfError: any) {
        console.error('PDF processing with responses API failed:', pdfError)
        
        // If the responses API fails, provide a helpful error message
        if (pdfError.message?.includes('Invalid MIME type') || pdfError.message?.includes('400')) {
          throw new Error('PDF processing failed. The document may be corrupted or in an unsupported format. Please try converting to an image format (JPG/PNG) or ensure the PDF contains readable content.')
        }
        
        // For other errors, re-throw with context
        throw new Error(`PDF processing failed: ${pdfError.message}`)
      }
    } else {
      // Use chat completions for images
      apiResponse = await openai.chat.completions.create({
        model: modelUsed,
        messages: [
          {
            role: "system",
            content: "You are a CV text extractor. Extract all text from the CV document and return it as plain text. Maintain the structure and formatting as much as possible."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please extract all text from this CV/resume document."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
        temperature: 0
      })
      
      extractedText = apiResponse.choices[0]?.message?.content || ''
    }
    
    if (!extractedText) {
      throw new Error('Failed to extract text from CV')
    }
    
    // Log token usage for extraction
    let extractionUsage: any = null
    
    if (isPdf) {
      // For responses API, we'll estimate usage based on content length
      extractionUsage = {
        prompt_tokens: Math.ceil(extractedText.length / 4), // Rough estimate
        completion_tokens: Math.ceil(extractedText.length / 4)
      }
    } else {
      // For chat completions, we have actual usage data
      extractionUsage = apiResponse?.usage
    }
    
    if (extractionUsage) {
      await supabase.from('st_llm_usage_metrics').insert({
        company_id,
        service_type: 'cv_text_extraction',
        model_used: modelUsed,
        input_tokens: extractionUsage.prompt_tokens || 0,
        output_tokens: extractionUsage.completion_tokens || 0,
        cost_estimate: calculateCost(modelUsed, extractionUsage.prompt_tokens || 0, extractionUsage.completion_tokens || 0),
        duration_ms: Date.now() - startTime,
        success: true,
        metadata: {
          request_id: requestId,
          employee_id,
          file_path,
          api_type: isPdf ? 'responses' : 'chat_completions'
        }
      })
    }
    
    // Update status: Analyzing content
    await updateStatus('analyzing', 50, 'Analyzing CV content')
    
    // Analyze the CV content
    const analysisPrompt = `Analyze this CV/resume and extract structured information.

CV Text:
${extractedText}

Please extract and structure the following information:
1. Personal Information (name, email, phone, location)
2. Professional Summary/Objective
3. Work Experience (company, role, duration, responsibilities)
4. Education (institution, degree, graduation year)
5. Skills (technical and soft skills)
6. Certifications
7. Languages
8. Key Achievements

${use_template && use_template === true ? `
Also include:
9. What tools and technologies they regularly use
10. What challenges they typically face in their role
11. Potential growth areas based on their experience
` : ''}

Return the information in a structured JSON format.

Return ONLY a valid JSON object with no Markdown, no code fences, and no characters before the opening '{'.`

    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional CV analyzer. Extract and structure information from CVs accurately."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0,
      response_format: { type: "json_object" }
    })
    
    const analysisResult = safeJsonParse(analysisResponse.choices[0]?.message?.content || '{}')
    
    // Log token usage for analysis
    const analysisUsage = analysisResponse.usage
    if (analysisUsage) {
      await supabase.from('st_llm_usage_metrics').insert({
        company_id,
        service_type: 'cv_content_analysis',
        model_used: 'gpt-4o-mini',
        input_tokens: analysisUsage.prompt_tokens || 0,
        output_tokens: analysisUsage.completion_tokens || 0,
        cost_estimate: calculateCost('gpt-4o-mini', analysisUsage.prompt_tokens || 0, analysisUsage.completion_tokens || 0),
        duration_ms: Date.now() - startTime,
        success: true,
        metadata: {
          request_id: requestId,
          employee_id,
          file_path
        }
      })
    }
    
    // Update status: Skills extraction
    await updateStatus('skills_extraction', 70, 'Extracting and analyzing skills')
    
    // Extract skills with proficiency levels
    const skillsPrompt = `Based on this CV analysis, identify all skills mentioned and estimate proficiency levels.

CV Analysis:
${JSON.stringify(analysisResult, null, 2)}

For each skill, provide:
1. skill_name: The name of the skill
2. proficiency_level: A number from 1-5 (1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert)
3. years_of_experience: Estimated years (can be decimal)
4. context: Where/how this skill was used

Consider:
- Explicit mentions of skills
- Skills implied by work experience
- Skills from certifications
- Tools and technologies used

Return as JSON with a "skills" array.

Return ONLY a valid JSON object with no Markdown, no code fences, and no characters before the opening '{'.`

    const skillsResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a skills assessment expert. Extract skills from CVs and estimate proficiency levels based on experience and context."
        },
        {
          role: "user",
          content: skillsPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0,
      response_format: { type: "json_object" }
    })
    
    const skillsData = safeJsonParse(skillsResponse.choices[0]?.message?.content || '{"skills":[]}')
    
    // Log token usage for skills extraction
    const skillsUsage = skillsResponse.usage
    if (skillsUsage) {
      await supabase.from('st_llm_usage_metrics').insert({
        company_id,
        service_type: 'cv_skills_extraction',
        model_used: 'gpt-4o-mini',
        input_tokens: skillsUsage.prompt_tokens || 0,
        output_tokens: skillsUsage.completion_tokens || 0,
        cost_estimate: calculateCost('gpt-4o-mini', skillsUsage.prompt_tokens || 0, skillsUsage.completion_tokens || 0),
        duration_ms: Date.now() - startTime,
        success: true,
        metadata: {
          request_id: requestId,
          employee_id,
          file_path
        }
      })
    }
    
    // Update status: Saving results
    await updateStatus('saving', 90, 'Saving analysis results')
    
    // Save the analysis results
    const { error: updateError } = await supabase
      .from('employees')
      .update({
        cv_extracted_data: {
          ...analysisResult,
          extracted_text: extractedText,
          extraction_timestamp: new Date().toISOString()
        },
        cv_analysis_data: {
          skills: skillsData.skills,
          analysis_version: '2.0',
          analysis_timestamp: new Date().toISOString()
        }
      })
      .eq('id', employee_id)
    
    if (updateError) {
      throw new Error(`Failed to save analysis results: ${updateError.message}`)
    }
    
    // If session_item_id is provided, update the chat session item
    if (session_item_id && source === 'chat_profile_builder') {
      await supabase
        .from('st_chat_session_items')
        .update({
          tool_result: {
            cv_analysis: analysisResult,
            skills: skillsData.skills
          }
        })
        .eq('id', session_item_id)
    }
    
    // Ensure employee has a current_position_id before creating skills profile
    // The database trigger requires this field to prevent orphaned skills profiles
    if (!employee.current_position_id) {
      console.log('Employee lacks current_position_id, attempting to assign default position')
      
      // Try to find an existing position for this company
      const { data: companyPositions, error: positionsError } = await supabase
        .from('st_company_positions')
        .select('id, position_title')
        .eq('company_id', company_id)
        .limit(1)
      
      let defaultPositionId = null
      
      if (positionsError || !companyPositions || companyPositions.length === 0) {
        // Create an "Unassigned" position for this company
        console.log('No positions found, creating Unassigned position')
        const { data: newPosition, error: createPositionError } = await supabase
          .from('st_company_positions')
          .insert({
            company_id,
            position_code: 'UNASSIGNED',
            position_title: 'Unassigned',
            description: 'Default position for employees without assigned roles',
            department: 'General'
          })
          .select('id')
          .single()
        
        if (createPositionError || !newPosition) {
          console.error('Failed to create default position:', createPositionError)
          throw new Error('Unable to assign position to employee - skills profile creation failed')
        }
        
        defaultPositionId = newPosition.id
      } else {
        // Use the first available position
        defaultPositionId = companyPositions[0].id
        console.log(`Assigning employee to existing position: ${companyPositions[0].position_title}`)
      }
      
      // Update employee with the position
      const { error: updatePositionError } = await supabase
        .from('employees')
        .update({ current_position_id: defaultPositionId })
        .eq('id', employee_id)
      
      if (updatePositionError) {
        console.error('Failed to update employee position:', updatePositionError)
        throw new Error('Unable to assign position to employee - skills profile creation failed')
      }
      
      console.log('Successfully assigned position to employee')
    }

    // Create or update skills profile record
    const { error: skillsProfileError } = await supabase
      .from('st_employee_skills_profile')
      .upsert({
        employee_id,
        extracted_skills: skillsData.skills?.map((skill: any) => ({
          skill_name: skill.skill_name,
          proficiency: skill.proficiency_level || 0,
          years_experience: skill.years_experience || 0
        })) || [],
        gap_analysis_completed_at: new Date().toISOString(),
        analyzed_at: new Date().toISOString()
      }, { 
        onConflict: 'employee_id' 
      })

    if (skillsProfileError) {
      console.error('Failed to create skills profile:', skillsProfileError)
      // This is now critical since we've ensured position assignment
      throw new Error(`Failed to create skills profile: ${skillsProfileError.message}`)
    }

    // Update final status
    await updateStatus('completed', 100, 'Analysis completed successfully')
    
    const totalDuration = Date.now() - startTime
    console.log(`CV analysis completed in ${totalDuration}ms`)
    
    return new Response(
      JSON.stringify({
        success: true,
        employee_id,
        analysis: analysisResult,
        skills: skillsData.skills,
        request_id: requestId,
        duration_ms: totalDuration
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
    
  } catch (error: any) {
    console.error('CV analysis error:', error)
    
    // Try to update status to failed
    if (employee_id) {
      try {
        await supabase
          .from('cv_analysis_status')
          .upsert({
            employee_id,
            session_id: sessionId,
            status: 'failed',
            progress: 0,
            message: getUserFriendlyErrorMessage(error),
            metadata: { 
              source: 'analyze-cv-enhanced',
              request_id: requestId,
              error: error.message 
            },
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'employee_id,session_id'
          })
      } catch (statusError) {
        console.error('Failed to update error status:', statusError)
      }
    }
    
    // Log error to metrics if we have company_id
    if (company_id) {
      try {
        await supabase
          .from('st_llm_usage_metrics')
          .insert({
            company_id,
            service_type: 'cv_analysis_error',
            model_used: 'none',
            input_tokens: 0,
            output_tokens: 0,
            cost_estimate: 0,
            duration_ms: Date.now() - startTime,
            success: false,
            error_code: error.code || 'UNKNOWN',
            metadata: {
              request_id: requestId,
              employee_id,
              error: error.message
            }
          })
      } catch (metricsError) {
        console.error('Failed to log error metrics:', metricsError)
      }
    }
    
    return createErrorResponse(error, {
      requestId,
      functionName: 'analyze-cv-enhanced'
    }, getErrorStatusCode(error))
  }
})

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o-mini': { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
    'gpt-4o': { input: 2.50 / 1_000_000, output: 10.00 / 1_000_000 },
    'gpt-4-turbo': { input: 10.00 / 1_000_000, output: 30.00 / 1_000_000 },
    'gpt-3.5-turbo': { input: 0.50 / 1_000_000, output: 1.50 / 1_000_000 }
  }
  
  const modelPricing = pricing[model] || pricing['gpt-4o-mini']
  return (inputTokens * modelPricing.input) + (outputTokens * modelPricing.output)
}