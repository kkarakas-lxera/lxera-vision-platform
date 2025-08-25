import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  sessionId: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { sessionId } = await req.json() as RequestBody

    if (!sessionId) {
      throw new Error('Session ID is required')
    }

    // Get the user profile to get company_id
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { data: userData } = await supabaseClient
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      throw new Error('No company found for user')
    }

    // Get session details with items
    const { data: session, error: sessionError } = await supabaseClient
      .from('st_import_sessions')
      .select(`
        *,
        st_import_session_items!inner(*)
      `)
      .eq('id', sessionId)
      .eq('company_id', userData.company_id)
      .single()

    if (sessionError || !session) {
      throw new Error('Session not found')
    }

    // Get ready employees
    const readyItems = session.st_import_session_items.filter(
      (item: any) => item.status === 'completed' && item.employee_email
    )

    if (readyItems.length === 0) {
      throw new Error('No employees ready to activate')
    }

    let activatedCount = 0
    let failedCount = 0

    // Update session status to processing
    await supabaseClient
      .from('st_import_sessions')
      .update({ status: 'processing' })
      .eq('id', sessionId)

    // Process each employee
    for (const item of readyItems) {
      try {
        // Do NOT pre-create public.users anymore. Keep identity creation in Auth flow only.
        // We intentionally avoid linking to a user_id here; it will be set after signup.
        let userId: string | null = null

        // Get position details - first try active_position_id, then match by position title
        let positionId = session.active_position_id
        let positionCode = item.current_position_code
        let positionTitle = item.field_values?.position

        // If no active_position_id but we have a position title, try to find the position
        if (!positionId && positionTitle) {
          const { data: matchingPosition } = await supabaseClient
            .from('st_company_positions')
            .select('id, position_code, position_title')
            .eq('company_id', userData.company_id)
            .ilike('position_title', positionTitle.trim())
            .single()

          if (matchingPosition) {
            positionId = matchingPosition.id
            positionCode = matchingPosition.position_code || matchingPosition.position_title
          }
        } else if (positionId) {
          // If we have active_position_id, get its details
          const { data: position } = await supabaseClient
            .from('st_company_positions')
            .select('position_code, position_title')
            .eq('id', positionId)
            .single()

          if (position) {
            positionCode = position.position_code || position.position_title
            positionTitle = position.position_title
          }
        }

        // Always create a new employee record (without user_id) for imported entries
        const { data: createdEmployee, error: employeeError } = await supabaseClient
          .from('employees')
          .insert({
            user_id: userId,
            company_id: userData.company_id,
            department: item.field_values?.department || 'General',
            position: positionTitle || item.field_values?.position || positionCode || 'Unassigned',
            current_position_id: positionId || null,
            target_position_id: positionId || null,
            is_active: true,
            import_session_id: sessionId
          })
          .select('id')
          .single()

        if (employeeError) throw employeeError

        // Update the item status and persist created employee_id for later use (invitation fallback)
        await supabaseClient
          .from('st_import_session_items')
          .update({
            employee_id: createdEmployee?.id
          })
          .eq('id', item.id)

        activatedCount++
      } catch (error) {
        console.error(`Failed to activate employee ${item.employee_email}:`, error)
        failedCount++
        
        // Update item with error
        await supabaseClient
          .from('st_import_session_items')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', item.id)
      }
    }

    // Update session with final status
    await supabaseClient
      .from('st_import_sessions')
      .update({
        status: 'completed',
        processed: activatedCount + failedCount,
        successful: activatedCount,
        failed: failedCount,
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    return new Response(
      JSON.stringify({
        success: true,
        activatedCount,
        failedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in activate-import-session:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})