import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { employee_id } = await req.json()

    if (!employee_id) {
      throw new Error('employee_id is required')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Starting CV data deletion for employee: ${employee_id}`)

    // 1. Delete from cv_analysis_results
    const { error: cvResultsError } = await supabase
      .from('cv_analysis_results')
      .delete()
      .eq('employee_id', employee_id)
    
    if (cvResultsError) {
      console.error('Error deleting cv_analysis_results:', cvResultsError)
    }

    // 2. Delete from st_employee_skills_profile
    const { error: skillsProfileError } = await supabase
      .from('st_employee_skills_profile')
      .delete()
      .eq('employee_id', employee_id)
    
    if (skillsProfileError) {
      console.error('Error deleting skills profile:', skillsProfileError)
    }

    // 3. Delete from employee_skills_validation
    const { error: skillsValidationError } = await supabase
      .from('employee_skills_validation')
      .delete()
      .eq('employee_id', employee_id)
    
    if (skillsValidationError) {
      console.error('Error deleting skills validation:', skillsValidationError)
    }

    // 4. Delete CV file from storage
    const { data: employee } = await supabase
      .from('employees')
      .select('cv_file_path')
      .eq('id', employee_id)
      .single()

    if (employee?.cv_file_path) {
      // Extract the path after 'employee-cvs/'
      const filePath = employee.cv_file_path.replace(/^.*employee-cvs\//, '')
      
      const { error: storageError } = await supabase
        .storage
        .from('employee-cvs')
        .remove([filePath])
      
      if (storageError) {
        console.error('Error deleting CV file:', storageError)
      }
    }

    // 5. Update employee record to clear CV data
    const { error: employeeUpdateError } = await supabase
      .from('employees')
      .update({
        cv_file_path: null,
        cv_extracted_data: null,
        skills_last_analyzed: null,
        skills_validation_completed: false,
        cv_uploaded_at: null,
        cv_data_verified: false
      })
      .eq('id', employee_id)

    if (employeeUpdateError) {
      throw employeeUpdateError
    }

    // 6. Reset employee profile sections that were imported from CV
    const sectionsToReset = ['work_experience', 'education', 'skills', 'certifications', 'languages']
    
    for (const section of sectionsToReset) {
      const { error: sectionError } = await supabase
        .from('employee_profile_sections')
        .delete()
        .eq('employee_id', employee_id)
        .eq('section_name', section)
      
      if (sectionError) {
        console.error(`Error deleting section ${section}:`, sectionError)
      }
    }

    // 7. Delete from import session items if exists
    const { error: sessionItemError } = await supabase
      .from('st_import_session_items')
      .delete()
      .eq('employee_id', employee_id)
    
    if (sessionItemError) {
      console.error('Error deleting session items:', sessionItemError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'CV data deleted successfully. You can now upload a new CV.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in delete-cv-data:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})