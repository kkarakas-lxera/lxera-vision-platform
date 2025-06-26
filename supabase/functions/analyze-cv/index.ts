import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0'
import { PDFExtract } from 'https://esm.sh/pdf-extract@1.0.12'
import * as mammoth from 'https://esm.sh/mammoth@1.6.0'

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
  
  try {
    const { employee_id, file_path, source } = await req.json()
    
    console.log(`[${requestId}] Starting CV analysis for employee ${employee_id}`)
    
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

    console.log(`Analyzing CV for employee ${employee_id}, source: ${source || 'storage'}, path: ${file_path}`)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if this is a database-stored CV
    let cvContent = null
    if (source === 'database' || file_path.startsWith('db:')) {
      console.log('Fetching CV from database...')
      
      // Extract employee ID from path if needed
      const dbEmployeeId = file_path.startsWith('db:') 
        ? file_path.substring(3) 
        : employee_id

      // Fetch CV from database
      const { data: cvData, error: cvError } = await supabase
        .from('employee_cv_data')
        .select('file_name, file_type, file_data')
        .eq('employee_id', dbEmployeeId)
        .single()

      if (cvError) {
        throw new Error(`Failed to fetch CV from database: ${cvError.message}`)
      }

      if (!cvData) {
        throw new Error('No CV found in database')
      }

      cvContent = {
        fileName: cvData.file_name,
        fileType: cvData.file_type,
        // Convert base64 data URL to raw base64
        fileData: cvData.file_data.split(',')[1] || cvData.file_data
      }
      
      console.log(`Found CV in database: ${cvContent.fileName}`)
    }

    // Update the employee record with CV file path and analysis timestamp
    const updateData: any = { 
      cv_file_path: file_path,
      skills_last_analyzed: new Date().toISOString()
    }

    const { error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', employee_id)

    if (error) throw error

    // Get employee position information
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select(`
        position,
        st_company_positions!employees_position_fkey(
          position_code,
          position_title,
          required_skills,
          nice_to_have_skills
        )
      `)
      .eq('id', employee_id)
      .single()

    if (empError || !employee) {
      throw new Error('Failed to fetch employee position information')
    }

    const position = employee.st_company_positions
    
    if (!position) {
      console.warn('No position found for employee, cannot perform gap analysis')
    }

    // Extract text from CV based on source
    let cvText = ''
    
    if (cvContent) {
      console.log(`Extracting text from ${cvContent.fileType} file...`)
      
      try {
        // Convert base64 to buffer
        const buffer = Uint8Array.from(atob(cvContent.fileData), c => c.charCodeAt(0))
        
        if (cvContent.fileType === 'application/pdf') {
          // Extract text from PDF
          const pdfExtract = new PDFExtract()
          const options = {
            firstPage: 1,
            lastPage: undefined,
            password: '',
            verbosity: 0,
            normalizeWhitespace: true,
            disableCombineTextItems: false
          }
          
          // Create temporary file for PDF processing
          const tempFile = await Deno.makeTempFile({ suffix: '.pdf' })
          await Deno.writeFile(tempFile, buffer)
          
          const data = await new Promise((resolve, reject) => {
            pdfExtract.extract(tempFile, options, (err: any, data: any) => {
              if (err) reject(err)
              else resolve(data)
            })
          })
          
          // Clean up temp file
          await Deno.remove(tempFile)
          
          // Extract text from all pages
          cvText = (data as any).pages
            .map((page: any) => page.content.map((item: any) => item.str).join(' '))
            .join('\n\n')
            
        } else if (cvContent.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Extract text from DOCX
          const result = await mammoth.extractRawText({ buffer })
          cvText = result.value
          
          if (result.messages.length > 0) {
            console.warn('DOCX extraction warnings:', result.messages)
          }
          
        } else if (cvContent.fileType === 'text/plain') {
          // Plain text file
          cvText = new TextDecoder().decode(buffer)
        } else {
          throw new Error(`Unsupported file type: ${cvContent.fileType}`)
        }
        
        // Clean up extracted text
        cvText = cvText
          .replace(/\s+/g, ' ') // Normalize whitespace
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
          .trim()
          
        console.log(`Extracted ${cvText.length} characters from CV`)
        
        if (cvText.length < 100) {
          throw new Error('CV text too short, possibly corrupted or empty')
        }
        
      } catch (extractError) {
        console.error('Failed to extract CV text:', extractError)
        throw new Error(`Failed to parse ${cvContent.fileType} file: ${extractError.message}`)
      }
      
      console.log('Analyzing CV with OpenAI...')
      
      // Create the analysis prompt
      const requiredSkillsList = position?.required_skills?.map((s: any) => s.skill_name).join(', ') || 'general skills'
      const niceToHaveSkillsList = position?.nice_to_have_skills?.map((s: any) => s.skill_name).join(', ') || ''
      
      const prompt = `Analyze this CV for the position of ${position?.position_title || 'Unknown Position'}.

Required skills for this position: ${requiredSkillsList}
Nice-to-have skills: ${niceToHaveSkillsList}

CV Content:
${cvText}

Extract all relevant skills from the CV and rate the proficiency level for each skill on a scale of 1-5:
1 = Beginner (just learning, minimal experience)
2 = Basic (some experience, can work with guidance)
3 = Intermediate (solid experience, can work independently)
4 = Advanced (expert level, can mentor others)
5 = Expert (thought leader, extensive experience)

Focus on the required skills but include all relevant technical and soft skills found.

Return the response in the following JSON format:
{
  "summary": "2-3 sentence professional summary of the candidate",
  "skills": [
    {
      "name": "skill name",
      "level": 1-5,
      "years_experience": estimated years or null,
      "evidence": "brief evidence from CV supporting this skill level"
    }
  ],
  "overall_fit": "brief assessment of fit for the position"
}`

      // Implement retry logic for OpenAI API calls
      let completion
      let retries = 0
      const maxRetries = 3
      const retryDelay = 1000 // Start with 1 second
      
      while (retries < maxRetries) {
        try {
          console.log(`[${requestId}] Calling OpenAI API (attempt ${retries + 1}/${maxRetries})`)
          
          completion = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content: 'You are an expert HR analyst specializing in technical skill assessment from CVs. Always respond with valid JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000
          })
          
          // Success - break out of retry loop
          break
          
        } catch (apiError) {
          retries++
          
          if (retries >= maxRetries) {
            throw apiError
          }
          
          // Check if error is retryable
          const isRetryable = apiError.response?.status === 429 || // Rate limit
                            apiError.response?.status === 503 || // Service unavailable
                            apiError.response?.status >= 500     // Server errors
          
          if (!isRetryable) {
            throw apiError
          }
          
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, retries - 1)
          console.log(`[${requestId}] OpenAI API error, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

        const responseContent = completion.data.choices[0].message?.content || '{}'
        let analysisResult
        
        try {
          analysisResult = JSON.parse(responseContent)
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', responseContent)
          throw new Error('Invalid response format from AI analysis')
        }
        
        // Validate response structure
        if (!analysisResult.skills || !Array.isArray(analysisResult.skills)) {
          throw new Error('Invalid analysis result: missing skills array')
        }
        
        // Calculate skill gaps
        const skillGaps = []
        let matchedSkills = 0
        
        if (position?.required_skills) {
          for (const reqSkill of position.required_skills) {
            const foundSkill = analysisResult.skills.find((s: any) => 
              s.name.toLowerCase() === reqSkill.skill_name.toLowerCase()
            )
            
            if (foundSkill && foundSkill.level >= reqSkill.proficiency_level) {
              matchedSkills++
            } else {
              skillGaps.push({
                skill_name: reqSkill.skill_name,
                required_level: reqSkill.proficiency_level,
                current_level: foundSkill?.level || 0,
                gap: reqSkill.proficiency_level - (foundSkill?.level || 0)
              })
            }
          }
        }
        
        const matchPercentage = position?.required_skills?.length > 0
          ? Math.round((matchedSkills / position.required_skills.length) * 100)
          : null

        // Store the analysis results
        const { error: profileError } = await supabase
          .from('st_employee_skills_profile')
          .upsert({
            employee_id: employee_id,
            cv_file_path: file_path,
            cv_summary: analysisResult.summary,
            extracted_skills: analysisResult.skills.map((s: any) => ({
              skill_id: null, // We're not mapping to skill taxonomy yet
              skill_name: s.name,
              proficiency_level: s.level,
              years_experience: s.years_experience,
              evidence: s.evidence
            })),
            current_position_id: position?.id || null,
            skills_match_score: matchPercentage,
            analyzed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            skills_data: {
              source: 'cv_analysis',
              analyzed_at: new Date().toISOString(),
              cv_source: source || 'storage',
              status: 'completed',
              skill_gaps: skillGaps,
              overall_fit: analysisResult.overall_fit,
              skills: analysisResult.skills
            }
          }, {
            onConflict: 'employee_id'
          })

        if (profileError) {
          console.error('Failed to store skills profile:', profileError)
          throw profileError
        }
        
        const analysisTime = Date.now() - startTime
        console.log(`[${requestId}] CV analysis completed in ${analysisTime}ms. Match: ${matchPercentage}%, Gaps: ${skillGaps.length}`)
        
        // Log analysis metrics for monitoring
        try {
          await supabase
            .from('cv_analysis_metrics')
            .insert({
              request_id: requestId,
              employee_id: employee_id,
              analysis_time_ms: analysisTime,
              cv_length: cvText.length,
              skills_extracted: analysisResult.skills.length,
              match_percentage: matchPercentage,
              gaps_found: skillGaps.length,
              status: 'success',
              created_at: new Date().toISOString()
            })
        } catch (metricsError) {
          console.error('Failed to log metrics:', metricsError)
          // Don't throw here - metrics logging is optional
        }
        
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError)
        
        // Check for specific error types
        if (openaiError.response?.status === 401) {
          throw new Error('OpenAI API key is invalid or not configured')
        } else if (openaiError.response?.status === 429) {
          throw new Error('OpenAI API rate limit exceeded. Please try again later.')
        } else if (openaiError.response?.status === 503) {
          throw new Error('OpenAI service is temporarily unavailable')
        }
        
        throw new Error(`Failed to analyze CV: ${openaiError.message || 'Unknown error'}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'CV uploaded and queued for analysis successfully',
        employee_id,
        file_path,
        source: source || 'storage',
        cv_found: !!cvContent
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    const errorTime = Date.now() - startTime
    console.error(`[${requestId}] Error in analyze-cv function after ${errorTime}ms:`, error)
    
    // Log error metrics
    try {
      await supabase
        .from('cv_analysis_metrics')
        .insert({
          request_id: requestId,
          employee_id: employee_id || 'unknown',
          analysis_time_ms: errorTime,
          cv_length: 0,
          skills_extracted: 0,
          gaps_found: 0,
          status: 'failed',
          error_message: error.message || 'Unknown error',
          created_at: new Date().toISOString()
        })
    } catch (logError) {
      console.error(`[${requestId}] Failed to log error metrics:`, logError)
    }
    
    // Return user-friendly error messages
    let statusCode = 500
    let userMessage = 'An error occurred while analyzing the CV'
    
    if (error.message.includes('OPENAI_API_KEY')) {
      statusCode = 503
      userMessage = 'CV analysis service is not configured. Please contact support.'
    } else if (error.message.includes('rate limit')) {
      statusCode = 429
      userMessage = 'Too many requests. Please try again in a few moments.'
    } else if (error.message.includes('Invalid response format')) {
      statusCode = 502
      userMessage = 'Failed to process CV analysis results. Please try again.'
    } else if (error.message.includes('CV text too short')) {
      statusCode = 400
      userMessage = 'The CV appears to be empty or corrupted. Please upload a valid CV.'
    } else if (error.message.includes('Unsupported file type')) {
      statusCode = 400
      userMessage = error.message
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        request_id: requestId,
        details: Deno.env.get('DEVELOPMENT') === 'true' ? error.message : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode
      }
    )
  }
})