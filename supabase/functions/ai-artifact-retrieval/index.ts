import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ArtifactRetrievalRequest {
  artifact_id?: string
  scene_id?: string
  session_id?: string
  content_hash?: string
  visual_intent?: string
  theme?: string
  include_content?: boolean
  include_files?: boolean
}

interface ArtifactResponse {
  success: boolean
  artifacts?: Array<{
    artifact_id: string
    scene_id: string
    visual_intent: string
    rendering_path: string
    theme: string
    canvas_instructions?: any
    svg_content?: string
    canvas_file_path?: string
    svg_file_path?: string
    file_urls?: {
      canvas_url?: string
      svg_url?: string
    }
    generation_time_ms: number
    model_used?: string
    cost_usd: number
    validation_score?: number
    status: string
    created_at: string
    cache_hit?: boolean
  }>
  total_count?: number
  error?: string
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

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request (support both GET with query params and POST with body)
    let params: ArtifactRetrievalRequest
    
    if (req.method === 'GET') {
      const url = new URL(req.url)
      params = {
        artifact_id: url.searchParams.get('artifact_id') || undefined,
        scene_id: url.searchParams.get('scene_id') || undefined,
        session_id: url.searchParams.get('session_id') || undefined,
        content_hash: url.searchParams.get('content_hash') || undefined,
        visual_intent: url.searchParams.get('visual_intent') || undefined,
        theme: url.searchParams.get('theme') || undefined,
        include_content: url.searchParams.get('include_content') === 'true',
        include_files: url.searchParams.get('include_files') === 'true'
      }
    } else {
      params = await req.json()
    }

    // Build query based on provided parameters
    let query = supabaseClient
      .from('ai_visual_artifacts')
      .select(`
        artifact_id,
        scene_id,
        visual_intent,
        rendering_path,
        theme,
        ${params.include_content ? 'canvas_instructions, svg_content,' : ''}
        canvas_file_path,
        svg_file_path,
        code_file_path,
        generation_time_ms,
        model_used,
        cost_usd,
        validation_score,
        status,
        created_at,
        session_id
      `)

    // Apply filters based on user access and parameters
    if (params.artifact_id) {
      query = query.eq('artifact_id', params.artifact_id)
    }

    if (params.scene_id) {
      query = query.eq('scene_id', params.scene_id)
    }

    if (params.session_id) {
      query = query.eq('session_id', params.session_id)
    }

    if (params.content_hash) {
      query = query.eq('content_hash', params.content_hash)
    }

    if (params.visual_intent) {
      query = query.eq('visual_intent', params.visual_intent)
    }

    if (params.theme) {
      query = query.eq('theme', params.theme)
    }

    // Apply user access filter
    query = query.or(`employee_id.eq.${user.id},created_by.eq.${user.id}`)

    // Order by most recent
    query = query.order('created_at', { ascending: false })

    const { data: artifacts, error: queryError } = await query

    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`)
    }

    // Generate signed URLs for files if requested
    const processedArtifacts = await Promise.all(
      (artifacts || []).map(async (artifact) => {
        const processed: any = {
          ...artifact,
          cache_hit: false // Default for stored artifacts
        }

        if (params.include_files && artifact.canvas_file_path) {
          try {
            const { data: canvasUrl } = await supabaseClient.storage
              .from('ai-artifacts')
              .createSignedUrl(artifact.canvas_file_path, 3600) // 1 hour expiry

            if (canvasUrl) {
              processed.file_urls = {
                canvas_url: canvasUrl.signedUrl
              }
            }

            if (artifact.svg_file_path) {
              const { data: svgUrl } = await supabaseClient.storage
                .from('ai-artifacts')
                .createSignedUrl(artifact.svg_file_path, 3600)

              if (svgUrl) {
                processed.file_urls = {
                  ...processed.file_urls,
                  svg_url: svgUrl.signedUrl
                }
              }
            }
          } catch (urlError) {
            console.error('Failed to generate signed URLs:', urlError)
            // Continue without URLs
          }
        }

        // Update access tracking
        await supabaseClient
          .from('ai_visual_artifacts')
          .update({
            access_count: (artifact as any).access_count + 1 || 1,
            last_accessed_at: new Date().toISOString()
          })
          .eq('artifact_id', artifact.artifact_id)

        return processed
      })
    )

    const response: ArtifactResponse = {
      success: true,
      artifacts: processedArtifacts,
      total_count: processedArtifacts.length
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in ai-artifact-retrieval:', error)
    
    const errorResponse: ArtifactResponse = {
      success: false,
      error: error.message || 'An unexpected error occurred'
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})