import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CanvasGenerationRequest {
  visual_spec: {
    scene_id: string
    intent: string
    dataspec: {
      data_type: string
      data_points: Array<{
        label: string
        value: number | string
        category?: string
      }>
    }
    title?: string
    theme?: string
    constraints?: {
      max_width?: number
      max_height?: number
    }
  }
  session_id?: string
  content_id?: string
  cache_enabled?: boolean
  force_regenerate?: boolean
}

interface CanvasGenerationResponse {
  success: boolean
  artifact_id?: string
  canvas_instructions?: any
  canvas_file_path?: string
  generation_time_ms?: number
  cache_hit?: boolean
  cost_usd?: number
  model_used?: string
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

    // Parse request
    const body: CanvasGenerationRequest = await req.json()
    const { visual_spec, session_id, content_id, cache_enabled = true, force_regenerate = false } = body

    if (!visual_spec?.scene_id || !visual_spec?.intent || !visual_spec?.dataspec) {
      throw new Error('Invalid visual_spec: scene_id, intent, and dataspec are required')
    }

    const startTime = Date.now()

    // Generate content hash for caching
    const contentHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify(visual_spec))
    )
    const contentHashHex = Array.from(new Uint8Array(contentHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // Check cache first (unless force regenerate)
    let cacheResult = null
    if (cache_enabled && !force_regenerate) {
      const { data: cachedCanvas } = await supabaseClient
        .from('ai_canvas_cache')
        .select('*')
        .eq('content_hash', contentHashHex)
        .eq('visual_intent', visual_spec.intent)
        .eq('theme', visual_spec.theme || 'professional')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (cachedCanvas) {
        // Update cache hit count
        await supabaseClient
          .from('ai_canvas_cache')
          .update({
            hit_count: cachedCanvas.hit_count + 1,
            last_hit_at: new Date().toISOString()
          })
          .eq('id', cachedCanvas.id)

        cacheResult = {
          success: true,
          artifact_id: `cached_${cachedCanvas.id}`,
          canvas_instructions: cachedCanvas.canvas_instructions,
          canvas_file_path: cachedCanvas.rendered_image_path,
          generation_time_ms: Date.now() - startTime,
          cache_hit: true,
          cost_usd: 0,
          model_used: 'cache'
        }
      }
    }

    let result: CanvasGenerationResponse

    if (cacheResult) {
      result = cacheResult
    } else {
      // Generate new Canvas instructions via Python service
      const MULTIMEDIA_SERVICE_URL = Deno.env.get('MULTIMEDIA_SERVICE_URL') || 'http://localhost:8000'
      
      const generationRequest = {
        visual_spec: visual_spec,
        rendering_path: 'canvas_instructions',
        options: {
          cache_enabled: false, // We handle caching in Supabase
          return_files: true
        }
      }

      console.log('Calling Python AI service:', `${MULTIMEDIA_SERVICE_URL}/api/generate-visual`)
      
      const response = await fetch(`${MULTIMEDIA_SERVICE_URL}/api/generate-visual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('MULTIMEDIA_SERVICE_KEY') || ''}`
        },
        body: JSON.stringify(generationRequest)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`AI generation failed: ${errorText}`)
      }

      const aiResult = await response.json()
      
      if (!aiResult.success) {
        throw new Error(`AI generation failed: ${aiResult.error}`)
      }

      const generationTime = Date.now() - startTime

      // Create artifact record
      const artifactId = crypto.randomUUID()
      
      const { error: insertError } = await supabaseClient
        .from('ai_visual_artifacts')
        .insert({
          artifact_id: artifactId,
          scene_id: visual_spec.scene_id,
          content_hash: contentHashHex,
          visual_intent: visual_spec.intent,
          rendering_path: 'canvas_instructions',
          theme: visual_spec.theme || 'professional',
          data_spec: visual_spec.dataspec,
          visual_spec: visual_spec,
          canvas_instructions: aiResult.canvas_instructions,
          canvas_file_path: aiResult.canvas_file_path,
          storage_bucket: 'ai-artifacts',
          model_used: aiResult.model_used,
          generation_time_ms: generationTime,
          retry_count: aiResult.retry_count || 0,
          cost_usd: aiResult.cost_usd || 0,
          validation_score: aiResult.validation_score,
          status: 'completed',
          session_id: session_id,
          content_id: content_id,
          employee_id: user.id,
          created_by: user.id
        })

      if (insertError) {
        console.error('Failed to store artifact:', insertError)
        // Continue anyway - generation succeeded
      }

      // Cache the Canvas instructions for future use
      if (cache_enabled && aiResult.canvas_instructions) {
        const cacheKey = `${contentHashHex}_${visual_spec.intent}_${visual_spec.theme || 'professional'}`
        
        await supabaseClient
          .from('ai_canvas_cache')
          .insert({
            cache_key: cacheKey,
            content_hash: contentHashHex,
            canvas_instructions: aiResult.canvas_instructions,
            rendered_image_path: aiResult.canvas_file_path,
            visual_intent: visual_spec.intent,
            theme: visual_spec.theme || 'professional',
            data_point_count: visual_spec.dataspec.data_points?.length || 0,
            complexity_score: Math.min(10, Math.max(1, Math.ceil((visual_spec.dataspec.data_points?.length || 1) / 5))),
            generation_time_ms: generationTime,
            validation_passed: aiResult.validation_score > 0.8,
            validation_errors: aiResult.validation_errors || []
          })
          .onConflict('cache_key')
          .ignoreDuplicates()
      }

      // Track usage
      await supabaseClient
        .from('ai_visual_usage')
        .insert({
          request_id: artifactId,
          session_id: session_id,
          employee_id: user.id,
          visual_intent: visual_spec.intent,
          rendering_path: 'canvas_instructions',
          model_used: aiResult.model_used,
          generation_time_ms: generationTime,
          retry_count: aiResult.retry_count || 0,
          cache_hit: false,
          tokens_used: aiResult.tokens_used,
          cost_usd: aiResult.cost_usd || 0,
          success: true,
          validation_score: aiResult.validation_score
        })

      result = {
        success: true,
        artifact_id: artifactId,
        canvas_instructions: aiResult.canvas_instructions,
        canvas_file_path: aiResult.canvas_file_path,
        generation_time_ms: generationTime,
        cache_hit: false,
        cost_usd: aiResult.cost_usd || 0,
        model_used: aiResult.model_used
      }
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in ai-canvas-generator:', error)
    
    const errorResponse: CanvasGenerationResponse = {
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