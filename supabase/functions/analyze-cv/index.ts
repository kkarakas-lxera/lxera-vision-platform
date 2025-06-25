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

    // Validate required parameters
    if (!employee_id || !file_path) {
      throw new Error('Missing required parameters: employee_id and file_path')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update the employee record with CV file path and analysis timestamp
    const { error } = await supabase
      .from('employees')
      .update({ 
        cv_file_path: file_path,
        skills_last_analyzed: new Date().toISOString()
      })
      .eq('id', employee_id)

    if (error) throw error

    // In a production environment, you would trigger the actual analysis here
    // For now, return success and let the backend scripts handle it
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'CV uploaded and queued for analysis successfully',
        employee_id,
        file_path
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