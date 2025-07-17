import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createErrorResponse, logSanitizedError, getErrorStatusCode } from '../_shared/error-utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  
  try {
    const { token } = await req.json();

    if (!token) {
      throw new Error('Token is required');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token and get lead data
    const { data: session, error: sessionError } = await supabase
      .from('skills_gap_sessions')
      .select(`
        *,
        skills_gap_leads(*)
      `)
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      logSanitizedError(sessionError, {
        requestId,
        functionName: 'verify-skills-gap-email',
        metadata: { context: 'token_verification' }
      });
      throw new Error('Invalid or expired token');
    }

    // Update lead status if needed
    if (session.skills_gap_leads.status === 'pending_verification') {
      await supabase
        .from('skills_gap_leads')
        .update({ 
          status: 'email_verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', session.skills_gap_leads.id);
    }

    // Return lead data for password creation
    return new Response(
      JSON.stringify({ 
        success: true,
        lead: {
          id: session.skills_gap_leads.id,
          email: session.skills_gap_leads.email,
          name: session.skills_gap_leads.name,
          company: session.skills_gap_leads.company,
          role: session.skills_gap_leads.role,
          team_size: session.skills_gap_leads.team_size,
          primary_challenge: session.skills_gap_leads.primary_challenge,
          current_process: session.skills_gap_leads.current_process,
          status: session.skills_gap_leads.status
        },
        sessionToken: token
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return createErrorResponse(error, {
      requestId,
      functionName: 'verify-skills-gap-email'
    }, getErrorStatusCode(error));
  }
});