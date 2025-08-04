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

    // Verify the invitation token is valid
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('profile_invitations')
      .select('employee_id, completed_at, expires_at, employees!inner(user_id)')
      .eq('invitation_token', invitationToken)
      .single()

    if (invitationError || !invitation) {
      console.log('Invitation token not found:', invitationToken)
      return new Response(
        JSON.stringify({ 
          error: 'Invitation token not found',
          code: 'TOKEN_NOT_FOUND'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Check if invitation is already completed
    if (invitation.completed_at) {
      console.log('Invitation already completed:', invitationToken)
      return new Response(
        JSON.stringify({ 
          error: 'Invitation link already used',
          code: 'TOKEN_ALREADY_USED'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 410, // Gone
        }
      )
    }

    // Check if invitation is expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      console.log('Invitation expired:', invitationToken)
      return new Response(
        JSON.stringify({ 
          error: 'Invitation link has expired',
          code: 'TOKEN_EXPIRED'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 410, // Gone
        }
      )
    }

    // Handle user linking - either first time or updating to new user_id
    if (!invitation.employees.user_id || invitation.employees.user_id !== userId) {
      console.log(`Linking employee ${invitation.employee_id} to user ${userId}`)
      
      // First, ensure the public.users record exists
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (!authUser.user) {
        throw new Error('Auth user not found')
      }
      
      // Check if public.users record exists
      const { data: existingPublicUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()
      
      // Create public.users record if it doesn't exist
      if (!existingPublicUser) {
        console.log('Creating missing public.users record')
        const { error: createUserError } = await supabaseAdmin
          .from('users')
          .insert({
            id: userId,
            email: authUser.user.email,
            full_name: authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || 'User',
            role: 'learner',
            company_id: null // Will be set when employee is linked
          })
        
        if (createUserError) {
          console.error('Error creating public user:', createUserError)
          throw new Error('Failed to create user profile')
        }
      }
      
      // Get employee's company_id for user profile
      const { data: employeeData } = await supabaseAdmin
        .from('employees')
        .select('company_id')
        .eq('id', invitation.employee_id)
        .single()
      
      // Update user's company_id if needed
      if (employeeData?.company_id) {
        await supabaseAdmin
          .from('users')
          .update({ company_id: employeeData.company_id })
          .eq('id', userId)
      }
      
      // Now link the employee to the user
      const { error: linkError } = await supabaseAdmin
        .from('employees')
        .update({ user_id: userId })
        .eq('id', invitation.employee_id)
      
      if (linkError) {
        console.error('Error linking employee to user:', linkError)
        throw new Error('Failed to link employee to user')
      }
      
      console.log('Successfully linked employee to user')
    }

    // Update auth.users to confirm email
    console.log('Attempting to confirm email for user:', userId)
    const { data: updateResult, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        email_confirmed_at: new Date().toISOString()
      }
    )

    console.log('Update result:', updateResult)
    console.log('Update error:', updateError)

    if (updateError) {
      console.error('Error confirming email:', updateError)
      throw updateError
    }

    if (!updateResult.user) {
      console.error('No user returned from update')
      throw new Error('Failed to update user')
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