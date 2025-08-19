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

    console.log('⏰ Course Queue Cron Job triggered at:', new Date().toISOString())

    // Check if there are any queued jobs first
    const { data: queuedJobs, error: checkError } = await supabase
      .from('course_generation_jobs')
      .select('id, company_id, total_employees, created_at')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(5)

    if (checkError) {
      throw new Error(`Failed to check queued jobs: ${checkError.message}`)
    }

    if (!queuedJobs || queuedJobs.length === 0) {
      console.log('📭 No queued jobs found - cron idle')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No queued jobs found',
          action: 'idle',
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`📋 Found ${queuedJobs.length} queued jobs, triggering scheduler...`)
    
    // Log the jobs for monitoring
    queuedJobs.forEach((job, index) => {
      console.log(`  ${index + 1}. Job ${job.id}: ${job.total_employees} employees (Company: ${job.company_id})`)
    })

    // Invoke the scheduler function (which will invoke the processor)
    const { data: schedulerResult, error: schedulerError } = await supabase.functions.invoke('course-queue-scheduler', {
      body: {
        triggered_by: 'cron',
        timestamp: new Date().toISOString(),
        queued_job_count: queuedJobs.length
      }
    })

    if (schedulerError) {
      throw new Error(`Scheduler invocation failed: ${schedulerError.message}`)
    }

    console.log('✅ Scheduler triggered successfully:', schedulerResult)

    // Return comprehensive status
    return new Response(
      JSON.stringify({
        success: true,
        message: `Cron job processed ${queuedJobs.length} queued jobs`,
        action: 'processed',
        timestamp: new Date().toISOString(),
        queued_jobs: queuedJobs.length,
        scheduler_result: schedulerResult,
        jobs_triggered: queuedJobs.map(job => ({
          job_id: job.id,
          employees: job.total_employees,
          queued_since: job.created_at
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Cron job error:', error)
    
    // Return error details for monitoring
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        cron_job: 'course-queue-cron'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})