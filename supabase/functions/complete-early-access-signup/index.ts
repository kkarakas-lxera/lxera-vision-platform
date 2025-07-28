import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompleteEarlyAccessRequest {
  leadId: string;
  password: string;
  company: string;
  industry: string;
  role: string;
  teamSize: string;
  useCases: string[];
  heardAbout: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      leadId, 
      password, 
      company,
      industry, 
      role, 
      teamSize, 
      useCases, 
      heardAbout 
    }: CompleteEarlyAccessRequest = await req.json()

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get lead data
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('early_access_leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      throw new Error('Invalid lead ID')
    }

    // Check if already has auth account
    if (lead.password_set && lead.auth_user_id) {
      throw new Error('Account already exists. Please sign in.')
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lead.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: lead.name || company,
        role: 'early_access'
      }
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      throw new Error('Failed to create account')
    }

    // Update lead record with profile data and auth info
    const { error: updateError } = await supabaseAdmin
      .from('early_access_leads')
      .update({
        company: company,
        role: role,
        enrichment_data: {
          ...lead.enrichment_data,
          industry: industry,
          teamSize: teamSize,
          useCases: useCases,
          heardAbout: heardAbout
        },
        status: 'profile_completed',
        onboarded_at: new Date().toISOString(),
        password_set: true,
        auth_user_id: authData.user.id,
        converted_to_auth_at: new Date().toISOString()
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('Lead update error:', updateError)
      // Try to clean up auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      throw new Error('Failed to update profile')
    }

    // Mark session as used
    const { error: sessionError } = await supabaseAdmin
      .from('lead_sessions')
      .update({ used: true })
      .eq('lead_id', leadId)
      .eq('used', false)

    if (sessionError) {
      console.error('Session update error:', sessionError)
    }

    // Log completion event
    await supabaseAdmin
      .from('lead_email_log')
      .insert({
        lead_id: leadId,
        email_type: 'profile_completed',
        subject: 'Early Access Profile Completed',
        metadata: { 
          company, 
          industry,
          role, 
          teamSize,
          useCases,
          auth_user_id: authData.user.id 
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Profile completed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Complete early access error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})