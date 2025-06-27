import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CourseGenerationRequest {
  employee_id: string
  company_id: string
  assigned_by_id: string
  job_id?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_id, company_id, assigned_by_id, job_id } = await req.json() as CourseGenerationRequest

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update job progress helper
    const updateJobProgress = async (updates: any) => {
      if (!job_id) return
      
      await supabase
        .from('course_generation_jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', job_id)
    }

    // Initial progress update
    await updateJobProgress({
      current_phase: 'Initializing agent pipeline',
      progress_percentage: 5
    })

    // Execute Python agent pipeline
    // This runs the complete agent orchestration with all specialized agents
    const pythonPath = Deno.env.get('PYTHON_PATH') || '/usr/bin/python3'
    const scriptPath = '/app/openai_course_generator/run_lxera_pipeline.py'
    
    // Create a Python script that will be executed
    const pythonScript = `
import asyncio
import json
import sys
import os

# Add the course generator directory to Python path
sys.path.insert(0, '/app/openai_course_generator')

# Set environment variables for Supabase connection
os.environ['SUPABASE_URL'] = '${supabaseUrl}'
os.environ['SUPABASE_ANON_KEY'] = '${supabaseServiceKey}'

from lxera_database_pipeline import generate_course_with_agents

async def main():
    try:
        result = await generate_course_with_agents(
            employee_id='${employee_id}',
            company_id='${company_id}',
            assigned_by_id='${assigned_by_id}',
            job_id='${job_id}' if '${job_id}' != 'undefined' else None
        )
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({
            'pipeline_success': False,
            'error': str(e)
        }))

if __name__ == '__main__':
    asyncio.run(main())
`

    // Write the script to a temporary file
    const tempScriptPath = `/tmp/run_pipeline_${Date.now()}.py`
    await Deno.writeTextFile(tempScriptPath, pythonScript)

    // Execute the Python pipeline
    const command = new Deno.Command(pythonPath, {
      args: [tempScriptPath],
      stdout: "piped",
      stderr: "piped",
    })

    const { code, stdout, stderr } = await command.output()

    // Clean up temp file
    await Deno.remove(tempScriptPath)

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr)
      console.error('Python pipeline error:', errorText)
      throw new Error(`Pipeline execution failed: ${errorText}`)
    }

    // Parse the result from Python
    const resultText = new TextDecoder().decode(stdout)
    const pipelineResult = JSON.parse(resultText)

    if (!pipelineResult.pipeline_success) {
      throw new Error(pipelineResult.error || 'Pipeline execution failed')
    }

    // Extract relevant data for response
    const response = {
      success: true,
      content_id: pipelineResult.content_id,
      assignment_id: pipelineResult.assignment_id,
      module_name: pipelineResult.metadata?.module_name || 'Course Module',
      employee_name: pipelineResult.metadata?.employee_name || 'Employee',
      module_count: 1,
      token_savings: pipelineResult.token_savings,
      processing_time: pipelineResult.total_processing_time
    }

    // Final progress update
    await updateJobProgress({
      current_phase: 'Course generation complete',
      progress_percentage: 100,
      successful_courses: 1
    })

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Course generation error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})