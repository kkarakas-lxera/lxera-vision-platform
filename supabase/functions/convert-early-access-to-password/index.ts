import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConvertPayload {
  token: string;
  password: string;
  name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { token, password, name }: ConvertPayload = payload;

    if (!token || !password) {
      throw new Error('Token and password are required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Server configuration error');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get lead data
    const { data: session, error: sessionError } = await supabase
      .from('lead_sessions')
      .select(`
        *,
        early_access_leads(*)
      `)
      .eq('token', token)
      .is('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      console.error('Session verification error:', sessionError);
      throw new Error('Invalid or expired token');
    }

    const lead = session.early_access_leads;
    
    // Check if already has auth account
    if (lead.auth_user_id) {
      throw new Error('Account already exists. Please sign in.');
    }

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: lead.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name || lead.name || lead.email.split('@')[0],
      }
    });

    if (authError || !authUser.user) {
      console.error('Auth user creation error:', authError);
      throw new Error('Failed to create authentication account');
    }

    // Create user profile
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: lead.email,
        password_hash: 'supabase_managed',
        full_name: name || lead.name || lead.email.split('@')[0],
        role: 'learner', // Early access users get learner role to access waiting room
        is_active: true,
        email_verified: true
      });

    if (userError) {
      console.error('User profile creation error:', userError);
      // Try to clean up auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new Error('Failed to create user profile');
    }

    // Update early access lead
    const { error: updateError } = await supabase
      .from('early_access_leads')
      .update({
        auth_user_id: authUser.user.id,
        password_set: true,
        converted_to_auth_at: new Date().toISOString(),
        status: lead.status === 'email_captured' ? 'waitlisted' : lead.status
      })
      .eq('id', lead.id);

    if (updateError) {
      console.error('Lead update error:', updateError);
      // Don't fail the process, user can still login
    }

    // Mark session as used
    await supabase
      .from('lead_sessions')
      .update({ used: true })
      .eq('id', session.id);

    // Sign in the user to get session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: lead.email,
      password: password
    });

    if (signInError || !signInData.session) {
      // User created successfully but auto-signin failed
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Account created successfully. Please sign in.',
          requiresLogin: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success with session
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: authUser.user.id,
          email: authUser.user.email,
        },
        session: signInData.session,
        redirectTo: '/waiting-room'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred',
        success: false
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});