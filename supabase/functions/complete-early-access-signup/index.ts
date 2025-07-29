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

    // Create a pseudo-company for early access users (for tracking)
    const emailDomain = lead.email.split('@')[1];
    const timestamp = Date.now().toString(36);
    const companyDomain = `early-access-${emailDomain}-${leadId.substring(0, 8)}-${timestamp}`;
    
    // Create company record for early access user
    const { data: companyRecord, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        name: `${company} (Early Access)`,
        domain: companyDomain,
        plan_type: 'early_access',
        max_employees: 0, // No employee management for early access
        max_courses: 0,
        is_active: true,
        settings: {
          industry: industry,
          team_size: teamSize,
          use_cases: useCases,
          heard_about: heardAbout,
          early_access: true,
          early_access_lead_id: leadId
        }
      })
      .select()
      .single()

    if (companyError) {
      console.error('Company creation error:', companyError)
      throw new Error('Failed to create company record')
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: lead.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: lead.name || company,
        early_access: true,
        early_access_lead_id: leadId
      }
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      // Clean up company on failure
      await supabaseAdmin
        .from('companies')
        .delete()
        .eq('id', companyRecord.id)
      throw new Error('Failed to create account')
    }

    // Create user profile record (required by auth trigger)
    const { data: userRecord, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: lead.email,
        password_hash: 'supabase_managed',
        full_name: lead.name || company,
        role: 'early_access',
        company_id: companyRecord.id,
        position: role || 'Early Access User',
        is_active: true,
        email_verified: true,
        metadata: {
          early_access: true,
          early_access_lead_id: leadId,
          onboarded_from: 'early_access_signup'
        }
      })
      .select()
      .single()

    if (userError) {
      console.error('User profile creation error:', userError)
      // Clean up on failure
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin
        .from('companies')
        .delete()
        .eq('id', companyRecord.id)
      throw new Error('Failed to create user profile')
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
        converted_to_auth_at: new Date().toISOString(),
        converted_to_company_id: companyRecord.id,
        converted_to_user_id: userRecord.id
      })
      .eq('id', leadId)

    if (updateError) {
      console.error('Lead update error:', updateError)
      // Try to clean up everything
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userRecord.id)
      await supabaseAdmin
        .from('companies')
        .delete()
        .eq('id', companyRecord.id)
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