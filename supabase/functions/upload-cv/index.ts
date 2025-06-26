import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

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
        JSON.stringify({ error: 'Invalid authentication', details: authError }),
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
      console.error('Storage upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: uploadError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update employee record
    const { error: updateError } = await supabase
      .from('employees')
      .update({ cv_file_path: filePath })
      .eq('id', employeeId)

    if (updateError) {
      console.error('Employee update error:', updateError)
      // Try to clean up uploaded file
      await serviceClient.storage.from('employee-cvs').remove([filePath])
      
      return new Response(
        JSON.stringify({ error: 'Failed to update employee record', details: updateError }),
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
        console.warn('CV analysis failed:', analysisError)
      }
    } catch (e) {
      console.warn('CV analysis request failed:', e)
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
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})