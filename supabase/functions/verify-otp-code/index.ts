import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: 'Email and code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if the code is valid and not expired
    const { data: verificationCode, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (codeError || !verificationCode) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark the code as used
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationCode.id);

    if (updateError) {
      console.error('Error marking code as used:', updateError);
    }

    // Check if user exists in early_access_leads
    const { data: lead, error: leadError } = await supabase
      .from('early_access_leads')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (!lead) {
      return new Response(
        JSON.stringify({ 
          error: 'Email not found in early access list',
          redirect: '/early-access' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update lead status if needed
    if (lead.status === 'email_captured') {
      await supabase
        .from('early_access_leads')
        .update({ 
          status: 'email_verified',
          email_verified_at: new Date().toISOString()
        })
        .eq('id', lead.id);
    }

    // Create or get a session token for the lead
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

    // Create a new session
    const { data: session, error: sessionError } = await supabase
      .from('lead_sessions')
      .insert({
        lead_id: lead.id,
        token,
        expires_at: expiresAt.toISOString(),
        used: false
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success with session token and lead data
    return new Response(
      JSON.stringify({ 
        success: true,
        token: session.token,
        lead: {
          id: lead.id,
          email: lead.email,
          name: lead.name,
          company: lead.company,
          role: lead.role,
          use_case: lead.use_case,
          status: lead.status,
          waitlist_position: lead.waitlist_position,
          profile_completed: lead.status === 'profile_completed' || lead.status === 'waitlisted'
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in verify-otp-code:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});