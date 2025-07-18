import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, invitationToken } = await req.json()

    if (!userId || !invitationToken) {
      throw new Error('Missing required parameters')
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the invitation token is valid and belongs to this user
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('profile_invitations')
      .select('employee_id, employees!inner(user_id)')
      .eq('invitation_token', invitationToken)
      .single()

    if (invitationError || !invitation || invitation.employees.user_id !== userId) {
      throw new Error('Invalid invitation token')
    }

    // Update auth.users to confirm email
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        email_confirmed_at: new Date().toISOString()
      }
    )

    if (updateError) {
      console.error('Error confirming email:', updateError)
      throw updateError
    }

    // Mark invitation as completed
    const { error: invitationUpdateError } = await supabaseAdmin
      .from('profile_invitations')
      .update({ 
        completed_at: new Date().toISOString() 
      })
      .eq('invitation_token', invitationToken)

    if (invitationUpdateError) {
      console.error('Error updating invitation:', invitationUpdateError)
      // Don't throw - email confirmation is more important
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in confirm-invitation-email:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})