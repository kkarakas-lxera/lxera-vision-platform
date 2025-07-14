import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';
import { createErrorResponse } from '../_shared/error-utils.ts';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID()
  
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
      .from('lead_sessions')
      .select(`
        *,
        early_access_leads(*)
      `)
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      throw new Error('Invalid or expired token');
    }

    // Don't mark token as used yet - only mark it used after profile completion
    // This allows users to use the same link multiple times within 24 hours

    // Update lead status if needed
    if (session.early_access_leads.status === 'email_captured') {
      await supabase
        .from('early_access_leads')
        .update({ status: 'email_verified' })
        .eq('id', session.early_access_leads.id);
    }

    // Return lead data
    return new Response(
      JSON.stringify({ 
        success: true,
        lead: {
          id: session.early_access_leads.id,
          email: session.early_access_leads.email,
          name: session.early_access_leads.name,
          company: session.early_access_leads.company,
          role: session.early_access_leads.role,
          use_case: session.early_access_leads.use_case,
          heard_about: session.early_access_leads.heard_about,
          waitlist_position: session.early_access_leads.waitlist_position,
          status: session.early_access_leads.status,
          profile_completed_at: session.early_access_leads.profile_completed_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return createErrorResponse(error, {
      requestId,
      functionName: 'verify-magic-link'
    }, 400)
  }
});