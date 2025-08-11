import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body
    const { course_id, plan_id } = await req.json();

    if (!course_id || !plan_id) {
      throw new Error('Missing required parameters: course_id and plan_id');
    }

    // Get the course assignment details
    const { data: assignment, error: assignmentError } = await supabase
      .from('course_assignments')
      .select('*, employees!inner(*)')
      .eq('course_id', course_id)
      .eq('is_preview', true)
      .single();

    if (assignmentError || !assignment) {
      throw new Error('Preview assignment not found');
    }

    // Create a new job for full generation
    const { data: job, error: jobError } = await supabase
      .from('course_generation_jobs')
      .insert({
        company_id: assignment.company_id,
        initiated_by: assignment.assigned_by,
        total_employees: 1,
        employee_ids: [assignment.employee_id],
        status: 'queued',
        current_phase: 'Resuming from approved preview',
        progress_percentage: 0,
        successful_courses: 0,
        failed_courses: 0,
        metadata: {
          priority: 'high', // Approved previews get high priority
          generation_mode: 'resume_from_module_2', // Use resume mode to generate remaining modules
          resume_from_plan: plan_id,
          preview_course_id: course_id,
          estimated_duration_seconds: 240, // 4 minutes for remaining modules
          queued_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (jobError) throw jobError;

    // Update the assignment to mark it as no longer a preview
    const { error: updateError } = await supabase
      .from('course_assignments')
      .update({
        is_preview: false,
        approval_status: 'approved'
      })
      .eq('course_id', course_id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        job_id: job.id,
        message: 'Full course generation has been queued'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in resume-course-generation:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});