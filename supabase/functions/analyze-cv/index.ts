import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_id, file_path } = await req.json()

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // For now, just update the employee record to trigger the analysis
    // The actual analysis will be done by the cv-analysis-service.js script
    const { error } = await supabase
      .from('employees')
      .update({ 
        cv_file_path: file_path,
        cv_upload_status: 'pending_analysis',
        cv_uploaded_at: new Date().toISOString()
      })
      .eq('id', employee_id)

    if (error) throw error

    // In a production environment, you would trigger the actual analysis here
    // For now, return success and let the backend scripts handle it
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'CV uploaded successfully. Analysis will begin shortly.' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in analyze-cv function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})