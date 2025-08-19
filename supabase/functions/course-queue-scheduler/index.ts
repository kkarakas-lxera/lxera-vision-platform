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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('⏰ Course queue scheduler triggered')

    // Check if there are any queued jobs
    const { data: queuedJobs, error: checkError } = await supabase
      .from('course_generation_jobs')
      .select('id')
      .eq('status', 'queued')
      .limit(1)

    if (checkError) {
      throw new Error(`Failed to check queued jobs: ${checkError.message}`)
    }

    if (!queuedJobs || queuedJobs.length === 0) {
      console.log('📭 No queued jobs found, scheduler idle')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No queued jobs found',
          action: 'idle'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log('📋 Queued jobs found, invoking queue processor...')

    // Invoke the queue processor
    const { data: processResult, error: processError } = await supabase.functions.invoke('process-course-queue', {
      body: {}
    })

    if (processError) {
      throw new Error(`Queue processor invocation failed: ${processError.message}`)
    }

    console.log('✅ Queue processor completed:', processResult)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Queue processor triggered successfully',
        action: 'processed',
        result: processResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Scheduler error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})