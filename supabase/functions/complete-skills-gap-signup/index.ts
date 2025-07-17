import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createErrorResponse, logSanitizedError, getErrorStatusCode } from '../_shared/error-utils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompleteSignupPayload {
  token: string;
  password: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  
  try {
    const { token, password }: CompleteSignupPayload = await req.json();

    if (!token || !password) {
      throw new Error('Token and password are required');
    }

    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
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
        functionName: 'complete-skills-gap-signup',
        metadata: { context: 'token_verification' }
      });
      throw new Error('Invalid or expired token');
    }

    const lead = session.skills_gap_leads;

    // Check if already converted
    if (lead.status === 'converted') {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'already_converted',
          redirectTo: '/admin-login'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate company domain from email
    const emailDomain = lead.email.split('@')[1];
    const companyDomain = `${emailDomain}-${lead.id.substring(0, 8)}`;

    // Create company record
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: lead.company,
        domain: companyDomain,
        plan_type: 'free_skills_gap',
        max_employees: 10,
        max_courses: 0,
        is_active: true
      })
      .select()
      .single();

    if (companyError) {
      logSanitizedError(companyError, {
        requestId,
        functionName: 'complete-skills-gap-signup',
        metadata: { context: 'create_company' }
      });
      throw new Error('Failed to create company record');
    }

    // Hash password (using a simple approach - in production, use bcrypt or similar)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const password_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: lead.email,
        password_hash,
        full_name: lead.name,
        role: 'company_admin',
        company_id: company.id,
        position: lead.role || 'HR Manager',
        is_active: true,
        email_verified: true
      })
      .select()
      .single();

    if (userError) {
      logSanitizedError(userError, {
        requestId,
        functionName: 'complete-skills-gap-signup',
        metadata: { context: 'create_user' }
      });
      
      // If user creation fails, clean up company
      await supabase
        .from('companies')
        .delete()
        .eq('id', company.id);
        
      throw new Error('Failed to create user account');
    }

    // Mark session as used
    await supabase
      .from('skills_gap_sessions')
      .update({ used_at: new Date().toISOString() })
      .eq('id', session.id);

    // Update lead status to converted
    await supabase
      .from('skills_gap_leads')
      .update({ 
        status: 'converted',
        converted_to_user_id: user.id
      })
      .eq('id', lead.id);

    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'account_created',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        },
        company: {
          id: company.id,
          name: company.name,
          plan_type: company.plan_type
        },
        redirectTo: '/admin-login'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return createErrorResponse(error, {
      requestId,
      functionName: 'complete-skills-gap-signup'
    }, getErrorStatusCode(error));
  }
});