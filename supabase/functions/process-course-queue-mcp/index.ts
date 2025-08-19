import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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

// MCP Server endpoints
const MCP_BASE_URL = Deno.env.get('MCP_SERVER_URL') || 'http://localhost:3001'

async function executeMCPQuery(query: string) {
  const response = await fetch(`${MCP_BASE_URL}/supabase/execute-sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('MCP_API_KEY') || ''}`
    },
    body: JSON.stringify({
      project_id: 'xwfweumeryrgbguwrocr',
      query: query
    })
  })
  
  if (!response.ok) {
    throw new Error(`MCP SQL execution failed: ${response.status}`)
  }
  
  return await response.json()
}

async function invokeMCPFunction(functionName: string, body: any) {
  const response = await fetch(`${MCP_BASE_URL}/supabase/invoke-function`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('MCP_API_KEY') || ''}`
    },
    body: JSON.stringify({
      project_id: 'xwfweumeryrgbguwrocr',
      function_name: functionName,
      payload: body
    })
  })
  
  if (!response.ok) {
    throw new Error(`MCP function invocation failed: ${response.status}`)
  }
  
  return await response.json()
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting MCP-based queue processor...')

    // 1. Fetch queued jobs using MCP
    const queuedJobsResult = await executeMCPQuery(`
      SELECT * FROM course_generation_jobs 
      WHERE status = 'queued' 
      ORDER BY created_at ASC 
      LIMIT 10
    `)

    const queuedJobs = queuedJobsResult.data || []

    if (queuedJobs.length === 0) {
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
        
        // Update job status to processing using MCP
        await executeMCPQuery(`
          UPDATE course_generation_jobs 
          SET status = 'processing',
              current_phase = 'Starting course generation',
              progress_percentage = 0,
              updated_at = NOW()
          WHERE id = '${job.id}'
        `)

        let successfulCount = 0
        let failedCount = 0

        // 3. Process each employee in the job
        for (let i = 0; i < job.employee_ids.length; i++) {
          const employeeId = job.employee_ids[i]
          const currentProgress = Math.round(((i + 1) / job.employee_ids.length) * 100)
          
          try {
            console.log(`👤 Processing employee ${i + 1}/${job.employee_ids.length}: ${employeeId}`)
            
            // Update progress using MCP
            await executeMCPQuery(`
              UPDATE course_generation_jobs 
              SET current_phase = 'Generating course for employee ${i + 1}/${job.employee_ids.length}',
                  progress_percentage = ${currentProgress},
                  updated_at = NOW()
              WHERE id = '${job.id}'
            `)

            // Call the course generation edge function using MCP
            const courseResult = await invokeMCPFunction('generate-course', {
              employee_id: employeeId,
              company_id: job.company_id,
              assigned_by_id: job.initiated_by,
              job_id: job.id,
              generation_mode: job.generation_mode,
              enable_multimedia: job.metadata?.enable_multimedia || false,
              plan_id: job.metadata?.employee_plan_id_map?.[employeeId] // For first_module mode
            })

            if (courseResult.error) {
              console.error(`❌ Course generation failed for employee ${employeeId}:`, courseResult.error)
              failedCount++
            } else if (courseResult.success) {
              console.log(`✅ Course generated successfully for employee ${employeeId}`)
              successfulCount++
            } else {
              console.error(`❌ Course generation failed for employee ${employeeId}:`, courseResult)
              failedCount++
            }

            // Update running totals using MCP
            await executeMCPQuery(`
              UPDATE course_generation_jobs 
              SET successful_courses = ${successfulCount},
                  failed_courses = ${failedCount},
                  updated_at = NOW()
              WHERE id = '${job.id}'
            `)

            // Brief delay to avoid overwhelming the system
            if (i < job.employee_ids.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }

          } catch (employeeError) {
            console.error(`❌ Failed to process employee ${employeeId}:`, employeeError)
            failedCount++
            
            await executeMCPQuery(`
              UPDATE course_generation_jobs 
              SET failed_courses = ${failedCount},
                  updated_at = NOW()
              WHERE id = '${job.id}'
            `)
          }
        }

        // 4. Mark job as completed or partially failed using MCP
        const finalStatus = failedCount === 0 ? 'completed' : 
                           successfulCount === 0 ? 'failed' : 'completed_with_errors'
        
        const currentPhase = finalStatus === 'completed' ? 'All courses generated successfully' :
                            finalStatus === 'failed' ? 'Course generation failed' :
                            `${successfulCount} successful, ${failedCount} failed`

        await executeMCPQuery(`
          UPDATE course_generation_jobs 
          SET status = '${finalStatus}',
              current_phase = '${currentPhase}',
              progress_percentage = 100,
              successful_courses = ${successfulCount},
              failed_courses = ${failedCount},
              completed_at = NOW(),
              updated_at = NOW()
          WHERE id = '${job.id}'
        `)

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
        
        // Mark job as failed using MCP
        await executeMCPQuery(`
          UPDATE course_generation_jobs 
          SET status = 'failed',
              current_phase = 'Job processing failed',
              progress_percentage = 0,
              updated_at = NOW()
          WHERE id = '${job.id}'
        `)

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

    console.log('✅ MCP Queue processing completed:', summary)

    return new Response(
      JSON.stringify(summary),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ MCP Queue processor error:', error)
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