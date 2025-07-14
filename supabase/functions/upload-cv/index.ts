import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { createErrorResponse, logSanitizedError } from '../_shared/error-utils.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID()
  
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create client with user's auth token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's profile
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

    // Check permissions
    if (!['company_admin', 'super_admin'].includes(userProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const formData = await req.formData()
    const file = formData.get('file') as File
    const employeeId = formData.get('employeeId') as string

    if (!file || !employeeId) {
      return new Response(
        JSON.stringify({ error: 'Missing file or employeeId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify employee belongs to user's company
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('company_id')
      .eq('id', employeeId)
      .single()

    if (employeeError || !employee || employee.company_id !== userProfile.company_id) {
      return new Response(
        JSON.stringify({ error: 'Employee not found or unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create file path
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const filePath = `${userProfile.company_id}/cv-${employeeId}-${timestamp}.${fileExt}`

    // Upload file using service role client
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: uploadData, error: uploadError } = await serviceClient.storage
      .from('employee-cvs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      logSanitizedError(uploadError, {
        requestId,
        functionName: 'upload-cv',
        metadata: { context: 'storage_upload' }
      })
      return new Response(
        JSON.stringify({ error: 'Upload failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update employee record
    const { error: updateError } = await supabase
      .from('employees')
      .update({ cv_file_path: filePath })
      .eq('id', employeeId)

    if (updateError) {
      logSanitizedError(updateError, {
        requestId,
        functionName: 'upload-cv',
        metadata: { context: 'employee_update' }
      })
      // Try to clean up uploaded file
      await serviceClient.storage.from('employee-cvs').remove([filePath])
      
      return new Response(
        JSON.stringify({ error: 'Failed to update employee record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Trigger CV analysis
    try {
      const { error: analysisError } = await supabase.functions.invoke('analyze-cv', {
        body: { 
          employee_id: employeeId,
          file_path: filePath 
        }
      })

      if (analysisError) {
        logSanitizedError(analysisError, {
          requestId,
          functionName: 'upload-cv',
          metadata: { context: 'analysis_trigger' }
        })
      }
    } catch (e) {
      logSanitizedError(e, {
        requestId,
        functionName: 'upload-cv',
        metadata: { context: 'analysis_request' }
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        filePath,
        message: 'CV uploaded successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return createErrorResponse(error, {
      requestId,
      functionName: 'upload-cv'
    }, 500)
  }
})