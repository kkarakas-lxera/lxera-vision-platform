import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  const functionName = 'generate-first-module'

  try {
    const requestBody = await req.json()
    const { employee_id, company_id } = requestBody

    if (!employee_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'employee_id is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log(`[${requestId}] Starting first module generation for employee: ${employee_id}`)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Supabase configuration missing' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get employee data to determine company_id if not provided
    let finalCompanyId = company_id
    let assignedByUserId = null

    if (!finalCompanyId) {
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('company_id, user_id')
        .eq('id', employee_id)
        .single()

      if (empError || !employee) {
        console.error(`[${requestId}] Employee fetch error:`, empError)
        return new Response(
          JSON.stringify({ success: false, error: 'Employee not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      finalCompanyId = employee.company_id
      assignedByUserId = employee.user_id // Use employee's user_id as assigned_by
    }

    // Call the Python pipeline directly via HTTP
    const pythonServiceUrl = Deno.env.get('PYTHON_SERVICE_URL') || 'https://lxera-course-generator.onrender.com'
    
    console.log(`[${requestId}] Calling Python service at: ${pythonServiceUrl}`)

    const pythonResponse = await fetch(`${pythonServiceUrl}/generate-course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('PYTHON_SERVICE_TOKEN') || 'placeholder-token'}`
      },
      body: JSON.stringify({
        employee_id,
        company_id: finalCompanyId,
        assigned_by_id: assignedByUserId,
        generation_mode: 'first_module',
        trigger_source: 'profile_completion'
      })
    })

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text()
      console.error(`[${requestId}] Python service error:`, errorText)
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Course generation failed: ${pythonResponse.status}`,
          details: errorText 
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const pythonResult = await pythonResponse.json()
    console.log(`[${requestId}] Python pipeline result:`, JSON.stringify(pythonResult, null, 2))

    if (!pythonResult.pipeline_success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Course generation failed',
          details: pythonResult.error || 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Success response
    const successResponse = {
      success: true,
      request_id: requestId,
      course_data: {
        content_id: pythonResult.content_id,
        course_title: pythonResult.course_title || 'Your Personalized Course',
        modules_generated: pythonResult.modules_generated || 1,
        total_modules_planned: pythonResult.total_modules_planned,
        can_resume: pythonResult.can_resume || false,
        partial_generation: pythonResult.partial_generation || false
      },
      message: 'First module generated successfully! You can start learning while we prepare the remaining modules.',
      next_steps: [
        'Your first module is ready to start',
        'Additional modules will unlock as they\'re generated',
        'You\'ll receive notifications when new content is available'
      ]
    }

    console.log(`[${requestId}] First module generation completed successfully`)
    
    return new Response(
      JSON.stringify(successResponse),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        } 
      }
    )

  } catch (error) {
    console.error(`[${requestId}] Unexpected error in generate-first-module:`, error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        request_id: requestId 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})