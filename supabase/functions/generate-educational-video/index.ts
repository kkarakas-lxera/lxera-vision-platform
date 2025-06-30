import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VideoGenerationRequest {
  content_id: string
  employee_id?: string
  employee_context?: {
    name: string
    role: string
    level?: string
    goals?: string
  }
  options?: {
    voice?: string
    speed?: number
    design_theme?: string
    target_duration?: number
    include_animations?: boolean
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get request body
    const body: VideoGenerationRequest = await req.json()
    const { content_id, employee_id, employee_context, options } = body

    // Validate input
    if (!content_id) {
      throw new Error('content_id is required')
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Fetch content from database
    const { data: content, error: contentError } = await supabaseClient
      .from('cm_module_content')
      .select('*')
      .eq('content_id', content_id)
      .single()

    if (contentError || !content) {
      throw new Error(`Content not found: ${content_id}`)
    }

    // Check if user has access to this content
    const { data: assignment } = await supabaseClient
      .from('course_assignments')
      .select('id')
      .eq('course_id', content_id)
      .eq('employee_id', employee_id || user.id)
      .single()

    if (!assignment && user.email?.split('@')[1] !== 'admin.com') {
      throw new Error('Access denied to this content')
    }

    // Create or get multimedia session
    const { data: session, error: sessionError } = await supabaseClient
      .from('mm_multimedia_sessions')
      .insert({
        execution_id: crypto.randomUUID(),
        course_id: content_id,
        employee_name: employee_context?.name || user.user_metadata?.full_name || 'User',
        employee_id: employee_id || user.id,
        course_title: content.module_name,
        total_modules: 1,
        personalization_level: 'standard',
        status: 'in_progress'
      })
      .select()
      .single()

    if (sessionError) {
      throw new Error(`Failed to create multimedia session: ${sessionError.message}`)
    }

    // Prepare the video generation request for the Python backend
    const videoGenRequest = {
      session_id: session.session_id,
      content_id: content_id,
      content: {
        content_id: content.content_id,
        module_name: content.module_name,
        introduction: content.introduction,
        core_content: content.core_content,
        practical_applications: content.practical_applications,
        case_studies: content.case_studies,
        assessments: content.assessments,
        total_word_count: content.total_word_count
      },
      employee_context: {
        id: employee_id || user.id,
        name: employee_context?.name || user.user_metadata?.full_name || 'Learner',
        role: employee_context?.role || 'Professional',
        level: employee_context?.level || 'intermediate',
        goals: employee_context?.goals || ''
      },
      options: {
        voice: options?.voice || 'nova',
        speed: options?.speed || 1.0,
        design_theme: options?.design_theme || 'professional',
        target_duration: options?.target_duration,
        include_animations: options?.include_animations ?? true
      }
    }

    // Call the Python multimedia generation service
    const MULTIMEDIA_SERVICE_URL = Deno.env.get('MULTIMEDIA_SERVICE_URL') || 'http://localhost:8000'
    
    const multimediaResponse = await fetch(`${MULTIMEDIA_SERVICE_URL}/api/generate-educational-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('MULTIMEDIA_SERVICE_KEY') || ''}`
      },
      body: JSON.stringify(videoGenRequest)
    })

    if (!multimediaResponse.ok) {
      const errorText = await multimediaResponse.text()
      throw new Error(`Multimedia service error: ${errorText}`)
    }

    const result = await multimediaResponse.json()

    // Update session status
    await supabaseClient
      .from('mm_multimedia_sessions')
      .update({
        status: 'completed',
        assets_generated: result.assets_generated || 0,
        package_ready: true,
        completed_at: new Date().toISOString(),
        success_rate: 100
      })
      .eq('session_id', session.session_id)

    // Store timeline information
    if (result.timeline_id) {
      const { error: timelineError } = await supabaseClient
        .from('mm_video_timelines')
        .insert({
          timeline_id: result.timeline_id,
          session_id: session.session_id,
          content_id: content_id,
          module_name: content.module_name,
          total_duration: result.total_duration,
          narration_file_path: result.narration_file,
          slide_count: result.slide_count,
          voice_used: options?.voice || 'nova',
          speech_speed: options?.speed || 1.0,
          audio_language: 'en',
          audio_segments: result.audio_segments || [],
          slide_transitions: result.slide_transitions || [],
          video_file_path: result.video_path,
          video_duration: result.video_duration,
          video_file_size: result.video_file_size,
          video_resolution: result.video_resolution,
          video_fps: result.video_fps || 30,
          generation_status: 'completed',
          generation_started_at: session.created_at,
          generation_completed_at: new Date().toISOString(),
          created_by: user.id,
          metadata: {
            design_theme: options?.design_theme || 'professional',
            include_animations: options?.include_animations ?? true
          }
        })

      if (timelineError) {
        console.error('Failed to store timeline:', timelineError)
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Educational video generated successfully',
        data: {
          session_id: session.session_id,
          timeline_id: result.timeline_id,
          video_url: result.video_url,
          video_path: result.video_path,
          duration: result.total_duration,
          duration_formatted: result.duration_formatted,
          slide_count: result.slide_count,
          assets: {
            video: result.video_url,
            audio: result.audio_url,
            slides: result.slides_url,
            timeline: result.timeline_url
          },
          metadata: {
            module_name: content.module_name,
            voice_used: options?.voice || 'nova',
            design_theme: options?.design_theme || 'professional',
            generated_at: new Date().toISOString()
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in generate-educational-video:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})