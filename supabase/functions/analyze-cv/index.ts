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
    const { employee_id, file_path, source } = await req.json()

    // Validate required parameters
    if (!employee_id || !file_path) {
      throw new Error('Missing required parameters: employee_id and file_path')
    }

    console.log(`Analyzing CV for employee ${employee_id}, source: ${source || 'storage'}, path: ${file_path}`)

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if this is a database-stored CV
    let cvContent = null
    if (source === 'database' || file_path.startsWith('db:')) {
      console.log('Fetching CV from database...')
      
      // Extract employee ID from path if needed
      const dbEmployeeId = file_path.startsWith('db:') 
        ? file_path.substring(3) 
        : employee_id

      // Fetch CV from database
      const { data: cvData, error: cvError } = await supabase
        .from('employee_cv_data')
        .select('file_name, file_type, file_data')
        .eq('employee_id', dbEmployeeId)
        .single()

      if (cvError) {
        throw new Error(`Failed to fetch CV from database: ${cvError.message}`)
      }

      if (!cvData) {
        throw new Error('No CV found in database')
      }

      cvContent = {
        fileName: cvData.file_name,
        fileType: cvData.file_type,
        // Convert base64 data URL to raw base64
        fileData: cvData.file_data.split(',')[1] || cvData.file_data
      }
      
      console.log(`Found CV in database: ${cvContent.fileName}`)
    }

    // Update the employee record with CV file path and analysis timestamp
    const updateData: any = { 
      cv_file_path: file_path,
      skills_last_analyzed: new Date().toISOString()
    }

    const { error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', employee_id)

    if (error) throw error

    // Here you would implement the actual CV analysis logic
    // For example:
    // 1. Extract text from CV (PDF/DOCX parsing)
    // 2. Identify skills using NLP/keyword matching
    // 3. Update st_employee_skills_profile table
    // 4. Calculate gap scores based on position requirements

    if (cvContent) {
      console.log('CV content available for analysis:', {
        fileName: cvContent.fileName,
        fileType: cvContent.fileType,
        dataLength: cvContent.fileData.length
      })
      
      // TODO: Implement actual CV parsing and skill extraction
      // For now, we'll create a placeholder skills profile
      const { error: profileError } = await supabase
        .from('st_employee_skills_profile')
        .upsert({
          employee_id: employee_id,
          skills_data: {
            source: 'cv_analysis',
            analyzed_at: new Date().toISOString(),
            cv_source: source || 'storage',
            status: 'pending_analysis'
          },
          gap_score: 0,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'employee_id'
        })

      if (profileError) {
        console.error('Failed to create skills profile:', profileError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'CV uploaded and queued for analysis successfully',
        employee_id,
        file_path,
        source: source || 'storage',
        cv_found: !!cvContent
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