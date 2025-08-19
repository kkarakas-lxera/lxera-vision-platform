import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QueuedJob {
  id: string
  company_id: string
  initiated_by: string
  total_employees: number
  employee_ids: string[]
  status: string
  current_phase: string
  progress_percentage: number
  successful_courses: number
  failed_courses: number
  generation_mode: string
  metadata: {
    priority: string
    estimated_duration_seconds: number
    queued_at: string
    is_preview: boolean
    is_approval: boolean
    outline_employee_ids?: string[]
    employee_plan_id_map?: Record<string, string>
    enable_multimedia?: boolean
  }
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

    console.log('🔄 Starting queue processor...')

    // 1. Fetch queued jobs ordered by priority and creation time
    const { data: queuedJobs, error: fetchError } = await supabase
      .from('course_generation_jobs')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(10) // Process max 10 jobs at once

    if (fetchError) {
      throw new Error(`Failed to fetch queued jobs: ${fetchError.message}`)
    }

    if (!queuedJobs || queuedJobs.length === 0) {
      console.log('📭 No queued jobs found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No queued jobs found',
          processed: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`📋 Found ${queuedJobs.length} queued jobs`)

    const processedJobs = []
    const failedJobs = []

    // 2. Process each queued job
    for (const job of queuedJobs as QueuedJob[]) {
      try {
        console.log(`⚡ Processing job ${job.id} for ${job.total_employees} employees`)
        
        // Update job status to processing
        await supabase
          .from('course_generation_jobs')
          .update({
            status: 'processing',
            current_phase: 'Starting course generation',
            progress_percentage: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id)

        let successfulCount = 0
        let failedCount = 0

        // 3. Process each employee in the job
        for (let i = 0; i < job.employee_ids.length; i++) {
          const employeeId = job.employee_ids[i]
          const currentProgress = Math.round(((i + 1) / job.employee_ids.length) * 100)
          
          try {
            console.log(`👤 Processing employee ${i + 1}/${job.employee_ids.length}: ${employeeId}`)
            
            // Update progress
            await supabase
              .from('course_generation_jobs')
              .update({
                current_phase: `Generating course for employee ${i + 1}/${job.employee_ids.length}`,
                progress_percentage: currentProgress,
                updated_at: new Date().toISOString()
              })
              .eq('id', job.id)

            // Call the course generation edge function
            const { data: courseResult, error: courseError } = await supabase.functions.invoke('generate-course-agents', {
              body: {
                employee_id: employeeId,
                company_id: job.company_id,
                assigned_by_id: job.initiated_by,
                job_id: job.id,
                generation_mode: job.generation_mode,
                enable_multimedia: job.metadata?.enable_multimedia || false,
                plan_id: job.metadata?.employee_plan_id_map?.[employeeId] // For first_module mode
              }
            })

            if (courseError) {
              console.error(`❌ Course generation failed for employee ${employeeId}:`, courseError)
              failedCount++
            } else if (courseResult?.success) {
              console.log(`✅ Course generated successfully for employee ${employeeId}`)
              successfulCount++
            } else {
              console.error(`❌ Course generation failed for employee ${employeeId}:`, courseResult?.error)
              failedCount++
            }

            // Update running totals
            await supabase
              .from('course_generation_jobs')
              .update({
                successful_courses: successfulCount,
                failed_courses: failedCount,
                updated_at: new Date().toISOString()
              })
              .eq('id', job.id)

            // Brief delay to avoid overwhelming the system
            if (i < job.employee_ids.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }

          } catch (employeeError) {
            console.error(`❌ Failed to process employee ${employeeId}:`, employeeError)
            failedCount++
            
            await supabase
              .from('course_generation_jobs')
              .update({
                failed_courses: failedCount,
                updated_at: new Date().toISOString()
              })
              .eq('id', job.id)
          }
        }

        // 4. Mark job as completed or partially failed
        const finalStatus = failedCount === 0 ? 'completed' : 
                           successfulCount === 0 ? 'failed' : 'completed_with_errors'
        
        await supabase
          .from('course_generation_jobs')
          .update({
            status: finalStatus,
            current_phase: finalStatus === 'completed' ? 'All courses generated successfully' :
                          finalStatus === 'failed' ? 'Course generation failed' :
                          `${successfulCount} successful, ${failedCount} failed`,
            progress_percentage: 100,
            successful_courses: successfulCount,
            failed_courses: failedCount,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id)

        processedJobs.push({
          job_id: job.id,
          status: finalStatus,
          successful: successfulCount,
          failed: failedCount,
          total: job.total_employees
        })

        console.log(`🎯 Job ${job.id} completed: ${successfulCount} successful, ${failedCount} failed`)

      } catch (jobError) {
        console.error(`❌ Failed to process job ${job.id}:`, jobError)
        
        // Mark job as failed
        await supabase
          .from('course_generation_jobs')
          .update({
            status: 'failed',
            current_phase: 'Job processing failed',
            progress_percentage: 0,
            updated_at: new Date().toISOString(),
            error_details: {
              error: jobError.message,
              timestamp: new Date().toISOString()
            }
          })
          .eq('id', job.id)

        failedJobs.push({
          job_id: job.id,
          error: jobError.message
        })
      }
    }

    const summary = {
      success: true,
      message: `Processed ${processedJobs.length} jobs successfully, ${failedJobs.length} jobs failed`,
      processed: processedJobs.length,
      failed: failedJobs.length,
      results: processedJobs,
      errors: failedJobs
    }

    console.log('✅ Queue processing completed:', summary)

    return new Response(
      JSON.stringify(summary),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Queue processor error:', error)
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